export enum Color {
  Blue,
  Green,
  Red,
  Orange,
  Yellow,
  Magenta,
  White
}

/** Mapping of database Color values to CSS palette colors */
export enum PaletteColor {
  Blue = 'accent-blue',
  Green = 'accent-green',
  Red = 'accent-red',
  Orange = 'accent-orange',
  Yellow = 'accent-yellow',
  Magenta = 'accent-magenta',
  White = 'accent-white'
}

export interface ITag {
  label: string,
  color: Color
}