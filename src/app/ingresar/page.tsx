import type { Metadata } from "next";
import Link from "next/link";

import { iniciarSesionConFormulario } from "./acciones.ts";
import { FormularioDeIngreso } from "./formulario-de-ingreso.tsx";
import { BotonContinuarConGoogle } from "../boton-continuar-con-google.tsx";

/**
 * La pantalla "Ingresar" (ticket #114, ADR 0019): inicio de sesión con email
 * y contraseña. Mismo patrón que `registrarse/page.tsx` (#113): Server
 * Component que solo arma el marco, la interactividad vive en
 * `FormularioDeIngreso` (Client Component), que recibe la Server Action como
 * prop.
 *
 * **"Continuar con Google" (ticket #115, ADR 0019 Regla 4):** debajo del
 * formulario, separado por un divisor de texto ("o"). Mismo componente que
 * `registrarse/page.tsx`, ver `../boton-continuar-con-google.tsx`.
 */
export const metadata: Metadata = {
  title: "Ingresá | Argentum",
};

export default function PaginaDeIngreso() {
  return (
    <main id="contenido" className="mx-auto max-w-[480px] px-lg py-2xl">
      <h1 className="text-balance font-titulo text-h1 text-texto-titulo">Ingresá a tu cuenta</h1>
      <p className="mt-sm font-cuerpo text-body-lg text-texto-secundario">
        Iniciá sesión con tu email y tu contraseña.
      </p>

      <FormularioDeIngreso accion={iniciarSesionConFormulario} />

      <p className="mt-lg text-center font-cuerpo text-caption text-texto-terciario">o</p>

      <BotonContinuarConGoogle />

      <p className="mt-lg font-cuerpo text-body text-texto-secundario">
        ¿Todavía no tenés cuenta?{" "}
        <Link
          href="/registrarse"
          className="text-celeste-text underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
        >
          Creá una
        </Link>
        .
      </p>
    </main>
  );
}
