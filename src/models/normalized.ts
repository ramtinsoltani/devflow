export enum Color {
  Blue,
  Green,
  Red,
  Orange,
  Yellow,
  Magenta,
  White
}

export interface ITag {
  label: string,
  color: Color
}

export interface ICommonDocument {
  id: string,
  createdAt: number,
  updatedAt: number
}

export interface IItem extends ICommonDocument {
  collectionId: string,
  title: string,
  url: string,
  description?: string,
  posterUrl?: string,
  tags: ITag[]
}

export interface ICollection extends ICommonDocument {
  name: string,
  color: Color,
  size: number
}