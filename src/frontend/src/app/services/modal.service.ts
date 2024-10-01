import { Injectable, Type, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  public readonly onOpenModal = new EventEmitter<ModalDef>();

  constructor() { }

  /**
   * Opens a new modal.
   * @param title Modal title
   * @param content Modal content component
   * @param buttons Modal buttons definition
   * @param data Modal data to send to its content component
   * @param options Modal options
   */
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
  /** If true, modal will be automatically closed when this button is pressed */
  closesModal?: boolean,
  /** If true, this button will be disabled when modal is invalid */
  boundToValidation?: boolean
}

export interface ModalButtonWithConfirmation extends ModalButton {
  /** If true, this button changes its label to `confirmationLabel` value when pressed and required a follow up click to proceed */
  promptsConfirmation: true,
  /** The button confirmation label to change to when `promptsConfirmation` is true */
  confirmationLabel: string
}

/** Generic modal interface */
export interface GenericModalComponent {
  modalData?: any
}

/** Defines an output hook where modal can set its output data */
export interface OnModalOutput {
  onModalOutput(): any
}

/** Defines a validation hook where modal can set its validation status */
export interface OnModalValidation {
  onModalValidation(): boolean
}

/** Defines an initialization hook where modal can run its initialization code after all inputs have been set */
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