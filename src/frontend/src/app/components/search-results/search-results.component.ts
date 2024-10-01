import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IItem } from '@devflow/models';
import { EndpointService } from '@devflow/services';
import { Subscription } from 'rxjs';
import { ItemComponent, TagFilterEvent } from '../shared/item/item.component';
import { EmptyPlaceholderComponent } from '../shared/empty-placeholder/empty-placeholder.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [
    ItemComponent,
    EmptyPlaceholderComponent,
    NgClass
  ],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss'
})
export class SearchResultsComponent implements OnDestroy {

  private subscriptions: Subscription[] = [];

  public filteredItems: IItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private endpoint: EndpointService
  ) {

    this.subscriptions.push(this.route.queryParamMap.subscribe(queryParams => {

      const q = queryParams.get('q') || undefined;
      const tags = queryParams.get('tags')?.split(',').map(t => t.trim().toLowerCase());

      if ( ! q && ! tags ) {
        
        this.router.navigate(['/']);

        return;

      }

      this.endpoint.searchItems(q, tags)
      .then(items => this.filteredItems = items)
      .catch(error => console.error(error));

    }));

  }

  public onItemUpdated(index: number, updatedItem: IItem | null): void {

    if ( ! updatedItem ) {

      this.filteredItems.splice(index, 1);
      
      return;

    }

    this.filteredItems[index] = updatedItem;

  }

  public onTagFilter(collectionId: string, event: TagFilterEvent): void {

    if ( event.ctrlKey )
      this.router.navigate([`/collection/${collectionId}`], { queryParams: { tags: event.tag }});
    else
      this.router.navigate([], { relativeTo: this.route, queryParams: { tags: event.tag }});

  }

  ngOnDestroy(): void {
    
    for ( const sub of this.subscriptions )
      if ( sub && ! sub.closed )
        sub.unsubscribe();
    
  }

}
