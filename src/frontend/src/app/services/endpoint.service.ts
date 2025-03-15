import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse as GenericHttpErrorResponse, HttpParams } from '@angular/common/http';
import { ICollection, Color, ITag, IItem, ISpace, IPermission, Permission } from '@devflow/models';
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
  private async getAuthorizationHeader(): Promise<Record<string, string>> {

    if ( ! this.auth.currentUser )
      return {};

    return { 'Authorization': 'Bearer ' + await this.auth.currentUser.getIdToken() };

  }

  /**
   * Reads all existing spaces.
   * @returns An array of spaces
   */
  public async getSpaces(): Promise<ISpace[]> {

    return lastValueFrom(this.http.get<ISpace[]>(
      `${environment.apiBaseUrl}/spaces`,
      {
        headers: await this.getAuthorizationHeader()
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
      { headers: await this.getAuthorizationHeader() }
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
      { headers: await this.getAuthorizationHeader() }
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
      { headers: await this.getAuthorizationHeader() }
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
      { headers: await this.getAuthorizationHeader() }
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
      { headers: await this.getAuthorizationHeader() }
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
      { headers: await this.getAuthorizationHeader() }
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
      { headers: await this.getAuthorizationHeader() }
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
      { headers: await this.getAuthorizationHeader() }
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
      { headers: await this.getAuthorizationHeader() }
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
      { headers: await this.getAuthorizationHeader() }
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
      { headers: await this.getAuthorizationHeader() }
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
      { headers: await this.getAuthorizationHeader() }
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
      { params, headers: await this.getAuthorizationHeader() }
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
      { params, headers: await this.getAuthorizationHeader() }
    ));

  }

  /**
   * Retrieves all permissions provisioned to other users for a space.
   * @param spaceId Space ID
   * @returns An array of permission objects
   */
  public async getProvisionedPermissions(spaceId: string): Promise<IPermission[]> {

    return lastValueFrom(this.http.get<IPermission[]>(
      `${environment.apiBaseUrl}/permissions/provisioned/${spaceId}`,
      { headers: await this.getAuthorizationHeader() }
    ));

  }

  /**
   * Retrieves all permissions granted to the user that are pending acceptance.
   * @returns An array of permission objects
   */
  public async getPendingPermissions(): Promise<IPermission[]> {

    return lastValueFrom(this.http.get<IPermission[]>(
      `${environment.apiBaseUrl}/permissions/pending`,
      { headers: await this.getAuthorizationHeader() }
    ));

  }

  /**
   * Provisions a new permission.
   * @param data New permission data
   * @returns General message response
   */
  public async provisionNewPermission(data: INewPermissionRequest): Promise<IGeneralMessageResponse> {

    return lastValueFrom(this.http.post<IGeneralMessageResponse>(
      `${environment.apiBaseUrl}/permissions/provision`,
      data,
      { headers: await this.getAuthorizationHeader() }
    ));

  }

  /**
   * Accepts a permission granted to the user by another user.
   * @param id Permission ID
   * @returns General message response
   */
  public async acceptPermission(id: string): Promise<IGeneralMessageResponse> {

    return lastValueFrom(this.http.put<IGeneralMessageResponse>(
      `${environment.apiBaseUrl}/permissions/${id}/accept`,
      null,
      { headers: await this.getAuthorizationHeader() }
    ));

  }

  /**
   * Revokes a permission provisioned by the user.
   * @param id Permission ID
   * @returns General message response
   */
  public async revokePermission(id: string): Promise<IGeneralMessageResponse> {

    return lastValueFrom(this.http.delete<IGeneralMessageResponse>(
      `${environment.apiBaseUrl}/permissions/${id}/revoke`,
      { headers: await this.getAuthorizationHeader() }
    ));

  }

  /**
   * Self-revokes a permission granted to the user by another user.
   * @param id Permission ID
   * @returns General message response
   */
  public async selfRevokePermission(id: string): Promise<IGeneralMessageResponse> {

    return lastValueFrom(this.http.delete<IGeneralMessageResponse>(
      `${environment.apiBaseUrl}/permissions/${id}/self-revoke`,
      { headers: await this.getAuthorizationHeader() }
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
      { headers: await this.getAuthorizationHeader() }
    ));

  }

  /**
   * Retrieves the color of an existing tag in the given space.
   * @param spaceId Space ID
   * @param label Tag label to search for
   * @returns Color response
   */
  public async getTagColor(spaceId: string, label: string): Promise<IColorResponse> {

    return lastValueFrom(this.http.get<any>(
      `${environment.apiBaseUrl}/tags/${spaceId}/color/${label}`,
      { headers: await this.getAuthorizationHeader()}
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

export interface INewPermissionRequest {
  spaceId: string,
  grantee: string,
  permission: Permission
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

export interface IColorResponse {
  color: Color | null
}

export interface HttpErrorResponse<T=IErrorResponse> extends GenericHttpErrorResponse {
  error: T
}