import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full',
    loadComponent: () => import('./components/landing/landing.component').then(c => c.LandingComponent),
    title: 'Devflow: Development Workflow Organizer',
    canActivate: [authGuard]
  },
  { path: 'login',
    loadComponent: () => import('./components/login/login.component').then(c => c.LoginComponent),
    title: 'Devflow'
  },
  { path: ':spaceId',
    loadComponent: () => import('./components/space/space.component').then(c => c.SpaceComponent),
    title: () => {

      const routeState = inject(Router).getCurrentNavigation()?.extras.state || {};

      if ( routeState['spaceName'] )
        return `Devflow - ${routeState['spaceName']}`;

      return `Devflow`;

    },
    canActivate: [authGuard]
  },
  { path: ':spaceId/search',
    loadComponent: () => import('./components/search-results/search-results.component').then(c => c.SearchResultsComponent),
    title: () => {

      const routeState = inject(Router).getCurrentNavigation()?.extras.state || {};

      if ( routeState['spaceName'] )
        return `Devflow - ${routeState['spaceName']} / Search Results`;

      return `Devflow - Search Results`;

    },
    canActivate: [authGuard]
  },
  { path: ':spaceId/:collectionId',
    loadComponent: () => import('./components/collection/collection.component').then(c => c.CollectionComponent),
    title: () => {

      const routeState = inject(Router).getCurrentNavigation()?.extras.state || {};

      if ( routeState['spaceName'] && routeState['collectionName'] )
        return `Devflow - ${routeState['spaceName']} / ${routeState['collectionName']}`;

      return `Devflow`;

    },
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/' }
];
