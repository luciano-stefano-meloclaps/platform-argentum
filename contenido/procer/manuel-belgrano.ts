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
 * Fuentes consultadas, agrupadas por bloque de hechos. Las verificó el
 * `historiador-specialist` en #177; las web, consultadas el 2026-10-11. Su
 * dossier completo, con el estado de cada hecho y los que no se sostienen,
 * está publicado como comentario en #177. Ningún hecho de esta ficha fue
 * aportado por escrito por el CTO.
 *
 * Datos biográficos (nombre, años, resumen y semblanza):
 * - Bartolomé Mitre, «Historia de Belgrano y de la independencia argentina»,
 *   t. IV, 6.ª ed., 1913 (1.ª ed. completa, 1887).
 *   https://archive.org/details/mitre_historiadebelgranoydelaindependenciaargentina_v_4_1913
 * - Manuel Belgrano, bando del 29 de julio de 1812, Cuartel General de Jujuy
 *   (fuente primaria), en Joaquín Carrillo, «Jujuy. Apuntes de su historia
 *   civil», 1877. https://backend.educ.ar/refactor_resource/get-attachment/24240
 * - Ejército Argentino, «20 de Junio - Paso a la inmortalidad del general
 *   Manuel Belgrano», 2019. https://www.argentina.gob.ar/node/155743
 * - Honorable Cámara de Diputados de la Nación, proyecto de resolución
 *   2563-D-2020, fundamentos.
 *   https://www4.hcdn.gob.ar/dependencias/dsecretaria/Periodo2020/PDF2020/TP2020/2563-D-2020.pdf
 * - Patricia Fernández Mainardi, «Día de la Bandera: los relatos poco
 *   conocidos sobre Manuel Belgrano…», DEF, 2026.
 *   https://defonline.com.ar/defensa/dia-de-la-bandera-los-relatos-poco-conocidos-sobre-manuel-belgrano-que-cambian-su-historia/
 * - Wikipedia, «Manuel Belgrano» (solo para corroborar).
 *   https://en.wikipedia.org/wiki/Manuel_Belgrano
 * - Wikipedia, «Primera Junta». https://es.wikipedia.org/wiki/Primera_Junta
 * - Roberto Bottarini, «La escuela y el premio. El programa ilustrado de
 *   Manuel Belgrano: Medios generales de fomentar la agricultura… (1796)»,
 *   Historia de la Educación, n.º 29, 2010 (reproduce la memoria de 1796).
 *   https://revistas.usal.es/tres/index.php/0212-0267/article/download/8170/14947/50720
 *   (consultada el 2026-10-12, en #176).
 * - Instituto Nacional Belgraniano, «Cronología biográfica de Manuel
 *   Belgrano», Anales de la Educación Común, vol. 1, n.º 1-2, 2020.
 *   https://cendie.abc.gob.ar/revistas/index.php/revistaanales/article/download/12/552/295
 *   (consultada el 2026-10-12, en #176).
 *
 * Contexto de época (comercio, aduana, Virreinato e Ilustración):
 * - Óscar Cruz Barney, «A 230 años del Reglamento y Aranceles Reales para el
 *   Comercio Libre de España y las Indias del 12 de octubre de 1778», 2008.
 *   https://revistas-colaboracion.juridicas.unam.mx/index.php/juridica/article/download/11693/10697
 * - Herbert S. Klein y John J. TePaske, «The Royal Treasuries of the Spanish
 *   Empire in America», vol. 3, «Chile and the Río de la Plata», 1982.
 *   https://realhacienda.colmex.mx/introduccion-the-royal-treasuries-of-the-spanish-empire-in-america-chile-y-rio-de-la-plata/
 * - Antonio Facundo Galarza, «Centralización de recursos fiscales bajo el
 *   reformismo borbónico…», Avances del Cesor, 2024.
 *   https://portal.amelica.org/ameli/journal/27/274944010/
 * - Antonio Galarza, «Fiscal Transfers between Buenos Aires and the
 *   Viceregal Interior at the End of the Colonial Period…», Latin American
 *   Research Review, 2024.
 *   https://www.cambridge.org/core/journals/latin-american-research-review/article/fiscal-transfers-between-buenos-aires-and-the-viceregal-interior-at-the-end-of-the-colonial-period-fall-of-the-situado-and-the-relation-with-the-regional-royal-treasuries-18001810/C24FC00E0BC988CE39EADA8633183FF1
 * - Carlos Solans y Jorge Monetta, «Síntesis histórica. Historia de la
 *   Aduana Argentina», 2014.
 *   https://www.historiadelaaduana.com.ar/sintesis_historica_.htm
 * - Rosendo Fraga, «La creación del Virreinato del Río de la Plata, germen
 *   de la Argentina actual», La Nación, 2026.
 *   https://www.lanacion.com.ar/ideas/la-creacion-del-virreinato-del-rio-de-la-plata-germen-de-la-argentina-actual-nid01082026/
 * - Diego Valenzuela, «Belgrano y la autorización papal para leer libros
 *   prohibidos», Infobae, 2026.
 *   https://www.infobae.com/opinion/2026/06/22/belgrano-y-la-autorizacion-papal-para-leer-libros-prohibidos/
 *
 * Anécdota del reloj:
 * - Bartolomé Mitre, «Historia de Belgrano…», t. IV, 1913, cap. XLIV (la
 *   misma obra de arriba).
 * - Wikipedia, «Reloj de Manuel Belgrano».
 *   https://es.wikipedia.org/wiki/Reloj_de_Manuel_Belgrano
 * - Infobae, «El sorprendente robo del reloj de Manuel Belgrano…», 2019.
 *   https://www.infobae.com/sociedad/2019/06/20/el-sorprendente-robo-del-reloj-de-manuel-belgrano-la-unica-pertenencia-de-valor-que-tuvo-el-procer-al-morir/
 * - El Heraldo, «Los últimos días de Manuel Belgrano…», 2021.
 *   https://elheraldo.com.ar/noticias/interes-general/los-ultimos-dias-de-manuel-belgrano-sus-enfermedades-la-ingratitud-y-una-muerte-en-soledad
 *
 * El año 20 (tema en disputa, `voz-narrativa`):
 * - Bartolomé Mitre, «Historia de Belgrano…», t. IV, 1913, caps. XLI a XLV
 *   (lectura liberal).
 * - Julián Otal Landi, «El hito de los comuneros y la anarquía del año 20…»,
 *   2024 (lectura revisionista).
 *   https://institutorosas.cultura.gob.ar/media/uploads/site-35/multimedia/el_hito_de_los_comuneros_y_la_anarquia_del_ano_20.pdf
 * - María Silvia Di Liscia, reseña de Noemí Goldman y Ricardo Salvatore
 *   (comps.), «Caudillismos rioplatenses», Quinto Sol, 1999.
 *   https://ojs.unlpam.edu.ar/ojs/index.php/quintosol/article/download/644/579
 * - Rosendo Fraga, «La anarquía del año 20 y los ecos del presente», La
 *   Nación, 2020.
 *   https://www.lanacion.com.ar/opinion/la-anarquia-del-ano-20-y-los-ecos-del-presente-nid2460084/
 *
 * Imagen (crédito y licencia):
 * - Nanzi Sobrero de Vallejos, «Iconografía del general Belgrano», El
 *   Litoral. https://www.ellitoral.com/opinion/iconografia-general-belgrano_0_xM7coacLK7.html
 * - Wikimedia Commons, «File:Manuel Belgrano.JPG».
 *   https://commons.wikimedia.org/wiki/File:Manuel_Belgrano.JPG
 * - Virginia Mejía, «La grieta también es artística…», La Nación, 2020.
 *   https://www.lanacion.com.ar/sociedad/la-grieta-tambien-es-artistica-que-cuadros-nid2334518/
 */
const manuelBelgrano: FichaDe<"procer"> = {
  nombre: "Manuel Belgrano",
  datos: {
    nombreCompleto: "Manuel José Joaquín del Corazón de Jesús Belgrano",

    anioDeNacimiento: 1770,
    anioDeMuerte: 1820,

    resumen:
      "Abogado, economista y militar porteño. Creó la bandera celeste y blanca " +
      "en 1812 y donó para fundar cuatro escuelas los 40.000 pesos con que la " +
      "Asamblea del Año XIII premió sus victorias de Tucumán y Salta.",

    contexto:
      "Durante buena parte del siglo XVIII, el imperio español trató a " +
      "sus colonias americanas como una hacienda cercada: toda su " +
      "cosecha debía salir por un único portón, el puerto de Cádiz. " +
      "Buenos Aires era un campo distante y desatendido, forzado al " +
      "contrabando con el Brasil portugués para no quedar yermo. La " +
      "cerca empezó a ceder en 1778, cuando la Corona, ávida de rentas " +
      "y resuelta a cerrar el portillo del contrabando, extendió el " +
      "comercio libre hasta el Río de la Plata y dispuso en ese campo " +
      "una aduana propia. Fue como abrir un segundo portón: por él " +
      "entró una riqueza nueva, aunque el Virreinato recién fundado " +
      "—el último y más tardío que España sembraría en América— " +
      "seguía regándose con la plata de Potosí. Buenos Aires, elevada " +
      "de pronto a cabecera, empezó a dar frutos que ya no cabían en " +
      "los graneros antiguos. Y por el mismo portón que dejaba pasar " +
      "mercancías se colaban, escondidas entre fardos, semillas que " +
      "ningún reglamento sabía identificar a tiempo: libros " +
      "prohibidos, una Ilustración entera que la censura española no " +
      "lograba desenterrar antes de que germinara. Faltaba una mano " +
      "dispuesta a convertir ese suelo removido en cultivo metódico: " +
      "un joven porteño, hijo de un comerciante ligur, que cruzaría el " +
      "océano a estudiar leyes y volvería con semillas más duraderas " +
      "que cualquier mercancía…",

    semblanza:
      "Manuel Belgrano no fue un militar que aprendió a gobernar: fue un " +
      "sembrador obligado, contra su naturaleza y su fortuna, a defender " +
      "el surco con la espada. Volvió de España convencido de que ningún " +
      "país se funda por decreto sino por siembra paciente —escuelas, " +
      "oficios, números—, y esa convicción, tan poco marcial, gobernó " +
      "hasta el último de sus actos. Desde el Consulado porteño impulsó " +
      "escuelas de comercio, de náutica y de dibujo, y en una memoria " +
      "propuso otras, gratuitas, donde las niñas aprendieran a leer " +
      "y a escribir. La Revolución de Mayo lo " +
      "encontró en la Primera Junta y lo empujó al frente de un ejército " +
      "improvisado y hambriento. No era soldado de carrera: él mismo se " +
      "confesaba «avergonzado de ignorar hasta los rudimentos más " +
      "triviales de la milicia». En febrero de 1812, a orillas del " +
      "Paraná, en Rosario, izó por primera vez una bandera celeste y " +
      "blanca. Meses después dictó el bando del Éxodo Jujeño, que " +
      "ordenaba a un pueblo entero retirarse, condenaba al fuego lo que " +
      "no pudiera llevarse y amenazaba con fusilar sin proceso a quien " +
      "atentara contra la causa. «Se acabaron las consideraciones», " +
      "remataba. Ganó Tucumán, ganó Salta, y sin embargo murió en 1820, " +
      "pobre y enfermo, en la misma casa donde había nacido, un día en " +
      "que Buenos Aires contaba tres gobernadores a la vez. Cuentan que, " +
      "la víspera de su muerte, puso en manos de su médico el reloj de " +
      "oro que colgaba de la cabecera: el hombre que había sembrado " +
      "escuelas, banderas y ejércitos no tenía más que ese puñado de " +
      "horas para entregar. No dejó fortuna: dejó una cosecha que otros, " +
      "con el tiempo que a él ya no le alcanzó, iban a recoger.",

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
