"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import type { Resultado } from "../../identidad/identidad.ts";

type Props = {
  accion: (estadoPrevio: Resultado, formData: FormData) => Promise<Resultado>;
};

const ESTADO_INICIAL: Resultado = { ok: true };

/**
 * Clases compartidas de los tres campos: borde `arena-borde`, foco con el
 * token de sistema (`identidad-argentum` regla de uso 17: `--color-foco`,
 * alias de `--color-accent-700`, con las utilidades estáticas
 * `outline-2 outline-offset-2`). `min-h-objetivo-tactil` (44px, ticket #96)
 * en vez de un alto fijo en píxeles: el contenido —el texto tipeado— nunca
 * lo empuja hacia abajo del mínimo táctil, pero tampoco lo fuerza si el
 * `line-height` de Lora a 16px ya da más alto.
 */
const CLASES_CAMPO =
  "min-h-objetivo-tactil w-full rounded-sm border bg-blanco px-md font-cuerpo text-body text-texto-cuerpo outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco";

const CLASES_CAMPO_OK = `${CLASES_CAMPO} border-arena-borde`;
const CLASES_CAMPO_ERROR = `${CLASES_CAMPO} border-error`;

/**
 * Botón de alta. Componente aparte (no el `<button>` inline en
 * `FormularioDeRegistro`) porque `useFormStatus` solo lee el estado de
 * envío del `<form>` ancestro más cercano cuando se llama **dentro** de un
 * componente hijo de ese `<form>` — llamarlo en el mismo componente que
 * declara el `<form>` siempre devuelve `pending: false` (verificado contra
 * la documentación de React).
 */
function BotonDeAlta() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="min-h-objetivo-tactil w-full cursor-pointer touch-manipulation rounded-sm bg-celeste-700 px-lg font-cuerpo text-button text-texto-sobre-celeste motion-safe:transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Creando la cuenta…" : "Crear cuenta"}
    </button>
  );
}

/**
 * El formulario de alta (ticket #113): tres campos —nombre, email,
 * contraseña— y un único botón de envío. Client Component porque
 * `useActionState` y `useFormStatus` son hooks, pero la mutación en sí
 * (`accion`, `registrarseConFormulario` de `./acciones.ts`) corre en el
 * servidor: es una Server Action pasada como prop desde `page.tsx` (Server
 * Component), el mismo patrón que documenta `rsc-boundaries.md` de
 * `next-best-practices` para pasar una acción de servidor a un hijo de
 * cliente.
 *
 * **Validación:** la de verdad —formato de email, longitud de contraseña,
 * email ya registrado— vive en `identidad.registrarse` y llega acá ya
 * traducida al español (ADR 0019, Regla 4); este componente no la duplica.
 * Los atributos nativos de HTML (`required`, `type="email"`,
 * `minLength={8}`) dan una primera señal en el navegador —bloquean el envío
 * y muestran el mensaje propio del navegador— sin repetir ningún texto del
 * diccionario de `identidad`: son dos mecanismos distintos (validación del
 * user-agent vs. mensaje de dominio), no una traducción duplicada.
 *
 * **Errores de servidor:** `estado.campo` dice a qué input pertenece un
 * error; se asocia con `aria-invalid` + `aria-describedby` y se muestra
 * como texto junto al campo, nunca solo con color (regla de accesibilidad
 * del proyecto). Un error sin campo (mensaje genérico) se muestra como
 * aviso general arriba del formulario.
 */
export function FormularioDeRegistro({ accion }: Props) {
  const [estado, enviarFormulario] = useActionState(accion, ESTADO_INICIAL);

  const errorGeneral = !estado.ok && estado.campo === undefined ? estado.mensaje : undefined;
  const errorDe = (campo: "nombre" | "email" | "contrasena") =>
    !estado.ok && estado.campo === campo ? estado.mensaje : undefined;

  const errorNombre = errorDe("nombre");
  const errorEmail = errorDe("email");
  const errorContrasena = errorDe("contrasena");

  const refNombre = useRef<HTMLInputElement>(null);
  const refEmail = useRef<HTMLInputElement>(null);
  const refContrasena = useRef<HTMLInputElement>(null);
  const refErrorGeneral = useRef<HTMLParagraphElement>(null);

  /**
   * Mueve el foco al primer error después de una vuelta de servidor
   * (`guidelines.md`, Forms: "focus first error on submit"). La validación
   * nativa del navegador ya hace esto sola para `required`/`type="email"`/
   * `minLength` — este efecto cubre el caso que el navegador no puede
   * anticipar: un error que solo `identidad.registrarse` puede detectar
   * (email ya registrado, contraseña incorrecta).
   */
  useEffect(() => {
    if (estado.ok) return;

    if (estado.campo === "nombre") refNombre.current?.focus();
    else if (estado.campo === "email") refEmail.current?.focus();
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
        <label htmlFor="nombre" className="font-cuerpo text-label text-texto-titulo">
          Nombre
        </label>
        <input
          ref={refNombre}
          id="nombre"
          name="nombre"
          type="text"
          autoComplete="name"
          required
          aria-invalid={errorNombre !== undefined}
          aria-describedby={errorNombre ? "error-nombre" : undefined}
          className={errorNombre ? CLASES_CAMPO_ERROR : CLASES_CAMPO_OK}
        />
        {errorNombre && (
          <p id="error-nombre" role="alert" className="font-cuerpo text-caption text-error">
            {errorNombre}
          </p>
        )}
      </div>

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
          autoComplete="new-password"
          required
          minLength={8}
          aria-invalid={errorContrasena !== undefined}
          aria-describedby={errorContrasena ? "error-contrasena" : "ayuda-contrasena"}
          className={errorContrasena ? CLASES_CAMPO_ERROR : CLASES_CAMPO_OK}
        />
        {errorContrasena ? (
          <p id="error-contrasena" role="alert" className="font-cuerpo text-caption text-error">
            {errorContrasena}
          </p>
        ) : (
          <p id="ayuda-contrasena" className="font-cuerpo text-caption text-texto-terciario">
            Al menos 8 caracteres.
          </p>
        )}
      </div>

      <BotonDeAlta />
    </form>
  );
}
