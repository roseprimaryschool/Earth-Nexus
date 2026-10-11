import { NexusEvent } from '../types/nexus';
import { VERIFIED_REAL_FLIGHTS, convertRealFlightToEvent } from '../services/flightApi';

export const INITIAL_NEXUS_EVENTS: NexusEvent[] = [
  // ==========================================
  // 1. EARTHQUAKES 🌍
  // ==========================================
  {
    id: 'eq-2026-081',
    category: 'disaster',
    subType: 'earthquake',
    title: 'Magnitude 6.7 Earthquake - Northern Japan',
    description: 'A strong earthquake shook the northeast coast of Japan near Sendai. Buildings swayed back and forth for 30 seconds. Coastal tsunami warning buoys turned on, but no giant waves occurred.',
    plainExplanation: 'A strong underground rock shift caused noticeable shaking across northern Japan. Modern buildings swayed safely.',
    whatItMeans: 'Strong shaking. People felt items fall from shelves and chandeliers sway. No major injuries reported.',
    dangerLevelSimple: 'High',
    locationName: 'Honshu Coast, Sendai, Japan',
    country: 'Japan',
    coordinates: [38.297, 142.373],
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    severity: 'HIGH',
    verified: true,
    source: 'USGS Earthquake Center & Japan Agency',
    magnitude: 6.7,
    depthKm: 32,
    tsunamiRisk: false,
    metrics: {
      'Strength': 'Magnitude 6.7 (Strong)',
      'Depth': '32 km below ground',
      'How it Felt': 'Strong shaking indoors',
      'Tsunami Risk': 'None'
    },
    tags: ['Earthquake', 'Japan', 'Strong Shaking']
  },
  {
    id: 'eq-2026-082',
    category: 'disaster',
    subType: 'earthquake',
    title: 'Magnitude 5.9 Earthquake - Southern California',
    description: 'A moderate jolt struck near the Salton Sea south of Palm Springs. People across Los Angeles and San Diego felt a rolling tremor that lasted about 10 seconds.',
    plainExplanation: 'A quick slip along an active fault line created rolling waves felt widely across Southern California.',
    whatItMeans: 'Moderate shaking. Items rattled in kitchens, but no roads or bridges were damaged.',
    dangerLevelSimple: 'Moderate',
    locationName: 'Salton Sea, California, USA',
    country: 'United States',
    coordinates: [33.195, -115.542],
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    severity: 'ELEVATED',
    verified: true,
    source: 'USGS Earthquake Hazards Program',
    magnitude: 5.9,
    depthKm: 8,
    tsunamiRisk: false,
    metrics: {
      'Strength': 'Magnitude 5.9 (Moderate)',
      'Depth': '8 km (Shallow)',
      'How it Felt': 'Dishes rattled, light swaying',
      'Tsunami Risk': 'None'
    },
    tags: ['Earthquake', 'California', 'San Andreas']
  },
  {
    id: 'eq-2026-083',
    category: 'disaster',
    subType: 'earthquake',
    title: 'Magnitude 6.2 Earthquake - Northern Chile Coast',
    description: 'A strong offshore earthquake shook coastal towns in the Atacama region. Miners and port workers stepped outside to open areas as ground shook.',
    plainExplanation: 'Two tectonic plates pushed against each other offshore, releasing sudden energy as ground shaking.',
    whatItMeans: 'Strong shaking along the coastline. Emergency services reported no casualties.',
    dangerLevelSimple: 'High',
    locationName: 'Atacama Coast, Chile',
    country: 'Chile',
    coordinates: [-27.366, -70.933],
    timestamp: new Date(Date.now() - 1000 * 60 * 340).toISOString(),
    severity: 'HIGH',
    verified: true,
    source: 'National Seismological Center Chile',
    magnitude: 6.2,
    depthKm: 28,
    tsunamiRisk: false,
    metrics: {
      'Strength': 'Magnitude 6.2 (Strong)',
      'Depth': '28 km below sea',
      'How it Felt': 'Felt strongly along 200km of coast',
      'Tsunami Risk': 'None'
    },
    tags: ['Earthquake', 'Chile', 'Coast']
  },
  {
    id: 'eq-2026-084',
    category: 'disaster',
    subType: 'earthquake',
    title: 'Magnitude 5.5 Earthquake - Central Italy',
    description: 'A moderate tremor struck the Apennine Mountains in central Italy, waking residents in hill towns and felt as gentle swaying in Rome apartments.',
    plainExplanation: 'Mountain faults shifted slightly, sending vibrations through hill towns.',
    whatItMeans: 'Moderate shaking. A few old stone walls had small plaster cracks; everyone is safe.',
    dangerLevelSimple: 'Moderate',
    locationName: 'Umbria / Marche, Italy',
    country: 'Italy',
    coordinates: [42.85, 13.12],
    timestamp: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    severity: 'ELEVATED',
    verified: true,
    source: 'INGV Italy Geophysics Institute',
    magnitude: 5.5,
    depthKm: 10,
    tsunamiRisk: false,
    metrics: {
      'Strength': 'Magnitude 5.5 (Moderate)',
      'Depth': '10 km (Shallow)',
      'How it Felt': 'Beds shook, doors creaked',
      'Tsunami Risk': 'None'
    },
    tags: ['Earthquake', 'Italy', 'Apennines']
  },

  // ==========================================
  // 2. ACTIVE VOLCANOES 🌋
  // ==========================================
  {
    id: 'volc-2026-01',
    category: 'disaster',
    subType: 'volcano',
    title: 'Mount Marapi Volcano - Explosive Ash Eruption',
    description: 'Mount Marapi erupted suddenly with a thunderous roar, sending a thick column of gray volcanic ash 4.2 kilometers into the sky. Surrounding villages are receiving light ashfall.',
    plainExplanation: 'Lava and gas underground built up pressure and burst out through the top of the volcano like a shaken bottle of soda.',
    whatItMeans: 'Red alert for airplanes (ash can stall jet engines). Residents are wearing face masks to avoid breathing dusty ash.',
    dangerLevelSimple: 'Severe',
    locationName: 'West Sumatra, Indonesia',
    country: 'Indonesia',
    coordinates: [-0.381, 100.473],
    timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    severity: 'CRITICAL',
    verified: true,
    source: 'Indonesia Volcano Survey & Aviation Alert',
    alertColor: 'RED',
    elevationM: 2891,
    plumeHeightKm: 4.2,
    metrics: {
      'Ash Cloud Height': '4.2 km (13,800 feet)',
      'Alert Level': 'RED (Active Eruption)',
      'Safety Zone': 'Stay 4.5 km away from crater',
      'Air Traffic': 'Flights rerouted around cloud'
    },
    tags: ['Active Volcano', 'Ash Cloud', 'Aviation Warning']
  },
  {
    id: 'volc-2026-02',
    category: 'disaster',
    subType: 'volcano',
    title: 'Svartsengi Volcano - Glowing Lava Fountains',
    description: 'A crack in the ground opened on the Reykjanes peninsula in Iceland, shooting bright orange fountains of molten lava 50 meters into the night air. Lava is flowing away from towns.',
    plainExplanation: 'Red-hot melted rock is bubbling up through a crack in the Earth and cooling into black rock as it flows.',
    whatItMeans: 'High alert for ground traffic. Protective dirt barriers are keeping the lava away from power stations.',
    dangerLevelSimple: 'High',
    locationName: 'Reykjanes Peninsula, Grindavík, Iceland',
    country: 'Iceland',
    coordinates: [63.879, -22.433],
    timestamp: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
    severity: 'HIGH',
    verified: true,
    source: 'Iceland Meteorological Office',
    alertColor: 'ORANGE',
    elevationM: 320,
    plumeHeightKm: 1.5,
    metrics: {
      'Fissure Length': '3.8 km long crack',
      'Lava Height': 'Spouting 50 meters high',
      'Lava Flow Speed': 'Walking speed',
      'Homes Threatened': 'None (defended by barriers)'
    },
    tags: ['Active Volcano', 'Iceland', 'Lava Fountains']
  },
  {
    id: 'volc-2026-03',
    category: 'disaster',
    subType: 'volcano',
    title: 'Mount Etna Volcano - Lava Streams & Night Glow',
    description: 'Europe’s most famous volcano is erupting again in Sicily. Glowing red lava streams are cascading down the uninhabited eastern slope, creating spectacular night views.',
    plainExplanation: 'Etna frequently vents steam and lava. As long as lava stays inside the summit valley, nearby cities remain safe.',
    whatItMeans: 'Catania airport temporarily delayed evening flights while checking for dust on the runway.',
    dangerLevelSimple: 'Moderate',
    locationName: 'Sicily, Italy',
    country: 'Italy',
    coordinates: [37.751, 14.993],
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    severity: 'ELEVATED',
    verified: true,
    source: 'Etna Observatory (INGV Italy)',
    alertColor: 'YELLOW',
    elevationM: 3357,
    plumeHeightKm: 2.1,
    metrics: {
      'Volcano Height': '3,357 meters',
      'Lava Flow': 'Flowing down Valle del Bove',
      'Airport Status': 'Brief ash cleaning check',
      'Sightseers': 'Guided tours restricted'
    },
    tags: ['Active Volcano', 'Italy', 'Etna']
  },
  {
    id: 'volc-2026-04',
    category: 'disaster',
    subType: 'volcano',
    title: 'Kilauea Volcano - Lava Lake Bubbling in Crater',
    description: 'Fresh molten rock is pouring into the summit crater at Hawaii Volcanoes National Park. The lake of bright orange lava is bubbling and splashing against dark crust.',
    plainExplanation: 'Kilauea has gentle lava eruptions that stay confined inside its deep caldera crater.',
    whatItMeans: 'Safe to observe from national park viewing lookouts. High sulfur gas requires people with asthma to stay back.',
    dangerLevelSimple: 'Moderate',
    locationName: 'Big Island, Hawaii, USA',
    country: 'United States',
    coordinates: [19.406, -155.283],
    timestamp: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    severity: 'ELEVATED',
    verified: true,
    source: 'USGS Hawaiian Volcano Observatory',
    alertColor: 'ORANGE',
    elevationM: 1222,
    metrics: {
      'Crater Activity': 'Lava lake bubbling inside crater',
      'Public Safety': 'Safe inside national park viewpoints',
      'Gas Emissions': 'Sulfur gas alerts active'
    },
    tags: ['Active Volcano', 'Hawaii', 'Lava Lake']
  },

  // ==========================================
  // 3. WILDFIRES 🔥
  // ==========================================
  {
    id: 'fire-2026-01',
    category: 'disaster',
    subType: 'wildfire',
    title: 'Huge Amazon Basin Wildfire - Dense Smoke',
    description: 'Dry season heat and strong winds fueled a massive forest fire across northern Mato Grosso. Thick orange smoke covers hundreds of kilometers, turning day into dusk.',
    plainExplanation: 'Dry brush and trees caught fire, creating a huge blaze that spreads with the wind.',
    whatItMeans: 'Air quality in neighboring towns is unhealthy. Firefighting aircraft are dumping water onto fire lines.',
    dangerLevelSimple: 'Severe',
    locationName: 'Mato Grosso, Brazil',
    country: 'Brazil',
    coordinates: [-11.854, -55.512],
    timestamp: new Date(Date.now() - 1000 * 60 * 220).toISOString(),
    severity: 'CRITICAL',
    verified: true,
    source: 'Brazil Space Agency (INPE) & Firefighters',
    areaHectares: 145000,
    containmentPercent: 12,
    brightnessTempK: 395,
    metrics: {
      'Area Burned': '145,000 hectares',
      'Contained': '12% under control',
      'Smoke Warning': 'Heavy smoke across 3 states',
      'Aircraft Deployed': '6 water bombers'
    },
    tags: ['Wildfire', 'Forest Fire', 'Smoke Warning']
  },
  {
    id: 'fire-2026-02',
    category: 'disaster',
    subType: 'wildfire',
    title: 'British Columbia Pine Forest Wildfire',
    description: 'Gusty 65 km/h winds are pushing a fast-moving wildfire through dense dry pine forest. Police closed a regional highway and issued evacuation alerts for rural cabins.',
    plainExplanation: 'Winds are carrying sparks forward, causing new fires to ignite ahead of the main fire line.',
    whatItMeans: 'Evacuation warnings issued for nearby camping areas and small settlements.',
    dangerLevelSimple: 'High',
    locationName: 'British Columbia, Canada',
    country: 'Canada',
    coordinates: [54.726, -127.174],
    timestamp: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    severity: 'ELEVATED',
    verified: true,
    source: 'BC Wildfire Service',
    areaHectares: 42000,
    containmentPercent: 28,
    metrics: {
      'Area Burned': '42,000 hectares',
      'Contained': '28% under control',
      'Wind Speed': '65 km/h gusty winds',
      'Highway Status': 'Closed for safety'
    },
    tags: ['Wildfire', 'Canada', 'Forest Fire']
  },
  {
    id: 'fire-2026-03',
    category: 'disaster',
    subType: 'wildfire',
    title: 'California Sierra Foothills Brush Fire',
    description: 'Hot summer weather sparked a dry grass and oak woodland fire in the Sierra foothills. Bulldozers are cutting wide dirt firebreaks to protect rural homes.',
    plainExplanation: 'Dry grass burns very quickly on hillsides, but firefighters can stop it by removing the dry fuel ahead of it.',
    whatItMeans: 'Fire crews have 60% of the perimeter surrounded and contained.',
    dangerLevelSimple: 'Moderate',
    locationName: 'Sierra Foothills, California, USA',
    country: 'United States',
    coordinates: [37.85, -120.45],
    timestamp: new Date(Date.now() - 1000 * 60 * 550).toISOString(),
    severity: 'ELEVATED',
    verified: true,
    source: 'CAL FIRE Official Dispatch',
    areaHectares: 8500,
    containmentPercent: 60,
    metrics: {
      'Area Burned': '8,500 hectares',
      'Contained': '60% contained',
      'Homes Damaged': '0 homes damaged',
      'Firefighters': '450 on scene'
    },
    tags: ['Wildfire', 'California', 'Brush Fire']
  },

  // ==========================================
  // 4. HURRICANES & TYPHOONS 🌀
  // ==========================================
  {
    id: 'hurr-2026-01',
    category: 'disaster',
    subType: 'hurricane',
    title: 'Super Typhoon "Malakas" - Category 5',
    description: 'A monster tropical storm with sustained 260 km/h winds is spinning over the warm ocean. The storm has a well-defined eye 25 kilometers wide and generates waves over 14 meters high.',
    plainExplanation: 'A super typhoon is a massive, spinning hurricane over the Pacific Ocean. It brings torrential rain, destructive winds, and giant ocean waves.',
    whatItMeans: 'Extremely dangerous. All cargo ships, fishing vessels, and passenger boats have cleared the ocean area.',
    dangerLevelSimple: 'Severe',
    locationName: 'Philippine Sea, Western Pacific',
    country: 'Philippines',
    coordinates: [15.421, 129.833],
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    severity: 'CRITICAL',
    verified: true,
    source: 'Joint Typhoon Warning Center',
    categoryScale: 5,
    windSpeedKmh: 260,
    pressureHpa: 908,
    heading: 'West-Northwest at 22 km/h',
    metrics: {
      'Storm Category': 'Category 5 (Highest)',
      'Sustained Winds': '260 km/h (160 mph)',
      'Wave Heights': '14.2 meters (46 feet)',
      'Heading': 'Moving WNW across open sea'
    },
    tags: ['Hurricane', 'Super Typhoon', 'Cat 5']
  },
  {
    id: 'hurr-2026-02',
    category: 'disaster',
    subType: 'hurricane',
    title: 'Major Hurricane "Nadine" - Category 3',
    description: 'An intensifying hurricane is churning across warm Gulf of Mexico waters with maximum sustained winds of 195 km/h, pushing high waves toward the northern coast.',
    plainExplanation: 'Warm ocean water feeds heat into the storm clouds, making the hurricane spin faster as it approaches land.',
    whatItMeans: 'Coastal communities are boarding up windows and stocking drinking water. High storm surge warning issued.',
    dangerLevelSimple: 'High',
    locationName: 'Central Gulf of Mexico',
    country: 'United States',
    coordinates: [24.812, -87.421],
    timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    severity: 'HIGH',
    verified: true,
    source: 'NOAA National Hurricane Center',
    categoryScale: 3,
    windSpeedKmh: 195,
    pressureHpa: 954,
    heading: 'North-Northeast at 18 km/h',
    metrics: {
      'Storm Category': 'Category 3 Major',
      'Wind Speed': '195 km/h (120 mph)',
      'Coastal Storm Surge': '3.5 to 4.8 meters',
      'Status': 'Approaching coast in 36 hours'
    },
    tags: ['Hurricane', 'Gulf Coast', 'Cat 3']
  },

  // ==========================================
  // 5. FLOODS 🌊
  // ==========================================
  {
    id: 'flood-2026-01',
    category: 'disaster',
    subType: 'flood',
    title: 'Severe River Flood - City Streets Submerged',
    description: 'After 400 mm of torrential rain fell in three days, swollen rivers smashed through levee walls, turning city streets into murky waterways and submerging cars up to their roofs.',
    plainExplanation: 'So much rain fell that rivers overflowed their banks and flooded homes, roads, and power stations.',
    whatItMeans: 'Rescue teams in boats are helping stranded residents get to safety. Clean drinking water trucks deployed.',
    dangerLevelSimple: 'Severe',
    locationName: 'Rio Grande do Sul, Brazil',
    country: 'Brazil',
    coordinates: [-29.981, -51.218],
    timestamp: new Date(Date.now() - 1000 * 60 * 520).toISOString(),
    severity: 'HIGH',
    verified: true,
    source: 'National Civil Defense Rescue Service',
    metrics: {
      'Water Level': '5.3 meters above normal',
      'Rainfall in 3 Days': '412 mm (16 inches)',
      'People Rescued': 'Over 100,000 residents',
      'Electricity': 'Shut off in flooded areas for safety'
    },
    tags: ['Flood', 'River Overflow', 'Emergency']
  },
  {
    id: 'flood-2026-02',
    category: 'disaster',
    subType: 'flood',
    title: 'Flash Flooding in Valencia - Streets Turned to Rivers',
    description: 'A sudden cloudburst dropped months worth of rain in four hours across eastern Spain. Muddy water rushed down city avenues, carrying away parked cars and flooding basements.',
    plainExplanation: 'Rain poured down much faster than storm drains could swallow, causing instant flooding on streets.',
    whatItMeans: 'Trains and highways were halted until water drained away. Residents stayed on upper floors until safe.',
    dangerLevelSimple: 'High',
    locationName: 'Valencia, Spain',
    country: 'Spain',
    coordinates: [39.4699, -0.3763],
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    severity: 'HIGH',
    verified: true,
    source: 'Spain Meteorological Bureau & Rescue Units',
    metrics: {
      'Rainfall Rate': '180 mm in 4 hours',
      'Street Water Depth': 'Up to 1.2 meters deep',
      'Subway Lines': '2 stations closed temporarily',
      'Clean-up': 'Mud pumping crews working'
    },
    tags: ['Flood', 'Spain', 'Flash Flood']
  },
  {
    id: 'flood-2026-03',
    category: 'disaster',
    subType: 'flood',
    title: 'Lower Mississippi River High Water Overflow',
    description: 'Spring snowmelt upstream combined with heavy rain has raised river gauges to major flood stage, spilling over low agricultural fields along the riverbank.',
    plainExplanation: 'Melting winter snow and rain joined together into the giant river, filling it to the very brim.',
    whatItMeans: 'Flood spillway gates opened to steer excess water away from major cities.',
    dangerLevelSimple: 'Moderate',
    locationName: 'Baton Rouge / New Orleans, Louisiana, USA',
    country: 'United States',
    coordinates: [30.458, -91.14],
    timestamp: new Date(Date.now() - 1000 * 60 * 700).toISOString(),
    severity: 'ELEVATED',
    verified: true,
    source: 'US Army Corps of Engineers River Forecast',
    metrics: {
      'River Crest': '13.2 meters at river gauge',
      'Spillways Open': 'Morganza Spillway partially open',
      'City Levees': 'Holding securely',
      'Farms Affected': 'Low farmland flooded'
    },
    tags: ['Flood', 'Mississippi River', 'High Water']
  },

  // ==========================================
  // 6. VERIFIED REAL COMMERCIAL PASSENGER FLIGHTS ✈️
  // ==========================================
  ...VERIFIED_REAL_FLIGHTS.map(convertRealFlightToEvent),

  // ==========================================
  // 7. STORMS ⛈️
  // ==========================================
  {
    id: 'wx-storm-01',
    category: 'weather',
    subType: 'storm',
    title: 'Severe Thunderstorm & Tornado Alert - US Midwest',
    description: 'A 600-kilometer line of severe thunderstorms is sweeping across Oklahoma and Kansas with wind gusts over 130 km/h, golf-ball-sized hail, and tornado warnings.',
    plainExplanation: 'Warm humid air from the Gulf collided with cool mountain air, creating tall thunderclouds that produce fierce wind, hail, and spinning funnel clouds.',
    whatItMeans: 'People are heading to storm basements or interior bathrooms. Outdoor activities cancelled.',
    dangerLevelSimple: 'High',
    locationName: 'Oklahoma & Kansas, USA',
    country: 'United States',
    coordinates: [35.467, -97.516],
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    severity: 'HIGH',
    verified: true,
    source: 'NOAA National Storm Prediction Center',
    windSpeedKmh: 135,
    tempC: 22,
    metrics: {
      'Wind Gusts': '135 km/h (84 mph)',
      'Hail Size': 'Up to 5 cm (golf-ball size)',
      'Tornado Alert': 'Active warnings in 4 counties',
      'Rainfall': '50 mm in 1 hour'
    },
    tags: ['Storm', 'Thunderstorm', 'Tornado Alert']
  },
  {
    id: 'wx-storm-02',
    category: 'weather',
    subType: 'storm',
    title: 'Atlantic Coastal Windstorm - English Channel',
    description: 'A deep low-pressure storm is battering the French and English coasts with roaring 110 km/h sea winds, pounding waves against seawalls and halting ferry crossings.',
    plainExplanation: 'A strong ocean storm system pushed in from the North Atlantic, bringing driving rain and violent wind gusts to coastal towns.',
    whatItMeans: 'Channel ferries suspended until waves subside. Tree branches down on coastal roads.',
    dangerLevelSimple: 'Moderate',
    locationName: 'English Channel & Normandy Coast',
    country: 'France',
    coordinates: [49.8, -0.5],
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    severity: 'ELEVATED',
    verified: true,
    source: 'Météo-France & UK Met Office',
    windSpeedKmh: 110,
    tempC: 13,
    metrics: {
      'Peak Gusts': '110 km/h along cliffs',
      'Sea Waves': '6.5 meter swells',
      'Ferry Crossings': 'Temporarily paused',
      'Rainfall': 'Heavy coastal squalls'
    },
    tags: ['Storm', 'Windstorm', 'Coastal Waves']
  },
  {
    id: 'wx-storm-03',
    category: 'weather',
    subType: 'storm',
    title: 'Intense Lightning Storm - Lake Maracaibo',
    description: 'The famous Catatumbo nocturnal lightning storm is flashing over the lake basin, with over 250 lightning bolts firing across the sky every single minute.',
    plainExplanation: 'Mountain breezes meet warm swamp air, creating almost continuous silent lightning flashes that illuminate the night like fireworks.',
    whatItMeans: 'Incredible natural spectacle. Local fishermen moor their boats until flashes stop.',
    dangerLevelSimple: 'Moderate',
    locationName: 'Lake Maracaibo, Venezuela',
    country: 'Venezuela',
    coordinates: [9.803, -71.564],
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    severity: 'GUARDED',
    verified: true,
    source: 'Weather Satellite Lightning Mapper',
    metrics: {
      'Lightning Rate': '280 strikes per minute',
      'Frequency': 'Flashes every 2-3 seconds',
      'Visibility': 'Lit up for 400 kilometers',
      'Thunder': 'Distant continuous rumble'
    },
    tags: ['Storm', 'Lightning', 'Catatumbo']
  }
];
