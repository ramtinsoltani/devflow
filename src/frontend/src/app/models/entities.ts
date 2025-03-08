import { Color, ITag } from '@devflow/models';

export interface ICommonDocument {
  id: string,
  updatedAt: number,
  createdAt: number
}

export interface ISpace extends ICommonDocument {
  name: string
}

export interface ICollection extends ICommonDocument {
  spaceId: string,
  name: string,
  color: Color,
  size: number
}

export interface IItem extends ICommonDocument {
  spaceId: string,
  collectionId: string,
  title: string,
  url: string,
  description?: string,
  posterUrl?: string,
  tags: ITag[],
  originTitle?: string,
  originUrl?: string,
  favicon?: string,
  forceAltLayout: boolean
}