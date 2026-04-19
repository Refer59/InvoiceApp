type ColorGroup = {
  [key: string]: string;
};

type ColorsType = {
  brand: ColorGroup;
  semantic: ColorGroup;
  bg: ColorGroup;
  border: ColorGroup;
  text: ColorGroup;
};

export const colorsLight: ColorsType = {
  brand: {
    logo: '#E8702E',        // brand mark — always warm coral, never changes with theme
    primary: '#3B6AEA',     // CTA, active states, highlights
    primarySoft: '#EBF0FD', // soft fills, badges, selected rows
    primaryInk: '#1E3FA8',  // text on primarySoft, pressed CTA
    deep: '#1A336B',        // headers, icon ink, deepest brand blue
    subtle: '#E4EAF8',      // blue-tinted surface for cards on base
    tint: '#EEF2FB',        // hero / empty-state surface (replaces warm cream)
  },
  semantic: {
    success: '#1F9D55',
    warning: '#C69026',
    danger: '#D64545',
    info: '#2D6EC9',
  },
  bg: {
    base: '#FAF7F1',        // shifted from warm FAF7F1 to cool blue-white
    surface: '#FFFFFF',
    surfaceAlt: '#EEF2FB',  // shifted from warm F1EEE7 to cool blue-grey
  },
  border: {
    subtle: '#D8E0F0',      // shifted from warm E8E2D3 to cool blue-grey
    strong: '#B8C6E0',      // shifted from warm CFC7B4 to cool blue-grey
  },
  text: {
    primary: '#1A336B',     // same as brand.deep — strong blue-navy for text
    secondary: '#4A5A7A',   // mid-tone blue-grey
    muted: '#7A88A8',       // muted blue-grey
    onPrimary: '#FFFFFF',
  },
} as const;

export const colorsDark: ColorsType = {
  brand: {
    logo: '#E8702E',
    primary: '#7696e0',
    primarySoft: '#172341',
    primaryInk: '#93aae0',
    deep: '#B8CCEE',        // light blue for dark mode (was navy: '#E6ECF7')
    subtle: '#1E2D4A',      // dark blue-tinted surface (was navySoft: '#2A3757')
    tint: '#141D33',        // darkest brand surface (was cream: '#262f4c')
  },
  semantic: {
    success: '#3FC77A',
    warning: '#E5B04A',
    danger: '#F07070',
    info: '#6AA6F0',
  },
  bg: {
    base: '#0F1117',
    surface: '#181B23',
    surfaceAlt: '#20242E',
  },
  border: {
    subtle: '#2A2F3A',
    strong: '#3A4150',
  },
  text: {
    primary: '#F2F4F8',
    secondary: '#B7BDC8',
    muted: '#7E8596',
    onPrimary: '#16110C',
  },
};
