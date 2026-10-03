# Design

> **Step 2 of 3 in the spec-driven chain:** [requirements](requirements.md) (WHAT) → design (HOW) → [tasks](tasks.md) (DO).
> Every decision below cites the requirement(s) it serves. A decision that serves no requirement does not belong here.

## Overview

One FastAPI process, one request path, no state:

```
client ──multipart──▶ POST /extract
                        │ validate: present, type, size, non-empty      (R2, R3, R4)
                        ▼
                  extraction_service.extract_document()
                        │
                        ├─▶ gemini_client.extract()   file bytes ─▶ Gemini (multimodal) ─▶ ExtractionResult
                        │                                                                 (R1, R5-R8, R11)
                        └─▶ compute overall_confidence + low_confidence_fields (app code)  (R9)
                        ▼
                  ExtractResponse (JSON)
```

## Decisions

### D1. Single-stage extraction, file goes straight to Gemini

The uploaded bytes are sent to Gemini as an inline multimodal `Part` (`types.Part.from_bytes`). There is no separate OCR stage and no intermediate storage.

- **Serves:** R1 (one call turns a file into structured JSON), R14 (nothing to store, queue or clean up).
- **Rejected:** OCR service followed by an LLM over the text. It adds a second credential, a second failure mode and a second bill, and Document AI has no ongoing free tier. Storing or queuing uploads is ruled out by R14.
- **Consequence:** the only required credential is `GEMINI_API_KEY` (R10).

### D2. Schema (`app/schemas.py`)

| Type | Shape | Serves |
| ---- | ----- | ------ |
| `DocumentType` | `str` enum: `invoice`, `boleto`, `receipt`, `waybill`, `unknown` | R5 |
| `DocumentData` | `vendor_name`, `document_number`, `issue_date`, `due_date`, `currency`: `str \| None`; `total_amount`: `float \| None`; all default `None` | R6, R7 |
| `DocumentFieldConfidence` | one `float` in `[0.0, 1.0]` per `DocumentData` field | R8 |
| `ExtractionResult` | `document_type` + `data` + `confidence`: exactly what Gemini produces | R1 |
| `ExtractResponse` | subclass of `ExtractionResult` adding `overall_confidence: float` and `low_confidence_fields: list[str]` | R9 |

Choices inside the schema:

- **Dates are `str`, not `date`.** The prompt asks for `YYYY-MM-DD`, but if the model returns something odd, validation still passes and the value reaches the caller instead of failing the whole request. *(R6, R7)*
- **Confidence is a continuous float, not a `low/medium/high` enum.** A numeric score makes a threshold meaningful and keeps R9 a pure function. *(R8, R9)*
- **Every field is nullable with a `None` default.** This is how R7 ("null rather than guess") is expressed in the type system. The schema converts to Gemini's response schema as `nullable: true` fields with `minimum/maximum` bounds on confidence (verified against `google-genai` 2.27).
- **Blank strings become `None`** (validator on `DocumentData`), and `currency` is upper-cased. A model that returns `""` instead of `null` should not leak an empty value past R7.
- **`total_amount` is a `float`.** `Decimal` is not supported by Gemini's schema, and the service only reports what the document says. Callers that do arithmetic should convert on their side.
- **`ExtractResponse` extends `ExtractionResult`** rather than nesting it, so the JSON stays flat: `document_type`, `data`, `confidence`, `overall_confidence`, `low_confidence_fields`. The model is only ever asked for the `ExtractionResult` part, so it cannot supply or influence the computed fields. *(R9)*

### D3. Confidence aggregation lives in app code (`extraction_service.py`)

`overall_confidence` and `low_confidence_fields` are derived from the per-field scores by a pure function. The model never computes them. *(R9)*

- `overall_confidence` = arithmetic mean of the confidence of **extracted** (non-null) fields, rounded to 3 decimals. If no field was extracted it is `0.0`.
- `low_confidence_fields` = names of **extracted** fields whose confidence is below `LOW_CONFIDENCE_THRESHOLD` (default `0.7`), in schema order.
- Null fields are excluded from both. A null already means "not determined" (R7), and a receipt that legitimately has no due date should not drag the score down or be flagged on every request. Consumers that need to know what is missing can read the `null`s directly.

This is a judgement call the requirements leave open. It is isolated in one function so it is easy to change.

### D4. Gemini integration (`app/gemini_client.py`)

- Async client from `google-genai`: `client.aio.models.generate_content(...)`. *(R1)*
- Structured output: `response_mime_type="application/json"` and `response_schema=ExtractionResult`. The reply is parsed from `response.text` with `ExtractionResult.model_validate_json`, so a malformed reply raises a validation error we control. *(R1, R8, R11)*
- `temperature=0.0`: extraction should be repeatable.
- The prompt goes in `system_instruction`; the user turn carries the file part and a one-line instruction.
- A request timeout (60 s) is set through `HttpOptions` so a stalled call becomes a 502 instead of hanging the request. *(R11)*
- **Error wrapping:** SDK API errors, transport errors (`httpx.HTTPError`), an empty reply (e.g. blocked by safety filters) and an unparsable reply are all re-raised as one `GeminiExtractionError` carrying a descriptive message. Other exceptions are programming errors and are *not* swallowed. *(R11)*
- The client is created once at startup and closed at shutdown (`aio.aclose()`).
- **Default model: `gemini-3.5-flash-lite`**, overridable via `GEMINI_MODEL`. Checked against ai.google.dev on 2026-10-02: it is listed as a stable model and on the free tier. The original plan's example, `gemini-2.5-flash-lite`, is now a legacy model that Google restricts to users who already used it.
- The service depends on a tiny `Extractor` protocol (`async extract(content, mime_type) -> ExtractionResult`), not on the concrete client, so the orchestration and API layers can be tested with a fake and no network.

### D5. Prompt (`app/prompts.py`)

Instructions, in order: classify the type → extract the six fields → normalize dates to `YYYY-MM-DD` and amounts to plain decimals → return `null` rather than guess → self-assess confidence. *(R5, R6, R7, R8)*

- **Document types are defined in the prompt** (what makes something a boleto vs. an invoice vs. a receipt vs. a waybill), with `unknown` as the explicit fallback. *(R5)*
- **Normalization rules are explicit.** `1.234,56` becomes `1234.56`. `currency` is an ISO 4217 code, set only when the document makes it unambiguous (`R$` → `BRL`; a bare `$` → `null`). *(R6, R7)*
- **Confidence bands are anchored.** Clearly stated → `0.9-1.0`; partial or inferred → `0.5-0.8`; missing or guessed → `< 0.3`. Without anchors, models tend to answer about `0.9` for everything, which makes the threshold in D3 useless. *(R8)*
- **The document is data, not instructions.** The prompt says text inside the document must never be followed as instructions. *(R1, R7)*

### D6. HTTP layer (`app/main.py`)

- `POST /extract`, `GET /health` → `{"status": "ok"}`. *(R1, R12)*
- **Validation order:** file missing → 400; declared content type not in `{application/pdf, image/jpeg, image/png}` → 415; read at most `max + 1` bytes; empty → 400; over the limit → 413. *(R4, R2, R3)*
- **`file` is declared optional in the signature** so a missing part reaches our code and returns **400** per R4. If it were required, FastAPI would answer 422.
- **The content type is the one the client declares** (parameters such as `; charset=` stripped). Magic-byte sniffing is not required by R2 and is listed as a roadmap item.
- **Errors:** `GeminiExtractionError` → HTTP 502 with `{"detail": "<message>"}`. Document content is never logged. *(R11, R14)*
- **Startup:** a `lifespan` handler loads `Settings` and builds the Gemini client. If settings are invalid the app does not come up. *(R10)*
- **No CORS yet.** To be added together with the frontend.
- **Known limit:** the multipart body is received in full before our size check runs. The 413 protects Gemini (and cost), not the server's bandwidth. Fine for a single-user demo service; a reverse proxy limit would be the production answer.

### D7. Configuration (`app/config.py`)

`pydantic-settings` `Settings`, loaded from the environment and `.env`:

| Variable | Required | Default | Notes |
| -------- | -------- | ------- | ----- |
| `GEMINI_API_KEY` | **yes** | none | Missing, empty or whitespace-only → startup fails *(R10)* |
| `GEMINI_MODEL` | no | `gemini-3.5-flash-lite` | |
| `MAX_UPLOAD_MB` | no | `10` | Must be > 0 *(R3)* |
| `LOW_CONFIDENCE_THRESHOLD` | no | `0.7` | Must be in `[0, 1]` *(R9)* |

A `load_settings()` wrapper turns pydantic's validation error into a short message that names the variable and points at `.env.example`. *(R10)*

### D8. Dependencies and exclusions

`fastapi`, `uvicorn[standard]`, `google-genai`, `pydantic`, `pydantic-settings`, `python-dotenv`, `python-multipart` (version-floored). Dev-only: `pytest`, `httpx` (for FastAPI's `TestClient`).

No database, auth, queue or Docker. R13 and R14 make them unnecessary.

## File layout

```
app/
  main.py                FastAPI app, routes, validation, error mapping     (D6)
  config.py              Settings, load_settings()                          (D7)
  schemas.py             DocumentType, DocumentData, ...                    (D2)
  prompts.py             system prompt + user instruction                   (D5)
  gemini_client.py       async multimodal call, error wrapping              (D4)
  extraction_service.py  orchestration, confidence aggregation              (D3)
samples/README.md        how to source sample documents (synthetic/public only)
tests/test_schemas.py    schema tests, no network (local only, git-ignored)
specs/                   requirements.md, design.md, tasks.md
```

## Requirement traceability

| Req | Satisfied by |
| --- | ------------ |
| R1  | D1, D2, D4, D6 |
| R2  | D6 |
| R3  | D6, D7 |
| R4  | D6 |
| R5  | D2, D5 |
| R6  | D2, D5 |
| R7  | D2, D5 |
| R8  | D2, D4, D5 |
| R9  | D2, D3, D7 |
| R10 | D6, D7 |
| R11 | D4, D6 |
| R12 | D6 |
| R13 | D8 (and nothing is built for it) |
| R14 | D1, D6, D8 |
