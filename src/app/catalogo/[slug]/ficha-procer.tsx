import Image from "next/image";

import type { Entidad } from "../../../catalogo/catalogo.ts";
import { rutaDeImagen } from "../ruta-de-imagen.ts";

/** Los **datos** del tipo `procer`, tal como los expone el módulo `catalogo`. */
type CamposProcer = Entidad<"procer">["datos"];

/**
 * Guarda de compilación, no un renderizador genérico: si el descriptor de
 * `procer` (`src/catalogo/descriptores/procer.ts`) gana o pierde un campo,
 * este objeto deja de tipar contra `CamposProcer` y `pnpm typecheck` falla.
 * Es el "mapa de presentación" que pide el ticket #32 —qué etiqueta lleva
 * cada campo y a qué clase pertenece— sin que eso signifique recorrerlo en un
 * `<table>`: la prosa (`contexto`, `semblanza`) se sigue escribiendo a mano
 * más abajo, con su propia jerarquía editorial, tal como el ticket pide a
 * conciencia (ADR 0015, Regla 7, todavía en estado "Propuesto" — ver la nota
 * en `../ruta-de-imagen.ts`).
 */
const mapaDeCampos = {
  nombreCompleto: { etiqueta: "Nombre completo", clase: "dato" },
  anioDeNacimiento: { etiqueta: "Nacimiento", clase: "dato" },
  anioDeMuerte: { etiqueta: "Muerte", clase: "dato" },
  resumen: { etiqueta: "Resumen", clase: "dato" },
  contexto: { etiqueta: "Contexto", clase: "prosa" },
  semblanza: { etiqueta: "Semblanza", clase: "prosa" },
  imagen: { etiqueta: "Imagen", clase: "imagen" },
} satisfies Record<keyof CamposProcer, { etiqueta: string; clase: "dato" | "prosa" | "imagen" }>;

/** Las licencias del descriptor, derivadas de `CamposProcer` y no repetidas a mano. */
type Licencia = CamposProcer["imagen"]["licencia"];

/**
 * Etiqueta humana de cada licencia. `Record<Licencia, string>` es la misma
 * guarda que `mapaDeCampos`: agregar una licencia al descriptor y olvidarse
 * de esta tabla rompe la compilación.
 */
const etiquetaLicencia = {
  "dominio-publico": "Dominio público",
  cc0: "CC0",
  "cc-by": "CC BY",
  "cc-by-sa": "CC BY-SA",
  propia: "Uso propio, con permiso",
} satisfies Record<Licencia, string>;

/** Una línea legible con los años de vida, con o sin año de muerte conocido. */
function periodoDeVida(nacimiento: number, muerte: number | undefined): string {
  return muerte === undefined ? `Nació en ${nacimiento}` : `${nacimiento} – ${muerte}`;
}

/**
 * La etiqueta accesible de la línea de años, combinando las de
 * `mapaDeCampos` según haya o no año de muerte conocido. Se usa como prefijo
 * de solo lectura de pantalla (`sr-only`): un lector de pantalla no tiene la
 * pista visual de que ese texto está bajo el nombre, así que necesita que se
 * la digan.
 */
function etiquetaPeriodoDeVida(muerte: number | undefined): string {
  return muerte === undefined
    ? mapaDeCampos.anioDeNacimiento.etiqueta
    : `${mapaDeCampos.anioDeNacimiento.etiqueta} y ${mapaDeCampos.anioDeMuerte.etiqueta.toLowerCase()}`;
}

/**
 * Separa una prosa en párrafos por la línea en blanco que usan los archivos
 * de contenido curado (ADR 0009) para marcarlos. Los saltos de línea sueltos
 * dentro de un mismo párrafo no se tocan: el navegador ya los colapsa en un
 * espacio, que es como se escriben los archivos de `contenido/` para no
 * superar el ancho de línea del editor.
 */
function parrafos(texto: string): string[] {
  return texto.trim().split(/\n{2,}/);
}

/**
 * La ficha de una entidad de tipo `procer` (ticket #32): nombre, imagen con
 * su crédito y licencia, resumen, contexto (si lo tiene) y semblanza —todo lo
 * que declara el descriptor de `procer`, con la identidad Argentum puesta.
 *
 * Server Component: no hay estado ni interacción, solo lectura de `procer` —
 * que ya llegó validado desde el módulo `catalogo` — para armar el marcado.
 */
export function FichaProcer({ procer }: { procer: Entidad<"procer"> }) {
  const { datos } = procer;
  const ruta = rutaDeImagen(procer.tipo, procer.slug);

  return (
    <article>
      <header>
        <span className="inline-flex items-center rounded-sm bg-cat-proceres-bg px-sm py-xs text-chip uppercase text-cat-proceres-text">
          Prócer
        </span>
        <h1 className="mt-sm text-balance font-titulo text-display text-texto-titulo">{procer.nombre}</h1>
        <p className="mt-xs font-cuerpo text-body text-texto-secundario">
          <span className="sr-only">{mapaDeCampos.nombreCompleto.etiqueta}: </span>
          {datos.nombreCompleto}
        </p>
        <p className="mt-xs font-cuerpo text-meta text-texto-terciario">
          <span className="sr-only">{etiquetaPeriodoDeVida(datos.anioDeMuerte)}: </span>
          {periodoDeVida(datos.anioDeNacimiento, datos.anioDeMuerte)}
        </p>
      </header>

      <figure className="mt-xl overflow-hidden rounded-xl border border-borde-default bg-blanco shadow-sombra-sm">
        <div className="relative aspect-square">
          <Image
            src={ruta}
            alt={datos.imagen.textoAlternativo}
            fill
            sizes="(min-width: 768px) 736px, 100vw"
            className="object-cover"
            priority
          />
        </div>
        <figcaption className="flex flex-wrap items-center justify-between gap-sm border-t border-borde-default bg-crema px-lg py-sm font-cuerpo text-caption text-texto-terciario">
          <span>{datos.imagen.credito}</span>
          <span className="rounded-sm bg-blanco px-sm py-xs text-meta text-texto-secundario">
            {etiquetaLicencia[datos.imagen.licencia]}
          </span>
        </figcaption>
      </figure>

      <p className="mt-xl font-cuerpo text-body-lg text-texto-cuerpo">{datos.resumen}</p>

      {datos.contexto !== undefined && (
        <section className="mt-2xl">
          <h2 className="text-pretty font-titulo text-h2 text-texto-titulo">{mapaDeCampos.contexto.etiqueta}</h2>
          <div className="mt-sm space-y-md font-cuerpo text-body-lg text-texto-cuerpo">
            {parrafos(datos.contexto).map((parrafo, indice) => (
              <p key={indice}>{parrafo}</p>
            ))}
          </div>
        </section>
      )}

      <section className="mt-2xl">
        <h2 className="text-pretty font-titulo text-h2 text-texto-titulo">{mapaDeCampos.semblanza.etiqueta}</h2>
        <div className="mt-sm space-y-md font-cuerpo text-body-lg text-texto-cuerpo">
          {parrafos(datos.semblanza).map((parrafo, indice) => (
            <p key={indice}>{parrafo}</p>
          ))}
        </div>
      </section>
    </article>
  );
}
