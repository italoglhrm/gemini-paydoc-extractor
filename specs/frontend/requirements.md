# Frontend requirements

> **Step 1 of 3 in the frontend spec chain:** requirements (WHAT) → [design](design.md) (HOW) → [tasks](tasks.md) (DO).
> Same method as the backend chain in [../requirements.md](../requirements.md). IDs here are `F1`-`F13` and are never reused.

## Scope

A browser UI for the extraction API: pick a payment document, send it, and read the structured result with its per-field confidence. The UI is meant for a business audience, so it must look clean and professional. It is light-theme only and bilingual (English and Portuguese).

It adds no capability to the backend. It shows what `POST /extract` returns and nothing else is stored (F10, mirroring R14).

## Notation

[EARS](https://alistairmavin.com/ears/), as in the backend requirements, with `THE UI` as the subject.

## Glossary

- **API**: the extraction service of this repository.
- **Field**: one of the six extracted values (`vendor_name`, `document_number`, `issue_date`, `due_date`, `total_amount`, `currency`).
- **Confidence**: the 0.0-1.0 score the API returns for each field.
- **Needs review**: a field the API lists in `low_confidence_fields`. The server owns the threshold, so the UI never recomputes it.
- **Sample**: one of the synthetic documents in [samples/](../../samples/README.md).

## Backend contract this UI relies on

| What the UI uses | Backend requirement |
| ---------------- | ------------------- |
| `POST /extract` with multipart field `file`, answering `document_type`, `data`, `confidence`, `overall_confidence`, `low_confidence_fields` | R1, R9 |
| 400 for a missing or empty file, 413 for a file over the limit, 415 for an unsupported type | R4, R3, R2 |
| 502 with a `detail` message when the extraction service fails | R11 |
| CORS headers for the UI's origin | R15 |

## Requirements

### Upload and preview

| ID | Requirement |
| -- | ----------- |
| F1 | WHEN a user selects or drops a PDF, JPEG or PNG file, THE UI SHALL show a preview of it and enable the Extract action. |
| F2 | WHEN the selected file is not a PDF, JPEG or PNG, or is larger than 10 MB, THE UI SHALL reject it before any upload and say why, in the active language. |

### Extraction and result

| ID | Requirement |
| -- | ----------- |
| F3 | THE UI SHALL send a file to the API only when the user clicks Extract, SHALL show that extraction is in progress while the request runs, and SHALL let the user cancel it. |
| F4 | WHEN the API returns a result, THE UI SHALL show the document type, the six fields with their values, the confidence of each field and the overall confidence, and SHALL mark as needing review exactly the fields listed in `low_confidence_fields`. |
| F5 | WHERE a field's value is `null`, THE UI SHALL show it as not found, never as a blank or a zero. |
| F6 | IF a request fails, THEN THE UI SHALL explain the cause in the active language, telling apart a missing or empty file (400), a file that is too large (413), an unsupported type (415), a failure of the extraction service (502) and an unreachable API, and SHALL let the user retry. |
| F12 | WHEN a result is shown, THE UI SHALL let the user view the raw JSON returned by the API and copy it. |

### Privacy

| ID | Requirement |
| -- | ----------- |
| F8 | THE UI SHALL tell the user, before they extract, that the file is sent to Google Gemini and that on the free tier Google may use submitted content, so sensitive documents should not be used. |
| F10 | THE UI SHALL NOT store documents or results anywhere (no history, no persistence). The only value kept in the browser is the language choice. |

### Samples

| ID | Requirement |
| -- | ----------- |
| F9 | THE UI SHALL offer the bundled sample documents, so a user can try it without a file of their own. |

### Language

| ID | Requirement |
| -- | ----------- |
| F7 | THE UI SHALL be available in English and in Portuguese (Brazil), switchable at any time without reloading, remembered between visits, English by default, with the page's language attribute following the choice. |

### Quality

| ID | Requirement |
| -- | ----------- |
| F11 | THE UI SHALL work from 360 px of width, be fully operable with a keyboard, and announce changes of state (extracting, done, failed) to assistive technology. |
| F13 | THE UI SHALL take every color, radius and shadow from design tokens and build its components in the shadcn/ui style, with a restrained, professional appearance: one accent color, status colors only where they carry meaning, and text contrast of at least WCAG AA (4.5:1). |

## Out of scope

- Dark theme. Deferred: it is not needed for this system. The tokens are CSS variables, so a dark set can be added later (see FD2 for what it would need).
- Editing or correcting extracted values, export (CSV, Excel), history, accounts, review or approval flows (R13).
- Deployment and hosting of the UI or the API.
- Highlighting fields on top of the document image.
- Languages other than English and Portuguese (Brazil).
- Frontend tests in git (tests stay local, as for the backend).
