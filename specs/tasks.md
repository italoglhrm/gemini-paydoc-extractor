# Tasks

> **Step 3 of 3 in the spec-driven chain:** [requirements](requirements.md) (WHAT) → [design](design.md) (HOW) → tasks (DO).
> Dependency-ordered. Each task names the requirements it satisfies and the design decisions it implements. Work top to bottom and keep the project runnable after every step.

## Tasks

- [x] **T1** Scaffold repo: dirs, `.gitignore`, `requirements.txt`, `.env.example`, `LICENSE` (MIT)
- [x] **T2** Write `specs/requirements.md`, `specs/design.md`, `specs/tasks.md`
- [x] **T3** `app/schemas.py` — *R5, R6, R7, R8, R9* · design D2
  - Done when: the models in D2 exist, `ExtractionResult` converts to a Gemini response schema, blank strings become `None`.
- [x] **T4** `app/config.py` (fail-fast `Settings`) — *R10* · design D7
  - Done when: missing/empty `GEMINI_API_KEY` raises a clear error naming the variable; defaults match D7.
- [x] **T5** `app/prompts.py` — *R5, R6, R7, R8* · design D5
  - Done when: the prompt covers classification, the six fields, normalization, null-over-guess, banded confidence, and document-as-data.
- [x] **T6** `app/gemini_client.py` (async multimodal call) — *R1, R5-R8, R11* · design D4
  - Done when: a call returns a validated `ExtractionResult`; every failure mode in D4 surfaces as `GeminiExtractionError`.
- [x] **T7** `app/extraction_service.py` (orchestration + confidence aggregation) — *R1, R8, R9* · design D3
  - Done when: `extract_document()` returns an `ExtractResponse` whose computed fields follow D3 exactly.
- [x] **T8** `app/main.py` (`/extract`, `/health`, validation, error mapping) — *R1-R4, R10, R11, R12* · design D6
  - Done when: each status code in D6 is produced by the condition D6 names, and the app refuses to boot without a key.
- [x] **T9** `tests/test_schemas.py` (schema-only, no live Gemini calls) — *R5-R9*
  - Done when: `pytest` passes offline and covers enum values, nullability, confidence bounds, blank-string handling and the schema conversion.
  - Kept local: `tests/` is git-ignored, so this file is not part of the repository.
- [x] **T10** User sources sample documents into `samples/` + `samples/README.md`
  - Synthetic or public documents only. No real company or personal data.
  - Done with seven synthetic documents with known answers (invented data only), each aimed at a requirement. `samples/README.md` lists the rules, what each file checks and the expected values.
- [x] **T11** Manual end-to-end verification (curl / Swagger UI against samples) — *R1-R4, R10-R12*
  - Positive: `/health`, `/extract` with a PDF and an image.
  - Negative: `.txt` → 415, empty file → 400, oversized → 413, unset key → app fails to boot, bad key → 502.
  - Verified against the live Gemini API with the T10 samples, through the running server: the document type, every field, null-over-guess and the R9 summary were checked against the known answers. Result: 56/56 checks on one run and 168/168 over three repeats. A 429 and a 503 from Google came back as HTTP 502 with Google's message (R11).
  - Negative paths verified over HTTP against a running server: `.txt` → 415, empty or missing file → 400, 11 MB upload → 413, missing or blank key → the app does not boot, bad key → 502.
  - Found and fixed along the way: a degraded scan returned misread digits at 0.95 confidence, and an ambiguous date was guessed at 0.90. Both led to prompt rules (design D5), and an SDK warning led to disabling automatic function calling (design D4).
  - Caveat: those prompt rules were tuned after seeing failures on these same samples, so the scores are optimistic. Real-world documents are the next test.
- [ ] **T12** Full `README.md` (pitch, architecture, setup, usage, limitations, roadmap)
  - Scheduled after the frontend (F-T10 in `specs/frontend/tasks.md`) so it can show real UI screenshots. Bilingual, with an English and a Portuguese section like MyAgenda's README.
- [x] **T13** CORS for the browser UI (`app/config.py`, `app/main.py`, `.env.example`) — *R15, R10* · design D6, D7
  - Done when: an allowed origin gets CORS headers on actual and preflight requests and any other origin gets none; `CORS_ORIGINS` rejects `*`, empty entries and malformed values at startup; `create_app()` keeps `uvicorn app.main:app` working; booting without a key still fails; the existing offline checks still pass.
  - Prerequisite for the frontend, which has its own chain in `specs/frontend/`.

## Requirement coverage

| Req | Tasks |
| --- | ----- |
| R1  | T6, T7, T8, T11 |
| R2  | T8, T11 |
| R3  | T8, T11 |
| R4  | T8, T11 |
| R5  | T3, T5, T6, T9 |
| R6  | T3, T5, T6, T9 |
| R7  | T3, T5, T6, T9 |
| R8  | T3, T5, T6, T7, T9 |
| R9  | T3, T7, T9 |
| R10 | T4, T8, T11 |
| R11 | T6, T8, T11 |
| R12 | T8, T11 |
| R13 | no task, by design (nothing is built) |
| R14 | no task, by design (nothing is built) |
| R15 | T13 |

**Work order from here:** T13, then the frontend chain in [specs/frontend/tasks.md](frontend/tasks.md), then T12.
