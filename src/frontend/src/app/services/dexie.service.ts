import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class DexieService extends Dexie {

  checkedItems!: Table<CheckedItem, string>;

  constructor() {

    super('devflow');

    this.version(1).stores({
      checkedItems: 'id'
    });

  }

}

interface CheckedItem {
  id: string
}
