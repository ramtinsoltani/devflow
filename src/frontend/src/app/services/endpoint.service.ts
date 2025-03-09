import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse as GenericHttpErrorResponse, HttpParams } from '@angular/common/http';
import { ICollection, Color, ITag, IItem, ISpace } from '@devflow/models';
import { lastValueFrom } from 'rxjs';
import { environment } from '../environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EndpointService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  /**
   * Generates request headers based on current auth state.
   * @returns Headers object with Authorize header holding a bearer token (if user is logged in)
   */
  private async getAuthorizeHeader(): Promise<Record<string, string>> {

    if ( ! this.auth.currentUser )
      return {};

    return { 'Authorize': 'Bearer ' + await this.auth.currentUser.getIdToken() };

  }

  /**
   * Reads all existing spaces.
   * @returns An array of spaces
   */
  public async getSpaces(): Promise<ISpace[]> {

    return lastValueFrom(this.http.get<ISpace[]>(
      `${environment.apiBaseUrl}/spaces`,
      {
        headers: await this.getAuthorizeHeader()
      }
    ));

  }

  /**
   * Creates a new space.
   * @param data New space request object
   * @returns General message response with `data` as the newly created space ID
   */
  public async createSpace(data: INewSpaceRequest): Promise<IGeneralMessageResponse<string>> {

    return lastValueFrom(this.http.post<IGeneralMessageResponse<string>>(
      `${environment.apiBaseUrl}/space`,
      data,
      { headers: await this.getAuthorizeHeader() }
    ));

  }

  /**
   * Updates an existing space.
   * @param spaceId Space ID
   * @param data Update space request object
   * @returns General message response
   */
  public async updateSpace(spaceId: string, data: Partial<IUpdateSpaceRequest>): Promise<IGeneralMessageResponse> {

    return lastValueFrom(this.http.put<IGeneralMessageResponse>(
      `${environment.apiBaseUrl}/space/${spaceId}`,
      data,
      { headers: await this.getAuthorizeHeader() }
    ));

  }

  /**
   * Deletes an existing space.
   * @param spaceId Space ID
   * @returns General message response
   */
  public async deleteSpace(spaceId: string): Promise<IGeneralMessageResponse> {

    return lastValueFrom(this.http.delete<IGeneralMessageResponse>(
      `${environment.apiBaseUrl}/space/${spaceId}`,
      { headers: await this.getAuthorizeHeader() }
    ));

  }

  /**
   * Reads all existing collections.
   * @param spaceId Space ID
   * @returns An array of collections
   */
  public async getCollections(spaceId: string): Promise<ICollection[]> {

    return lastValueFrom(this.http.get<ICollection[]>(
      `${environment.apiBaseUrl}/${spaceId}/collections`,
      { headers: await this.getAuthorizeHeader() }
    ));

  }

  /**
   * Creates a new collection.
   * @param spaceId Space ID
   * @param data New collection request object
   * @returns General message response with `data` as the newly created collection ID
   */
  public async createCollection(spaceId: string, data: INewCollectionRequest): Promise<IGeneralMessageResponse<string>> {

    return lastValueFrom(this.http.post<IGeneralMessageResponse<string>>(
      `${environment.apiBaseUrl}/${spaceId}/collection`,
      data,
      { headers: await this.getAuthorizeHeader() }
    ));

  }

  /**
   * Updates an existing collection.
   * @param spaceId Space ID
   * @param collectionId Collection ID
   * @param data Update collection request object
   * @returns General message response
   */
  public async updateCollection(spaceId: string, collectionId: string, data: Partial<IUpdateCollectionRequest>): Promise<IGeneralMessageResponse> {

    return lastValueFrom(this.http.put<IGeneralMessageResponse>(
      `${environment.apiBaseUrl}/${spaceId}/collection/${collectionId}`,
      data,
      { headers: await this.getAuthorizeHeader() }
    ));

  }

  /**
   * Deletes an existing collection.
   * @param spaceId Space ID
   * @param collectionId Collection ID
   * @returns 
   */
  public async deleteCollection(spaceId: string, collectionId: string): Promise<IGeneralMessageResponse> {

    return lastValueFrom(this.http.delete<IGeneralMessageResponse>(
      `${environment.apiBaseUrl}/${spaceId}/collection/${collectionId}`,
      { headers: await this.getAuthorizeHeader() }
    ));

  }

  /**
   * Reads an existing item.
   * @param spaceId Space ID
   * @param id Item ID
   * @returns Item object
   */
  public async getItem(spaceId: string, id: string): Promise<IItem> {

    return lastValueFrom(this.http.get<IItem>(
      `${environment.apiBaseUrl}/${spaceId}/item/${id}`,
      { headers: await this.getAuthorizeHeader() }
    ));

  }

  /**
   * Reads all items under an existing collection.
   * @param spaceId Space ID
   * @param collectionId Collection ID
   * @returns Array of item objects
   */
  public async getItems(spaceId: string, collectionId: string): Promise<IItem[]> {

    return lastValueFrom(this.http.get<IItem[]>(
      `${environment.apiBaseUrl}/${spaceId}/items/${collectionId}`,
      { headers: await this.getAuthorizeHeader() }
    ));

  }

  /**
   * Creates a new item under an existing collection.
   * @param spaceId Space ID
   * @param data New item request object
   * @returns General message response with `data` as the newly created item ID
   */
  public async createItem(spaceId: string, data: INewItemRequest): Promise<IGeneralMessageResponse<string>> {

    return lastValueFrom(this.http.post<IGeneralMessageResponse<string>>(
      `${environment.apiBaseUrl}/${spaceId}/item`,
      data,
      { headers: await this.getAuthorizeHeader() }
    ));

  }

  /**
   * Updates an existing item.
   * @param spaceId Space ID
   * @param itemId Item ID
   * @param data Update item request object
   * @returns General message response
   */
  public async updateItem(spaceId: string, itemId: string, data: IUpdateItemRequest): Promise<IGeneralMessageResponse> {

    return lastValueFrom(this.http.put<IGeneralMessageResponse>(
      `${environment.apiBaseUrl}/${spaceId}/item/${itemId}`,
      data,
      { headers: await this.getAuthorizeHeader() }
    ));

  }

  /**
   * Deletes an item.
   * @param spaceId Space ID
   * @param itemId Item ID
   * @returns General message response
   */
  public async deleteItem(spaceId: string, itemId: string): Promise<IGeneralMessageResponse> {

    return lastValueFrom(this.http.delete<IGeneralMessageResponse>(
      `${environment.apiBaseUrl}/${spaceId}/item/${itemId}`,
      { headers: await this.getAuthorizeHeader() }
    ));

  }

  /**
   * Searches spaces.
   * @returns Array of found space objects
   */
  public async searchSpaces(): Promise<ISpace[]>;
  /**
   * Searches spaces.
   * @param q Text search query
   * @returns Array of found space objects
   */
  public async searchSpaces(q: string): Promise<ISpace[]>;
  public async searchSpaces(q?: string): Promise<ISpace[]> {

    let params = new HttpParams();

    if ( q ) params = params.set('q', q);

    return lastValueFrom(this.http.get<ISpace[]>(
      `${environment.apiBaseUrl}/search/spaces`,
      { params, headers: await this.getAuthorizeHeader() }
    ));

  }

  /**
   * Searches collections.
   * @param spaceId Space ID
   * @returns Array of found collection objects
   */
  public async searchCollections(spaceId: string): Promise<ICollection[]>;
  /**
   * Searches collections.
   * @param spaceId Space ID
   * @param q Text search query
   * @returns Array of found collection objects
   */
  public async searchCollections(spaceId: string, q: string): Promise<ICollection[]>;
  public async searchCollections(spaceId: string, q?: string): Promise<ICollection[]> {

    let params = new HttpParams();

    if ( q ) params = params.set('q', q);

    return lastValueFrom(this.http.get<ICollection[]>(
      `${environment.apiBaseUrl}/${spaceId}/search/collections`,
      { params, headers: await this.getAuthorizeHeader() }
    ));

  }

  /**
   * Searches items inside an existing collection.
   * @param spaceId Space ID
   * @param collectionId Collection ID
   * @returns Array of found item objects
   */
  public async searchCollectionItems(spaceId: string, collectionId: string): Promise<IItem[]>;
  /**
   * Searches items inside an existing collection.
   * @param spaceId Space ID
   * @param collectionId Collection ID
   * @param q Text search query
   * @returns Array of found item objects
   */
  public async searchCollectionItems(spaceId: string, collectionId: string, q: string): Promise<IItem[]>;
  /**
   * Searches items inside an existing collection.
   * @param spaceId Space ID
   * @param collectionId Collection ID
   * @param tags Array of tags to include in search
   * @returns Array of found item objects
   */
  public async searchCollectionItems(spaceId: string, collectionId: string, tags: string[]): Promise<IItem[]>;
  /**
   * Searches items inside an existing collection.
   * @param spaceId Space ID
   * @param collectionId Collection ID
   * @param q Text search query
   * @param tags Array of tags to include in search
   * @returns Array of found item objects
   */
  public async searchCollectionItems(spaceId: string, collectionId: string, q: string, tags: string[]): Promise<IItem[]>;
  /**
   * Searches items inside an existing collection.
   * @param spaceId Space ID
   * @param collectionId Collection ID
   * @param q Text search query
   * @param tags Array of tags to include in search
   * @returns Array of found item objects
   */
  public async searchCollectionItems(spaceId: string, collectionId: string, q?: string, tags?: string[]): Promise<IItem[]>;
  public async searchCollectionItems(spaceId: string, collectionId: string, param1?: string | string[], param2?: string[]): Promise<IItem[]> {

    let params = new HttpParams();

    if ( param1 && typeof param1 === 'string' )
      params = params.append('q', param1);
    else if ( param1 && Array.isArray(param1) && param1.length )
      params = params.append('tags', param1.join(','));

    if ( param2?.length )
      params = params.append('tags', param2.join(','));

    return lastValueFrom(this.http.get<IItem[]>(
      `${environment.apiBaseUrl}/${spaceId}/${collectionId}/search/items`,
      { params, headers: await this.getAuthorizeHeader() }
    ));

  }

  /**
   * Searches items across all collections.
   * @param spaceId Space ID
   * @return Array of found item objects
   */
  public async searchItems(spaceId: string): Promise<IItem[]>;
  /**
   * Searches items across all collections.
   * @param spaceId Space ID
   * @param q Text search query
   * @return Array of found item objects
   */
  public async searchItems(spaceId: string, q: string): Promise<IItem[]>;
  /**
   * Searches items across all collections.
   * @param spaceId Space ID
   * @param tags Array of tags to include in search
   * @return Array of found item objects
   */
  public async searchItems(spaceId: string, tags: string[]): Promise<IItem[]>;
  /**
   * Searches items across all collections.
   * @param spaceId Space ID
   * @param q Text search query
   * @param tags Array of tags to include in search
   * @return Array of found item objects
   */
  public async searchItems(spaceId: string, q: string, tags: string[]): Promise<IItem[]>;
  /**
   * Searches items across all collections.
   * @param spaceId Space ID
   * @param q Text search query
   * @param tags Array of tags to include in search
   * @return Array of found item objects
   */
  public async searchItems(spaceId: string, q?: string, tags?: string[]): Promise<IItem[]>;
  public async searchItems(spaceId: string, param1?: string | string[], param2?: string[]): Promise<IItem[]> {

    let params = new HttpParams();

    if ( param1 && typeof param1 === 'string' )
      params = params.append('q', param1);
    else if ( param1 && Array.isArray(param1) && param1.length )
      params = params.append('tags', param1.join(','));

    if ( param2?.length )
      params = params.append('tags', param2.join(','));

    return lastValueFrom(this.http.get<IItem[]>(
      `${environment.apiBaseUrl}/${spaceId}/search/items`,
      { params, headers: await this.getAuthorizeHeader() }
    ));

  }

  /**
   * Fetches the metadata tags of the given URL.
   * @param url A valid URL
   * @returns URL metadata object
   */
  public async fetchMetadata(url: string): Promise<IURLMetadataResponse> {

    return lastValueFrom(this.http.post<any>(
      environment.apiBaseUrl + '/utils/metadata',
      { url },
      { headers: await this.getAuthorizeHeader() }
    ));

  }

}

export interface INewSpaceRequest {
  name: string
}

export interface IUpdateSpaceRequest {
  name: string
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