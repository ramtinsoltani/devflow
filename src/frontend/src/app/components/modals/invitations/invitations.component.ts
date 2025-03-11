import { Component, Input, OnDestroy } from '@angular/core';
import { IPermission } from '@devflow/models';
import { AppService, GenericModalComponent, ModalManager, OnModalInit } from '@devflow/services';
import { Subscription } from 'rxjs';
import { InvitationItemComponent } from '../../shared/invitation-item/invitation-item.component';

@Component({
  selector: 'app-invitations',
  imports: [
    InvitationItemComponent
  ],
  templateUrl: './invitations.component.html',
  styleUrl: './invitations.component.scss'
})
export class InvitationsModalComponent implements GenericModalComponent, OnModalInit, OnDestroy {

  private subscriptions: Subscription[] = [];

  public invitations: IPermission[] = [];
  public processing = new Map<string, true>();

  public modalManager!: ModalManager;

  constructor(
    private app: AppService
  ) { }

  onModalInit(): void {
    
    this.app.invitations$.subscribe(permissions => {

      this.invitations = permissions;

      if ( ! this.invitations.length )
        this.modalManager.close();

    });
    
  }

  public onProcessInvitation(invitation: IPermission, action: 'accept' | 'reject'): void {

    if ( this.processing.has(invitation.id) )
      return;

    this.processing.set(invitation.id, true);

    this.app.updateInvitation(invitation, action)
    .catch(console.error)
    .finally(() => this.processing.delete(invitation.id));

  }

  ngOnDestroy(): void {
    
    for ( const sub of this.subscriptions )
      if ( sub && ! sub.closed )
        sub.unsubscribe();
    
  }

}