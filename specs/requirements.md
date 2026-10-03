# Requirements

> **Step 1 of 3 in the spec-driven chain:** requirements (WHAT) → [design](design.md) (HOW) → [tasks](tasks.md) (DO).
> This file says what the system must do, and nothing about how. Every later artifact points back to the IDs below.

## Scope

A backend service that accepts a payment document (invoice, boleto, receipt, waybill) as a file upload and returns structured JSON with a confidence score per extracted field.

The service does **upload → extract → structured JSON** and stops there. Review, approval and accounting integration are out of scope (R13), and nothing is stored (R14).

## Notation

Requirements use [EARS](https://alistairmavin.com/ears/) (Easy Approach to Requirements Syntax):

| Pattern      | Form                                        |
| ------------ | ------------------------------------------- |
| Event-driven | `WHEN <trigger>, THE SYSTEM SHALL <response>` |
| Ubiquitous   | `THE SYSTEM SHALL <response>`               |
| Unwanted     | `IF <condition>, THEN THE SYSTEM SHALL <response>` |

## Glossary

- **Field**: one of the six extracted values: `vendor_name`, `document_number`, `issue_date`, `due_date`, `total_amount`, `currency`.
- **Confidence**: a number from 0.0 to 1.0 expressing how clearly a field was stated in the source document.
- **Boleto**: a Brazilian bank payment slip (barcode and digitable line).
- **Waybill**: a transport/shipping document that accompanies goods.

## Requirements

### Extraction

| ID  | Requirement |
| --- | ----------- |
| R1  | WHEN a user uploads a payment document (PDF, JPEG, or PNG) to `POST /extract`, THE SYSTEM SHALL return structured JSON containing extracted document data and a confidence score per field. |
| R5  | THE SYSTEM SHALL classify each document as one of: `invoice`, `boleto`, `receipt`, `waybill`, or `unknown`. |
| R6  | THE SYSTEM SHALL extract, when present: vendor/payee name, document number, issue date, due date, total amount, currency. |
| R7  | IF a field cannot be confidently determined from the document, THEN THE SYSTEM SHALL return `null` for that field rather than guess. |

### Confidence

| ID  | Requirement |
| --- | ----------- |
| R8  | THE SYSTEM SHALL assign each extracted field a confidence score (0.0-1.0) reflecting how clearly that field was stated in the source document. |
| R9  | THE SYSTEM SHALL compute `overall_confidence` and `low_confidence_fields` deterministically from the per-field scores (application code, not the AI model). |

### Input validation

| ID  | Requirement |
| --- | ----------- |
| R2  | WHEN the uploaded file's content type is not PDF/JPEG/PNG, THE SYSTEM SHALL reject the request with HTTP 415. |
| R3  | WHEN the uploaded file exceeds the configured max size (default 10 MB), THE SYSTEM SHALL reject the request with HTTP 413. |
| R4  | WHEN the uploaded file is empty or missing, THE SYSTEM SHALL reject the request with HTTP 400. |

### Operations and failure handling

| ID  | Requirement |
| --- | ----------- |
| R10 | WHEN `GEMINI_API_KEY` is not configured, THE SYSTEM SHALL fail to start with a clear error, rather than fail per-request. |
| R11 | WHEN the Gemini API call fails (network/quota/malformed response), THE SYSTEM SHALL return HTTP 502 with a descriptive error. |
| R12 | THE SYSTEM SHALL expose `GET /health` returning 200 when running. |

### Boundaries (negative requirements)

| ID  | Requirement |
| --- | ----------- |
| R13 | THE SYSTEM SHALL NOT implement review/approval workflows or any downstream ERP/accounting integration. |
| R14 | THE SYSTEM SHALL NOT persist uploaded documents or results beyond a single request's lifetime (no database in this version). |

## Out of scope

- Multi-level approval chains, ERP push/export (R13).
- Company-specific fields: tax-ID validation, cost centers, approval thresholds.
- Stateful review/edit sessions, storage of any kind (R14).
- A frontend. It is deferred, and the API is shaped so one can be added without reworking the extraction logic.
- Authentication, rate limiting, CORS.
