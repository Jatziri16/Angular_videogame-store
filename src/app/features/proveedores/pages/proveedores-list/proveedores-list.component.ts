import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

import { mensajeDeError } from '../../../../core/http/http-error.util';
import { Proveedor } from '../../models/proveedor.model';
import { ProveedoresService } from '../../services/proveedores.service';

@Component({
  selector: 'app-proveedores-list',
  imports: [RouterLink, TableModule, ButtonModule, TooltipModule],
  templateUrl: './proveedores-list.component.html'
})
export class ProveedoresListComponent implements OnInit {
  private readonly proveedoresService = inject(ProveedoresService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly proveedores = signal<Proveedor[]>([]);
  readonly cargando = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);

    this.proveedoresService.listar().subscribe({
      next: (proveedores) => {
        this.proveedores.set(proveedores);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.proveedores.set([]);
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo cargar el directorio',
          detail: mensajeDeError(error, 'Ocurrió un error al consultar la API de proveedores.'),
          life: 6000
        });
      }
    });
  }

  /** Correo, teléfono y dirección admiten null o cadena vacía. */
  textoDe(valor: string | null, vacio: string): string {
    const texto = valor?.trim();
    return texto ? texto : vacio;
  }

  confirmarEliminacion(proveedor: Proveedor): void {
    this.confirmationService.confirm({
      header: 'Eliminar proveedor',
      message: `¿Seguro que deseas eliminar "${proveedor.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'app-btn-danger',
      rejectButtonStyleClass: 'app-btn-secondary',
      accept: () => this.eliminar(proveedor)
    });
  }

  private eliminar(proveedor: Proveedor): void {
    this.proveedoresService.eliminar(proveedor.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Proveedor eliminado',
          detail: `"${proveedor.nombre}" ya no está en el directorio.`
        });
        this.cargar();
      },
      error: (error: unknown) => {
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo eliminar',
          detail: mensajeDeError(
            error,
            'Ocurrió un error al eliminar el proveedor. Puede estar en uso por una oferta o una relación.'
          ),
          life: 6000
        });
      }
    });
  }
}
