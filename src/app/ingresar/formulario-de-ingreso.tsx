"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import type { Resultado } from "../../identidad/identidad.ts";

type Props = {
  accion: (estadoPrevio: Resultado, formData: FormData) => Promise<Resultado>;
};

const ESTADO_INICIAL: Resultado = { ok: true };

/**
 * Mismas clases compartidas que `formulario-de-registro.tsx` (#113): borde
 * `arena-borde`, foco con `--color-foco` (`identidad-argentum` regla de uso
 * 17) y `min-h-objetivo-tactil` (44px, ticket #96) en vez de un alto fijo.
 */
const CLASES_CAMPO =
  "min-h-objetivo-tactil w-full rounded-sm border bg-blanco px-md font-cuerpo text-body text-texto-cuerpo outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco";

const CLASES_CAMPO_OK = `${CLASES_CAMPO} border-arena-borde`;
const CLASES_CAMPO_ERROR = `${CLASES_CAMPO} border-error`;

/**
 * Botón de ingreso. Componente aparte, mismo motivo que `BotonDeAlta` en
 * `formulario-de-registro.tsx`: `useFormStatus` solo lee el estado del
 * `<form>` ancestro cuando se llama desde un hijo de ese `<form>`.
 */
function BotonDeIngreso() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="min-h-objetivo-tactil w-full cursor-pointer touch-manipulation rounded-sm bg-celeste-700 px-lg font-cuerpo text-button text-texto-sobre-celeste motion-safe:transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Ingresando…" : "Ingresar"}
    </button>
  );
}

/**
 * El formulario de login (ticket #114): dos campos —email, contraseña— y un
 * único botón de envío. Client Component por los mismos hooks que
 * `FormularioDeRegistro` (#113); la mutación (`accion`,
 * `iniciarSesionConFormulario` de `./acciones.ts`) corre en el servidor como
 * Server Action pasada como prop.
 *
 * **Validación:** la de verdad vive en `identidad.iniciarSesion` y llega acá
 * ya traducida al español; este componente no la duplica. `required` /
 * `type="email"` dan una primera señal del navegador, sin repetir texto del
 * diccionario de `identidad`.
 *
 * **Errores de servidor:** una credencial incorrecta
 * (`INVALID_EMAIL_OR_PASSWORD`) no señala un campo puntual —Better Auth no
 * dice cuál de los dos falló, por diseño, para no confirmar si un email
 * existe— así que se muestra como aviso general arriba del formulario, igual
 * que cualquier otro error sin campo. Un error de formato de email sí trae
 * `campo: "email"` y se asocia con `aria-invalid` + `aria-describedby`.
 */
export function FormularioDeIngreso({ accion }: Props) {
  const [estado, enviarFormulario] = useActionState(accion, ESTADO_INICIAL);

  const errorGeneral = !estado.ok && estado.campo === undefined ? estado.mensaje : undefined;
  const errorDe = (campo: "email" | "contrasena") => (!estado.ok && estado.campo === campo ? estado.mensaje : undefined);

  const errorEmail = errorDe("email");
  const errorContrasena = errorDe("contrasena");

  const refEmail = useRef<HTMLInputElement>(null);
  const refContrasena = useRef<HTMLInputElement>(null);
  const refErrorGeneral = useRef<HTMLParagraphElement>(null);

  /**
   * Mueve el foco al primer error después de una vuelta de servidor
   * (`guidelines.md`, Forms: "focus first error on submit"), mismo criterio
   * que `formulario-de-registro.tsx`.
   */
  useEffect(() => {
    if (estado.ok) return;

    if (estado.campo === "email") refEmail.current?.focus();
    else if (estado.campo === "contrasena") refContrasena.current?.focus();
    else refErrorGeneral.current?.focus();
  }, [estado]);

  return (
    <form action={enviarFormulario} className="mt-2xl flex flex-col gap-lg">
      {errorGeneral && (
        <p
          ref={refErrorGeneral}
          role="alert"
          tabIndex={-1}
          className="rounded-sm border border-error bg-error-bg px-lg py-md font-cuerpo text-body text-error"
        >
          {errorGeneral}
        </p>
      )}

      <div className="flex flex-col gap-xs">
        <label htmlFor="email" className="font-cuerpo text-label text-texto-titulo">
          Email
        </label>
        <input
          ref={refEmail}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          required
          aria-invalid={errorEmail !== undefined}
          aria-describedby={errorEmail ? "error-email" : undefined}
          className={errorEmail ? CLASES_CAMPO_ERROR : CLASES_CAMPO_OK}
        />
        {errorEmail && (
          <p id="error-email" role="alert" className="font-cuerpo text-caption text-error">
            {errorEmail}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-xs">
        <label htmlFor="contrasena" className="font-cuerpo text-label text-texto-titulo">
          Contraseña
        </label>
        <input
          ref={refContrasena}
          id="contrasena"
          name="contrasena"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={errorContrasena !== undefined}
          aria-describedby={errorContrasena ? "error-contrasena" : undefined}
          className={errorContrasena ? CLASES_CAMPO_ERROR : CLASES_CAMPO_OK}
        />
        {errorContrasena && (
          <p id="error-contrasena" role="alert" className="font-cuerpo text-caption text-error">
            {errorContrasena}
          </p>
        )}
      </div>

      <BotonDeIngreso />
    </form>
  );
}
