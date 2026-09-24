import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Videojuego, VideojuegoPayload } from '../models/videojuego.model';

@Injectable({ providedIn: 'root' })
export class VideojuegosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/videojuegos`;

  listar(): Observable<Videojuego[]> {
    return this.http.get<Videojuego[]>(this.url);
  }

  obtener(id: number): Observable<Videojuego> {
    return this.http.get<Videojuego>(`${this.url}/${id}`);
  }

  crear(videojuego: VideojuegoPayload): Observable<Videojuego> {
    return this.http.post<Videojuego>(this.url, videojuego);
  }

  actualizar(id: number, videojuego: VideojuegoPayload): Observable<Videojuego> {
    return this.http.put<Videojuego>(`${this.url}/${id}`, videojuego);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
