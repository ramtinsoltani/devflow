import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./components/landing/landing.component').then(c => c.LandingComponent) },
  { path: 'collection/:id', loadComponent: () => import('./components/collection/collection.component').then(c => c.CollectionComponent) },
  { path: 'search', loadComponent: () => import('./components/search-results/search-results.component').then(c => c.SearchResultsComponent) },
  { path: '**', redirectTo: '/' }
];
