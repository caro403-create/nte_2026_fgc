/**
 * Localización del Observatorio (pestaña «Explorar»).
 *
 * El diccionario está indexado POR LA FRASE EN ESPAÑOL, no por claves
 * inventadas. Dos razones:
 *
 *   1. La degradación es segura. Si una frase todavía no está traducida, se
 *      muestra en español en vez de reventar o pintar «dashboard.tab.title».
 *      Eso permite traducir por capas sin dejar la interfaz rota entre medias.
 *   2. El código sigue siendo legible: `t('Municipios más afectados')` dice
 *      qué se va a ver; `t('charts.muns.title')` no.
 *
 * NO se usa traducción automática. El tablero tiene ~4.000 palabras de
 * vocabulario técnico (foco de calor, páramo, Orobioma, piso térmico,
 * ecosistema de síntesis) donde un motor genérico produce errores que cambian
 * el significado del dato. Todo lo de aquí está traducido a mano.
 */

export const DASHBOARD_EN = {
  /* ---------- Barra de producto ---------- */
  'Observatorio de Incendios': 'Wildfire Observatory',
  'Caracterización biofísica de': 'Biophysical profile of',
  'focos de calor': 'thermal hotspots',
  'Fuente:': 'Source:',
  'Último registro:': 'Last record:',
  'registros': 'records',
  'Datos abiertos': 'Open data',
  'Descargar el archivo de investigación y ver cómo se construyó':
    'Download the research file and see how it was built',

  /* ---------- Barra de filtros ---------- */
  'Año': 'Year',
  'clic o arrastra': 'click or drag',
  'captura densa': 'dense capture',
  'captura parcial': 'partial capture',
  'sin captura': 'no capture',
  'Mes': 'Month',
  'clic para sumar · arrastra un rango': 'click to add · drag for a range',
  'intensidad = focos con los filtros actuales': 'intensity = hotspots under current filters',
  'Editar filtros': 'Edit filters',
  'Listo': 'Done',
  'Limpiar': 'Clear',
  'quitar': 'remove',
  'Restablecer filtros': 'Reset filters',
  'No hay registros con la combinación seleccionada': 'No records match this combination',
  'No existen reportes en el archivo del IDEAM para esta combinación de filtros. Quita un filtro con su ✕ o restablece todo.':
    'There are no reports in the IDEAM archive for this combination of filters. Remove one filter with its ✕ or reset everything.',
  'Cargando registros del IDEAM…': 'Loading IDEAM records…',
  'meses': 'months',
  'mes seleccionado': 'month selected',
  'meses seleccionados': 'months selected',
  'deptos': 'depts',
  'filtros más': 'more filters',
  'focos': 'hotspots',
  'Temporada seca: diciembre a marzo': 'Dry season: December to March',
  'Primera temporada seca andina': 'First Andean dry season',
  'Segunda temporada seca andina': 'Second Andean dry season',
  'Las dos temporadas secas andinas juntas': 'Both Andean dry seasons together',

  /* ---------- KPIs ---------- */
  'Focos de incendio': 'Fire hotspots',
  'Ecosistema dominante': 'Dominant ecosystem',
  'Zonas intervenidas': 'Modified land',
  'Alto valor de conservación': 'High conservation value',
  'Pico estacional': 'Seasonal peak',
  'de': 'of',
  'clases': 'classes',
  'De ellos, en': 'Of those, in',
  'páramo': 'páramo',
  'focos registrados': 'hotspots recorded',
  'Son': 'These are',
  'detecciones satelitales': 'satellite detections',
  'no': 'not',
  'incendios': 'wildfires',
  'ni': 'nor',
  'hectáreas': 'hectares',
  'Ninguno con estos filtros. En el archivo completo son':
    'None under these filters. In the full archive there are',
  'de los cuales': 'of which',
  'en páramo': 'in páramo',

  /* ---------- Marcas de alcance ---------- */
  'Con tus filtros': 'Your filters',
  'Todo el archivo': 'Full archive',
  'Solo filtro de depto.': 'Dept. filter only',
  'Estas cifras cambian cuando cambias los filtros de arriba.':
    'These figures change when you change the filters above.',
  'Estas cifras se calculan sobre los 14.985 registros completos y no cambian con los filtros.':
    'These figures are computed over all 14,985 records and do not change with the filters.',
  'Estas cifras ignoran año, mes, ecosistema y clima; solo responden al filtro de departamento.':
    'These figures ignore year, month, ecosystem and climate; they only respond to the department filter.',
  'sigue tus filtros': 'follows your filters',
  'archivo completo': 'full archive',

  /* ---------- Mapa ---------- */
  'Capa:': 'Layer:',
  'Puntos': 'Points',
  'Densidad': 'Density',
  'Coropleta': 'Choropleth',
  'Ecosistemas sensibles': 'Sensitive ecosystems',
  'Conteo': 'Count',
  'Tasa /1.000 km²': 'Rate /1,000 km²',
  'Animación': 'Animation',
  'municipios': 'municipalities',
  'en montaña': 'in mountains',
  'Clic en un punto → filtrar por departamento': 'Click a point → filter by department',
  'Ctrl/⌘ + rueda para hacer zoom': 'Ctrl/⌘ + wheel to zoom',
  'Focos por 1.000 km²': 'Hotspots per 1,000 km²',
  'Focos por departamento': 'Hotspots by department',
  'bajo': 'low',

  /* ---------- Pestañas ---------- */
  'Territorio': 'Territory',
  'Temporal': 'Seasonal',
  'Ecosistemas': 'Ecosystems',
  'Terreno': 'Terrain',
  'Recurrencia': 'Recurrence',
  '¿Dónde arde?': 'Where does it burn?',
  '¿Cuándo arde?': 'When does it burn?',
  '¿Sobre qué arde?': 'What burns?',
  '¿En qué relieve?': 'On what terrain?',
  '¿Dónde se repite?': 'Where does it repeat?',
  'Ranking de departamentos y municipios, y qué tan concentrado está el fuego en unas pocas unidades.':
    'Ranking of departments and municipalities, and how concentrated fire is in a few of them.',
  'Las temporadas secas de cada región natural y cómo se reparte el fuego entre los días de la semana.':
    'The dry seasons of each natural region and how fire spreads across the days of the week.',
  'Perfil ecológico de lo que se quema, grandes biomas y matriz climática de los focos.':
    'Ecological profile of what burns, major biomes and the climate matrix of the hotspots.',
  'Paisaje y formas del terreno donde caen los focos — lo que determina qué tan difícil es llegar a apagarlos.':
    'Landscape and landforms where hotspots fall — what determines how hard they are to reach and put out.',
  'Coordenadas que arden en varios años distintos y el conglomerado recurrente al occidente de Bogotá.':
    'Coordinates that burn across several different years, and the recurrent cluster west of Bogotá.',

  /* ---------- Territorio ---------- */
  'Departamentos': 'Departments',
  'con registros · clic para filtrar': 'with records · click to filter',
  'Municipios más afectados': 'Most affected municipalities',
  'Top 20 del subconjunto filtrado': 'Top 20 of the filtered subset',
  'Orientativo': 'Indicative',
  'Concentración territorial': 'Territorial concentration',
  'Qué tan repartido está el fuego entre unidades territoriales':
    'How evenly fire is spread across territorial units',
  'municipios concentran el': 'municipalities hold',
  'de los focos': 'of the hotspots',
  'Municipios': 'Municipalities',
  'Focos': 'Hotspots',
  'del total está en los': 'of the total is in the',
  '5 departamentos': '5 departments',
  'más afectados': 'most affected',
  'El resto del país': 'The rest of the country',
  '% de municipios, del que más arde al que menos':
    '% of municipalities, from most to least burned',
  'Focos acumulados': 'Cumulative hotspots',
  'Si el fuego se repartiera por igual': 'If fire were spread evenly',
  '80% de los focos': '80% of hotspots',

  /* ---------- Temporal ---------- */
  'Hallazgo': 'Finding',
  'Ene–Mar': 'Jan–Mar',
  'Jul–Sep': 'Jul–Sep',
  'en Ene–Mar + Jul–Sep': 'in Jan–Mar + Jul–Sep',
  'Las dos temporadas no son dos regiones que se turnan':
    'The two seasons are not two regions taking turns',
  'régimen bimodal de lluvias': 'bimodal rainfall regime',
  'Todas las regiones a la vez': 'All regions at once',
  'Casi solo la Andina': 'Almost only the Andean region',
  'Porcentaje de los focos de cada región que cae en ese trimestre.':
    'Share of each region’s hotspots falling in that quarter.',
  'Estacionalidad por región natural': 'Seasonality by natural region',
  '% de los focos de cada región en cada mes · misma escala en los cuatro paneles':
    '% of each region’s hotspots per month · same scale across all four panels',
  'Ene–Mar · primera temporada seca': 'Jan–Mar · first dry season',
  'Jul–Sep · segunda temporada seca': 'Jul–Sep · second dry season',
  'Dos temporadas al año': 'Two seasons a year',
  'Una sola temporada al año': 'A single season a year',
  'pico': 'peak',
  'Temporada': 'Season',
  'Barras': 'Bars',
  'Distribución por día de la semana': 'Distribution by day of the week',
  'Los mismos focos filtrados, repartidos por día':
    'The same filtered hotspots, spread across the days',
  'Promedio Lun–Vie': 'Mon–Fri average',
  'Fin de semana': 'Weekend',
  'Una lectura · el fenómeno': 'One reading · the phenomenon',
  'La otra · el registro': 'The other · the record',

  /* ---------- Ecosistemas ---------- */
  'Perfil ecológico': 'Ecological profile',
  'categorías con registros · clic para filtrar': 'categories with records · click to filter',
  'Sensible': 'Sensitive',
  'Intervenido': 'Modified',
  'Otro natural': 'Other natural',
  'Gran bioma': 'Major biome',
  'Las unidades de primer nivel del IAvH': 'IAvH first-level units',
  'Matriz climática': 'Climate matrix',
  'Piso térmico': 'Thermal floor',
  'régimen de humedad': 'humidity regime',
  'clic en una celda para filtrar': 'click a cell to filter',
  'menos': 'fewer',
  'más focos': 'more hotspots',
  'Total': 'Total',

  /* ---------- Terreno ---------- */
  'Paisaje': 'Landscape',
  'Relieve': 'Landform',
  'La unidad grande del terreno · sostiene el KPI de dificultad operativa':
    'The coarse unit of terrain · underpins the operational-difficulty KPI',
  'El detalle operativo fino · 14 formas más frecuentes':
    'The fine operational detail · 14 most frequent landforms',

  /* ---------- Recurrencia ---------- */
  'Esta pestaña no sigue los filtros de año, mes, ecosistema ni clima.':
    'This tab does not follow the year, month, ecosystem or climate filters.',
  'Archivo completo': 'Full archive',
  'Puntos críticos recurrentes': 'Recurrent hotspots',
  'Orden: años afectados ↓': 'Sorted by: years affected ↓',
  'Coordenadas': 'Coordinates',
  'Municipio': 'Municipality',
  'Departamento': 'Department',
  ', no el fuego. Con este archivo no se puede separar una de otra: haría falta contrastarla con detecciones satelitales puras, que no dependen de turnos.':
    ', not the fire. This archive cannot separate the two: it would need to be checked against pure satellite detections, which do not depend on shifts.',
  'justo al occidente de Bogotá, se concentra un grupo de celdas que arden en años distintos de forma sostenida. No es azar, y es el candidato más claro a intervención preventiva focalizada.':
    'just west of Bogotá, a group of cells burns across different years, consistently. It is not chance, and it is the clearest candidate for targeted preventive work.',

  'Años': 'Years',
  'Años registrados': 'Years on record',
  'coordenadas recurrentes en la caja': 'recurrent coordinates inside the box',
  'focos acumulados en ellas': 'hotspots accumulated in them',
  'de las más recurrentes del país': 'of the country’s most recurrent',

  /* ---------- Pie del tablero ---------- */
  'Antes de citar estas cifras': 'Before you cite these figures',
  'Notas metodológicas': 'Methodological notes',
  'Abrir glosario completo': 'Open full glossary',
  'Descarga y reutilización': 'Download and reuse',
  'Uso libre': 'Free to use',
  'Archivo de investigación': 'Research file',
  'Versión procesada': 'Processed version',
  'Cómo se construyó': 'How it was built',
  'Repositorio': 'Repository',
  'Fuentes que se cruzaron.': 'Sources that were crossed.',
  'Cómo citarlo.': 'How to cite it.',

  /* ---------- Glosario ---------- */
  'Glosario': 'Glossary',
  'términos del archivo del IDEAM y de la clasificación de biomas del IAvH. Las palabras':
    'terms from the IDEAM archive and the IAvH biome classification. The',
  'subrayadas': 'underlined words',
  'dentro de una definición llevan a la suya.': 'inside a definition lead to their own entry.',
  'Buscar un término…': 'Search a term…',
  'Vocabulario del archivo': 'Vocabulary of the archive',
  'Buscar un término, o una palabra dentro de una definición…':
    'Search a term, or a word inside a definition…',
  'Ver también': 'See also',
  'Cerrar glosario': 'Close glossary',
  'Cómo leer esta tarjeta': 'How to read this card',
  'Qué muestra': 'What it shows',
  'Cómo leerlo': 'How to read it',
  'Ojo con esto': 'Watch out',
  'En corto:': 'In short:',
  'Aprendizaje': 'Learning',
  'Experto': 'Expert',
  'Ver recorrido': 'Replay tour',
  'Paso': 'Step',
  'Saltar': 'Skip',
  'Atrás': 'Back',
  'Siguiente': 'Next',
  'Entendido': 'Got it',

  'de las coordenadas más recurrentes del archivo caen en una caja de ~22 × 22 km':
    'of the archive’s most recurrent coordinates fall inside a ~22 × 22 km box',
  'Hallazgo · conglomerado recurrente al occidente de Bogotá':
    'Finding · recurrent cluster west of Bogotá',
  'Sin departamento asignado': 'No department assigned',
  'Guía y Prevención': 'Guidance and prevention',

  'MONTH_INITIALS': 'JFMAMJJASOND',
  'Dic–Mar': 'Dec–Mar',
  'Bimodal': 'Bimodal',
  'reportes': 'reports',
  'con los filtros seleccionados': 'with the selected filters',
  'ocurre en ecosistemas intervenidos (uso agropecuario/antrópico) y el':
    'occurs in modified ecosystems (farming / human use) and',
  'del': 'from',
  'al': 'to',
  'Cada panel muestra qué porcentaje de los focos':
    'Each panel shows what share of the hotspots',
  'cae en cada mes, así que las cuatro curvas suman 100% por separado: comparan la forma de la temporada, no cuánto arde cada región —eso es la n de cada título—. Regiones asignadas por departamento; el archivo del IDEAM no trae columna de región.':
    'falls in each month, so the four curves each add up to 100% on their own: they compare the shape of the season, not how much each region burns — that is the n in each title. Regions are assigned by department; the IDEAM archive has no region column.',
  'Registros históricos de incendios de la UNGRD, detecciones térmicas de NASA FIRMS (MODIS, NOAA-20, Suomi NPP) y la cartografía de ecosistemas del IDEAM / IAvH. El cruce espacial es lo que añade a cada registro su bioma, [[ecosistema-de-sintesis|ecosistema de síntesis]], clima, [[paisaje]], [[relieve]] y suelos.':
    'Historical fire records from UNGRD, thermal detections from NASA FIRMS (MODIS, NOAA-20, Suomi NPP) and the ecosystem cartography of IDEAM / IAvH. The spatial join is what adds to each record its biome, [[ecosistema-de-sintesis|synthesis ecosystem]], climate, [[paisaje|landscape]], [[relieve|landform]] and soils.',

  /* ---------- Filtros de dimensión ---------- */
  'Buscar departamento…': 'Search department…',
  'Ningún departamento coincide.': 'No department matches.',
  'Ecosistema': 'Ecosystem',
  'Clima': 'Climate',
  'Solo ecosistemas sensibles': 'Sensitive ecosystems only',
  'Sensibles (páramo, bosque, humedal, glaciar)': 'Sensitive (páramo, forest, wetland, glacier)',

  /* ---------- Leyendas del mapa ---------- */
  'Tamaño del clúster': 'Cluster size',
  'Tipo de ecosistema sensible': 'Sensitive ecosystem type',
  'Punto en ecosistema sensible': 'Point in a sensitive ecosystem',
  'Densidad de focos': 'Hotspot density',
  '1 – 20 focos': '1 – 20 hotspots',
  '21 – 100 focos': '21 – 100 hotspots',
  'Más de 100 focos': 'More than 100 hotspots',
  'Celda ≈ 0,05° (~5,5 km) · escala de raíz cuadrada': 'Cell ≈ 0.05° (~5.5 km) · square-root scale',
  'Cortes por cuantiles · gris = sin dato · clic en un departamento para filtrar':
    'Quantile breaks · grey = no data · click a department to filter',
  'El clúster toma el color del tipo más sensible que contiene (no el más numeroso); el número es el conteo.':
    'A cluster takes the colour of the most sensitive type it contains (not the most numerous); the number is the count.',

  /* ---------- Hallazgo automático ---------- */
  'Hallazgo automático:': 'Automatic finding:',
  'se concentra en paisaje de montaña, el mayor reto logístico de extinción.':
    'falls on mountain landscape, the biggest logistical challenge for suppression.',

  /* ---------- Prosa de los hallazgos ---------- */
  'El primer pico lo arman todas las regiones a la vez. El segundo es casi solo andino — y coincide con el clima: los Llanos tienen una única temporada seca, mientras la región Andina tiene':
    'The first peak is built by every region at once. The second is almost entirely Andean — and it matches the climate: the Llanos have a single dry season, while the Andean region has a',
  'y, por tanto, dos temporadas secas al año.': 'and therefore two dry seasons a year.',
  'La región Andina aporta el': 'The Andean region contributes',
  'de este pico nacional.': 'of this national peak.',
  'Entre': 'Between',
  'Se define por su caja de coordenadas, no por municipio: los nombres que trae el archivo (Ricaurte, Nilo, Tocaima) quedan a 50–75 km de aquí.':
    'It is defined by its coordinate box, not by municipality: the names the archive carries (Ricaurte, Nilo, Tocaima) sit 50–75 km away.',
  'La recurrencia es, por definición, algo que ocurre': 'Recurrence is, by definition, something that happens',
  'entre': 'across',
  'años: restringirla a uno solo la anularía. Las cifras de abajo salen del archivo completo':
    'years: restricting it to a single one would cancel it out. The figures below come from the full archive',
  '— la tabla sí respeta el filtro de departamento que tienes puesto':
    '— the table does respect the department filter you have set',
  'y otros': 'and others',
  'identificadas en todo el archivo': 'identified across the whole archive',
  'Coordenadas con fuegos en 2 o más años distintos': 'Coordinates with fires in 2 or more different years',
  'identificadas en el archivo': 'identified in the archive',
  'Las': 'The first',
  'primeras de': 'of',

  /* ---------- Lecturas del gráfico semanal ---------- */
  'El fuego no sabe qué día es. Una caída sistemática el fin de semana apunta a que la ignición es':
    'Fire does not know what day it is. A systematic weekend drop suggests ignition is',
  'antrópica': 'human-caused',
  'y sigue el calendario de trabajo agrícola.': 'and follows the farming work calendar.',
  'Si los registros dependen de reportes institucionales, lo que cae el fin de semana puede ser la':
    'If the records depend on institutional reporting, what drops at the weekend may be',
  'capacidad de reporte': 'reporting capacity',
  'no el fuego. Con este archivo no se puede separar una de otra: haría falta contrastarla con detecciones satelitales puras, que no dependen de turnos.':
    'not the fire. This archive cannot separate the two: it would need to be checked against pure satellite detections, which do not depend on shifts.',

  /* ---------- Pies de gráfico ---------- */
  'de esa región': 'of that region',
  'Los cuatro paneles llegan hasta': 'All four panels go up to',
  'así que las alturas sí se pueden comparar.': 'so the heights really are comparable.',
  'registros con clima «S.I.» (sin información) quedan fuera de la matriz.':
    'records with climate “S.I.” (no information) fall outside the matrix.',

  /* ---------- Datos abiertos ---------- */
  'Este tablero se construyó sobre un archivo que armamos nosotros, cruzando registros históricos de incendios con la cartografía de ecosistemas del IDEAM y del IAvH. Lo publicamos con fines abiertos: descárgalo y úsalo para lo que necesites —investigación, docencia, planeación o periodismo—. Si te sirve, cítanos.':
    'This dashboard was built on an archive we assembled ourselves, crossing historical fire records with the ecosystem cartography of IDEAM and IAvH. We publish it openly: download it and use it for whatever you need — research, teaching, planning or journalism. If it helps, please cite us.',
  'Excel con los': 'Excel with all',
  'registros y sus 12 columnas biofísicas. 787 KB.': 'records and their 12 biophysical columns. 787 KB.',
  'El JSON que consume este tablero, ya normalizado y con el índice de recurrencia.':
    'The JSON this dashboard consumes, already normalised and with the recurrence index.',
  'Repositorio con el cuaderno de procesamiento geoespacial: validación de coordenadas, reproyección a MAGNA-SIRGAS y cruce espacial con los polígonos de ecosistemas.':
    'Repository with the geospatial processing notebook: coordinate validation, reprojection to MAGNA-SIRGAS and spatial join with the ecosystem polygons.',
  'advertencias que cambian lo que significan los números de arriba. Ninguna es un detalle menor: la primera separa «foco de calor» de «incendio», y la cuarta explica por qué comparar años entre sí puede llevar a conclusiones falsas.':
    'warnings that change what the numbers above mean. None is a minor detail: the first separates “thermal hotspot” from “wildfire”, and the fourth explains why comparing years against each other can lead to false conclusions.',
  '«Observatorio de Incendios IDEAM — Team Colombia (FGC 2026). Archivo derivado de UNGRD, NASA FIRMS e IDEAM/IAvH.» Los datos de origen son públicos y de sus respectivas entidades; lo que aquí se publica es el cruce y la normalización.':
    '“IDEAM Wildfire Observatory — Team Colombia (FGC 2026). Archive derived from UNGRD, NASA FIRMS and IDEAM/IAvH.” The source data is public and belongs to its respective institutions; what is published here is the join and the normalisation.'
};

/**
 * Valores que vienen del propio archivo y se pintan como etiquetas: ejes de la
 * matriz climática, categorías de ecosistema, formas del paisaje. Sin esto los
 * gráficos quedan con los rótulos en español aunque el resto esté traducido.
 */
export const VALUE_EN = {
  /* Pisos térmicos */
  'Calido': 'Warm', 'Cálido': 'Warm',
  'Templado': 'Temperate',
  'Frio': 'Cold', 'Frío': 'Cold',
  'Muy frio': 'Very cold', 'Muy frío': 'Very cold',
  'Extremadamente frio': 'Extremely cold', 'Extremadamente frío': 'Extremely cold',
  'Nival': 'Snowline',
  /* Regímenes de humedad */
  'Arido': 'Arid', 'Árido': 'Arid',
  'Semiarido': 'Semi-arid', 'Semiárido': 'Semi-arid',
  'Semihumedo': 'Semi-humid', 'Semihúmedo': 'Semi-humid',
  'Humedo': 'Humid', 'Húmedo': 'Humid',
  'Superhumedo': 'Super-humid', 'Superhúmedo': 'Super-humid',
  /* Ecosistemas de síntesis */
  'Agroecosistema': 'Agroecosystem',
  'Bosque': 'Forest',
  'Bosque Fragmentado': 'Fragmented forest',
  'Transicional Transformado': 'Transformed transitional',
  'Territorio Artificializado': 'Built-up land',
  'Vegetación Secundaria': 'Secondary vegetation',
  'Vegetacion Secundaria': 'Secondary vegetation',
  'Arbustal': 'Shrubland',
  'Herbazal': 'Grassland',
  'Sabana': 'Savanna',
  'Río': 'River', 'Rio': 'River',
  'Laguna': 'Lagoon',
  'Zona Pantanosa': 'Marshland',
  'Subxerofitia': 'Sub-xerophytic',
  'Xerofitia': 'Xerophytic',
  'Cuerpo de Agua Artificial': 'Artificial water body',
  'Paramo': 'Páramo', 'Páramo': 'Páramo',
  'Glaciares y Nivales': 'Glaciers and snowfields',
  'Glaciar': 'Glacier',
  'Humedal': 'Wetland',
  /* Paisaje y relieve */
  'Montaña': 'Mountain', 'Montana': 'Mountain',
  'Lomerío': 'Hills', 'Lomerio': 'Hills',
  'Altiplanicie': 'High plateau',
  'Planicie': 'Plain',
  'Peniplanicie': 'Peneplain',
  'Valle': 'Valley',
  'Eólica': 'Aeolian', 'Eolica': 'Aeolian',
  'Cañones': 'Canyons', 'Canones': 'Canyons',
  'Misceláneo': 'Miscellaneous', 'Miscelaneo': 'Miscellaneous',
  'Vegetación': 'Vegetation', 'Vegetacion': 'Vegetation',
  /* Genéricos */
  'Misceláneo Erosionado': 'Eroded miscellaneous',
  'Misceláneo Rocoso': 'Rocky miscellaneous',
  'Planicie Eólica': 'Aeolian plain',
  'Planicie Aluvial con Influencia Eólica': 'Alluvial plain with aeolian influence',
  'Plano de inundación': 'Floodplain',
  'Sin información': 'No information', 'Sin informacion': 'No information',
  'Sin departamento asignado': 'No department assigned',
  'Otras': 'Other'
};

/** Traduce un valor del archivo. En español devuelve lo que reciba. */
export function makeV(lang) {
  if (lang !== 'en') return (s) => s;
  return (s) => (typeof s === 'string' ? (VALUE_EN[s] ?? s) : s);
}

/** Meses: la tira de filtros y los ejes de los gráficos. */
export const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_FULL_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
export const WEEKDAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** Regiones naturales: nombres propios, pero la Amazonía/Orinoquía sí cambian. */
export const REGION_EN = {
  'Andina': 'Andean',
  'Orinoquía': 'Orinoco',
  'Caribe': 'Caribbean',
  'Amazonía': 'Amazon',
  'Otras': 'Other'
};

/**
 * Devuelve el traductor del tablero. En español es la identidad, así que no
 * hay ni una búsqueda de más cuando el idioma es el original.
 */
export function makeT(lang) {
  if (lang !== 'en') return (s) => s;
  return (s) => (typeof s === 'string' ? (DASHBOARD_EN[s] ?? s) : s);
}

/**
 * Las ocho notas metodológicas, en inglés. Se conservan las marcas [[id|texto]]
 * porque son enlaces al glosario: el id no se traduce, solo la etiqueta.
 */
export const METHOD_NOTES_EN = [
  {
    title: 'A thermal hotspot is not a wildfire.',
    body: 'A [[foco-de-calor|thermal hotspot]] is a pixel the satellite saw hotter than a threshold. A [[incendio|vegetation fire]] is the real event, with a duration and a surface. One fire can generate dozens of hotspots, and many hotspots correspond to no fire at all but to agricultural burning.'
  },
  {
    title: 'Unit of analysis.',
    body: 'Every count is [[unidad-de-analisis|reporting frequency]], not area affected: the IDEAM archive carries no burned-area column.'
  },
  {
    title: 'Spatial resolution.',
    body: 'Coordinates come rounded to ~0.005° (the satellite grid). Each point is a [[celda|cell of about 500 m]], not a property.'
  },
  {
    title: 'Uneven temporal coverage.',
    body: '[[cobertura-temporal|Capture is not homogeneous]]: 2012–2017, 2019 and 2025 are dense years; 2010, 2018 and 2020–2024 have gaps, and 2011 has no records at all. Comparing years without accounting for this leads to false conclusions about trend.'
  },
  {
    title: 'Natural regions.',
    body: 'The archive has no [[region-natural|region]] column; regions are assigned by department. “Other” groups the Pacific (Chocó) and the records with no department assigned.'
  },
  {
    title: 'Modified land.',
    body: '[[zonas-intervenidas|Modified land]] is derived from the [[ecosistema-de-sintesis|synthesis ecosystem]]: [[agroecosistema|agroecosystem]], [[vegetacion-secundaria|secondary vegetation]], built-up land and transformed transitional.'
  },
  {
    title: 'Sensitive ecosystems.',
    body: 'The [[ecosistemas-sensibles|sensitive ecosystems]] category — [[paramo|páramo]], forest, wetland and glacier — is an operational definition of this dashboard, not an official IAvH category.'
  },
  {
    title: 'Accents.',
    body: 'The archive stores values without accents (“Calido”, “Paramo”). The dashboard shows them correctly spelled through a display-name dictionary; municipalities are only normalised to title case, for lack of an official accented list.'
  }
];
