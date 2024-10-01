import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Color, ICollection } from '@devflow/models';
import { EndpointService, AppService, UtilsService, ModalService } from '@devflow/services';
import { IconComponent } from '../shared/icon/icon.component';
import { Subscription } from 'rxjs';
import { NavItemComponent } from '../shared/nav-item/nav-item.component';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TextboxComponent, TextboxSearchEvent } from '../shared/textbox/textbox.component';
import { CollectionModalComponent, CollectionModalData } from '../modals/collection/collection.component';

@Component({
  selector: 'app-sidepane',
  standalone: true,
  imports: [
    IconComponent,
    NavItemComponent,
    TextboxComponent,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidepane.component.html',
  styleUrl: './sidepane.component.scss'
})
export class SidepaneComponent implements OnInit, AfterViewInit, OnDestroy {

  private subscriptions: Subscription[] = [];

  public collections: ICollection[] = [];
  public filteredCollections?: ICollection[];
  public Color = Color;

  constructor(
    private app: AppService,
    private endpoint: EndpointService,
    public utils: UtilsService,
    private modals: ModalService,
    private router: Router
  ) { }

  ngOnInit(): void {
    
    this.subscriptions.push(this.app.collection$.subscribe(newValue => this.collections = newValue));
    
  }

  ngAfterViewInit(): void {

    this.app.fetchCollections()
    .catch(error => console.error(error));
    
  }

  public onNewCollection(): void {

    let newCollectionId!: string;

    this.modals.openModal('New Collection', CollectionModalComponent, [
      { label: 'Create', type: 'success', closesModal: true, boundToValidation: true, callback: (modalOutput: CollectionModalData) => {

        this.endpoint.createCollection({ name: modalOutput.name, color: modalOutput.color })
        .then(res => {

          newCollectionId = res.data;
          
          return this.app.fetchCollections();

        })
        .then(() => this.router.navigate(['/collection/' + newCollectionId]))
        .catch(error => console.error(error));

      }},
      { label: 'Cancel', type: 'secondary', closesModal: true }
    ]);

  }

  public onEditCollection(collection: ICollection): void {

    this.modals.openModal<CollectionModalData>('Edit Collection', CollectionModalComponent, [
      { label: 'Delete', type: 'danger', closesModal: true, promptsConfirmation: true, confirmationLabel: 'Proceed?', callback: () => {

        this.endpoint.deleteCollection(collection.id)
        .then(() => this.app.fetchCollections())
        .then(() => {

          const url = this.router.parseUrl(this.router.url);

          if ( url.toString() === `/collection/${collection.id}` )
            this.router.navigate(['/']);

        })
        .catch(error => console.error(error));

      }},
      { label: 'Update', type: 'primary', closesModal: true, boundToValidation: true, callback: (modalOutput: CollectionModalData) => {

        this.endpoint.updateCollection(collection.id, { name: modalOutput.name, color: modalOutput.color })
        .then(() => this.app.fetchCollections())
        .catch(error => console.error(error));

      }},
      { label: 'Cancel', type: 'secondary', closesModal: true }
    ], {
      name: collection.name,
      color: collection.color
    });

  }

  public onSearchCollections(event: TextboxSearchEvent): void {

    if ( ! event.value.trim().length )
      return this.onClearCollectionsSearch();

    this.endpoint.searchCollections(event.value)
    .then(results => this.filteredCollections = results)
    .catch(error => console.error(error));

  }

  public onClearCollectionsSearch(): void {

    this.filteredCollections = undefined;

  }

  ngOnDestroy(): void {
    
    for ( const sub of this.subscriptions )
      if ( sub && ! sub.closed )
        sub.unsubscribe();
    
  }

}
