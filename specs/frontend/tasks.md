# Frontend tasks

> **Step 3 of 3 in the frontend spec chain:** [requirements](requirements.md) (WHAT) → [design](design.md) (HOW) → tasks (DO).
> Dependency-ordered. Each task names the requirements it satisfies and the design decisions it implements. Work top to bottom and keep the app runnable after every step.

**Prerequisite:** backend task T13 (CORS, R15) in [../tasks.md](../tasks.md), without which a browser cannot call the API.

## Tasks

- [x] **F-T1** Scaffold `frontend/` — *F7, F13* · design FD1, FD2
  - Vite + React 19 + TypeScript strict, Tailwind 3.4 with `tailwindcss-animate`, PostCSS, `components.json`, Inter, `.env.example` (`VITE_API_URL`), tokens in `index.css` (light only, HSL channels), and `node_modules/` and `dist/` added to the root `.gitignore`.
  - Done when: `npm run dev` serves an empty styled shell, `tsc --noEmit` and `npm run build` pass, and the tokens in `index.css` equal the FD2 table.
- [x] **F-T2** shadcn-style UI primitives — *F13* · design FD2
  - Button, Badge, Card, Alert, Table, Tabs, Progress, Skeleton, Separator, Tooltip, DropdownMenu and the Sonner wrapper under `src/components/ui/`, in the `new-york` style, generated with the shadcn CLI (verified to support this Tailwind 3.4 setup in F-T1).
  - Done when: each primitive renders with tokens only, with a visible focus ring, and no color literal appears under `src/components`.
  - Later pruned to what the app uses: F-T10 removed Tabs and Sonner, and the pre-publish cleanup removed Separator and the unused parts of Card, Table and DropdownMenu.
- [x] **F-T3** Types and API client — *F3, F6* · design FD5, FD11
  - `src/types.ts` mirroring the backend schemas, and `lib/api.ts` with `extractDocument(file, signal)` and `ApiError`.
  - Done when: each failure in the FD5 table yields the right `kind`, cancellation yields `aborted`, and a malformed body yields `unexpected`.
- [x] **F-T4** Internationalization — *F7* · design FD8
  - `lib/i18n.ts` (typed dictionaries), `LanguageContext`, `LanguageToggle`, `<html lang>` sync, and the formatting helpers in `lib/format.ts` (dates, amounts).
  - Done when: the toggle switches every string, the choice persists, English is the default, and a key missing from either language fails `tsc`.
- [x] **F-T5** App shell — *F11, F13* · design FD3
  - Header, intro, the two-column grid that stacks below `lg`, the Result card's empty state, the hidden live region, page title and favicon.
  - Done when: the layout holds from 360 px to a wide desktop and matches the FD3 description.
- [x] **F-T6** Upload, validation, preview and privacy note — *F1, F2, F8, F10, F11* · design FD4, FD9
  - `UploadZone`, `DocumentPreview`, `PrivacyNote`, and the validation constants.
  - Done when: PDF, JPEG and PNG preview correctly, other types and files over 10 MB are rejected with a localized reason, the zone works by keyboard, and the object URL is revoked on replace, remove and unmount.
- [x] **F-T7** Sample picker — *F9* · design FD10
  - `SamplePicker` and `lib/samples.ts`, with `import.meta.glob` over `samples/` and `server.fs.allow`.
  - Done when: all seven samples are listed with localized names, choosing one loads it into the preview, and the production build bundles them.
- [x] **F-T8** Result panel — *F4, F5, F12, F13* · design FD7
  - `ResultPanel`, `OverallConfidence`, `FieldsTable`, `RawJson`.
  - Done when: the six fields, their confidence and the overall confidence show; exactly the fields in `low_confidence_fields` are flagged; a null value reads "Not found"; dates and amounts follow the FD7 formatting rules; the JSON tab copies.
  - Superseded in part: F-T10 removes the JSON tab, and F-T11 and F-T12 change how confidence is shown.
- [x] **F-T9** Extraction flow and error states — *F3, F6, F11* · design FD6, FD5
  - `useExtraction`, the skeleton state, Cancel, Retry, New document, `ErrorAlert`, and the live-region messages.
  - Done when: every transition in the FD6 diagram works, each error kind shows its own localized message, and state changes are announced.
- [x] **F-T10** Remove the JSON view — *F12 withdrawn* · design FD7
  - Remove the JSON tab, the raw JSON component and the copy button, and with them what only they used: the Tabs and Sonner primitives, the toaster, their dependencies and their dictionary entries. The fields table is shown directly.
  - Done when: the result shows no tabs, JSON view or copy control, nothing else regresses, and no code, dictionary key or dependency left behind refers to them.
- [x] **F-T11** Confidence levels — *F14* · design FD2, FD7
  - `lib/confidence.ts` (the bands and the style of each level), colored bars and percentages in the fields table, the legend, the Review badge in the color of its level, and the dictionary entries in both languages.
  - Done when: every score shows in the color of its level on the rounded percentage (the 69/70 and 89/90 boundaries checked), the legend names the three levels with their ranges, a field is flagged only if it is in `low_confidence_fields`, and the contrast figures in FD2 hold.
- [x] **F-T12** Overall confidence gauge — *F15* · design FD1, FD7
  - Recharts added, `ConfidenceGauge` loaded on demand, and `OverallConfidence` rebuilt around it with a same-size placeholder, the level word, an accessible label and reduced-motion handling.
  - Done when: the chart draws the percentage as an arc in its level's color with the number at its center, the number is readable text before and without the chart, a screen reader gets one label, motion is off for users who prefer reduced motion, and the chart code is a separate chunk fetched only after the first result.
- [x] **F-T14** Visual tokens and type — *F13, F16* · design FD2, FD13
  - The Ledger palette in `index.css` and `tailwind.config.js` (HSL channels, same token names), the new radius, Source Serif 4 and IBM Plex Sans self-hosted through Fontsource with Inter and its package removed, tabular figures where FD2 says so, and the brand mark and favicon in Ledger blue.
  - Done when: the tokens equal the FD2 table, the contrast script recomputed from the actual CSS reproduces the table, no color literal appears under `src/components`, no request goes to a font CDN, and `tsc` and the build pass.
- [x] **F-T15** Document pane — *F1, F13, F16* · design FD3, FD4, FD13
  - The Desk background and the pane layout, the scanner-bed corner marks on the drop zone, the document sheet around the preview, and size and type shown as separate elements.
  - Done when: the drop zone keeps its keyboard and drag behavior, a chosen file shows on the sheet with no shadow and a thin edge, and the upload and sample browser checks still pass.
- [x] **F-T16** Result statement — *F4, F5, F14, F15, F16* · design FD7, FD13
  - The serif document-type heading with the heavy rule, the ruled fields table with tabular figures, the stamp-style Review label, and the gauge and legend restyled in the new tokens.
  - Done when: values, levels (the 69/70 and 89/90 boundaries), the Not found state and the flagged rows all match what they showed before, and the result, level and gauge checks pass.
- [x] **F-T17** Arrival motion — *F16* · design FD13
  - Rows resolve in a short stagger and the gauge sweeps when a result arrives, off under `prefers-reduced-motion`.
  - Done when: the motion plays once per result, a reduced-motion browser shows the final state at once, and nothing moves while the user is typing, tabbing or scrolling.
- [ ] **F-T13** End-to-end and visual verification — *F1-F11, F13-F15* · design FD12
  - The seven samples through the UI against the live API, error paths, both languages, 375 px, keyboard-only path, the contrast recomputation, and the screenshot review.
  - Done when: every sample matches its known answers in the UI, every FD12 check passes, and screenshots of both languages are kept for the README.

**Work order from here:** F-T14 to F-T17 (the visual reshape), then F-T13, which now verifies the reshaped UI and retakes the screenshots; the README images are replaced from those.

## Requirement coverage

| Req | Tasks |
| --- | ----- |
| F1  | F-T6, F-T15, F-T13 |
| F2  | F-T6, F-T13 |
| F3  | F-T3, F-T9, F-T13 |
| F4  | F-T8, F-T16, F-T13 |
| F5  | F-T8, F-T16, F-T13 |
| F6  | F-T3, F-T9, F-T13 |
| F7  | F-T1, F-T4, F-T13 |
| F8  | F-T6, F-T13 |
| F9  | F-T7, F-T13 |
| F10 | F-T6, F-T13 |
| F11 | F-T5, F-T6, F-T9, F-T13 |
| F12 | withdrawn (F-T10 removes the JSON view) |
| F13 | F-T1, F-T2, F-T5, F-T8, F-T11, F-T12, F-T14, F-T15, F-T13 |
| F14 | F-T11, F-T16, F-T13 |
| F15 | F-T12, F-T16, F-T13 |
| F16 | F-T14, F-T15, F-T16, F-T17, F-T13 |
