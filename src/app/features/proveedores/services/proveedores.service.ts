import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Proveedor, ProveedorPayload } from '../models/proveedor.model';

/** Cliente de /api/proveedores (ProveedorRecurso). */
@Injectable({ providedIn: 'root' })
export class ProveedoresService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/proveedores`;

  listar(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.url);
  }

  obtener(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.url}/${id}`);
  }

  crear(proveedor: ProveedorPayload): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.url, proveedor);
  }

  actualizar(id: number, proveedor: ProveedorPayload): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.url}/${id}`, proveedor);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
