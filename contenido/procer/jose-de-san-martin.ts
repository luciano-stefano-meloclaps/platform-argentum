import type { FichaDe } from "../../src/catalogo/importacion/ficha";

/**
 * Ficha curada de José de San Martín (ticket #85, ADR 0009 y 0012).
 *
 * El **tipo** es el directorio (`procer`) y el **slug** es el nombre del
 * archivo (`jose-de-san-martin`). La imagen va en
 * `public/contenido/procer/jose-de-san-martin.webp` y su ruta se **deriva**:
 * este archivo declara el texto alternativo, el crédito y la licencia, nada
 * más. La prosa va en comillas dobles concatenadas (ADR 0030).
 *
 * Fuentes consultadas, agrupadas por bloque de hechos. Las verificó el
 * `historiador-specialist` para #85; las web, consultadas el 2026-10-12. Su
 * dossier completo, con el estado de cada hecho y los que no se sostienen,
 * está publicado como comentario en #85. Ningún hecho de esta ficha fue
 * aportado por escrito por el CTO. Las tres elecciones que el dossier dejó
 * abiertas —`nombreCompleto`, `anioDeNacimiento` y el retrato— las delegó el
 * CTO en los agentes el 2026-10-12, que adoptaron la recomendación del
 * historiador.
 *
 * Datos biográficos (nombre, años, origen, Buenos Aires y San Lorenzo):
 * - Alejandro Morea, en Sabrina Aguilera, «El complejo recorrido de un
 *   prócer que luchó por la independencia», CONICET, 2022.
 *   https://www.conicet.gov.ar/el-complejo-recorrido-de-un-procer-que-lucho-por-la-independencia/
 * - Miguel Ángel De Marco, «San Martín: por qué la intolerancia entre los
 *   argentinos lo llevó al exilio», La Nación, 2024.
 *   https://www.lanacion.com.ar/ideas/san-martin-por-que-la-intolerancia-entre-los-argentinos-lo-llevo-al-exilio-nid10022024/
 * - «José de San Martín y Remedios de Escalada: a 210 años del casamiento»,
 *   La Nación, 2022.
 *   https://www.lanacion.com.ar/lifestyle/jose-de-san-martin-y-remedios-de-escalada-a-210-anos-del-casamiento-como-fue-su-historia-nid12092022/
 * - Wikipedia, «José de San Martín» (solo para corroborar).
 *   https://es.wikipedia.org/wiki/José_de_San_Martín
 * - Wikipedia, «Early life of José de San Martín».
 *   https://en.wikipedia.org/wiki/Early_life_of_José_de_San_Martín
 * - Florencia Martínez del Río, Unidiversidad, 2017.
 *   https://www.unidiversidad.com.ar/se-reavivo-la-hipotesis-del-origen-mestizo-de-jose-de-san-martin
 * - Casa Rosada, «213 years since the Battle of San Lorenzo», 2026.
 *   https://www.casarosada.gob.ar/international/latest-news/51160-213-years-since-the-battle-of-san-lorenzo
 * - María Luz Stella, «Sargento Cabral: la verdadera historia…», DEF, 2026.
 *   https://defonline.com.ar/internacionales/sargento-cabral-la-verdadera-historia-detras-del-granadero-que-salvo-al-general-san-martin/
 *
 * Cuyo, cruce de los Andes y Chile:
 * - Bartolomé Mitre, «Historia de San Martín y de la emancipación
 *   sudamericana», 1887-1890; traducción de William Pilling, 1893, caps. XII
 *   a XVIII. https://www.gutenberg.org/ebooks/48856 — original:
 *   https://archive.org/details/historiadesanma02mitr
 * - Claudio Morales Gorleri, «San Martín. Su aporte a la independencia de
 *   Chile», Revista de la ESG n.º 595, 2017.
 *   https://cefadigital.edu.ar/jspui/bitstream/1847939/1034/1/Revista%20ESG%20no.595-2017-Morales%20Gorleri_188.pdf
 * - José de San Martín, proclama de Mendoza, 1819 (fuente primaria), en José
 *   Luis Busaniche, «San Martín vivo», Emecé, 2000.
 *   https://backend.educ.ar/refactor_resource/get-attachment/24244
 * - Gobierno de Mendoza, «Se conmemoró el día de la Bandera Provincial».
 *   https://www.mendoza.gov.ar/prensa/se-conmemoro-el-dia-de-la-bandera-provincial/
 *
 * El año 20 (tema en disputa, `voz-narrativa`):
 * - José de San Martín, carta del 26 de marzo de 1820, y Acta de Rancagua
 *   del 2 de abril de 1820 (fuentes primarias).
 *   https://es.wikisource.org/wiki/Acta_de_Rancagua
 * - Morea (CONICET, 2022) y Morales Gorleri (ESG, 2017), las mismas de
 *   arriba.
 * - Luis Bruschtein, entrevista a Norberto Galasso, Página/12, 2000.
 *   https://www.pagina12.com.ar/2000/00-08/00-08-07/pag15.htm
 *
 * Perú y Guayaquil:
 * - Ejército Argentino, «28 de julio: Bicentenario de la independencia del
 *   Perú», 2021.
 *   https://www.argentina.gob.ar/noticias/28-de-julio-bicentenario-de-la-independencia-del-peru
 * - Rosendo Fraga, «La entrevista de Guayaquil: doscientos años de
 *   polémica», Los Andes, 2022.
 *   https://www.losandes.com.ar/opinion/la-entrevista-de-guayaquil-doscientos-anos-de-polemica-sobre-lo-sucedido
 * - Víctor Sánchez Montenegro, «El falso misterio de la entrevista de
 *   Guayaquil», Revista de las Fuerzas Armadas (Colombia), 1972.
 *   https://esdegrevistas.edu.co/index.php/refa/article/download/2755/3174/5920
 * - «El primer Congreso Constituyente y el adiós de San Martín», El
 *   Comercio (Perú).
 *   https://elcomercio.pe/luces/el-primer-congreso-constituyente-y-el-adios-de-san-martin-noticia/
 *
 * Rosas, el testamento y el sable (tema en disputa, `voz-narrativa`):
 * - José de San Martín, testamento ológrafo, París, 23 de enero de 1844
 *   (fuente primaria), Peuser, 1950.
 *   https://backend.educ.ar/refactor_resource/get-attachment/22658
 * - Beatriz Bragoni, «San Martín, Rosas y el orgullo nacional», Los Andes,
 *   2023. https://www.losandes.com.ar/opinion/san-martin-rosas-y-el-orgullo-nacional
 * - Fabio Wasserman, «Ya nadie va a escuchar tu remera…», Prismas n.º 29,
 *   2025. https://prismas.unq.edu.ar/OJS/index.php/Prismas/article/download/1585/2301/3845
 * - Canal26 (divulgación, con declaraciones de Felipe Pigna), 2025.
 *   https://www.canal26.com/historia/2025/09/14/admirado-por-san-martin-y-odiado-por-sarmiento-el-unico-procer-que-no-tiene-feriado-ni-calles-en-caba/
 * - Decreto 843/2015.
 *   https://www.argentina.gob.ar/normativa/nacional/decreto-843-2015-247033/texto
 * - Infobae, 3 de febrero de 2026.
 *   https://www.infobae.com/cultura/2026/02/03/renuncio-la-directora-del-museo-historico-nacional-tras-confirmarse-el-traslado-del-sable-de-san-martin/
 * - Guillermo Madero, Infobae, 31 de enero de 2026.
 *   https://www.infobae.com/opinion/2026/01/31/devolver-el-sable-corvo-al-regimiento-de-granaderos-a-caballo-un-acto-de-reparacion-historica/
 * - Alejandro Díaz Bessone, La Nación, 2 de febrero de 2026.
 *   https://www.lanacion.com.ar/opinion/el-sable-corvo-del-general-san-martin-nid02022026/
 *
 * Imagen (crédito y licencia): la página de Commons se verificó el
 * 2026-10-12 —PD-AR-Photo (ley 11.723, art. 34) y PD-1923 / PD-US-expired,
 * sin pedido de borrado—, y de ahí se bajó el original de 1200 × 1349 px.
 * - Wikimedia Commons, «File:Jose de San Martin.jpg».
 *   https://commons.wikimedia.org/wiki/File:Jose_de_San_Martin.jpg
 * - J. M. Taverna Irigoyen, «Los retratos de José de San Martín», La
 *   Gaceta, 2014. https://www.lagaceta.com.ar/nota/600105/la-gaceta-
 */
const joseDeSanMartin: FichaDe<"procer"> = {
  nombre: "José de San Martín",
  datos: {
    nombreCompleto: "José Francisco de San Martín y Matorras",

    anioDeNacimiento: 1778,
    anioDeMuerte: 1850,

    resumen:
      "Militar nacido en Yapeyú. Al frente del Ejército de los " +
      "Andes cruzó la cordillera, venció en Chacabuco y Maipú y " +
      "proclamó la independencia del Perú, del que fue Protector. Murió " +
      "exiliado en Francia en 1850.",

    contexto:
      "La revolución del Río de la Plata vivía, hacia 1816, " +
      "al pie de una muralla. Del otro lado de la " +
      "cordillera, cuyos pasos trepaban hasta unos cinco mil metros, Chile " +
      "obedecía a un jefe realista, Marcó del Pont, y más " +
      "allá, en Lima, la sede del virrey del Perú se " +
      "alzaba como la cumbre que toda libertad del sur tendría, " +
      "tarde o temprano, que escalar. Buenos Aires, entretanto, se consumía " +
      "en facciones, y la independencia seguía sin declararse aunque desde " +
      "el oeste llegaran cartas que preguntaban, impacientes, hasta cuándo se " +
      "pensaba esperar. Porque en Cuyo, Mendoza se había vuelto un " +
      "taller de guerra: fray Luis Beltrán fundía cañones hasta con " +
      "el bronce de las campanas, y buena parte de la " +
      "tropa eran hombres negros antes esclavizados, comprados por el gobierno " +
      "con la promesa de la libertad. Entre ese taller y " +
      "Chile no había más que piedra y altura. Y frente " +
      "a esa piedra, un militar que había combatido a Napoleón " +
      "bajo bandera española y había vuelto a su tierra natal " +
      "para pelear contra su antiguo rey miraba la montaña y " +
      "no veía un muro: contaba sus pasos…",

    semblanza:
      "José de San Martín leía la guerra como se lee " +
      "una cordillera: donde otros veían la pared, él buscaba la " +
      "quebrada. Antes de cruzar libró una " +
      "guerra de zapa —espionaje, rumores y engaño— y negoció con " +
      "los pehuenches, pueblo indígena cordillerano, un paso por el sur, " +
      "sabiendo que la noticia llegaría a Marcó del Pont. En " +
      "enero de 1817 unos cinco mil hombres y miles de " +
      "mulas treparon por seis pasos; en febrero vencían en Chacabuco. " +
      "La paciencia del estratega convivía con el arrojo del jinete. " +
      "En San Lorenzo, el 3 de febrero de 1813, quedó " +
      "atrapado bajo su caballo, y el granadero Juan Bautista Cabral " +
      "murió de las heridas recibidas al socorrerlo. " +
      "\n\n" +
      "Entre 1819 y 1820, cuando el gobierno del Directorio le " +
      "ordenó marchar contra los federales del Litoral, no obedeció; caído " +
      "ese gobierno, sus oficiales lo ratificaron en el mando en " +
      "Rancagua. Para unos fue insubordinación; para otros, fidelidad a la " +
      "guerra continental por sobre la civil. Sus proyectos monárquicos en " +
      "el Perú se cuestionaron incluso entre sus allegados. En 1822 " +
      "se reunió en Guayaquil con Bolívar —de lo que hablaron " +
      "no quedó acta—, renunció ante el Congreso peruano, dejó a " +
      "Bolívar el final de la guerra y emprendió el descenso. " +
      "\n\n" +
      "En 1829 llegó al Río de la Plata cuando Dorrego " +
      "había sido fusilado por orden de Lavalle, rechazó el gobierno " +
      "que le ofrecieron en nombre de Lavalle y volvió a " +
      "Europa sin desembarcar en Buenos Aires. En su testamento, escrito " +
      "en París en 1844, se lee: «desearía el que mi " +
      "corazón fuese depositado en el de Buenos Aires». Había hecho " +
      "cruzar los Andes a un ejército por seis pasos; le " +
      "quedaba uno, el del regreso, y lo dio treinta años " +
      "después de muerto, cuando sus restos llegaron a Buenos Aires " +
      "en 1880.",

    imagen: {
      textoAlternativo:
        "Daguerrotipo ovalado de José de San Martín en la vejez, sentado y de tres " +
        "cuartos de perfil, con el pelo blanco, bigote, levita oscura cruzada y " +
        "corbata de lazo.",
      credito:
        "Daguerrotipo de José de San Martín, fotógrafo no identificado (París, 1848). " +
        "Museo Histórico Nacional, Buenos Aires.",
      licencia: "dominio-publico",
    },
  },
};

export default joseDeSanMartin;
