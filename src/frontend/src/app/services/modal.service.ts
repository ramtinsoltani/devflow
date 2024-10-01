import { Injectable, Type, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  public readonly onOpenModal = new EventEmitter<ModalDef>();

  constructor() { }

  public openModal<T=any>(title: string, content: Type<any>, buttons: Array<ModalButton | ModalButtonWithConfirmation>, data?: T, options?: ModalOptions): void {

    this.onOpenModal.emit({ title, content, buttons, data, options });

  }
  
}

export interface ModalDef<T=any> {
  title: string,
  content: Type<any>,
  buttons: Array<ModalButton | ModalButtonWithConfirmation>,
  data?: T,
  options?: ModalOptions
}

export interface ModalButton {
  type: 'primary' | 'secondary' | 'danger' | 'success',
  label: string,
  callback?: (modalOutput?: any) => void,
  closesModal?: boolean,
  boundToValidation?: boolean
}

export interface ModalButtonWithConfirmation extends ModalButton {
  promptsConfirmation: true,
  confirmationLabel: string
}

export interface GenericModalComponent {
  modalData?: any
}

export interface OnModalOutput {
  onModalOutput(): any
}

export interface OnModalValidation {
  onModalValidation(): boolean
}

export interface OnModalInit {

  onModalInit(): void

}

export enum ModalSize {
  Small,
  Large
}

export interface ModalOptions {
  size: ModalSize
}