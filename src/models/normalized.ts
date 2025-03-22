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
  owner: string,
  id: string,
  createdAt: number,
  updatedAt: number
}

export interface IOrderedDocument {
  order?: number
}

export interface IItem extends ICommonDocument, IOrderedDocument {
  spaceId: string,
  collectionId: string,
  title: string,
  url: string,
  description?: string,
  posterUrl?: string,
  tags: ITag[]
}

export interface ICollection extends ICommonDocument, IOrderedDocument {
  spaceId: string,
  name: string,
  color: Color,
  size: number
}

export interface ISpace extends ICommonDocument, IOrderedDocument {
  name: string,
  /** Virtual field */
  shared?: true,
  /** Virtual field */
  permission?: Permission
}

export interface IPermission extends ICommonDocument {
  spaceId: string,
  spaceName: string,
  grantedTo: string,
  granteeName?: string,
  granteeEmail: string,
  provisionerName?: string,
  provisionerEmail: string,
  permission: Permission,
  accepted: boolean
}

export enum Permission {
  ReadOnly = 'read',
  CanModifyContent = 'write'
}