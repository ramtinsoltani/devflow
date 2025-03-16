import { NgClass, NgStyle } from '@angular/common';
import { Component, Input, Output, HostListener, EventEmitter, OnInit, booleanAttribute, OnDestroy } from '@angular/core';
import { Color, ICollection, IItem, ITag } from '@devflow/models';
import { AppService, EndpointService, ModalService, ModalSize, UtilsService } from '@devflow/services';
import { IconComponent } from '../icon/icon.component';
import { TagComponent } from '../tag/tag.component';
import { ItemModalComponent, ItemModalData, ItemModalOutput } from '../../modals/item/item.component';
import { ItemImageComponent } from '../item-image/item-image.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { cloneDeep } from 'lodash-es';

@Component({
  selector: 'app-item',
  imports: [
    NgStyle,
    NgClass,
    IconComponent,
    TagComponent,
    ItemImageComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss'
})
export class ItemComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];

  public spaceId!: string;
  public collectionColor: Color = Color.Blue;
  public collectionPaletteColor!: string;
  public collection!: ICollection;
  public hovered: boolean = false;

  /** Item object */
  @Input()
  public item?: IItem;

  /** Whether item is read only (no update controls) or not */
  @Input()
  public readOnly: boolean = false;

  /** Displays fetching spinner on item */
  @Input()
  public fetching: boolean = false;

  /** Displays collection name with link */
  @Input({ transform: booleanAttribute })
  public showCollection: boolean = false;

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
    private app: AppService,
    private route: ActivatedRoute,
    private router: Router,
    private utils: UtilsService
  ) { }

  ngOnInit(): void {
    
    this.spaceId = this.route.snapshot.paramMap.get('spaceId') as string;

    this.subscriptions.push(this.app.collection$.subscribe(() => this.getCollectionInfo()));
  
  }

  private getCollectionInfo(): void {

    this.collection = this.app.getCollections().find(c => c.id === this.item?.collectionId) as ICollection;
    this.collectionColor = this.app.getCollectionColor(this.item?.collectionId as string) || Color.Blue;
    this.collectionPaletteColor = this.utils.getPaletteColor(this.collectionColor);

  }

  public onEditItem(event: MouseEvent): void {

    if ( this.readOnly )
      return;

    event.stopImmediatePropagation();

    if ( ! this.item || ! this.spaceId )
      return;

    this.modals.openModal<ItemModalData>('Edit Item', ItemModalComponent, [
      { label: 'Delete', type: 'danger', closesModal: true, promptsConfirmation: true, confirmationLabel: 'Proceed?', callback: () => {

        this.endpoint.deleteItem(this.spaceId, (this.item as IItem).id)
        .then(() => this.onItemUpdate.emit(null))
        .then(() => this.app.updateCollectionSize((this.item as IItem).collectionId, this.app.getCollectionSize((this.item as IItem).collectionId) - 1))
        .catch(error => console.error(error));

      }},
      { label: 'Update', type: 'primary', closesModal: true, boundToValidation: true, callback: (modalOutput: ItemModalOutput) => {

        this.endpoint.updateItem(this.spaceId, (this.item as IItem).id, {
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
        .then(() => this.endpoint.getItem(this.spaceId, (this.item as IItem).id))
        .then(updatedItem => this.onItemUpdate.emit(updatedItem))
        .catch(error => console.error(error));

      }},
      { label: 'Cancel', type: 'secondary', closesModal: true }
    ],
    // Modal data
    {
      ...this.item,
      collectionColor: this.app.getCollectionColor(this.item.collectionId) as Color,
      initialState: {
        id: this.item.id,
        title: this.item.title,
        description: this.item.description,
        tags: cloneDeep(this.item.tags),
        posterUrl: this.item.posterUrl,
        url: this.item.url,
        originTitle: this.item.originTitle,
        originUrl: this.item.originUrl,
        favicon: this.item.favicon,
        forceAltLayout: this.item.forceAltLayout
      }
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

  public onOpenCollection(event: MouseEvent): void {

    event.stopPropagation();

    this.router.navigate([`/${this.collection.spaceId}/${this.collection.id}`]);

  }

  ngOnDestroy(): void {
    
    for ( const sub of this.subscriptions )
      if ( sub && ! sub.closed )
        sub.unsubscribe();
    
  }

}

export interface TagFilterEvent {
  tag: string,
  ctrlKey: boolean
}