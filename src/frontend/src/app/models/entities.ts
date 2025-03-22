import { Color, ITag, Permission } from '@devflow/models';

export interface ICommonDocument {
  owner: string,
  id: string,
  updatedAt: number,
  createdAt: number
}

export interface IOrderedDocument {
  order?: number
}

export interface ISpace extends ICommonDocument, IOrderedDocument {
  name: string,
  shared?: true,
  permission?: Permission
}

export interface ICollection extends ICommonDocument, IOrderedDocument {
  spaceId: string,
  name: string,
  color: Color,
  size: number
}

export interface IItem extends ICommonDocument, IOrderedDocument {
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

export interface IPermission extends ICommonDocument {
  grantedTo: string,
  spaceId: string,
  spaceName: string,
  permission: Permission,
  granteeName?: string,
  granteeEmail: string,
  provisionerName?: string,
  provisionerEmail: string,
  accepted: boolean
}