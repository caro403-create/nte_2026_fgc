/**
 * Capa pedagógica del Observatorio — contenido en inglés.
 *
 * Espeja `glossary.js` campo por campo, indexado por el mismo `id`. Los
 * componentes eligen cuerpo según el idioma; si un id faltara aquí, se muestra
 * el español y nada se rompe.
 *
 * Traducido a mano, no por motor: el vocabulario del IDEAM y del IAvH no tiene
 * equivalentes automáticos fiables. Dos decisiones que conviene conocer:
 *
 *   · «páramo» se deja sin traducir. Es el término estándar en literatura
 *     científica en inglés, y «high-altitude wetland» pierde el significado.
 *   · Los nombres de bioma del IAvH (Zonobioma, Orobioma, Pedobioma) se
 *     conservan: son nomenclatura de la clasificación, no palabras comunes.
 */

export const GLOSSARY_CATEGORIES_EN = {
  medicion: 'What is being measured',
  biomas: 'Biomes and ecosystems (IAvH)',
  clima: 'Climate',
  terreno: 'Landscape and landform',
  metodo: 'How the dashboard works'
};

export const GLOSSARY_EN = {
  /* ---------------- What is being measured ---------------- */
  'foco-de-calor': {
    term: 'Thermal hotspot',
    short: 'A pixel the satellite saw hotter than a threshold. It is a detection, not a confirmed fire.',
    long: `Satellite sensors detect infrared energy and flag as a "hotspot" every pixel whose temperature exceeds a threshold. That is all the data guarantees: that there was anomalous heat in that pixel, on that satellite pass.

It does not guarantee there was a fire. A controlled agricultural burn, a kiln, sugarcane burning or a gas-well flare all produce hotspots. Nor does it guarantee that everything which burned was detected: if the satellite passed at night, under cloud, or if the fire was small and short-lived, no record remains.`
  },
  'incendio': {
    term: 'Vegetation fire',
    short: 'The real fire event, with a duration and an area affected. Not the same thing as a thermal hotspot.',
    long: `A vegetation fire is an event: it starts, it lasts, it advances over an area and it goes out. It is measured in hectares and in time.

Its relationship with [[foco-de-calor|thermal hotspots]] is not one-to-one in either direction. One large, prolonged fire can generate dozens of hotspots across several satellite passes; and many hotspots correspond to no fire at all, but to deliberate agricultural burning.

That is why this dashboard never says "fires": it says hotspots, reports or detections.`
  },
  'unidad-de-analisis': {
    term: 'Reporting frequency, not hectares',
    short: 'Every count on this dashboard is "how many times fire was reported", never area burned.',
    long: `The IDEAM archive behind this dashboard carries no area affected. No column says hectares.

The practical consequence is that doubling the number of hotspots does not mean doubling the damage. A half-hectare burn in a pasture produces one hotspot just as a five-hundred-hectare forest fire does. A municipality can top the ranking by accumulating many small, repeated burns.

When you compare two figures on this dashboard, the right question is "how many times was fire reported here?", not "how much burned here?".`
  },

  /* ---------------- Biomes and ecosystems ---------------- */
  'zonobioma': {
    term: 'Zonobioma',
    short: 'A set of ecosystems whose distribution is governed by the climate of the latitudinal belt they sit in.',
    long: `In the IAvH biome classification, a zonobioma groups ecosystems defined by zonal climate: the temperature and rainfall that correspond to that latitude, at sea level.

In this archive the most frequent is the Humid Tropical Zonobioma — the warm, rainy lowlands. It is the starting point of the classification: the other types — [[orobioma]], [[pedobioma]], [[helobioma]] — name the exceptions to that pattern.`
  },
  'orobioma': {
    term: 'Orobioma',
    short: 'A biome whose distribution is governed by altitude rather than latitude: the mountain gradient.',
    long: `Climbing a mountain changes the climate as if you were moving towards the poles: temperature falls and vegetation changes. An orobioma is the biome that results from that altitudinal gradient.

In the Colombian Andes the sequence runs from sub-Andean forest to Andean, then high-Andean and finally [[paramo|páramo]] and snow. When the archive says "Orobioma of the Humid Tropical Zonobioma" it is saying: this is the mountain version of the humid tropical biome.`
  },
  'pedobioma': {
    term: 'Pedobioma',
    short: 'A biome defined by the soil — drainage, salinity, texture — rather than by the general climate.',
    long: `There are places where the soil matters more than the climate. A sandy flat, a saline soil or permanently waterlogged ground support vegetation that does not match what the climate of that area would predict.

The IAvH calls these units pedobiomas. Hence labels such as "Pedobioma of the Humid Tropical Zonobioma": the climate is humid tropical, but what defines the ecosystem is the soil.`
  },
  'helobioma': {
    term: 'Helobioma',
    short: 'A pedobioma of floodable land: wetlands, seasonally flooded savannas, river overflow plains.',
    long: `A helobioma is a [[pedobioma]] whose defining feature is excess water: ground that floods seasonally or permanently.

In this archive they appear mainly in the Orinoco region and the lower Magdalena and Cauca valleys — the flooded savannas where seasonal pasture burning is a very widespread management practice.`
  },
  'alternohigrico': {
    term: 'Alternohygric zonobioma',
    short: 'A zonobioma with a marked dry season alternating with a wet one. Dry forest and savanna.',
    long: `"Alternohygric" means the humidity alternates: there is a defined dry season and a rainy one, instead of rain spread through the year.

It corresponds to tropical dry forest and to the savannas of the Caribbean and the Orinoco. It is the biome most associated with seasonal fire in the country: the vegetation dries out predictably every year and becomes available to burn.`
  },
  'azonal': {
    term: 'Azonal',
    short: 'A unit that departs from the climatic pattern of its zone because of local rock, soil or water conditions.',
    long: `When the archive says "Azonal Orobioma", it flags a mountain unit that does not follow the pattern expected for its altitude and latitude, because something local — the rock substrate, a wind regime, the rain shadow of a range — imposes different conditions.

The dry inter-Andean enclaves, such as the Chicamocha canyon or the Tatacoa, are the classic example.`
  },
  'ecosistema-de-sintesis': {
    term: 'Synthesis ecosystem',
    short: 'The summarised level of the IAvH ecosystem map: it groups hundreds of units into a few comparable classes.',
    long: `The IAvH ecosystem map has an enormous level of detail, with hundreds of units whose names include biome, region and land cover. Working with that directly is unmanageable.

The "synthesis ecosystem" is the aggregation into a handful of comparable classes: forest, savanna, grassland, shrubland, páramo, agroecosystem, secondary vegetation, and a few more. It is the column this dashboard uses for the ecological profile and for the ecosystem filter.

The gain is comparability; the cost is that regional detail is lost.`
  },
  'agroecosistema': {
    term: 'Agroecosystem',
    short: 'Land already given over to farming. It is transformed cover, not natural vegetation.',
    long: `Crops, grazing pasture, mosaics of plots. An agroecosystem is not a degraded natural ecosystem: it is land in productive use.

It is by far the most frequent class in this archive, and that is the dashboard's most important signal: most of the fire recorded in Colombia happens on land that was already modified, mostly through agricultural management burning.

That it is deliberate does not make it harmless. Management burns are the main ignition source that later escapes into natural vegetation.`
  },
  'vegetacion-secundaria': {
    term: 'Secondary vegetation',
    short: 'What grows back after the original vegetation was removed. A sign of a cycle of disturbance.',
    long: `When a forest is cleared and the land is then abandoned, vegetation returns — but not the same vegetation: scrub or a young forest of different composition grows instead.

In a fire context it matters because it usually indicates a cycle: burn, abandon, regrow, burn again. An area classified as secondary vegetation that also appears in the recurrence table is exactly that pattern.`
  },
  'paramo': {
    term: 'Páramo',
    short: 'Tropical high-mountain ecosystem above the high-Andean forest. It regulates the country’s water.',
    long: `Páramo extends above the high-Andean treeline, roughly from 3,000–3,200 m. Colombia holds close to half of the world's páramo.

Its soil, made of highly porous organic matter, retains and releases water steadily: much of the drinking water of the Andean cities is born there.

It is an ecosystem not adapted to fire. Frailejones and the organic soil take decades to recover, and the water-retention capacity is lost during that time. That is why a hotspot in páramo is not equivalent to a hotspot in a pasture, even though on the chart they occupy the same unit.

The word is kept in Spanish because it is the standard term in English scientific literature: no English equivalent carries the same meaning.`
  },
  'subxerofitia': {
    term: 'Sub-xerophytic vegetation',
    short: 'Vegetation of dry but not desert areas, with a seasonal water deficit. Shrubby and thorny.',
    long: `Vegetation adapted to water scarcity for part of the year: small or absent leaves, thorns, shrubby habit. It sits halfway between dry forest and full [[xerofitia|xerophytic vegetation]].

In Colombia it appears in the dry inter-Andean enclaves and in parts of the Caribbean. It burns easily in the dry season, and recovers slowly because water limits regrowth.`
  },
  'xerofitia': {
    term: 'Xerophytic vegetation',
    short: 'Vegetation of arid areas, with a water deficit for almost the whole year.',
    long: `The dry end of the gradient: cactus stands, sparse vegetation over bare soil. In Colombia it corresponds mainly to La Guajira and the most arid enclaves of the Magdalena valley.`
  },
  'zona-pantanosa': {
    term: 'Marshland',
    short: 'Ground with standing water or prolonged waterlogging, and vegetation adapted to that condition.',
    long: `Inland wetlands: marshes, oxbow lakes, floodplains with aquatic and semi-aquatic vegetation.

They count as a [[ecosistemas-sensibles|sensitive ecosystem]] on this dashboard because burning them — usually to gain grazing ground in summer — destroys their flood-buffering function and the habitat of aquatic wildlife.`
  },
  'ecosistemas-sensibles': {
    term: 'Sensitive ecosystems',
    short: 'On this dashboard: páramo, forest, wetland and glacier. High conservation value and poor recovery after fire.',
    long: `The dashboard marks in purple, and groups under the "sensitive only" shortcut, four types: [[paramo|páramo]], forest (including fragmented forest), wetland or [[zona-pantanosa|marshland]], and glaciers and snowfields.

The criterion is twofold: high conservation value and low capacity to recover after fire. None of the four is adapted to burning repeatedly, unlike savanna or grassland, which do have an evolutionary history with fire.

This is an operational definition of this dashboard, not an official IAvH category.`
  },
  'zonas-intervenidas': {
    term: 'Modified land',
    short: 'Cover already transformed by people: agroecosystem, secondary vegetation, built-up land and transformed transitional.',
    long: `The dashboard derives this indicator from the synthesis ecosystem, grouping four classes: [[agroecosistema|agroecosystem]], [[vegetacion-secundaria|secondary vegetation]], built-up land (urban areas and infrastructure) and transformed transitional.

It is not a column of the original archive: it is a category built here, and that is why it is declared in the methodological notes.`
  },

  /* ---------------- Climate ---------------- */
  'piso-termico': {
    term: 'Thermal floor',
    short: 'An altitude belt defined by mean temperature: warm, temperate, cold, very cold, snowline.',
    long: `In the tropics temperature depends mostly on altitude, so altitudinal belts work like distinct climates stacked at the same latitude.

Approximately: warm up to ~1,000 m, temperate up to ~2,000 m, cold up to ~3,000 m, very cold up to the snowline, and snowline above that.

In the archive the thermal floor comes combined with the humidity regime, hence labels such as "Warm Semi-arid" or "Very cold Super-humid".`
  },
  'regimen-de-humedad': {
    term: 'Humidity regime',
    short: 'The second half of the climate label: arid, semi-arid, semi-humid, humid or super-humid.',
    long: `It classifies the balance between the rain that falls and the water that evaporates. It runs from arid — where evaporation far exceeds rainfall — to super-humid, where rainfall greatly exceeds evaporation.

For fire it is the more informative half of the label: fire is associated more with a humidity deficit than with absolute temperature. Semi-arid classes concentrate a share of hotspots far above what their extent would warrant.

Important: it describes the usual climate of the site, not the weather on the day it burned.`
  },

  /* ---------------- Landscape and landform ---------------- */
  'paisaje': {
    term: 'Landscape',
    short: 'The coarse unit of terrain: mountain, hills, piedmont, plain, high plateau, valley.',
    long: `In geomorphological classification, landscape is the top level: it describes the general shape of the terrain, before going into the detail of the [[relieve|landform]].

On this dashboard it is used as a proxy for operational difficulty: putting out a fire in mountain landscape means arriving on foot, with no vehicle access and on slopes that make the work dangerous.`
  },
  'relieve': {
    term: 'Landform',
    short: 'The specific shape of the terrain within the landscape: ridges, crests, terraces, alluvial fans.',
    long: `This is the level of detail that follows [[paisaje|landscape]]. Where the landscape says "mountain", the landform specifies whether it is [[filas-y-vigas|ridges and spurs]], [[crestas-y-espinazos|crests and hogbacks]] or Andean summits.

It determines the slope, the exposure to sun and wind, and therefore how fire spreads and how hard it is to contain.`
  },
  'filas-y-vigas': {
    term: 'Ridges and spurs',
    short: 'Mountain landform with long, narrow crests separated by long, steep slopes.',
    long: `The "ridges" are the summit lines, narrow and continuous; the "spurs" are the long, steep hillsides that descend from them.

It is the most common landform of the Colombian ranges and the second most frequent in this archive. For firefighting it is the worst case: slope accelerates uphill spread, there are no roads, and crews work on unstable ground.`
  },
  'crestas-y-espinazos': {
    term: 'Crests and hogbacks',
    short: 'Landform of folded rock: steep crests and hogbacks with asymmetric slopes.',
    long: `It appears where rock layers were folded and tilted. Erosion leaves the hard layers standing proud: if the dip is steep, symmetrical crests form; if it is moderate, hogbacks with one gentle and one abrupt slope.

Typical of the Eastern range. The asymmetry matters for fire, because the two faces receive sun and wind very differently.`
  },
  'lomerio': {
    term: 'Hills',
    short: 'Landscape of low, rolling hills, between mountain and plain.',
    long: `Gentle relief, of low relative height and moderate slopes. In this archive it is the third most frequent landscape, above all in the Caribbean, the Llanos and the inter-Andean valleys.

It is extensive grazing country, and a good share of the hotspots it records correspond to pasture burning.`
  },
  'piedemonte': {
    term: 'Piedmont',
    short: 'The transition belt between mountain and plain, formed by fan-shaped deposits.',
    long: `When rivers leave the mountains they lose force and drop the material they carry, forming fans that overlap at the foot of the range.

The Llanos piedmont — the eastern edge of the Eastern range — is one of the areas of greatest fire activity in the country: it concentrates the agricultural frontier, cattle ranching and a marked dry season.`
  },
  'altiplanicie': {
    term: 'High plateau',
    short: 'A relatively flat surface at high altitude, such as the Bogotá savanna or the Nariño plateau.',
    long: `Elevated plains, generally of lacustrine origin: former lakes that filled with sediment and then dried out.

They concentrate population, intensive agriculture and, in the case of the Bogotá savanna, the most marked recurrent cluster in the whole archive.`
  },
  'planicie-aluvial': {
    term: 'Alluvial plain',
    short: 'Flat ground built by the sediments a river deposits over time.',
    long: `It includes the floodplain — the strip the river occupies in floods — and the terraces, older levels the river has since abandoned.

These are fertile soils, heavily used in agriculture, and in the dry season they concentrate land-preparation burning.`
  },

  /* ---------------- How the dashboard works ---------------- */
  'celda': {
    term: 'Cell of ~500 m',
    short: 'Coordinates come rounded to ~0.005°, so each point on the map is a cell, not a property.',
    long: `The archive delivers coordinates rounded to intervals of about 0.005 degrees, which in Colombia is roughly 500 metres. It is the footprint of the source satellite grid.

Two consequences. First: a point on the map does not mark a farm or a hamlet, but a square half a kilometre on a side. Second: different hotspots falling in the same square share an exact coordinate — and that is precisely what makes the [[recurrencia|recurrent points]] table possible.`
  },
  'recurrencia': {
    term: 'Recurrence',
    short: 'Coordinates where the archive records fire in two or more different years.',
    long: `The dashboard groups hotspots by exact coordinate and counts how many different years each one appears in. Those appearing in two or more years are "recurrent points": 406 in the full archive.

They are the natural candidates for preventive work, because the pattern suggests a repeating cause — a management practice, a land use — rather than an accident.

With the usual caveat: "the same point" means the same [[celda|~500 m cell]], and the cells with the most years tend to coincide with the areas where data capture was most consistent.`
  },
  'cobertura-temporal': {
    term: 'Uneven temporal coverage',
    short: 'Capture is not even across years: 2012–2017, 2019 and 2025 are dense; 2011 has no records at all.',
    long: `This is the archive's most important bias and the one that most easily leads to false conclusions.

The dense years — 2012 to 2017, 2019 and 2025 — hold almost all the records. Other years have only a handful, and 2011 has none. The year strip in the filter shows this explicitly: a solid bar for dense capture, hatched for partial, a dotted box for years with no capture.

The consequence: you cannot read a temporal trend from this archive. If 2015 has more hotspots than 2021, that almost certainly says more was captured in 2015, not that more burned.`
  },
  'region-natural': {
    term: 'Natural region',
    short: 'The country’s major regions. The archive does not carry them: the dashboard assigns them by department.',
    long: `Andean, Caribbean, Orinoco, Amazon and Pacific. It is the partition seasonality is read with, because rainfall regimes differ radically between them.

The IDEAM archive includes no region column, so the dashboard derives it from the department. That introduces a known error: departments split between two regions — Antioquia between Andean and Caribbean, Meta between Orinoco and Amazon — are counted whole in a single one.

"Other" groups the Pacific (Chocó) and the records with no department assigned.`
  },
  'bimodalidad': {
    term: 'Bimodal regime',
    short: 'Two rainy seasons a year, and therefore two dry seasons. Characteristic of the Andean region.',
    long: `Because of the passage of the intertropical convergence zone, much of the Andean region receives two rainfall peaks a year, around April and around October, with two dry periods in between: December–March and July–August.

The Llanos, by contrast, have a monomodal regime: a single rainy season and a single dry season, from December to March.

That is where the dashboard's central finding comes from. The first hotspot peak (January–March) is contributed by every region at once. The second (July–September) is almost exclusively Andean, because it is the only region with a second dry season.`
  }
};

/**
 * Guías de tarjeta en inglés. Mismos ids y mismos cuatro campos que
 * CARD_GUIDES. `watch` puede ser función cuando lleva cifras vivas.
 */
export const CARD_GUIDES_EN = {
  'kpi-focos': {
    title: 'Fire hotspots',
    what: 'How many records in the IDEAM archive match the filters you have set.',
    how: 'It is a count of satellite detections. The sparkline beside it spreads those same hotspots between January and December, so you can see at once which part of the year they fall in.',
    watch: 'A [[foco-de-calor|thermal hotspot]] is not a [[incendio|vegetation fire]], and the count is not area burned: the archive carries no hectares. A half-hectare agricultural burn produces one hotspot just as a five-hundred-hectare forest fire does. Doubling the hotspots does not mean doubling the damage.',
    plain: 'Satellite fire detections — not wildfires, and not hectares.'
  },
  'kpi-territorio': {
    title: 'Territorial spread',
    what: 'How many distinct departments and municipalities appear in the filtered subset.',
    how: 'It measures how spread out the fire is, not how severe it is. The sparkline compares the eight departments with the most hotspots.',
    watch: 'That a department appears says nothing about what proportion of its territory burned. Municipalities are counted together with their department, because some names repeat across several departments in the country.',
    plain: 'How many distinct departments and municipalities recorded at least one hotspot.'
  },
  'kpi-intervenidas': {
    title: 'Hotspots on modified land',
    what: 'What share of the filtered hotspots fell on cover already transformed by human activity.',
    how: 'It is derived from the [[ecosistema-de-sintesis|synthesis ecosystem]], grouping [[agroecosistema|agroecosystem]], [[vegetacion-secundaria|secondary vegetation]], built-up land and transformed transitional.',
    watch: 'A high percentage points to agricultural management burning rather than ecological catastrophe — but that does not make it harmless. Management burns are the main ignition source that later escapes into natural vegetation.',
    plain: 'How much of the fire fell on land that was already modified.'
  },
  'kpi-dificultad': {
    title: 'Operational difficulty',
    what: 'What share of the filtered hotspots occurred on mountain [[paisaje|landscape]].',
    how: 'It is used as a proxy for how hard it is to get there: in the mountains suppression is done on foot, with no vehicle access and on dangerous slopes.',
    watch: 'It is a coarse proxy. Landscape describes the shape of the terrain, not the real distance to a road, to water or to a fire station. A hotspot in the mountains near a road is easier to attend than one on a plain forty kilometres from the nearest track.',
    plain: 'How much of the fire fell in the mountains, where putting it out costs far more.'
  },
  'kpi-pico': {
    title: 'Seasonal peak',
    what: 'The month that concentrates the most hotspots within the filtered subset.',
    how: 'The sparkline shows all twelve months and marks that peak in green.',
    watch: 'If you have months filtered, the peak can only fall among the ones you left selected. And since [[cobertura-temporal|capture is uneven across years]], a peak may be telling you when more was measured, not when more burned.',
    plain: 'The month with the most hotspots under the active filters.'
  },
  'mapa': {
    title: 'Hotspot map',
    what: 'Where the filtered hotspots fell, in three readings: grouped into clusters, as continuous density, or only those that fell in [[ecosistemas-sensibles|sensitive ecosystems]].',
    how: 'Clusters group nearby hotspots and their colour follows the intensity scale, with the thresholds published in the legend. On the sensitive layer the colour changes meaning: it indicates the ecosystem type, and each cluster takes the most irreplaceable type it contains. Clicking a point filters the whole dashboard by that department; Ctrl or ⌘ plus wheel zooms.',
    watch: 'Each point is a [[celda|~500 m cell]], not a property, and the counts are numbers of reports, not hectares. Several hotspots falling in the same cell stack on a single coordinate, so the visual density understates the real concentration. The density layer uses a square-root scale, because on a linear scale one single cell of the Bogotá savanna flattens the rest of the country; and its intensity is normalised against the real maximum of the filtered subset, not against a fixed value, so the colour is not comparable between different filters.',
    plain: 'Where the fire fell. Each point is a half-kilometre cell, not a farm.'
  },
  'estacionalidad': {
    title: 'Seasonality by natural region',
    what: 'Which months of the year concentrate fire in each [[region-natural|natural region]], computed over the full archive and not over the filters.',
    how: 'Each panel shows the share of that region’s hotspots falling in each month, and all four use the same scale, so both the shape of the season and the heights can be compared. The two dry-season quarters are shaded.',
    watch: 'Each region’s curve adds up to 100% on its own, so the panels compare the shape of the season, not how much each region burns — that is the n in each title. Regions are assigned by department, so departments split between two regions are counted whole in a single one.',
    plain: 'When each region burns. The Andean region has two seasons a year; the rest have one.'
  },
  'departamentos': {
    title: 'Department ranking',
    what: 'How many of the filtered hotspots correspond to each department.',
    how: 'Sorted from most to least. The shade follows magnitude, not rank, so two departments with similar figures look similar. Clicking a bar filters the whole dashboard.',
    watch: 'It is an absolute count, not a density. Large departments appear at the top partly because of size. To compare properly you would need to divide by area or by vegetation cover, and the archive carries neither.',
    plain: 'Which departments accumulate the most hotspots — in total, not per square kilometre.'
  },
  'municipios': {
    title: 'Most affected municipalities',
    what: 'The twenty municipalities with the most hotspots within the filtered subset.',
    how: 'Each row carries municipality and department, because some municipality names repeat across departments.',
    watch: 'The archive’s municipality field is not reliable at record level: in half of the municipalities with 30 or more hotspots, fewer than 12% of their points fall within 20 km of the centre of their own cloud. Use this ranking as a guide, not as an exact municipal count — the department is consistent with the coordinates. Names also come without accents in the archive and only title case is restored here; and as in the department ranking, a municipality may top the list for having more surface or better data coverage, not for burning more.',
    plain: 'The municipalities most often reported with fire. Take it as a guide: the archive’s municipality is not reliable record by record.'
  },
  'perfil-eco': {
    title: 'Ecological profile of the damage',
    what: 'How many hotspots occurred in each ecosystem type, according to the [[ecosistema-de-sintesis|IAvH synthesis classification]].',
    how: 'Bars are ordered by frequency and the purple ones mark [[ecosistemas-sensibles|high conservation value ecosystems]]. [[agroecosistema|Agroecosystem]] means land already given over to farming, not natural vegetation.',
    watch: (ctx) =>
      `That an ecosystem has few hotspots does not mean it is safe. In the full archive [[paramo|páramo]] records ${ctx.paramoCount} hotspots against ${ctx.pastureCount} in [[agroecosistema|agroecosystem]] — but páramo occupies a tiny fraction of the national territory, so each of those hotspots weighs far more. Without the area of each ecosystem, this chart measures frequency, not risk, and frequency always favours whatever covers the most ground.`,
    plain: 'What kind of ecosystem the fire fell on. Few hotspots in páramo is not the same as little damage.'
  },
  'kpi-eco-dominante': {
    title: 'Dominant ecosystem',
    what: 'The [[ecosistema-de-sintesis|synthesis ecosystem]] class with the most hotspots within the filtered subset, with its count and its share.',
    how: 'It answers "what is most of it burning on?". It complements the modified-land KPI: that one aggregates four transformed classes, this one names a single class.',
    watch: 'It is the most frequent class, not the most affected in relative terms. [[agroecosistema|Agroecosystem]] tops it almost always because it is the cover with the most surface in the country, not because it burns disproportionately.',
    plain: 'The ecosystem type where most of the fire fell.'
  },
  'kpi-alto-valor': {
    title: 'Hotspots in high conservation value ecosystems',
    what: 'How many hotspots fell in [[ecosistemas-sensibles|high conservation value ecosystems]]: forest, fragmented forest, [[paramo|páramo]], [[zona-pantanosa|marshland]] and glaciers.',
    how: 'The large figure is the count and the percentage is over the filtered total. Below it comes the breakdown by class, ordered from most to least.',
    watch: 'It is the complement of the modified-land indicator, not its exact opposite: the two do not add up to 100% because savannas, grasslands, shrublands and other natural ecosystems that are adapted to fire fall outside both. And it is still frequency: it does not say how many hectares of forest were lost.',
    plain: 'How much of the fire fell on ecosystems that do not recover well from burning.'
  },
  'kpi-paramo': {
    title: 'Hotspots in páramo',
    what: 'The hotspots that fell in [[paramo|páramo]] and the departments where they concentrate. Each department is a button that filters the dashboard.',
    how: 'It is the smallest subset and at the same time the one of greatest public weight in the archive: the páramo complexes of Cundinamarca, Boyacá and Nariño supply water to much of the Andean cities.',
    watch: 'The absolute figure misleads by being low. Páramo is a tiny fraction of the national territory and is not adapted to fire: the organic soil and the frailejones take decades to recover, and with them the water-retention capacity. Comparing this number with the agroecosystem one without correcting for area makes no sense.',
    plain: 'Fire in the ecosystem that regulates the water of the Andean cities.'
  },
  'concentracion': {
    title: 'Territorial concentration',
    what: 'How spread out the fire is: how many municipalities hold 80% of the hotspots, and what fraction of the total is in the five most affected departments.',
    how: 'The curve orders municipalities from most to least and accumulates. The dashed diagonal is what a perfectly even distribution would look like: the gap between the two lines is the concentration. The dotted line marks 80%, and the point where the curve crosses it is the figure on the left.',
    watch: 'Counting by municipality name gives 327 of 894; the dashboard counts municipality + department (because names repeat) and gets slightly more. The concentration is also partly real and partly an artefact of the [[cobertura-temporal|uneven coverage]]: where more was measured, more hotspots accumulate.',
    plain: 'A few municipalities hold most of the fire: it can be targeted.'
  },
  'dia-semana': {
    title: 'Distribution by day of the week',
    what: 'The same filtered hotspots, spread according to the weekday of their date.',
    how: 'It is read by comparing the drop between the highest and the lowest day. The dashed line is the Monday–Friday average, and the shaded band is the weekend. Beside the chart are the two possible interpretations, because the data does not let you choose between them.',
    watch: 'This is the most delicate reading on the dashboard. A weekend drop may mean ignition is human and follows the working calendar, or that whoever records the data also rests. With this archive there is no way to separate the phenomenon from the record. Presenting only the first reading would be the comfortable conclusion, not the correct one.',
    plain: 'Fire drops at weekends. It may be the phenomenon, or it may be who reports it.'
  },
  'gran-bioma': {
    title: 'Major biome',
    what: 'The first-level units of the IAvH biome classification present in the archive.',
    how: 'The name encodes the logic: [[zonobioma]] is the zonal climate pattern, [[orobioma]] the mountain variant, [[pedobioma]] the one defined by soil, and [[azonal]] marks what departs from the pattern because of local conditions.',
    watch: 'Four of the five categories are variants of the same humid tropical zonobioma, so the chart says less about climate than about relief and soil. The [[alternohigrico|alternohygric zonobioma]] is the only one genuinely different in rainfall regime, and it is the one that concentrates seasonal fire.',
    plain: 'The coarsest biome classification: five categories for the whole country.'
  },
  'matriz-clima': {
    title: 'Climate matrix',
    what: 'The hotspots spread across the two dimensions the climate field carries fused together: [[piso-termico|thermal floor]] (rows) and [[regimen-de-humedad|humidity regime]] (columns).',
    how: 'Each cell is a combination and its colour follows the intensity scale. Clicking a cell filters the dashboard by that exact climate class. Row and column totals let you read each dimension on its own.',
    watch: 'The concentration in the warm, semi-humid band reflects both the climate where fire happens and where people live and work. And these are mean climates of the site, not the conditions on the day of the fire. Cells with one or two units — snowline, extremely cold — are real but support no inference.',
    plain: 'Where temperature and humidity cross when there is fire.'
  },
  'paisaje': {
    title: 'Landscape',
    what: 'The coarse geomorphological unit where each hotspot fell: mountain, [[lomerio|hills]], [[piedemonte|piedmont]], [[planicie-aluvial|alluvial plain]], [[altiplanicie|high plateau]], valley.',
    how: 'It is the chart that underpins the operational-difficulty KPI: the mountain percentage comes from here. Bars are ordered by frequency with value and share at the end.',
    watch: 'Landscape describes the shape of the terrain, not real access. And records with landscape "N.A." are not a terrain type: they are missing data, and should not be read as a category.',
    plain: 'What kind of terrain the fire fell on.'
  },
  'relieve': {
    title: 'Landform',
    what: 'The specific shape of the terrain within the [[paisaje|landscape]]: [[filas-y-vigas|ridges and spurs]], [[crestas-y-espinazos|crests and hogbacks]], low hills, terraces, alluvial fans.',
    how: 'This is the level of detail that matters operationally: it determines slope, exposure to sun and wind, and therefore how fire spreads and how hard it is to contain. The 14 most frequent forms are shown.',
    watch: 'That "low hills" tops the list does not mean it is harder to put out there: it is gentle, accessible terrain. The operationally worrying figure is the second one, ridges and spurs, which is the worst possible scenario for a crew.',
    plain: 'The fine shape of the terrain: what decides whether fire can be reached on foot.'
  },
  'conglomerado': {
    title: 'Recurrent cluster west of Bogotá',
    what: 'A group of coordinates that record fire in several different years, gathered in a box of about 22 by 22 kilometres west of Bogotá.',
    how: 'The size of each circle grows with the number of years affected. The dotted box delimits the cluster. It is the archive’s clearest candidate for targeted preventive work, because the repetition points to a structural cause and not to an accident.',
    watch: 'The cluster is defined by its coordinate box, not by municipality names, and that is deliberate: the archive labels these cells with municipalities that are 50 to 75 km away. The municipality field is not reliable at record level, so putting a province name on this finding would be invention. Each point is also a [[celda|~500 m cell]], not a property.',
    plain: 'A group of cells west of Bogotá that burns year after year.'
  },
  'clima': {
    title: 'Climate conditions',
    what: 'How many hotspots occurred under each climate class, combining [[piso-termico|thermal floor]] and [[regimen-de-humedad|humidity regime]].',
    how: 'The first word is the temperature (warm, temperate, cold, very cold, snowline) and the second the humidity (arid, semi-arid, semi-humid, humid, super-humid). The shade follows magnitude. Clicking a bar filters the dashboard.',
    watch: 'It is the usual climate of the site, not the weather on the day of the fire. This chart does not say there was a drought when it burned: that would need the meteorological series for that date, which this archive does not include.',
    plain: 'Under what usual climate the fire fell — not the weather on the day it burned.'
  },
  'recurrentes': {
    title: 'Recurrent hotspots',
    what: 'Coordinates where the archive records fire in two or more different years. There are 406 in the full archive.',
    how: 'Ordered by number of years affected. A point that burns in five different years points to a repeating cause — a management practice, a land use — and not to an accident. These are the natural candidates for preventive work.',
    watch: 'Because coordinates are rounded, "the same point" means the same [[celda|~500 m cell]]. And the cells with the most years tend to be where [[cobertura-temporal|data capture was most consistent]], so the list mixes real recurrence with consistency of measurement.',
    plain: 'Places that repeat year after year: the best candidates for prevention.'
  }
};

/** El recorrido guiado de la primera visita. */
export const TOUR_STEPS_EN = [
  {
    title: 'The filters are charts too',
    body: 'The year strip draws how many records there are in each year and how well they were captured: solid is dense capture, hatched is partial, and a dotted box is a year with no data at all. The month strip is coloured by intensity. Click to pick one, or drag to pick a range.'
  },
  {
    title: 'The figures at the top follow the filters',
    body: 'The whole dashboard recalculates with whatever you filter, these indicators included. The most important is the first one, and it is worth being clear from the start: these are satellite heat detections, not confirmed fires and not hectares burned.'
  },
  {
    title: 'The map filters both ways',
    body: 'Switch between points, density and sensitive ecosystems. Clicking a point filters the whole dashboard by that department. To zoom use Ctrl or ⌘ together with the wheel, so the map does not hijack the page scroll.'
  },
  {
    title: 'Five ways of looking at the same thing',
    body: 'Territory answers where; Seasonal, when; Ecosystems, on what; Terrain, on what relief; and Recurrence holds the table of repeating points. Each tab carries the question it answers above its name.'
  },
  {
    title: 'This layer can be switched off',
    body: 'Every card has an ⓘ explaining what it shows, how to read it and what to watch out for. Dotted-underlined terms open the glossary. If you already know the domain, switch to expert mode and everything disappears except the ⓘ.'
  }
];
