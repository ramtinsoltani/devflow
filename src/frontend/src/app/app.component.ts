import { Component, ViewContainerRef, ViewChild, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent, SidepaneComponent, ModalComponent, NotificationComponent } from '@devflow/components';
import { AppService, AuthService, ModalService, NotificationService } from './services';
import { User } from 'firebase/auth';
import { FloatingButtonComponent } from './components/shared/floating-button/floating-button.component';
import { HelpModalComponent } from './components/modals/help/help.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidepaneComponent,
    FloatingButtonComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  private modalsOpen: number = 0;

  public currentUser?: User;

  @ViewChild('modalsContainer', { read: ViewContainerRef })
  private modalsContainer!: ViewContainerRef;

  @ViewChild('notificationsContainer', { read: ViewContainerRef })
  private notificationsContainer!: ViewContainerRef;

  @HostListener('body:keyup', ['$event'])
  public onKeyUp(event: KeyboardEvent): void {

    if ( this.modalsOpen )
      return;

    this.app.processKeyboardEvent(event);

  }

  @HostListener('paste', ['$event'])
  public onPaste(event: ClipboardEvent): void {
    
    if ( this.modalsOpen )
      return;

    this.app.processKeyboardEvent(event);
    
  }

  constructor(
    private modals: ModalService,
    private notifications: NotificationService,
    private auth: AuthService,
    private app: AppService
  ) {

    this.auth.onAuthStateChanged$.subscribe(user => this.currentUser = user || undefined);

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

        if ( index != -1 ) {

          this.modalsContainer.remove(index);
          this.modalsOpen--;

        }

        if ( sub && ! sub.closed )
          sub.unsubscribe();

      });

      this.modalsOpen++;

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

  public onHelpButtonClick(): void {

    this.modals.openModal('Help', HelpModalComponent, [
      { label: 'Close', type: 'secondary', closesModal: true }
    ]);

  }

}
