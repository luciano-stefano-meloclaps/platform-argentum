import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

/**
 * Verificación de conectividad contra la base de `DATABASE_URL`.
 *
 * Corre `select version()` y no `select 1` porque así el mismo comando que
 * prueba que la base responde verifica la paridad de versión mayor entre el
 * PostgreSQL local y Neon, que es la única mitigación a la que se comprometió
 * el ADR 0006.
 *
 * No imprime la cadena de conexión ni ninguna credencial: del destino solo
 * informa host, puerto y base, que es lo que hace falta para saber contra qué
 * habló.
 *
 * Este archivo no importa `./cliente.ts` a propósito: aquel empieza con
 * `import "server-only"`, que fuera del empaquetador de Next lanza un error. La
 * conexión se arma acá con el mismo driver y la misma librería.
 *
 * La extensión es `.mts` y no `.ts` por lo mismo que `vitest.config.mts`: sin
 * `"type": "module"` en `package.json`, Node trata un `.ts` como CommonJS,
 * detecta la sintaxis de módulos y lo vuelve a parsear avisando por consola.
 * `.mts` es ESM sin ambigüedad. Lo ejecuta Node solo, sin compilar: la
 * eliminación de tipos viene de fábrica desde Node 22.18.
 */

function fallar(mensaje: string): never {
  console.error(`db:ping — ${mensaje}`);
  process.exit(1);
}

/**
 * Del error se informa el **código** y no el mensaje. No es paranoia gratuita:
 * el mensaje de una falla de autenticación de PostgreSQL trae adentro el
 * usuario, y el de una URL mal formada trae la cadena entera. El código
 * (`ECONNREFUSED`, `28P01`, `3D000`) diagnostica igual de bien y no puede
 * filtrar nada. Se recorre la cadena de causas porque Drizzle envuelve el error
 * del driver en uno propio.
 */
function describirFalla(error: unknown): string {
  let actual: unknown = error;

  while (actual instanceof Error) {
    const codigo = (actual as Error & { code?: unknown }).code;

    if (typeof codigo === "string") {
      return codigo === "ECONNREFUSED"
        ? "ECONNREFUSED: no hay nadie escuchando. ¿Levantaste `docker compose up -d`?"
        : codigo;
    }

    actual = actual.cause;
  }

  return "sin código";
}

function describirDestino(url: string): string {
  try {
    const partes = new URL(url);
    return `${partes.hostname}:${partes.port || "5432"}${partes.pathname}`;
  } catch {
    // A propósito no se incluye el valor en el mensaje: una cadena mal formada
    // sigue teniendo adentro un usuario y una clave.
    return fallar("DATABASE_URL no es una cadena de conexión válida.");
  }
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;

  if (!url) {
    fallar(
      "falta la variable de entorno DATABASE_URL. Copiá `.env.example` a `.env` y completala.",
    );
  }

  const destino = describirDestino(url);
  const db = drizzle({
    connection: {
      connectionString: url,
      // Sin esto, una base que no responde deja el comando colgado en vez de
      // fallar. El criterio es que con la base apagada termine, y que termine mal.
      connectionTimeoutMillis: 5_000,
    },
  });

  try {
    const resultado = await db.execute<{ version: string }>(sql`select version()`);
    const version = resultado.rows[0]?.version;

    if (!version) {
      fallar(`${destino} respondió, pero sin versión. Es un resultado imposible.`);
    }

    console.log(`db:ping — ${destino} responde.`);
    console.log(`db:ping — ${version}`);
  } catch (error) {
    fallar(`no se pudo consultar ${destino} (${describirFalla(error)}).`);
  } finally {
    await db.$client.end();
  }
}

await main();
