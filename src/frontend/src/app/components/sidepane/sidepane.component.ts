import { Component, OnInit, OnDestroy } from '@angular/core';
import { Color, ICollection, IPermission, ISpace, Permission } from '@devflow/models';
import { EndpointService, AppService, UtilsService, ModalService, AuthService, NotificationService, KeyboardShortcut } from '@devflow/services';
import { Subscription } from 'rxjs';
import { NavItemComponent } from '../shared/nav-item/nav-item.component';
import { ActivationEnd, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TextboxComponent, TextboxSearchEvent } from '../shared/textbox/textbox.component';
import { CollectionModalComponent, CollectionModalData } from '../modals/collection/collection.component';
import { IconComponent } from '../shared/icon/icon.component';
import { SpaceModalComponent, SpaceModalData } from '../modals/space/space.component';
import { InviteModalComponent, InviteModalData } from '../modals/invite/invite.component';
import { ButtonComponent } from '../shared/button/button.component';
import { InvitationsModalComponent } from '../modals/invitations/invitations.component';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-sidepane',
  imports: [
    NavItemComponent,
    TextboxComponent,
    RouterLink,
    RouterLinkActive,
    IconComponent,
    ButtonComponent,
    LoadingSpinnerComponent,
    CdkDrag,
    CdkDropList
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
  public invitations: IPermission[] = [];
  public fetching: boolean = false;
  public currentUser: User | null = null;
  public avatarFailed: boolean = false;
  public spaceReorderingInProgress: boolean = false;
  public collectionReorderingInProgress: boolean = false;

  constructor(
    private app: AppService,
    private endpoint: EndpointService,
    public utils: UtilsService,
    private modals: ModalService,
    private router: Router,
    private auth: AuthService,
    private notifications: NotificationService
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
      else if ( event instanceof NavigationEnd && event.urlAfterRedirects === '/' ) {

        this.onDeselectSpace();

      }

    }));

    this.fetching = true;

    this.app.fetchSpaces()
    .catch(console.error)
    .finally(() => this.fetching = false);

    // Invitations
    this.subscriptions.push(this.app.invitations$.subscribe(permissions => {
      
      if ( permissions.length > this.invitations.length && this.router.url !== '/' ) {

        this.notifications.create({
          type: 'info',
          message: `You have ${permissions.length} pending invitation${permissions.length > 1 ? 's' : ''}`
        });

      }
      
      this.invitations = permissions;

    }));

    this.app.fetchInvitations()
    .catch(console.error);

    // Keyboard shortcuts
    this.subscriptions.push(this.app.onKeyboardShortcut(event => {

      if ( event.shortcut === KeyboardShortcut.NewSpace )
        return this.onNewSpace(true);

      if ( event.shortcut === KeyboardShortcut.NewCollection && this.selectedSpace )
        return this.onNewCollection();

    }));

    // Auth
    this.subscriptions.push(this.auth.onAuthStateChanged$.subscribe(user => {

      this.currentUser = user;
      this.avatarFailed = false;

    }));
    
  }

  private queryStringToRegex(q: string): RegExp {

    const tokens = q.replace(/\s+/g, ' ').trim().toLowerCase().split(' ');

    return new RegExp(tokens.map(t => `(${t})`).join('|'), 'i');
  
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
      { label: 'Create', type: 'success', submit: true, closesModal: true, boundToValidation: true, callback: (modalOutput: CollectionModalData) => {

        this.endpoint.createCollection(this.selectedSpace?.id as string, { name: modalOutput.name, color: modalOutput.color })
        .then(res => {

          newCollectionId = res.data;

          this.fetching = true;
          
          return new Promise((resolve, reject) => {

            this.app.fetchCollections(this.selectedSpace?.id as string)
            .then(resolve)
            .catch(reject)
            .finally(() => this.fetching = false);

          });

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
        .then(() => new Promise((resolve, reject) => {

          this.fetching = true;

          this.app.fetchCollections(this.selectedSpace?.id as string)
          .then(resolve)
          .catch(reject)
          .finally(() => this.fetching = false);

        }))
        .then(() => {

          // If current route is the deleted collection, navigate to landing page
          const url = this.router.parseUrl(this.router.url);

          if ( url.toString() === `/${this.selectedSpace?.id as string}/${collection.id}` )
            this.router.navigate(['/']);

        })
        .catch(error => console.error(error));

      }},
      { label: 'Update', type: 'primary', submit: true, closesModal: true, boundToValidation: true, callback: (modalOutput: CollectionModalData) => {

        this.endpoint.updateCollection(this.selectedSpace?.id as string, collection.id, { name: modalOutput.name, color: modalOutput.color })
        .then(() => new Promise((resolve, reject) => {

          this.fetching = true;

          this.app.fetchCollections(this.selectedSpace?.id as string)
          .then(resolve)
          .catch(reject)
          .finally(() => this.fetching = false);

        }))
        .catch(error => console.error(error));

      }},
      { label: 'Cancel', type: 'secondary', closesModal: true }
    ],
    // Modal data
    {
      name: collection.name,
      color: collection.color,
      initialState: {
        name: collection.name,
        color: collection.color
      }
    });

  }

  public onSearchCollections(event: TextboxSearchEvent): void {

    if ( ! event.value.trim().length )
      return this.onClearCollectionsSearch();

    const regex = this.queryStringToRegex(event.value.trim());

    this.filteredCollections = this.collections
    .filter(c => c.name.match(regex));

  }

  public onClearCollectionsSearch(): void {

    this.filteredCollections = undefined;

  }

  public onNewSpace(forceNavigation: boolean = false): void {

    let newSpaceId!: string;

    this.modals.openModal('New Space', SpaceModalComponent, [
      { label: 'Create', type: 'success', submit: true, closesModal: true, boundToValidation: true, callback: (modalOutput: SpaceModalData) => {

        this.endpoint.createSpace({ name: modalOutput.name })
        .then(res => {

          newSpaceId = res.data;
          
          return new Promise((resolve, reject) => {

            this.fetching = true;

            this.app.fetchSpaces()
            .then(resolve)
            .catch(reject)
            .finally(() => this.fetching = false);

          });

        })
        .then(() => {

          this.onSelectSpace(this.spaces.find(s => s.id === newSpaceId) as ISpace, forceNavigation);

        })
        .catch(error => console.error(error));

      }},
      { label: 'Cancel', type: 'secondary', closesModal: true }
    ]);

  }

  public onEditSpace(space: ISpace): void {

    this.modals.openModal<SpaceModalData>('Edit Space', SpaceModalComponent, [
      { label: 'Delete', type: 'danger', closesModal: true, promptsConfirmation: true, confirmationLabel: 'Proceed?', callback: () => {

        this.endpoint.deleteSpace(space.id)
        .then(() => {

          this.fetching = true;

          return this.app.fetchSpaces();

        })
        .catch(error => console.error(error))
        .finally(() => this.fetching = false);

      }},
      { label: 'Update', type: 'primary', submit: true, closesModal: true, boundToValidation: true, callback: (modalOutput: SpaceModalData) => {

        this.endpoint.updateSpace(space.id, { name: modalOutput.name })
        .then(() => {

          this.fetching = true;

          return this.app.fetchSpaces();

        })
        .catch(error => console.error(error))
        .finally(() => this.fetching = false);

      }},
      { label: 'Cancel', type: 'secondary', closesModal: true }
    ],
    // Modal data
    {
      name: space.name,
      id: space.id,
      initialState: {
        name: space.name
      }
    });

  }

  public onSelectSpace(space: ISpace, forceNavigation: boolean = false): void {

    this.selectedSpace = space;
    this.filteredCollections = undefined;
    this.filteredSpaces = undefined;

    const isOnSearchRoute = this.router.isActive(`/${space.id}/search`, { queryParams: 'ignored', paths: 'exact', fragment: 'ignored', matrixParams: 'ignored' });

    if ( forceNavigation || (! this.urlCollectionId && ! isOnSearchRoute) )
      this.router.navigate(['/' + space.id]);

    this.fetching = true;

    this.app.fetchCollections(space.id)
    .catch(console.error)
    .finally(() => this.fetching = false);

  }

  public onDeselectSpace(): void {

    this.selectedSpace = undefined;
    this.filteredCollections = undefined;
    this.filteredSpaces = undefined;

    this.app.clearCollections();

    this.router.navigate(['/']);

  }

  public onSearchSpaces(event: TextboxSearchEvent): void {

    if ( ! event.value.trim().length )
      return this.onClearSpacesSearch();

    const regex = this.queryStringToRegex(event.value.trim());

    this.filteredSpaces = this.spaces
    .filter(s => s.name.match(regex));

  }

  public onClearSpacesSearch(): void {

    this.filteredSpaces = undefined;

  }

  public onLogout(): void {

    this.app.clearSpaces();
    this.app.clearCollections();

    this.auth.signOut();

  }

  public onInviteUser(space: ISpace): void {

    this.modals.openModal('Invite to Space', InviteModalComponent, [
      { label: 'Invite', type: 'success', submit: true, closesModal: true, boundToValidation: true, callback: (modalOutput: InviteModalData) => {

        this.endpoint.provisionNewPermission({
          grantee: modalOutput.email,
          spaceId: space.id,
          permission: modalOutput.canModify ? Permission.CanModifyContent : Permission.ReadOnly
        })
        .then(() => this.notifications.create({ type: 'info', message: 'An invitation was sent to the user' }))
        .catch(console.error);

      }},
      { label: 'Cancel', type: 'secondary', closesModal: true }
    ]);

  }

  public onInvitationsClick(): void {

    this.modals.openModal('Invitations', InvitationsModalComponent, [
      { label: 'Close', type: 'secondary', closesModal: true }
    ]);

  }

  public getOwnedSpaces(): ISpace[] {

    return (this.filteredSpaces || this.spaces)
    .filter(s => ! s.shared);

  }

  public getSharedSpaces(): ISpace[] {

    return (this.filteredSpaces || this.spaces)
    .filter(s => !! s.shared);

  }

  public hasWritePermission(): boolean {

    return !! this.selectedSpace && (! this.selectedSpace.shared || this.selectedSpace.permission === Permission.CanModifyContent);

  }

  public onSpaceDropped(event: CdkDragDrop<ISpace[]>): void {

    if ( event.currentIndex === event.previousIndex )
      return;
  
    moveItemInArray(this.spaces, event.previousIndex, event.currentIndex);

    // Reorder
    const currentSpace = this.spaces[event.currentIndex];
    const previousSpace: ISpace | undefined = this.spaces.filter(s => ! s.shared)[event.currentIndex - 1];
    const nextSpace: ISpace | undefined = this.spaces.filter(s => ! s.shared)[event.currentIndex + 1];

    this.spaceReorderingInProgress = true;

    this.endpoint.reorderSpace(
      currentSpace.id,
      nextSpace?.id || null,
      previousSpace?.id || null
    )
    .catch(console.error)
    .finally(() => this.spaceReorderingInProgress = false);

  }

  public onCollectionDropped(event: CdkDragDrop<ICollection[]>): void {

    if ( event.currentIndex === event.previousIndex )
      return;
  
    moveItemInArray(this.collections, event.previousIndex, event.currentIndex);

    // Reorder
    const currentCollection = this.collections[event.currentIndex];
    const previousCollection: ICollection | undefined = this.collections[event.currentIndex - 1];
    const nextCollection: ICollection | undefined = this.collections[event.currentIndex + 1];

    this.collectionReorderingInProgress = true;

    this.endpoint.reorderCollection(
      currentCollection.spaceId,
      currentCollection.id,
      nextCollection?.id || null,
      previousCollection?.id || null
    )
    .catch(console.error)
    .finally(() => this.collectionReorderingInProgress = false);

  }

  public onAvatarFailed(): void {

    this.avatarFailed = true;

  }

  ngOnDestroy(): void {
    
    for ( const sub of this.subscriptions )
      if ( sub && ! sub.closed )
        sub.unsubscribe();
    
  }

}