import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

import { mensajeDeError } from '../../../../core/http/http-error.util';
import { Plataforma } from '../../../../core/models/plataforma.model';
import { PlataformasService } from '../../../../core/services/plataformas.service';
import { VideojuegoPayload } from '../../models/videojuego.model';
import { VideojuegosService } from '../../services/videojuegos.service';

@Component({
  selector: 'app-videojuego-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    SelectModule
  ],
  templateUrl: './videojuego-form.component.html'
})
export class VideojuegoFormComponent implements OnInit {
  private readonly videojuegosService = inject(VideojuegosService);
  private readonly plataformasService = inject(PlataformasService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  /** Llega desde la ruta :id/editar gracias a withComponentInputBinding(). */
  readonly id = input<string>();

  readonly esEdicion = computed(() => this.id() !== undefined);
  readonly plataformas = signal<Plataforma[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);

  readonly form = new FormGroup({
    titulo: new FormControl('', {
      nonNullable: true,
      // cat_vid_nombre es varchar(25) en MySQL.
      validators: [Validators.required, Validators.maxLength(25)]
    }),
    plataformaId: new FormControl<number | null>(null),
    inventario: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)]
    })
  });

  ngOnInit(): void {
    this.cargarPlataformas();

    const idRuta = this.id();
    if (idRuta !== undefined) {
      this.cargarVideojuego(Number(idRuta));
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: VideojuegoPayload = {
      titulo: this.form.controls.titulo.value.trim(),
      plataformaId: this.form.controls.plataformaId.value,
      inventario: this.form.controls.inventario.value
    };

    const idRuta = this.id();
    this.guardando.set(true);

    const peticion =
      idRuta === undefined
        ? this.videojuegosService.crear(payload)
        : this.videojuegosService.actualizar(Number(idRuta), payload);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.messageService.add({
          severity: 'success',
          summary: idRuta === undefined ? 'Videojuego insertado' : 'Videojuego actualizado',
          detail: `"${payload.titulo}" se guardó correctamente.`
        });
        void this.router.navigate(['/videojuegos']);
      },
      error: (error: unknown) => {
        this.guardando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo guardar',
          detail: mensajeDeError(error, 'Ocurrió un error al guardar el videojuego.'),
          life: 6000
        });
      }
    });
  }

  private cargarPlataformas(): void {
    this.plataformasService.listar().subscribe({
      next: (plataformas) => this.plataformas.set(plataformas),
      error: (error: unknown) => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Sin catálogo de plataformas',
          detail: mensajeDeError(error, 'No se pudieron cargar las plataformas disponibles.'),
          life: 6000
        });
      }
    });
  }

  private cargarVideojuego(id: number): void {
    this.cargando.set(true);

    this.videojuegosService.obtener(id).subscribe({
      next: (videojuego) => {
        this.form.setValue({
          titulo: videojuego.titulo,
          plataformaId: videojuego.plataformaId,
          inventario: videojuego.inventario
        });
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo cargar el videojuego',
          detail: mensajeDeError(error, 'El registro solicitado no está disponible.'),
          life: 6000
        });
        void this.router.navigate(['/videojuegos']);
      }
    });
  }
}
