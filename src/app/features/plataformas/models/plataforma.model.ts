/** Refleja PlataformaDTO de la API de Java (tabla cat_plataformas). */
export interface Plataforma {
  id: number;
  nombre: string;
  compania: string | null;
}

/** Cuerpo de POST y PUT: el id lo asigna la base de datos. */
export type PlataformaPayload = Omit<Plataforma, 'id'>;
