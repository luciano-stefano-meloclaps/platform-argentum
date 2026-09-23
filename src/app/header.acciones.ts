"use server";

import { cerrarSesion } from "../identidad/identidad.ts";

/**
 * Server Action del ítem "Salir" del nav (ticket #114, ADR 0019): cierra la
 * sesión actual. Vive junto a `header.tsx`, no dentro de `src/identidad/`,
 * por el mismo motivo que `registrarse/acciones.ts` (#113) vive en
 * `src/app`: es el adaptador de la capa web sobre el módulo, no el módulo
 * mismo.
 *
 * Ticket #120 (ADR 0020, Regla 5): ya **no** hace `redirect("/")`. La nav lee
 * la sesión desde el cliente, así que quien la invoca (`NavPrincipal`) tiene
 * que poder refrescar `useSession()` cuando la acción termina, y un
 * `redirect()` dentro de la acción corta esa continuación. La navegación a la
 * home la hace `NavPrincipal` después del refetch.
 *
 * `identidad.cerrarSesion()` no falla por "no había sesión" (es un no-op
 * válido, ADR 0019) y no necesita ningún dato del formulario que la dispara.
 */
export async function cerrarSesionDesdeNav(): Promise<void> {
  await cerrarSesion();
}
