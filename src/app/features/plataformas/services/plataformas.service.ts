import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Plataforma, PlataformaPayload } from '../models/plataforma.model';

/** Cliente de /api/plataformas (PlataformaRecurso). */
@Injectable({ providedIn: 'root' })
export class PlataformasService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/plataformas`;

  listar(): Observable<Plataforma[]> {
    return this.http.get<Plataforma[]>(this.url);
  }

  obtener(id: number): Observable<Plataforma> {
    return this.http.get<Plataforma>(`${this.url}/${id}`);
  }

  crear(plataforma: PlataformaPayload): Observable<Plataforma> {
    return this.http.post<Plataforma>(this.url, plataforma);
  }

  actualizar(id: number, plataforma: PlataformaPayload): Observable<Plataforma> {
    return this.http.put<Plataforma>(`${this.url}/${id}`, plataforma);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
