import type { FichaDe } from "../../src/catalogo/importacion/ficha";

/**
 * Ficha de ejemplo del contenido curado (ADR 0009).
 *
 * El **tipo** es el directorio (`procer`) y el **slug** es el nombre del
 * archivo (`manuel-belgrano`): ninguno de los dos se repite acá adentro, así
 * que no pueden contradecirse. La imagen va en
 * `public/contenido/procer/manuel-belgrano.webp` y su ruta se **deriva**: este
 * archivo declara el texto alternativo, el crédito y la licencia, nada más.
 *
 * Solo TypeScript de tipos borrables —una anotación de tipo y un `export
 * default`—, para que el script de importación pueda ejecutarlo con `node`
 * directo, sin compilador en el camino.
 *
 * Fuentes de los hechos de `contexto` y `semblanza` (cuarta reescritura del
 * `contexto` en el registro del ADR 0012, ticket #51, entregada para
 * comparar contra la tercera variante —la del organismo con circulación
 * sanguínea, que el usuario no aprobó ni rechazó explícitamente, solo pidió
 * otra opción—; la `semblanza` quedó aprobada en una reescritura anterior y
 * no se tocó en ninguna de las dos vueltas):
 * - Hechos biográficos de Belgrano: son exactamente los que ya traía la
 *   versión anterior de esta ficha —nacimiento en Buenos Aires en 1770,
 *   estudios de leyes en España, actividad en el Consulado de Buenos Aires
 *   (escuelas de comercio, náutica y dibujo, educación de niñas),
 *   participación en la Primera Junta, izamiento de la bandera en Rosario en
 *   febrero de 1812, Éxodo Jujeño, batallas de Tucumán y Salta, muerte en
 *   1820 pobre y enfermo, y la anécdota del reloj—. No se agregó ningún
 *   hecho biográfico nuevo sobre Belgrano.
 * - Contexto histórico general de época (monopolio comercial español previo
 *   a 1778, Reglamento de Libre Comercio de 1778 y creación de la Aduana de
 *   Buenos Aires, fundación del Virreinato del Río de la Plata en 1776/1777,
 *   ascenso administrativo de Buenos Aires y circulación clandestina de
 *   ideas ilustradas pese a la censura española): dossier del
 *   `historiador-specialist` del ticket #51. Es historia institucional de
 *   consenso, sin disputa política vigente.
 * Esta ficha no tiene todavía una referencia bibliográfica primaria citable
 * (obra, autor, año) para los hechos biográficos: queda pendiente que el
 * usuario la aporte si se quiere sostener con más detalle.
 */
const manuelBelgrano: FichaDe<"procer"> = {
  nombre: "Manuel Belgrano",
  datos: {
    nombreCompleto: "Manuel José Joaquín del Corazón de Jesús Belgrano",

    anioDeNacimiento: 1770,
    anioDeMuerte: 1820,

    resumen:
      "Abogado, economista y militar porteño. Creó la bandera celeste y blanca " +
      "en 1812 y dedicó su vida y su fortuna a la independencia y a la escuela " +
      "pública.",

    contexto:
      "Durante buena parte del siglo XVIII, el imperio español trató a " +
      "sus colonias americanas como una hacienda cercada: toda su " +
      "cosecha debía salir por un único portón, el puerto de Cádiz. " +
      "Buenos Aires era un campo distante y desatendido, forzado al " +
      "contrabando con el Brasil portugués para no quedar yermo. La " +
      "cerca empezó a ceder en 1778, cuando la Corona, urgida por sus " +
      "propias guerras europeas, promulgó el Reglamento de Libre " +
      "Comercio y habilitó en ese campo marginal una aduana propia. Fue " +
      "como abrir un segundo portón: por él entró de golpe una riqueza " +
      "que alcanzó para sostener, casi en soledad, a un Virreinato " +
      "recién fundado, el último y más tardío que España sembraría en " +
      "América. Buenos Aires, elevada de pronto a cabecera de ese " +
      "territorio remendado, empezó a dar frutos que ya no cabían en " +
      "los graneros antiguos. Y por el mismo portón que dejaba pasar " +
      "mercancías se colaban, escondidas entre fardos, semillas que " +
      "ningún reglamento sabía identificar a tiempo: Rousseau, " +
      "Montesquieu, una Ilustración entera que la censura española no " +
      "lograba desenterrar antes de que germinara. Faltaba apenas una " +
      "mano dispuesta a convertir ese suelo removido en cultivo " +
      "metódico: un joven porteño, hijo de comerciantes, que cruzaría " +
      "el océano a estudiar leyes y volvería con semillas mucho más " +
      "duraderas que cualquier mercancía…",

    semblanza:
      "Manuel Belgrano no fue un militar que aprendió a gobernar: fue un " +
      "sembrador obligado, contra su naturaleza y su fortuna, a defender " +
      "el surco con la espada. Volvió de España convencido de que ningún " +
      "país se funda por decreto sino por siembra paciente —escuelas, " +
      "oficios, números—, y esa convicción, tan poco marcial, gobernó " +
      "cada uno de sus actos hasta el último. Desde el Consulado de " +
      "Buenos Aires impulsó escuelas de comercio, de náutica y de " +
      "dibujo. Insistió también en que las niñas tenían tanto derecho " +
      "como los varones a que alguien les enseñara a leer: una semilla " +
      "que la época prefería enterrar antes que dejar germinar. La " +
      "Revolución de Mayo lo encontró en la Primera Junta y, sin que " +
      "hubiese llevado jamás un uniforme, lo empujó al frente de un " +
      "ejército improvisado y hambriento. Aceptó, porque entendía que a " +
      "veces hay que empuñar el arado como arma antes de sembrar con él. " +
      "En febrero de 1812, a orillas del Paraná, en Rosario, izó por " +
      "primera vez una bandera celeste y blanca, y meses después, con el " +
      "Éxodo Jujeño, logró que un pueblo entero prefiriese quemar su " +
      "propia cosecha antes que entregársela al enemigo. Ganó Tucumán, " +
      "ganó Salta, y sin embargo murió en 1820, pobre y enfermo, en la " +
      "misma casa donde había nacido, mientras Buenos Aires se " +
      "despedazaba entre caudillos que ya no escuchaban a nadie. Cuentan " +
      "que pagó al médico que lo velaba con el único reloj que le " +
      "quedaba: el hombre que había sembrado escuelas, banderas y " +
      "ejércitos enteros no tenía, al final, más que ese puñado de horas " +
      "para entregar. No dejó fortuna: dejó una cosecha que otros, con " +
      "el tiempo que a él ya no le alcanzó, iban a recoger.",

    imagen: {
      textoAlternativo:
        "Retrato al óleo de Manuel Belgrano de joven, de tres cuartos de perfil, " +
        "con casaca oscura y camisa blanca con volados.",
      credito:
        "Retrato de Manuel Belgrano, de François-Casimir Carbonnier (Londres, 1815). " +
        "Museo Histórico Nacional, Buenos Aires.",
      licencia: "dominio-publico",
    },
  },
};

export default manuelBelgrano;
