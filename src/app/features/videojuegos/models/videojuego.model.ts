/** Refleja VideojuegoDTO de la API de Java (tabla cat_videojuegos). */
export interface Videojuego {
  id: number;
  titulo: string;
  plataformaId: number | null;
  inventario: number;
}

/** Cuerpo aceptado por POST y PUT: el id lo asigna la base de datos. */
export type VideojuegoPayload = Omit<Videojuego, 'id'>;
