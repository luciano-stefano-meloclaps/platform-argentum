import { createAuthClient } from "better-auth/react";

/**
 * El único cliente de Better Auth para el navegador (ADR 0019 Regla 4,
 * ampliada por el ADR 0020 Regla 2). Lo comparten el botón «Continuar con
 * Google» y la nav (`useSession()`): un solo `createAuthClient()` en vez de
 * uno por archivo, así comparten también el estado de la sesión.
 *
 * Vive en `src/app`, y no en `src/identidad/`, por el mismo motivo que ya
 * tenía el botón: el lint que restringe `src/app` a importar solo
 * `identidad/identidad.ts` no distingue esta excepción del navegador. Solo lo
 * importan Client Components; nunca lo importa código de servidor.
 *
 * Sin `baseURL`: corre en el mismo origen que `/api/auth/[...all]`.
 */
export const authClient = createAuthClient();
