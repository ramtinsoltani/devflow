import { Injectable } from '@angular/core';
import { Color, ICollection, IPermission, ISpace, Permission } from '@devflow/models';
import { EndpointService } from './endpoint.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private _collections$ = new BehaviorSubject<ICollection[]>([]);
  private _spaces$ = new BehaviorSubject<ISpace[]>([]);
  private _invitations$ = new BehaviorSubject<IPermission[]>([]);
  
  public readonly collection$ = this._collections$.asObservable();
  public readonly spaces$ = this._spaces$.asObservable();
  public readonly invitations$ = this._invitations$.asObservable();

  constructor(
    private endpoint: EndpointService
  ) { }

  /**
   * Fetches spaces from the API server and emits the new result from `spaces$` observable.
   */
  public async fetchSpaces(): Promise<void> {

    this._spaces$.next(await this.endpoint.getSpaces());

  }

  /**
   * Fetches collections from the API server and emits the new result from `collection$` observable.
   * @param spaceId Space ID
   */
  public async fetchCollections(spaceId: string): Promise<void> {

    this._collections$.next(await this.endpoint.getCollections(spaceId));

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

  /**
   * Fetches permissions granted to this user that are pending acceptance and emits the new result from `invitations$` observable.
   */
  public async fetchInvitations(): Promise<void> {

    this._invitations$.next(await this.endpoint.getPendingPermissions());

  }

  /**
   * Updates an invitation/permission by sending the correct request to the API server and updates the invitations locally and emits the new value from `invitations$` observable.
   * @param permission Permission object
   * @param action Either `accept` or `reject`
   */
  public async updateInvitation(permission: IPermission, action: 'accept' | 'reject'): Promise<void> {

    if ( action === 'accept' )
      await this.endpoint.acceptPermission(permission.id);
    else
      await this.endpoint.selfRevokePermission(permission.id);

    const updatedPermissions = this._invitations$.value;
    let index = updatedPermissions.findIndex(p => p.id === permission.id);

    if ( index !== -1 ) {

      updatedPermissions.splice(index, 1);
      this._invitations$.next(updatedPermissions);

    }

    await this.fetchSpaces();

  }

  /**
   * Checks if current user has write permission for a given space (only if the space is loaded in cache).
   * @param spaceId Space ID
   * @returns Boolean indicating if write permission is granted or not
   */
  public isWritePermissionGranted(spaceId: string): boolean {

    const space = this._spaces$.value.find(s => s.id === spaceId);

    return !! space && (! space.shared || space.permission === Permission.CanModifyContent);

  }

}
