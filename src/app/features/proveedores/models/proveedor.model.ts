/** Refleja ProveedorDTO de la API de Java (tabla cat_proveedores). */
export interface Proveedor {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
}
