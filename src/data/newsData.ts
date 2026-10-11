import { NewsArticle } from '../types/nexus';

export const MOCK_NEWS_ARTICLES: NewsArticle[] = [
  // ==========================================
  // 1. POLITICS & DIPLOMACY 🏛️
  // ==========================================
  {
    id: 'news-pol-01',
    title: 'Global Clean Energy & Grid Treaty Signed in Geneva by 52 Nations',
    category: 'politics',
    newsGroup: 'politics',
    summary: 'Representatives from 52 countries officially signed a worldwide agreement in Geneva to connect international electricity grids and share excess solar and wind power across borders.',
    plainExplanation: 'Countries agreed to link their electric power lines together so when one country produces extra clean electricity, nearby countries can use it instead of burning fossil fuels.',
    location: 'Geneva, Switzerland',
    country: 'Switzerland',
    coordinates: [46.2044, 6.1432],
    timestamp: '15 minutes ago',
    severity: 'Breaking',
    source: 'International Energy Council & UN Dispatch',
    readTime: '2 min read',
    keyFacts: [
      '52 nations pledged $120 billion to build cross-border green power grids.',
      'Treaty aims to eliminate blackouts during heavy winter and summer demand.',
      'Implementation begins within 18 months across Europe, Africa, and the Middle East.'
    ]
  },
  {
    id: 'news-pol-02',
    title: 'Historic Pacific Free-Trade & Port Modernization Accord Finalized in Tokyo',
    category: 'politics',
    newsGroup: 'politics',
    summary: 'Trade ministers from 14 Pacific Rim nations reached a comprehensive agreement to cut tariffs on food and technology products while building automated, zero-emission ports.',
    plainExplanation: 'Friendly nations agreed to make buying and selling goods easier and cheaper, lowering prices for everyday shoppers and speeding up cargo deliveries.',
    location: 'Tokyo, Japan',
    country: 'Japan',
    coordinates: [35.6762, 139.6503],
    timestamp: '1 hour ago',
    severity: 'Major',
    source: 'Asia-Pacific Economic Wire',
    readTime: '3 min read',
    keyFacts: [
      'Cuts customs taxes on electronics and farm produce by up to 90%.',
      'Port clearance wait times will drop from 3 days to under 6 hours.',
      'Includes strict worker protections and clean shipping standards.'
    ]
  },
  {
    id: 'news-pol-03',
    title: 'African Union Launches Unified High-Speed Rail Corridor Linking 12 Nations',
    category: 'politics',
    newsGroup: 'politics',
    summary: 'Heads of state met in Addis Ababa to break ground on a multi-national electric railway corridor designed to connect major commercial hubs from the Red Sea to the Atlantic Ocean.',
    plainExplanation: 'Twelve countries are joining together to build a fast electric train line that will carry people and goods across Africa quickly and affordably.',
    location: 'Addis Ababa, Ethiopia',
    country: 'Ethiopia',
    coordinates: [9.03, 38.74],
    timestamp: '2 hours ago',
    severity: 'Major',
    source: 'African Union Secretariat',
    readTime: '3 min read',
    keyFacts: [
      '4,800-kilometer electric high-speed train network.',
      'Expected to cut cargo travel times across the continent from weeks to 36 hours.',
      'Powered entirely by hydro, geothermal, and solar energy.'
    ]
  },
  {
    id: 'news-pol-04',
    title: 'United Nations Approves Historic High-Seas Wildlife Protection Accord',
    category: 'politics',
    newsGroup: 'politics',
    summary: 'In an overwhelming vote at the UN General Assembly in New York, delegates ratified a binding legal treaty establishing conservation sanctuaries across 30% of international ocean waters.',
    plainExplanation: 'World governments agreed to protect open ocean waters from overfishing and dumping, giving whales, coral reefs, and sea turtles safe zones to thrive.',
    location: 'New York, USA',
    country: 'United States',
    coordinates: [40.7128, -74.006],
    timestamp: '3 hours ago',
    severity: 'Major',
    source: 'United Nations Press',
    readTime: '2 min read',
    keyFacts: [
      'Creates marine sanctuaries covering over 100 million square kilometers.',
      'Restricts deep-sea mineral dredging in sensitive ocean trenches.',
      'Establishes an international satellite patrol to catch illegal fishing boats.'
    ]
  },
  {
    id: 'news-pol-05',
    title: 'European Union Passes Global Benchmark Artificial Intelligence Law in Brussels',
    category: 'politics',
    newsGroup: 'politics',
    summary: 'The European Parliament ratified comprehensive legislation requiring transparent labeling for automated content and banning deceptive biometric surveillance in public places.',
    plainExplanation: 'New rules require tech companies to be honest about automated systems, prevent fake identities, and protect citizens privacy in public spaces.',
    location: 'Brussels, Belgium',
    country: 'Belgium',
    coordinates: [50.8503, 4.3517],
    timestamp: '4 hours ago',
    severity: 'Developing',
    source: 'European Parliament Press',
    readTime: '2 min read',
    keyFacts: [
      'Requires clear watermarks on computer-generated photos and videos.',
      'Protects artists and writers from unauthorized data copying.',
      'Sets heavy fines for companies violating safety rules.'
    ]
  },

  // ==========================================
  // 2. BUSINESS & ECONOMY 💼
  // ==========================================
  {
    id: 'news-biz-01',
    title: 'Solar and Wind Power Now Cheaper Than Coal in 85% of Global Energy Markets',
    category: 'business',
    newsGroup: 'business',
    summary: 'A landmark financial study released in London reveals that building new solar and battery farms has become cheaper than continuing to operate existing coal and natural gas generators.',
    plainExplanation: 'Solar panels and wind turbines have become so affordable to manufacture that clean power is now simply the best financial choice for utility companies.',
    location: 'London, United Kingdom',
    country: 'United Kingdom',
    coordinates: [51.5074, -0.1278],
    timestamp: '45 minutes ago',
    severity: 'Major',
    source: 'Global Financial & Energy Review',
    readTime: '3 min read',
    keyFacts: [
      'Solar electricity generation costs plunged 18% in the past 12 months.',
      'Battery energy storage installations grew by 240% worldwide.',
      'Utilities project billions of dollars in consumer savings over the next decade.'
    ]
  },
  {
    id: 'news-biz-02',
    title: 'Next-Gen Semiconductor Mega-Fabs Open in Dresden & Kumamoto, Boosting Supply',
    category: 'business',
    newsGroup: 'business',
    summary: 'Two cutting-edge microchip manufacturing campuses came online this week in Germany and Japan, easing global component shortages for automobiles, hospitals, and smartphones.',
    plainExplanation: 'New super-clean chip factories are producing millions of computer processors, making cars and gadgets cheaper and easier to get without long backlogs.',
    location: 'Dresden, Germany',
    country: 'Germany',
    coordinates: [51.0504, 13.7373],
    timestamp: '1 hour ago',
    severity: 'Major',
    source: 'Tech & Economy Times',
    readTime: '2 min read',
    keyFacts: [
      '$20 billion combined investment in ultra-efficient 3-nanometer chip fabrication.',
      'Creates over 12,000 high-tech engineering and robotics jobs.',
      'Reduces dependency on single-country supply bottlenecks.'
    ]
  },
  {
    id: 'news-biz-03',
    title: 'Central Banks Lower Benchmark Interest Rates Following Global Inflation Drop',
    category: 'business',
    newsGroup: 'business',
    summary: 'At its Frankfurt headquarters, policymakers reduced prime lending rates by 50 basis points, citing stabilized grocery prices, lower fuel costs, and healthy consumer confidence.',
    plainExplanation: 'Because inflation has cooled down, banks are lowering loan rates, making mortgages, car payments, and business loans much more affordable.',
    location: 'Frankfurt, Germany',
    country: 'Germany',
    coordinates: [50.1109, 8.6821],
    timestamp: '2 hours ago',
    severity: 'Major',
    source: 'Central Bank Economic Bulletin',
    readTime: '2 min read',
    keyFacts: [
      'Benchmark rate lowered to 2.75%, the lowest level in three years.',
      'Mortgage applications jumped 22% within hours of the announcement.',
      'Stock indexes across Asia, Europe, and America posted solid gains.'
    ]
  },
  {
    id: 'news-biz-04',
    title: 'World Maritime Trade Sets Efficiency Record with Hydrogen-Hybrid Cargo Fleets',
    category: 'business',
    newsGroup: 'business',
    summary: 'The Port of Singapore handled a record 3.2 million cargo containers this month, driven by a new wave of fuel-efficient hydrogen-hybrid mega container vessels.',
    plainExplanation: 'Huge cargo ships carrying clothing, food, and electronics are now using clean hydrogen fuel, cutting pollution while speeding up delivery across the oceans.',
    location: 'Singapore',
    country: 'Singapore',
    coordinates: [1.3521, 103.8198],
    timestamp: '4 hours ago',
    severity: 'Developing',
    source: 'Maritime Trade Gazette',
    readTime: '2 min read',
    keyFacts: [
      'Hydrogen-hybrid ships reduce carbon emissions by over 65%.',
      'Average container transit time between Asia and Europe decreased by 4 days.',
      'Singapore port automated cranes handled 45 container moves per hour.'
    ]
  },

  // ==========================================
  // 3. TECHNOLOGY & SCIENCE 🔬
  // ==========================================
  {
    id: 'news-tech-01',
    title: 'International Fusion Reactor Achieves Net Energy Output Milestone in France',
    category: 'tech',
    newsGroup: 'tech',
    summary: 'Scientists and engineers operating the magnetic fusion reactor facility in southern France maintained a superheated plasma reaction that generated double the energy required to initiate it.',
    plainExplanation: 'Scientists created the same clean power that fuels the Sun inside a magnetic chamber. This is a massive step toward unlimited, zero-carbon electricity for the whole world.',
    location: 'Cadarache, France',
    country: 'France',
    coordinates: [43.6874, 5.7608],
    timestamp: '30 minutes ago',
    severity: 'Breaking',
    source: 'Global Physics Review & ITER Consortium',
    readTime: '3 min read',
    keyFacts: [
      'Plasma temperature reached 150 million degrees Celsius (10 times hotter than the Sun core).',
      'Produced 500 megawatts of thermal energy for over 12 continuous minutes.',
      'Produces no long-lived radioactive waste and uses water and lithium as fuel.'
    ]
  },
  {
    id: 'news-tech-02',
    title: 'World Largest Solar Desalination Plant Supplies 2 Million People with Fresh Water',
    category: 'tech',
    newsGroup: 'tech',
    summary: 'A mega-facility powered entirely by rooftop solar arrays began full operation outside Dubai, converting Arabian Gulf seawater into crystal-clear drinking water with zero carbon footprint.',
    plainExplanation: 'The plant takes salty ocean water and uses clean solar electricity to filter out all the salt, giving millions of people unlimited fresh tap water.',
    location: 'Dubai, UAE',
    country: 'United Arab Emirates',
    coordinates: [25.2048, 55.2708],
    timestamp: '3 hours ago',
    severity: 'Major',
    source: 'Clean Water Engineering Journal',
    readTime: '2 min read',
    keyFacts: [
      'Produces 600 million liters of purified drinking water every day.',
      'Replaces older natural gas desalination boilers, preventing 300,000 tons of emissions yearly.',
      'Extracted sea minerals are recycled for agriculture and battery manufacturing.'
    ]
  },
  {
    id: 'news-tech-03',
    title: 'Quantum Computing Laboratory Solves 50-Year Biological Protein Folding Mystery',
    category: 'tech',
    newsGroup: 'tech',
    summary: 'Researchers in Massachusetts utilized a fault-tolerant quantum processor to calculate complex enzyme structures in seconds, paving the way for targeted cures for rare diseases.',
    plainExplanation: 'Computers that operate on the laws of quantum physics solved a biological puzzle that regular computers would have taken thousands of years to figure out.',
    location: 'Cambridge, Massachusetts, USA',
    country: 'United States',
    coordinates: [42.3736, -71.1097],
    timestamp: '5 hours ago',
    severity: 'Major',
    source: 'Nature Biotechnology & MIT Wire',
    readTime: '2 min read',
    keyFacts: [
      'Mapped over 4,000 previously unidentifiable human cellular proteins.',
      'Will accelerate the discovery of customized medicines and cancer antibodies.',
      'Computational test took 14 seconds compared to an estimated 800 years on classical supercomputers.'
    ]
  },

  // ==========================================
  // 4. WORLD & SOCIETY 🌍
  // ==========================================
  {
    id: 'news-world-01',
    title: 'Great Barrier Reef Coral Recovery Hits Landmark: 2 Million Seedlings Planted',
    category: 'world',
    newsGroup: 'world',
    summary: 'Marine biologists and Indigenous rangers off the coast of Cairns announced that heat-tolerant coral nurseries have successfully restored 140 square kilometers of thriving reef habitats.',
    plainExplanation: 'Scientists grew hardy, heat-resistant baby corals in ocean nurseries and planted them onto the reef. Millions of colorful fish, turtles, and rays have already returned.',
    location: 'Cairns, Australia',
    country: 'Australia',
    coordinates: [-16.9186, 145.7781],
    timestamp: '2 hours ago',
    severity: 'Major',
    source: 'Marine Ecology Institute',
    readTime: '2 min read',
    keyFacts: [
      '2,000,000 coral micro-colonies thriving with an 88% survival rate.',
      'Native sea turtles and manta rays recorded at highest density in 15 years.',
      'Technique being shared with reef restoration teams in the Caribbean and Red Sea.'
    ]
  },
  {
    id: 'news-world-02',
    title: 'Paris Marks One Year of Clean Public River Swimming Following Landmark Cleanup',
    category: 'world',
    newsGroup: 'world',
    summary: 'Citizens and tourists celebrated with an open-water swim in the River Seine after state-of-the-art underground rainwater reservoirs permanently halted city runoff contamination.',
    plainExplanation: 'After 100 years of being too dirty to swim in, the Seine river through Paris is now clean and sparkling, with public swimming spots open to everyone all summer.',
    location: 'Paris, France',
    country: 'France',
    coordinates: [48.8566, 2.3522],
    timestamp: '4 hours ago',
    severity: 'Developing',
    source: 'Paris Municipal Environmental Bureau',
    readTime: '2 min read',
    keyFacts: [
      'Three permanent free public bathing zones open along the riverbanks.',
      '32 different fish species now thrive in the Seine, up from only 2 in the 1970s.',
      'Massive underground storm basin stores 50,000 cubic meters of overflow rain.'
    ]
  },
  {
    id: 'news-world-03',
    title: 'Global Literacy Initiative Reaches 98% Primary School Enrollment in South Asia',
    category: 'world',
    newsGroup: 'world',
    summary: 'The United Nations Educational Agency reported in New Delhi that digital solar-powered tablet schools have connected over 15 million rural children to certified multilingual education.',
    plainExplanation: 'Kids in remote farming villages now have lightweight solar tablets packed with interactive storybooks and math games, boosting reading rates to historic highs.',
    location: 'New Delhi, India',
    country: 'India',
    coordinates: [28.6139, 77.209],
    timestamp: '6 hours ago',
    severity: 'Standard',
    source: 'UNESCO Education Monitor',
    readTime: '2 min read',
    keyFacts: [
      '98.2% of elementary-age children now enrolled in accredited learning programs.',
      'Tablets charge automatically from small solar roof panels with 48-hour battery life.',
      'Curriculum available in 22 regional languages with speech-to-text accessibility.'
    ]
  },

  // ==========================================
  // 5. EARTH DISASTERS & WEATHER ⚠️
  // (Earthquakes, Volcanoes, Wildfires, Hurricanes, Floods, Flights, Storms)
  // ==========================================
  {
    id: 'news-volc-01',
    title: 'Mount Marapi Volcano Erupts in Indonesia, Ash Cloud Reaches 4km',
    category: 'volcano',
    newsGroup: 'disasters',
    summary: 'Mount Marapi erupted suddenly with a loud rumble, shooting a towering gray ash cloud high into the sky. Local villages are covered in white ash, and airplanes have been warned to stay clear.',
    plainExplanation: 'The volcano had an explosive eruption. Ash in the air can damage airplane engines and make breathing difficult for people nearby.',
    location: 'West Sumatra, Indonesia',
    country: 'Indonesia',
    coordinates: [-0.381, 100.473],
    timestamp: '25 minutes ago',
    severity: 'Severe',
    source: 'Volcano Observatory & Flight Safety',
    readTime: '2 min read',
    keyFacts: [
      'Ash cloud reached 4,200 meters (13,700 feet) high.',
      'Red Alert issued for airplanes flying in the area.',
      'Residents within 4.5 km told to wear masks and stay indoors.'
    ],
    relatedEventId: 'volc-2026-01'
  },
  {
    id: 'news-eq-01',
    title: 'Strong Magnitude 6.7 Earthquake Shakes Coast of Northern Japan',
    category: 'earthquake',
    newsGroup: 'disasters',
    summary: 'A powerful earthquake struck offshore near Sendai. Buildings swayed back and forth for about 30 seconds. Coastal tsunami warning buoys turned on, but no dangerous giant waves were generated.',
    plainExplanation: 'A deep shift underground caused strong shaking on land. People felt shelves shake and furniture move, but modern buildings held up well.',
    location: 'Off Sendai Coast, Japan',
    country: 'Japan',
    coordinates: [38.297, 142.373],
    timestamp: '40 minutes ago',
    severity: 'High',
    source: 'Japan Weather & Earthquake Agency',
    readTime: '3 min read',
    keyFacts: [
      'Magnitude 6.7 (strong shaking).',
      'Felt strongly in cities across Miyagi Prefecture.',
      'Tsunami warning buoys activated as a precaution.'
    ],
    relatedEventId: 'eq-2026-081'
  },
  {
    id: 'news-hurr-01',
    title: 'Super Typhoon "Malakas" Spins with 260 km/h Winds in the Pacific',
    category: 'hurricane',
    newsGroup: 'disasters',
    summary: 'A monstrous Category 5 typhoon is churning over warm ocean waters. Satellite cameras show a perfectly round eye with massive storm clouds spreading hundreds of kilometers across the sea.',
    plainExplanation: 'A super typhoon is the same thing as a Category 5 hurricane. It has winds faster than a high-speed train and can create giant ocean waves.',
    location: 'Philippine Sea, Western Pacific',
    country: 'Philippines',
    coordinates: [15.421, 129.833],
    timestamp: '1 hour ago',
    severity: 'Severe',
    source: 'Joint Typhoon Warning Center',
    readTime: '2 min read',
    keyFacts: [
      'Sustained wind speed: 260 km/h (160 mph).',
      'Giant ocean waves up to 14 meters (45 feet) high.',
      'Ships and fishing boats warned to avoid the area.'
    ],
    relatedEventId: 'hurr-2026-01'
  },
  {
    id: 'news-flood-01',
    title: 'Rising Rivers Submerge City Streets in Southern Brazil',
    category: 'flood',
    newsGroup: 'disasters',
    summary: 'After three straight days of relentless downpours, rivers broke through levee walls and flooded entire neighborhoods. Boats and helicopters are rescuing residents stranded on rooftops.',
    plainExplanation: 'Too much rain fell too fast. When rivers overflow, streets become rivers and electrical power is shut off for safety.',
    location: 'Rio Grande do Sul, Brazil',
    country: 'Brazil',
    coordinates: [-29.981, -51.218],
    timestamp: '2 hours ago',
    severity: 'Severe',
    source: 'Emergency Rescue Services',
    readTime: '3 min read',
    keyFacts: [
      'Over 400 mm (16 inches) of rain in 72 hours.',
      'Water levels rose over 5 meters above normal.',
      'Over 100,000 people displaced from homes.'
    ],
    relatedEventId: 'flood-2026-01'
  },
  {
    id: 'news-fire-01',
    title: 'Huge Forest Fire in Brazil Sends Smoke Rolling Across State',
    category: 'wildfire',
    newsGroup: 'disasters',
    summary: 'Dry weather and gusty winds caused a massive brushfire to expand rapidly across the southern Amazon basin. Dense orange smoke can be seen from space, darkening the sky during the day.',
    plainExplanation: 'Dry trees and grass catch fire easily. Smoke from huge fires travels hundreds of miles and makes air smoky and hard to breathe.',
    location: 'Mato Grosso, Brazil',
    country: 'Brazil',
    coordinates: [-11.854, -55.512],
    timestamp: '3 hours ago',
    severity: 'High',
    source: 'National Space Research & Fire Service',
    readTime: '2 min read',
    keyFacts: [
      'More than 140,000 hectares burned.',
      'Air quality dropped to dangerous levels nearby.',
      'Firefighters working with water-dropping planes.'
    ],
    relatedEventId: 'fire-2026-01'
  },
  {
    id: 'news-volc-02',
    title: 'Iceland Volcano Erupts: Bright Orange Lava Fountains on Peninsula',
    category: 'volcano',
    newsGroup: 'disasters',
    summary: 'A new volcanic fissure cracked open on the Reykjanes peninsula, spraying fountains of glowing orange molten lava into the night air. The lava is moving away from homes.',
    plainExplanation: 'Iceland sits right over cracks in the Earth. Magma pushed up to the surface like a soda bottle bubbling over, creating glowing lava rivers.',
    location: 'Reykjanes Peninsula, Iceland',
    country: 'Iceland',
    coordinates: [63.879, -22.433],
    timestamp: '4 hours ago',
    severity: 'High',
    source: 'Iceland Meteorological Office',
    readTime: '2 min read',
    keyFacts: [
      'Lava shooting up to 50 meters into the air.',
      'Crack is 3.8 kilometers long.',
      'Protective dirt walls are steering lava away from towns.'
    ],
    relatedEventId: 'volc-2026-02'
  },
  {
    id: 'news-flight-01',
    title: 'Commercial Airliners Safely Rerouted Around Severe Weather Corridor',
    category: 'flight',
    newsGroup: 'disasters',
    summary: 'Aviation traffic control guided passenger planes around high-altitude convective turbulence and storm squalls over the Mediterranean, ensuring smooth and safe arrivals.',
    plainExplanation: 'Pilots use cockpit radar screens to detect turbulent air. Air traffic controllers gave them gentle detours so flights avoided rough bumps.',
    location: 'Mediterranean Air Corridor',
    country: 'Italy',
    coordinates: [38.1157, 13.3615],
    timestamp: '5 hours ago',
    severity: 'Moderate',
    source: 'Aviation Flight Tracker',
    readTime: '2 min read',
    keyFacts: [
      'Flights cruising at 36,000 to 40,000 feet safely diverted.',
      'Average detour added less than 12 minutes to flight times.',
      'All commercial landings on schedule with zero turbulence incidents.'
    ],
    relatedEventId: 'trans-air-01'
  },
  {
    id: 'news-storm-01',
    title: 'Violent Thunderstorms Bring Hail and Tornado Alerts to Central US',
    category: 'storm',
    newsGroup: 'disasters',
    summary: 'A fast-moving line of severe thunderstorms swept through Oklahoma and Kansas, bringing baseball-sized hail, damaging wind gusts, and frequent lightning.',
    plainExplanation: 'When warm moist air collides with cold dry air, giant storm clouds form that can spin and produce heavy rain, hail, and strong winds.',
    location: 'Oklahoma & Kansas, USA',
    country: 'United States',
    coordinates: [35.467, -97.516],
    timestamp: '6 hours ago',
    severity: 'High',
    source: 'National Weather Service',
    readTime: '3 min read',
    keyFacts: [
      'Wind gusts measured over 130 km/h (80 mph).',
      'Hail stones larger than golf balls reported.',
      'Power crews restoring electricity to knocked-down lines.'
    ],
    relatedEventId: 'wx-storm-01'
  },
  {
    id: 'news-flood-02',
    title: 'Flash Flood Turns City Streets into Canals in Eastern Spain',
    category: 'flood',
    newsGroup: 'disasters',
    summary: 'A sudden torrential rainstorm dropped months worth of rain in just a few hours around Valencia. Water rushed through city streets carrying parked cars and blocking subway stations.',
    plainExplanation: 'A flash flood happens when rain falls faster than city storm drains can carry it away. Water builds up in minutes.',
    location: 'Valencia, Spain',
    country: 'Spain',
    coordinates: [39.4699, -0.3763],
    timestamp: '7 hours ago',
    severity: 'High',
    source: 'Spain Meteorological Agency',
    readTime: '2 min read',
    keyFacts: [
      'Over 180 mm of rain fell in under 4 hours.',
      'Train lines and subway stations temporarily shut down.',
      'Emergency personnel guiding drivers to high ground.'
    ]
  },
  {
    id: 'news-eq-02',
    title: 'Magnitude 5.9 Earthquake Rattles Southern California',
    category: 'earthquake',
    newsGroup: 'disasters',
    summary: 'Residents across Southern California felt a sudden jolt and rolling motion as an earthquake struck near the Salton Sea fault zone. Pictures swung on walls and chandeliers swayed.',
    plainExplanation: 'The Earth crust moved along a fault line. The shaking was felt widely but caused no major building collapses.',
    location: 'Southern California, USA',
    country: 'United States',
    coordinates: [33.195, -115.542],
    timestamp: '8 hours ago',
    severity: 'Moderate',
    source: 'USGS Earthquake Program',
    readTime: '2 min read',
    keyFacts: [
      'Magnitude 5.9 at a depth of 8 km (shallow).',
      'Felt from San Diego to Los Angeles and Palm Springs.',
      'Minor cracks reported on older plaster walls.'
    ],
    relatedEventId: 'eq-2026-082'
  }
];
