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
import { Proveedor } from '../../../proveedores/models/proveedor.model';
import { ProveedoresService } from '../../../proveedores/services/proveedores.service';
import { Videojuego } from '../../../videojuegos/models/videojuego.model';
import { VideojuegosService } from '../../../videojuegos/services/videojuegos.service';
import { Oferta } from '../../models/oferta.model';
import { OfertasService } from '../../services/ofertas.service';

@Component({
  selector: 'app-ofertas-list',
  imports: [RouterLink, TableModule, ButtonModule, TooltipModule],
  templateUrl: './ofertas-list.component.html'
})
export class OfertasListComponent implements OnInit {
  private readonly ofertasService = inject(OfertasService);
  private readonly videojuegosService = inject(VideojuegosService);
  private readonly proveedoresService = inject(ProveedoresService);
  private readonly plataformasService = inject(PlataformasService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly ofertas = signal<Oferta[]>([]);
  readonly cargando = signal(false);

  private readonly videojuegos = signal<Videojuego[]>([]);
  private readonly proveedores = signal<Proveedor[]>([]);
  private readonly plataformas = signal<Plataforma[]>([]);

  private readonly videojuegoPorId = computed(
    () => new Map(this.videojuegos().map((videojuego) => [videojuego.id, videojuego]))
  );
  private readonly proveedorPorId = computed(
    () => new Map(this.proveedores().map((proveedor) => [proveedor.id, proveedor]))
  );
  private readonly plataformaPorId = computed(
    () => new Map(this.plataformas().map((plataforma) => [plataforma.id, plataforma]))
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);

    forkJoin({
      ofertas: this.ofertasService.listar(),
      // Los catálogos solo enriquecen la tabla. Si fallan, se muestran los ids.
      videojuegos: this.videojuegosService.listar().pipe(catchError(() => of<Videojuego[]>([]))),
      proveedores: this.proveedoresService.listar().pipe(catchError(() => of<Proveedor[]>([]))),
      plataformas: this.plataformasService.listar().pipe(catchError(() => of<Plataforma[]>([])))
    }).subscribe({
      next: ({ ofertas, videojuegos, proveedores, plataformas }) => {
        this.ofertas.set(ofertas);
        this.videojuegos.set(videojuegos);
        this.proveedores.set(proveedores);
        this.plataformas.set(plataformas);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.ofertas.set([]);
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo cargar las ofertas',
          detail: mensajeDeError(error, 'Ocurrió un error al consultar la API de ofertas.'),
          life: 6000
        });
      }
    });
  }

  tituloDe(oferta: Oferta): string {
    return this.videojuegoPorId().get(oferta.videojuegoId)?.titulo ?? `Videojuego #${oferta.videojuegoId}`;
  }

  proveedorDe(oferta: Oferta): string {
    return this.proveedorPorId().get(oferta.proveedorId)?.nombre ?? `Proveedor #${oferta.proveedorId}`;
  }

  /** La plataforma sale del videojuego; la oferta no la guarda. */
  plataformaDe(oferta: Oferta): Plataforma | undefined {
    const plataformaId = this.videojuegoPorId().get(oferta.videojuegoId)?.plataformaId;
    return plataformaId == null ? undefined : this.plataformaPorId().get(plataformaId);
  }

  precioDe(valor: number | null): string {
    return `$${(valor ?? 0).toFixed(2)}`;
  }

  confirmarEliminacion(oferta: Oferta): void {
    this.confirmationService.confirm({
      header: 'Eliminar oferta',
      message: `¿Seguro que deseas eliminar la oferta de "${this.tituloDe(oferta)}"? Esta acción no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'app-btn-danger',
      rejectButtonStyleClass: 'app-btn-secondary',
      accept: () => this.eliminar(oferta)
    });
  }

  private eliminar(oferta: Oferta): void {
    const titulo = this.tituloDe(oferta);

    this.ofertasService.eliminar(oferta.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Oferta eliminada',
          detail: `La oferta de "${titulo}" ya no está registrada.`
        });
        this.cargar();
      },
      error: (error: unknown) => {
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo eliminar',
          detail: mensajeDeError(error, 'Ocurrió un error al eliminar la oferta.'),
          life: 6000
        });
      }
    });
  }
}
