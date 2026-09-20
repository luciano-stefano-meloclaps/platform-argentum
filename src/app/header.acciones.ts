"use server";

import { redirect } from "next/navigation";

import { cerrarSesion } from "../identidad/identidad.ts";

/**
 * Server Action del ítem "Salir" del nav (ticket #114, ADR 0019): cierra la
 * sesión actual y vuelve a la home. Vive junto a `header.tsx`, no dentro de
 * `src/identidad/`, por el mismo motivo que `registrarse/acciones.ts` (#113)
 * vive en `src/app`: es el adaptador de la capa web sobre el módulo, no el
 * módulo mismo.
 *
 * `identidad.cerrarSesion()` no falla por "no había sesión" (es un no-op
 * válido, ADR 0019) y no necesita ningún dato del formulario que la
 * dispara —un `<form action={cerrarSesionDesdeNav}>` sin campos, en
 * `NavPrincipal`—, así que la función no declara el parámetro de `FormData`
 * que React le pasa igual: TypeScript acepta una función con menos
 * parámetros que el tipo que la espera, y así no queda un parámetro sin usar
 * que el linter marque.
 *
 * `redirect()` lanza una excepción interna de Next.js que no hay que
 * capturar: va fuera de cualquier `try`, y como no hay ningún `try` acá
 * (`cerrarSesion` de `identidad.ts` no relanza para el caso "no había
 * sesión"), no hace falta más que llamarla después del `await`.
 */
export async function cerrarSesionDesdeNav(): Promise<void> {
  await cerrarSesion();
  redirect("/");
}
