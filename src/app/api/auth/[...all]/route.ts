import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "../../../../identidad/auth.ts";

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
export const { GET, POST } = toNextJsHandler(auth);
