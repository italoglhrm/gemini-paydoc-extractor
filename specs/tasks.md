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
- [ ] **T10** User sources sample documents into `samples/` + `samples/README.md`
  - Synthetic or public documents only. No real company or personal data.
  - `samples/README.md` is written (rules and a suggested set). The documents themselves are still to be added.
- [ ] **T11** Manual end-to-end verification (curl / Swagger UI against samples) — *R1-R4, R10-R12*
  - Positive: `/health`, `/extract` with a PDF and an image.
  - Negative: `.txt` → 415, empty file → 400, oversized → 413, unset key → app fails to boot, bad key → 502.
- [ ] **T12** Full `README.md` (pitch, architecture, setup, usage, limitations, roadmap)

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
