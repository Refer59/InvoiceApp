# Sonnet 4.6 — Notavo Brand Implementation Handoff

You are picking up a branding overhaul with **no prior context from the previous session**. Everything you need is below plus one linked brief.

## 1. Single source of truth

**Read this first and follow it exactly:**
`docs/branding/NOTAVO_BRAND_BRIEF.md`

Every color, token name, typography scale, screen-by-screen change, logo placement, ESC/POS ticket spec, and the final acceptance checklist is there. Do not improvise outside it — if something is ambiguous, ask the user before coding.

## 2. Implementation phase order

Execute in this order. Do not skip ahead.

1. **Theme refactor.** Create `src/theme/{colors,typography,spacing,radii,shadows,theme,ThemeProvider,useTheme,index}.ts(x)` per §4 of the brief. Keep `tokens.ts` as a shim until step 5.
2. **Font loading.** Wire Inter + JetBrains Mono via `expo-font` / `@expo-google-fonts/*`. Gate app render on `useFonts` ready state.
3. **Provider wiring.** Wrap `App.tsx` root in `<ThemeProvider>`. Persist mode to `AsyncStorage` key `notavo.themeMode`.
4. **Screen migration.** Refactor `/src/screens` and `/src/components` to consume `useTheme()`. Remove all hardcoded hex / fontSize / padding / borderRadius literals. Grep-verify (see §4.5 of the brief).
5. **Remove `tokens.ts` shim.** Delete the file once no call sites remain. No `// removed` comments.
6. **Logo placement.** Apply per §3 of the brief: Dashboard header, empty states, About/Settings footer, printed ticket bitmap.
7. **Screen-by-screen brand polish.** Apply §5 micro-interactions, haptics, Reanimated CTA press, loading / success / error states for the print flow.
8. **Printed ticket branding.** Update ESC/POS composer per §6. Bitmap logo must be pre-rendered at build time, not on device.
9. **Verify acceptance checklist** (§7). All 14 items must pass before reporting done.

## 3. Acceptance checklist (must all be ticked before reporting done)

See §7 of `NOTAVO_BRAND_BRIEF.md` — 14 items. Copy them into a TaskCreate list at the start of your session and tick each as you go.

## 4. Hard constraints — do not violate

- **Do NOT touch `app.json`, `eas.json`, `android/`, or `ios/` without explicit user approval.** For splash and app-icon changes, **output the proposed diff and ask first**. This rule is in `CLAUDE.md`; the user will reject silent edits.
- Functional components + hooks only.
- Respect existing folder conventions: `/src/screens`, `/src/components`, `/src/services`.
- Primary UI language: **Spanish**, tuteo, short sentences. Follow the 5 before/after examples in §1 of the brief.
- No backwards-compatibility shims or `// removed` comments for deleted code. Clean deletions only.

## 5. Open questions — ask the user before coding past step 6

From §8 of the brief:

1. Approval to update splash screen (`app.json`)?
2. Approval to update app icon (`app.json` + adaptive-icon asset)?
3. Default locale for currency formatting — `es-AR`, `es-ES`, or device-detected?
4. Default for "Hecho con Notavo" printed footer attribution — ON or OFF? (Brief recommends OFF.)

If any of these are unanswered when you reach the relevant step, **pause and ask**. Do not guess.
