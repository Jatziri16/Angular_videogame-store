/** Refleja OfertaVideojuegoDTO. La tabla en MySQL se llama videojuegos. */
export interface Oferta {
  id: number;
  videojuegoId: number;
  proveedorId: number;
  precioCompra: number | null;
  precioVenta: number | null;
  cantidad: number | null;
}

/** Cuerpo de POST y PUT: el id lo asigna la base de datos. */
export type OfertaPayload = Omit<Oferta, 'id'>;
