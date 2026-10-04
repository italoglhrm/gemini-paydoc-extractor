# Frontend design

> **Step 2 of 3 in the frontend spec chain:** [requirements](requirements.md) (WHAT) → design (HOW) → [tasks](tasks.md) (DO).
> Every decision cites the requirement(s) it serves (`F1`-`F13`, and `R15` from the backend).

## Overview

One page, no router, no global store. A header, a short intro, and two cards side by side on desktop (stacked below `lg`):

```
┌──────────────────────────────────────────────────────────────────────┐
│ ▣ PayDoc Extractor                                          ⊕ PT     │  header
├──────────────────────────────────────────────────────────────────────┤
│  Extract data from payment documents                                 │  intro
│  Upload an invoice, boleto, receipt or waybill. Get structured JSON. │
│                                                                      │
│  ┌─ Document ───────────────────┐  ┌─ Result ───────────────────────┐│
│  │ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │  │ [Invoice]          Overall 100%││
│  │ │  drop a file or browse   │  │  │ ⚠ 1 field needs review: …      ││
│  │ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │  │ [Fields] [JSON]                ││
│  │  (preview replaces the zone) │  │ Field        Value   Confidence││
│  │  [ Try a sample ▾ ]          │  │ ──────────────────────────────  ││
│  │  ⓘ sent to Google Gemini…    │  │ Vendor       Nimbus… ▬▬▬▬ 100% ││
│  │  [ Extract ]                 │  │ Due date     Apr 13  ▬▬▬▬ 100% ││
│  └──────────────────────────────┘  └────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

## Decisions

### FD1. Stack and project layout

Vite, React 19, TypeScript (`strict`), Tailwind CSS 3.4 and npm, in `frontend/`, on Node 22. This is MyAgenda's stack. The versions were re-checked when scaffolding (MyAgenda is on Vite 5.4): Vite 8, `@vitejs/plugin-react` 6, TypeScript 7, React 19.3, Tailwind 3.4.19. Tailwind stays on 3.x, so `tailwind-merge` stays on 2.x (3.x targets Tailwind 4 class names). `react` and `react-dom` are declared explicitly instead of arriving as peer dependencies. The API base URL comes from `VITE_API_URL` (default `http://localhost:8000`); the dev server runs on `5173`, the default allowed origin in R15, pinned with `strictPort` so it cannot drift to another port and break CORS silently. *(F7, F13)*

```
frontend/
  index.html  components.json  package.json  tsconfig.json
  vite.config.ts  tailwind.config.js  postcss.config.js  .env.example
  src/
    main.tsx  App.tsx  index.css  types.ts
    lib/        utils.ts (cn)  api.ts  i18n.ts  format.ts  samples.ts
    contexts/   LanguageContext.tsx
    hooks/      useExtraction.ts
    components/
      ui/       button badge card alert table tabs progress skeleton
                separator tooltip dropdown-menu sonner
      Header  LanguageToggle  LogoIcon  UploadZone  DocumentPreview  PrivacyNote
      SamplePicker  ResultPanel  OverallConfidence  FieldsTable  RawJson  ErrorAlert
```

### FD2. Design system: shadcn/ui, light theme only

Components follow shadcn/ui's reference sources in the `new-york` style (denser and sharper than `default`), built on Radix primitives, `class-variance-authority`, `clsx` and `tailwind-merge` (`cn()`), with Lucide icons and Inter. A `components.json` is kept and verified to work: the shadcn CLI (4.x) accepts it for this Tailwind 3.4 setup and emits the classic `new-york` sources (checked with `add button --dry-run`), so the primitives are generated with the CLI rather than ported by hand. `tailwindcss-animate` supplies the `animate-in` classes the Radix components use. The Sonner wrapper is pinned to the light theme (no `next-themes`). *(F13)*

Tokens are CSS variables in `:root`, stored as HSL channels so opacity modifiers (`bg-primary/10`) work, and exposed through `tailwind.config.js` in shadcn's vocabulary. The palette is MyAgenda's. Contrast was measured with WCAG 2.x formulas:

| Token | Value | Role | Measured contrast |
| ----- | ----- | ---- | ----------------- |
| `background` | `#F9F9F8` | page | `foreground` on it 16.5:1 |
| `foreground` | `#1A1A18` | text | 17.4:1 on `card` |
| `card`, `popover` | `#FFFFFF` | surfaces | |
| `muted` | `#F2F2F0` | quiet surfaces: table header, code block, skeleton (derived) | `muted-foreground` on it 4.78:1 |
| `muted-foreground` | `#6B6B66` | secondary text | 5.08:1 on `background`, 5.36:1 on `card` |
| `primary` | `#534AB7` | primary action, selected state, focus ring, bar fill | white on it 6.93:1; ring 6.58:1 on `background` |
| `primary-foreground` | `#FFFFFF` | text on `primary` | |
| `accent` | `#EEEDFB` | hover and selected tint | `accent-foreground` (`#534AB7`) on it 5.99:1 |
| `secondary` | `#F2F2F0` | secondary button surface (derived) | `foreground` on it 15.3:1 |
| `destructive` | `#A32D2D` on soft `#FCEBEB` | errors | 6.13:1 text on soft; white on `destructive` 7.07:1 |
| `warning` | `#854F0B` on soft `#FAEEDA` | needs review | 5.87:1 |
| `success` | `#3B6D11` on soft `#EAF3DE` | "copied" confirmation | 5.43:1 |
| `border`, `input` | `#E4E4E0` | hairlines | decorative, see below |
| `ring` | `#534AB7` | focus indicator | |
| `radius` | `0.5rem` | corners | |

Rules that follow from the measurements:

- No color literals in components: everything is a token (checked by search, see FD12).
- Hairline borders (`#E4E4E0`, about 1.2:1) are decorative. No control is identified by its border alone: buttons, tabs, the drop zone and the dropdown always carry text or an icon at 4.5:1 or better.
- `muted-foreground` is never placed on a `border`-colored fill (4.20:1).
- A confidence bar's fill is the `primary` or `warning` token itself (5.43:1 and 5.28:1 against the track). A lighter amber would drop to 2.86:1. The percentage is always printed next to the bar, and a flagged row also carries a "Review" badge, so color is never the only signal.
- Restraint: indigo only for the primary action, focus and selection; status colors only where they mean something; no gradients, no glass effects beyond a subtle header blur, no decorative backgrounds, no emoji; `shadow-sm` on cards and on the active tab, shadcn's standard popover shadow on floating layers (dropdown, tooltip, toasts), and nowhere else (buttons and badges are flat); spacing on a 4/8 px grid.
- **Dark theme (deferred):** adding it later means a `.dark` block. MyAgenda's own dark primary `#7B73E4` fails AA (white on it is 3.88:1, and as text on cards 4.49:1), so the dark set would use `#8B83F4` with near-black text on it (5.98:1).

Typography: Inter, as a variable font self-hosted through `@fontsource-variable/inter`, so no request goes to a font CDN (fitting for a UI that talks about privacy). Intro heading 24 px semibold with tight tracking, card titles 16 px, labels 12-13 px in `muted-foreground`, values 14-15 px, `tabular-nums` for amounts and percentages.

### FD3. Layout

*(F1, F3, F4, F11, F13)* A 56 px header with a subtle blur: brand mark and name `PayDoc Extractor` on the left, the language toggle on the right. Below it a centered `max-w-6xl` container with side padding of 16 px (24 px from `sm`). An intro block (`h1` plus one muted sentence), then a 12-column grid: the **Document** card spans 5 columns and the **Result** card 7, with a 24 px gap. Below `lg` the cards stack, Document first. The Result card has four states: empty (a quiet placeholder sentence), extracting (skeleton rows), error (destructive `Alert` with a Retry button), success (FD7).

### FD4. Upload, validation and preview

*(F1, F2, F11)* The drop zone is a focusable control wrapping a hidden `<input type="file">`; Enter and Space open the picker, and dragging over it changes its border and tint. It is a dashed zone with one icon and one line of text, nothing more. Constants: accepted types `application/pdf`, `image/jpeg`, `image/png`; `MAX_UPLOAD_BYTES = 10 * 1024 * 1024`, which mirrors the default of `MAX_UPLOAD_MB`. The server stays authoritative, so a 413 from a differently configured server still maps to its own message. Validation order mirrors the server: type, then empty, then size, each with its own localized message.

Once a valid file is chosen the zone is replaced by a preview with the file name (truncated, full name in a tooltip), size and a Remove button. Images use `<img>` with `object-contain` in a bordered frame of fixed maximum height. PDFs use `<object type="application/pdf">` with a fallback line and an "open in a new tab" link. The object URL is created on selection and revoked on replace, remove and unmount.

### FD5. API client and error mapping

*(F3, F6)* `lib/api.ts` exposes `extractDocument(file, signal)`: a `FormData` POST with the field `file` to `${VITE_API_URL}/extract`, returning a typed `ExtractResponse`. `src/types.ts` mirrors the backend schemas exactly: the `DocumentType` union, the `FIELD_NAMES` tuple, and the response shape. A minimal runtime guard checks the response before it is used.

Failures become an `ApiError` with a `kind`, each mapped to a localized message:

| Cause | `kind` | Message says |
| ----- | ------ | ------------ |
| 400 | `bad_request` | no file, or the file is empty |
| 413 | `too_large` | the file exceeds the size limit |
| 415 | `unsupported_type` | only PDF, JPEG and PNG are accepted |
| 502 and any other 5xx | `service` | the extraction service failed; the English `detail` is shown below as secondary text |
| `fetch` rejects (`TypeError`) | `network` | the API could not be reached at `VITE_API_URL`, check that it is running |
| any other status, or a malformed body | `unexpected` | something unexpected happened, with the detail if there is one |
| user cancelled (`AbortError`) | `aborted` | not shown as an error |

### FD6. Extraction state

*(F3, F6, F11)* A single hook, `useExtraction`, owns the flow as a small state machine, held in memory only:

```
idle ──choose file──▶ ready ──Extract──▶ extracting ──ok──▶ success
  ▲                    │  ▲                 │  └──fail──▶ error ──Retry──▶ extracting
  └────New document────┴──┴──Cancel─────────┘
```

Choosing another file or a sample from any state returns to `ready` and clears the previous result. Cancel aborts the request through an `AbortController`. A visually hidden `role="status"` region with `aria-live="polite"` announces "Extracting…", "Extraction complete" (with how many fields need review) and the failure message, in the active language.

### FD7. Result panel

*(F4, F5, F12, F13)*

- **Header:** the document type as a `Badge` (localized) and the overall confidence as a percentage with a slim `Progress`.
- **Review alert:** when `low_confidence_fields` is not empty, a `warning` `Alert` titled "N field(s) need review" that names the fields (localized). Nothing is shown when the list is empty.
- **Tabs:** *Fields* (default) and *JSON*.
- **Fields tab:** a `Table` with the columns Field, Value and Confidence, fine row dividers and no boxed rows. Each row shows the label, the formatted value and a slim `Progress` with the percentage. A field in `low_confidence_fields` gets the `warning` fill and a "Review" `Badge`. **The review state comes only from `low_confidence_fields`**, so the UI cannot disagree with the server's threshold. A `null` value shows "Not found" in `muted-foreground`, and its confidence cell shows "—" because a score for an absent value says nothing useful.
- **JSON tab:** the response pretty-printed in a monospace block on `muted`, scrollable, with a Copy button (Clipboard API) and a Sonner confirmation.

Formatting, with the locale `en-US` or `pt-BR` following the language:

- `issue_date`, `due_date`: if the string is `YYYY-MM-DD`, format it with `Intl.DateTimeFormat` (`dateStyle: 'medium'`, built in UTC to avoid off-by-one days); otherwise show the raw string, because the API deliberately returns dates as strings that may be malformed.
- `total_amount`: with a valid ISO 4217 `currency`, use `Intl.NumberFormat` currency style (a `RangeError` for an invalid code falls back to the plain form); without one, a plain number with two decimals and a small "currency unknown" hint.
- `currency`, `document_number`, `vendor_name`: shown as returned.

### FD8. Internationalization

*(F7)* `lib/i18n.ts` holds one typed dictionary per language: `type Dict = typeof en` and `translations: Record<Lang, Dict>`, so a missing or extra key in Portuguese fails `tsc`. `LanguageContext` provides `{ lang, toggle, t }` as in MyAgenda: `lang` persisted in `localStorage`, English by default, and `t(key, params?)` with `{name}` placeholders and separate singular/plural keys. An effect sets `<html lang>` to `en` or `pt-BR`. The header toggle is a ghost `Button` with a `Globe` icon showing the *other* language (`PT` or `EN`) and a tooltip. Everything user-visible is localized, including errors, sample names, the privacy note and the live-region messages; only the product name stays as is.

| English | Português |
| ------- | --------- |
| Extract / Cancel / Try a sample | Extrair / Cancelar / Experimentar um exemplo |
| Field / Value / Confidence | Campo / Valor / Confiança |
| Needs review / Not found | Revisar / Não encontrado |
| Vendor / payee | Fornecedor / beneficiário |
| Document number | Nº do documento |
| Issue date / Due date | Data de emissão / Vencimento |
| Total amount / Currency | Valor total / Moeda |
| Invoice / Boleto / Receipt | Fatura / Boleto / Recibo |
| Waybill / Unknown | Conhecimento de transporte / Desconhecido |

### FD9. Privacy notice

*(F8, F10)* A permanent, non-dismissible note in the Document card, directly above the Extract button, in `muted-foreground` with an info icon. English: "The file is sent to Google Gemini for extraction. On the free tier Google may use submitted content, so don't upload sensitive documents." The Portuguese text says the same. The browser keeps only `lang` in `localStorage`; there are no cookies, no analytics, and the file, the object URLs and the result live in memory only.

### FD10. Samples

*(F9)* A `DropdownMenu` labelled "Try a sample" lists the seven samples with localized names and a short kind badge. The files come from `samples/` through `import.meta.glob('../../samples/sample_*.{pdf,png,jpg}', { query: '?url', import: 'default', eager: true })`, with `server.fs.allow: ['..']` in dev, so the repository keeps a single copy; the production build hashes and bundles them (about 170 KB). `lib/samples.ts` maps file names to labels. Choosing one fetches it, wraps it in a `File` with the MIME type from its extension and runs it through the same validation and preview path as a user file. The user still has to click Extract.

### FD11. Backend contract

*(F3, F6, R15)* The UI depends only on the contract in the requirements: `POST /extract` and its status codes, plus CORS. The default dev origin `http://localhost:5173` is allowed out of the box; any other origin must be added to `CORS_ORIGINS` on the API.

### FD12. How it is verified

*(F11, F13)* No frontend tests are committed. Verification uses local scripts: `tsc --noEmit` and `vite build` (which also prove English and Portuguese have identical keys); a search showing no color literals under `src/components`; a script that recomputes the contrast table above from the actual CSS values; a Playwright script, installed outside the repository, that drives the seven samples through the UI against the live API and checks every field against the known answers, then exercises the error paths, both languages, a 375 px viewport and a keyboard-only path. Screenshots of both languages are reviewed against the restraint rules in FD2 and kept for the README.

## Requirement traceability

| Req | Satisfied by |
| --- | ------------ |
| F1  | FD3, FD4 |
| F2  | FD4 |
| F3  | FD5, FD6, FD11 |
| F4  | FD7 |
| F5  | FD7 |
| F6  | FD5, FD6, FD11 |
| F7  | FD1, FD8 |
| F8  | FD9 |
| F9  | FD10 |
| F10 | FD6, FD9 |
| F11 | FD3, FD4, FD6, FD12 |
| F12 | FD7 |
| F13 | FD1, FD2, FD3, FD7, FD12 |
