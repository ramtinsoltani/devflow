import { NgClass, NgStyle } from '@angular/common';
import { Component, Input, Output, HostListener, EventEmitter } from '@angular/core';
import { IItem, ITag } from '@devflow/models';
import { AppService, EndpointService, ModalService, ModalSize } from '@devflow/services';
import { IconComponent } from '../icon/icon.component';
import { TagComponent } from '../tag/tag.component';
import { ItemModalComponent, ItemModalData } from '../../modals/item/item.component';

@Component({
  selector: 'app-item',
  standalone: true,
  imports: [
    NgClass,
    NgStyle,
    IconComponent,
    TagComponent
  ],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss'
})
export class ItemComponent {

  @Input()
  public item?: IItem;

  @Output()
  public onItemUpdate = new EventEmitter<IItem | null>();

  @Output()
  public onTagFilter = new EventEmitter<TagFilterEvent>();

  private ctrlKey: boolean = false;

  @HostListener('body:keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent): void {

    this.ctrlKey = event.ctrlKey || event.metaKey;

  }

  @HostListener('body:keyup', ['$event'])
  public onKeyUp(event: KeyboardEvent): void {

    this.ctrlKey = event.ctrlKey || event.metaKey;

  }

  constructor(
    private modals: ModalService,
    private endpoint: EndpointService,
    private app: AppService
  ) { }

  public onEditItem(event: MouseEvent): void {

    event.stopImmediatePropagation();

    if ( ! this.item )
      return;

    this.modals.openModal('Edit Item', ItemModalComponent, [
      { label: 'Delete', type: 'danger', closesModal: true, promptsConfirmation: true, confirmationLabel: 'Proceed?', callback: () => {

        this.endpoint.deleteItem((this.item as IItem).id)
        .then(() => this.onItemUpdate.emit(null))
        .then(() => this.app.updateCollectionSize((this.item as IItem).collectionId, this.app.getCollectionSize((this.item as IItem).collectionId) - 1))
        .catch(error => console.error(error));

      }},
      { label: 'Update', type: 'primary', closesModal: true, boundToValidation: true, callback: (modalOutput: ItemModalData) => {

        this.endpoint.updateItem((this.item as IItem).id, {
          title: modalOutput.title,
          url: modalOutput.url,
          tags: modalOutput.tags,
          posterUrl: modalOutput.posterUrl || (this.item?.posterUrl ? null : undefined),
          description: modalOutput.description || (this.item?.description ? null : undefined)
        })
        .then(() => this.endpoint.getItem((this.item as IItem).id))
        .then(updatedItem => this.onItemUpdate.emit(updatedItem))
        .catch(error => console.error(error));

      }},
      { label: 'Cancel', type: 'secondary', closesModal: true }
    ],
    this.item,
    { size: ModalSize.Large });

  }

  public onTagClick(tag: ITag, event: MouseEvent): void {

    event.stopImmediatePropagation();

    this.onTagFilter.emit({
      ctrlKey: this.ctrlKey,
      tag: tag.label.trim().toLowerCase()
    });

  }

  public onCardClick(): void {

    window.open(this.item?.url, '_blank');

  }

}

export interface TagFilterEvent {
  tag: string,
  ctrlKey: boolean
}