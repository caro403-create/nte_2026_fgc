/**
 * Capa pedagógica del Observatorio — contenido.
 *
 * Dos cuerpos de texto, ambos datos puros (sin JSX) para que se puedan revisar,
 * traducir o corregir sin tocar componentes:
 *
 *   GLOSSARY    — vocabulario del archivo del IDEAM / IAvH.
 *   CARD_GUIDES — la explicación de cada tarjeta, siempre con la misma
 *                 estructura de tres partes: qué muestra, cómo leerlo, ojo con
 *                 esto. La repetición es lo que enseña a leer el tablero.
 *
 * En cualquier texto se puede enlazar al glosario con [[id|texto visible]] o
 * simplemente [[id]]. Lo resuelve <RichText> en LearningLayer.jsx.
 */

export const GLOSSARY_CATEGORIES = [
  { id: 'medicion', label: 'Qué se está midiendo' },
  { id: 'biomas', label: 'Biomas y ecosistemas (IAvH)' },
  { id: 'clima', label: 'Clima' },
  { id: 'terreno', label: 'Paisaje y relieve' },
  { id: 'metodo', label: 'Método del tablero' }
];

export const GLOSSARY = [
  /* ---------------- Qué se está midiendo ---------------- */
  {
    id: 'foco-de-calor',
    term: 'Foco de calor',
    category: 'medicion',
    short: 'Un píxel que el satélite vio más caliente que un umbral. Es una detección, no un incendio confirmado.',
    long: `Los sensores satelitales detectan energía infrarroja y marcan como "foco" cada píxel cuya temperatura supera un umbral. Eso es todo lo que garantiza el dato: que hubo calor anómalo en ese píxel, en ese paso del satélite.

No garantiza que hubiera un incendio. Una quema agrícola controlada, un horno, la quema de caña o la antorcha de un pozo de gas producen focos. Tampoco garantiza que se haya detectado todo lo que ardió: si el satélite pasó de noche, con nubes, o si el fuego fue pequeño y de poca duración, no queda registro.`,
    see: ['incendio', 'unidad-de-analisis']
  },
  {
    id: 'incendio',
    term: 'Incendio de la cobertura vegetal',
    category: 'medicion',
    short: 'El evento real de fuego, con duración y superficie afectada. No es lo mismo que un foco de calor.',
    long: `Un incendio de la cobertura vegetal es un evento: empieza, dura, avanza sobre un área y se extingue. Se mide en hectáreas y en tiempo.

La relación con los [[foco-de-calor|focos de calor]] no es de uno a uno en ninguna dirección. Un incendio grande y prolongado puede generar decenas de focos en varios pasos del satélite; y muchos focos no corresponden a ningún incendio, sino a quemas intencionales de manejo agrícola.

Por eso este tablero nunca dice "incendios": dice focos, reportes o detecciones.`,
    see: ['foco-de-calor', 'unidad-de-analisis']
  },
  {
    id: 'unidad-de-analisis',
    term: 'Frecuencia de reporte, no hectáreas',
    category: 'medicion',
    short: 'Todos los conteos del tablero son "cuántas veces se reportó fuego", nunca superficie quemada.',
    long: `El archivo del IDEAM que alimenta este tablero no trae área afectada. Ninguna columna dice hectáreas.

La consecuencia práctica es que duplicar el número de focos no significa duplicar el daño. Una quema de media hectárea en un potrero produce un foco igual que un incendio forestal de quinientas hectáreas. Un municipio puede encabezar el ranking por acumular muchas quemas pequeñas y repetidas.

Cuando compares dos cifras de este tablero, la pregunta correcta es "¿cuántas veces se reportó fuego aquí?", no "¿cuánto se quemó aquí?".`,
    see: ['foco-de-calor', 'celda']
  },

  /* ---------------- Biomas y ecosistemas ---------------- */
  {
    id: 'zonobioma',
    term: 'Zonobioma',
    category: 'biomas',
    short: 'Conjunto de ecosistemas cuya distribución la manda el clima de la franja latitudinal donde están.',
    long: `En la clasificación de biomas del IAvH, un zonobioma agrupa ecosistemas definidos por el clima zonal: la temperatura y la lluvia que corresponden a esa latitud, al nivel del mar.

En este archivo el más frecuente es el Zonobioma Húmedo Tropical, las tierras bajas cálidas y lluviosas. Es el punto de partida de la clasificación: los demás tipos —[[orobioma]], [[pedobioma]], [[helobioma]]— nombran las excepciones a ese patrón.`,
    see: ['orobioma', 'pedobioma', 'helobioma', 'alternohigrico']
  },
  {
    id: 'orobioma',
    term: 'Orobioma',
    category: 'biomas',
    short: 'Bioma cuya distribución la manda la altitud, no la latitud: el gradiente de montaña.',
    long: `Al subir una montaña el clima cambia como si uno se moviera hacia los polos: baja la temperatura y cambia la vegetación. Un orobioma es el bioma que resulta de ese gradiente altitudinal.

En los Andes colombianos la secuencia va del bosque subandino al andino, luego al altoandino y finalmente al [[paramo|páramo]] y a las nieves. Cuando el archivo dice "Orobioma del Zonobioma Húmedo Tropical" está diciendo: esta es la versión de montaña del bioma húmedo tropical.`,
    see: ['zonobioma', 'paramo', 'piso-termico']
  },
  {
    id: 'pedobioma',
    term: 'Pedobioma',
    category: 'biomas',
    short: 'Bioma definido por el suelo —drenaje, salinidad, textura— y no por el clima general.',
    long: `Hay sitios donde el suelo manda más que el clima. Un arenal, un suelo salino o un terreno permanentemente encharcado sostienen una vegetación que no corresponde a la que predice el clima de esa zona.

El IAvH llama pedobiomas a esas unidades. Por eso aparecen etiquetas como "Pedobioma del Zonobioma Húmedo Tropical": el clima es el húmedo tropical, pero lo que define el ecosistema es el suelo.`,
    see: ['zonobioma', 'helobioma', 'azonal']
  },
  {
    id: 'helobioma',
    term: 'Helobioma',
    category: 'biomas',
    short: 'Pedobioma de zonas inundables: humedales, sabanas que se inundan, planos de desborde de ríos.',
    long: `Un helobioma es un [[pedobioma]] cuyo rasgo determinante es el exceso de agua: terrenos que se inundan de forma estacional o permanente.

En este archivo aparecen sobre todo en la Orinoquía y en los valles bajos del Magdalena y el Cauca — las sabanas inundables donde la quema estacional de pastos es una práctica de manejo muy extendida.`,
    see: ['pedobioma', 'zona-pantanosa']
  },
  {
    id: 'alternohigrico',
    term: 'Zonobioma alternohígrico',
    category: 'biomas',
    short: 'Zonobioma con una estación seca marcada que alterna con una húmeda. Bosque seco y sabanas.',
    long: `"Alternohígrico" quiere decir que la humedad alterna: hay una temporada seca definida y otra lluviosa, en lugar de lluvia repartida todo el año.

Corresponde al bosque seco tropical y a las sabanas del Caribe y la Orinoquía. Es el bioma más asociado al fuego estacional del país: la vegetación se seca de forma predecible cada año y queda disponible para arder.`,
    see: ['zonobioma', 'subxerofitia']
  },
  {
    id: 'azonal',
    term: 'Azonal',
    category: 'biomas',
    short: 'Unidad que se aparta del patrón climático de su zona por condiciones locales de roca, suelo o agua.',
    long: `Cuando el archivo dice "Orobioma Azonal", señala una unidad de montaña que no sigue el patrón esperado para su altitud y latitud, porque algo local —el sustrato rocoso, un régimen de vientos, la sombra de lluvia de una cordillera— impone otras condiciones.

Los enclaves secos interandinos, como el cañón del Chicamocha o la Tatacoa, son el ejemplo clásico.`,
    see: ['zonobioma', 'orobioma', 'xerofitia']
  },
  {
    id: 'ecosistema-de-sintesis',
    term: 'Ecosistema de síntesis',
    category: 'biomas',
    short: 'Nivel resumido del mapa de ecosistemas del IAvH: agrupa cientos de unidades en pocas clases comparables.',
    long: `El mapa de ecosistemas del IAvH tiene un nivel de detalle enorme, con cientos de unidades cuyo nombre incluye bioma, región y cobertura. Trabajar con eso directamente es inmanejable.

El "ecosistema de síntesis" es la agregación a un puñado de clases comparables: bosque, sabana, herbazal, arbustal, páramo, agroecosistema, vegetación secundaria, y unas pocas más. Es la columna que usa este tablero para el perfil ecológico y para el filtro de ecosistema.

La ventaja es la comparabilidad; el costo es que se pierde el detalle regional.`,
    see: ['agroecosistema', 'vegetacion-secundaria']
  },
  {
    id: 'agroecosistema',
    term: 'Agroecosistema',
    category: 'biomas',
    short: 'Territorio ya dedicado a actividad agropecuaria. Es cobertura transformada, no vegetación natural.',
    long: `Cultivos, pastos para ganadería, mosaicos de parcelas. Un agroecosistema no es un ecosistema natural degradado: es tierra en uso productivo.

Es la clase más frecuente de este archivo por un margen enorme, y esa es la señal más importante del tablero: la mayor parte del fuego registrado en Colombia ocurre sobre terreno que ya estaba intervenido, en su mayoría por quemas de manejo agrícola.

Que sea intencional no lo vuelve inocuo. Las quemas de manejo son la principal fuente de ignición que después se escapa hacia vegetación natural.`,
    see: ['ecosistema-de-sintesis', 'vegetacion-secundaria', 'zonas-intervenidas']
  },
  {
    id: 'vegetacion-secundaria',
    term: 'Vegetación secundaria',
    category: 'biomas',
    short: 'La que crece después de que se eliminó la vegetación original. Señal de un ciclo de intervención.',
    long: `Cuando se tumba un bosque y luego se abandona el terreno, la vegetación vuelve, pero no vuelve la misma: crece un matorral o un bosque joven de composición distinta.

En el contexto de incendios importa porque suele indicar un ciclo: se quema, se abandona, rebrota, se vuelve a quemar. Una zona clasificada como vegetación secundaria que además aparece en la tabla de recurrentes es exactamente ese patrón.`,
    see: ['agroecosistema', 'recurrencia']
  },
  {
    id: 'paramo',
    term: 'Páramo',
    category: 'biomas',
    short: 'Ecosistema de alta montaña tropical por encima del bosque altoandino. Regula el agua del país.',
    long: `El páramo se extiende por encima del límite del bosque altoandino, aproximadamente desde los 3.000–3.200 m. Colombia concentra cerca de la mitad de los páramos del mundo.

Su suelo, de materia orgánica muy porosa, retiene y libera agua de forma constante: buena parte del agua potable de las ciudades andinas nace ahí.

Es un ecosistema que no está adaptado al fuego. Los frailejones y el suelo orgánico tardan décadas en recuperarse, y la capacidad de retención hídrica se pierde durante ese tiempo. Por eso un foco en páramo no es equivalente a un foco en un potrero, aunque en el gráfico ocupen la misma unidad.`,
    see: ['orobioma', 'ecosistemas-sensibles', 'piso-termico']
  },
  {
    id: 'subxerofitia',
    term: 'Subxerofitia',
    category: 'biomas',
    short: 'Vegetación de zonas secas pero no desérticas, con déficit de agua estacional. Arbustiva y espinosa.',
    long: `Vegetación adaptada a la escasez de agua durante parte del año: hojas pequeñas o ausentes, espinas, porte arbustivo. Está a medio camino entre el bosque seco y la [[xerofitia]] plena.

En Colombia aparece en los enclaves secos interandinos y en zonas del Caribe. Arde con facilidad en temporada seca, y su recuperación es lenta porque el agua limita el rebrote.`,
    see: ['xerofitia', 'alternohigrico']
  },
  {
    id: 'xerofitia',
    term: 'Xerofitia',
    category: 'biomas',
    short: 'Vegetación de zonas áridas, con déficit hídrico durante casi todo el año.',
    long: `El extremo seco del gradiente: cardonales, cactáceas, vegetación rala sobre suelo desnudo. En Colombia corresponde sobre todo a La Guajira y a los enclaves más áridos del valle del Magdalena.`,
    see: ['subxerofitia', 'azonal']
  },
  {
    id: 'zona-pantanosa',
    term: 'Zona pantanosa',
    category: 'biomas',
    short: 'Terreno con agua estancada o encharcamiento prolongado y vegetación adaptada a esa condición.',
    long: `Humedales interiores: ciénagas, madreviejas, planos de inundación con vegetación acuática y semiacuática.

Cuentan como [[ecosistemas-sensibles|ecosistema sensible]] en este tablero porque su quema —habitualmente para ganar terreno de pastoreo en verano— destruye la función de amortiguación de crecientes y el hábitat de fauna acuática.`,
    see: ['helobioma', 'ecosistemas-sensibles']
  },
  {
    id: 'ecosistemas-sensibles',
    term: 'Ecosistemas sensibles',
    category: 'biomas',
    short: 'En este tablero: páramo, bosque, humedal y glaciar. Alto valor de conservación y mala recuperación tras el fuego.',
    long: `El tablero marca en púrpura, y agrupa bajo el atajo "solo sensibles", cuatro tipos: [[paramo|páramo]], bosque (incluido el fragmentado), humedal o [[zona-pantanosa|zona pantanosa]], y glaciares y nivales.

El criterio es doble: alto valor de conservación y baja capacidad de recuperación después del fuego. Ninguno de los cuatro está adaptado a arder de forma recurrente, a diferencia de la sabana o el herbazal, que sí tienen historia evolutiva con el fuego.

Es una definición operativa de este tablero, no una categoría oficial del IAvH.`,
    see: ['paramo', 'zona-pantanosa']
  },
  {
    id: 'zonas-intervenidas',
    term: 'Zonas intervenidas',
    category: 'biomas',
    short: 'Coberturas ya transformadas por el hombre: agroecosistema, vegetación secundaria, territorio artificializado y transicional transformado.',
    long: `El tablero deriva este indicador del ecosistema de síntesis, agrupando cuatro clases: [[agroecosistema]], [[vegetacion-secundaria|vegetación secundaria]], territorio artificializado (áreas urbanas e infraestructura) y transicional transformado.

No es una columna del archivo original: es una categoría construida aquí, y por eso queda declarada en las notas metodológicas.`,
    see: ['agroecosistema', 'vegetacion-secundaria']
  },

  /* ---------------- Clima ---------------- */
  {
    id: 'piso-termico',
    term: 'Piso térmico',
    category: 'clima',
    short: 'Franja de altitud definida por la temperatura media: cálido, templado, frío, muy frío, nival.',
    long: `En la zona tropical la temperatura depende sobre todo de la altitud, así que las franjas altitudinales funcionan como climas distintos apilados en la misma latitud.

De forma aproximada: cálido hasta ~1.000 m, templado hasta ~2.000 m, frío hasta ~3.000 m, muy frío hasta el límite de las nieves, y nival por encima.

En el archivo el piso térmico viene combinado con el régimen de humedad, de ahí etiquetas como "Cálido Semiárido" o "Muy frío Superhúmedo".`,
    see: ['regimen-de-humedad', 'orobioma']
  },
  {
    id: 'regimen-de-humedad',
    term: 'Régimen de humedad',
    category: 'clima',
    short: 'La segunda mitad de la etiqueta climática: árido, semiárido, semihúmedo, húmedo o superhúmedo.',
    long: `Clasifica el balance entre la lluvia que cae y el agua que se evapora. Va de árido —donde la evaporación supera con mucho a la lluvia— a superhúmedo, donde llueve muy por encima de lo que se evapora.

Para incendios es la mitad más informativa de la etiqueta: el fuego se asocia más al déficit de humedad que a la temperatura absoluta. Las clases semiáridas concentran una proporción de focos muy superior a la que les correspondería por su extensión.

Importante: describe el clima habitual del sitio, no el tiempo que hacía el día que ardió.`,
    see: ['piso-termico', 'alternohigrico']
  },

  /* ---------------- Paisaje y relieve ---------------- */
  {
    id: 'paisaje',
    term: 'Paisaje',
    category: 'terreno',
    short: 'La unidad grande del terreno: montaña, lomerío, piedemonte, planicie, altiplanicie, valle.',
    long: `En la clasificación geomorfológica el paisaje es el nivel superior: describe la forma general del terreno, antes de entrar en el detalle del [[relieve]].

En este tablero se usa como aproximación a la dificultad operativa: apagar un incendio en paisaje de montaña implica llegar a pie, sin acceso vehicular y con pendientes que hacen peligroso el trabajo.`,
    see: ['relieve', 'lomerio', 'piedemonte', 'altiplanicie']
  },
  {
    id: 'relieve',
    term: 'Relieve',
    category: 'terreno',
    short: 'La forma concreta del terreno dentro del paisaje: lomas, crestas, terrazas, abanicos.',
    long: `Es el nivel de detalle que sigue al [[paisaje]]. Donde el paisaje dice "montaña", el relieve precisa si son [[filas-y-vigas|filas y vigas]], [[crestas-y-espinazos|crestas y espinazos]] o cumbres andinas.

Determina la pendiente, la exposición al sol y al viento, y por tanto cómo se propaga el fuego y qué tan difícil es contenerlo.`,
    see: ['paisaje', 'filas-y-vigas', 'crestas-y-espinazos']
  },
  {
    id: 'filas-y-vigas',
    term: 'Filas y vigas',
    category: 'terreno',
    short: 'Relieve de montaña con crestas alargadas y estrechas separadas por vertientes largas y empinadas.',
    long: `Las "filas" son las líneas de cumbre, angostas y continuas; las "vigas" son las laderas largas y de fuerte pendiente que bajan de ellas.

Es el relieve más común de las cordilleras colombianas y el segundo más frecuente de este archivo. Para el combate del fuego es el peor escenario: la pendiente acelera la propagación cuesta arriba, no hay vías, y las cuadrillas trabajan sobre terreno inestable.`,
    see: ['relieve', 'crestas-y-espinazos']
  },
  {
    id: 'crestas-y-espinazos',
    term: 'Crestas y espinazos',
    category: 'terreno',
    short: 'Relieve de rocas plegadas: crestas de pendiente fuerte y espinazos de laderas asimétricas.',
    long: `Aparece donde las capas de roca fueron plegadas e inclinadas. La erosión deja las capas duras en resalte: si el buzamiento es fuerte se forman crestas simétricas; si es moderado, espinazos con una ladera suave y otra abrupta.

Típico de la cordillera Oriental. La asimetría importa para el fuego, porque las dos caras reciben sol y viento de forma muy distinta.`,
    see: ['relieve', 'filas-y-vigas']
  },
  {
    id: 'lomerio',
    term: 'Lomerío',
    category: 'terreno',
    short: 'Paisaje de colinas bajas y onduladas, entre la montaña y la planicie.',
    long: `Relieve suave, de poca altura relativa y pendientes moderadas. En este archivo es el tercer paisaje más frecuente, sobre todo en el Caribe, los Llanos y los valles interandinos.

Es terreno de ganadería extensiva, y buena parte de los focos que registra corresponden a quema de pastos.`,
    see: ['paisaje', 'piedemonte']
  },
  {
    id: 'piedemonte',
    term: 'Piedemonte',
    category: 'terreno',
    short: 'La franja de transición entre la montaña y la llanura, formada por depósitos en abanico.',
    long: `Cuando los ríos salen de la montaña pierden fuerza y sueltan el material que arrastran, formando abanicos que se solapan al pie de la cordillera.

El piedemonte llanero —el borde oriental de la cordillera Oriental— es una de las zonas de mayor actividad de fuego del país: concentra frontera agrícola, ganadería y una temporada seca marcada.`,
    see: ['paisaje', 'lomerio']
  },
  {
    id: 'altiplanicie',
    term: 'Altiplanicie',
    category: 'terreno',
    short: 'Superficie relativamente plana a gran altitud, como la sabana de Bogotá o el altiplano nariñense.',
    long: `Planicies elevadas, generalmente de origen lacustre: antiguos lagos que se rellenaron de sedimento y luego se secaron.

Concentran población, agricultura intensiva y, en el caso de la sabana de Bogotá, el foco recurrente más marcado de todo el archivo.`,
    see: ['paisaje', 'recurrencia']
  },
  {
    id: 'planicie-aluvial',
    term: 'Planicie aluvial',
    category: 'terreno',
    short: 'Terreno plano construido por los sedimentos que deposita un río a lo largo del tiempo.',
    long: `Incluye el plano de inundación —la franja que el río ocupa en crecientes— y las terrazas, niveles antiguos que el río ya abandonó.

Son suelos fértiles, muy usados en agricultura, y en temporada seca concentran quemas de preparación de terreno.`,
    see: ['paisaje', 'helobioma']
  },

  /* ---------------- Método del tablero ---------------- */
  {
    id: 'celda',
    term: 'Celda de ~500 m',
    category: 'metodo',
    short: 'Las coordenadas vienen redondeadas a ~0,005°, así que cada punto del mapa es una celda, no un predio.',
    long: `El archivo entrega las coordenadas redondeadas a intervalos de aproximadamente 0,005 grados, que en Colombia equivalen a unos 500 metros. Es la huella de la grilla satelital de origen.

Dos consecuencias. Primera: un punto del mapa no señala una finca ni una vereda, sino un cuadro de medio kilómetro de lado. Segunda: focos distintos que caen en el mismo cuadro comparten coordenada exacta — y eso es justo lo que permite construir la tabla de [[recurrencia|puntos recurrentes]].`,
    see: ['recurrencia', 'unidad-de-analisis']
  },
  {
    id: 'recurrencia',
    term: 'Recurrencia',
    category: 'metodo',
    short: 'Coordenadas donde el archivo registra fuego en dos o más años distintos.',
    long: `El tablero agrupa los focos por coordenada exacta y cuenta en cuántos años diferentes aparece cada una. Las que aparecen en dos o más años son "puntos recurrentes": 407 en el archivo completo.

Son las candidatas naturales a intervención preventiva, porque el patrón sugiere una causa que se repite —una práctica de manejo, un uso del suelo— y no un accidente.

Con la salvedad de siempre: "el mismo punto" significa la misma [[celda|celda de ~500 m]], y las celdas con más años suelen coincidir con las zonas donde la captura de datos fue más constante.`,
    see: ['celda', 'cobertura-temporal']
  },
  {
    id: 'cobertura-temporal',
    term: 'Cobertura temporal desigual',
    category: 'metodo',
    short: 'La captura no es pareja entre años: 2012–2017, 2019 y 2025 son densos; 2011 no tiene ningún registro.',
    long: `Este es el sesgo más importante del archivo y el que más fácilmente lleva a conclusiones falsas.

Los años densos —2012 a 2017, 2019 y 2025— concentran casi todos los registros. Otros años tienen apenas un puñado, y 2011 no tiene ninguno. La tira de años del filtro lo muestra explícitamente: barra sólida para captura densa, rayada para parcial, caja punteada para años sin captura.

La consecuencia: no se puede leer una tendencia temporal de este archivo. Si 2015 tiene más focos que 2021, eso dice casi con seguridad que en 2015 se capturó más, no que se quemó más.`,
    see: ['recurrencia', 'unidad-de-analisis']
  },
  {
    id: 'region-natural',
    term: 'Región natural',
    category: 'metodo',
    short: 'Las grandes regiones del país. El archivo no las trae: el tablero las asigna por departamento.',
    long: `Andina, Caribe, Orinoquía, Amazonía y Pacífica. Es la partición con la que se lee la estacionalidad, porque los regímenes de lluvia difieren radicalmente entre ellas.

El archivo del IDEAM no incluye una columna de región, así que el tablero la deriva del departamento. Eso introduce un error conocido: los departamentos que se reparten entre dos regiones —Antioquia entre Andina y Caribe, Meta entre Orinoquía y Amazonía— se cuentan enteros en una sola.

"Otras" agrupa la Pacífica (Chocó) y los registros sin departamento asignado.`,
    see: ['bimodalidad']
  },
  {
    id: 'bimodalidad',
    term: 'Régimen bimodal',
    category: 'metodo',
    short: 'Dos temporadas de lluvia al año, y por tanto dos temporadas secas. Es lo propio de la región Andina.',
    long: `Por el paso de la zona de convergencia intertropical, buena parte de la región Andina recibe dos picos de lluvia al año, hacia abril y hacia octubre, con dos periodos secos intercalados: diciembre–marzo y julio–agosto.

Los Llanos, en cambio, tienen régimen monomodal: una sola temporada de lluvias y una sola temporada seca, de diciembre a marzo.

De ahí sale el hallazgo central del tablero. El primer pico de focos (enero–marzo) lo aportan todas las regiones a la vez. El segundo (julio–septiembre) es casi exclusivamente andino, porque es la única región que tiene una segunda temporada seca.`,
    see: ['region-natural']
  }
];

export const GLOSSARY_BY_ID = Object.fromEntries(GLOSSARY.map(t => [t.id, t]));

/** Valor crudo del dataset → término del glosario, para enlazar las listas. */
export const TERM_BY_VALUE = {
  'Agroecosistema': 'agroecosistema',
  'Vegetacion Secundaria': 'vegetacion-secundaria',
  'Paramo': 'paramo',
  'Subxerofitia': 'subxerofitia',
  'Xerofitia': 'xerofitia',
  'Zona Pantanosa': 'zona-pantanosa',
  'Territorio Artificializado': 'zonas-intervenidas',
  'Transicional Transformado': 'zonas-intervenidas'
};

/* ================================================================== *
 * Guías de tarjeta — siempre tres partes, siempre en el mismo orden.
 * `plain` es la línea llana que va debajo del gráfico, siempre visible
 * en modo aprendizaje.
 * Los campos pueden ser función de un contexto con cifras vivas.
 * ================================================================== */
export const CARD_GUIDES = {
  'kpi-focos': {
    title: 'Focos de incendio',
    what: 'Cuántos registros del archivo del IDEAM cumplen los filtros que tienes puestos.',
    how: 'Es un conteo de detecciones satelitales. El sparkline de al lado reparte esos mismos focos entre enero y diciembre, para que veas de una vez en qué parte del año caen.',
    watch: 'Un [[foco-de-calor|foco de calor]] no es un [[incendio]], y el conteo no es superficie quemada: el archivo no trae hectáreas. Una quema agrícola de media hectárea produce un foco igual que un incendio forestal de quinientas. Duplicar los focos no significa duplicar el daño.',
    plain: 'Detecciones satelitales de fuego, no incendios ni hectáreas.'
  },
  'kpi-territorio': {
    title: 'Afectación territorial',
    what: 'Cuántos departamentos y cuántos municipios distintos aparecen en el subconjunto filtrado.',
    how: 'Mide qué tan repartido está el fuego, no qué tan grave es. El sparkline compara los ocho departamentos con más focos.',
    watch: 'Que un departamento aparezca no dice nada sobre qué proporción de su territorio ardió. Los municipios se cuentan junto con su departamento, porque hay nombres que se repiten en varios departamentos del país.',
    plain: 'En cuántos departamentos y municipios distintos cayó al menos un foco.'
  },
  'kpi-intervenidas': {
    title: 'Focos en zonas intervenidas',
    what: 'Qué porcentaje de los focos filtrados cayó sobre coberturas ya transformadas por actividad humana.',
    how: 'Se deriva del [[ecosistema-de-sintesis|ecosistema de síntesis]], agrupando [[agroecosistema]], [[vegetacion-secundaria|vegetación secundaria]], territorio artificializado y transicional transformado.',
    watch: 'Un porcentaje alto apunta a quema de manejo agrícola más que a catástrofe ecológica — pero eso no lo vuelve inocuo. Las quemas de manejo son la principal fuente de ignición que después se escapa hacia vegetación natural.',
    plain: 'Qué parte del fuego cayó sobre terreno que ya estaba intervenido.'
  },
  'kpi-dificultad': {
    title: 'Dificultad operativa',
    what: 'Qué porcentaje de los focos filtrados ocurrió en [[paisaje]] de montaña.',
    how: 'Se usa como aproximación a lo difícil que es llegar: en montaña la extinción es a pie, sin acceso vehicular y con pendientes peligrosas.',
    watch: 'Es un proxy grueso. El paisaje describe la forma del terreno, no la distancia real a una vía, a un cuerpo de agua o a una estación de bomberos. Un foco en montaña cerca de una carretera es más fácil de atender que uno en planicie a cuarenta kilómetros de la vía más próxima.',
    plain: 'Qué parte del fuego cayó en montaña, donde apagarlo cuesta mucho más.'
  },
  'kpi-pico': {
    title: 'Pico estacional',
    what: 'El mes que concentra más focos dentro del subconjunto filtrado.',
    how: 'El sparkline muestra los doce meses y marca ese pico en verde.',
    watch: 'Si tienes meses filtrados, el pico solo puede caer entre los que dejaste seleccionados. Y como la [[cobertura-temporal|captura no es pareja entre años]], un pico puede estar diciendo cuándo se midió más, no cuándo se quemó más.',
    plain: 'El mes con más focos según los filtros activos.'
  },
  'mapa': {
    title: 'Mapa de focos',
    what: 'Dónde cayeron los focos filtrados, en tres lecturas: agrupados en clústeres, como densidad continua, o solo los que cayeron en [[ecosistemas-sensibles|ecosistemas sensibles]].',
    how: 'Los clústeres agrupan focos cercanos y su color sigue la escala de intensidad, con los umbrales publicados en la leyenda. En la capa de sensibles el color cambia de significado: pasa a indicar el tipo de ecosistema, y cada clúster toma el tipo más irreemplazable que contiene. Clic en un punto filtra todo el tablero por ese departamento; Ctrl o ⌘ más rueda hace zoom.',
    watch: 'Cada punto es una [[celda|celda de ~500 m]], no un predio, y los conteos son número de reportes, no hectáreas. Varios focos que caen en la misma celda se apilan en una única coordenada, así que la densidad visual subestima la concentración real. La capa de densidad usa escala de raíz cuadrada, porque en escala lineal una sola celda de la sabana de Bogotá aplana todo el resto del país; además su intensidad se normaliza contra el máximo real del subconjunto filtrado, no contra un valor fijo, así que el color no es comparable entre filtros distintos.',
    plain: 'Dónde cayó el fuego. Cada punto es una celda de medio kilómetro, no una finca.'
  },
  'estacionalidad': {
    title: 'Estacionalidad por región natural',
    what: 'En qué meses del año se concentra el fuego en cada [[region-natural|región natural]], calculado sobre el archivo completo y no sobre los filtros.',
    how: 'Cada panel muestra el porcentaje de los focos de esa región que cae en cada mes, y está escalado a su propio mes pico. Compara la forma de la temporada entre regiones, no el tamaño de las figuras.',
    watch: 'En un radar el ojo compara áreas, y el área crece con el cuadrado del valor: exagera las diferencias. Usa la vista de barras para leer magnitudes. Además las regiones se asignan por departamento, así que los departamentos repartidos entre dos regiones se cuentan enteros en una sola.',
    plain: 'Cuándo se quema cada región. La Andina tiene dos temporadas al año; las demás, una sola.'
  },
  'departamentos': {
    title: 'Ranking departamental',
    what: 'Cuántos de los focos filtrados corresponden a cada departamento.',
    how: 'Ordenados de mayor a menor. El tono sigue la magnitud, no el puesto, así que dos departamentos con cifras parecidas se ven parecidos. Clic en una barra filtra todo el tablero.',
    watch: 'Es conteo absoluto, no densidad. Los departamentos grandes aparecen arriba en parte por tamaño. Para comparar de verdad haría falta dividir por área o por cobertura vegetal, y el archivo no trae ninguna de las dos.',
    plain: 'Qué departamentos acumulan más focos — en total, no por kilómetro cuadrado.'
  },
  'municipios': {
    title: 'Municipios más afectados',
    what: 'Los veinte municipios con más focos dentro del subconjunto filtrado.',
    how: 'Cada fila trae municipio y departamento, porque hay nombres de municipio que se repiten entre departamentos.',
    watch: 'El campo de municipio del archivo no es fiable a nivel de registro: en la mitad de los municipios con 30 o más focos, menos del 12% de sus puntos cae a menos de 20 km del centro de su propia nube. Usa este ranking como orientación, no como conteo municipal exacto — el departamento sí es consistente con las coordenadas. Además los nombres vienen sin tildes en el archivo y aquí solo se les restaura la mayúscula, y como en el ranking departamental un municipio puede encabezar la lista por tener más superficie o mejor cobertura de datos, no por arder más.',
    plain: 'Los municipios que más veces aparecen reportados con fuego. Tómalo como orientación: el municipio del archivo no es fiable registro a registro.'
  },
  'perfil-eco': {
    title: 'Perfil ecológico de afectación',
    what: 'Cuántos focos ocurrieron en cada tipo de ecosistema, según la clasificación de [[ecosistema-de-sintesis|síntesis del IAvH]].',
    how: 'Las barras están ordenadas por frecuencia y las moradas marcan [[ecosistemas-sensibles|ecosistemas de alto valor de conservación]]. [[agroecosistema|Agroecosistema]] significa territorio ya dedicado a actividad agropecuaria, no vegetación natural.',
    watch: (ctx) =>
      `Que un ecosistema tenga pocos focos no significa que esté a salvo. En el archivo completo el [[paramo|páramo]] registra ${ctx.paramoCount} focos frente a ${ctx.pastureCount} en [[agroecosistema]] — pero el páramo ocupa una fracción mínima del territorio nacional, así que cada uno de esos focos pesa muchísimo más. Sin el área de cada ecosistema, este gráfico mide frecuencia, no riesgo, y la frecuencia favorece siempre a lo que más superficie ocupa.`,
    plain: 'En qué tipo de ecosistema cayó el fuego. Pocos focos en páramo no es lo mismo que poco daño.'
  },
  'kpi-eco-dominante': {
    title: 'Ecosistema dominante',
    what: 'La clase de [[ecosistema-de-sintesis|ecosistema de síntesis]] con más focos dentro del subconjunto filtrado, con su conteo y su porcentaje.',
    how: 'Responde "¿sobre qué está ardiendo la mayor parte?". Es complementario del KPI de zonas intervenidas: aquel agrega cuatro clases transformadas, este señala una sola y la nombra.',
    watch: 'Es la clase más frecuente, no la más afectada en términos relativos. [[agroecosistema|Agroecosistema]] encabeza casi siempre porque es la cobertura que más superficie ocupa en el país, no porque arda de forma desproporcionada.',
    plain: 'El tipo de ecosistema donde cayó la mayor parte del fuego.'
  },
  'kpi-alto-valor': {
    title: 'Focos en ecosistemas de alto valor de conservación',
    what: 'Cuántos focos cayeron en [[ecosistemas-sensibles|ecosistemas de alto valor de conservación]]: bosque, bosque fragmentado, [[paramo|páramo]], [[zona-pantanosa|zonas pantanosas]] y glaciares.',
    how: 'La cifra grande es el conteo y el porcentaje es sobre el total filtrado. Debajo va el desglose por clase, ordenado de mayor a menor.',
    watch: 'Es el complemento del indicador de zonas intervenidas, no su opuesto exacto: entre los dos no suman 100% porque quedan fuera sabanas, herbazales, arbustales y otros ecosistemas naturales que sí están adaptados al fuego. Y sigue siendo frecuencia: no dice cuántas hectáreas de bosque se perdieron.',
    plain: 'Cuánto del fuego cayó sobre ecosistemas que no se recuperan bien de arder.'
  },
  'kpi-paramo': {
    title: 'Focos en páramo',
    what: 'Los focos que cayeron en [[paramo|páramo]] y los departamentos donde se concentran. Cada departamento es un botón que filtra el tablero.',
    how: 'Es el subconjunto más pequeño y a la vez el de mayor peso público del archivo: los complejos de páramo de Cundinamarca, Boyacá y Nariño abastecen de agua a buena parte de las ciudades andinas.',
    watch: 'La cifra absoluta engaña por lo baja. El páramo es una fracción mínima del territorio nacional y no está adaptado al fuego: el suelo orgánico y los frailejones tardan décadas en recuperarse, y con ellos la capacidad de retención de agua. Comparar este número con el de agroecosistema sin corregir por superficie no tiene sentido.',
    plain: 'Fuego en el ecosistema que regula el agua de las ciudades andinas.'
  },
  'concentracion': {
    title: 'Concentración territorial',
    what: 'Qué tan repartido está el fuego: cuántos municipios acumulan el 80% de los focos, y qué fracción del total está en los cinco departamentos más afectados.',
    how: 'La curva ordena los municipios de mayor a menor y acumula. Si subiera en diagonal, el fuego estaría repartido por igual; cuanto más pegada al eje izquierdo, más concentrado. La línea punteada marca el 80%.',
    watch: 'Contando por nombre de municipio salen 327 de 894; el tablero cuenta municipio + departamento (porque hay nombres repetidos) y salen algo más. Además la concentración es en parte real y en parte artefacto de la [[cobertura-temporal|cobertura desigual]]: donde se midió más, se acumulan más focos.',
    plain: 'Unos pocos municipios concentran la mayor parte del fuego: se puede focalizar.'
  },
  'dia-semana': {
    title: 'Distribución por día de la semana',
    what: 'Los mismos focos filtrados, repartidos según el día de la semana de su fecha.',
    how: 'Se lee comparando la caída entre el día más alto y el más bajo. Junto al gráfico van las dos interpretaciones posibles, porque los datos no permiten escoger entre ellas.',
    watch: 'Esta es la lectura más delicada del tablero. Que el fin de semana baje puede significar que la ignición es humana y sigue el calendario de trabajo, o que quien registra los datos también descansa. Con este archivo no hay forma de separar el fenómeno del registro. Presentar solo la primera lectura sería la conclusión cómoda, no la correcta.',
    plain: 'El fuego baja los fines de semana. Puede ser el fenómeno o puede ser quién lo reporta.'
  },
  'gran-bioma': {
    title: 'Gran bioma',
    what: 'Las cinco unidades de primer nivel de la clasificación de biomas del IAvH presentes en el archivo.',
    how: 'El nombre codifica la lógica: [[zonobioma]] es el patrón de clima zonal, [[orobioma]] la variante de montaña, [[pedobioma]] la que define el suelo, y [[azonal]] marca lo que se sale del patrón por condiciones locales.',
    watch: 'Cuatro de las cinco categorías son variantes del mismo zonobioma húmedo tropical, así que el gráfico dice menos sobre el clima que sobre el relieve y el suelo. El [[alternohigrico|zonobioma alternohígrico]] es el único realmente distinto en régimen de lluvias, y es el que concentra el fuego estacional.',
    plain: 'La clasificación de biomas más gruesa: cinco categorías para todo el país.'
  },
  'matriz-clima': {
    title: 'Matriz climática',
    what: 'Los focos repartidos en las dos dimensiones que el campo de clima trae pegadas: [[piso-termico|piso térmico]] (filas) y [[regimen-de-humedad|régimen de humedad]] (columnas).',
    how: 'Cada celda es una combinación y su color sigue la escala de intensidad. Clic en una celda filtra el tablero por esa clase climática exacta. Los totales de fila permiten leer el piso térmico por separado.',
    watch: 'La concentración en la franja cálida y semihúmeda refleja tanto el clima donde arde como dónde vive y trabaja la gente. Y son climas medios del sitio, no las condiciones del día del incendio. Las celdas de una o dos unidades —piso nival, extremadamente frío— son reales pero no soportan ninguna inferencia.',
    plain: 'Dónde se cruzan temperatura y humedad cuando hay fuego.'
  },
  'paisaje': {
    title: 'Paisaje',
    what: 'La unidad geomorfológica grande donde cayó cada foco: montaña, [[lomerio|lomerío]], [[piedemonte]], [[planicie-aluvial|planicie aluvial]], [[altiplanicie]], valle.',
    how: 'Es la visualización que sostiene el KPI de dificultad operativa: el porcentaje de montaña sale de aquí. Las barras están ordenadas por frecuencia con valor y porcentaje al final.',
    watch: 'El paisaje describe la forma del terreno, no el acceso real. Y los registros con paisaje «N.A.» no son un tipo de terreno: son ausencia de dato, y conviene no leerlos como categoría.',
    plain: 'Sobre qué tipo de terreno cayó el fuego.'
  },
  'relieve': {
    title: 'Relieve',
    what: 'La forma concreta del terreno dentro del [[paisaje]]: [[filas-y-vigas|filas y vigas]], [[crestas-y-espinazos|crestas y espinazos]], lomas y colinas, terrazas, abanicos.',
    how: 'Es el nivel de detalle que importa operativamente: determina pendiente, exposición al sol y al viento, y por tanto cómo se propaga el fuego y qué tan difícil es contenerlo. Se muestran las 14 formas más frecuentes.',
    watch: 'Que «lomas y colinas» encabece no significa que ahí sea más difícil apagar: es relieve suave y accesible. El dato operativamente preocupante es el segundo, filas y vigas, que es el peor escenario posible para una cuadrilla.',
    plain: 'La forma fina del terreno: lo que decide si el fuego se puede alcanzar a pie.'
  },
  'conglomerado': {
    title: 'Conglomerado recurrente al occidente de Bogotá',
    what: 'Un grupo de coordenadas que registran fuego en varios años distintos, agrupadas en una caja de unos 22 por 22 kilómetros al occidente de Bogotá.',
    how: 'El tamaño de cada círculo crece con el número de años afectados. La caja punteada delimita el conglomerado. Es el candidato más claro del archivo a intervención preventiva focalizada, porque la repetición apunta a una causa estructural y no a un accidente.',
    watch: 'El conglomerado está definido por su caja de coordenadas, no por nombres de municipio, y eso es deliberado: el archivo etiqueta estas celdas con municipios que están entre 50 y 75 km de distancia. El campo de municipio no es fiable a nivel de registro, así que ponerle nombre de provincia a este hallazgo sería inventar. Además cada punto es una [[celda|celda de ~500 m]], no un predio.',
    plain: 'Un grupo de celdas al occidente de Bogotá que arde año tras año.'
  },
  'clima': {
    title: 'Condiciones climáticas',
    what: 'Cuántos focos ocurrieron bajo cada clase climática, combinando [[piso-termico|piso térmico]] y [[regimen-de-humedad|régimen de humedad]].',
    how: 'La primera palabra es la temperatura (cálido, templado, frío, muy frío, nival) y la segunda la humedad (árido, semiárido, semihúmedo, húmedo, superhúmedo). El tono sigue la magnitud. Clic en una barra filtra el tablero.',
    watch: 'Es el clima habitual del sitio, no el tiempo que hacía el día del incendio. Este gráfico no dice que hubiera sequía cuando ardió: para eso haría falta la serie meteorológica de esa fecha, que este archivo no incluye.',
    plain: 'Bajo qué clima habitual cayó el fuego — no el clima del día en que ardió.'
  },
  'recurrentes': {
    title: 'Puntos críticos recurrentes',
    what: 'Coordenadas donde el archivo registra fuego en dos o más años distintos. Son 407 en el archivo completo.',
    how: 'Ordenadas por número de años afectados. Un punto que arde en cinco años distintos apunta a una causa que se repite —una práctica de manejo, un uso del suelo— y no a un accidente. Son las candidatas naturales a intervención preventiva.',
    watch: 'Como las coordenadas están redondeadas, "el mismo punto" quiere decir la misma [[celda|celda de ~500 m]]. Y las celdas con más años tienden a estar donde la [[cobertura-temporal|captura de datos fue más constante]], así que la lista mezcla recurrencia real con constancia de medición.',
    plain: 'Sitios que se repiten año tras año: los mejores candidatos para prevención.'
  }
};

/** Los campos de una guía pueden ser texto o función del contexto. */
export const resolveGuideField = (field, ctx) =>
  typeof field === 'function' ? field(ctx || {}) : field;

/* ================================================================== *
 * Recorrido guiado — cinco pasos en la primera visita.
 * ================================================================== */
export const TOUR_STEPS = [
  {
    target: '[data-tour="filters"]',
    title: 'Los filtros también son gráficos',
    body: 'La tira de años dibuja cuántos registros hay en cada año y con qué calidad se capturaron: sólido es captura densa, rayado es parcial y la caja punteada es un año sin ningún dato. La tira de meses se colorea por intensidad. Haz clic para escoger uno, o arrastra para escoger un rango.'
  },
  {
    target: '[data-tour="kpis"]',
    title: 'Las cifras de arriba responden a los filtros',
    body: 'Todo el tablero se recalcula con lo que filtres, incluidos estos indicadores. El más importante es el primero, y conviene tenerlo claro desde el principio: son detecciones satelitales de calor, no incendios confirmados ni hectáreas quemadas.'
  },
  {
    target: '[data-tour="map"]',
    title: 'El mapa filtra en las dos direcciones',
    body: 'Cambia entre puntos, densidad y ecosistemas sensibles. Al hacer clic en un punto puedes filtrar todo el tablero por ese departamento. Para hacer zoom usa Ctrl o ⌘ junto con la rueda, así el mapa no te secuestra el scroll de la página.'
  },
  {
    target: '[data-tour="tabs"]',
    title: 'Cuatro maneras de mirar lo mismo',
    body: 'Territorio responde dónde; Temporal, cuándo; Ecosistemas, sobre qué; y Datos guarda la tabla de puntos recurrentes junto con las notas metodológicas completas.'
  },
  {
    target: '[data-tour="learn"]',
    title: 'Esta capa se puede apagar',
    body: 'Cada tarjeta tiene un ⓘ que explica qué muestra, cómo leerla y con qué hay que tener cuidado. Los términos subrayados con puntos abren el glosario. Si ya conoces el dominio, cambia a modo experto y desaparece todo, menos el ⓘ.'
  }
];

export const LEARN_MODE_KEY = 'nte.observatorio.learnMode';
export const TOUR_SEEN_KEY = 'nte.observatorio.tourSeen';
