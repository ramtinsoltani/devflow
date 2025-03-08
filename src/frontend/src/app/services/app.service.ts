import { Injectable } from '@angular/core';
import { Color, ICollection, ISpace } from '@devflow/models';
import { EndpointService } from './endpoint.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private _collections$ = new BehaviorSubject<ICollection[]>([]);
  private _spaces$ = new BehaviorSubject<ISpace[]>([]);
  public readonly collection$ = new Observable<ICollection[]>(observer => this._collections$.subscribe(v => observer.next(v)).unsubscribe);
  public readonly spaces$ = new Observable<ISpace[]>(observer => this._spaces$.subscribe(v => observer.next(v)).unsubscribe);

  constructor(
    private endpoint: EndpointService
  ) { }

  public async fetchSpaces(): Promise<void> {

    try {
      
      this._spaces$.next(await this.endpoint.getSpaces());

    }
    catch (error) {

      throw error;

    }

  }

  /**
   * Fetches collections from the API server and emits the new result from `collection$` observable.
   * @param spaceId Space ID
   */
  public async fetchCollections(spaceId: string): Promise<void> {

    try {

      this._collections$.next(await this.endpoint.getCollections(spaceId));

    }
    catch (error) {

      throw error;

    }

  }

  /**
   * Updates a collection size.
   * @param collectionId Collection ID
   * @param newSize New collection size
   */
  public updateCollectionSize(collectionId: string, newSize: number): void {

    const collection = this._collections$.getValue().find(c => c.id === collectionId);

    if ( ! collection )
      throw new Error(`Cannot update collection size with ID "${ collectionId }"!`);

    collection.size = newSize;

    this._collections$.next(this._collections$.getValue());

  }

  /**
   * Returns the current size of a collection.
   * @param collectionId Collection ID
   * @returns Collection size
   */
  public getCollectionSize(collectionId: string): number {

    const collection = this._collections$.getValue().find(c => c.id === collectionId);

    if ( ! collection )
      throw new Error('Cannot read collection size with ID "${ collectionId }"!');

    return collection.size;

  }

  /**
   * Returns the Color value of a collection (or `null` if not found).
   * @param collectionId Collection ID
   * @returns Color value or `null`
   */
  public getCollectionColor(collectionId: string): Color | null {

    return this._collections$.getValue()?.find(c => c.id === collectionId)?.color ?? null;

  }

}
