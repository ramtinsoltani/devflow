import { DOCUMENT } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { TextboxComponent, TextboxSearchEvent } from '../shared/textbox/textbox.component';
import { ActivatedRoute, ActivationEnd, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Color, ITag } from '@devflow/models';
import { AppService, UtilsService } from '@devflow/services';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
    TextboxComponent,
    NgStyle,
    RouterLink
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnDestroy {

  private subscriptions: Subscription[] = [];
  private urlCollectionId?: string;
  private urlSpaceId?: string;

  public spaceSelected: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private app: AppService,
    private utils: UtilsService
  ) {

    // Subscribe to route query parameter changes
    this.subscriptions.push(this.route.queryParamMap.subscribe(queryParams => {

      const url = this.router.parseUrl(this.router.url);
      
      url.queryParams = {};
      
      // If not in search route, exit
      if ( url.toString() !== '/search' )
        return;

      const q = queryParams.get('q');
      const tags = queryParams.get('tags');

      // Set query text from route query params
      if ( q )
        this.queryText = q;

      // Set tags from route query params
      if ( tags?.split(',').length )
        this.queryTags = tags.split(',').map(label => ({ label, color: Color.Blue }));

    }));

    // Subscribe to router navigation changes
    this.subscriptions.push(this.router.events.subscribe(event => {

      if ( event instanceof ActivationEnd ) {

        this.spaceSelected = event.snapshot.paramMap.has('spaceId');
        this.urlSpaceId = event.snapshot.paramMap.get('spaceId') || undefined;
        this.urlCollectionId = event.snapshot.paramMap.get('collectionId') || undefined;

        if ( ! this.spaceSelected ) {

          this.queryTags = [];
          this.queryText = '';

        }

        this.updateColors();

      }

    }));

    // Subscribe to collection changes
    this.app.collection$.subscribe(() => this.updateColors());

  }

  private document = inject(DOCUMENT);

  public queryTags: ITag[] = [];
  public queryText: string = '';
  public currentCollectionColor: Color | null = null;

  private updateColors(): void {

    // Read selected collection color
    if ( this.urlCollectionId )
      this.currentCollectionColor = this.app.getCollectionColor(this.urlCollectionId);
    else
      this.currentCollectionColor = null;

    // Set favicon based on collection color
    let faviconPath = `/favicon.ico`;

    if ( this.currentCollectionColor !== null )
      faviconPath = `/assets/favicons/favicon-${this.getFaviconName(this.currentCollectionColor)}.ico`;
      
    this.document.getElementById('favicon')?.setAttribute('href', faviconPath);

  }

  public onSearch(event: TextboxSearchEvent): void {

    if ( ! event.value.trim().length && ! event.tags.length )
      return this.onClearSearch();

    this.router.navigate(['/' + this.urlSpaceId + '/search'], { queryParams: {
      q: event.value.trim() || undefined,
      tags: event.tags.map(t => t.label.trim().toLowerCase()).join(',') || undefined
    }});

  }

  public onClearSearch(): void {

    this.router.navigate([], { relativeTo: this.route });

  }

  public getCollectionCSSColor(color: Color | null): string {

    if ( color === null )
      return `var(--color-gray-6)`;

    return `var(--color-${this.utils.getPaletteColor(color)})`;

  }

  public getFaviconName(color: Color): string {

    return Color[color].toLowerCase();

  }

  ngOnDestroy(): void {
    
    for ( const sub of this.subscriptions )
      if ( sub && ! sub.closed )
        sub.unsubscribe();
    
  }

}
