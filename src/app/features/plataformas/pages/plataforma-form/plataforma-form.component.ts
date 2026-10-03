import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

import { mensajeDeError } from '../../../../core/http/http-error.util';
import { PlataformaPayload } from '../../models/plataforma.model';
import { PlataformasService } from '../../services/plataformas.service';

@Component({
  selector: 'app-plataforma-form',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule],
  templateUrl: './plataforma-form.component.html'
})
export class PlataformaFormComponent implements OnInit {
  private readonly plataformasService = inject(PlataformasService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  /** Llega desde la ruta :id/editar gracias a withComponentInputBinding(). */
  readonly id = input<string>();

  readonly esEdicion = computed(() => this.id() !== undefined);
  readonly cargando = signal(false);
  readonly guardando = signal(false);

  readonly form = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      // cat_pla_nombre es varchar(30) y obligatorio.
      validators: [Validators.required, Validators.maxLength(30)]
    }),
    compania: new FormControl('', {
      nonNullable: true,
      // cat_pla_compania es varchar(40) y admite null.
      validators: [Validators.maxLength(40)]
    })
  });

  ngOnInit(): void {
    const idRuta = this.id();
    if (idRuta !== undefined) {
      this.cargarPlataforma(Number(idRuta));
    }
  }

  guardar(): void {
    this.form.controls.nombre.setValue(this.form.controls.nombre.value.trim());
    this.form.controls.compania.setValue(this.form.controls.compania.value.trim());

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const compania = this.form.controls.compania.value;
    const payload: PlataformaPayload = {
      nombre: this.form.controls.nombre.value,
      compania: compania.length === 0 ? null : compania
    };

    const idRuta = this.id();
    this.guardando.set(true);

    const peticion =
      idRuta === undefined
        ? this.plataformasService.crear(payload)
        : this.plataformasService.actualizar(Number(idRuta), payload);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.messageService.add({
          severity: 'success',
          summary: idRuta === undefined ? 'Plataforma insertada' : 'Plataforma actualizada',
          detail: `"${payload.nombre}" se guardó correctamente.`
        });
        void this.router.navigate(['/plataformas']);
      },
      error: (error: unknown) => {
        this.guardando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo guardar',
          detail: mensajeDeError(error, 'Ocurrió un error al guardar la plataforma.'),
          life: 6000
        });
      }
    });
  }

  private cargarPlataforma(id: number): void {
    this.cargando.set(true);

    this.plataformasService.obtener(id).subscribe({
      next: (plataforma) => {
        this.form.setValue({
          nombre: plataforma.nombre,
          compania: plataforma.compania ?? ''
        });
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo cargar la plataforma',
          detail: mensajeDeError(error, 'El registro solicitado no está disponible.'),
          life: 6000
        });
        void this.router.navigate(['/plataformas']);
      }
    });
  }
}
