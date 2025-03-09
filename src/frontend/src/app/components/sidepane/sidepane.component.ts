import { Component, OnInit, OnDestroy } from '@angular/core';
import { Color, ICollection, ISpace } from '@devflow/models';
import { EndpointService, AppService, UtilsService, ModalService, AuthService } from '@devflow/services';
import { Subscription } from 'rxjs';
import { NavItemComponent } from '../shared/nav-item/nav-item.component';
import { ActivationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TextboxComponent, TextboxSearchEvent } from '../shared/textbox/textbox.component';
import { CollectionModalComponent, CollectionModalData } from '../modals/collection/collection.component';
import { IconComponent } from '../shared/icon/icon.component';
import { SpaceModalComponent, SpaceModalData } from '../modals/space/space.component';

@Component({
  selector: 'app-sidepane',
  imports: [
    NavItemComponent,
    TextboxComponent,
    RouterLink,
    RouterLinkActive,
    IconComponent
  ],
  templateUrl: './sidepane.component.html',
  styleUrl: './sidepane.component.scss'
})
export class SidepaneComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  private urlSpaceId?: string;
  private urlCollectionId?: string;

  public selectedSpace?: ISpace;
  public spaces: ISpace[] = [];
  public filteredSpaces?: ISpace[];
  public collections: ICollection[] = [];
  public filteredCollections?: ICollection[];
  public Color = Color;

  constructor(
    private app: AppService,
    private endpoint: EndpointService,
    public utils: UtilsService,
    private modals: ModalService,
    private router: Router,
    private auth: AuthService
  ) { }

  ngOnInit(): void {

    // Subscribe to spaces list in the app service
    this.subscriptions.push(this.app.spaces$.subscribe(newValue => {

      this.spaces = newValue;
      this.selectSpaceFromURLParam();
      
    }));
    
    // Subscribe to collections list in the app service
    this.subscriptions.push(this.app.collection$.subscribe(newValue => this.collections = newValue));

    // Read query params
    this.subscriptions.push(this.router.events.subscribe(event => {

      if ( event instanceof ActivationEnd ) {
        
        this.urlSpaceId = event.snapshot.paramMap.get('spaceId') || undefined;
        this.urlCollectionId = event.snapshot.paramMap.get('collectionId') || undefined;
        this.selectSpaceFromURLParam();

      }

    }));

    this.app.fetchSpaces()
    .catch(error => console.error(error));
    
  }

  private selectSpaceFromURLParam(): void {

    // If navigated to any page with space ID without having it selected in the side bar
    if ( this.urlSpaceId && ! this.selectedSpace && this.spaces.length ) {

      const restoredSpace = this.spaces.find(s => s.id === this.urlSpaceId);

      if ( restoredSpace )
        this.onSelectSpace(restoredSpace);

    }

  }

  public onNewCollection(): void {

    if ( ! this.selectedSpace )
      return;

    let newCollectionId!: string;

    this.modals.openModal('New Collection', CollectionModalComponent, [
      { label: 'Create', type: 'success', closesModal: true, boundToValidation: true, callback: (modalOutput: CollectionModalData) => {

        this.endpoint.createCollection(this.selectedSpace?.id as string, { name: modalOutput.name, color: modalOutput.color })
        .then(res => {

          newCollectionId = res.data;
          
          return this.app.fetchCollections(this.selectedSpace?.id as string);

        })
        // Navigate to newly created collection
        .then(() => this.router.navigate([`/${this.selectedSpace?.id as string}/${newCollectionId}`]))
        .catch(error => console.error(error));

      }},
      { label: 'Cancel', type: 'secondary', closesModal: true }
    ]);

  }

  public onEditCollection(collection: ICollection): void {

    if ( ! this.selectedSpace )
      return;

    this.modals.openModal<CollectionModalData>('Edit Collection', CollectionModalComponent, [
      { label: 'Delete', type: 'danger', closesModal: true, promptsConfirmation: true, confirmationLabel: 'Proceed?', callback: () => {

        this.endpoint.deleteCollection(this.selectedSpace?.id as string, collection.id)
        .then(() => this.app.fetchCollections(this.selectedSpace?.id as string))
        .then(() => {

          // If current route is the deleted collection, navigate to landing page
          const url = this.router.parseUrl(this.router.url);

          if ( url.toString() === `/${this.selectedSpace?.id as string}/${collection.id}` )
            this.router.navigate(['/']);

        })
        .catch(error => console.error(error));

      }},
      { label: 'Update', type: 'primary', closesModal: true, boundToValidation: true, callback: (modalOutput: CollectionModalData) => {

        this.endpoint.updateCollection(this.selectedSpace?.id as string, collection.id, { name: modalOutput.name, color: modalOutput.color })
        .then(() => this.app.fetchCollections(this.selectedSpace?.id as string))
        .catch(error => console.error(error));

      }},
      { label: 'Cancel', type: 'secondary', closesModal: true }
    ],
    // Modal data
    {
      name: collection.name,
      color: collection.color
    });

  }

  public onSearchCollections(event: TextboxSearchEvent): void {

    if ( ! event.value.trim().length )
      return this.onClearCollectionsSearch();

    this.endpoint.searchCollections(this.selectedSpace?.id as string, event.value)
    .then(results => this.filteredCollections = results)
    .catch(error => console.error(error));

  }

  public onClearCollectionsSearch(): void {

    this.filteredCollections = undefined;

  }

  public onNewSpace(): void {

    let newSpaceId!: string;

    this.modals.openModal('New Space', SpaceModalComponent, [
      { label: 'Create', type: 'success', closesModal: true, boundToValidation: true, callback: (modalOutput: SpaceModalData) => {

        this.endpoint.createSpace({ name: modalOutput.name })
        .then(res => {

          newSpaceId = res.data;
          
          return this.app.fetchSpaces();

        })
        .then(() => {

          this.onSelectSpace(this.spaces.find(s => s.id === newSpaceId) as ISpace)

        })
        .catch(error => console.error(error));

      }},
      { label: 'Cancel', type: 'secondary', closesModal: true }
    ]);

  }

  public onEditSpace(space: ISpace): void {

    this.modals.openModal<SpaceModalData>('Edit Collection', SpaceModalComponent, [
      { label: 'Delete', type: 'danger', closesModal: true, promptsConfirmation: true, confirmationLabel: 'Proceed?', callback: () => {

        this.endpoint.deleteSpace(space.id)
        .then(() => this.app.fetchSpaces())
        .catch(error => console.error(error));

      }},
      { label: 'Update', type: 'primary', closesModal: true, boundToValidation: true, callback: (modalOutput: SpaceModalData) => {

        this.endpoint.updateSpace(space.id, { name: modalOutput.name })
        .then(() => this.app.fetchSpaces())
        .catch(error => console.error(error));

      }},
      { label: 'Cancel', type: 'secondary', closesModal: true }
    ],
    // Modal data
    {
      name: space.name
    });

  }

  public onSelectSpace(space: ISpace): void {

    this.selectedSpace = space;
    this.filteredCollections = undefined;
    this.filteredSpaces = undefined;

    if ( ! this.urlCollectionId )
      this.router.navigate(['/' + space.id]);

    this.app.fetchCollections(space.id)
    .catch(console.error);

  }

  public onDeselectSpace(): void {

    this.selectedSpace = undefined;
    this.filteredCollections = undefined;
    this.filteredSpaces = undefined;

    this.router.navigate(['/']);

  }

  public onSearchSpaces(event: TextboxSearchEvent): void {

    if ( ! event.value.trim().length )
      return this.onClearSpacesSearch();

    this.endpoint.searchSpaces(event.value)
    .then(results => this.filteredSpaces = results)
    .catch(error => console.error(error));

  }

  public onClearSpacesSearch(): void {

    this.filteredSpaces = undefined;

  }

  public onLogout(): void {

    this.auth.signOut();

  }

  ngOnDestroy(): void {
    
    for ( const sub of this.subscriptions )
      if ( sub && ! sub.closed )
        sub.unsubscribe();
    
  }

}
