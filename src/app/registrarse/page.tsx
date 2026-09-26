import type { Metadata } from "next";

import { registrarseConFormulario } from "./acciones.ts";
import { FormularioDeRegistro } from "./formulario-de-registro.tsx";
import { BotonContinuarConGoogle } from "../boton-continuar-con-google.tsx";

/**
 * La pantalla "Registrarse" (ticket #113, ADR 0019): alta de cuenta con
 * email y contraseña. Primera pantalla del proyecto que muta datos reales
 * a través de una Server Action (`./acciones.ts`), sobre el módulo
 * `identidad` (`src/identidad/identidad.ts`, su única superficie de
 * importación permitida desde `src/app` — ver `eslint.config.mjs`).
 *
 * Server Component: no hay nada acá que necesite estado, efectos ni una API
 * del navegador. La interactividad —el envío del formulario y sus tres
 * campos— vive en `FormularioDeRegistro`, el Client Component que recibe la
 * Server Action como prop (patrón documentado en `rsc-boundaries.md` de
 * `next-best-practices`: una función `"use server"` es serializable de
 * servidor a cliente aunque las funciones comunes no lo sean).
 *
 * **"Continuar con Google" (ticket #115, ADR 0019 Regla 4):** debajo del
 * formulario, separado por un divisor de texto ("o"). Es el único punto de
 * la interfaz que no pasa por `identidad.ts` — ver
 * `../boton-continuar-con-google.tsx` para el porqué.
 */
export const metadata: Metadata = {
  title: "Creá tu cuenta | Argentum",
};

export default function PaginaDeRegistro() {
  return (
    <main id="contenido" className="mx-auto max-w-[480px] px-lg py-2xl">
      <h1 className="text-balance font-titulo text-h1 text-texto-titulo">Creá tu cuenta</h1>
      <p className="mt-sm font-cuerpo text-body-lg text-texto-secundario">
        Con tu cuenta vas a poder guardar tu avance a medida que el catálogo lo permita.
      </p>

      <FormularioDeRegistro accion={registrarseConFormulario} />

      <p className="mt-lg text-center font-cuerpo text-caption text-texto-terciario">o</p>

      <BotonContinuarConGoogle />
    </main>
  );
}
