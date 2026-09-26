import { spawnSync } from "node:child_process";

import { evaluarDestino } from "./guarda-de-destino.mts";

/**
 * Envoltorio de `pnpm db:migrate` (ADR 0023, ticket #122): evalúa la guarda del
 * destino y recién después le pasa el control a `drizzle-kit migrate`.
 *
 * Evalúa `DATABASE_URL_UNPOOLED` porque es la que lee `drizzle.config.ts`. El
 * script de `package.json` carga el `.env` con `--env-file-if-exists`, y
 * drizzle-kit hereda ese mismo entorno, así que ambos ven lo mismo.
 *
 * No lee ni imprime la cadena: solo el motivo de la guarda, que informa el host.
 */

const guarda = evaluarDestino(process.env.DATABASE_URL_UNPOOLED, process.env.DB_CONFIRMAR_DESTINO);

if (!guarda.permitido) {
  console.error(`db:migrate — ${guarda.motivo} No se migró nada.`);
  process.exit(1);
}

const resultado = spawnSync("pnpm", ["exec", "drizzle-kit", "migrate"], { stdio: "inherit" });

process.exit(resultado.status ?? 1);
