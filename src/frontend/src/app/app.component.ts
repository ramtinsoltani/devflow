import { Component, ViewContainerRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent, SidepaneComponent, ModalComponent, NotificationComponent } from '@devflow/components';
import { ModalService, NotificationService } from './services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidepaneComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  @ViewChild('modalsContainer', { read: ViewContainerRef })
  private modalsContainer!: ViewContainerRef;

  @ViewChild('notificationsContainer', { read: ViewContainerRef })
  private notificationsContainer!: ViewContainerRef;

  constructor(
    private modals: ModalService,
    private notifications: NotificationService
  ) {

    // Dynamically create modals when modal service emits
    this.modals.onOpenModal.subscribe(modalDef => {

      const ref = this.modalsContainer.createComponent(ModalComponent);

      ref.setInput('title', modalDef.title);
      ref.setInput('buttons', modalDef.buttons);
      ref.setInput('content', modalDef.content);

      if ( modalDef.data )
        ref.setInput('data', modalDef.data);

      if ( modalDef.options )
        ref.setInput('options', modalDef.options);

      // Destroy modal on modal's close event
      const sub = ref.instance.onModalClose.subscribe(() => {

        const index = this.modalsContainer.indexOf(ref.hostView);

        if ( index != -1 )
          this.modalsContainer.remove(index);

        if ( sub && ! sub.closed )
          sub.unsubscribe();

      });

    });

    // Create notifications when the service emits
    this.notifications.onNotification.subscribe(notificationDef => {

      const ref = this.notificationsContainer.createComponent(NotificationComponent);

      ref.setInput('type', notificationDef.type);
      ref.setInput('message', notificationDef.message);

      // Destroy notification when its event emits
      const sub = ref.instance.onDestroy.subscribe(() => {

        if ( sub && ! sub.closed )
          sub.unsubscribe();

        const index = this.notificationsContainer.indexOf(ref.hostView);

        if ( index != -1 )
          this.notificationsContainer.remove(index);

      });

    });

  }

}
