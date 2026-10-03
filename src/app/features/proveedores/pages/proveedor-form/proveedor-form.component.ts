import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

import { mensajeDeError } from '../../../../core/http/http-error.util';
import { ProveedorPayload } from '../../models/proveedor.model';
import { ProveedoresService } from '../../services/proveedores.service';

@Component({
  selector: 'app-proveedor-form',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule],
  templateUrl: './proveedor-form.component.html'
})
export class ProveedorFormComponent implements OnInit {
  private readonly proveedoresService = inject(ProveedoresService);
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
      // cat_prov_nombre es varchar(60) y obligatorio.
      validators: [Validators.required, Validators.maxLength(60)]
    }),
    email: new FormControl('', {
      nonNullable: true,
      // cat_prov_correo es varchar(100) y admite null.
      validators: [Validators.email, Validators.maxLength(100)]
    }),
    telefono: new FormControl('', {
      nonNullable: true,
      // cat_prov_tel es varchar(20) y admite null.
      validators: [Validators.maxLength(20)]
    }),
    direccion: new FormControl('', {
      nonNullable: true,
      // cat_prov_direccion es varchar(150) y admite null.
      validators: [Validators.maxLength(150)]
    })
  });

  ngOnInit(): void {
    const idRuta = this.id();
    if (idRuta !== undefined) {
      this.cargarProveedor(Number(idRuta));
    }
  }

  guardar(): void {
    this.form.controls.nombre.setValue(this.form.controls.nombre.value.trim());
    this.form.controls.email.setValue(this.form.controls.email.value.trim());
    this.form.controls.telefono.setValue(this.form.controls.telefono.value.trim());
    this.form.controls.direccion.setValue(this.form.controls.direccion.value.trim());

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: ProveedorPayload = {
      nombre: this.form.controls.nombre.value,
      email: this.vacioComoNull(this.form.controls.email.value),
      telefono: this.vacioComoNull(this.form.controls.telefono.value),
      direccion: this.vacioComoNull(this.form.controls.direccion.value)
    };

    const idRuta = this.id();
    this.guardando.set(true);

    const peticion =
      idRuta === undefined
        ? this.proveedoresService.crear(payload)
        : this.proveedoresService.actualizar(Number(idRuta), payload);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.messageService.add({
          severity: 'success',
          summary: idRuta === undefined ? 'Proveedor insertado' : 'Proveedor actualizado',
          detail: `"${payload.nombre}" se guardó correctamente.`
        });
        void this.router.navigate(['/proveedores']);
      },
      error: (error: unknown) => {
        this.guardando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo guardar',
          detail: mensajeDeError(error, 'Ocurrió un error al guardar el proveedor.'),
          life: 6000
        });
      }
    });
  }

  private cargarProveedor(id: number): void {
    this.cargando.set(true);

    this.proveedoresService.obtener(id).subscribe({
      next: (proveedor) => {
        this.form.setValue({
          nombre: proveedor.nombre,
          email: proveedor.email ?? '',
          telefono: proveedor.telefono ?? '',
          direccion: proveedor.direccion ?? ''
        });
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo cargar el proveedor',
          detail: mensajeDeError(error, 'El registro solicitado no está disponible.'),
          life: 6000
        });
        void this.router.navigate(['/proveedores']);
      }
    });
  }

  private vacioComoNull(valor: string): string | null {
    return valor.length === 0 ? null : valor;
  }
}
