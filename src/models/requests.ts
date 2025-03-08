import { Color, ITag } from './normalized';
import { Request } from 'express';

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

export interface IRequestFetchMetadata {
  url: string
}

export type NewSpaceRequest = Request<any, any, IRequestNewSpace>;
export type UpdateSpaceRequest = Request<{ id: string }, any, IRequestUpdateSpace>;
export type DeleteSpaceRequest = Request<{ id: string }>;
export type GetCollectionsRequest = Request<{ spaceId: string }>;
export type NewCollectionRequest = Request<{ spaceId: string }, any, IRequestNewCollection>;
export type UpdateCollectionRequest = Request<{ spaceId: string, id: string }, any, IRequestUpdateCollection>;
export type DeleteCollectionRequest = Request<{ spaceId: string, id: string }>;
export type GetItemRequest = Request<{ spaceId: string, id: string }>;
export type GetItemsRequest = Request<{ spaceId: string, collectionId: string }>;
export type NewItemRequest = Request<{ spaceId: string }, any, IRequestNewItem>;
export type UpdateItemRequest = Request<{ spaceId: string, id: string }, any, IRequestUpdateItem>;
export type DeleteItemRequest = Request<{ spaceId: string, id: string }>;
export type SearchSpacesRequest = Request<any, any, any, { q: string }>;
export type SearchCollectionsRequest = Request<{ spaceId: string }, any, any, { q: string }>;
export type SearchCollectionItemsRequest = Request<{ spaceId: string, collectionId: string }, any, any, { q: string, tags: string[] }>;
export type SearchItemsRequest = Request<{ spaceId: string }, any, any, { q: string, tags: string[] }>;
export type FetchMetadataRequest = Request<any, any, IRequestFetchMetadata>;