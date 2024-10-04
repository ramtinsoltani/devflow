import { NgClass, NgStyle } from '@angular/common';
import { Component, Input, Output, HostListener, EventEmitter, OnInit } from '@angular/core';
import { Color, IItem, ITag } from '@devflow/models';
import { AppService, EndpointService, ModalService, ModalSize } from '@devflow/services';
import { IconComponent } from '../icon/icon.component';
import { TagComponent } from '../tag/tag.component';
import { ItemModalComponent, ItemModalData, ItemModalOutput } from '../../modals/item/item.component';
import { ItemImageComponent } from '../item-image/item-image.component';

@Component({
  selector: 'app-item',
  standalone: true,
  imports: [
    NgClass,
    NgStyle,
    IconComponent,
    TagComponent,
    ItemImageComponent
  ],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss'
})
export class ItemComponent implements OnInit {

  public collectionColor: Color = Color.Blue;
  public hovered: boolean = false;

  /** Item object */
  @Input()
  public item?: IItem;

  /** Emits when item is updated */
  @Output()
  public onItemUpdate = new EventEmitter<IItem | null>();

  /** Emits when item tag is clicked */
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

  @HostListener('mouseenter')
  public onMouseEnter(): void {

    this.hovered = true;

  }

  @HostListener('mouseleave')
  public onMouseLeave(): void {

    this.hovered = false;

  }

  constructor(
    private modals: ModalService,
    private endpoint: EndpointService,
    private app: AppService
  ) { }

  ngOnInit(): void {
    
    this.collectionColor = this.app.getCollectionColor(this.item?.collectionId as string) || Color.Blue;
  
  }

  public onEditItem(event: MouseEvent): void {

    event.stopImmediatePropagation();

    if ( ! this.item )
      return;

    this.modals.openModal<ItemModalData>('Edit Item', ItemModalComponent, [
      { label: 'Delete', type: 'danger', closesModal: true, promptsConfirmation: true, confirmationLabel: 'Proceed?', callback: () => {

        this.endpoint.deleteItem((this.item as IItem).id)
        .then(() => this.onItemUpdate.emit(null))
        .then(() => this.app.updateCollectionSize((this.item as IItem).collectionId, this.app.getCollectionSize((this.item as IItem).collectionId) - 1))
        .catch(error => console.error(error));

      }},
      { label: 'Update', type: 'primary', closesModal: true, boundToValidation: true, callback: (modalOutput: ItemModalOutput) => {

        this.endpoint.updateItem((this.item as IItem).id, {
          title: modalOutput.title,
          url: modalOutput.url,
          tags: modalOutput.tags,
          posterUrl: modalOutput.posterUrl || (this.item?.posterUrl ? null : undefined),
          description: modalOutput.description || (this.item?.description ? null : undefined),
          originTitle: modalOutput.originTitle || (this.item?.originTitle ? null : undefined),
          originUrl: modalOutput.originUrl || (this.item?.originUrl ? null : undefined),
          favicon: modalOutput.favicon || (this.item?.favicon ? null : undefined),
          forceAltLayout: modalOutput.forceAltLayout
        })
        .then(() => this.endpoint.getItem((this.item as IItem).id))
        .then(updatedItem => this.onItemUpdate.emit(updatedItem))
        .catch(error => console.error(error));

      }},
      { label: 'Cancel', type: 'secondary', closesModal: true }
    ],
    // Modal data
    {
      ...this.item,
      collectionColor: this.app.getCollectionColor(this.item.collectionId) as Color
    },
    // Modal options
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