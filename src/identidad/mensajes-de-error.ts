import "server-only";

import type { obtenerAuth } from "./auth.ts";

/**
 * Diccionario propio que traduce los `$ERROR_CODES` de Better Auth —en
 * inglés, pensados para quien programa, no para quien lee la pantalla— a
 * mensajes en español dirigidos al usuario, con el campo del formulario que
 * el error señala cuando hay uno solo evidente (ADR 0019, Regla 4).
 *
 * No traduce los ~50 códigos que expone Better Auth, solo los que
 * `registrarse` e `iniciarSesion` pueden encontrar de verdad con la
 * configuración de este módulo (email+contraseña, sin verificación de
 * email). Un código sin entrada cae en el mensaje genérico, así que agregar
 * un caso nuevo es agregar una línea acá, nunca una rama nueva en
 * `identidad.ts`.
 */
type CodigoDeError = keyof ReturnType<typeof obtenerAuth>["$ERROR_CODES"];
type Campo = "nombre" | "email" | "contrasena";

export interface InfoError {
  mensaje: string;
  campo?: Campo;
}

const MENSAJE_GENERICO = "No se pudo completar la operación. Intentá de nuevo.";

const errores: Partial<Record<CodigoDeError, InfoError>> = {
  USER_ALREADY_EXISTS: { mensaje: "Ya existe una cuenta con ese email.", campo: "email" },
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: {
    mensaje: "Ya existe una cuenta con ese email. Probá con otro.",
    campo: "email",
  },
  INVALID_EMAIL: { mensaje: "El email no tiene un formato válido.", campo: "email" },
  INVALID_EMAIL_OR_PASSWORD: { mensaje: "El email o la contraseña son incorrectos." },
  INVALID_PASSWORD: { mensaje: "La contraseña es incorrecta.", campo: "contrasena" },
  PASSWORD_TOO_SHORT: { mensaje: "La contraseña es demasiado corta.", campo: "contrasena" },
  PASSWORD_TOO_LONG: { mensaje: "La contraseña es demasiado larga.", campo: "contrasena" },
  USER_NOT_FOUND: { mensaje: "No existe una cuenta con ese email.", campo: "email" },
  CREDENTIAL_ACCOUNT_NOT_FOUND: { mensaje: "No existe una cuenta con esas credenciales." },
  EMAIL_NOT_VERIFIED: { mensaje: "Todavía no verificaste tu email." },
  EMAIL_CAN_NOT_BE_UPDATED: { mensaje: "Ese email no se puede actualizar.", campo: "email" },
  FAILED_TO_CREATE_USER: { mensaje: "No se pudo crear la cuenta. Intentá de nuevo." },
  FAILED_TO_CREATE_SESSION: { mensaje: "No se pudo iniciar sesión. Intentá de nuevo." },
};

/**
 * `codigo` llega tal como lo entrega Better Auth (`error.body?.code`), sin
 * garantía de tipo en el borde —viene de una respuesta HTTP de un tercero, o
 * puede faltar directamente—, así que la firma acepta `string | undefined` y
 * no `CodigoDeError`.
 */
export function traducirError(codigo?: string): InfoError {
  if (codigo === undefined) return { mensaje: MENSAJE_GENERICO };

  return errores[codigo as CodigoDeError] ?? { mensaje: MENSAJE_GENERICO };
}
