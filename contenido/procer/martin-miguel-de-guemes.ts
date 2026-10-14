import type { FichaDe } from "../../src/catalogo/importacion/ficha";

/**
 * Ficha curada de Martín Miguel de Güemes (ticket #246, ADR 0009 y 0012).
 *
 * El **tipo** es el directorio (`procer`) y el **slug** es el nombre del
 * archivo (`martin-miguel-de-guemes`). La imagen va en
 * `public/contenido/procer/martin-miguel-de-guemes.webp` y su ruta se
 * **deriva**: este archivo declara el texto alternativo, el crédito y la
 * licencia, nada más. La prosa va en comillas dobles concatenadas (ADR 0030).
 *
 * **Güemes no está en la lista de disputas vigentes de `voz-narrativa` §7**, y
 * el `historiador-specialist` confirmó en #246 que no corresponde agregarlo:
 * el conflicto con la élite salteña es una diferencia historiográfica real,
 * no una disputa política vigente, y la tensión con Rondeau se narra como lo
 * que fue —un conflicto de mando y de recursos durante la guerra, cerrado en
 * el Pacto de los Cerrillos— sin la clave unitarios/federales, que además es
 * anacrónica para 1816. Por eso esta ficha no lleva contrapunto.
 *
 * **Lo que el dossier marcó como no escribible y esta ficha no escribe:** un
 * número de invasiones contenidas (las fuentes dan entre seis y diez y se
 * contradicen entre sí), una fecha para el fuero gaucho (no hay acto
 * normativo fechado), el motivo por el que Belgrano lo apartó del Ejército
 * del Norte en 1812 (y el episodio mismo queda fuera de esta ficha, por
 * decisión del CTO), «el único general muerto en combate», la hipótesis de la
 * hemofilia, y la atribución de la victoria de Suipacha, cuyo mando era de
 * Antonio González Balcarce. La toma de la fragata *Justina* entra acotada
 * como la sostienen las fuentes —un mercante armado y varado, rendido con una
 * carga de caballería— y sin superlativos.
 *
 * Fuentes consultadas, agrupadas por bloque de hechos. Las verificó el
 * `historiador-specialist` para #246; las web, consultadas el 2026-10-13. Su
 * dossier completo, aprobado por el CTO el 2026-10-13, con el estado de cada
 * hecho y los que no se sostienen, está publicado como comentario en #246.
 * Aportados por el CTO en #246: el `nombreCompleto` elegido entre las
 * variantes de transcripción del dossier, la elección de la imagen y la
 * aprobación de sus derechos, y qué episodios entran y cuáles no.
 *
 * Datos biográficos, cronología y carrera militar:
 * - Gobierno de la Provincia de Salta, «Biografía de Martín Miguel de
 *   Güemes».
 *   https://www.salta.gob.ar/contenidos/biografia-de-martin-miguel-deguemes-8
 * - Wikipedia, «Martín Miguel de Güemes» (solo para corroborar; se contradice
 *   internamente en el número de invasiones y en la fecha de Cerrillos).
 *   https://es.wikipedia.org/wiki/Martín_Miguel_de_Güemes
 * - Wikipedia, «Martín Miguel de Güemes» (en) (solo para corroborar).
 *   https://en.wikipedia.org/wiki/Martín_Miguel_de_Güemes
 *
 * Relación con San Martín y el plan continental (Yatasto, la contención de
 * 1817 y el nombramiento del 8 de junio de 1820):
 * - Instituto Nacional Sanmartiniano (Ministerio de Cultura de la Nación),
 *   «Güemes y sus Gauchos en la hazaña sanmartiniana».
 *   https://sanmartiniano.cultura.gob.ar/noticia/guemes-y-sus-gauchos-en-la-hazana-sanmartiniana-1/
 * - Ministerio de Cultura de la Nación, «Güemes: una hermandad
 *   revolucionaria».
 *   https://www.argentina.gob.ar/noticias/guemes-una-hermandad-revolucionaria
 *
 * La guerra gaucha, los Infernales, el fuero y el conflicto social:
 * - Sara Emilia Mata, «Los gauchos de Güemes. Guerras de independencia y
 *   conflicto social», Buenos Aires, Sudamericana, 2008 (consultada a través
 *   de sus reseñas, no en el original). Es la autoridad académica del tema y
 *   la fuente del fuero militar permanente, de la exención del arriendo y del
 *   conflicto con comerciantes y hacendados que explica la caída de 1821.
 * - Daniel Morán, reseña de Mata, en «Andes», UNSa, vía SciELO Argentina.
 *   https://www.scielo.org.ar/scielo.php?script=sci_arttext&pid=S1668-80902011000200006
 * - Reseña del mismo libro en «Historia Crítica», vía SciELO Colombia.
 *   http://www.scielo.org.co/scielo.php?script=sci_arttext&pid=S0121-16172011000100012
 * - Wikipedia, «Guerra gaucha» (para el oficio del 12 de septiembre de 1815;
 *   su listado de invasiones se usó para el rango, no para fijar una cifra).
 *   https://es.wikipedia.org/wiki/Guerra_gaucha
 *
 * La toma de la fragata «Justina» (1806):
 * - Ministerio de Defensa, «216 años de la toma de la fragata Justine»
 *   (versión oficial, en registro heroico).
 *   https://www.argentina.gob.ar/noticias/216-anos-de-la-toma-de-la-fragata-justine
 * - Cenital, «El día que Güemes tomó un barco a caballo» (detalles de la
 *   nave: mercante adaptado, con cañones y un centenar de marinos).
 *   https://cenital.com/el-dia-que-guemes-tomo-un-barco-a-caballo/
 * - Esteban Tries y Jorge Martín Flores, «Güemes y la toma de "La Justina"»,
 *   La Prensa (columna de opinión; la única que roza el contraste, con la
 *   mención de Lobo restando importancia a la acción).
 *   https://www.laprensa.com.ar/Guemes-y-la-toma-de-La-Justina-492273.note.aspx
 *
 * Imagen (crédito y licencia):
 * - Museo Histórico Nacional (Ministerio de Cultura), «17 de Junio – El
 *   rostro del Gral. Martín Miguel de Güemes»: Güemes «no fue retratado en
 *   vida, ni al óleo ni al lápiz». Todas las imágenes conocidas son
 *   posteriores a 1821 y reconstrucciones, y por eso el crédito nombra al
 *   artista, su año y la institución, y no sugiere un retrato del natural.
 *   https://museohistoriconacional.cultura.gob.ar/noticia/17-de-junio-el-rostro-del-gral-martin-miguel-de-guemes/
 * - Gobierno de la Provincia de Salta, «Restauran el Retrato de Güemes de
 *   Schiaffino»: técnica (carbonilla sobre cartón), fecha, firma, leyenda e
 *   institución de guarda.
 *   https://www.salta.gob.ar/prensa/noticias/restauran-el-retrato-de-guemes-de-schiaffino-76654
 * - Omar López Mato, «Güemes, el héroe sin rostro»: Schiaffino compuso el
 *   rostro con tres nietos de Güemes como modelos y con descripciones de
 *   testigos.
 *   https://institutodecultura.cudes.org.ar/articulo/guemes-el-heroe-sin-rostro-por-omar-lopez-mato/
 * - Wikimedia Commons, «File:Martín Miguel de Güemes.jpg», consultada el
 *   2026-10-13: Eduardo Schiaffino, 1902; autoría y fecha declaradas.
 *   https://commons.wikimedia.org/wiki/File:Martín_Miguel_de_Güemes.jpg
 *   Dominio público en la Argentina por vencimiento del plazo de la Ley
 *   11.723, art. 5 —setenta años desde el 1 de enero siguiente a la muerte
 *   del autor; Schiaffino murió en 1935, con lo que la obra es de dominio
 *   público desde el 1 de enero de 2006—. Recortada en cuadrado desde el
 *   borde superior, hasta los brazos cruzados, y llevada a 800 × 800 px para
 *   el encuadre de la ficha.
 * - Ley 11.723 de Régimen Legal de la Propiedad Intelectual, art. 5 (texto
 *   actualizado, InfoLeg).
 *   https://servicios.infoleg.gob.ar/infolegInternet/anexos/40000-44999/42755/texact.htm
 * - Wikipedia, «Eduardo Schiaffino» (año de muerte, base del cómputo).
 *   https://en.wikipedia.org/wiki/Eduardo_Schiaffino
 */
const martinMiguelDeGuemes: FichaDe<"procer"> = {
  nombre: "Martín Miguel de Güemes",
  datos: {
    nombreCompleto: "Martín Miguel Juan de Mata Güemes Montero de Goyechea y la Corte",

    anioDeNacimiento: 1785,
    anioDeMuerte: 1821,

    resumen:
      "Militar salteño. Gobernador de Salta desde 1815, condujo " +
      "con milicias gauchas la guerra de recursos que contuvo las " +
      "invasiones realistas en el Norte mientras San Martín se " +
      "sostenía en Chile. Murió en 1821, a los 36 años, de una " +
      "herida de bala.",

    contexto:
      "Durante la década que siguió a 1810, el camino del Alto " +
      "Perú fue la herida abierta de la revolución: por ese " +
      "corredor de quebradas y punas bajaban las columnas que el " +
      "poder del rey armaba en el Perú, y por ahí volvían " +
      "deshechos los ejércitos que Buenos Aires mandaba a " +
      "contenerlas. Sipe Sipe, en noviembre de 1815, confirmó lo " +
      "sabido: la batalla campal en terreno ajeno era un lujo que " +
      "la revolución no podía costear. Salta, Jujuy y Tarija " +
      "quedaron entonces como el último tiento de la soga, y eran " +
      "una frontera sin frente fijo: haciendas dispersas, pasos " +
      "de montaña, aguadas que conocían apenas los arrieros y los " +
      "peones criados entre ellas. Mientras la estrategia del " +
      "continente giraba hacia el oeste, al Norte le tocó una " +
      "tarea sin gloria, la de resistir todo el tiempo que " +
      "hiciera falta con lo que hubiera a mano. No habría " +
      "refuerzos ni presupuesto. Ese encargo pedía otra clase de " +
      "guerra, otra clase de ejército y una mano dispuesta a " +
      "cobrarle el precio a los dueños de la tierra que debía " +
      "financiarla. En Salta, un oficial criado entre esos " +
      "cerros, cadete a los catorce años, que en el Plata había " +
      "rendido a caballo una fragata varada, empezaba a entender " +
      "que una frontera no se sostiene como un muro sino como un " +
      "lazo que se ajusta…",

    semblanza:
      "Martín Miguel de Güemes hizo de la escasez un método: en " +
      "vez de buscar la batalla que no podía ganar, tendió sobre " +
      "el Norte un hostigamiento sin tregua, cortó " +
      "abastecimientos y convirtió cada quebrada conocida en una " +
      "emboscada posible. En septiembre de 1815 le dio forma de " +
      "cuerpo a esa idea y creó por oficio la División Infernal " +
      "de Gauchos de Línea, dos escuadrones de dos compañías de " +
      "cien plazas cada una. Los Infernales no pelearon por " +
      "entusiasmo solamente. A los milicianos enrolados les " +
      "correspondía fuero militar permanente —no responder ante " +
      "la justicia ordinaria— y la exención del arriendo mientras " +
      "durara la guerra. El lazo se ajustaba con cuero ajeno: los " +
      "comerciantes y hacendados de Salta, que además cargaban " +
      "con empréstitos y contribuciones forzosas, vieron en esa " +
      "plebe armada una amenaza a su propio poder." +
      "\n\n" +
      "Esa tensión lo enfrentó con todos los mandos, propios y " +
      "extraños. En marzo de 1816, Rondeau lo declaró reo de " +
      "Estado y marchó sobre Salta, y las milicias gauchas " +
      "cercaron al Ejército Auxiliar hasta obligarlo a firmar el " +
      "Pacto de los Cerrillos. Al año siguiente contuvo la " +
      "invasión de La Serna, que se retiró en mayo sin haberlo " +
      "vencido, y esa contención le permitió a San Martín " +
      "sostenerse en Chile; en junio de 1820, desde Rancagua, San " +
      "Martín lo nombró General en Jefe del Ejército de " +
      "Observación sobre el Perú. La soga se cortó del lado de " +
      "casa. En mayo de 1821 el Cabildo de Salta lo depuso y " +
      "recuperó el cargo a los pocos días; el 7 de junio, " +
      "sorprendido por la partida realista de José María Valdés, " +
      "el Barbarucho, recibió una bala mientras se retiraba. " +
      "Agonizó diez días, designó sucesor a Jorge Enrique Vidt y " +
      "murió a los treinta y seis años. Sus gauchos retomaron " +
      "Salta poco después, como él lo había ordenado.",

    imagen: {
      textoAlternativo:
        "Dibujo en carbonilla, en tonos sepia, de Martín Miguel de " +
        "Güemes de medio cuerpo y de tres cuartos: barba y pelo " +
        "oscuros y ondulados, brazos cruzados, casaca militar de " +
        "alamares sobre camisa y poncho claros.",
      credito:
        "Eduardo Schiaffino, «Cartón para el retrato del General Martín " +
        "Miguel de Güemes», lápiz y carbonilla sobre cartón, 1902. " +
        "Güemes no fue retratado en vida: Schiaffino compuso el rostro " +
        "ochenta años después de su muerte, a partir de tres de sus " +
        "nietos y de descripciones de testigos. Museo de Bellas Artes de " +
        "la Provincia de Salta, vía Wikimedia Commons.",
      licencia: "dominio-publico",
    },
  },
};

export default martinMiguelDeGuemes;
