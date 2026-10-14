import type { FichaDe } from "../../src/catalogo/importacion/ficha";

/**
 * Ficha de Julio Argentino Roca (ticket #243), en el registro del ADR 0012.
 *
 * El **tipo** es el directorio (`procer`) y el **slug** es el nombre del
 * archivo (`julio-argentino-roca`). La imagen va en
 * `public/contenido/procer/julio-argentino-roca.webp` y su ruta se deriva:
 * este archivo declara el texto alternativo, el crédito y la licencia, nada
 * más (ADR 0009).
 *
 * La Campaña del Desierto está en la lista de disputas vigentes de
 * `voz-narrativa` §7: la prosa nombra el hecho y sus consecuencias sin
 * eufemismo y no adopta ninguna de las tres lecturas que aprobó el CTO. El
 * orden conservador y la Ley de Residencia se tratan con la regla de
 * neutralidad (los hechos sí, la etiqueta no) mientras el `super-architect`
 * no decida si entran a esa lista.
 *
 * Fuentes consultadas, agrupadas por bloque de hechos. Las verificó el
 * `historiador-specialist` en #243; las web, consultadas el 2026-10-12. Su
 * dossier completo, aprobado por el CTO el 2026-10-12, con el estado de cada
 * hecho y los que no se sostienen, está publicado como comentario en #243.
 * Aportados por el CTO en #243: el `nombreCompleto` elegido entre las
 * variantes del dossier, la elección de la imagen y la aprobación de sus
 * derechos.
 *
 * Datos biográficos (nombre, años y resumen):
 * - Museo Roca, «Biografía política de Julio A. Roca», 2020.
 *   https://museoroca.cultura.gob.ar/noticia/recordamos-el-nacimiento-de-julio-a-roca/
 * - Sergio Miguel Daghero, «Roca en la frontera sur: espacio propicio desde
 *   donde construir poder», XII Jornadas Interescuelas, 2009.
 *   https://www.aacademica.org/000-008/896
 * - Presidencia de la Nación, «182 years after Julio Argentino Roca's
 *   birth…», 2025.
 *   https://www.casarosada.gob.ar/international/latest-news/51029-182-years-after-julio-argentino-roca-s-birth-the-architect-of-modern-argentina
 * - Luciana Sabina, «Los tristes últimos años de Roca», Memo, 2024.
 *   https://www.memo.com.ar/poder/muerte-julio-roca/
 * - Wikipedia, «Julio Argentino Roca» (solo para corroborar).
 *   https://es.wikipedia.org/wiki/Julio_Argentino_Roca
 *
 * Contexto (la frontera sur, la ley de 1867, el plan de Alsina, la élite y
 * sus tierras):
 * - Daghero, 2009 (la misma obra de arriba).
 * - Comisión Científica agregada al Estado Mayor General de la Expedición
 *   al Río Negro, «Informe oficial», 1881/1882.
 *   https://archive.org/details/informeoficialde00arge
 * - Natalio Botana, «El orden conservador», 1977 (referido).
 * - Wikipedia, «Conquista del Desierto» (para corroborar).
 *   https://es.wikipedia.org/wiki/Conquista_del_Desierto
 *
 * Semblanza (trayectoria, medidas de gobierno, rasgos y anécdotas):
 * - Daghero, 2009.
 * - José Ignacio Garmendia, «Recuerdos de la Guerra del Paraguay», vía
 *   Luciana Sabina, «José Ignacio Garmendia, el militar escritor», Los
 *   Andes, 2022.
 *   https://www.losandes.com.ar/opinion/jose-ignacio-garmendia-el-militar-escritor
 * - Carlos María Gorla, «Los primeros años del General Roca», 1973.
 *   https://sedici.unlp.edu.ar/handle/10915/11659
 * - Foreign Relations of the United States, 1875, vol. I, doc. 12.
 *   https://history.state.gov/historicaldocuments/frus1875v01/d12
 * - Sabina, Memo, 2024; Museo Roca, 2020 (las mismas de arriba).
 * - «Anales de la Educación Común» (Ley 1420).
 *   https://cendie.abc.gob.ar/revistas/index.php/revistaanales/
 * - Honorable Cámara de Diputados de la Nación, proyecto 0168-D-2023.
 *   https://www4.hcdn.gob.ar/dependencias/dsecretaria/Periodo2023/PDF2023/TP2023/0168-D-2023.pdf
 * - Britannica, «Roca-Runciman Agreement» (para descartar: el tratado es de
 *   su hijo). https://www.britannica.com/print/article/505855
 *
 * La Campaña del Desierto (tema en disputa, `voz-narrativa` §7):
 * - Hechos y lectura de la conquista o consolidación territorial:
 *   - Comisión Científica, «Informe oficial», 1881/1882 (la misma de arriba).
 *   - Juan José Cresto, «Roca y el mito del genocidio», La Nación, 2004,
 *     referido en «Genocidio en las pampas: crónica de una polémica
 *     abortada», Rebelión.
 *     https://rebelion.org/genocidio-en-las-pampas-cronica-de-una-polemica-abortada/
 *   - Minutouno, «La Casa Rosada reivindicó la Campaña del Desierto», 2025.
 *     https://www.minutouno.com/politica/la-casa-rosada-reivindico-la-campana-del-desierto-n6135336
 *   - Presidencia de la Nación, 2025 (la misma de arriba).
 * - Lectura del genocidio:
 *   - Walter Delrio, Diana Lenton, Marcelo Musante y Mariano Nagy,
 *     «Discussing Indigenous Genocide in Argentina», Genocide Studies and
 *     Prevention 5(2), 2010. https://digitalcommons.usf.edu/gsp/vol5/iss2/3
 *   - Diana Lenton y Mariano Nagy, Memoria Americana 27(2), 2019.
 *     https://www.redalyc.org/articulo.oa?id=379972679001
 *   - Diana Lenton, Corpus, 2017.
 *     https://journals.openedition.org/corpusarchivos/1873
 *   - La Nación, «Piden a la Justicia que reconozca el genocidio sobre los
 *     pueblos indígenas de la Patagonia…», 2022.
 *     https://www.lanacion.com.ar/sociedad/piden-a-la-justicia-que-reconozca-el-genocidio-sobre-los-pueblos-indigenas-de-la-patagonia-durante-nid22082022/
 * - Lectura que discute la categoría dentro de la academia:
 *   - Luis Alberto Romero, «Cómo pensar, hoy, la Conquista del Desierto»,
 *     La Nación, 2018.
 *     https://www.lanacion.com.ar/opinion/como-pensar-hoy-la-conquista-del-desierto-nid2121231
 *   - Lenton y Nagy, 2019 (la misma de arriba).
 *   - Mónica Quijada, Revista de Indias 59(217), 1999.
 * - Vigencia de la disputa:
 *   - Luis Alberto Romero, «Los próceres de Milei», La Nación, 2024.
 *     https://www.lanacion.com.ar/cultura/los-proceres-de-milei-nid13032024/
 *   - Infobae, «Reemplazarán los billetes de 100 de Roca…», 2012.
 *     https://www.infobae.com/2012/07/25/661134-reemplazaran-los-billetes-100-roca-nuevos-la-cara-evita/
 *   - La Nación, «El intendente de Bariloche se enfrentó a manifestantes que
 *     taparon el monumento a Roca», 2024.
 *     https://lanacion.com.ar/politica/el-intendente-de-bariloche-se-enfrento-a-manifestantes-que-taparon-el-monumento-a-roca-nid30122024
 *
 * Imagen (crédito y licencia):
 * - Wikimedia Commons, «File:Roca retrato c1880.jpg», consultada el
 *   2026-10-12. https://commons.wikimedia.org/wiki/File:Roca_retrato_c1880.jpg
 *   Autor desconocido, hacia 1880; origen declarado, el sitio del Museo
 *   Roca. Dominio público por vencimiento del plazo (Ley 11.723, art. 34;
 *   en EE. UU., publicada antes de 1931). Recortada en cuadrado desde el
 *   borde superior y reducida a 800 × 800 px para el encuadre de la ficha.
 */
const julioArgentinoRoca: FichaDe<"procer"> = {
  nombre: "Julio Argentino Roca",
  datos: {
    nombreCompleto: "Alejo Julio Argentino Roca",

    anioDeNacimiento: 1843,
    anioDeMuerte: 1914,

    resumen:
      "Militar y político tucumano. Como ministro de Guerra condujo la " +
      "campaña de 1879 contra los pueblos indígenas de la Pampa y la " +
      "Patagonia, y fue presidente de la Argentina dos veces, entre " +
      "1880 y 1886 y entre 1898 y 1904.",

    contexto:
      "Hacia 1870, el mapa de la República reclamaba un sur que el " +
      "Estado no gobernaba: su autoridad se agotaba en una línea de " +
      "fortines; más allá, la Pampa y la Patagonia respondían a los " +
      "ranqueles, a los salineros de Calfucurá y a los manzaneros de " +
      "Sayhueque. Esa línea se cruzaba en los dos sentidos: malones, " +
      "tratados, raciones negociadas año tras año. El Congreso había " +
      "fijado en 1867, por la Ley 215, el trazo definitivo: los ríos " +
      "Negro y Neuquén. Alsina, ministro de Guerra, proponía llegar de " +
      "a poco, fortín por fortín, con una zanja de unos trescientos " +
      "setenta kilómetros cavada en la llanura. Detrás de la discusión " +
      "militar corría otra más callada: las familias que gobernaban el " +
      "país —el Partido Autonomista Nacional— tenían intereses directos " +
      "en los campos de frontera, y la ley que en octubre de 1878 " +
      "financió la expedición preveía pagarse con las tierras ganadas. " +
      "Alsina murió a fines de 1877 y la cartera de Guerra quedó " +
      "vacante. El trazo pasó a manos del comandante de frontera que ya " +
      "había objetado ese plan por escrito: los fortines fijos, decía, " +
      "«matan la disciplina, diezman las tropas y poco o ningún espacio " +
      "dominan». En 1876 había anunciado en un periódico de Río Cuarto " +
      "cuánto tardaría en borrar esa línea: dos años, uno para " +
      "organizarla y otro para ejecutarla…",

    semblanza:
      "Julio Argentino Roca hizo política como había hecho la guerra: " +
      "resolviendo de antemano lo que otros pensaban improvisar. En " +
      "Santa Rosa, el 6 de diciembre de 1874, contra la revolución " +
      "mitrista, cañoneó de frente para que lo esperaran de frente, " +
      "cruzó de noche el flanco inundado y al alba estaba en la " +
      "retaguardia; Arredondo terminó prisionero. Avellaneda lo " +
      "ascendió a general sobre el campo, a los treinta y uno." +
      "\n\n" +
      "Ministro de Guerra en 1878, convirtió esa impaciencia en " +
      "programa. Lanzó columnas sobre las tolderías de la Pampa " +
      "central: «No hubo una sola de esas columnas de exploración que " +
      "no volviese con una tribu entera prisionera», anotó el informe " +
      "oficial. En abril de 1879 marchó al río Negro con cinco " +
      "divisiones y unos seis mil hombres. La tierra que llamaban " +
      "desierto no estaba vacía. Ese mismo informe hablaba de tierras " +
      "«ocupadas cuando menos por unas 15.000 almas». El cómputo " +
      "oficial pasó de catorce mil entre muertos y prisioneros; hubo " +
      "confinamiento en Martín García, traslados forzados, familias " +
      "separadas, mujeres y niños repartidos como servidumbre, varones " +
      "como mano de obra, leguas vendidas o premiadas en grandes " +
      "extensiones. Cómo se llama eso sigue en disputa: para unos fue " +
      "la conquista que consolidó el territorio; para otros, un " +
      "genocidio; una tercera lectura reconoce la violencia y el " +
      "despojo, pero discute la categoría." +
      "\n\n" +
      "Dos veces presidente, gobernó con el lema «Paz y " +
      "Administración»: bajo sus gobiernos se sancionaron la Ley 1420 " +
      "de educación común, gratuita y laica, y la Ley de Residencia de " +
      "1902, en plena huelga general y con estado de sitio. En julio de " +
      "1913 le escribió a Eduardo Wilde que vivía «sobre las cenizas de " +
      "nuestras cosas muertas». Murió al año siguiente, y la línea que " +
      "había corrido hasta el río Negro quedó en el mapa, tan discutida " +
      "como él.",

    imagen: {
      textoAlternativo:
        "Fotografía en blanco y negro de Julio Argentino Roca hacia 1880, de " +
        "perfil hacia la izquierda, calvo en la frente, con barba larga y " +
        "oscura, cuello blanco alto, moño claro y saco negro.",
      credito: "Autor desconocido, hacia 1880. Museo Roca, vía Wikimedia Commons.",
      licencia: "dominio-publico",
    },
  },
};

export default julioArgentinoRoca;
