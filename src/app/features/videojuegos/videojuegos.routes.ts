import { Routes } from '@angular/router';

export const VIDEOJUEGOS_ROUTES: Routes = [
  {
    path: '',
    title: 'Videojuegos | Tienda Videojuegos',
    loadComponent: () =>
      import('./pages/videojuegos-list/videojuegos-list.component').then(
        (m) => m.VideojuegosListComponent
      )
  },
  {
    path: 'nuevo',
    title: 'Nuevo videojuego | Tienda Videojuegos',
    loadComponent: () =>
      import('./pages/videojuego-form/videojuego-form.component').then(
        (m) => m.VideojuegoFormComponent
      )
  },
  {
    path: ':id/editar',
    title: 'Editar videojuego | Tienda Videojuegos',
    loadComponent: () =>
      import('./pages/videojuego-form/videojuego-form.component').then(
        (m) => m.VideojuegoFormComponent
      )
  }
];
