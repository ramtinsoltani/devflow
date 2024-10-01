import { DOCUMENT } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { TextboxComponent, TextboxSearchEvent } from '../shared/textbox/textbox.component';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Color, ITag } from '@devflow/models';
import { AppService, UtilsService } from '@devflow/services';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    TextboxComponent,
    NgStyle
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnDestroy {

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private app: AppService,
    private utils: UtilsService
  ) {

    this.subscriptions.push(this.route.queryParamMap.subscribe(queryParams => {

      const url = this.router.parseUrl(this.router.url);
      
      url.queryParams = {};
      
      if ( url.toString() !== '/search' )
        return;

      const q = queryParams.get('q');
      const tags = queryParams.get('tags');

      if ( q )
        this.queryText = q;

      if ( tags?.split(',').length )
        this.queryTags = tags.split(',').map(label => ({ label, color: Color.Blue }));

    }));

    this.subscriptions.push(this.router.events.subscribe(event => {

      if ( event instanceof NavigationEnd ) {

        if ( event.url.startsWith('/collection/') )
          this.currentCollectionColor = this.app.getCollectionColor(event.url.replace('/collection/', ''));
        else
          this.currentCollectionColor = null;

        let faviconPath = `/favicon.ico`;

        if ( this.currentCollectionColor !== null )
          faviconPath = `/assets/favicons/favicon-${this.getFaviconName(this.currentCollectionColor)}.ico`;
          
        this.document.getElementById('favicon')?.setAttribute('href', faviconPath);

      }

    }));

  }

  private document = inject(DOCUMENT);

  public queryTags: ITag[] = [];
  public queryText: string = '';
  public currentCollectionColor: Color | null = null;

  public onSearch(event: TextboxSearchEvent): void {

    if ( ! event.value.trim().length && ! event.tags.length )
      return this.onClearSearch();

    this.router.navigate(['/search'], { queryParams: {
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
