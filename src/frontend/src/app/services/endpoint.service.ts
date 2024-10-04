import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse as GenericHttpErrorResponse, HttpParams } from '@angular/common/http';
import { ICollection, Color, ITag, IItem } from '@devflow/models';
import { lastValueFrom } from 'rxjs';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class EndpointService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Reads all existing collections.
   * @returns An array of collections
   */
  public getCollections(): Promise<ICollection[]> {

    return lastValueFrom(this.http.get<ICollection[]>(
      environment.apiBaseUrl + '/collections'
    ));

  }

  /**
   * Creates a new collection.
   * @param data New collection request object
   * @returns General message response with `data` as the newly created collection ID
   */
  public createCollection(data: INewCollectionRequest): Promise<IGeneralMessageResponse<string>> {

    return lastValueFrom(this.http.post<IGeneralMessageResponse<string>>(
      environment.apiBaseUrl + '/collection',
      data
    ));

  }

  /**
   * Updates an existing collection.
   * @param collectionId Collection ID
   * @param data Update collection request object
   * @returns General message response
   */
  public updateCollection(collectionId: string, data: Partial<IUpdateCollectionRequest>): Promise<IGeneralMessageResponse> {

    return lastValueFrom(this.http.put<IGeneralMessageResponse>(
      environment.apiBaseUrl + '/collection/' + collectionId,
      data
    ));

  }

  /**
   * Deletes an existing collection.
   * @param collectionId Collection ID
   * @returns 
   */
  public deleteCollection(collectionId: string): Promise<IGeneralMessageResponse> {

    return lastValueFrom(this.http.delete<IGeneralMessageResponse>(
      environment.apiBaseUrl + '/collection/' + collectionId
    ));

  }

  /**
   * Reads an existing item.
   * @param id Item ID
   * @returns Item object
   */
  public getItem(id: string): Promise<IItem> {

    return lastValueFrom(this.http.get<IItem>(
      environment.apiBaseUrl + '/item/' + id
    ));

  }

  /**
   * Reads all items under an existing collection.
   * @param collectionId Collection ID
   * @returns Array of item objects
   */
  public getItems(collectionId: string): Promise<IItem[]> {

    return lastValueFrom(this.http.get<IItem[]>(
      environment.apiBaseUrl + '/items/' + collectionId
    ));

  }

  /**
   * Creates a new item under an existing collection.
   * @param data New item request object
   * @returns General message response with `data` as the newly created item ID
   */
  public createItem(data: INewItemRequest): Promise<IGeneralMessageResponse<string>> {

    return lastValueFrom(this.http.post<IGeneralMessageResponse<string>>(
      environment.apiBaseUrl + '/item',
      data
    ));

  }

  /**
   * Updates an existing item.
   * @param itemId Item ID
   * @param data Update item request object
   * @returns General message response
   */
  public updateItem(itemId: string, data: IUpdateItemRequest): Promise<IGeneralMessageResponse> {

    return lastValueFrom(this.http.put<IGeneralMessageResponse>(
      environment.apiBaseUrl + '/item/' + itemId,
      data
    ));

  }

  /**
   * Deletes an item.
   * @param itemId Item ID
   * @returns General message response
   */
  public deleteItem(itemId: string): Promise<IGeneralMessageResponse> {

    return lastValueFrom(this.http.delete<IGeneralMessageResponse>(
      environment.apiBaseUrl + '/item/' + itemId
    ));

  }

  /**
   * Searches collections.
   * @returns Array of found collection objects
   */
  public searchCollections(): Promise<ICollection[]>;
  /**
   * Searches collections.
   * @param q Text search query
   * @returns Array of found collection objects
   */
  public searchCollections(q: string): Promise<ICollection[]>;
  public searchCollections(q?: string): Promise<ICollection[]> {

    let params = new HttpParams();

    if ( q ) params = params.set('q', q);

    return lastValueFrom(this.http.get<ICollection[]>(
      environment.apiBaseUrl + '/search/collections',
      { params }
    ));

  }

  /**
   * Searches items inside an existing collection.
   * @param collectionId Collection ID
   * @returns Array of found item objects
   */
  public searchCollectionItems(collectionId: string): Promise<IItem[]>;
  /**
   * Searches items inside an existing collection.
   * @param collectionId Collection ID
   * @param q Text search query
   * @returns Array of found item objects
   */
  public searchCollectionItems(collectionId: string, q: string): Promise<IItem[]>;
  /**
   * Searches items inside an existing collection.
   * @param collectionId Collection ID
   * @param tags Array of tags to include in search
   * @returns Array of found item objects
   */
  public searchCollectionItems(collectionId: string, tags: string[]): Promise<IItem[]>;
  /**
   * Searches items inside an existing collection.
   * @param collectionId Collection ID
   * @param q Text search query
   * @param tags Array of tags to include in search
   * @returns Array of found item objects
   */
  public searchCollectionItems(collectionId: string, q: string, tags: string[]): Promise<IItem[]>;
  /**
   * Searches items inside an existing collection.
   * @param collectionId Collection ID
   * @param q Text search query
   * @param tags Array of tags to include in search
   * @returns Array of found item objects
   */
  public searchCollectionItems(collectionId: string, q?: string, tags?: string[]): Promise<IItem[]>;
  public searchCollectionItems(collectionId: string, param1?: string | string[], param2?: string[]): Promise<IItem[]> {

    let params = new HttpParams();

    if ( param1 && typeof param1 === 'string' )
      params = params.append('q', param1);
    else if ( param1 && Array.isArray(param1) && param1.length )
      params = params.append('tags', param1.join(','));

    if ( param2?.length )
      params = params.append('tags', param2.join(','));

    return lastValueFrom(this.http.get<IItem[]>(
      environment.apiBaseUrl + '/search/items/' + collectionId,
      { params }
    ));

  }

  /**
   * Searches items across all collections.
   * @return Array of found item objects
   */
  public searchItems(): Promise<IItem[]>;
  /**
   * Searches items across all collections.
   * @param q Text search query
   * @return Array of found item objects
   */
  public searchItems(q: string): Promise<IItem[]>;
  /**
   * Searches items across all collections.
   * @param tags Array of tags to include in search
   * @return Array of found item objects
   */
  public searchItems(tags: string[]): Promise<IItem[]>;
  /**
   * Searches items across all collections.
   * @param q Text search query
   * @param tags Array of tags to include in search
   * @return Array of found item objects
   */
  public searchItems(q: string, tags: string[]): Promise<IItem[]>;
  /**
   * Searches items across all collections.
   * @param q Text search query
   * @param tags Array of tags to include in search
   * @return Array of found item objects
   */
  public searchItems(q?: string, tags?: string[]): Promise<IItem[]>;
  public searchItems(param1?: string | string[], param2?: string[]): Promise<IItem[]> {

    let params = new HttpParams();

    if ( param1 && typeof param1 === 'string' )
      params = params.append('q', param1);
    else if ( param1 && Array.isArray(param1) && param1.length )
      params = params.append('tags', param1.join(','));

    if ( param2?.length )
      params = params.append('tags', param2.join(','));

    return lastValueFrom(this.http.get<IItem[]>(
      environment.apiBaseUrl + '/search/items',
      { params }
    ));

  }

  /**
   * Fetches the metadata tags of the given URL.
   * @param url A valid URL
   * @returns URL metadata object
   */
  public fetchMetadata(url: string): Promise<IURLMetadataResponse> {

    return lastValueFrom(this.http.post<any>(
      environment.apiBaseUrl + '/utils/metadata',
      { url }
    ));

  }

}

export interface INewCollectionRequest {
  name: string,
  color: Color
}

export interface IUpdateCollectionRequest {
  name?: string,
  color?: Color
}

export interface INewItemRequest {
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

export interface IUpdateItemRequest {
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

export interface IGeneralMessageResponse<T=undefined> {
  message: string,
  data: T
}

export interface IErrorResponse {
  code: string,
  message: string
}

export interface IURLMetadataResponse {
  title?: string,
  description?: string,
  posterUrl?: string,
  originTitle?: string,
  originUrl?: string,
  favicon?: string
}

export interface HttpErrorResponse<T=IErrorResponse> extends GenericHttpErrorResponse {
  error: T
}