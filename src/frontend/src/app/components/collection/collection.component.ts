import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Color, IItem, ITag } from '@devflow/models';
import { AppService, EndpointService, IUpdateItemRequest, KeyboardShortcut, ModalService, ModalSize } from '@devflow/services';
import { Subscription } from 'rxjs';
import { ItemComponent, TagFilterEvent } from '../shared/item/item.component';
import { NavItemComponent } from '../shared/nav-item/nav-item.component';
import { TextboxComponent, TextboxSearchEvent } from '../shared/textbox/textbox.component';
import { ItemModalComponent, ItemModalData, ItemModalOutput } from '../modals/item/item.component';
import { EmptyPlaceholderComponent } from '../shared/empty-placeholder/empty-placeholder.component';
import { NgClass } from '@angular/common';
import isURL from 'validator/es/lib/isURL';
import { cloneDeep } from 'lodash-es';

@Component({
  selector: 'app-collection',
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
  private spaceId!: string;
  private collectionId!: string;

  public items: IItem[] = [];
  public filteredItems?: IItem[] = undefined;
  public fetchingMetadata = new Map<string, true>();
  public hasWritePermission: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private endpoint: EndpointService,
    private modals: ModalService,
    private app: AppService
  ) {

    // Subscribe to route param changes
    this.subscriptions.push(this.route.paramMap.subscribe(params => {

      const spaceId = params.get('spaceId');
      const collectionId = params.get('collectionId');

      // Load collection data based on ID
      if ( spaceId && collectionId ) {

        this.spaceId = spaceId;
        this.collectionId = collectionId;

        this.endpoint.getItems(spaceId, collectionId)
        .then(items => this.items = items)
        .catch(error => console.error(error));

      }

      // Read space settings (write permission)
      if ( spaceId ) {

        this.subscriptions.push(this.app.spaces$.subscribe(spaces => {

          if ( ! spaces.length )
            return;

          this.hasWritePermission = this.app.isWritePermissionGranted(spaceId);

        }));
        
      }

    }));

    // Subscribe to route query params changes
    this.subscriptions.push(this.route.queryParamMap.subscribe(queryParams => {

      const q = queryParams.get('q');
      const tags = queryParams.get('tags');

      // Set query text from query params
      if ( q )
        this.queryText = q;

      // Set query tags from query params
      if ( tags?.split(',').length )
        this.queryTags = tags.split(',').map(label => ({ label, color: Color.Blue }));

      // Clear collection search if no queries provided
      if ( ! q && ! tags ) {

        this.filteredItems = undefined;
        return;

      }

      this.endpoint.searchCollectionItems(this.spaceId, this.collectionId, q || undefined, tags?.split(','))
      .then(items => this.filteredItems = items)
      .catch(error => console.error(error));

    }));

    // Subscribe to keyboard shortcuts
    this.subscriptions.push(this.app.onKeyboardShortcut(async event => {

      if ( event.shortcut === KeyboardShortcut.NewItem )
        return this.onNewItem();

      if ( event.shortcut === KeyboardShortcut.PasteItem ) {

        // Grab text from clipboard
        const text = (event.event as ClipboardEvent).clipboardData?.getData('text');

        if ( ! text )
          return;

        // Check if it's a valid URL
        const isUrlValid = isURL(text.trim(), {
          protocols: ['http', 'https'],
          require_protocol: true,
          require_valid_protocol: true
        });

        if ( ! isUrlValid )
          return;

        // Create a new item with plain info
        const url = new URL(text.trim());
        let itemId: string | undefined;

        try {

          itemId = (await this.endpoint.createItem(this.spaceId, {
            collectionId: this.collectionId,
            url: text.trim(),
            title: url.hostname,
            tags: [],
            forceAltLayout: false
          })).data;

          // Read the new item
          const item = await this.endpoint.getItem(this.spaceId, itemId);

          // Update current collection
          this.items.unshift(item);
          this.app.updateCollectionSize(item.collectionId, this.app.getCollectionSize(item.collectionId) + 1);

          // Fetch item metadata separately
          this.fetchingMetadata.set(itemId, true);
          
          const metadata = await this.endpoint.fetchMetadata(text.trim());
          const itemUpdate: IUpdateItemRequest = { forceAltLayout: false };

          for ( const key in metadata )
            if ( metadata[key] !== undefined && metadata[key] !== null )
              itemUpdate[key] = metadata[key];

          // Update item if anything fetched
          if ( Object.keys(itemUpdate).length > 1 ) {

            await this.endpoint.updateItem(this.spaceId, itemId, itemUpdate);

            // Update item reference
            const updatedItem = cloneDeep(item);
            const itemIndex = this.items.findIndex(i => i.id === updatedItem.id);

            if ( itemIndex !== -1 )
              this.onItemUpdated(itemIndex, { ...updatedItem, ...(itemUpdate as any) });

          }

        }
        catch (error) {

          console.error(error);

        }
        finally {

          if ( itemId )
            // Clear fetching flag
            this.fetchingMetadata.delete(itemId);

        }

      }

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

    // Set query parameters of current route to trigger search
    this.router.navigate([], { relativeTo: this.route, queryParams: {
      q: event.value.trim() || undefined,
      tags: event.tags.map(t => t.label.trim().toLowerCase()).join(',') || undefined
    }});

  }

  public onSearchClear(): void {


    this.router.navigate([], { relativeTo: this.route });

  }

  public onNewItem(): void {

    this.modals.openModal<ItemModalData>('New Item', ItemModalComponent, [
      { label: 'Create', type: 'success', closesModal: true, boundToValidation: true, callback: (modalOutput: ItemModalOutput) => {

        this.endpoint.createItem(this.spaceId, {
          collectionId: this.collectionId,
          title: modalOutput.title,
          description: modalOutput.description,
          url: modalOutput.url,
          posterUrl: modalOutput.posterUrl,
          tags: modalOutput.tags,
          originTitle: modalOutput.originTitle,
          originUrl: modalOutput.originUrl,
          favicon: modalOutput.favicon,
          forceAltLayout: modalOutput.forceAltLayout
        })
        .then(res => this.endpoint.getItem(this.spaceId, res.data))
        .then(newItem => {

          this.items.unshift(newItem);
          this.app.updateCollectionSize(newItem.collectionId, this.app.getCollectionSize(newItem.collectionId) + 1);

        })
        .catch(error => console.error(error));
        
      }},
      { label: 'Cancel', type: 'secondary', closesModal: true }
    ],
    // Modal data
    {
      title: '',
      url: '',
      tags: [],
      forceAltLayout: false,
      collectionColor: this.app.getCollectionColor(this.collectionId) as Color
    },
    // Modal options
    { size: ModalSize.Large });

  }

  public onTagFilter(event: TagFilterEvent): void {

    // If CTRL/CMD key is held, apply tag filter in global search
    if ( event.ctrlKey )
      this.router.navigate(['/search'], { queryParams: { tags: event.tag }});
    // Otherwise, apply tag filter in collections search (current view)
    else
      this.router.navigate([], { relativeTo: this.route, queryParams: { tags: event.tag }});

  }

  ngOnDestroy(): void {
    
    for ( const sub of this.subscriptions )
      if ( sub && ! sub.closed )
        sub.unsubscribe();
    
  }

}
