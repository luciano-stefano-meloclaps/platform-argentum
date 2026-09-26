import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "../db/cliente.ts";
import * as esquemaIdentidad from "../db/esquema-identidad.ts";

/**
 * La instancia de Better Auth (ADR 0019, Regla 1): el módulo `identidad` no
 * declara un puerto de persistencia propio porque Better Auth **ya es** el
 * adaptador. Esta configuración es, en el vocabulario del ADR 0016, el puerto
 * de salida y su implementación, resueltos por la librería.
 *
 * Interno al módulo: nada fuera de `src/identidad/` importa este archivo
 * directo, con una única excepción nombrada y acotada (ADR 0019, Regla 3):
 * `src/app/api/auth/[...all]/route.ts`, que necesita la instancia cruda para
 * `toNextJsHandler`, porque esa ruta es el protocolo propio de Better Auth
 * (cookies de sesión, callback de OAuth), no una llamada al contrato de
 * dominio del módulo. Todo lo demás pasa por `identidad.ts`.
 *
 * `drizzleAdapter` usa el esquema separado (ADR 0019, Regla 2): las cuatro
 * tablas de Better Auth viven en `esquema-identidad.ts`, con sus nombres
 * propios en inglés, sin traducir.
 *
 * `emailAndPassword.requireEmailVerification` queda en `false` y no se
 * implementa `sendResetPassword`: verificación de email y recuperación de
 * contraseña están fuera de alcance de esta rebanada (ADR 0019, y
 * `docs/decisiones-pendientes.md` §6, que depende de elegir un proveedor de
 * envío de correo que hoy no existe en el stack).
 *
 * `nextCookies()` va **último** en la lista de plugins, tal como pide la
 * documentación de Better Auth: es lo que hace que las cookies de sesión se
 * propaguen solas cuando `registrarse` e `iniciarSesion` se invocan como
 * Server Actions (ADR 0019, Regla 5).
 */
function construirAuth() {
  const secreto = process.env.BETTER_AUTH_SECRET;
  const urlBase = process.env.BETTER_AUTH_URL;
  const clientIdGoogle = process.env.GOOGLE_CLIENT_ID;
  const clientSecretGoogle = process.env.GOOGLE_CLIENT_SECRET;

  if (!secreto) {
    throw new Error(
      "Falta la variable de entorno BETTER_AUTH_SECRET. En desarrollo sale de " +
        "`.env`, copiado de `.env.example`; en producción se configura en Vercel.",
    );
  }

  if (!urlBase) {
    throw new Error(
      "Falta la variable de entorno BETTER_AUTH_URL. En desarrollo sale de " +
        "`.env`, copiado de `.env.example`; en producción se configura en Vercel.",
    );
  }

  if (!clientIdGoogle || !clientSecretGoogle) {
    throw new Error(
      "Faltan GOOGLE_CLIENT_ID y/o GOOGLE_CLIENT_SECRET. En desarrollo salen de " +
        "`.env`, copiado de `.env.example`; en producción se configuran en Vercel.",
    );
  }

  return betterAuth({
    secret: secreto,
    baseURL: urlBase,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: esquemaIdentidad,
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    socialProviders: {
      google: {
        clientId: clientIdGoogle,
        clientSecret: clientSecretGoogle,
      },
    },
    // Último de la lista, según la documentación de Better Auth.
    plugins: [nextCookies()],
  });
}

// Mismo motivo que `db/cliente.ts`: el servidor de desarrollo de Next
// reevalúa los módulos que cambian, y sin esto cada recarga construiría una
// instancia nueva de Better Auth (y, con ella, un pool de conexiones nuevo).
const alcanceGlobal = globalThis as typeof globalThis & {
  authArgentum?: ReturnType<typeof construirAuth>;
};

/**
 * La instancia de Better Auth, construida **en el primer uso** y no al importar
 * este archivo. `next build` evalúa los módulos de las rutas al recolectar
 * datos de página, y en ese momento las variables de identidad pueden no estar
 * cargadas (en Vercel, según el entorno): un `throw` al importar rompería el
 * build entero. Acá el error de una variable faltante aparece recién en la
 * petición que de verdad necesita a Better Auth, con el mensaje que nombra la
 * variable.
 */
export function obtenerAuth(): ReturnType<typeof construirAuth> {
  return alcanceGlobal.authArgentum ?? (alcanceGlobal.authArgentum = construirAuth());
}
