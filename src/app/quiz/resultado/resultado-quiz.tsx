import Link from "next/link";

import type { ResultadoDeQuizMock } from "./resultado-quiz.datos.ts";

/**
 * Espacio de no separación. El badge de liga mete dos cifras en una píldora
 * angosta que envuelve, y sin esto el renglón se corta entre "faltan" y su
 * número o entre "+140" y su liga de destino, que es justo donde la cifra
 * pierde el sentido. Hallazgo de `ui-reviewer` (`guidelines.md`,
 * Typography: "Non-breaking spaces").
 */
const NBSP = "\u00a0";

type Props = {
  resultado: ResultadoDeQuizMock;
};

/**
 * Numerales romanos de la revisión. Son **cinco**, tantos como líneas pide
 * el ticket, así que van como tabla literal en vez de un algoritmo de
 * conversión que nadie más necesita — la opción más simple que puede crecer
 * (principio de arquitectura de `CLAUDE.md`). Si algún día la revisión
 * muestra las diez, se agregan cinco entradas.
 *
 * Son **decorativos** (`identidad-argentum`, componentes v2: "números
 * romanos — decorativos, `aria-hidden`; el identificador accesible es el
 * nombre en texto"), así que el marcado los esconde del árbol de
 * accesibilidad y la posición de cada pregunta se anuncia con texto.
 */
const NUMERAL_ROMANO: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
};

/**
 * La pantalla "Resultado del quiz" (ticket #106): panel invertido con los
 * aciertos, franja de tres estadísticas, revisión de la partida y las dos
 * salidas. Presentación pura sobre el mock de `resultado-quiz.datos.ts` —
 * los módulos `aprendizaje` y `progreso` (ADR 0002) todavía no existen y
 * nada se persiste.
 *
 * **Server Component, sin isla de cliente.** El resultado es estático: no
 * hay inputs ni estado que cambie en esta pantalla, y los tres elementos
 * interactivos —el acceso a la ficha de cada pregunta fallada y las dos
 * salidas— son navegación real con `<Link>`. A propósito no se marca
 * `'use client'` en ningún nivel: sería pagar JavaScript por una pantalla
 * que no lo usa.
 *
 * Nada castiga. Los dos aciertos que faltan no se muestran como una falta
 * sino como un camino: la revisión de las falladas ofrece la ficha de la
 * entidad, y la salida de abajo ofrece repasarlas con tarjetas. Ninguna
 * frase de la pantalla reprocha.
 *
 * Vocabulario de `CONTEXT.md` en todo el texto visible y en los nombres de
 * campos: **puntos** (nunca "puntaje", explícitamente marcado a evitar),
 * **liga** (nunca "nivel"), **tarjeta**, **ficha**, **quiz**, **entidad**.
 *
 * Las métricas escritas como valores arbitrarios de Tailwind —`px-[44px]
 * py-[52px]` del panel, `px-[16px] py-[6px]` del badge, `py-[24px]` de la
 * franja, `py-[15px]` de las salidas— son **cifras exactas de la
 * especificación visual del ticket**, sin equivalente en la progresión
 * `xs…2xl` de `--spacing-*`, así que van como valor arbitrario y no como un
 * token forzado al número más cercano. Mismo criterio y mismo precedente que
 * `estadisticas-catalogo.tsx` y `header.tsx`. El `44px` del panel es una
 * coincidencia numérica con `--spacing-objetivo-tactil` y **no** tiene nada
 * que ver con un objetivo táctil: es relleno horizontal — por eso va como
 * `px-[44px]` y no como `px-objetivo-tactil`, que sugeriría lo contrario.
 * Aclaración pedida por `ui-reviewer`.
 */
export function ResultadoQuiz({ resultado }: Props) {
  /*
   * Las falladas se cuentan sobre el **total de la partida**, no sobre las
   * líneas de la revisión: la revisión muestra cinco de las diez preguntas
   * (es un resumen, así lo pide el ticket), así que contar sus `acerto:
   * false` daba 2 donde el visitante falló 3 — el label del enlace mentía
   * respecto de la cifra "7/10" de la misma pantalla. Hallazgo de
   * `ui-reviewer`.
   */
  const falladas = resultado.totalPreguntas - resultado.aciertos;

  return (
    <main id="contenido" className="mx-auto max-w-[820px] px-lg py-2xl">
      {/*
       * ── Panel de encabezado ──────────────────────────────────────────
       * Panel invertido de la identidad v2 (fondo `--color-celeste-900`,
       * texto blanco): `identidad-argentum` lo define exactamente así, y es
       * el patrón que corresponde al cierre de una partida. Sin `radius`,
       * como pide la especificación, y pegado a la franja de estadísticas de
       * abajo para que las dos superficies se lean como un solo bloque.
       *
       * Dentro de un panel invertido rigen los tokens invertidos de la
       * marca: `--color-error-invertido` en lugar de `--color-error`, y
       * `--color-foco-invertido` en lugar de `--color-foco` (reglas de uso 6
       * y 17). Esta sección no usa ninguno de los dos porque no tiene ni
       * estado de error ni elemento focuseable: es puramente informativa.
       */}
      <section className="border border-celeste-900 bg-celeste-900 px-[44px] py-[52px] text-center">
        <p className="m-0 flex flex-wrap items-center justify-center gap-sm">
          <span className="font-cuerpo text-[11px] font-semibold tracking-[0.18em] text-celeste-150 uppercase">
            Quiz de {resultado.tipo.toLowerCase()} · terminado
          </span>

          {/*
           * Tag del tipo de entidad del quiz, **outline**: texto y borde en
           * `--color-celeste-150`, sin relleno. Dictamen del
           * `brand-specialist` para este ticket, que extiende la marca en un
           * punto que ningún documento cubría: dentro de un panel invertido
           * un chip va en outline de `--celeste-150` (8.17:1), y la paleta de
           * seis categorías **no entra a paneles invertidos** — su terna es
           * un sistema de chip sobre superficie clara, y acá el relleno
           * `#EAF4FE` se volvería el elemento más claro del panel y le
           * ganaría a la cifra, que es el dato de la pantalla. Tampoco se
           * reutiliza `--color-acento-repaso-*`, que es el acento del dominio
           * de la tarjeta de repaso (ticket #91) y no del tipo de entidad, ni
           * se derivan seis variantes invertidas para un solo chip.
           *
           * `uppercase`, nunca `font-variant-caps: small-caps` (regla de uso
           * 13: Lora no tiene confirmado el feature `smcp`).
           */}
          <span className="inline-flex items-center rounded-sm border border-celeste-150 px-sm py-xs text-chip text-celeste-150 uppercase">
            {resultado.tipo}
          </span>
        </p>

        {/*
         * Los aciertos sobre el total, la cifra que da sentido a toda la
         * pantalla. `.au-dark` es el gradiente dorado de la marca para texto
         * sobre panel invertido (6.40:1 en su extremo, ADR 0015) — el dorado
         * acá es marca y logro, nunca semántica de acierto o error, que es
         * verde y rojo más abajo (regla de color del sistema).
         *
         * La barra "7/10" no se lee bien con un lector de pantalla, así que
         * la cifra visible va `aria-hidden` y el `<h1>` lleva la versión en
         * palabras: el título accesible de la pantalla es la frase completa,
         * no el símbolo.
         */}
        <h1 className="m-0 mt-md font-titulo text-[76px] leading-none font-normal lining-nums sm:text-[96px]">
          <span aria-hidden="true" className="au-dark">
            {resultado.aciertos}/{resultado.totalPreguntas}
          </span>
          <span className="sr-only">
            {resultado.aciertos} de {resultado.totalPreguntas} respuestas correctas
          </span>
        </h1>

        {/*
         * Itálica sintética, igual que la pista de `quiz-pregunta.tsx`: el
         * layout no carga la variante itálica de ninguna de las dos familias
         * (ver el comentario de `layout.tsx`). Es la misma deuda que ya
         * asumió el ticket #94, no una nueva — se resuelve cargando la
         * itálica de Cormorant Garamond, lo que es una decisión del
         * `brand-specialist`, no de esta pantalla.
         */}
        <p className="m-0 mt-sm font-titulo text-[22px] italic text-texto-sobre-celeste">{resultado.resumen}</p>

        {/*
         * La liga y lo que falta para la siguiente. La liga no se guarda: es
         * una función pura del total de puntos (`CONTEXT.md`), y acá solo se
         * muestra. La píldora es de borde, sin relleno: un relleno dorado
         * sobre celeste está prohibido por la regla de uso 3 de
         * `identidad-argentum` (la única excepción es el dorso de la tarjeta
         * de repaso, y esta no lo es); el borde y el texto dorados sí
         * conviven, mismo precedente que el botón de pista de
         * `quiz-pregunta.tsx`.
         */}
        <p className="m-0 mt-lg inline-flex flex-wrap items-center justify-center gap-sm rounded-full border border-accent-300 px-[16px] py-[6px]">
          {/*
           * "Liga Plata" en `--color-accent-300` **sólido, no `.au-dark`**:
           * dictamen del `brand-specialist`. A 13px con tracking, un
           * gradiente recortado a texto cae sobre trazos de 1px de Cormorant
           * donde ningún stop se distingue —se percibe como un color plano
           * indeterminado, lavado por el antialiasing— y además le roba
           * jerarquía a la cifra de 96px, que es la que sí merece `.au-dark`
           * en esta pantalla. Sólido da 8.48:1 y unifica el badge con el
           * "+140" de al lado.
           */}
          <span className="font-titulo text-[13px] tracking-[0.08em] text-accent-300">Liga {resultado.liga}</span>

          {resultado.ligaSiguiente !== undefined && (
            <>
              <span aria-hidden="true" className="h-[12px] w-px bg-accent-300" />
              <span className="font-cuerpo text-[11px] text-accent-300 tabular-nums lining-nums">
                {`+${String(resultado.puntosSumados)}${NBSP}hacia ${resultado.ligaSiguiente} · faltan${NBSP}${String(
                  resultado.puntosParaLaSiguiente,
                )}`}
              </span>
            </>
          )}
        </p>
      </section>

      {/*
       * ── Franja de estadísticas ───────────────────────────────────────
       * `<dl>` de tres pares término/valor. El marcado lleva `dt` **antes**
       * de `dd`, que es el orden que exige el content model de `<dl>` ("uno
       * o más `dt` seguidos por uno o más `dd`" por grupo), y el orden
       * visual pedido —la cifra arriba, la etiqueta abajo— lo da
       * `flex-col-reverse`, no el orden del marcado. Hallazgo de
       * `ui-reviewer`, que corrige una justificación equivocada que tenía
       * antes este comentario: el orden **sí** está fijado, y con `dd`
       * primero algunos lectores de pantalla pierden el emparejamiento
       * término/valor.
       *
       * `estadisticas-catalogo.tsx` tiene el mismo defecto, con el mismo
       * comentario equivocado. **No se arregla acá**: está fuera del ticket
       * #106 y meterlo en este diff le daría dos intenciones — va como
       * hallazgo al reporte del ticket.
       *
       * Pegada al panel de arriba y sin borde superior, para que las dos
       * superficies se lean como un bloque continuo. Las tres cifras van con
       * `tabular-nums lining-nums` en `font-titulo` (Cormorant Garamond): es
       * la familia sin el riesgo de `tabular-nums` que `identidad-argentum`
       * documenta para Lora.
       */}
      <dl className="m-0 flex border border-t-0 border-celeste-150 bg-celeste-50">
        <div className="flex min-w-0 flex-1 flex-col-reverse border-l border-celeste-150 px-md py-[24px] text-center">
          <dt className="mt-sm font-cuerpo text-[11px] tracking-[0.16em] text-texto-secundario uppercase">
            Puntos sumados
          </dt>
          <dd className="m-0 font-titulo text-[34px] leading-none text-accent-800 tabular-nums lining-nums">
            {resultado.puntosSumados}
          </dd>
        </div>

        <div className="flex min-w-0 flex-1 flex-col-reverse border-l border-celeste-150 px-md py-[24px] text-center">
          <dt className="mt-sm font-cuerpo text-[11px] tracking-[0.16em] text-texto-secundario uppercase">
            Respuestas correctas
          </dt>
          <dd className="m-0 font-titulo text-[34px] leading-none text-ok tabular-nums lining-nums">
            {resultado.aciertos}
          </dd>
        </div>

        <div className="flex min-w-0 flex-1 flex-col-reverse border-l border-celeste-150 px-md py-[24px] text-center">
          <dt className="mt-sm font-cuerpo text-[11px] tracking-[0.16em] text-texto-secundario uppercase">
            Tiempo total
          </dt>
          <dd className="m-0 font-titulo text-[34px] leading-none text-texto-titulo tabular-nums lining-nums">
            {resultado.tiempoTotal}
          </dd>
        </div>
      </dl>

      {/*
       * ── Revisión de la partida ──────────────────────────────────────
       * La sección entera **no se renderiza** si la revisión viene vacía: una
       * tabla con un `<caption>` y ningún `<tr>`, bajo un rótulo que promete
       * una revisión, es interfaz rota. Hallazgo de `ui-reviewer`
       * (`guidelines.md`, Content Handling: "Handle empty states").
       */}
      {resultado.revision.length > 0 && (
        <section aria-labelledby="titulo-revision" className="mt-2xl">
          <div className="flex items-center gap-md">
            <h2
              id="titulo-revision"
              className="m-0 font-cuerpo text-[11px] font-semibold tracking-[0.18em] text-texto-secundario uppercase"
            >
              Revisión de la partida
            </h2>
            <span aria-hidden="true" className="h-px flex-1 bg-arena-borde" />
          </div>

          {/*
           * Tabla real, no una grilla de `<div>`: cada fila son cinco datos de
           * la misma pregunta y la relación entre columnas es tabular.
           *
           * `<thead>` **real, con `<th scope="col">`, escondido en `sr-only`**.
           * La especificación pide que la cabecera no se vea, y eso se resuelve
           * ocultándola visualmente, no borrándola: un `<caption>` es el nombre
           * accesible de la tabla y **no** reemplaza las cabeceras de columna —
           * sin `<th>`, un lector de pantalla en modo tabla anuncia "columna 3"
           * en vez de "Tu respuesta" y la relación enunciado → respuesta →
           * resultado se pierde. Hallazgo de `ui-reviewer`, que corrige la
           * suposición equivocada que tenía antes este comentario.
           *
           * Los anchos van en las `<th>`, no en las celdas de la primera fila:
           * es el lugar natural para declararlos una sola vez. `table-fixed`
           * los hace efectivos — sin eso el enunciado largo empuja las columnas
           * de ancho fijo y la marca de resultado se parte en dos líneas.
           */}
          <table className="mt-md w-full table-fixed border-collapse">
            <caption className="sr-only">
              Las cinco preguntas de la partida, con la respuesta que diste y si acertaste. Las incorrectas ofrecen el
              acceso a la ficha de la entidad.
            </caption>

            <thead className="sr-only">
              <tr>
                <th scope="col" className="w-[26px]">
                  Número de la pregunta
                </th>
                <th scope="col">Pregunta</th>
                <th scope="col" className="w-[150px]">
                  Tu respuesta
                </th>
                <th scope="col" className="w-[110px]">
                  Resultado
                </th>
                <th scope="col" className="w-objetivo-tactil">
                  Ficha de la entidad
                </th>
              </tr>
            </thead>

            <tbody>
              {resultado.revision.map((linea) => (
                <tr key={linea.numero} className="border-b border-arena-borde-suave">
                  <td className="py-md pr-sm align-top font-titulo text-accent-700 lining-nums">
                    <span aria-hidden="true">{NUMERAL_ROMANO[linea.numero] ?? linea.numero}</span>
                    <span className="sr-only">Pregunta {linea.numero}</span>
                  </td>

                  <td className="min-w-0 py-md pr-md align-top font-cuerpo text-[14px] wrap-anywhere text-texto-cuerpo">
                    {linea.enunciado}
                  </td>

                  <td className="py-md pr-md align-top font-titulo text-[15px] italic wrap-anywhere text-texto-secundario">
                    {linea.respuestaDada}
                  </td>

                  {/*
                   * La marca de resultado **no depende solo del color**: lleva
                   * la palabra completa ("Correcta" / "Incorrecta") y un
                   * símbolo. El símbolo va `aria-hidden` porque un lector de
                   * pantalla ya recibe la palabra; el color es el tercer
                   * portador, no el único.
                   *
                   * Verde = correcto, rojo = error. Nunca dorado para esto: el
                   * dorado de esta pantalla es marca y logro (la cifra, los
                   * puntos, la liga), no semántica.
                   */}
                  <td
                    className={`py-md text-right align-top font-cuerpo text-[11px] font-semibold tracking-[0.14em] whitespace-nowrap uppercase ${
                      linea.acerto ? "text-ok" : "text-error"
                    }`}
                  >
                    {linea.acerto ? "Correcta" : "Incorrecta"}{" "}
                    <span aria-hidden="true">{linea.acerto ? "✓" : "✕"}</span>
                  </td>

                  {/*
                   * El acceso a la ficha, solo en las falladas: el error abre
                   * una puerta, no cierra una. La columna mide
                   * `--spacing-objetivo-tactil` (44px, declarado en su `<th>`)
                   * y no los 26px de la especificación visual, porque el
                   * enlace es un objetivo táctil y la regla de uso 18 de
                   * `identidad-argentum` fija ese mínimo; el ícono sigue
                   * ocupando 11px, es el área tocable la que crece.
                   *
                   * El nombre accesible nombra la entidad ("Ver la ficha de
                   * Teatro Colón"): un `aria-label` de "Ver la ficha" a secas
                   * daría cuatro enlaces indistinguibles en una lista de
                   * enlaces.
                   */}
                  <td className="py-md text-right align-top">
                    {linea.entidad !== undefined && (
                      <Link
                        href={linea.entidad.href}
                        aria-label={`Ver la ficha de ${linea.entidad.nombre}`}
                        className="inline-flex size-objetivo-tactil items-center justify-center rounded-sm font-cuerpo text-[11px] text-celeste-text motion-safe:transition-colors motion-safe:duration-150 hover:bg-celeste-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
                      >
                        <span aria-hidden="true">↗</span>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/*
       * ── Salidas ─────────────────────────────────────────────────────
       * Dos navegaciones reales (`<Link>`, que renderiza un `<a>`), no
       * botones: llevan a otra pantalla, así que el elemento correcto es un
       * enlace. Los dos con `min-h` de objetivo táctil y foco visible con el
       * anillo por defecto de la marca (`--color-foco`, regla de uso 17).
       *
       * **El destino de "Ver mi progreso" es provisorio y apunta a la home.**
       * El panel de progreso todavía no existe como ruta (el módulo
       * `progreso` tampoco, ADR 0002) y el ticket #106 lo deja fuera de
       * alcance, así que la alternativa era un `href` a una ruta inexistente
       * —un 404 en una pantalla de cierre, el peor lugar para uno— o no
       * ofrecer la salida, que el ticket pide explícitamente. Cuando la ruta
       * de progreso exista, este `href` es el único cambio.
       */}
      <nav aria-label="Qué hacer después del quiz" className="mt-xl flex flex-col gap-md sm:flex-row">
        <Link
          href="/"
          className="flex min-h-objetivo-tactil flex-1 items-center justify-center rounded-sm border border-arena-borde px-lg py-[15px] text-center font-cuerpo text-[14px] font-semibold text-texto-titulo motion-safe:transition-colors motion-safe:duration-150 hover:border-borde-strong hover:bg-blanco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
        >
          Ver mi progreso
        </Link>

        {/*
         * La segunda salida usa el **acento de repaso** morado
         * (`--color-acento-repaso-*`), no la rampa verde: el verde de este
         * sistema es semántica de "correcto" y este enlace no significa
         * "correcto", significa "ir a repasar con tarjetas" — que es
         * exactamente el acento que el ticket #91 tokenizó para la pantalla
         * de repaso. Ver la nota del `brand-specialist` en el reporte del
         * ticket.
         *
         * El texto nombra cuántas falló, contado de los aciertos sobre el
         * total: no hay un número escrito a mano que pueda desincronizarse.
         *
         * **La salida desaparece con la partida perfecta.** Con `falladas ===
         * 0` el texto sería "repasar las 0 que fallé" y el enlace ofrecería
         * repasar la nada, así que en ese caso queda solo "Ver mi progreso",
         * que ocupa el ancho completo. Hallazgo de `ui-reviewer`
         * (`guidelines.md`, Content Handling). No es un caso hipotético: es
         * exactamente el mejor resultado posible del quiz.
         */}
        {falladas > 0 && (
          <Link
            href="/tarjetas"
            className="flex min-h-objetivo-tactil flex-1 items-center justify-center rounded-sm border border-acento-repaso-700 px-lg py-[15px] text-center font-cuerpo text-[14px] font-semibold text-acento-repaso-700 motion-safe:transition-colors motion-safe:duration-150 hover:bg-acento-repaso-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
          >
            Repasar con tarjetas {falladas === 1 ? "la que fallé" : `las ${falladas} que fallé`}
          </Link>
        )}
      </nav>
    </main>
  );
}
