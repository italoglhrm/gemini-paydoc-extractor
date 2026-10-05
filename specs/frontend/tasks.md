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
- [x] **F-T9** Extraction flow and error states — *F3, F6, F11* · design FD6, FD5
  - `useExtraction`, the skeleton state, Cancel, Retry, New document, `ErrorAlert`, and the live-region messages.
  - Done when: every transition in the FD6 diagram works, each error kind shows its own localized message, and state changes are announced.
- [ ] **F-T10** End-to-end and visual verification — *F1-F13* · design FD12
  - The seven samples through the UI against the live API, error paths, both languages, 375 px, keyboard-only path, the contrast recomputation, and the screenshot review.
  - Done when: every sample matches its known answers in the UI, every FD12 check passes, and screenshots of both languages are kept for the README.

The README (backend T12) follows this chain, once real screenshots exist.

## Requirement coverage

| Req | Tasks |
| --- | ----- |
| F1  | F-T6, F-T10 |
| F2  | F-T6, F-T10 |
| F3  | F-T3, F-T9, F-T10 |
| F4  | F-T8, F-T10 |
| F5  | F-T8, F-T10 |
| F6  | F-T3, F-T9, F-T10 |
| F7  | F-T1, F-T4, F-T10 |
| F8  | F-T6, F-T10 |
| F9  | F-T7, F-T10 |
| F10 | F-T6, F-T10 |
| F11 | F-T5, F-T6, F-T9, F-T10 |
| F12 | F-T8, F-T10 |
| F13 | F-T1, F-T2, F-T5, F-T8, F-T10 |
