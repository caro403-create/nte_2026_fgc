-- ============================================================
-- NTE · Saberes ancestrales sobre el fuego
-- Tabla, RLS y contenido inicial (bilingüe español / inglés).
--
-- ARCHIVO GENERADO. No editar a mano: el contenido vive en
-- src/data/ancestralKnowledge.js y este archivo se regenera con
--   node scripts/generate_ancestral_sql.mjs
--
-- Se puede correr varias veces sin romper nada.
-- ============================================================

CREATE TABLE IF NOT EXISTS ancestral_knowledge (
  id             BIGSERIAL PRIMARY KEY,
  slug           TEXT UNIQUE NOT NULL,
  sort_order     INT NOT NULL DEFAULT 0,
  featured       BOOLEAN NOT NULL DEFAULT false,

  -- Categoría temática. La clave viaja en español; la UI traduce.
  category       TEXT NOT NULL DEFAULT 'Manejo del Fuego',
  -- Papel del fuego: uso | prohibicion | prevencion | lectura
  fire_role      TEXT NOT NULL DEFAULT 'lectura',

  title          TEXT NOT NULL,
  title_en       TEXT,
  summary        TEXT NOT NULL,
  summary_en     TEXT,
  content        TEXT NOT NULL,
  content_en     TEXT,

  -- [{ "es": "...", "en": "..." }] — las claves prácticas de cada saber.
  practices      JSONB,

  -- Cómo se conecta el saber con lo que mide la plataforma hoy.
  today          TEXT,
  today_en       TEXT,

  people         TEXT,
  people_en      TEXT,
  region         TEXT,
  ecosystem      TEXT,
  ecosystem_en   TEXT,
  season         TEXT,
  season_en      TEXT,
  tags           TEXT[],

  -- Imagen con su crédito: casi todas son CC o dominio público y la
  -- atribución es obligatoria, así que viaja junto al archivo.
  image_url         TEXT,
  image_credit      TEXT,
  image_license     TEXT,
  image_source_url  TEXT,

  source_name    TEXT,
  source_url     TEXT,

  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ancestral_knowledge_category_idx  ON ancestral_knowledge (category);
CREATE INDEX IF NOT EXISTS ancestral_knowledge_fire_role_idx ON ancestral_knowledge (fire_role);
CREATE INDEX IF NOT EXISTS ancestral_knowledge_order_idx     ON ancestral_knowledge (sort_order);

ALTER TABLE ancestral_knowledge ENABLE ROW LEVEL SECURITY;

-- Contenido curado: lectura pública, escritura sólo desde el panel de
-- Supabase o con la service key. No hay política de INSERT a propósito.
DO $$ BEGIN
  CREATE POLICY "Anyone can read ancestral knowledge"
    ON ancestral_knowledge FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

GRANT SELECT ON ancestral_knowledge TO anon, authenticated;


-- ============================================================
-- Contenido inicial
-- ============================================================

INSERT INTO ancestral_knowledge (
  slug, sort_order, featured, category, fire_role, title, title_en, summary, summary_en, content, content_en, practices, today, today_en, people, people_en, region, ecosystem, ecosystem_en, season, season_en, tags, image_url, image_credit, image_license, image_source_url, source_name, source_url
) VALUES

('chagra-amazonica',
  1,
  true,
  'Manejo del Fuego',
  'uso',
  'La chagra amazónica: el fuego que se enciende esperando la lluvia',
  'The Amazonian chagra: the fire lit while waiting for rain',
  'Un claro de menos de una hectárea, rodeado de selva húmeda que hace de pared. Así se ha quemado en la Amazonía durante siglos sin que el fuego se escape.',
  'A clearing under one hectare, ringed by humid forest acting as a wall. That is how the Amazon has burned for centuries without the fire escaping.',
  'La chagra es el sistema de cultivo de los pueblos de la Amazonía colombiana: un claro pequeño abierto dentro de la selva y sembrado con yuca brava, plátano, piña, ají y una veintena larga de especies más. El fuego entra en una sola etapa del ciclo, y entra con reglas.

Primero se socola el sotobosque y se tumban los árboles grandes en las semanas más secas del año. Después viene el paso que casi siempre se omite cuando la técnica se copia mal: la biomasa se deja secar entre tres y seis semanas. Un corte fresco no quema, humea; se apaga a medias y deja el trabajo hecho por mitades, lo que empuja a encender otra vez y otra vez.

Tres condiciones deciden si se prende o no. Que el claro sea pequeño, rara vez más de una hectárea. Que esté rodeado de selva húmeda en pie, porque esa selva es el cortafuego. Y que las señales anuncien lluvia en los días siguientes, de modo que lo que quede encendido se apague solo. La quema se hace en una tarde, con varias personas repartidas en el borde y ramas verdes o agua a la mano.

La ceniza es el abono: aporta potasio, calcio y magnesio, y corrige la acidez de unos suelos amazónicos mucho más pobres de lo que sugiere el tamaño de los árboles que sostienen. Tras dos o tres cosechas la chagra se deja descansar, el rastrojo se vuelve bosque joven y la parcela no se toca durante quince o veinte años. En este sistema el fuego no abre frontera agrícola: rota dentro de un mismo territorio conocido.',
  'The chagra is the cultivation system of the peoples of the Colombian Amazon: a small clearing opened inside the forest and planted with bitter cassava, plantain, pineapple, chilli and a good twenty other species. Fire enters at a single stage of the cycle, and it enters under rules.

First the understorey is cleared and the large trees are felled during the driest weeks of the year. Then comes the step that is almost always dropped when the technique is copied badly: the biomass is left to dry for three to six weeks. A fresh cut does not burn, it smoulders; it half goes out and leaves the job half done, which pushes people to light it again, and again.

Three conditions decide whether it is lit at all. That the clearing is small, rarely more than one hectare. That it is ringed by standing humid forest, because that forest is the firebreak. And that the signs announce rain in the following days, so whatever stays lit puts itself out. The burn is done in a single afternoon, with several people spread along the edge and green branches or water at hand.

The ash is the fertiliser: it supplies potassium, calcium and magnesium, and corrects the acidity of Amazonian soils far poorer than the size of the trees they hold would suggest. After two or three harvests the chagra is left to rest, the regrowth becomes young forest, and the plot is not touched for fifteen or twenty years. In this system fire does not open an agricultural frontier: it rotates inside one known territory.',
  '[{"es":"Tumbar en las semanas más secas y dejar secar la biomasa de 3 a 6 semanas antes de encender.","en":"Fell during the driest weeks and let the biomass dry for 3 to 6 weeks before lighting."},{"es":"Mantener el claro pequeño —menos de una hectárea— y rodeado de bosque húmedo en pie.","en":"Keep the clearing small — under one hectare — and ringed by standing humid forest."},{"es":"Quemar en una sola tarde, con personas repartidas en todo el borde y una ruta de salida acordada.","en":"Burn in a single afternoon, with people spread along the whole edge and an agreed escape route."},{"es":"Encender solo si las señales anuncian lluvia próxima. Si no la anuncian, se aplaza.","en":"Light only if the signs announce rain soon. If they do not, it waits."},{"es":"Dejar descansar la parcela 15 o 20 años: el descanso es parte de la técnica, no un abandono.","en":"Rest the plot for 15 or 20 years: the rest is part of the technique, not neglect."}]'::jsonb,
  'Todo el sistema descansa en que la selva de alrededor esté húmeda. Cuando el NDVI de la zona cae y la humedad del suelo baja —las dos capas que el Observatorio dibuja sobre el mapa—, esa pared deja de existir, y una quema que durante generaciones fue segura se convierte en un foco.',
  'The whole system rests on the surrounding forest being wet. When the area''s NDVI drops and soil moisture falls — the two layers the Observatory draws on the map — that wall stops existing, and a burn that was safe for generations becomes a hotspot.',
  'Pueblos murui-muina (uitoto), bora, muinane, andoque y tikuna',
  'Murui-Muina (Uitoto), Bora, Muinane, Andoque and Tikuna peoples',
  'Amazonas y Medio Caquetá',
  'Selva húmeda tropical',
  'Tropical rainforest',
  'Las semanas más secas: diciembre a febrero',
  'The driest weeks: December to February',
  ARRAY['chagra', 'roza y quema', 'Amazonía', 'yuca brava', 'ceniza']::TEXT[],
  'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1200&q=80',
  'Unsplash',
  'Unsplash License',
  'https://unsplash.com/',
  'Tropenbos Colombia — conocimiento local y sistemas de chagra',
  'https://www.tropenbos.org/'),

('calendario-ecologico',
  2,
  false,
  'Calendario y Señales',
  'lectura',
  'El calendario ecológico: leer el año antes de encender',
  'The ecological calendar: reading the year before lighting',
  'El año no se cuenta en meses sino en acontecimientos: una constelación que aparece, un árbol que florece, un insecto que sale. Cada acontecimiento abre o cierra una tarea.',
  'The year is not counted in months but in events: a constellation that appears, a tree that flowers, an insect that emerges. Each event opens or closes a task.',
  'Un calendario ecológico no divide el año en doce partes iguales. Lo divide en épocas nombradas por lo que ocurre en ellas: la época en que sale la hormiga, la época en que florece tal árbol, la época en que baja el río, la época en que aparece tal constelación sobre el horizonte al anochecer. Cada época trae su lista de tareas: qué se siembra, qué se cosecha, qué se pesca, qué se caza, y también qué no se hace.

La diferencia con un calendario de fechas es que este se corrige solo. Si el año viene retrasado, el árbol florece tarde y la tarea se corre con él. Nadie tumba porque «ya es enero»: se tumba cuando el territorio dice que llegó el momento, y esa señal integra sin cálculo la temperatura, la lluvia acumulada, la humedad del suelo y la duración del día.

Para el fuego esto importa mucho. Las señales que abren la ventana de quema no dicen «está seco»: dicen «está seco y va a llover pronto», que es una información distinta y mucho más difícil de obtener. El calendario indica no solo el momento de encender sino, sobre todo, el momento de dejar de hacerlo.

Estos calendarios se transmiten hablando, en el fogón y en el trabajo, y por eso son frágiles: se pierden en una generación cuando los mayores dejan de salir al monte con los jóvenes. Varias comunidades los han puesto por escrito y en dibujo, precisamente para que sobrevivan al cambio de quién trabaja la tierra.',
  'An ecological calendar does not divide the year into twelve equal parts. It divides it into seasons named after what happens in them: the season when the ants swarm, the season when a certain tree flowers, the season when the river drops, the season when a certain constellation appears over the horizon at dusk. Each season carries its list of tasks: what is sown, what is harvested, what is fished, what is hunted — and also what is not done.

The difference from a calendar of dates is that this one corrects itself. If the year runs late, the tree flowers late and the task moves with it. Nobody fells because "it is already January": they fell when the territory says the moment has come, and that signal folds in temperature, accumulated rainfall, soil moisture and day length without anyone doing the arithmetic.

For fire this matters enormously. The signs that open the burning window do not say "it is dry": they say "it is dry and rain is coming", which is a different piece of information and far harder to obtain. The calendar marks not only the moment to light, but above all the moment to stop.

These calendars are handed down in speech, at the hearth and at work, and that is why they are fragile: they are lost in a single generation once the elders stop going out to the bush with the young. Several communities have written and drawn theirs precisely so they survive the change in who works the land.',
  '[{"es":"Nombrar las épocas por lo que ocurre en ellas, no por el número del mes.","en":"Name the seasons by what happens in them, not by the number of the month."},{"es":"Anotar cada año la fecha real en que ocurre cada señal: así se ve cuánto se está corriendo el calendario.","en":"Record each year the real date each sign occurs: that is how you see how far the calendar is drifting."},{"es":"Cruzar dos o tres señales antes de decidir. Una sola puede fallar; tres coincidiendo, casi nunca.","en":"Cross two or three signs before deciding. One alone can fail; three agreeing almost never do."},{"es":"Registrar también las épocas de veda: cuándo no se quema, no se caza, no se corta.","en":"Record the closed seasons too: when not to burn, not to hunt, not to cut."}]'::jsonb,
  'Un calendario ecológico anotado durante varios años es una serie de datos, aunque no se llame así. Puesto junto al archivo del IDEAM 2010–2025 que esta plataforma publica, permite ver si la señal se está adelantando y en cuántos días.',
  'An ecological calendar recorded over several years is a data series, even if nobody calls it that. Set beside the IDEAM 2010–2025 archive this platform publishes, it shows whether the signal is arriving earlier, and by how many days.',
  'Pueblos amazónicos y andinos',
  'Amazonian and Andean peoples',
  'Amazonía, Andes y Orinoquía',
  'Transversal',
  'Cross-cutting',
  'Todo el año',
  'Year-round',
  ARRAY['calendario', 'fenología', 'constelaciones', 'épocas', 'transmisión oral']::TEXT[],
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80',
  'Unsplash',
  'Unsplash License',
  'https://unsplash.com/',
  'Instituto SINCHI — investigación amazónica',
  'https://www.sinchi.org.co/'),

('quema-mosaico-sabana',
  3,
  true,
  'Manejo del Fuego',
  'uso',
  'Quema en mosaico: la sabana que se protege quemándose por partes',
  'Mosaic burning: the savanna that protects itself by burning in patches',
  'La sabana llanera convive con el fuego desde antes de que hubiera quien la habitara. La técnica no consiste en evitarlo, sino en repartirlo.',
  'The Llanos savanna has lived with fire since before anyone inhabited it. The technique is not to avoid fire, but to distribute it.',
  'La sabana de la Orinoquía es un ecosistema de fuego. Sus gramíneas rebrotan desde la base, sus árboles tienen cortezas gruesas y sus semillas toleran el calor. Un llano que no se quema nunca acumula una capa de material muerto que, el día que se encienda, arde con una intensidad que sí mata el arbolado y esteriliza el suelo.

El manejo tradicional no quema todo el hato en un mismo momento. Quema parches, en fechas distintas, de manera que al final de la sequía el paisaje es un mosaico: parches recién quemados con rebrote tierno, parches de un año, parches de dos o tres. Ese mosaico es su propia red de cortafuegos. Un fuego que salga de control choca contra un parche quemado hace un mes, donde no hay combustible, y se detiene sin que nadie tenga que apagarlo.

Los detalles de ejecución son los que hacen la diferencia. Se prende al final de la tarde o muy temprano, cuando la humedad relativa sube y el viento cae. Se enciende primero una franja contra el viento —un fuego que avanza despacio y limpia el borde— y solo después se suelta el fuego a favor. Se respetan los morichales, los bosques de galería y los bordes de caño, que son los refugios de fauna y las reservas de humedad del llano.

Y hay una regla de calendario: se quema al final de la sequía, con las primeras lluvias cerca, no al principio. Una quema temprana deja el suelo desnudo durante meses de sol, y el rebrote que buscaba el ganadero no llega hasta que llueve de todos modos.',
  'The Orinoco savanna is a fire ecosystem. Its grasses resprout from the base, its trees have thick bark and its seeds tolerate heat. A plain that never burns accumulates a layer of dead material that, the day it does catch, burns at an intensity that does kill the trees and sterilise the soil.

Traditional management does not burn the whole ranch at once. It burns patches, on different dates, so that by the end of the dry season the landscape is a mosaic: patches burned days ago with tender regrowth, patches one year old, patches two or three. That mosaic is its own network of firebreaks. A fire that escapes runs into a patch burned a month earlier, where there is no fuel, and stops without anyone having to put it out.

The execution details are what make the difference. It is lit in late afternoon or very early, when relative humidity rises and the wind drops. A strip is first burned against the wind — a fire that creeps slowly and cleans the edge — and only then is fire released with the wind. The moriche palm stands, the gallery forests and the creek margins are spared: they are the fauna refuges and the moisture reserves of the plain.

And there is a calendar rule: burn at the end of the dry season, with the first rains close, not at the beginning. An early burn leaves the soil bare through months of sun, and the regrowth the rancher was after does not arrive until it rains anyway.',
  '[{"es":"Quemar parches pequeños en fechas distintas, nunca el predio entero de una vez.","en":"Burn small patches on different dates, never the whole property at once."},{"es":"Encender al final de la tarde o al amanecer, cuando sube la humedad y baja el viento.","en":"Light in late afternoon or at dawn, when humidity rises and wind drops."},{"es":"Abrir primero una franja en contra del viento y solo después soltar el fuego a favor.","en":"First burn a strip against the wind, and only then release the fire with the wind."},{"es":"Dejar por fuera morichales, bosques de galería y bordes de caño: son refugio y reserva de agua.","en":"Leave out moriche stands, gallery forests and creek margins: they are refuge and water reserve."},{"es":"Quemar al final de la sequía, con la lluvia cerca, no al comienzo.","en":"Burn at the end of the dry season, with rain close, not at the start."}]'::jsonb,
  'Un mosaico bien hecho se reconoce desde el satélite: son focos pequeños, repartidos y de corta duración. Una columna grande y sostenida en un solo punto, en cambio, casi siempre significa que el mosaico se dejó de hacer durante años y todo el combustible se acumuló junto.',
  'A well-made mosaic is recognisable from orbit: small hotspots, spread out and short-lived. A large sustained column at a single point, by contrast, almost always means the mosaic was skipped for years and all the fuel piled up together.',
  'Comunidades sikuani y llaneras',
  'Sikuani and llanero communities',
  'Orinoquía — Vichada, Meta, Arauca, Casanare',
  'Sabana natural',
  'Natural savanna',
  'Final de la sequía, antes de las primeras lluvias',
  'End of the dry season, before the first rains',
  ARRAY['sabana', 'Orinoquía', 'quema en mosaico', 'cortafuegos', 'ganadería']::TEXT[],
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Controlled_burn_in_grassland_%285474620598%29.jpg/960px-Controlled_burn_in_grassland_%285474620598%29.jpg',
  'U.S. Fish and Wildlife Service — Northeast Region',
  'Dominio público',
  'https://commons.wikimedia.org/wiki/File:Controlled_burn_in_grassland_(5474620598).jpg',
  'Parques Nacionales Naturales de Colombia',
  'https://www.parquesnacionales.gov.co/'),

('tulpa-fogon-escuela',
  4,
  false,
  'Fogón y Memoria',
  'lectura',
  'La tulpa: tres piedras donde el fuego enseña',
  'The tulpa: three stones where the fire teaches',
  'Antes de ser una herramienta del monte, el fuego es el centro de la casa. Quien aprende a cuidarlo adentro sabe qué hacer con él afuera.',
  'Before it is a tool of the field, fire is the centre of the house. Whoever learns to tend it indoors knows what to do with it outside.',
  'La tulpa son tres piedras dispuestas en triángulo, y sobre ellas la olla. Entre los pueblos nasa y misak —donde la cocina de leña recibe el nombre de nak chak— no es solo el sitio donde se cocina: es donde se conversa, donde se decide, donde se corrige a los hijos y donde los mayores cuentan lo que pasó. Buena parte del conocimiento del territorio se transmite en ese círculo, después de comer, cuando afuera ya está oscuro.

Alrededor de la tulpa se aprenden reglas que después se aplican al monte. El fuego no se deja solo: siempre hay alguien pendiente. Se alimenta con la leña justa, porque una llama más alta no cocina más rápido, solo gasta. Se apaga antes de dormir y se revisan las brasas, no se asume que se apagaron. La ceniza no se bota: se guarda para lavar, para el suelo, para conservar semilla.

Ese entrenamiento no es simbólico. La mayoría de los incendios que empiezan por descuido doméstico —una fogata mal apagada, una colilla, un brasero volcado— vienen de personas que nunca tuvieron a alguien enseñándoles a cuidar un fuego pequeño. La disciplina de la tulpa es exactamente la que falta.

La cocina de leña tiene también su costado difícil: el humo dentro de la casa afecta las vías respiratorias, sobre todo de mujeres y niños que pasan más horas allí. Varias comunidades han cambiado a estufas eficientes que conservan el fogón como lugar de reunión y sacan el humo por un ducto. El saber no se pierde con eso: se le quita la parte que enfermaba.',
  'The tulpa is three stones set in a triangle with the pot on top. Among the Nasa and Misak peoples — where the wood-fire kitchen is called nak chak — it is not merely where cooking happens: it is where people talk, where decisions are made, where children are corrected and where elders tell what happened. A good part of the knowledge of the territory is transmitted in that circle, after eating, once it is dark outside.

Around the tulpa people learn rules that later apply to the field. Fire is never left alone: someone is always watching. It is fed the right amount of wood, because a taller flame does not cook faster, it only spends. It is put out before sleeping and the embers are checked, not assumed dead. Ash is not thrown away: it is kept for washing, for the soil, for storing seed.

That training is not symbolic. Most fires that begin from domestic carelessness — a badly extinguished campfire, a cigarette, an overturned brazier — come from people who never had someone teaching them to tend a small fire. The discipline of the tulpa is exactly what is missing.

The wood-fire kitchen also has its hard side: indoor smoke damages the airways, above all of the women and children who spend the most hours there. Several communities have moved to efficient stoves that keep the hearth as a gathering place and vent the smoke through a duct. Nothing of the knowledge is lost in that: only the part that was making people ill.',
  '[{"es":"No dejar nunca un fuego solo, por pequeño que sea.","en":"Never leave a fire alone, however small."},{"es":"Alimentarlo con la leña justa: la llama alta no cocina más, solo consume más.","en":"Feed it the right amount of wood: a tall flame does not cook more, it only consumes more."},{"es":"Apagar y revisar las brasas antes de dormir; una brasa cubierta dura horas.","en":"Put out and check the embers before sleeping; a covered ember lasts for hours."},{"es":"Guardar la ceniza: sirve para el suelo, para lavar y para conservar semilla.","en":"Keep the ash: it serves the soil, washing and seed storage."},{"es":"Ventilar el humo. El fogón como lugar de reunión se conserva; el humo adentro no.","en":"Vent the smoke. The hearth as a gathering place stays; the indoor smoke does not."}]'::jsonb,
  'Los reportes de la comunidad en esta plataforma cumplen hoy una función parecida a la del fogón: son el lugar donde queda registrado lo que alguien vio. La diferencia es que ahora ese registro puede cruzarse con lo que midió un sensor la misma tarde.',
  'The community reports on this platform now play a role close to the hearth''s: they are where what someone saw gets recorded. The difference is that this record can now be crossed with what a sensor measured that same afternoon.',
  'Pueblos nasa y misak, y comunidades campesinas andinas',
  'Nasa and Misak peoples, and Andean campesino communities',
  'Cauca, Nariño, Huila, Tolima',
  'Andes',
  'Andes',
  'Todo el año, sobre todo de noche',
  'Year-round, above all at night',
  ARRAY['tulpa', 'nak chak', 'fogón', 'transmisión oral', 'nasa', 'misak']::TEXT[],
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Fog%C3%B3n_de_cocina_de_hacienda_Mexicana.jpg/960px-Fog%C3%B3n_de_cocina_de_hacienda_Mexicana.jpg',
  'Encogua (Wikimedia Commons)',
  'CC BY-SA 4.0',
  'https://commons.wikimedia.org/wiki/File:Fog%C3%B3n_de_cocina_de_hacienda_Mexicana.jpg',
  'Consejo Regional Indígena del Cauca (CRIC)',
  'https://www.cric-colombia.org/'),

('donde-nace-el-agua',
  5,
  true,
  'Gobernanza del Territorio',
  'prohibicion',
  'Donde nace el agua no se quema',
  'Where the water is born, nothing is burned',
  'No todo saber sobre el fuego enseña a usarlo. El más repetido en las montañas de Colombia enseña dónde está prohibido.',
  'Not every fire knowledge teaches how to use it. The one most repeated in Colombia''s mountains teaches where it is forbidden.',
  'En la Sierra Nevada de Santa Marta, los cuatro pueblos que la habitan sostienen que las partes altas no son territorio de trabajo sino de cuidado: allí nace el agua que baja hasta el mar, y hay lugares en los que sencillamente no se entra a cortar ni a quemar. La Línea Negra, reconocida por el Estado colombiano, delimita ese conjunto de sitios sagrados. La misma idea aparece, con otras palabras, en comunidades campesinas de páramo por toda la cordillera: donde nace el agua no se toca.

La ecología le da la razón a la prohibición de una forma casi brutal. El frailejón, la planta que define el páramo, crece un centímetro por año y no rebrota después del fuego: un individuo de metro y medio que arde es un siglo perdido. El suelo del páramo es una esponja de materia orgánica que retiene agua y carbono; cuando arde, esa esponja se vuelve una costra que repele el agua, y la lluvia que antes se infiltraba se va por encima llevándose el suelo.

Un páramo quemado no vuelve. Cambia a pajonal, pierde capacidad de regular el caudal, y los acueductos que dependían de él empiezan a alternar entre creciente y sequía. En un país donde el 70 % del agua potable urbana viene de zonas de páramo, la prohibición ancestral protege infraestructura crítica sin haber sido escrita nunca como norma técnica.

Vale la pena decirlo con claridad: la mayoría de los incendios de páramo no son accidentes de montaña. Empiezan más abajo, en la frontera agrícola, y suben. La prohibición no basta si el fuego llega desde donde nadie la aplica.',
  'In the Sierra Nevada de Santa Marta, the four peoples who live there hold that the upper reaches are not a territory for work but for care: that is where the water is born that runs down to the sea, and there are places one simply does not enter to cut or burn. The Línea Negra, recognised by the Colombian state, marks out that set of sacred sites. The same idea appears, in other words, among campesino páramo communities all along the cordillera: where the water is born, nothing is touched.

Ecology backs the prohibition almost brutally. The frailejón, the plant that defines the páramo, grows one centimetre a year and does not resprout after fire: a metre-and-a-half individual that burns is a lost century. The páramo soil is a sponge of organic matter holding water and carbon; when it burns, that sponge becomes a crust that repels water, and rain that used to infiltrate runs off across the surface, taking the soil with it.

A burned páramo does not come back. It shifts to tussock grassland, loses its capacity to regulate flow, and the water systems that depended on it begin alternating between flood and drought. In a country where 70% of urban drinking water comes from páramo areas, the ancestral prohibition protects critical infrastructure without ever having been written as a technical standard.

It is worth saying plainly: most páramo fires are not mountain accidents. They start lower down, at the agricultural frontier, and climb. The prohibition is not enough if the fire arrives from where nobody applies it.',
  '[{"es":"No quemar ni cortar en nacimientos de agua, humedales de altura ni zonas de frailejón.","en":"Do not burn or cut at springs, high wetlands or frailejón stands."},{"es":"Mantener una franja sin quema alrededor de cada nacimiento, aunque el predio sea privado.","en":"Keep an unburned band around every spring, even on private land."},{"es":"Vigilar la frontera agrícola de abajo: casi todo incendio de páramo empieza más abajo y sube.","en":"Watch the agricultural frontier below: almost every páramo fire starts lower and climbs."},{"es":"Tratar la prohibición como acuerdo colectivo, no como decisión de cada finca.","en":"Treat the prohibition as a collective agreement, not a decision made farm by farm."}]'::jsonb,
  'En el archivo del IDEAM 2010–2025 que publica esta plataforma se puede filtrar por ecosistema y ver los focos registrados en páramo. Cada punto de esos representa vegetación que tarda décadas en volver, si vuelve.',
  'In the IDEAM 2010–2025 archive this platform publishes you can filter by ecosystem and see the hotspots recorded in páramo. Every one of those points is vegetation that takes decades to return, if it returns.',
  'Pueblos de la Sierra Nevada (kogui, arhuaco, wiwa, kankuamo) y comunidades de páramo',
  'Peoples of the Sierra Nevada (Kogui, Arhuaco, Wiwa, Kankuamo) and páramo communities',
  'Sierra Nevada de Santa Marta y páramos andinos',
  'Páramo y alta montaña',
  'Páramo and high mountain',
  'Prohibición permanente',
  'Permanent prohibition',
  ARRAY['páramo', 'frailejón', 'Sierra Nevada', 'Línea Negra', 'agua', 'sitios sagrados']::TEXT[],
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/WLE2026_CO_-_Valle_de_frailejones%2C_P%C3%A1ramo_de_Guerrero_%2893%29.jpg/960px-WLE2026_CO_-_Valle_de_frailejones%2C_P%C3%A1ramo_de_Guerrero_%2893%29.jpg',
  'Jedidiahhorne (Wiki Loves Earth Colombia)',
  'CC BY-SA 4.0',
  'https://commons.wikimedia.org/wiki/File:WLE2026_CO_-_Valle_de_frailejones,_P%C3%A1ramo_de_Guerrero_(93).jpg',
  'Instituto Humboldt — ecosistemas de páramo',
  'http://www.humboldt.org.co/'),

('bioindicadores-del-verano',
  6,
  false,
  'Calendario y Señales',
  'lectura',
  'Guayacanes, chicharras y hormigas: los avisos del verano',
  'Guayacanes, cicadas and ants: the warnings of the dry season',
  'Antes de que existiera un índice de riesgo, el territorio ya avisaba. Varios de esos avisos miden, sin instrumentos, exactamente lo mismo que miden los sensores.',
  'Long before any risk index existed, the land was already warning. Several of those warnings measure, without instruments, exactly what the sensors measure.',
  'El guayacán amarillo pierde las hojas y estalla en flor cuando el estrés hídrico llega a cierto punto: un valle con guayacanes encendidos es hermoso y es, al mismo tiempo, la señal de que el bosque seco está en el fondo de su temporada seca. La floración no anuncia la sequía, la confirma, y confirma que el combustible fino ya perdió humedad.

Las chicharras cantan cuando la temperatura del aire sostiene cierto umbral durante varios días; su coro creciente marca el avance del verano mejor que cualquier fecha. Las hormigas trasteando en fila y las culonas saliendo en vuelo responden a la humedad del suelo. El humo de un fogón que en vez de subir se queda pegado y se extiende horizontal indica una atmósfera estable con inversión térmica: el humo de un incendio ese día tampoco se dispersa, y la visibilidad y la calidad del aire se deterioran rápido. Un halo alrededor de la luna anuncia cirros altos, muchas veces el frente que sí trae lluvia.

Ninguna de estas señales es magia y ninguna es infalible por separado. Lo que las hace confiables es que se leen en conjunto, y que cada una integra semanas de condiciones en lugar de una medición puntual. Un sensor le dice qué humedad hay ahora; un guayacán florecido le dice qué ha venido pasando durante seis semanas.

La forma correcta de usarlas hoy es como primer filtro. La señal del territorio dice «pongan atención»; los datos dicen cuánto y dónde exactamente. Descartar las señales porque hay sensores es perder el aviso más barato y más extendido que existe.',
  'The yellow guayacán drops its leaves and bursts into flower when water stress reaches a certain point: a valley of blazing guayacanes is beautiful and is, at the same time, the sign that the dry forest has hit the bottom of its dry season. The flowering does not announce the drought, it confirms it — and confirms that the fine fuels have already lost their moisture.

Cicadas sing once air temperature holds above a threshold for several days; their swelling chorus marks the advance of summer better than any date. Ants moving house in a line and the flying leafcutter queens are responding to soil moisture. Smoke from a hearth that instead of rising hangs and spreads sideways indicates a stable atmosphere with a thermal inversion: smoke from a fire that day will not disperse either, and visibility and air quality degrade fast. A halo around the moon announces high cirrus, often the front that does bring rain.

None of these signs is magic and none is infallible on its own. What makes them reliable is that they are read together, and that each one integrates weeks of conditions rather than a single instant. A sensor tells you what the humidity is now; a flowering guayacán tells you what has been happening for six weeks.

The right way to use them today is as a first filter. The land''s signal says "pay attention"; the data says how much, and exactly where. Discarding the signs because sensors exist means losing the cheapest and most widespread warning system there is.',
  '[{"es":"Floración masiva de guayacán: el bosque seco está en el fondo de la sequía. Combustible fino listo para arder.","en":"Mass guayacán flowering: the dry forest is at the bottom of the drought. Fine fuel ready to burn."},{"es":"Coro sostenido de chicharras: varios días seguidos por encima del umbral de calor.","en":"Sustained cicada chorus: several consecutive days above the heat threshold."},{"es":"Humo que no sube y se extiende horizontal: atmósfera estable, el humo de un incendio no se dispersará.","en":"Smoke that does not rise and spreads sideways: stable atmosphere, fire smoke will not disperse either."},{"es":"Hormigas en fila y vuelos de culonas: cambio brusco en la humedad del suelo.","en":"Ants in line and flying queens: an abrupt change in soil moisture."},{"es":"Leer siempre dos o tres señales juntas; una sola se equivoca.","en":"Always read two or three signs together; one alone gets it wrong."}]'::jsonb,
  'Estas señales y las capas de esta plataforma miden lo mismo por caminos distintos. El NDVI cae por el mismo estrés hídrico que hace florecer al guayacán, y la humedad del suelo que reportan los nodos es la que mueve a las hormigas. Cuando las dos cosas coinciden, la lectura es sólida.',
  'These signs and this platform''s layers measure the same thing by different routes. NDVI falls from the same water stress that makes the guayacán flower, and the soil moisture the nodes report is what moves the ants. When both agree, the reading is solid.',
  'Comunidades campesinas del bosque seco y los valles interandinos',
  'Campesino communities of the dry forest and inter-Andean valleys',
  'Valle del Cauca, Tolima, Huila, Santanderes',
  'Bosque seco tropical',
  'Tropical dry forest',
  'Diciembre a marzo y julio a agosto',
  'December to March and July to August',
  ARRAY['bioindicadores', 'guayacán', 'fenología', 'chicharras', 'bosque seco']::TEXT[],
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=80',
  'Unsplash',
  'Unsplash License',
  'https://unsplash.com/',
  'IDEAM — seguimiento climático nacional',
  'https://www.ideam.gov.co/'),

('barreras-vivas',
  7,
  false,
  'Plantas y Territorio',
  'prevencion',
  'Cercas que no arden: barreras vivas del bosque seco',
  'Fences that do not burn: living barriers of the dry forest',
  'Un cortafuegos de tierra pelada hay que rehacerlo cada año. Uno sembrado con las especies correctas crece solo, da sombra, sostiene el suelo y sigue ahí en diez años.',
  'A bare-earth firebreak must be remade every year. One planted with the right species grows on its own, gives shade, holds the soil and is still there in ten years.',
  'La idea es vieja y sencilla: entre el potrero y el bosque, entre la carretera y el cultivo, se siembra una franja de plantas que no arden con facilidad. Las candidatas del bosque seco colombiano son en su mayoría suculentas o de hoja gruesa y alto contenido de agua: la piñuela (Bromelia), el cardón y la tuna, la sábila, el nacedero, el matarratón. Se les suma el guásimo, que rebrota con fuerza si llega a chamuscarse.

Una barrera viva de tres a cinco metros de ancho hace varias cosas a la vez. Interrumpe la continuidad del combustible fino, que es lo que realmente propaga un incendio de pastos. Da sombra, y bajo su sombra la temperatura del suelo baja varios grados y la humedad se conserva más tiempo. Cierra el dosel y con eso frena a los pastos invasores —braquiaria, jaragua— que son la mecha de la mayoría de los incendios en el bosque seco. Y sostiene el suelo del borde, que es donde primero se erosiona.

Tiene una condición de mantenimiento que suele olvidarse: al pie de la barrera hay que mantener limpio de pasto seco. Una cerca viva con medio metro de paja muerta debajo no detiene nada, porque el fuego pasa por abajo. Media jornada de guadaña antes del verano es la diferencia entre una barrera que funciona y una decorativa.

Comparada con el cortafuego de tierra pelada, la barrera viva cuesta más el primer año y menos todos los siguientes, y a diferencia de aquel no deja una franja de suelo desnudo expuesta al sol y a la lluvia.',
  'The idea is old and simple: between pasture and forest, between road and crop, you plant a strip of plants that do not readily burn. The candidates in the Colombian dry forest are mostly succulents or thick-leaved, high-water-content species: piñuela (Bromelia), cardón and prickly pear, aloe, nacedero, matarratón. Add guásimo, which resprouts strongly if it does get scorched.

A living barrier three to five metres wide does several things at once. It breaks the continuity of the fine fuel, which is what actually carries a grass fire. It casts shade, and under that shade soil temperature drops several degrees and moisture holds longer. It closes the canopy and with that suppresses the invasive grasses — brachiaria, jaragua — that are the fuse of most dry-forest fires. And it holds the edge soil, which is the first to erode.

It comes with one maintenance condition that people tend to forget: the foot of the barrier must be kept clear of dry grass. A living fence with half a metre of dead straw underneath stops nothing, because the fire passes below it. Half a day with a brushcutter before the dry season is the difference between a barrier that works and a decorative one.

Compared to a bare-earth firebreak, the living barrier costs more in year one and less every year after, and unlike it does not leave a strip of naked soil exposed to sun and rain.',
  '[{"es":"Sembrar franjas de 3 a 5 m entre potrero y bosque, y a lo largo de carreteras y linderos.","en":"Plant 3–5 m strips between pasture and forest, and along roads and property lines."},{"es":"Usar especies de alto contenido de agua: piñuela, cardón, tuna, sábila, nacedero, matarratón.","en":"Use high-water-content species: piñuela, cardón, prickly pear, aloe, nacedero, matarratón."},{"es":"Incluir guásimo y otras especies que rebrotan si llegan a chamuscarse.","en":"Include guásimo and other species that resprout if they are scorched."},{"es":"Mantener limpio de pasto seco el pie de la barrera antes de cada verano.","en":"Clear dry grass from the foot of the barrier before every dry season."},{"es":"Sembrar al inicio de las lluvias para que la barrera enfrente su primer verano ya establecida.","en":"Plant at the start of the rains so the barrier meets its first dry season already established."}]'::jsonb,
  'Las barreras vivas se ven en el NDVI: son líneas verdes que persisten cuando todo lo demás alrededor baja. Esa persistencia, año tras año, es la mejor prueba de que el sitio conserva humedad.',
  'Living barriers show up in NDVI: green lines that persist when everything around them drops. That persistence, year after year, is the best evidence the site is holding moisture.',
  'Comunidades campesinas del bosque seco tropical',
  'Campesino communities of the tropical dry forest',
  'Valle del Cauca, Huila, Tolima, Bolívar, La Guajira',
  'Bosque seco tropical',
  'Tropical dry forest',
  'Se siembra al inicio de las lluvias',
  'Planted at the start of the rains',
  ARRAY['cortafuegos', 'barreras vivas', 'bosque seco', 'guásimo', 'cactus', 'restauración']::TEXT[],
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Centinela_del_bosque_seco_Mimus_gilvus_sobre_cactus_card%C3%B3n_en_la_Tatacoa.jpg/960px-Centinela_del_bosque_seco_Mimus_gilvus_sobre_cactus_card%C3%B3n_en_la_Tatacoa.jpg',
  'Johan Andrés Toro (Wikimedia Commons)',
  'CC BY-SA 4.0',
  'https://commons.wikimedia.org/wiki/File:Centinela_del_bosque_seco_Mimus_gilvus_sobre_cactus_card%C3%B3n_en_la_Tatacoa.jpg',
  'CIPAV — sistemas silvopastoriles y cercas vivas',
  'https://cipav.org.co/'),

('minga-guardarrayas',
  8,
  false,
  'Gobernanza del Territorio',
  'prevencion',
  'La minga de guardarrayas: el cortafuego que se hace entre todos',
  'The guardarraya minga: the firebreak everyone builds together',
  'Un cortafuego en una sola finca no sirve de nada. La minga resuelve el problema que ninguna finca puede resolver sola.',
  'A firebreak on a single farm is worth nothing. The minga solves the problem no single farm can solve alone.',
  'La minga es trabajo colectivo con turno: hoy en el predio de uno, mañana en el del vecino, sin dinero de por medio. Aplicada al fuego, la minga de guardarrayas limpia antes del verano las franjas que separan predios, las orillas de carretera, los bordes de quebrada y los caminos. Se hace en dos o tres jornadas, con guadaña, machete y rastrillo.

El punto que hace valiosa la minga es geométrico, no cultural. El fuego no reconoce linderos: un cortafuego impecable en una finca no sirve si el potrero de al lado tiene el pasto hasta la cintura. La protección solo existe si la franja es continua, y una franja continua atraviesa propiedades de gente distinta. Es un problema de coordinación, y la minga es la institución que Colombia rural lleva siglos usando para resolverlo.

Las orillas de carretera merecen atención aparte. Una fracción muy alta de las igniciones no forestales empieza ahí: colillas, chispas de vehículos, vidrio, quemas de basura. Son además las franjas de las que nadie se siente dueño, así que son justamente las que quedan sin limpiar.

La minga produce, además del cortafuego, algo que no se ve: la lista. Quién tiene motobomba, quién tiene tanque, quién vive solo, quién tiene ganado y por dónde se saca, a quién se le avisa primero, cuál es el número que se marca. Esa información no existe en ningún registro oficial y es la que decide qué tan rápido responde una vereda la tarde en que algo se enciende.',
  'The minga is collective work by turns: today on one person''s land, tomorrow on the neighbour''s, with no money involved. Applied to fire, the guardarraya minga clears — before the dry season — the strips between properties, the roadsides, the stream margins and the tracks. It takes two or three working days, with brushcutter, machete and rake.

What makes the minga valuable is geometric, not cultural. Fire does not recognise property lines: an immaculate firebreak on one farm is worthless if the pasture next door is waist-high. Protection only exists if the strip is continuous, and a continuous strip crosses land belonging to different people. It is a coordination problem, and the minga is the institution rural Colombia has used for centuries to solve it.

Roadsides deserve separate attention. A very high share of non-forest ignitions starts there: cigarette butts, sparks from vehicles, glass, burning rubbish. They are also the strips nobody feels they own, which is exactly why they are the ones left uncleared.

Beyond the firebreak, the minga produces something invisible: the list. Who has a pump, who has a tank, who lives alone, who has livestock and by which route it leaves, who gets warned first, which number to call. None of that exists in any official registry, and it is what decides how fast a village responds the afternoon something catches.',
  '[{"es":"Limpiar franjas continuas que atraviesen varios predios, no cortafuegos sueltos por finca.","en":"Clear continuous strips crossing several properties, not isolated per-farm firebreaks."},{"es":"Priorizar orillas de carretera y caminos: ahí empieza buena parte de las igniciones.","en":"Prioritise roadsides and tracks: a large share of ignitions starts there."},{"es":"Hacerlo en las semanas previas al verano, no cuando ya hay humo.","en":"Do it in the weeks before the dry season, not once there is already smoke."},{"es":"Levantar en la misma jornada la lista de recursos y de personas que necesitan apoyo.","en":"Draw up, in the same session, the list of resources and of people who will need help."},{"es":"Acordar el número al que se llama y quién avisa a quién antes de que haga falta.","en":"Agree the number to call and who warns whom before it is needed."}]'::jsonb,
  'Una vereda organizada convierte un reporte en una respuesta. Los reportes ciudadanos de esta plataforma llegan a los brigadistas, pero quien llega primero al sitio casi siempre es el vecino que ya sabía por dónde entrar.',
  'An organised village turns a report into a response. The citizen reports on this platform reach the brigades, but the first to arrive is almost always the neighbour who already knew the way in.',
  'Comunidades campesinas, indígenas y afrodescendientes',
  'Campesino, Indigenous and Afro-descendant communities',
  'Andes, Pacífico y valles interandinos',
  'Transversal',
  'Cross-cutting',
  'Las semanas previas al verano',
  'The weeks before the dry season',
  ARRAY['minga', 'guardarrayas', 'cortafuegos', 'organización comunitaria', 'prevención']::TEXT[],
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Black_Hills_Wash_Prescribed_Burn_%2851975723891%29.jpg/960px-Black_Hills_Wash_Prescribed_Burn_%2851975723891%29.jpg',
  'BLM Arizona',
  'Dominio público',
  'https://commons.wikimedia.org/wiki/File:Black_Hills_Wash_Prescribed_Burn_(51975723891).jpg',
  'UNGRD — gestión del riesgo de desastres',
  'https://portal.gestiondelriesgo.gov.co/'),

('estaciones-wayuu-viento',
  9,
  false,
  'Calendario y Señales',
  'prohibicion',
  'Jouktai: cuando manda el viento, no se enciende',
  'Jouktai: when the wind rules, nothing is lit',
  'El año wayúu se cuenta por estaciones y no por meses. Una de ellas es la del viento, y en ella la regla es simple: no se prende.',
  'The Wayúu year is counted in seasons, not months. One of them belongs to the wind, and in it the rule is simple: do not light.',
  'El pueblo wayúu no organiza el año en doce meses sino en estaciones nombradas por lo que traen: Iiwa, el tiempo de los primeros brotes; Jemial, la transición; Juyapü, asociada a juya, la lluvia; y Jouktai, el tiempo de los vientos secos. Cada estación define qué se siembra, cuándo se mueve el rebaño y a qué jagüey se va por agua.

Para el fuego la estación decisiva es Jouktai. En La Guajira los alisios soplan sostenidos durante meses, y la regla que se repite es que con viento no se enciende: ni para limpiar un lote, ni para hacer carbón, ni para cocinar afuera sin resguardo. No hace falta ninguna teoría para justificarla; basta haber visto una vez lo que hace una chispa con ese viento sobre un suelo cubierto de trupillo y hojarasca.

La ciencia del comportamiento del fuego llegó exactamente a la misma conclusión por otro camino. De las tres variables que gobiernan la velocidad de propagación —combustible, pendiente y viento—, el viento es la que más rápido cambia y la que más multiplica. Duplicar la velocidad del viento no duplica el avance del frente: lo aumenta mucho más, y además lanza pavesas por delante que abren focos nuevos donde ya no hay quién los ataje.

Que la regla venga formulada como estación y no como cifra la hace más útil, no menos: nadie necesita un anemómetro para saber en qué época del año está.',
  'The Wayúu people do not organise the year into twelve months but into seasons named for what they bring: Iiwa, the time of first shoots; Jemial, the transition; Juyapü, associated with juya, the rain; and Jouktai, the time of the dry winds. Each season sets what is sown, when the herd moves and which waterhole to go to.

For fire, the decisive season is Jouktai. In La Guajira the trade winds blow steadily for months, and the rule repeated across the territory is that with wind you do not light: not to clear a plot, not to make charcoal, not to cook outdoors unsheltered. No theory is needed to justify it; it is enough to have seen once what a spark does with that wind over ground covered in trupillo and leaf litter.

Fire behaviour science reached exactly the same conclusion by another route. Of the three variables governing rate of spread — fuel, slope and wind — wind is the one that changes fastest and multiplies most. Doubling wind speed does not double the advance of the front: it increases it far more, and it throws embers ahead that open new fires where there is no longer anyone to stop them.

That the rule is framed as a season rather than a number makes it more useful, not less: nobody needs an anemometer to know what time of year it is.',
  '[{"es":"No encender ningún fuego durante la estación de vientos, ni siquiera controlado.","en":"Light no fire at all during the wind season, not even a controlled one."},{"es":"Si hay que quemar, esperar la calma del amanecer o del final de la tarde.","en":"If a burn is unavoidable, wait for the calm of dawn or late afternoon."},{"es":"Cocinar al aire libre siempre con resguardo y con el fuego confinado en piedra o zanja.","en":"Cook outdoors always with a windbreak and the fire confined in stone or a trench."},{"es":"Contar con que el viento lanza pavesas por delante: el foco nuevo aparece lejos del original.","en":"Expect the wind to throw embers ahead: the new fire appears far from the original."}]'::jsonb,
  'El panel de monitoreo reporta velocidad y dirección del viento en cada nodo, y el Observatorio los superpone con los focos activos. Esa lectura moderna sirve para lo mismo que la estación wayúu: decidir que hoy no es el día.',
  'The monitoring panel reports wind speed and direction at each node, and the Observatory overlays them with active hotspots. That modern reading serves the same purpose as the Wayúu season: deciding that today is not the day.',
  'Pueblo wayúu',
  'Wayúu people',
  'La Guajira',
  'Bosque seco y semidesierto',
  'Dry forest and semi-desert',
  'Jouktai: los meses de vientos alisios',
  'Jouktai: the trade-wind months',
  ARRAY['wayúu', 'La Guajira', 'viento', 'estaciones', 'alisios']::TEXT[],
  'https://upload.wikimedia.org/wikipedia/commons/8/8b/Paisaje_Desierto_Tatacoa_01.jpg',
  'C0MC25 (Wikimedia Commons)',
  'CC BY-SA 4.0',
  'https://commons.wikimedia.org/wiki/File:Paisaje_Desierto_Tatacoa_01.jpg',
  'Ministerio de Cultura — pueblos indígenas de Colombia',
  'https://www.mincultura.gov.co/'),

('ceniza-sin-incendio',
  10,
  false,
  'Plantas y Territorio',
  'prevencion',
  'Ceniza sin incendio: qué hacer con el rastrojo sin quemarlo',
  'Ash without a fire: what to do with crop residue instead of burning it',
  'Quemar el rastrojo se hace por una razón concreta: es rápido y gratis. Las alternativas ancestrales tardan más, y devuelven al suelo lo que el fuego se lleva al aire.',
  'Stubble is burned for a concrete reason: it is fast and free. The ancestral alternatives take longer, and return to the soil what fire sends into the air.',
  'Hay que empezar reconociendo por qué se quema: limpiar un lote a machete y dejar el material picado toma varios días de trabajo, y quemarlo toma una tarde. Cualquier alternativa que ignore esa diferencia no se va a adoptar. Lo que la práctica tradicional aporta es un conjunto de opciones que sí compensan en el mediano plazo.

El repique consiste en picar el rastrojo y dejarlo tendido sobre el suelo como cobertura. Retiene humedad, baja la temperatura del suelo varios grados, impide que el aguacero golpee la tierra desnuda y va liberando nutrientes a medida que se descompone. La abonera apila el material con estiércol y ceniza de fogón en capas y lo voltea cada tanto: en dos o tres meses entrega un abono estable con el nitrógeno todavía adentro.

Y ahí está el punto técnico que casi nunca se menciona. Cuando se quema, el nitrógeno y el azufre de la biomasa se volatilizan: se van al aire y no vuelven. La ceniza que queda aporta potasio, calcio y magnesio, pero es un aporte de una sola vez que la primera lluvia fuerte se lleva ladera abajo, porque el suelo quedó desnudo. Quemar entrega un empujón corto a cambio de una pérdida permanente.

La versión intermedia, para cuando de verdad no hay tiempo, es quemar solo pilas pequeñas y confinadas, con las cenizas incorporadas de inmediato al suelo, y nunca el lote completo al aire libre.',
  'Start by acknowledging why people burn: clearing a plot by machete and leaving the material chopped takes several days of labour, and burning it takes an afternoon. Any alternative that ignores that difference will not be adopted. What traditional practice offers is a set of options that do pay off over the medium term.

Repique means chopping the residue and leaving it spread over the ground as cover. It holds moisture, drops soil temperature several degrees, stops downpours from striking bare earth, and releases nutrients gradually as it decomposes. The abonera piles the material with manure and hearth ash in layers and turns it periodically: in two or three months it yields a stable compost with the nitrogen still in it.

And there is the technical point almost nobody mentions. When you burn, the nitrogen and sulphur in the biomass volatilise: they go into the air and do not come back. The remaining ash supplies potassium, calcium and magnesium, but it is a one-off contribution that the first heavy rain carries downslope, because the soil is bare. Burning trades a short push for a permanent loss.

The middle version, for when there genuinely is no time, is to burn only small confined piles, incorporate the ash into the soil immediately, and never the whole plot in the open.',
  '[{"es":"Repique: picar el rastrojo y dejarlo como cobertura sobre el suelo.","en":"Repique: chop the residue and leave it as ground cover."},{"es":"Abonera en capas con estiércol y ceniza de fogón, volteada cada 15 días.","en":"Layered compost pile with manure and hearth ash, turned every fortnight."},{"es":"Si no hay más remedio, quemar solo pilas pequeñas confinadas, nunca el lote completo.","en":"If unavoidable, burn only small confined piles, never the whole plot."},{"es":"Incorporar la ceniza al suelo el mismo día: al aire libre se la lleva el primer aguacero.","en":"Work the ash into the soil the same day: in the open the first downpour takes it."},{"es":"Nunca dejar el suelo desnudo entre cosecha y siembra.","en":"Never leave the soil bare between harvest and sowing."}]'::jsonb,
  'Los focos que aparecen agrupados, pequeños y en cuadrícula sobre zonas agrícolas en el archivo del IDEAM suelen ser quemas de rastrojo, no incendios forestales. Es la categoría más fácil de reducir, porque tiene alternativa conocida.',
  'Hotspots that appear clustered, small and grid-like over farmland in the IDEAM archive are usually stubble burns, not wildfires. They are the easiest category to reduce, because a known alternative exists.',
  'Comunidades campesinas y pueblos zenú',
  'Campesino communities and Zenú people',
  'Caribe, valles interandinos y altiplanos',
  'Agroecosistemas',
  'Agroecosystems',
  'Entre cosecha y siembra',
  'Between harvest and sowing',
  ARRAY['rastrojo', 'repique', 'compostaje', 'ceniza', 'suelo', 'quema agrícola']::TEXT[],
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80',
  'Unsplash',
  'Unsplash License',
  'https://unsplash.com/',
  'FAO — manejo sostenible de suelos',
  'https://www.fao.org/soils-portal/es/'),

('cuando-el-calendario-se-rompe',
  11,
  false,
  'Manejo del Fuego',
  'lectura',
  'Cuando el calendario se rompe: El Niño y el saber que ya no basta',
  'When the calendar breaks: El Niño and the knowledge that is no longer enough',
  'Una quema que fue segura durante cuarenta años se escapa. No porque el saber fuera falso, sino porque el clima sobre el que se construyó dejó de repetirse.',
  'A burn that was safe for forty years escapes. Not because the knowledge was false, but because the climate it was built on stopped repeating.',
  'Un saber ancestral sobre el fuego es, en el fondo, una regresión hecha a mano: décadas de observación condensadas en una regla corta. «Se quema cuando florece tal árbol y hay lluvia cerca» funciona porque durante generaciones, después de esa floración, efectivamente llovía. La regla no es una creencia; es una estadística guardada en el lenguaje.

El problema es que toda estadística supone que el proceso que la generó sigue siendo el mismo. En los años El Niño, y cada vez más fuera de ellos, ese supuesto se rompe. La lluvia que debía llegar no llega o llega tres semanas tarde. La humedad del suelo arranca la temporada más baja que nunca. El árbol florece a tiempo, la señal se lee correctamente, se enciende como siempre, y esta vez el fuego no se detiene. Los episodios de 2015–2016 y 2023–2024 dejaron esa lección en varias regiones del país.

La conclusión que hay que evitar es la fácil: no es que el saber sirva menos. Es que ya no alcanza solo. La ventaja del conocimiento local sigue siendo enorme y no la reemplaza ningún satélite: qué combustible hay en cada ladera, por dónde sopla el viento a las tres de la tarde en esa quebrada específica, quién vive solo, por dónde se saca el ganado, cuál es la única entrada de vehículo.

Lo que el dato aporta es lo único que la observación local no puede dar: el estado presente del sistema comparado con su propia historia. Qué tan seco está este año frente a los quince anteriores, qué tan bajo está el NDVI, dónde hay focos activos ahora mismo a cincuenta kilómetros. La combinación —el mayor que conoce el terreno y la serie que conoce la anomalía— decide mejor que cualquiera de los dos por separado.',
  'An ancestral fire knowledge is, at bottom, a regression done by hand: decades of observation condensed into a short rule. "Burn when that tree flowers and rain is close" works because for generations, after that flowering, it did in fact rain. The rule is not a belief; it is a statistic stored in language.

The problem is that every statistic assumes the process that generated it is still the same. In El Niño years, and increasingly outside them, that assumption breaks. The rain that should arrive does not, or arrives three weeks late. Soil moisture starts the season lower than ever. The tree flowers on time, the sign is read correctly, the fire is lit as always — and this time it does not stop. The 2015–2016 and 2023–2024 episodes left that lesson across several regions of the country.

The easy conclusion is the one to avoid: it is not that the knowledge is worth less. It is that it no longer suffices alone. The advantage of local knowledge remains enormous and no satellite replaces it: what fuel sits on each slope, which way the wind turns at three in the afternoon in that particular ravine, who lives alone, where the cattle are driven out, which is the only vehicle access.

What data adds is the one thing local observation cannot give: the present state of the system compared against its own history. How dry this year is against the previous fifteen, how low NDVI has fallen, where there are active hotspots right now fifty kilometres away. The combination — the elder who knows the terrain and the series that knows the anomaly — decides better than either one alone.',
  '[{"es":"Tratar la señal tradicional como condición necesaria, no suficiente: si la señal dice sí, todavía falta verificar.","en":"Treat the traditional sign as necessary but not sufficient: if the sign says yes, verification is still pending."},{"es":"En año El Niño, correr toda la ventana de quema o suspenderla del todo.","en":"In an El Niño year, shift the whole burning window or suspend it entirely."},{"es":"Comparar la sequía de este año contra la serie histórica, no contra el recuerdo del año pasado.","en":"Compare this year''s drought against the historical series, not against last year''s memory."},{"es":"Registrar por escrito cada vez que la señal falla: eso es lo que corrige la regla para la generación siguiente.","en":"Write down every time the sign fails: that is what corrects the rule for the next generation."}]'::jsonb,
  'El archivo del IDEAM 2010–2025 publicado en esta plataforma cubre catorce años y varios ciclos El Niño. Ahí se ve, para cada región, cuáles fueron los años anómalos y con cuánta anticipación empezaron los focos: es la memoria estadística que complementa la memoria oral.',
  'The IDEAM 2010–2025 archive published on this platform spans fourteen years and several El Niño cycles. It shows, region by region, which years were anomalous and how much earlier the hotspots began: the statistical memory that complements the oral one.',
  'Todo el país',
  'The whole country',
  'Colombia',
  'Transversal',
  'Cross-cutting',
  'Años El Niño',
  'El Niño years',
  ARRAY['El Niño', 'cambio climático', 'ventana de quema', 'IDEAM', 'anomalía']::TEXT[],
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Black_Hills_Wash_Prescribed_Burn_%2851976004024%29.jpg/960px-Black_Hills_Wash_Prescribed_Burn_%2851976004024%29.jpg',
  'BLM Arizona',
  'Dominio público',
  'https://commons.wikimedia.org/wiki/File:Black_Hills_Wash_Prescribed_Burn_(51976004024).jpg',
  'IDEAM — El Niño y seguimiento de incendios de la cobertura vegetal',
  'https://www.ideam.gov.co/'),

('camellones-zenues',
  12,
  false,
  'Plantas y Territorio',
  'prevencion',
  'Camellones zenúes: manejar el agua para no depender del fuego',
  'Zenú raised fields: managing water so you do not depend on fire',
  'Dos mil años antes de que existiera el concepto de adaptación climática, el pueblo zenú construyó un sistema para repartir el agua de la inundación en cientos de miles de hectáreas.',
  'Two thousand years before anyone spoke of climate adaptation, the Zenú people built a system to spread floodwater across hundreds of thousands of hectares.',
  'En las llanuras inundables del San Jorge, el Sinú y la depresión momposina se conserva, visible desde el aire, una obra hidráulica de escala continental: cientos de miles de hectáreas de camellones y canales construidos por el pueblo zenú a lo largo de unos dos milenios. Los canales, dispuestos en espina de pescado sobre los caños naturales, recibían la creciente anual y la repartían; los camellones —lomas de tierra elevadas entre canal y canal— quedaban por encima del agua y se cultivaban.

El sistema resolvía dos problemas opuestos con la misma obra. En invierno frenaba la inundación repartiéndola en lugar de dejar que arrasara. En verano, los canales llenos mantenían húmedo el paisaje entero, y esa humedad de fondo es exactamente la condición que hace que un incendio no prospere. Nadie construyó los camellones pensando en el fuego, y sin embargo son una de las obras de prevención de incendios más grandes que existen en el país.

Lo que vino después va en la dirección contraria. Buena parte de esas llanuras se drenaron para ganadería, los caños se taponaron y el ciclo de inundación se interrumpió. Un humedal drenado se seca en verano, acumula biomasa muerta y arde; y la turba de sus suelos, cuando se enciende, arde por debajo durante semanas y es casi imposible de apagar con agua superficial.

De aquí sale el principio más profundo del manejo tradicional del fuego, y el que menos parece hablar de fuego: la prevención empieza por el agua. Un paisaje que conserva su humedad no necesita que nadie lo defienda de las llamas.',
  'Across the floodplains of the San Jorge, the Sinú and the Mompós depression there survives, visible from the air, a hydraulic work of continental scale: hundreds of thousands of hectares of raised fields and canals built by the Zenú people over some two millennia. The canals, laid out herringbone-fashion off the natural creeks, took the annual flood and spread it; the raised fields — ridges of earth between canal and canal — stayed above the water and were cultivated.

The system solved two opposite problems with the same work. In the wet season it slowed the flood by distributing it rather than letting it scour. In the dry season, the full canals kept the whole landscape humid, and that background moisture is precisely the condition under which a fire fails to prosper. Nobody built the raised fields thinking about fire, and yet they are one of the largest fire-prevention works in the country.

What came afterwards runs the other way. Much of those plains was drained for cattle, the creeks were plugged and the flood cycle was interrupted. A drained wetland dries out in summer, accumulates dead biomass and burns; and the peat in its soils, once alight, burns underground for weeks and is nearly impossible to put out with surface water.

From this comes the deepest principle of traditional fire management, and the one that least sounds like it is about fire: prevention begins with water. A landscape that keeps its moisture does not need anyone to defend it from the flames.',
  '[{"es":"No drenar humedales ni taponar caños: un humedal seco es combustible, no tierra ganada.","en":"Do not drain wetlands or plug creeks: a dry wetland is fuel, not land gained."},{"es":"Conservar y reabrir los canales que reparten la creciente anual.","en":"Keep and reopen the canals that distribute the annual flood."},{"es":"Sembrar sobre camellón elevado en vez de secar el terreno completo.","en":"Plant on raised ridges instead of drying out the whole field."},{"es":"Tratar la humedad del paisaje como la primera línea de prevención, antes que cualquier cortafuego.","en":"Treat landscape moisture as the first line of prevention, ahead of any firebreak."},{"es":"Reconocer el riesgo particular del suelo de turba: arde por debajo y no se apaga desde arriba.","en":"Recognise the particular risk of peat soils: they burn below and are not put out from above."}]'::jsonb,
  'La humedad del suelo es una de las variables que reportan los nodos y una de las capas del Observatorio. Los sectores donde se mantiene alta durante el verano son, casi sin excepción, los que no aparecen en el mapa de focos.',
  'Soil moisture is one of the variables the nodes report and one of the Observatory layers. The sectors where it stays high through the dry season are, almost without exception, the ones absent from the hotspot map.',
  'Pueblo zenú',
  'Zenú people',
  'Depresión momposina, San Jorge y Sinú',
  'Llanura inundable',
  'Floodplain',
  'Ciclo anual de inundación',
  'Annual flood cycle',
  ARRAY['zenú', 'camellones', 'humedales', 'agua', 'turba', 'adaptación']::TEXT[],
  'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&q=80',
  'Unsplash',
  'Unsplash License',
  'https://unsplash.com/',
  'Instituto Colombiano de Antropología e Historia (ICANH)',
  'https://www.icanh.gov.co/')

ON CONFLICT (slug) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  featured = EXCLUDED.featured,
  category = EXCLUDED.category,
  fire_role = EXCLUDED.fire_role,
  title = EXCLUDED.title,
  title_en = EXCLUDED.title_en,
  summary = EXCLUDED.summary,
  summary_en = EXCLUDED.summary_en,
  content = EXCLUDED.content,
  content_en = EXCLUDED.content_en,
  practices = EXCLUDED.practices,
  today = EXCLUDED.today,
  today_en = EXCLUDED.today_en,
  people = EXCLUDED.people,
  people_en = EXCLUDED.people_en,
  region = EXCLUDED.region,
  ecosystem = EXCLUDED.ecosystem,
  ecosystem_en = EXCLUDED.ecosystem_en,
  season = EXCLUDED.season,
  season_en = EXCLUDED.season_en,
  tags = EXCLUDED.tags,
  image_url = EXCLUDED.image_url,
  image_credit = EXCLUDED.image_credit,
  image_license = EXCLUDED.image_license,
  image_source_url = EXCLUDED.image_source_url,
  source_name = EXCLUDED.source_name,
  source_url = EXCLUDED.source_url,
  updated_at = now();
