import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Color, IItem, ITag } from '@devflow/models';
import { AppService, EndpointService, ModalService, ModalSize } from '@devflow/services';
import { Subscription } from 'rxjs';
import { ItemComponent, TagFilterEvent } from '../shared/item/item.component';
import { NavItemComponent } from '../shared/nav-item/nav-item.component';
import { TextboxComponent, TextboxSearchEvent } from '../shared/textbox/textbox.component';
import { ItemModalComponent, ItemModalData } from '../modals/item/item.component';
import { EmptyPlaceholderComponent } from '../shared/empty-placeholder/empty-placeholder.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [
    ItemComponent,
    NavItemComponent,
    TextboxComponent,
    EmptyPlaceholderComponent,
    NgClass
  ],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.scss'
})
export class CollectionComponent implements OnDestroy {

  private subscriptions: Subscription[] = [];
  private collectionId!: string;

  public items: IItem[] = [];
  public filteredItems?: IItem[] = undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private endpoint: EndpointService,
    private modals: ModalService,
    private app: AppService
  ) {

    this.subscriptions.push(this.route.paramMap.subscribe(params => {

      const collectionId = params.get('id');

      if ( collectionId ) {

        this.collectionId = collectionId;

        this.endpoint.getItems(collectionId)
        .then(items => this.items = items)
        .catch(error => console.error(error));

      }

    }));

    this.subscriptions.push(this.route.queryParamMap.subscribe(queryParams => {

      const q = queryParams.get('q');
      const tags = queryParams.get('tags');

      if ( q )
        this.queryText = q;

      if ( tags?.split(',').length )
        this.queryTags = tags.split(',').map(label => ({ label, color: Color.Blue }));

      if ( ! q && ! tags ) {

        this.filteredItems = undefined;
        return;

      }

      this.endpoint.searchCollectionItems(this.collectionId, q || undefined, tags?.split(','))
      .then(items => this.filteredItems = items)
      .catch(error => console.error(error));

    }));

  }

  public queryTags: ITag[] = [];
  public queryText: string = '';

  public onItemUpdated(index: number, updatedItem: IItem | null): void {

    if ( ! updatedItem ) {

      this.items.splice(index, 1);
      
      return;

    }

    this.items[index] = updatedItem;

  }

  public onSearch(event: TextboxSearchEvent): void {

    if ( ! event.value.trim().length && ! event.tags.length )
      return this.onSearchClear();

    this.router.navigate([], { relativeTo: this.route, queryParams: {
      q: event.value.trim() || undefined,
      tags: event.tags.map(t => t.label.trim().toLowerCase()).join(',') || undefined
    }});

  }

  public onSearchClear(): void {


    this.router.navigate([], { relativeTo: this.route });

  }

  public onNewItem(): void {

    this.modals.openModal('New Item', ItemModalComponent, [
      { label: 'Create', type: 'success', closesModal: true, boundToValidation: true, callback: (modalOutput: ItemModalData) => {

        this.endpoint.createItem({
          collectionId: this.collectionId,
          title: modalOutput.title,
          description: modalOutput.description,
          url: modalOutput.url,
          posterUrl: modalOutput.posterUrl,
          tags: modalOutput.tags
        })
        .then(res => this.endpoint.getItem(res.data))
        .then(newItem => {

          this.items.unshift(newItem);
          this.app.updateCollectionSize(newItem.collectionId, this.app.getCollectionSize(newItem.collectionId) + 1)

        })
        .catch(error => console.error(error));
        
      }},
      { label: 'Cancel', type: 'secondary', closesModal: true }
    ],
    undefined,
    { size: ModalSize.Large });

  }

  public onTagFilter(event: TagFilterEvent): void {

    if ( event.ctrlKey )
      this.router.navigate(['/search'], { queryParams: { tags: event.tag }});
    else
      this.router.navigate([], { relativeTo: this.route, queryParams: { tags: event.tag }});

  }

  ngOnDestroy(): void {
    
    for ( const sub of this.subscriptions )
      if ( sub && ! sub.closed )
        sub.unsubscribe();
    
  }

}
