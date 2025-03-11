import { Component, Input, OnInit } from '@angular/core';
import { EndpointService, GenericModalComponent, OnModalOutput, OnModalValidation } from '@devflow/services';
import { TextboxComponent } from '../../shared/textbox/textbox.component';
import { IPermission } from '@devflow/models';
import { InvitationItemComponent } from '../../shared/invitation-item/invitation-item.component';

@Component({
  selector: 'app-space',
  imports: [
    TextboxComponent,
    InvitationItemComponent
  ],
  templateUrl: './space.component.html',
  styleUrl: './space.component.scss'
})
export class SpaceModalComponent implements OnInit, GenericModalComponent, OnModalOutput, OnModalValidation {

  @Input()
  public modalData: SpaceModalData = {
    name: ''
  };

  public permissions: IPermission[] = [];
  public processing = new Map<string, true>();

  constructor(
    private endpoint: EndpointService
  ) { }

  ngOnInit(): void {
    
    if ( this.modalData.id ) {

      this.endpoint.getProvisionedPermissions(this.modalData.id)
      .then(permissions => this.permissions = permissions)
      .catch(console.error);

    }
    
  }

  onModalOutput(): SpaceModalData {
      
    return this.modalData;
    
  }

  onModalValidation(): boolean {
    
    return !! this.modalData.name?.length;
    
  }

  public onRevokePermission(permission: IPermission): void {

    if ( this.processing.has(permission.id) )
      return;

    this.processing.set(permission.id, true);

    this.endpoint.revokePermission(permission.id)
    .then(() => this.permissions.splice(this.permissions.findIndex(p => p.id === permission.id), 1))
    .catch(console.error)
    .finally(() => this.processing.delete(permission.id));

  }
    
}

export interface SpaceModalData {
  name: string,
  id?: string
}