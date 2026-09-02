/**
 * Esquema de la base, en TypeScript plano (ADR 0005).
 *
 * Todavía no hay ninguna tabla: la tabla `entidad` del ADR 0001 llega con su
 * propio ticket. El archivo existe igual porque `drizzle.config.ts` apunta acá
 * y drizzle-kit se queja si la ruta no resuelve.
 *
 * El `export {}` no es decorativo: sin él, `isolatedModules` considera este
 * archivo un script global y el chequeo de tipos falla.
 */

export {};
