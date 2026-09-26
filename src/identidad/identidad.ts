import "server-only";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { z } from "zod";

import { obtenerAuth } from "./auth.ts";
import { traducirError, type InfoError } from "./mensajes-de-error.ts";

/**
 * El módulo `identidad` (ADR 0002, ADR 0019): la única superficie de
 * importación para todo lo que Better Auth resuelve sin un salto de
 * navegador. `src/identidad/auth.ts` (la instancia de Better Auth) es interno
 * y no se importa desde afuera de `src/identidad/`, con la única excepción
 * nombrada y acotada de `src/app/api/auth/[...all]/route.ts` (ADR 0019,
 * Regla 3).
 *
 * **Interfaz:**
 *
 * - `registrarse(datos)` — alta con email y contraseña.
 * - `iniciarSesion(credenciales)` — inicio de sesión con email y contraseña.
 * - `cerrarSesion()`.
 * - `obtenerSesion()` — la sesión actual, o `undefined`.
 *
 * **La única excepción real a "la capa web le pide al módulo"** (ADR 0019,
 * Regla 4): el botón "Continuar con Google" no pasa por acá. Dispara el
 * cliente de Better Auth (`authClient.signIn.social`) directo desde un
 * componente de cliente, porque el flujo OAuth es una coreografía de varios
 * saltos del navegador que ninguna función de servidor puede mediar sola.
 *
 * **Invariantes:**
 *
 * - Validación de forma (Zod) **antes** de invocar a Better Auth: formato de
 *   email, contraseña no vacía / con longitud mínima. Corre en el servidor,
 *   sin esperar una vuelta de red a Better Auth para poder mostrar un error
 *   de campo.
 * - **Errores:** ninguna de las cuatro lanza por un error esperado del
 *   usuario (contraseña incorrecta, email ya registrado, formato inválido):
 *   devuelven `{ ok: true } | { ok: false, mensaje, campo? }`, mismo criterio
 *   que `catalogo.ts` aplica para "no encontrado" (ver
 *   `docs/decisiones-pendientes.md` §1). Un fallo que **no** es una decisión
 *   del usuario —Better Auth u otra dependencia rompiendo de un modo que el
 *   diccionario de errores no anticipa— sigue el criterio general y se deja
 *   propagar como excepción.
 * - `mensaje` sale del diccionario de `mensajes-de-error.ts`, que traduce los
 *   `$ERROR_CODES` de Better Auth (en inglés) a español.
 * - `server-only`: importar este módulo desde un componente de cliente rompe
 *   el build.
 *
 * **No es de este módulo:** verificación de email y recuperación de
 * contraseña (ADR 0019, fuera de alcance; `docs/decisiones-pendientes.md`
 * §6, bloqueada por la elección de un proveedor de envío de correo).
 */

const esquemaRegistro = z.object({
  nombre: z.string().trim().min(1, "El nombre no puede estar vacío."),
  email: z.string().trim().min(1, "El email no puede estar vacío.").email("El email no tiene un formato válido."),
  // Mismo mínimo que `emailAndPassword.minPasswordLength` (valor por omisión
  // de Better Auth, no fijado a mano en `auth.ts`): validar acá con el mismo
  // número evita que un dato inválido llegue a pedirle un viaje de red a
  // Better Auth para enterarse de lo mismo.
  contrasena: z.string().min(8, "La contraseña tiene que tener al menos 8 caracteres."),
});

const esquemaCredenciales = z.object({
  email: z.string().trim().min(1, "El email no puede estar vacío.").email("El email no tiene un formato válido."),
  contrasena: z.string().min(1, "La contraseña no puede estar vacía."),
});

export type DatosDeRegistro = z.infer<typeof esquemaRegistro>;
export type Credenciales = z.infer<typeof esquemaCredenciales>;

/** El resultado de una operación que puede fallar por una decisión del usuario. */
export type Resultado = { ok: true } | ({ ok: false } & InfoError);

/** La sesión activa, con la forma que ya infiere Better Auth de su propia configuración. */
export type Sesion = NonNullable<Awaited<ReturnType<ReturnType<typeof obtenerAuth>["api"]["getSession"]>>>;

function errorDeValidacion(error: z.ZodError): { ok: false } & InfoError {
  const primerProblema = error.issues[0];
  const campo = primerProblema?.path[0];

  return {
    ok: false,
    mensaje: primerProblema?.message ?? "Los datos ingresados no son válidos.",
    campo: campo === "nombre" || campo === "email" || campo === "contrasena" ? campo : undefined,
  };
}

/**
 * Distingue un error esperado del usuario (Better Auth responde con un
 * código conocido: contraseña incorrecta, email ya registrado...) de un
 * fallo del programa. Solo el primero se devuelve como resultado; el segundo
 * se relanza, siguiendo el criterio general de `docs/decisiones-pendientes.md`
 * §1 para lo que no es una decisión de usuario.
 */
function errorDeBetterAuth(error: unknown): { ok: false } & InfoError {
  if (!isAPIError(error)) throw error;

  return { ok: false, ...traducirError(error.body?.code) };
}

/** Alta con email y contraseña. */
export async function registrarse(datos: DatosDeRegistro): Promise<Resultado> {
  const validacion = esquemaRegistro.safeParse(datos);
  if (!validacion.success) return errorDeValidacion(validacion.error);

  try {
    await obtenerAuth().api.signUpEmail({
      body: {
        name: validacion.data.nombre,
        email: validacion.data.email,
        password: validacion.data.contrasena,
      },
    });
    return { ok: true };
  } catch (error) {
    return errorDeBetterAuth(error);
  }
}

/** Inicio de sesión con email y contraseña. */
export async function iniciarSesion(credenciales: Credenciales): Promise<Resultado> {
  const validacion = esquemaCredenciales.safeParse(credenciales);
  if (!validacion.success) return errorDeValidacion(validacion.error);

  try {
    await obtenerAuth().api.signInEmail({
      body: {
        email: validacion.data.email,
        password: validacion.data.contrasena,
      },
    });
    return { ok: true };
  } catch (error) {
    return errorDeBetterAuth(error);
  }
}

/** Cierra la sesión actual. No falla por "no había sesión": es un no-op válido. */
export async function cerrarSesion(): Promise<Resultado> {
  try {
    const cabeceras = await headers();
    await obtenerAuth().api.signOut({ headers: cabeceras });
    return { ok: true };
  } catch (error) {
    return errorDeBetterAuth(error);
  }
}

/** La sesión actual, o `undefined` si el visitante no tiene una. */
export async function obtenerSesion(): Promise<Sesion | undefined> {
  // `headers()` primero y a propósito: durante el prerenderizado marca la ruta
  // como dinámica antes de construir Better Auth, así `next build` no exige
  // sus variables. Con el orden inverso la construcción corría en el build.
  const cabeceras = await headers();
  const sesion = await obtenerAuth().api.getSession({ headers: cabeceras });
  return sesion ?? undefined;
}
