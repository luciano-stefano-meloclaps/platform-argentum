import { toNextJsHandler } from "better-auth/next-js";

import { obtenerAuth } from "../../../../identidad/auth.ts";

/**
 * Ruta de protocolo de Better Auth (ADR 0019, Regla 3): intercambio de
 * cookies de sesión y callback de OAuth de Google. No es el `/api` interno
 * que la Regla 2 del ADR 0016 prohíbe —no expone ningún contrato de dominio
 * de este proyecto—: es infraestructura obligatoria de un tercero, generada
 * por `toNextJsHandler` y consumida únicamente por el propio cliente de
 * Better Auth en el navegador.
 *
 * Importa `../../../../identidad/auth.ts` directo, no `identidad.ts`: esta
 * ruta necesita la instancia cruda de Better Auth, no el contrato de dominio
 * del módulo (que no incluye el protocolo OAuth en sí). Es la única
 * excepción nombrada a "desde `src/app` solo se importa la interfaz pública
 * de un módulo".
 */

// El handler se arma en cada petición y no al importar la ruta: así `next build`
// no construye Better Auth (ni exige sus variables) al recolectar datos de
// página. La instancia es un singleton, así que el costo es solo el envoltorio.
export function GET(request: Request) {
  return toNextJsHandler(obtenerAuth()).GET(request);
}

export function POST(request: Request) {
  return toNextJsHandler(obtenerAuth()).POST(request);
}
