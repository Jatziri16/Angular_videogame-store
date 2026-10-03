import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Oferta, OfertaPayload } from '../models/oferta.model';

/** Cliente de /api/ofertas (OfertaVideojuegoRecurso). */
@Injectable({ providedIn: 'root' })
export class OfertasService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/ofertas`;

  listar(): Observable<Oferta[]> {
    return this.http.get<Oferta[]>(this.url);
  }

  obtener(id: number): Observable<Oferta> {
    return this.http.get<Oferta>(`${this.url}/${id}`);
  }

  crear(oferta: OfertaPayload): Observable<Oferta> {
    return this.http.post<Oferta>(this.url, oferta);
  }

  actualizar(id: number, oferta: OfertaPayload): Observable<Oferta> {
    return this.http.put<Oferta>(`${this.url}/${id}`, oferta);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
