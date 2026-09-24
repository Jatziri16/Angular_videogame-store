import { HttpErrorResponse } from '@angular/common/http';

/**
 * La API de Java responde los errores como { status, error }.
 * Devuelve ese mensaje cuando existe y, si no, uno alterno legible.
 */
export function mensajeDeError(error: unknown, alterno: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No se pudo conectar con la API de Java. Verifica que el servidor esté en ejecución.';
    }

    const cuerpo = error.error as { error?: string } | null;
    if (cuerpo && typeof cuerpo.error === 'string' && cuerpo.error.trim().length > 0) {
      return cuerpo.error;
    }
  }

  return alterno;
}
