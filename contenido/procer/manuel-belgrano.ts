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

    semblanza: `Manuel Belgrano nació en Buenos Aires en 1770, en una familia de
comerciantes. Lo mandaron a estudiar leyes a España y volvió con una idea que en
el Río de la Plata casi nadie tenía: que un país se hace fuerte cuando su gente
sabe leer, sabe cultivar y puede comerciar con quien quiera.

Desde el Consulado de Buenos Aires empujó escuelas de comercio, de náutica y de
dibujo, y escribió una y otra vez que había que enseñarles a leer también a las
chicas. Cuando llegó la Revolución de Mayo estuvo en la Primera Junta, y aunque
nunca había sido soldado terminó al frente de un ejército.

En febrero de 1812, a orillas del río Paraná, en Rosario, mandó izar por primera
vez una bandera celeste y blanca. Ese mismo año, con el Éxodo Jujeño, convenció
a un pueblo entero de irse antes que entregarle sus cosas al enemigo, y después
ganó las batallas de Tucumán y de Salta.

Murió en 1820 en la misma casa donde había nacido, pobre y enfermo, mientras
Buenos Aires andaba a los tiros entre caudillos. Cuentan que pagó al médico que
lo atendía con un reloj, porque ya no le quedaba otra cosa. Le había regalado al
país la bandera bajo la que todavía nos juntamos.`,

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
