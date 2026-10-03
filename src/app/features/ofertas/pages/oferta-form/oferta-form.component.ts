import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

import { mensajeDeError } from '../../../../core/http/http-error.util';
import { Plataforma } from '../../../plataformas/models/plataforma.model';
import { PlataformasService } from '../../../plataformas/services/plataformas.service';
import { Proveedor } from '../../../proveedores/models/proveedor.model';
import { ProveedoresService } from '../../../proveedores/services/proveedores.service';
import { Videojuego } from '../../../videojuegos/models/videojuego.model';
import { VideojuegosService } from '../../../videojuegos/services/videojuegos.service';
import { OfertaPayload } from '../../models/oferta.model';
import { OfertasService } from '../../services/ofertas.service';

/** vj_precio_compra y vj_precio_venta son decimal(8,2). */
const PRECIO_MAXIMO = 999999.99;

@Component({
  selector: 'app-oferta-form',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, SelectModule],
  templateUrl: './oferta-form.component.html'
})
export class OfertaFormComponent implements OnInit {
  private readonly ofertasService = inject(OfertasService);
  private readonly videojuegosService = inject(VideojuegosService);
  private readonly proveedoresService = inject(ProveedoresService);
  private readonly plataformasService = inject(PlataformasService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  /** Llega desde la ruta :id/editar gracias a withComponentInputBinding(). */
  readonly id = input<string>();

  readonly esEdicion = computed(() => this.id() !== undefined);
  readonly videojuegos = signal<Videojuego[]>([]);
  readonly proveedores = signal<Proveedor[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);

  private readonly plataformas = signal<Plataforma[]>([]);

  readonly form = new FormGroup({
    videojuegoId: new FormControl<number | null>(null, Validators.required),
    proveedorId: new FormControl<number | null>(null, Validators.required),
    precioCompra: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(PRECIO_MAXIMO)
    ]),
    precioVenta: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(PRECIO_MAXIMO)
    ]),
    cantidad: new FormControl<number | null>(null, [Validators.required, Validators.min(0)])
  });

  ngOnInit(): void {
    this.cargarCatalogos();

    const idRuta = this.id();
    if (idRuta !== undefined) {
      this.cargarOferta(Number(idRuta));
    }
  }

  /** No se guarda: se muestra según la plataforma del videojuego elegido. */
  plataformaSeleccionada(): string {
    const videojuegoId = this.form.controls.videojuegoId.value;
    if (videojuegoId === null) {
      return 'Se asigna automáticamente según el videojuego';
    }

    const videojuego = this.videojuegos().find((item) => item.id === videojuegoId);
    const plataforma =
      videojuego?.plataformaId == null
        ? undefined
        : this.plataformas().find((item) => item.id === videojuego.plataformaId);

    if (!plataforma) {
      return 'Sin plataforma asignada';
    }

    return plataforma.compania ? `${plataforma.nombre} - ${plataforma.compania}` : plataforma.nombre;
  }

  guardar(): void {
    const cantidad = this.form.controls.cantidad.value;
    if (cantidad !== null && !Number.isInteger(cantidad)) {
      this.form.controls.cantidad.setErrors({ entero: true });
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: OfertaPayload = {
      videojuegoId: this.form.controls.videojuegoId.value as number,
      proveedorId: this.form.controls.proveedorId.value as number,
      precioCompra: this.dinero(this.form.controls.precioCompra.value as number),
      precioVenta: this.dinero(this.form.controls.precioVenta.value as number),
      cantidad
    };

    const idRuta = this.id();
    this.guardando.set(true);

    const peticion =
      idRuta === undefined
        ? this.ofertasService.crear(payload)
        : this.ofertasService.actualizar(Number(idRuta), payload);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.messageService.add({
          severity: 'success',
          summary: idRuta === undefined ? 'Oferta insertada' : 'Oferta actualizada',
          detail: 'La oferta se guardó correctamente.'
        });
        void this.router.navigate(['/ofertas']);
      },
      error: (error: unknown) => {
        this.guardando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo guardar',
          detail: mensajeDeError(error, 'Ocurrió un error al guardar la oferta.'),
          life: 6000
        });
      }
    });
  }

  private cargarCatalogos(): void {
    this.videojuegosService.listar().subscribe({
      next: (videojuegos) => this.videojuegos.set(videojuegos),
      error: (error: unknown) => this.avisarCatalogo(error, 'No se pudieron cargar los videojuegos.')
    });

    this.proveedoresService.listar().subscribe({
      next: (proveedores) => this.proveedores.set(proveedores),
      error: (error: unknown) => this.avisarCatalogo(error, 'No se pudieron cargar los proveedores.')
    });

    this.plataformasService.listar().subscribe({
      next: (plataformas) => this.plataformas.set(plataformas),
      error: () => this.plataformas.set([])
    });
  }

  private cargarOferta(id: number): void {
    this.cargando.set(true);

    this.ofertasService.obtener(id).subscribe({
      next: (oferta) => {
        this.form.setValue({
          videojuegoId: oferta.videojuegoId,
          proveedorId: oferta.proveedorId,
          precioCompra: oferta.precioCompra,
          precioVenta: oferta.precioVenta,
          cantidad: oferta.cantidad
        });
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo cargar la oferta',
          detail: mensajeDeError(error, 'El registro solicitado no está disponible.'),
          life: 6000
        });
        void this.router.navigate(['/ofertas']);
      }
    });
  }

  private avisarCatalogo(error: unknown, alterno: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Catálogo incompleto',
      detail: mensajeDeError(error, alterno),
      life: 6000
    });
  }

  /** Ajusta el valor a dos decimales, como decimal(8,2). */
  private dinero(valor: number): number {
    return Math.round(valor * 100) / 100;
  }
}
