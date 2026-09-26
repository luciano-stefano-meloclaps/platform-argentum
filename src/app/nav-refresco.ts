/**
 * Rutas cuyo envío es una Server Action que termina en redirección: login por
 * email y registro (ADR 0020, Regla 5). Esas acciones no disparan las señales
 * del cliente de Better Auth, así que al salir de ellas la nav tiene que
 * volver a pedir la sesión. Vive acá, y no en `nav-principal.tsx`, para poder
 * probarse sin cargar el cliente de auth.
 */
export const RUTAS_DE_ENTRADA = ["/ingresar", "/registrarse"] as const;

/** Si al pasar de `anterior` a `actual` la nav debe volver a leer la sesión: solo viniendo de una ruta de entrada. */
export function debeRefrescarSesion(anterior: string, actual: string): boolean {
  if (anterior === actual) return false;
  return (RUTAS_DE_ENTRADA as readonly string[]).includes(anterior);
}
