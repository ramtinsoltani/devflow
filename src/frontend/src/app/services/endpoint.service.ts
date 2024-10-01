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

  public getCollections(): Promise<ICollection[]> {

    return lastValueFrom(this.http.get<ICollection[]>(
      environment.apiBaseUrl + '/collections'
    ));

  }

  public createCollection(data: INewCollectionRequest): Promise<IGeneralMessageResponse<string>> {

    return lastValueFrom(this.http.post<IGeneralMessageResponse<string>>(
      environment.apiBaseUrl + '/collection',
      data
    ));

  }

  public updateCollection(collectionId: string, data: Partial<IUpdateCollectionRequest>): Promise<IGeneralMessageResponse> {

    return lastValueFrom(this.http.put<IGeneralMessageResponse>(
      environment.apiBaseUrl + '/collection/' + collectionId,
      data
    ));

  }

  public deleteCollection(collectionId: string): Promise<IGeneralMessageResponse> {

    return lastValueFrom(this.http.delete<IGeneralMessageResponse>(
      environment.apiBaseUrl + '/collection/' + collectionId
    ));

  }

  public getItem(id: string): Promise<IItem> {

    return lastValueFrom(this.http.get<IItem>(
      environment.apiBaseUrl + '/item/' + id
    ));

  }

  public getItems(collectionId: string): Promise<IItem[]> {

    return lastValueFrom(this.http.get<IItem[]>(
      environment.apiBaseUrl + '/items/' + collectionId
    ));

  }

  public createItem(data: INewItemRequest): Promise<IGeneralMessageResponse<string>> {

    return lastValueFrom(this.http.post<IGeneralMessageResponse<string>>(
      environment.apiBaseUrl + '/item',
      data
    ));

  }

  public updateItem(itemId: string, data: IUpdateItemRequest): Promise<IGeneralMessageResponse> {

    return lastValueFrom(this.http.put<IGeneralMessageResponse>(
      environment.apiBaseUrl + '/item/' + itemId,
      data
    ));

  }

  public deleteItem(itemId: string): Promise<IGeneralMessageResponse> {

    return lastValueFrom(this.http.delete<IGeneralMessageResponse>(
      environment.apiBaseUrl + '/item/' + itemId
    ));

  }

  public searchCollections(): Promise<ICollection[]>;
  public searchCollections(q: string): Promise<ICollection[]>;
  public searchCollections(q?: string): Promise<ICollection[]> {

    let params = new HttpParams();

    if ( q ) params = params.set('q', q);

    return lastValueFrom(this.http.get<ICollection[]>(
      environment.apiBaseUrl + '/search/collections',
      { params }
    ));

  }

  public searchCollectionItems(collectionId: string): Promise<IItem[]>;
  public searchCollectionItems(collectionId: string, q: string): Promise<IItem[]>;
  public searchCollectionItems(collectionId: string, tags: string[]): Promise<IItem[]>;
  public searchCollectionItems(collectionId: string, q: string, tags: string[]): Promise<IItem[]>;
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

  public searchItems(): Promise<IItem[]>;
  public searchItems(q: string): Promise<IItem[]>;
  public searchItems(tags: string[]): Promise<IItem[]>;
  public searchItems(q: string, tags: string[]): Promise<IItem[]>;
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
  tags: ITag[]
}

export interface IUpdateItemRequest {
  title?: string,
  url?: string,
  description?: string | null,
  posterUrl?: string | null,
  tags?: ITag[]
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
  posterUrl?: string
}

export interface HttpErrorResponse<T=IErrorResponse> extends GenericHttpErrorResponse {
  error: T
}