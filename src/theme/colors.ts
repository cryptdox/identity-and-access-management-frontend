/**
 * Raw brand palette — single source of truth. Semantic light/dark mapping lives in
 * `tokens.css` as CSS custom properties; this file exists for the rare case a color
 * is needed in JS (charts, inline SVG fills, etc.) rather than via a Tailwind class.
 */
export const palette = {
  protossPylon: '#00a8ff',
  periwinkle: '#9c88ff',
  riseNShine: '#fbc531',
  downloadProgress: '#4cd137',
  seabrook: '#487eb0',
  vanadylBlue: '#0097e6',
  mattPurple: '#8c7ae6',
  nanohanachaGold: '#e1b12c',
  skirretGreen: '#44bd32',
  naval: '#40739e',
  nasturcianFlower: '#e84118',
  lynxWhite: '#f5f6fa',
  blueberrySoda: '#7f8fa6',
  mazarineBlue: '#273c75',
  blueNights: '#353b48',
  harleyDavidsonOrange: '#c23616',
  hintOfPensive: '#dcdde1',
  chainGangGray: '#718093',
  picoVoid: '#192a56',
  electromagnetic: '#2f3640',
} as const

export type PaletteKey = keyof typeof palette

export const semanticColors = {
  light: {
    primary: palette.vanadylBlue,
    secondary: palette.mattPurple,
    success: palette.skirretGreen,
    warning: palette.nanohanachaGold,
    danger: palette.harleyDavidsonOrange,
    info: palette.naval,
    bg: palette.lynxWhite,
    surface: '#ffffff',
    sidebar: palette.mazarineBlue,
    border: palette.hintOfPensive,
    text: palette.electromagnetic,
    textSecondary: palette.chainGangGray,
  },
  dark: {
    primary: palette.protossPylon,
    secondary: palette.periwinkle,
    success: palette.downloadProgress,
    warning: palette.riseNShine,
    danger: palette.nasturcianFlower,
    info: palette.seabrook,
    bg: palette.electromagnetic,
    surface: palette.blueNights,
    sidebar: palette.picoVoid,
    border: palette.blueNights,
    text: palette.lynxWhite,
    textSecondary: palette.blueberrySoda,
  },
} as const

export type ThemeMode = keyof typeof semanticColors
