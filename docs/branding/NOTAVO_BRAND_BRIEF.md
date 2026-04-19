# Notavo — Brand Brief & Implementation Spec

**Audience:** Sonnet 4.6 (React Native engineer)
**Stack:** Expo SDK 54 · TypeScript · React Native
**Purpose:** Single source of truth for the Notavo brand + the exact refactor plan to apply it.

> **Hard constraints (restated from `CLAUDE.md`)**
> - Do **not** modify `app.json`, `eas.json`, or `android/` / `ios/` without explicit user approval. For splash/icon changes, output the proposed diff and ask first.
> - Functional components + hooks only. No class components.
> - Respect existing folder conventions: `/src/screens`, `/src/components`, `/src/services`.
> - Primary UI language: **Spanish** (es-ES / es-LATAM neutral).

---

## 1. Brand Foundation

### Essence (one line)
**Notavo is the pocket-sized cash register that turns any phone into a fast, reliable, offline-first point of sale.**

### Personality — 3 adjectives
1. **Confiable** (trustworthy, grounded) — money is on the line; nothing feels flaky.
2. **Ágil** (quick, low-friction) — a sale takes seconds, not screens.
3. **Cercano** (approachable, warm) — built for market vendors and micro-merchants, not accountants.

### Tone-of-voice rules (in-app copy, Spanish)
1. **Tuteo**, always. Never "usted". Merchants are peers, not clients of a bank.
2. **Verbs before nouns** on CTAs. "Imprimir ticket" beats "Impresión de ticket".
3. **Short sentences.** Max 12 words per line of microcopy. Thermal-receipt discipline.
4. **No tech jargon** leaking into the UI. "Conectar impresora", not "Emparejar dispositivo BLE".
5. **Own mistakes plainly.** No passive voice in errors. "No encontramos la impresora" beats "La impresora no pudo ser encontrada".
6. **Celebrate small wins quietly.** Confirmations are one line + one icon. No confetti.

#### Before / After examples (Spanish)

| # | Before (avoid) | After (use) |
|---|---|---|
| 1 | "Se ha producido un error al intentar establecer conexión con el dispositivo Bluetooth." | "No pudimos conectar con la impresora. Revisá que esté encendida." |
| 2 | "Generación de nota de venta exitosa." | "Nota guardada." |
| 3 | "No existen registros disponibles para visualizar." | "Todavía no hay tickets. Creá el primero." |
| 4 | "¿Está usted seguro de que desea eliminar este ítem?" | "¿Borrar este ítem?" |
| 5 | "Por favor, proceda a introducir el importe recibido del cliente." | "Ingresá el monto recibido." |

---

## 2. Visual Identity System

Extracted from `notavo_branding.png`. The mark is a stylized **"n"** shaped like an arch/receipt roll — warm coral on cream, paired with deep navy for ink and chrome.

### 2.1 Color tokens

All tokens expressed as hex. Token names use a flat, NativeWind-friendly convention (`brand.coral`, `text.primary`, etc.).

#### Brand core
| Token | Light | Dark | Notes |
|---|---|---|---|
| `brand.coral` | `#E8702E` | `#F2864A` | Primary accent. CTAs, active states, brand highlights. |
| `brand.coralSoft` | `#FCE8DB` | `#3A2418` | Soft fills, badges, selected rows. |
| `brand.coralInk` | `#B2531C` | `#FBC7A3` | Text on coralSoft, pressed CTA. |
| `brand.navy` | `#1F2C4A` | `#E6ECF7` | Headers, primary text on cream, logo ink. |
| `brand.navySoft` | `#E6E9F1` | `#2A3757` | Navy-tinted surface (cards on cream). |
| `brand.cream` | `#F3E7D3` | `#151821` | Signature warm neutral (splash, hero surfaces). |

#### Semantic
| Token | Light | Dark |
|---|---|---|
| `semantic.success` | `#1F9D55` | `#3FC77A` |
| `semantic.warning` | `#C69026` | `#E5B04A` |
| `semantic.danger`  | `#D64545` | `#F07070` |
| `semantic.info`    | `#2D6EC9` | `#6AA6F0` |

#### Neutrals (UI chrome)
| Token | Light | Dark |
|---|---|---|
| `bg.base`       | `#FAF7F1` | `#0F1117` |
| `bg.surface`    | `#FFFFFF` | `#181B23` |
| `bg.surfaceAlt` | `#F1EEE7` | `#20242E` |
| `border.subtle` | `#E8E2D3` | `#2A2F3A` |
| `border.strong` | `#CFC7B4` | `#3A4150` |
| `text.primary`  | `#1F2C4A` | `#F2F4F8` |
| `text.secondary`| `#5A6270` | `#B7BDC8` |
| `text.muted`    | `#8A8376` | `#7E8596` |
| `text.onCoral`  | `#FFFFFF` | `#16110C` |

> **Rationale:** The cream (`#F3E7D3`) is the brand's warm differentiator vs. the cold white-and-blue default of the current `tokens.ts`. Reserve cream for hero/empty-state surfaces so it reads as *brand moment*, not as every-card-background.

### 2.2 Typography scale

- **Font family:** Use **Inter** (load via `expo-font` / `@expo-google-fonts/inter`). Weights: 400, 500, 600, 700, 800. Fallback to `System` on iOS and `sans-serif` on Android.
- **Monospace:** **JetBrains Mono** (via `@expo-google-fonts/jetbrains-mono`, weights 400 + 600) for ticket previews, totals, and printed-output simulations.
- **Rationale:** Inter reads cleanly at small sizes (thermal-print-style density on screen) and has full Spanish/Latin-extended glyph support. JetBrains Mono's tabular figures align totals without custom feature flags.

| Role | Size / Line | Weight | Letter spacing |
|---|---|---|---|
| `display`   | 32 / 38 | 800 | -0.5 |
| `h1`        | 24 / 30 | 700 | -0.3 |
| `h2`        | 20 / 26 | 700 | -0.2 |
| `h3`        | 17 / 24 | 600 | 0 |
| `body`      | 15 / 22 | 400 | 0 |
| `bodyStrong`| 15 / 22 | 600 | 0 |
| `caption`   | 13 / 18 | 400 | 0.1 |
| `label`     | 12 / 16 | 600 | 0.6 (uppercase) |
| `mono`      | 14 / 20 | 400 (JetBrains Mono) | 0 |
| `monoTotal` | 18 / 24 | 600 (JetBrains Mono) | 0 |

### 2.3 Spacing scale (4pt grid)

| Token | Value |
|---|---|
| `xs`  | 4 |
| `sm`  | 8 |
| `md`  | 12 |
| `lg`  | 16 |
| `xl`  | 24 |
| `2xl` | 32 |
| `3xl` | 48 |
| `4xl` | 64 |

**Rule:** All `padding` / `margin` / `gap` values in `/src/screens` and `/src/components` must come from this scale. No inline `padding: 10` style literals.

### 2.4 Radii

| Token | Value | Use |
|---|---|---|
| `radii.xs`  | 6  | Chips, small badges |
| `radii.sm`  | 10 | Inputs, small buttons |
| `radii.md`  | 14 | Cards, list rows |
| `radii.lg`  | 20 | Modals, hero surfaces |
| `radii.xl`  | 28 | Splash / onboarding art frames |
| `radii.full`| 9999 | Pills, avatars |

### 2.5 Shadows / elevations

| Token | Style |
|---|---|
| `shadow.none`  | `{}` |
| `shadow.card`  | `offset 0/2, opacity 0.06, radius 10, elevation 2` |
| `shadow.float` | `offset 0/8, opacity 0.12, radius 22, elevation 8` |
| `shadow.modal` | `offset 0/16, opacity 0.20, radius 36, elevation 16` |

Dark mode: reduce opacity by 40% and swap `shadowColor` to `#000` with additional 1px inner border via `border.subtle` for separation.

### 2.6 Iconography

- **Set:** **Lucide** (`lucide-react-native`). Do not mix icon sets.
- **Stroke width:** `1.75` for body/nav, `2` for CTAs, `2.25` for the active tab in `BottomNav`.
- **Corner style:** Rounded caps + rounded joins (Lucide default — do not override).
- **Sizing:** `16`, `20`, `24`, `28` only. Everything else is a code smell.
- **Color:** `text.secondary` at rest, `brand.coral` when active, `text.muted` when disabled.

---

## 3. Logo Integration Plan

The canonical logo lives in `assets/`. Production SVG/PNG exports needed:
- `assets/logo/notavo-mark.svg` (icon only, coral on cream)
- `assets/logo/notavo-mark-inverted.svg` (cream on navy)
- `assets/logo/notavo-horizontal.svg` (mark + wordmark, for wide headers)
- `assets/logo/notavo-mark-mono.png` @ 384×384 (1-bit, for ESC/POS bitmap header)

> Sonnet: if these exports don't exist yet, flag it and propose exporting from `notavo_branding.png`. Do not create adaptive icons or splash assets without asking.

### Placement map

| Surface | Variant | Size | Notes |
|---|---|---|---|
| Splash screen | Mark on cream (`#F3E7D3`) | 180×180 pt, centered | **Requires user approval** — touches `app.json`. |
| App icon (iOS/Android) | Mark on cream with coral arch | 1024×1024 source | **Requires user approval** — touches `app.json` + adaptive-icon asset. |
| Control Panel header | Horizontal lockup (mark + wordmark) | 28 pt tall, left-aligned | Replaces current text-only title. |
| Empty states (History, Printers) | Mark only, `bg.surfaceAlt` fill | 64×64 | Paired with a one-line Spanish message + single CTA. |
| Printed ticket header | Monochrome bitmap (`notavo-mark-mono.png`) | 128×128 px (≈16mm on 48mm paper) | Centered, followed by business name (Font A bold) and tagline (Font B). |
| About / Settings footer | Horizontal lockup, muted | 20 pt tall, centered | Under it: `Notavo · v{package.version}` in `caption`. |

### ESC/POS header constraints
- **48mm effective width = 384 dots** at 203 DPI.
- Logo bitmap max width: **384 px**, but use **128–192 px** centered for visual weight.
- Convert to 1-bit (Floyd–Steinberg or threshold ≈ 128). The mark is simple enough that threshold is fine.
- Ensure the file is pre-dithered at build time; do not dither on-device per print (slow on low-end Android).

---

## 4. Theme Implementation

### 4.1 Folder layout

The current theme lives at `src/theme/tokens.ts` (flat, minimal). Refactor into:

```
src/theme/
  colors.ts        # Light + dark palettes
  typography.ts    # Font families, scale, weights
  spacing.ts       # 4pt scale
  radii.ts         # Corner radii
  shadows.ts       # Elevation presets
  theme.ts         # Assembles { colors, typography, ... } for light + dark
  ThemeProvider.tsx
  useTheme.ts
  index.ts         # Re-exports
```

**Migration:** keep `tokens.ts` as a shim that re-exports from the new modules for one commit, then delete it once call sites are updated. Do **not** leave dead code or `// removed` comments after the migration.

### 4.2 TypeScript types

```ts
// src/theme/theme.ts
import { colorsLight, colorsDark } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radii } from './radii';
import { shadowsLight, shadowsDark } from './shadows';

export type ThemeMode = 'light' | 'dark';

export type Theme = {
  mode: ThemeMode;
  colors: typeof colorsLight;       // both palettes share the same keys
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
  shadows: typeof shadowsLight;
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: colorsLight,
  typography,
  spacing,
  radii,
  shadows: shadowsLight,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: colorsDark,
  typography,
  spacing,
  radii,
  shadows: shadowsDark,
};
```

### 4.3 ThemeProvider + useTheme (paste-ready)

```tsx
// src/theme/ThemeProvider.tsx
import React, { createContext, useMemo, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, lightTheme, darkTheme, ThemeMode } from './theme';

type Ctx = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (m: ThemeMode | 'system') => void;
};

export const ThemeContext = createContext<Ctx | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const system = useColorScheme() ?? 'light';
  const [override, setOverride] = useState<ThemeMode | 'system'>('system');

  const mode: ThemeMode = override === 'system' ? (system as ThemeMode) : override;
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  const setMode = useCallback((m: ThemeMode | 'system') => setOverride(m), []);
  const value = useMemo(() => ({ theme, mode, setMode }), [theme, mode, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
```

```ts
// src/theme/useTheme.ts
import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
};
```

Wrap the app root (`App.tsx`) with `<ThemeProvider>` above any existing providers. Persist the user's mode choice via `AsyncStorage` under key `notavo.themeMode`.

### 4.4 Example token files (shape reference)

```ts
// src/theme/colors.ts
export const colorsLight = {
  brand: {
    coral: '#E8702E', coralSoft: '#FCE8DB', coralInk: '#B2531C',
    navy: '#1F2C4A', navySoft: '#E6E9F1', cream: '#F3E7D3',
  },
  semantic: {
    success: '#1F9D55', warning: '#C69026', danger: '#D64545', info: '#2D6EC9',
  },
  bg:     { base: '#FAF7F1', surface: '#FFFFFF', surfaceAlt: '#F1EEE7' },
  border: { subtle: '#E8E2D3', strong: '#CFC7B4' },
  text:   { primary: '#1F2C4A', secondary: '#5A6270', muted: '#8A8376', onCoral: '#FFFFFF' },
} as const;

export const colorsDark: typeof colorsLight = {
  brand: {
    coral: '#F2864A', coralSoft: '#3A2418', coralInk: '#FBC7A3',
    navy: '#E6ECF7', navySoft: '#2A3757', cream: '#151821',
  },
  semantic: {
    success: '#3FC77A', warning: '#E5B04A', danger: '#F07070', info: '#6AA6F0',
  },
  bg:     { base: '#0F1117', surface: '#181B23', surfaceAlt: '#20242E' },
  border: { subtle: '#2A2F3A', strong: '#3A4150' },
  text:   { primary: '#F2F4F8', secondary: '#B7BDC8', muted: '#7E8596', onCoral: '#16110C' },
};
```

```ts
// src/theme/spacing.ts
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32, '3xl': 48, '4xl': 64 } as const;
```

```ts
// src/theme/radii.ts
export const radii = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, full: 9999 } as const;
```

### 4.5 Migration rule (non-negotiable)

> No hardcoded colors, font sizes, radii, or spacing literals anywhere in `/src/screens` or `/src/components`. Every value references a theme token via `useTheme()`. Run a grep sweep before declaring done:
>
> ```
> # should return zero hits in src/screens and src/components
> #[0-9a-fA-F]{3,8}\b
> fontSize:\s*\d+
> padding(Horizontal|Vertical|Top|Right|Bottom|Left)?:\s*\d+
> borderRadius:\s*\d+
> ```
>
> The only exceptions are: (a) `tokens.ts` shim during migration, (b) `TicketPreview.tsx` where ESC/POS character math genuinely requires raw numbers — comment each such number with a one-liner justifying why it's raw.

---

## 5. Screen-by-Screen Brand Application

Flow: **Control Panel → New Note → Add Entry → Preview → Print**. Plus ancillary screens already in `/src/screens`.

### 5.1 `DashboardScreen.tsx` (Control Panel)
- **Header:** horizontal logo lockup, left. Right side: settings icon (Lucide `settings-2`) → `SettingsScreen`.
- **Hero card:** cream (`brand.cream`) background, `radii.lg`, `shadow.card`. Inside: "Hola 👋" (Spanish, tuteo), today's total sold in `monoTotal`, count of tickets.
- **Primary CTA:** full-width coral button "Nueva nota" with Lucide `plus-circle` (20pt). Height 56, `radii.md`. Haptic `Light` on press.
- **Secondary grid:** 2×2 of `Card.tsx` tiles — Historial, Impresora, Empresa, Ajustes. Icon 24pt coral, label in `h3`, count in `caption`.
- **Empty state** (no tickets today): cream card with mark 64×64, "Todavía no vendiste hoy. Creá la primera nota.", coral CTA.

### 5.2 `NewTicketScreen.tsx`
- **Header:** navy back chevron (Lucide `chevron-left`) + "Nueva nota" in `h2`. No logo here — the user is in task mode.
- **Item list:** rows on `bg.surface`, `radii.md`, subtle shadow. Swipe-to-delete with coral danger reveal.
- **Running total:** sticky bottom bar, navy background, totals in JetBrains Mono `monoTotal` on `text.primary` (which is cream-tinted in dark mode of this bar — use `brand.cream` explicitly here for contrast regardless of mode).
- **CTA:** "Agregar ítem" → `AddItemScreen`. Secondary: "Vista previa" enabled only when ≥1 item.
- **Loading:** skeleton rows (`bg.surfaceAlt` pulsing at 0.5–0.8 opacity, 1200ms cycle).

### 5.3 `AddItemScreen.tsx`
- Form fields with `radii.sm`, 1px `border.subtle`, focus ring `brand.coral` 1.5px. Labels above inputs in `label` style (uppercase).
- Quantity stepper: rounded pill with `−` / `+` coral icons, number in `bodyStrong`.
- **Confirm button:** coral, full-width, sticky bottom. Haptic `Medium` on save.

### 5.4 `PreviewScreen.tsx`
- **Ticket preview** rendered in JetBrains Mono inside a cream paper-like surface with `shadow.float` and a torn-edge top (8pt zig-zag clip or SVG mask).
- Monospace width capped at 32ch to match Font A. 42ch mode toggled by a segmented control at the top ("Normal · Compacto").
- **Print CTA:** coral, full-width, "Imprimir ticket". On tap → `PrintingScreen`.

### 5.5 `PrintingScreen.tsx`
- **Loading:** Reanimated spinner of the Notavo mark rotating at 1 revolution / 1.2s, scale breathing 1.0 → 1.05. Under it: "Imprimiendo…" in `h3`.
- **Success:** mark bounces in (spring, `damping: 12, stiffness: 180`), text changes to "Listo." with a success check. Haptic `Success`. Auto-dismiss after 1.8s back to Dashboard.
- **Error:** mark turns navy, message "No pudimos imprimir. Revisá la conexión." with two CTAs — "Reintentar" (coral) and "Volver" (ghost).

### 5.6 `HistoryScreen.tsx`
- Search bar on top, `radii.full`, `bg.surfaceAlt`.
- Grouped by day (sticky headers in `label` style, `text.muted`).
- Each row: mono total on the right, time + item count on the left, coral reprint icon on long-press.

### 5.7 `PrinterScreen.tsx` & `EmpresaScreen.tsx` & `SettingsScreen.tsx`
- Standard form layout from 5.3.
- `SettingsScreen`: theme toggle segmented control "Claro · Oscuro · Sistema" (persisted via `AsyncStorage`).
- `EmpresaScreen`: logo uploader card shows a cream preview area with the mark placeholder.

### 5.8 Micro-interactions (global)
- All primary CTAs: `Haptics.impactAsync(Light)` on press, Reanimated `scale: 0.97` with spring release.
- Tab bar (`BottomNav`): active icon slides up by 2pt + coral fill fade-in (180ms).
- Ticket save / print success: `Haptics.notificationAsync(Success)` exactly once per action.

---

## 6. Printed Ticket Branding

### 6.1 Header layout (ESC/POS)

```
        [LOGO 128×128 centered]
        <business name, Font A BOLD, CENTER>
        <tagline, Font B, CENTER>
--------------------------------          (32 dashes, Font A)
Nota #0042          2026-04-19 14:37
--------------------------------
```

### 6.2 Body

- Items in **Font B (42 cols)** to fit description + qty + price without truncation.
- Right-align prices. Use `.` as decimal; locale-format via `Intl.NumberFormat('es-AR')` (or es-ES for Spain; detect from device locale and pass through).
- Subtotals, taxes, discounts in **Font A bold**.
- Total in **Font A double-height** (ESC `!` 0x10).

### 6.3 Footer

```
--------------------------------
        ¡Gracias por tu compra!
         <opt-in line>
        Hecho con Notavo
--------------------------------
          [QR if enabled]
         [3x line feed + cut]
```

- **Notavo attribution is opt-in**, off by default. Toggle lives in `SettingsScreen` → "Mostrar 'Hecho con Notavo' en tickets".
- Thank-you line is editable per business in `EmpresaScreen`.

### 6.4 ESC/POS safety rules
- Always end with `\n\n\n` + cut command — low-end printers lose the last line otherwise.
- Never send raw UTF-8 "ñ" / accented chars without first setting the correct code page (CP858 or CP1252 depending on printer — detect or expose a setting).
- Bitmap logo must be pre-rendered at install time (`assets/logo/notavo-mark-mono.png`). Do not generate on-device.

---

## 7. Acceptance Checklist for Sonnet

Sonnet must tick **every** item below before reporting the task complete:

1. [ ] `src/theme/` refactored into `colors.ts`, `typography.ts`, `spacing.ts`, `radii.ts`, `shadows.ts`, `theme.ts`, `ThemeProvider.tsx`, `useTheme.ts`, `index.ts`.
2. [ ] `App.tsx` wraps the tree with `<ThemeProvider>` and theme mode persists across restarts (`AsyncStorage` key `notavo.themeMode`).
3. [ ] Zero hardcoded color hex values in `/src/screens` and `/src/components` (grep verified).
4. [ ] Zero hardcoded `fontSize:`, `padding*:`, `borderRadius:` numeric literals in `/src/screens` and `/src/components` (grep verified; ESC/POS math in `TicketPreview.tsx` exempt with comments).
5. [ ] Inter + JetBrains Mono loaded via `expo-font`; no font rendered in system fallback in a production build.
6. [ ] Lucide is the sole icon set; no leftover imports from other icon packages.
7. [ ] Horizontal logo lockup rendered on Dashboard header; mark rendered in all listed empty states.
8. [ ] Light and dark modes both visually verified on the full flow Dashboard → NewTicket → AddItem → Preview → Printing (success + error states).
9. [ ] Primary CTAs use coral, have Light haptic on press, and a `scale: 0.97` spring animation.
10. [ ] Printed ticket header renders the `notavo-mark-mono.png` bitmap, centered, and the footer respects the opt-in Notavo attribution flag.
11. [ ] All new Spanish microcopy uses tuteo and matches the 5 before/after examples' style.
12. [ ] No regressions: the existing Bluetooth print flow still connects, prints, and saves to history.
13. [ ] `app.json`, `eas.json`, `android/`, `ios/` are **unchanged** in this PR, OR the user explicitly approved each change and the diff was shown first.
14. [ ] `tokens.ts` shim removed in the final commit — no dead code left behind.

---

## 8. Open Decisions Requiring User Input

Before Sonnet can finish, the user must confirm:

1. **Splash screen update** — proceed with cream background + centered mark? (Touches `app.json`.)
2. **App icon update** — ship the new coral-on-cream mark as `icon.png` / `adaptive-icon.png`? (Touches `app.json` + asset replacement.)
3. **Default locale for number/currency formatting** — `es-AR`, `es-ES`, or device-detected?
4. **Notavo attribution on printed tickets** — default ON or OFF? Brief recommends **OFF** (merchant-first), but confirm.

Sonnet: if the user has not answered these by the time you reach the relevant step, **pause and ask**. Do not guess.
