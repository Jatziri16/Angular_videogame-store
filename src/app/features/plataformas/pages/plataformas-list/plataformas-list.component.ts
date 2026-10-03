import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

import { mensajeDeError } from '../../../../core/http/http-error.util';
import { Plataforma } from '../../models/plataforma.model';
import { PlataformasService } from '../../services/plataformas.service';

@Component({
  selector: 'app-plataformas-list',
  imports: [RouterLink, TableModule, ButtonModule, TooltipModule],
  templateUrl: './plataformas-list.component.html'
})
export class PlataformasListComponent implements OnInit {
  private readonly plataformasService = inject(PlataformasService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly plataformas = signal<Plataforma[]>([]);
  readonly cargando = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);

    this.plataformasService.listar().subscribe({
      next: (plataformas) => {
        this.plataformas.set(plataformas);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.plataformas.set([]);
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo cargar el catálogo',
          detail: mensajeDeError(error, 'Ocurrió un error al consultar la API de plataformas.'),
          life: 6000
        });
      }
    });
  }

  /** La compañía es opcional en cat_plataformas. */
  companiaDe(plataforma: Plataforma): string {
    const compania = plataforma.compania?.trim();
    return compania ? compania : 'Sin compañía';
  }

  confirmarEliminacion(plataforma: Plataforma): void {
    this.confirmationService.confirm({
      header: 'Eliminar plataforma',
      message: `¿Seguro que deseas eliminar "${plataforma.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'app-btn-danger',
      rejectButtonStyleClass: 'app-btn-secondary',
      accept: () => this.eliminar(plataforma)
    });
  }

  private eliminar(plataforma: Plataforma): void {
    this.plataformasService.eliminar(plataforma.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Plataforma eliminada',
          detail: `"${plataforma.nombre}" ya no está en el catálogo.`
        });
        this.cargar();
      },
      error: (error: unknown) => {
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo eliminar',
          detail: mensajeDeError(
            error,
            'Ocurrió un error al eliminar la plataforma. Puede estar en uso por un videojuego o una relación.'
          ),
          life: 6000
        });
      }
    });
  }
}
