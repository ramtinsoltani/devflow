import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';

export const routes: Routes = [
  { path: '', pathMatch: 'full',
    loadComponent: () => import('./components/landing/landing.component').then(c => c.LandingComponent),
    title: 'Devflow: Development Workflow Organizer'
  },
  { path: 'collection/:id',
    loadComponent: () => import('./components/collection/collection.component').then(c => c.CollectionComponent),
    title: () => {

      const routeState = inject(Router).getCurrentNavigation()?.extras.state || {};

      if ( routeState['collectionName'] )
        return `Devflow - ${routeState['collectionName']}`;

      return `Devflow`;

    }
  },
  { path: 'search',
    loadComponent: () => import('./components/search-results/search-results.component').then(c => c.SearchResultsComponent),
    title: 'Devflow - Search Results'
  },
  { path: '**', redirectTo: '/' }
];
