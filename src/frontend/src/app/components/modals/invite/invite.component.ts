import { Component, Input } from '@angular/core';
import { GenericModalComponent, ModalManager, OnModalOutput, OnModalValidation } from '@devflow/services';
import { isEmail } from 'validator';
import { TextboxComponent } from '../../shared/textbox/textbox.component';
import { CheckboxComponent } from '../../shared/checkbox/checkbox.component';

@Component({
  selector: 'app-invite',
  imports: [
    TextboxComponent,
    CheckboxComponent
  ],
  templateUrl: './invite.component.html',
  styleUrl: './invite.component.scss'
})
export class InviteModalComponent implements GenericModalComponent, OnModalOutput, OnModalValidation {

  @Input()
  public modalData: InviteModalData = {
    email: '',
    canModify: false
  };

  public modalManager!: ModalManager;

  onModalOutput() {
    
    return this.modalData;
    
  }

  onModalValidation(): boolean {
    
    return isEmail(this.modalData.email);
    
  }

  public onEnterPress(): void {

    this.modalManager.submit();

  }
  
}

export interface InviteModalData {
  email: string,
  canModify: boolean
}