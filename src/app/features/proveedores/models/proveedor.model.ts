/** Refleja ProveedorDTO de la API de Java (tabla cat_proveedores). */
export interface Proveedor {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
}

/** Cuerpo de POST y PUT: el id lo asigna la base de datos. */
export type ProveedorPayload = Omit<Proveedor, 'id'>;
