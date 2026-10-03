import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { catchError, forkJoin, of } from 'rxjs';

import { mensajeDeError } from '../../../../core/http/http-error.util';
import { Plataforma } from '../../../plataformas/models/plataforma.model';
import { PlataformasService } from '../../../plataformas/services/plataformas.service';
import { Videojuego } from '../../models/videojuego.model';
import { VideojuegosService } from '../../services/videojuegos.service';

@Component({
  selector: 'app-videojuegos-list',
  imports: [RouterLink, TableModule, ButtonModule, TooltipModule],
  templateUrl: './videojuegos-list.component.html'
})
export class VideojuegosListComponent implements OnInit {
  private readonly videojuegosService = inject(VideojuegosService);
  private readonly plataformasService = inject(PlataformasService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly videojuegos = signal<Videojuego[]>([]);
  readonly plataformas = signal<Plataforma[]>([]);
  readonly cargando = signal(false);

  private readonly plataformaPorId = computed(
    () => new Map(this.plataformas().map((plataforma) => [plataforma.id, plataforma]))
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);

    forkJoin({
      videojuegos: this.videojuegosService.listar(),
      // El catalogo es complementario: si falla, la tabla sigue siendo util.
      plataformas: this.plataformasService.listar().pipe(catchError(() => of<Plataforma[]>([])))
    }).subscribe({
      next: ({ videojuegos, plataformas }) => {
        this.videojuegos.set(videojuegos);
        this.plataformas.set(plataformas);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.videojuegos.set([]);
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo cargar el inventario',
          detail: mensajeDeError(error, 'Ocurrió un error al consultar la API de videojuegos.'),
          life: 6000
        });
      }
    });
  }

  plataformaDe(videojuego: Videojuego): Plataforma | undefined {
    return videojuego.plataformaId === null
      ? undefined
      : this.plataformaPorId().get(videojuego.plataformaId);
  }

  confirmarEliminacion(videojuego: Videojuego): void {
    this.confirmationService.confirm({
      header: 'Eliminar videojuego',
      message: `¿Seguro que deseas eliminar "${videojuego.titulo}"? Esta acción no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'app-btn-danger',
      rejectButtonStyleClass: 'app-btn-secondary',
      accept: () => this.eliminar(videojuego)
    });
  }

  private eliminar(videojuego: Videojuego): void {
    this.videojuegosService.eliminar(videojuego.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Videojuego eliminado',
          detail: `"${videojuego.titulo}" ya no está en el inventario.`
        });
        this.cargar();
      },
      error: (error: unknown) => {
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo eliminar',
          detail: mensajeDeError(error, 'Ocurrió un error al eliminar el videojuego.'),
          life: 6000
        });
      }
    });
  }
}
