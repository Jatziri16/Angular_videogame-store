import { Routes } from '@angular/router';

export const PROVEEDORES_ROUTES: Routes = [
  {
    path: '',
    title: 'Proveedores | Tienda Videojuegos',
    loadComponent: () =>
      import('./pages/proveedores-list/proveedores-list.component').then(
        (m) => m.ProveedoresListComponent
      )
  },
  {
    path: 'nuevo',
    title: 'Nuevo proveedor | Tienda Videojuegos',
    loadComponent: () =>
      import('./pages/proveedor-form/proveedor-form.component').then(
        (m) => m.ProveedorFormComponent
      )
  },
  {
    path: ':id/editar',
    title: 'Editar proveedor | Tienda Videojuegos',
    loadComponent: () =>
      import('./pages/proveedor-form/proveedor-form.component').then(
        (m) => m.ProveedorFormComponent
      )
  }
];
