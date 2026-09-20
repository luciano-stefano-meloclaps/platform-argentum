"use server";

import { redirect } from "next/navigation";

import { registrarse, type Resultado } from "../../identidad/identidad.ts";

/**
 * Server Action del formulario de alta (ticket #113, ADR 0019 Regla 5): la
 * primera mutación real de la capa web que llama a `identidad`. Es un
 * adaptador chico, no una segunda validación — extrae los tres campos de
 * `FormData` y se los pasa tal cual a `registrarse`, que ya valida su forma
 * (Zod) y traduce los errores de Better Auth al español (ADR 0019, Regla 4).
 * Ningún mensaje se reescribe ni se duplica acá.
 *
 * Firma de `useActionState`: `(estadoPrevio, formData) => Promise<Resultado>`.
 * `estadoPrevio` no se usa —`registrarse` no necesita saber qué pasó en el
 * envío anterior—, pero el parámetro es obligatorio para que React reconozca
 * la función como acción de formulario con estado.
 *
 * Al `ok: true`, `registrarse` ya dejó la cookie de sesión puesta (el plugin
 * `nextCookies()` de `identidad/auth.ts` la propaga sola en el contexto de
 * una Server Action) y acá se redirige a la home: no hay todavía una pantalla
 * de "cuenta creada" ni un destino post-registro más específico (`/perfil`,
 * `/mi-progreso`) construido — ninguna de las dos existe hoy. `redirect()`
 * lanza una excepción interna de Next.js que no hay que capturar: por eso va
 * fuera de cualquier `try`.
 */
export async function registrarseConFormulario(_estadoPrevio: Resultado, formData: FormData): Promise<Resultado> {
  const resultado = await registrarse({
    nombre: String(formData.get("nombre") ?? ""),
    email: String(formData.get("email") ?? ""),
    contrasena: String(formData.get("contrasena") ?? ""),
  });

  if (resultado.ok) redirect("/");

  return resultado;
}
