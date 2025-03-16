import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IPermission, Permission } from '@devflow/models';
import { NgClass } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-invitation-item',
  imports: [
    IconComponent,
    LoadingSpinnerComponent,
    NgClass
  ],
  templateUrl: './invitation-item.component.html',
  styleUrl: './invitation-item.component.scss'
})
export class InvitationItemComponent {

  @Input()
  public mode: 'provisioner' | 'grantee' = 'provisioner';

  @Input()
  public processing: boolean = false;

  @Input()
  public permission!: IPermission;

  @Output()
  public onRevoke = new EventEmitter<void>();

  @Output()
  public onAccept = new EventEmitter<void>();

  @Output()
  public onReject = new EventEmitter<void>();

  public getPermissionText(): string {

    if ( ! this.permission.accepted )
      return 'pending';

    if ( this.permission.permission === Permission.ReadOnly )
      return 'read only';

    return 'can modify';

  }

}
