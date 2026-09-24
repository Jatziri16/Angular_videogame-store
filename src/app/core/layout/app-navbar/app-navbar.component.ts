import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-navbar.component.html'
})
export class AppNavbarComponent {
  /** Secciones que aun viven solo en las pantallas JSP. */
  readonly seccionesPendientes = ['Ofertas', 'Proveedores', 'Plataformas', 'Relaciones'];

  readonly menuAbierto = signal(false);

  alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }
}
