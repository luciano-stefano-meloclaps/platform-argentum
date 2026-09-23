"use client";

import { authClient } from "./auth-cliente.ts";

async function continuarConGoogle() {
  // `callbackURL` no se fija: el valor por omisión de Better Auth ya es "/"
  // (verificado vía Context7), la misma home a la que ya vuelve el cierre de
  // sesión (`header.acciones.ts`, ticket #114).
  await authClient.signIn.social({ provider: "google" });
}

/**
 * "Continuar con Google" (ticket #115, ADR 0019 Regla 4): dispara el flujo de
 * Google directo desde el navegador, sin pasar por `identidad.ts` — el
 * intercambio OAuth es una coreografía de saltos del navegador que ninguna
 * función de servidor puede mediar sola, así que esta es la única pieza de la
 * interfaz que le habla al cliente de Better Auth en vez de al módulo.
 *
 * Un solo componente, reutilizado en `/registrarse` y en `/ingresar` (cada
 * `page.tsx` lo importa) en vez de duplicar el botón dos veces.
 *
 * Accesibilidad: `<button>` real, nunca un `<div>` con `onClick`;
 * `min-h-objetivo-tactil` (44px, ticket #96) para el objetivo táctil; foco
 * visible con `--color-foco` (`identidad-argentum` regla de uso 17, mismas
 * utilidades `outline-2 outline-offset-2` que el resto de los botones de esta
 * pantalla); el logotipo de Google es puramente decorativo (`aria-hidden`) —
 * el texto del botón es lo que comunica la acción, no el color ni el ícono.
 */
export function BotonContinuarConGoogle() {
  return (
    <button
      type="button"
      onClick={() => {
        void continuarConGoogle();
      }}
      className="flex min-h-objetivo-tactil w-full cursor-pointer touch-manipulation items-center justify-center gap-sm rounded-sm border border-arena-borde bg-blanco px-lg font-cuerpo text-button text-texto-titulo motion-safe:transition-colors hover:bg-celeste-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
    >
      <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5 shrink-0">
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.9 32.3 29.4 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.7 15.9 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 15.9 3 8.9 7.6 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 45c5.3 0 10.1-1.8 13.8-4.9l-6.4-5.4C29.3 36.4 26.8 37 24 37c-5.3 0-9.8-3.6-11.4-8.4l-6.5 5C9 41.4 15.9 45 24 45z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.4 5.6-6.4 7.1l6.4 5.4C39.3 37.4 43 31.5 43 24c0-1.2-.1-2.3-.4-3.5z"
        />
      </svg>
      Continuar con Google
    </button>
  );
}
