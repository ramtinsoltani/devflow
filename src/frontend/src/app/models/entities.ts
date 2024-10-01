import { Color, ITag } from '@devflow/models';

export interface ICommonDocument {
  id: string,
  updatedAt: number,
  createdAt: number
}

export interface ICollection extends ICommonDocument {
  name: string,
  color: Color,
  size: number
}

export interface IItem extends ICommonDocument {
  collectionId: string,
  title: string,
  url: string,
  description?: string,
  posterUrl?: string,
  tags: ITag[]
}