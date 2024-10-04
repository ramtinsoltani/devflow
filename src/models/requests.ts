import { Color, ITag } from './normalized';
import { Request } from 'express';

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

export type NewCollectionRequest = Request<any, any, IRequestNewCollection>;
export type UpdateCollectionRequest = Request<{ id: string }, any, IRequestUpdateCollection>;
export type DeleteCollectionRequest = Request<{ id: string }>;
export type GetItemRequest = Request<{ id: string }>;
export type GetItemsRequest = Request<{ collectionId: string }>;
export type NewItemRequest = Request<any, any, IRequestNewItem>;
export type UpdateItemRequest = Request<{ id: string }, any, IRequestUpdateItem>;
export type DeleteItemRequest = Request<{ id: string }>;
export type SearchCollectionsRequest = Request<any, any, any, { q: string }>;
export type SearchCollectionItemsRequest = Request<{ collectionId: string }, any, any, { q: string, tags: string[] }>;
export type SearchItemsRequest = Request<any, any, any, { q: string, tags: string[] }>;
export type FetchMetadataRequest = Request<any, any, IRequestFetchMetadata>;