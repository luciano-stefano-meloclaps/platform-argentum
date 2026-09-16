/**
 * Mock de la entidad que muestra la pantalla "Ficha" (`ficha-entidad.tsx`).
 *
 * Es el mismo criterio que ya aplican `salas-del-catalogo.datos.ts` y
 * `estadisticas-catalogo.datos.ts`: la pantalla se construye contra una
 * forma de datos explícita y mockeada, y el día que el módulo `catalogo`
 * (ADR 0002) exponga estos campos el cambio es de import, no de componentes.
 *
 * Importante: esta forma **no** es la del descriptor de `procer`
 * (`src/catalogo/descriptores/procer.ts`). El descriptor de hoy no tiene
 * epíteto, ni número de orden dentro de la sala, ni tabla de datos en pares
 * clave-valor, ni fichas relacionadas, ni resumen de historial de
 * propuestas. Agregar esos campos al descriptor es una decisión de esquema y
 * de contenido que no es de esta pantalla: hasta que exista, la ficha
 * rediseñada vive contra este mock y la ficha conectada a datos reales sigue
 * siendo `src/app/catalogo/[slug]/ficha-procer.tsx`.
 *
 * Las fechas van en el formato "clásico" de toda la plataforma —día ·
 * numeral romano del mes · año, con punto medio como separador— y por eso son
 * `string` y no `Date`: son texto de presentación ya compuesto, no un
 * instante que esta capa tenga que formatear.
 */

/**
 * Una fila de la tabla de datos, en formato "diccionario": **dos** pares
 * clave-valor por fila, no uno. La tabla es de cuatro columnas
 * (clave-valor-clave-valor), así que la fila es la unidad que se repite y
 * lleva los dos pares juntos.
 */
export type FilaDeDatos = {
  k1: string;
  v1: string;
  k2: string;
  v2: string;
};

/** Una entrada de "Véase también": el nombre de otra ficha y su tipo. */
export type FichaRelacionada = {
  nombre: string;
  /** El tipo de la entidad relacionada ("Prócer", "Evento", "Fecha"…). */
  tipo: string;
  /**
   * La dirección de esa ficha, si existe. Hoy ninguna de las cuatro tiene
   * ruta propia —el catálogo real solo publica las entidades de `contenido/`—
   * así que el campo es opcional y el componente decide qué hacer cuando
   * falta (ver `ficha-entidad.tsx`), en vez de dejar un link roto.
   */
  href?: string;
};

/** La entidad completa, tal como la consume la pantalla "Ficha". */
export type EntidadDeFicha = {
  nombre: string;
  /** El epíteto que va en itálica bajo el nombre, sin punto final. */
  epiteto: string;
  /** El nombre de la sala a la que pertenece, para el breadcrumb. */
  sala: string;
  /** La dirección del índice de esa sala. */
  salaHref: string;
  /** El orden dentro de la sala. Se muestra con cero a la izquierda. */
  numeroFicha: number;
  /** Qué representa la imagen, para el `alt` cuando exista el archivo real. */
  imagenAlt: string;
  /** Qué imagen falta, en el placeholder: "retrato · óleo s. XIX". */
  imagenNota: string;
  /** El pie de foto, en itálica, debajo de la imagen. */
  imagenCaption: string;
  /** Los párrafos de cuerpo. El primero lleva la letra capital. */
  parrafos: string[];
  datos: FilaDeDatos[];
  relacionadas: FichaRelacionada[];
  /**
   * El párrafo de la nota de historial, sin el link final "Ver el historial"
   * —ese lo agrega el componente, porque es navegación y no texto.
   */
  historialResumen: string;
};

const SAN_MARTIN: EntidadDeFicha = {
  nombre: "José de San Martín",
  epiteto: "Libertador de la Argentina, Chile y el Perú",
  sala: "Próceres",
  salaHref: "/catalogo",
  numeroFicha: 7,
  imagenAlt: "Retrato del general José de San Martín",
  imagenNota: "retrato · óleo s. XIX",
  imagenCaption: "Retrato del general, atribuido a la escuela francesa.",
  parrafos: [
    "Militar nacido en Yapeyú, Corrientes, en 1778, formado en los cuarteles de una España que todavía se creía dueña de medio mundo. Volvió al Río de la Plata a los treinta y cuatro años, con la carrera hecha y el nombre limpio, para ponerlos al servicio de una revolución que apenas sabía cómo llamarse.",
    "Entendió antes que nadie que la independencia no se defendía en el litoral sino en el Pacífico, y que para llegar al Pacífico había que atravesar la cordillera. Cruzó los Andes en 1817 con un ejército levantado provincia por provincia, venció en Chacabuco y en Maipú, entró en Lima y proclamó la independencia del Perú. Después renunció a todo y se fue a morir en Francia, en una casa alquilada frente al mar del norte.",
  ],
  datos: [
    { k1: "Nacimiento", v1: "25 · II · 1778", k2: "Fallecimiento", v2: "17 · VIII · 1850" },
    { k1: "Nació en", v1: "Yapeyú, Corrientes", k2: "Murió en", v2: "Boulogne-sur-Mer" },
    { k1: "Grado", v1: "General", k2: "Campañas", v2: "Cuyo, Chile, Perú" },
    { k1: "Batallas", v1: "San Lorenzo, Chacabuco, Maipú", k2: "Años en campaña", v2: "1812 – 1822" },
  ],
  relacionadas: [
    { nombre: "Cruce de los Andes", tipo: "Evento" },
    { nombre: "Manuel Belgrano", tipo: "Prócer", href: "/catalogo/manuel-belgrano" },
    { nombre: "17 de agosto", tipo: "Fecha" },
    { nombre: "Granaderos a Caballo", tipo: "Evento" },
  ],
  historialResumen:
    "Esta ficha registra dos propuestas resueltas. Nada se publica sin la aprobación de un admin: el historial de propuestas es la auditoría del catálogo.",
};

/** Las entidades mockeadas, por slug. Hoy hay una sola. */
const POR_SLUG: Record<string, EntidadDeFicha> = {
  "jose-de-san-martin": SAN_MARTIN,
};

/**
 * Anticipa la firma de la consulta real que algún día va a vivir en el módulo
 * `catalogo` —async, un slug como argumento, `undefined` si no existe— igual
 * que `contarEntidadesPorTipo` en `salas-del-catalogo.datos.ts` anticipa la
 * suya. Cuando esa función exista, el cambio acá es de import, no de
 * componentes.
 */
export async function obtenerEntidadDeFicha(slug: string): Promise<EntidadDeFicha | undefined> {
  return POR_SLUG[slug];
}
