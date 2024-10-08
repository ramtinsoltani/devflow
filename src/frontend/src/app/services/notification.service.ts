import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  public onNotification = new EventEmitter<NotificationDef>();

  constructor() { }

  /**
   * Creates a new notification.
   * @param def Notification definition
   */
  public create(def: NotificationDef): void {

    this.onNotification.emit(def);

  }

}

export interface NotificationDef {
  type: 'error' | 'info',
  message: string
}
