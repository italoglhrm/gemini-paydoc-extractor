# Sample documents

Synthetic documents for trying `POST /extract` and for checking the extractor against known answers.

## Rules

- **Invented data only.** Every name, number and address in these files is made up. E-mail domains use the reserved `.example` TLD, and there are no real tax IDs or bank details. Never add a real invoice, boleto or receipt from any company or person.
- **Why this matters:** on the Gemini free tier, Google may use submitted content to improve its products and human reviewers may read it. Real documents must not go through a free-tier key.
- Supported formats: PDF, JPEG, PNG. Maximum size: 10 MB by default.

## The set

Each file targets a specific requirement, mostly through decoys that a careless extractor would pick.

| File | Kind | What it checks |
| ---- | ---- | -------------- |
| `sample_invoice.pdf` | invoice, USD | Happy path with decoys: a PO number next to the invoice number, a subtotal above the total, dates written as "March 14, 2026" (R1, R5, R6) |
| `sample_boleto.pdf` | boleto, BRL | Portuguese labels, day-first dates, a processing date next to the document date, the amount `2.347,90`, and the currency given only as "R$" in the *Espécie* cell (R5, R6) |
| `sample_receipt.jpg` | receipt, BRL | A photographed thermal receipt with no due date, so `due_date` must be `null`; cash and change figures sit next to the total (R6, R7) |
| `sample_waybill.png` | waybill, EUR | A PNG whose delivery date is not a due date, and whose declared customs value is larger than the freight total (R5, R7) |
| `sample_blurry.jpg` | invoice, degraded | The invoice above, blurred, skewed, noisy and with a coffee ring over the dates: confidence should drop, and a wrong value must not be reported confidently (R8) |
| `sample_ambiguous.pdf` | invoice, currency unclear | Dates `03/04/2026` and `05/06/2026` are valid day-first and month-first, and the amounts use a bare `$`: those fields should be `null` (R7) |
| `sample_not_a_payment_doc.pdf` | recipe | Must come back `unknown` with everything `null`; "Total time: 70 min" is bait for the total amount (R5, R7) |

## Expected values

| File | `document_type` | `vendor_name` | `document_number` | `issue_date` | `due_date` | `total_amount` | `currency` |
| ---- | --------------- | ------------- | ----------------- | ------------ | ---------- | -------------- | ---------- |
| `sample_invoice.pdf` | invoice | Nimbus Office Supplies Ltd | INV-2026-0482 | 2026-03-14 | 2026-04-13 | 1284.50 | USD |
| `sample_boleto.pdf` | boleto | Distribuidora Aurora Alimentos Ltda | 004871/1 | 2026-04-10 | 2026-04-25 | 2347.90 | BRL |
| `sample_receipt.jpg` | receipt | Café Exemplo | 000123 | 2026-03-14 | `null` | 42.50 | BRL |
| `sample_waybill.png` | waybill | Meridian Cargo Services | WB-77120 | 2026-03-20 | `null` | 380.00 | EUR |
| `sample_ambiguous.pdf` | invoice | Willow Creek Print Studio | 2041 | `null` | `null` | 980.00 | `null` |
| `sample_not_a_payment_doc.pdf` | unknown | `null` | `null` | `null` | `null` | `null` | `null` |

`sample_blurry.jpg` carries the same data as `sample_invoice.pdf`. Where the image is too degraded to read a field, `null` or a low confidence is an acceptable answer; a wrong value with high confidence is not.
