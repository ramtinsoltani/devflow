import { Injectable } from '@angular/core';
import { Color, ICollection } from '@devflow/models';
import { EndpointService } from './endpoint.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private _collections$ = new BehaviorSubject<ICollection[]>([]);
  public readonly collection$ = new Observable<ICollection[]>(observer => this._collections$.subscribe(v => observer.next(v)).unsubscribe);

  constructor(
    private endpoint: EndpointService
  ) { }

  /**
   * Fetches collections from the API server and emits the new result from `collection$` observable.
   */
  public async fetchCollections(): Promise<void> {

    try {

      this._collections$.next(await this.endpoint.getCollections());

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
