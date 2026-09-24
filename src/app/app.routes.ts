import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'videojuegos' },
  {
    path: 'videojuegos',
    loadChildren: () =>
      import('./features/videojuegos/videojuegos.routes').then((m) => m.VIDEOJUEGOS_ROUTES)
  },
  { path: '**', redirectTo: 'videojuegos' }
];
