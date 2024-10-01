import { Component, Input, Type, ViewContainerRef, ViewChild, ComponentRef, Output, EventEmitter, OnInit, HostBinding } from '@angular/core';
import { ModalButton, GenericModalComponent, ModalButtonWithConfirmation, ModalOptions, ModalSize } from '@devflow/services';
import { ButtonComponent } from '../button/button.component';
import { NgStyle } from '@angular/common';
import { animate, animateChild, style, transition, trigger, query } from '@angular/animations';
import { cloneDeep } from 'lodash-es';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    ButtonComponent,
    NgStyle
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':leave', [
        query('.modal', [
          animateChild()
        ]),
        animate('.075s ease-in-out', style({ opacity: 0 }))
      ]),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('.075s ease-in-out', style({ opacity: 1 })),
        query('.modal', [
          animateChild()
        ])
      ])
    ]),
    trigger('popInOut', [
      transition(':leave', [
        animate('.15s ease-in-out', style({ transform: 'scale(0)' }))
      ]),
      transition(':enter', [
        style({ transform: 'scale(0)' }),
        animate('.15s ease-in-out', style({ transform: 'scale(1)' }))
      ])
    ])
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent implements OnInit {

  @HostBinding('@fadeInOut')
  public fadeInOut: boolean = true;

  private modalContentRef?: ComponentRef<GenericModalComponent>;

  public ModalSize = ModalSize;
  public buttonPrompts = new Map<number, true>();

  @Input()
  public title: string = 'Untitled Modal';

  @Input()
  public content?: Type<GenericModalComponent>;

  @Input()
  public buttons: Array<ModalButton | ModalButtonWithConfirmation> = [];

  @Input()
  public data?: any;

  @Input()
  public options: ModalOptions = {
    size: ModalSize.Small
  };

  @ViewChild('modalBody', { read: ViewContainerRef })
  private modalBody!: ViewContainerRef;

  @Output()
  public onModalClose = new EventEmitter<void>();

  public castToPromptButton(button: ModalButton | ModalButtonWithConfirmation): ModalButtonWithConfirmation {

    return button as ModalButtonWithConfirmation;

  }

  ngOnInit(): void {

    setTimeout(() => {

      if ( this.content ) {

        this.modalContentRef = this.modalBody.createComponent(this.content);

        if ( this.data )
          this.modalContentRef.setInput('modalData', cloneDeep(this.data));

        if ( 'onModalInit' in this.modalContentRef.instance && typeof this.modalContentRef.instance.onModalInit === 'function' )
          this.modalContentRef.instance.onModalInit();
  
      }

    });
    
  }

  private doesButtonPromptConfirmation(button: ModalButton | ModalButtonWithConfirmation): button is ModalButtonWithConfirmation {

    return 'promptsConfirmation' in button;

  }

  public getModalMaxWidth(modalSize: ModalSize): string {

    if ( modalSize === ModalSize.Small )
      return '500px';
    else
      return '800px';

  }

  public onButtonClick(button: ModalButton | ModalButtonWithConfirmation, index: number): void {

    if ( ! this.modalContentRef )
      return;

    if ( this.doesButtonPromptConfirmation(button) && ! this.buttonPrompts.has(index) ) {

      this.buttonPrompts.set(index, true);

      setTimeout(() => this.buttonPrompts.delete(index), 3000);
      
      return;

    }

    if ( button.callback ) {

      const modal = this.modalContentRef.instance;
      let modalOutput: any;

      if ( 'onModalOutput' in modal && typeof modal.onModalOutput === 'function' )
        modalOutput = cloneDeep(modal.onModalOutput());

      button.callback(modalOutput);

    }

    if ( button.closesModal )
      this.onModalClose.emit();

  }

  public isModalValid(): boolean {

    if ( ! this.modalContentRef )
      return false;

    const modal = this.modalContentRef.instance;

    if ( 'onModalValidation' in modal && typeof modal.onModalValidation === 'function' )
      return modal.onModalValidation() as boolean;
    
    return true;

  }
  
}