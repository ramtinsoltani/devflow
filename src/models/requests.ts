import { DecodedIdToken } from 'firebase-admin/auth';
import { Color, ITag, Permission } from './normalized';
import { Request } from 'express';

export interface AuthorizedRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any> extends Request<P, ResBody, ReqBody, ReqQuery> {
  token: DecodedIdToken
}

export interface IRequestNewSpace {
  name: string
}

export interface IRequestUpdateSpace {
  name: string
}

export interface IRequestNewCollection {
  name: string,
  color: Color
}

export interface IRequestUpdateCollection {
  name?: string,
  color?: Color
}

export interface IRequestNewItem {
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

export interface IRequestUpdateItem {
  title?: string,
  url?: string,
  description?: string | null,
  posterUrl?: string | null,
  tags?: ITag[],
  originTitle?: string | null,
  originUrl?: string | null,
  favicon?: string | null,
  forceAltLayout: boolean
}

export interface IRequestNewPermission {
  spaceId: string,
  grantee: string,
  permission: Permission
}

export interface IRequestFetchMetadata {
  url: string
}

export type NewSpaceRequest = AuthorizedRequest<any, any, IRequestNewSpace>;
export type UpdateSpaceRequest = AuthorizedRequest<{ id: string }, any, IRequestUpdateSpace>;
export type DeleteSpaceRequest = AuthorizedRequest<{ id: string }>;
export type GetCollectionsRequest = AuthorizedRequest<{ spaceId: string }>;
export type NewCollectionRequest = AuthorizedRequest<{ spaceId: string }, any, IRequestNewCollection>;
export type UpdateCollectionRequest = AuthorizedRequest<{ spaceId: string, id: string }, any, IRequestUpdateCollection>;
export type DeleteCollectionRequest = AuthorizedRequest<{ spaceId: string, id: string }>;
export type GetItemRequest = AuthorizedRequest<{ spaceId: string, id: string }>;
export type GetItemsRequest = AuthorizedRequest<{ spaceId: string, collectionId: string }>;
export type NewItemRequest = AuthorizedRequest<{ spaceId: string }, any, IRequestNewItem>;
export type UpdateItemRequest = AuthorizedRequest<{ spaceId: string, id: string }, any, IRequestUpdateItem>;
export type DeleteItemRequest = AuthorizedRequest<{ spaceId: string, id: string }>;
export type SearchSpacesRequest = AuthorizedRequest<any, any, any, { q: string }>;
export type SearchCollectionsRequest = AuthorizedRequest<{ spaceId: string }, any, any, { q: string }>;
export type SearchCollectionItemsRequest = AuthorizedRequest<{ spaceId: string, collectionId: string }, any, any, { q: string, tags: string[] }>;
export type SearchItemsRequest = AuthorizedRequest<{ spaceId: string }, any, any, { q: string, tags: string[] }>;
export type GetProvisionedPermissionsRequest = AuthorizedRequest<{ spaceId: string }>;
export type NewPermissionRequest = AuthorizedRequest<any, any, IRequestNewPermission>;
export type AcceptPermissionRequest = AuthorizedRequest<{ id: string }>;
export type RevokePermissionRequest = AuthorizedRequest<{ id: string }>;
export type SelfRevokePermissionRequest = AuthorizedRequest<{ id: string }>;
export type FetchMetadataRequest = AuthorizedRequest<any, any, IRequestFetchMetadata>;
export type GetTagColorRequest = AuthorizedRequest<{ spaceId: string, label: string }>;