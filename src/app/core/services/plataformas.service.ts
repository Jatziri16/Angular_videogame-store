import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Plataforma } from '../models/plataforma.model';

@Injectable({ providedIn: 'root' })
export class PlataformasService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/plataformas`;

  listar(): Observable<Plataforma[]> {
    return this.http.get<Plataforma[]>(this.url);
  }
}
