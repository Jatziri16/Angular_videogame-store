import { Routes } from '@angular/router';

export const OFERTAS_ROUTES: Routes = [
  {
    path: '',
    title: 'Ofertas | Tienda Videojuegos',
    loadComponent: () =>
      import('./pages/ofertas-list/ofertas-list.component').then((m) => m.OfertasListComponent)
  },
  {
    path: 'nuevo',
    title: 'Nueva oferta | Tienda Videojuegos',
    loadComponent: () =>
      import('./pages/oferta-form/oferta-form.component').then((m) => m.OfertaFormComponent)
  },
  {
    path: ':id/editar',
    title: 'Editar oferta | Tienda Videojuegos',
    loadComponent: () =>
      import('./pages/oferta-form/oferta-form.component').then((m) => m.OfertaFormComponent)
  }
];
