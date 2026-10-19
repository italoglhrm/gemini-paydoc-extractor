# Frontend design

> **Step 2 of 3 in the frontend spec chain:** [requirements](requirements.md) (WHAT) → design (HOW) → [tasks](tasks.md) (DO).
> Every decision cites the requirement(s) it serves (`F1`-`F16`, and `R15` from the backend).

## Overview

One page, no router, no global store. A header, a short intro, and two panes side by side on desktop (stacked below `lg`): the document as a sheet lying on the desk, and the result as a ruled statement (FD13).

```
┌──────────────────────────────────────────────────────────────────────┐
│ ▣ PayDoc Extractor                                          ⊕ PT     │  header
├──────────────────────────────────────────────────────────────────────┤
│  Extract data from payment documents                  (serif)        │  intro
│  Upload an invoice, boleto, receipt or waybill.                      │
│                                                                      │
│  Document                        Invoice (serif)     Overall (80%)   │
│  ┌┐                  ┌┐          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  └┘  empty: scanner  └┘          ⚠ 2 fields need review              │
│      bed corners, or             Field     Value       Confidence    │
│  ┌──────────────────┐            ─────────────────────────────────── │
│  │ the sheet (paper │            Vendor    Nimbus…     ▬▬▬▬▬ 100%    │
│  │ on the desk)     │            Due date  Apr 13      ▬▬▬ 62% Review │
│  └──────────────────┘            ● High  ● Medium  ● Low             │
│  [ Try a sample ▾ ]                                                  │
│  ⓘ sent to Google Gemini…                                            │
│  [ Extract ]                                                         │
└──────────────────────────────────────────────────────────────────────┘
```

## Decisions

### FD1. Stack and project layout

Vite, React 19, TypeScript (`strict`), Tailwind CSS 3.4 and npm, in `frontend/`, on Node 22. This is MyAgenda's stack. The versions were re-checked when scaffolding (MyAgenda is on Vite 5.4): Vite 8, `@vitejs/plugin-react` 6, TypeScript 7, React 19.3, Tailwind 3.4.19. Tailwind stays on 3.x, so `tailwind-merge` stays on 2.x (3.x targets Tailwind 4 class names). `react` and `react-dom` are declared explicitly instead of arriving as peer dependencies. The API base URL comes from `VITE_API_URL` (default `http://localhost:8000`); the dev server runs on `5173`, the default allowed origin in R15, pinned with `strictPort` so it cannot drift to another port and break CORS silently. The overall confidence chart uses Recharts, loaded on demand so the first paint does not pay for it (FD7). *(F7, F13, F15)*

```
frontend/
  index.html  components.json  package.json  tsconfig.json
  vite.config.ts  tailwind.config.js  postcss.config.js  .env.example
  src/
    main.tsx  App.tsx  index.css  types.ts
    lib/        utils.ts (cn)  api.ts  i18n.ts  format.ts  samples.ts  files.ts  labels.ts  confidence.ts
    contexts/   LanguageContext.tsx
    hooks/      useExtraction.ts
    components/
      ui/       button badge card alert table progress skeleton
                tooltip dropdown-menu
      Header  LanguageToggle  LogoIcon  UploadZone  DocumentPreview  PrivacyNote
      SamplePicker  ExtractActions  ResultSkeleton  ErrorAlert
      ResultPanel  OverallConfidence  ConfidenceGauge  ConfidenceLegend  FieldsTable
```

### FD2. Design system: shadcn/ui, light theme only

Components follow shadcn/ui's reference sources in the `new-york` style (denser and sharper than `default`), built on Radix primitives, `class-variance-authority`, `clsx` and `tailwind-merge` (`cn()`), with Lucide icons and the type pairing in this section. A `components.json` is kept and verified to work: the shadcn CLI (4.x) accepts it for this Tailwind 3.4 setup and emits the classic `new-york` sources (checked with `add button --dry-run`), so the primitives are generated with the CLI rather than ported by hand. `tailwindcss-animate` supplies the `animate-in` classes the Radix components use. *(F13)*

Tokens are CSS variables in `:root`, stored as HSL channels so opacity modifiers (`bg-primary/10`) work, and exposed through `tailwind.config.js` in shadcn's vocabulary. The palette is the Ledger set, which replaced MyAgenda's indigo in the visual reshape (FD13). Contrast was measured with WCAG 2.x formulas:

| Token | Value | Role | Measured contrast |
| ----- | ----- | ---- | ----------------- |
| `background` | `#EDF0F3` | "Desk": the page, a cool slate | `foreground` on it 14.29:1 |
| `foreground` | `#15212C` | "Ink": text | 16.35:1 on `card` |
| `card`, `popover` | `#FFFFFF` | "Paper": the document sheet, the statement and floating layers | |
| `muted` | `#E3E8ED` | quiet surfaces: table header, skeleton | `muted-foreground` on it 5.26:1 |
| `muted-foreground` | `#506070` | secondary text | 5.66:1 on `background`, 6.48:1 on `card` |
| `primary` | `#1F4E79` | "Ledger blue": primary action, selected state, focus ring, brand mark | white on it 8.67:1; ring 7.58:1 on `background` |
| `primary-foreground` | `#FFFFFF` | text on `primary` | |
| `accent` | `#E1EAF3` | hover and selected tint | `accent-foreground` (`#1F4E79`) on it 7.13:1 |
| `secondary` | `#E3E8ED` | secondary button surface | `foreground` on it 13.27:1 |
| `destructive` | `#A12B2B` on soft `#FBE9E9` | errors; low confidence ("Flag") | 6.19:1 text on soft; white on `destructive` 7.25:1 |
| `warning` | `#8A5A00` on soft `#FBF0D9` | needs review; medium confidence ("Check") | 5.24:1 |
| `success` | `#1B6B4A` | high confidence ("Verified") | 6.46:1 on `card`, 5.64:1 on `background` |
| `border`, `input` | `#D3DAE1` | rules and hairlines | decorative, see below |
| `ring` | `#1F4E79` | focus indicator | |
| `radius` | `0.375rem` | corners | |

Rules that follow from the measurements:

- No color literals in components: everything is a token (checked by search, see FD12).
- Hairlines (`#D3DAE1`, about 1.2:1 on `background`) are decorative. No control is identified by its border alone: buttons, the drop zone and the dropdown always carry text or an icon at 4.5:1 or better.
- `muted-foreground` on a `border`-colored fill passes (4.58:1) but is not used there.
- A confidence bar's fill is the token of its level, `success`, `warning` or `destructive`: 4.58, 4.20 and 5.14:1 against the bar track (`border`), above the 3:1 that graphics need, and 6.46, 5.92 and 7.25:1 as text on the card. The percentage is always printed next to the bar and the legend names each level, so color is never the only signal.
- Color means one thing: status colors only where they mean confidence, a review or an error; Ledger blue only for the primary action, focus, selection and the brand mark.
- Restraint: no gradients, no glass effects beyond a subtle header blur, no decorative backgrounds, no emoji; buttons and badges are flat; the document sheet and the statement have no shadow and are told apart from the desk by a 1 px edge and the Paper-on-Desk contrast; shadcn's standard popover shadow only on floating layers (dropdown, tooltip); spacing on a 4/8 px grid.
- **Dark theme (deferred):** adding it later means a `.dark` block with its own values, measured again.

Typography: two clearly different families, both self-hosted through Fontsource (`@fontsource-variable/source-serif-4` and `@fontsource-variable/ibm-plex-sans`), so no request goes to a font CDN (fitting for a UI that talks about privacy). Source Serif 4 is used only for the intro heading and the result's document-type heading, which gives them the feel of a statement. IBM Plex Sans is used for everything else. Plex's digits are easy to tell apart (0/8, 3/8, 1/7), which matters in a tool that reads numbers. Intro heading 28 px semibold with tight tracking (24 px below `sm`), card and section titles 16 px, labels 12-13 px in `muted-foreground`, values 14-15 px, tabular figures for amounts, dates and percentages.

### FD3. Layout

*(F1, F3, F4, F11, F13)* A 56 px header with a subtle blur: brand mark and name `PayDoc Extractor` on the left, the language toggle on the right. The mark is a page with two lines of text, drawn in the `primary` color with no container square: the lines are cut out of the page, so the background shows through. A small four-point sparkle sits in the free corner at its top right and says there is AI behind the extraction; it keeps at least one unit of clear space from the page. It is the same glyph as the favicon (`public/favicon.svg`, which switches to a lighter variant of the blue on dark browser tabs). A colored square around the glyph, robots and gradients are avoided on purpose, because they make a mark look generic. Below it a centered `max-w-6xl` container with side padding of 16 px (24 px from `sm`). An intro block (a serif `h1` plus one muted sentence), then a 12-column grid on the Desk background: the **Document** pane spans 5 columns and the **Result** pane 7, with a 24 px gap. Below `lg` they stack, Document first. The Document pane holds the sheet (FD4) and the Result pane is the statement (FD7). The Result pane has four states: empty (a quiet placeholder sentence), extracting (skeleton rows), error (destructive `Alert` with a Retry button), success (FD7).

### FD4. Upload, validation and preview

*(F1, F2, F11)* The drop zone is a focusable control wrapping a hidden `<input type="file">`; Enter and Space open the picker, and dragging over it turns its corner marks and tint to the primary color. It is a scanner bed: four corner marks around one icon and one line of text, nothing more. Constants: accepted types `application/pdf`, `image/jpeg`, `image/png`; `MAX_UPLOAD_BYTES = 10 * 1024 * 1024`, which mirrors the default of `MAX_UPLOAD_MB`. The server stays authoritative, so a 413 from a differently configured server still maps to its own message. Validation order mirrors the server: type, then empty, then size, each with its own localized message.

Once a valid file is chosen the zone is replaced by the document sheet: a Paper surface with a thin edge and no shadow, holding the preview, with the file name (truncated, full name in a tooltip), its size and type as separate elements (not one joined string) and a Remove button. Images use `<img>` with `object-contain` on the sheet, with a fixed maximum height. PDFs use `<object type="application/pdf">` with a fallback line and an "open in a new tab" link. The object URL is created on selection and revoked on replace, remove and unmount.

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

*(F4, F5, F13, F14, F15)*

- **Header:** the document type as a heading in the serif face (localized) on the left and, on the right, the overall confidence gauge, with a heavy rule under the row.
- **Overall confidence gauge (F15):** a Recharts radial chart (`RadialBarChart` with one `RadialBar` on a 0-100 domain), about 96 px across: a ring whose arc spans the percentage, on a `border`-colored track, with the percentage in large `tabular-nums` type at its center and the level word (High, Medium, Low) beside it, both in the level's color. The percentage is real text and not part of the SVG, and the chart is hidden from assistive technology behind one `role="img"` label such as "Overall confidence: 80%, medium". The arc takes its color from the level through `currentColor`, so it stays token-driven. Recharts is the heaviest dependency, so the chart is loaded on demand (`React.lazy`) with a plain ring of the same size as the placeholder; the number is shown at once. The arc animates on arrival unless the user prefers reduced motion.
- **Review alert:** when `low_confidence_fields` is not empty, a `warning` `Alert` titled "N field(s) need review" that names the fields (localized). Nothing is shown when the list is empty.
- **Fields:** a `Table` with the columns Field, Value and Confidence, fine row dividers and no boxed rows (a stacked list below `sm`). Each row shows the label, the formatted value, a slim `Progress` bar and the percentage, both in the color of the score's level; amounts, dates and percentages use tabular figures. A field in `low_confidence_fields` also gets a stamp-style "Review" label (the `Badge` component, restyled) in the row. A `null` value shows "Not found" in `muted-foreground`, and its confidence cell shows "—" because a score for an absent value says nothing useful.
- **Confidence levels (F14):** taken from the rounded percentage, so the number on screen and the color always agree: **high** 90% or more (`success`), **medium** 70% to 89% (`warning`), **low** below 70% (`destructive`). A legend under the fields names the three levels with their ranges. The bands follow the extraction prompt's own scale (clearly stated 0.9-1.0, partial 0.5-0.8) and the server's default threshold of 0.7, but they are a display aid only: **whether a field needs review comes only from `low_confidence_fields`**, so the UI cannot disagree with the server if its threshold is changed. The "Review" badge takes the color of the field's level.
- The raw JSON view and its copy button were dropped (F12 withdrawn), so there are no tabs and no toasts.

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

*(F9)* A `DropdownMenu` labelled "Try a sample" lists the seven samples with localized names and a short kind badge. The files come from `samples/` through `import.meta.glob('../../../samples/sample_*.{pdf,png,jpg}', { query: '?url', import: 'default', eager: true })` in `src/lib/samples.ts`, with `server.fs.allow: ['..']` in dev, so the repository keeps a single copy. The production build bundles them (about 170 KB): the three larger files become hashed assets and the four small PDFs, under Vite's 4 KB inline limit, are embedded as `data:` URLs; both load the same way through `fetch`. The same file maps names to labels. Choosing one fetches it, wraps it in a `File` with the MIME type from its extension and runs it through the same validation and preview path as a user file. The user still has to click Extract.

### FD11. Backend contract

*(F3, F6, R15)* The UI depends only on the contract in the requirements: `POST /extract` and its status codes, plus CORS. The default dev origin `http://localhost:5173` is allowed out of the box; any other origin must be added to `CORS_ORIGINS` on the API.

### FD12. How it is verified

*(F11, F13)* No frontend tests are committed. Verification uses local scripts: `tsc --noEmit` and `vite build` (which also prove English and Portuguese have identical keys); a search showing no color literals under `src/components`; a script that recomputes the contrast table above from the actual CSS values; a Playwright script, installed outside the repository, that drives the seven samples through the UI against the live API and checks every field against the known answers, then exercises the error paths, both languages, a 375 px viewport and a keyboard-only path. Screenshots of both languages are reviewed against the restraint rules in FD2 and kept for the README.

### FD13. Visual identity

*(F13, F16)* The reshape follows a short design plan, written against the brief before any code. **Subject:** a back-office person checking what a model read from a payment document: compare the document with the values, and spot the ones to distrust. So the UI is a desk, a sheet and a statement, not a dashboard.

- **Boldness in three places, restraint everywhere else:** the serif document-type heading, the ruled statement (a heavy top rule, thin row dividers, figures in a column), and the scanner-bed corner marks of the empty drop zone. Every other surface stays quiet.
- **What it avoids on purpose:** identical rounded cards with one shadow on every surface, a stock accent color, joined meta strings such as "2.7 kB · PDF", a pill for the document type, tracked all-caps labels, and decoration that carries no information.
- **Lines carry information:** the heavy rule opens the statement, thin dividers separate fields, the corner marks say "place the document here". Numbering is not used.
- **Motion, one moment:** when a result arrives, the field rows resolve in a short stagger (about 40 ms apart) and the gauge sweeps to its value. A response to a user action, nothing ambient. It is turned off for users who prefer reduced motion, and the content is complete without it.
- **Copy:** unchanged in meaning. Errors already state what happened and what to do; the joined meta strings become separate elements.
- **Unchanged by the reshape:** the two-column layout, the light-only theme, every behavior (focus management, live-region announcements, cancel, the sample picker, language switch), the brand mark's shape, and the gauge (Recharts) with its levels.

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
| F12 | withdrawn (see FD7) |
| F13 | FD1, FD2, FD3, FD7, FD12, FD13 |
| F16 | FD2, FD3, FD4, FD7, FD13 |
| F14 | FD2, FD7 |
| F15 | FD1, FD7 |
