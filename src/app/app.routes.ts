import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'videojuegos' },
  {
    path: 'videojuegos',
    loadChildren: () =>
      import('./features/videojuegos/videojuegos.routes').then((m) => m.VIDEOJUEGOS_ROUTES)
  },
  {
    path: 'ofertas',
    loadChildren: () => import('./features/ofertas/ofertas.routes').then((m) => m.OFERTAS_ROUTES)
  },
  {
    path: 'proveedores',
    loadChildren: () =>
      import('./features/proveedores/proveedores.routes').then((m) => m.PROVEEDORES_ROUTES)
  },
  {
    path: 'plataformas',
    loadChildren: () =>
      import('./features/plataformas/plataformas.routes').then((m) => m.PLATAFORMAS_ROUTES)
  },
  { path: '**', redirectTo: 'videojuegos' }
];
