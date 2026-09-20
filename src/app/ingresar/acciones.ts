"use server";

import { redirect } from "next/navigation";

import { iniciarSesion, type Resultado } from "../../identidad/identidad.ts";

/**
 * Server Action del formulario de login (ticket #114, ADR 0019 Regla 5):
 * mismo patrón que `registrarse/acciones.ts` (#113) — un adaptador chico que
 * extrae los dos campos de `FormData` y se los pasa tal cual a
 * `iniciarSesion`, que ya valida su forma (Zod) y traduce los errores de
 * Better Auth al español (ADR 0019, Regla 4). Ningún mensaje se reescribe ni
 * se duplica acá.
 *
 * Firma de `useActionState`: `(estadoPrevio, formData) => Promise<Resultado>`.
 * `estadoPrevio` no se usa, mismo motivo que en `registrarse/acciones.ts`.
 *
 * Al `ok: true`, `iniciarSesion` ya dejó la cookie de sesión puesta (el
 * plugin `nextCookies()` de `identidad/auth.ts`) y acá se redirige a la
 * home — mismo destino post-login que post-registro, por el mismo motivo:
 * no hay hoy una pantalla de destino más específica construida.
 * `redirect()` va fuera de cualquier `try`.
 */
export async function iniciarSesionConFormulario(_estadoPrevio: Resultado, formData: FormData): Promise<Resultado> {
  const resultado = await iniciarSesion({
    email: String(formData.get("email") ?? ""),
    contrasena: String(formData.get("contrasena") ?? ""),
  });

  if (resultado.ok) redirect("/");

  return resultado;
}
