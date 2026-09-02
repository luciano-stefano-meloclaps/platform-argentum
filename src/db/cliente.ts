import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";

import * as esquema from "./esquema";

/**
 * Cliente de Drizzle sobre PostgreSQL, único punto del proyecto donde se
 * construye una conexión a la base.
 *
 * `import "server-only"` va primero y a propósito: si algún día un componente
 * de cliente importa este archivo, la compilación falla con un mensaje claro en
 * vez de intentar meter el driver en el paquete del navegador. Es la regla de
 * límite del ADR 0002 sostenida por el compilador y no por la disciplina.
 *
 * El driver es `pg` (node-postgres), el mismo en local y en Neon: Neon habla
 * PostgreSQL estándar por TCP, y usar dos drivers distintos haría que una
 * transacción interactiva ande en desarrollo y falle en producción.
 */
function construirCliente() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    // Sin la cadena, no hay nada que hacer. El mensaje nombra la variable y no
    // imprime ningún valor.
    throw new Error(
      "Falta la variable de entorno DATABASE_URL. En desarrollo sale de `.env`, " +
        "copiado de `.env.example`; en Vercel, del entorno del proyecto.",
    );
  }

  return drizzle({ connection: url, schema: esquema });
}

// El servidor de desarrollo de Next vuelve a evaluar los módulos que cambian, y
// una construcción por evaluación deja un pool de conexiones abierto cada vez
// hasta agotar `max_connections`. Guardarlo en `globalThis` lo evita. En
// producción el módulo se evalúa una sola vez y esto no cambia nada.
const alcanceGlobal = globalThis as typeof globalThis & {
  clienteArgentum?: ReturnType<typeof construirCliente>;
};

export const db: ReturnType<typeof construirCliente> =
  alcanceGlobal.clienteArgentum ?? (alcanceGlobal.clienteArgentum = construirCliente());
