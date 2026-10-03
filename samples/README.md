# Sample documents

Put test documents for `POST /extract` in this folder.

## Rules

- **Synthetic or public documents only.** Never commit a real invoice, boleto or receipt, from any company or person. That includes real names, tax IDs (CPF/CNPJ), addresses, bank details and barcodes. The folder is not git-ignored, so check before you commit.
- Supported formats: PDF, JPEG, PNG. Maximum size: 10 MB by default.

## Suggested set

A small, varied set exercises more of the spec than many similar documents:

| File | What it checks |
| ---- | -------------- |
| `sample_invoice.pdf` | Happy path: all six fields present and clearly labelled (R1, R5, R6) |
| `sample_boleto.pdf` | The `boleto` class, BRL amounts written as `1.234,56`, day-first dates (R5, R6) |
| `sample_receipt.jpg` | A photo or scan, plus a document with no due date, so `due_date` should be `null` (R7) |
| `sample_waybill.png` | The `waybill` class (R5) |
| `sample_blurry.png` | A degraded image: confidence should drop and `low_confidence_fields` should fill in (R8, R9) |
| `sample_not_a_payment_doc.pdf` | Something unrelated, which should come back `unknown` with mostly null fields (R5, R7) |

## Where to get them

- Make them yourself in a word processor or spreadsheet with invented data, then export to PDF and photograph or screenshot one for the image cases.
- Use public invoice or receipt templates and fill in fake values.
- Use openly licensed example documents, and note the source and licence next to the file.
