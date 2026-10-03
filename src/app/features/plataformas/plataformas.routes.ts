import { Routes } from '@angular/router';

export const PLATAFORMAS_ROUTES: Routes = [
  {
    path: '',
    title: 'Plataformas | Tienda Videojuegos',
    loadComponent: () =>
      import('./pages/plataformas-list/plataformas-list.component').then(
        (m) => m.PlataformasListComponent
      )
  },
  {
    path: 'nuevo',
    title: 'Nueva plataforma | Tienda Videojuegos',
    loadComponent: () =>
      import('./pages/plataforma-form/plataforma-form.component').then(
        (m) => m.PlataformaFormComponent
      )
  },
  {
    path: ':id/editar',
    title: 'Editar plataforma | Tienda Videojuegos',
    loadComponent: () =>
      import('./pages/plataforma-form/plataforma-form.component').then(
        (m) => m.PlataformaFormComponent
      )
  }
];
