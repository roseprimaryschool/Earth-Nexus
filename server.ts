import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// API: AI Intelligence Briefings & Tactical Threat Analysis using Gemini
app.post('/api/ai/briefing', async (req, res) => {
  const { type, event, country, events } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'GEMINI_API_KEY is not configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    let prompt = '';
    if (type === 'event' && event) {
      prompt = `You are Earth Nexus Tactical AI, an advanced planetary defense intelligence system.
Analyze this incident and generate a high-level tactical intelligence briefing:
Incident: ${event.title}
Category: ${event.category} (${event.subType})
Location: ${event.locationName}
Severity: ${event.severity}
Description: ${event.description}
Metrics: ${JSON.stringify(event.metrics || {})}

Provide a structured JSON output with the following exact keys:
{
  "summary": "2-3 crisp sentences synthesizing the tactical situation and kinetic/environmental dynamics",
  "threatAssessment": "2-3 sentences evaluating human, infrastructural, and regional exposure risks",
  "projectedCasualtiesOrImpact": "1-2 sentences estimating infrastructure failure rates, economic disruption, and displacement potential",
  "recommendedResponse": ["Direct tactical action 1", "Direct tactical action 2", "Direct tactical action 3", "Direct tactical action 4"],
  "strategicPosture": "A crisp defense alert status like 'DEFCON-2 GLOBAL EMERGENCY RESPONSE' or 'HEIGHTENED TACTICAL MONITORING'"
}
Return ONLY valid JSON with no markdown backticks or commentary.`;
    } else if (type === 'country' && country) {
      prompt = `You are Earth Nexus Tactical AI, an advanced planetary defense intelligence system.
Analyze this sovereign nation's strategic vulnerability and threat posture:
Country: ${country.name} (${country.region})
Population: ${(country.population / 1e6).toFixed(1)} million
GDP: $${country.gdpBillionUsd} Billion USD
Current Threat Score: ${country.threatScore}/100 [${country.threatLevel}]
Key Vulnerabilities: ${country.keyRisks?.join(', ')}
Active Incidents: ${JSON.stringify(events || [])}

Provide a structured JSON output with the following exact keys:
{
  "summary": "2-3 sentences assessing national strategic stability and environmental resilience",
  "threatAssessment": "2-3 sentences evaluating cascading vulnerabilities across power, logistics, and populations",
  "projectedCasualtiesOrImpact": "1-2 sentences analyzing critical supply chain bottlenecks and economic shock exposure",
  "recommendedResponse": ["Sovereign directive 1", "Sovereign directive 2", "Sovereign directive 3", "Sovereign directive 4"],
  "strategicPosture": "A defense posture like 'DEFCON-3 CRITICAL RESILIENCE POSTURE' or 'ROUTINE SURVEILLANCE POSTURE'"
}
Return ONLY valid JSON with no markdown backticks or commentary.`;
    } else {
      return res.status(400).json({ error: 'Invalid request payload' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);
    return res.json(parsed);
  } catch (err: any) {
    console.error('Gemini API briefing error:', err);
    return res.status(500).json({ error: err.message || 'AI generation failed' });
  }
});

// Top International Airport Dictionary for Live ADS-B Route Resolution
const AIRPORTS: Record<string, { name: string; coords: [number, number] }> = {
  DXB: { name: 'Dubai International (DXB)', coords: [25.2532, 55.3657] },
  AKL: { name: 'Auckland Airport (AKL)', coords: [-37.0082, 174.7850] },
  SFO: { name: 'San Francisco International (SFO)', coords: [37.6213, -122.3790] },
  MEL: { name: 'Melbourne Airport (MEL)', coords: [-37.6690, 144.8410] },
  LAX: { name: 'Los Angeles International (LAX)', coords: [33.9416, -118.4085] },
  HKG: { name: 'Hong Kong International (HKG)', coords: [22.3080, 113.9185] },
  LHR: { name: 'London Heathrow (LHR)', coords: [51.4700, -0.4543] },
  JFK: { name: 'New York JFK (JFK)', coords: [40.6413, -73.7781] },
  SIN: { name: 'Singapore Changi (SIN)', coords: [1.3644, 103.9915] },
  HND: { name: 'Tokyo Haneda (HND)', coords: [35.5494, 139.7798] },
  NRT: { name: 'Tokyo Narita (NRT)', coords: [35.7720, 140.3929] },
  CDG: { name: 'Paris Charles de Gaulle (CDG)', coords: [49.0097, 2.5479] },
  FRA: { name: 'Frankfurt Airport (FRA)', coords: [50.0379, 8.5622] },
  SYD: { name: 'Sydney Kingsford Smith (SYD)', coords: [-33.9399, 151.1753] },
  ORD: { name: "Chicago O'Hare (ORD)", coords: [41.9742, -87.9073] },
  ATL: { name: 'Atlanta Hartsfield-Jackson (ATL)', coords: [33.6407, -84.4277] },
  DFW: { name: 'Dallas/Fort Worth (DFW)', coords: [32.8998, -97.0403] },
  MIA: { name: 'Miami International (MIA)', coords: [25.7959, -80.2870] },
  SEA: { name: 'Seattle-Tacoma (SEA)', coords: [47.4502, -122.3088] },
  AMS: { name: 'Amsterdam Schiphol (AMS)', coords: [52.3105, 4.7683] },
  MAD: { name: 'Madrid Barajas (MAD)', coords: [40.4839, -3.5680] },
  FCO: { name: 'Rome Fiumicino (FCO)', coords: [41.8003, 12.2389] },
  ZRH: { name: 'Zurich Airport (ZRH)', coords: [47.4582, 8.5555] },
  CPH: { name: 'Copenhagen Airport (CPH)', coords: [55.6180, 12.6508] },
  DOH: { name: 'Doha Hamad (DOH)', coords: [25.2731, 51.6081] },
  ICN: { name: 'Seoul Incheon (ICN)', coords: [37.4602, 126.4407] },
  TPE: { name: 'Taipei Taoyuan (TPE)', coords: [25.0797, 121.2342] },
  BKK: { name: 'Bangkok Suvarnabhumi (BKK)', coords: [13.6900, 100.7501] },
  KUL: { name: 'Kuala Lumpur International (KUL)', coords: [2.7456, 101.7072] },
  DEL: { name: 'Delhi Indira Gandhi (DEL)', coords: [28.5562, 77.1000] },
  BOM: { name: 'Mumbai Chhatrapati Shivaji (BOM)', coords: [19.0896, 72.8656] },
  GRU: { name: 'São Paulo-Guarulhos (GRU)', coords: [-23.4356, -46.4731] },
  EZE: { name: 'Buenos Aires Ezeiza (EZE)', coords: [-34.8222, -58.5358] },
  SCL: { name: 'Santiago de Chile (SCL)', coords: [-33.3930, -70.7858] },
  MEX: { name: 'Mexico City Benito Juárez (MEX)', coords: [19.4363, -99.0721] },
  YVR: { name: 'Vancouver International (YVR)', coords: [49.1967, -123.1815] },
  YYZ: { name: 'Toronto Pearson (YYZ)', coords: [43.6777, -79.6248] },
  JNB: { name: 'Johannesburg O.R. Tambo (JNB)', coords: [-26.1367, 28.2411] },
  CAI: { name: 'Cairo International (CAI)', coords: [30.1219, 31.4056] },
  DEN: { name: 'Denver International (DEN)', coords: [39.8561, -104.6737] },
  BOS: { name: 'Boston Logan (BOS)', coords: [42.3656, -71.0096] },
  MCO: { name: 'Orlando International (MCO)', coords: [28.4312, -81.3081] },
  LAS: { name: 'Las Vegas Harry Reid (LAS)', coords: [36.0840, -115.1537] },
  EWR: { name: 'Newark Liberty (EWR)', coords: [40.6895, -74.1745] },
  PHX: { name: 'Phoenix Sky Harbor (PHX)', coords: [33.4373, -112.0078] },
  IAH: { name: 'Houston George Bush (IAH)', coords: [29.9902, -95.3368] },
  MUC: { name: 'Munich Airport (MUC)', coords: [48.3537, 11.7750] },
  BCN: { name: 'Barcelona El Prat (BCN)', coords: [41.2974, 2.0833] },
  VIE: { name: 'Vienna International (VIE)', coords: [48.1103, 16.5697] },
  IST: { name: 'Istanbul Airport (IST)', coords: [41.2753, 28.7519] },
  BNE: { name: 'Brisbane Airport (BNE)', coords: [-27.3842, 153.1175] },
  PER: { name: 'Perth Airport (PER)', coords: [-31.9403, 115.9668] },
  PEK: { name: 'Beijing Capital (PEK)', coords: [40.0799, 116.6031] },
  PVG: { name: 'Shanghai Pudong (PVG)', coords: [31.1443, 121.8083] },
  CAN: { name: 'Guangzhou Baiyun (CAN)', coords: [23.3924, 113.2988] },
};

const AIRLINES: Record<string, { name: string; color: number }> = {
  UAE: { name: 'Emirates', color: 0xb91c1c },
  UAL: { name: 'United Airlines', color: 0x1d4ed8 },
  AAL: { name: 'American Airlines', color: 0x2563eb },
  DAL: { name: 'Delta Air Lines', color: 0x991b1b },
  BAW: { name: 'British Airways', color: 0x1e40af },
  AFR: { name: 'Air France', color: 0x1d4ed8 },
  DLH: { name: 'Lufthansa', color: 0x1e3a8a },
  KLM: { name: 'KLM Royal Dutch Airlines', color: 0x0284c7 },
  SIA: { name: 'Singapore Airlines', color: 0xeab308 },
  QFA: { name: 'Qantas', color: 0xdc2626 },
  JAL: { name: 'Japan Airlines', color: 0xb91c1c },
  ANA: { name: 'All Nippon Airways', color: 0x0284c7 },
  CPA: { name: 'Cathay Pacific', color: 0x047857 },
  QTR: { name: 'Qatar Airways', color: 0x831843 },
  ETD: { name: 'Etihad Airways', color: 0xd97706 },
  THY: { name: 'Turkish Airlines', color: 0x991b1b },
  SWA: { name: 'Southwest Airlines', color: 0x0284c7 },
  ACA: { name: 'Air Canada', color: 0xdc2626 },
  SAS: { name: 'Scandinavian Airlines', color: 0x1e3a8a },
  FIN: { name: 'Finnair', color: 0x1e40af },
  IBE: { name: 'Iberia', color: 0xdc2626 },
  VIR: { name: 'Virgin Atlantic', color: 0xb91c1c },
  ANZ: { name: 'Air New Zealand', color: 0x111827 },
  KAL: { name: 'Korean Air', color: 0x0284c7 },
  CCA: { name: 'Air China', color: 0xb91c1c },
  CSN: { name: 'China Southern', color: 0x0284c7 },
  CES: { name: 'China Eastern', color: 0x2563eb },
  EVA: { name: 'EVA Air', color: 0x047857 },
  TAP: { name: 'TAP Air Portugal', color: 0x16a34a },
  RYR: { name: 'Ryanair', color: 0x0284c7 },
  EZY: { name: 'easyJet', color: 0xf97316 },
  WZZ: { name: 'Wizz Air', color: 0xdb2777 },
};

const AIRCRAFT_MODELS: Record<string, string> = {
  A388: 'Airbus A380-800 Superjumbo',
  A359: 'Airbus A350-900',
  A35K: 'Airbus A350-1000',
  A333: 'Airbus A330-300',
  A339: 'Airbus A330-900neo',
  A321: 'Airbus A321neo',
  A320: 'Airbus A320',
  A21N: 'Airbus A321neo',
  A20N: 'Airbus A320neo',
  B789: 'Boeing 787-9 Dreamliner',
  B788: 'Boeing 787-8 Dreamliner',
  B78X: 'Boeing 787-10 Dreamliner',
  B77W: 'Boeing 777-300ER',
  B77L: 'Boeing 777-200LR',
  B772: 'Boeing 777-200',
  B748: 'Boeing 747-8 Intercontinental',
  B744: 'Boeing 747-400',
  B763: 'Boeing 767-300',
  B738: 'Boeing 737-800',
  B38M: 'Boeing 737 MAX 8',
  B39M: 'Boeing 737 MAX 9',
};

// In-memory cache for live flights
let flightCache: any[] = [];
let lastFlightFetchTime = 0;
const FLIGHT_CACHE_TTL_MS = 20000; // 20s cache

// API: Live Real Aircraft from FlightRadar24 ADS-B Receiver Network
app.get('/api/flights/live', async (_req, res) => {
  const now = Date.now();
  if (flightCache.length > 0 && now - lastFlightFetchTime < FLIGHT_CACHE_TTL_MS) {
    return res.json({ flights: flightCache, cached: true, timestamp: now });
  }

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json',
    };
    const response = await fetch(
      'https://data-cloud.flightradar24.com/zones/fcgi/feed.js?bounds=85,-85,-180,180&faa=1&satellite=1&mlat=1&gliders=0&stats=0',
      { headers, signal: AbortSignal.timeout(7000) }
    );

    if (!response.ok) {
      throw new Error(`Flight radar upstream HTTP ${response.status}`);
    }

    const data: any = await response.json();
    const keys = Object.keys(data).filter((k) => k !== 'full_count' && k !== 'version');

    const cleanFlights: any[] = [];
    for (const k of keys) {
      const raw = data[k];
      if (!Array.isArray(raw)) continue;

      const [
        hex, lat, lng, track, altFt, speedKts,
        _squawk, _radar, modelCode, reg, timestamp,
        origCode, destCode, flightNo, _1, _2, callsign, _3, airlineCode
      ] = raw;

      // Filter airborne commercial aircraft at cruising or en route altitudes
      if (!lat || !lng || !altFt || altFt < 7000 || typeof lat !== 'number' || typeof lng !== 'number') {
        continue;
      }

      const flightIdentifier = flightNo || callsign;
      if (!flightIdentifier) continue;

      const airlineInfo = AIRLINES[airlineCode] || {
        name: airlineCode || 'Commercial Airliner',
        color: 0x0ea5e9,
      };

      const resolvedModel = AIRCRAFT_MODELS[modelCode] || modelCode || 'Commercial Jet';

      // Airport lookups
      let originName = origCode || 'Departure';
      let destName = destCode || 'Destination';
      let origCoords: [number, number] | null = null;
      let destCoords: [number, number] | null = null;

      if (origCode && AIRPORTS[origCode]) {
        originName = AIRPORTS[origCode].name;
        origCoords = AIRPORTS[origCode].coords;
      }
      if (destCode && AIRPORTS[destCode]) {
        destName = AIRPORTS[destCode].name;
        destCoords = AIRPORTS[destCode].coords;
      }

      // If either airport is not known, project along real aircraft heading vector
      const heading = typeof track === 'number' ? track : 0;
      const headingRad = (heading * Math.PI) / 180;
      if (!origCoords) {
        origCoords = [
          Math.max(-85, Math.min(85, lat - Math.cos(headingRad) * 8)),
          lng - Math.sin(headingRad) * 8,
        ];
      }
      if (!destCoords) {
        destCoords = [
          Math.max(-85, Math.min(85, lat + Math.cos(headingRad) * 12)),
          lng + Math.sin(headingRad) * 12,
        ];
      }

      // Calculate initial progress based on position between origin and destination
      const dLat = destCoords[0] - origCoords[0];
      const dLng = destCoords[1] - origCoords[1];
      const totalDist = Math.hypot(dLat, dLng);
      let progress = 0.5;
      if (totalDist > 0.1) {
        const pLat = lat - origCoords[0];
        const pLng = lng - origCoords[1];
        const proj = (pLat * dLat + pLng * dLng) / (totalDist * totalDist);
        progress = Math.max(0.05, Math.min(0.95, proj));
      }

      cleanFlights.push({
        id: `real-adsb-${hex || k}`,
        hex,
        callsign: flightIdentifier,
        flightNumber: flightIdentifier,
        airline: airlineInfo.name,
        aircraftModel: `${resolvedModel} (${reg || hex})`,
        registration: reg || hex,
        origin: originName,
        destination: destName,
        originCoords: origCoords,
        destinationCoords: destCoords,
        coordinates: [lat, lng],
        altitudeFt: altFt,
        speedKnots: speedKts || 480,
        heading,
        flightProgress: progress,
        airlineColor: airlineInfo.color,
        timestamp: timestamp ? timestamp * 1000 : now,
      });

      // Cap at 65 high-priority flights across the globe for optimal performance
      if (cleanFlights.length >= 65) break;
    }

    if (cleanFlights.length > 0) {
      flightCache = cleanFlights;
      lastFlightFetchTime = now;
      return res.json({ flights: cleanFlights, cached: false, count: cleanFlights.length, timestamp: now });
    } else {
      return res.json({ flights: flightCache, cached: true, timestamp: now });
    }
  } catch (err: any) {
    console.warn('Flight radar live fetch error, using cached:', err.message);
    return res.json({ flights: flightCache, cached: true, timestamp: now, error: err.message });
  }
});

// In-memory cache for live news
let newsCache: any[] = [];
let lastNewsFetchTime = 0;
const NEWS_CACHE_TTL_MS = 60000; // 60s cache

// API: Live Real News Headlines from BBC Wire
app.get('/api/news/live', async (_req, res) => {
  const now = Date.now();
  if (newsCache.length > 0 && now - lastNewsFetchTime < NEWS_CACHE_TTL_MS) {
    return res.json({ articles: newsCache, cached: true, timestamp: now });
  }

  const feedSources = [
    { group: 'world', cat: 'world', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World News (Live)' },
    { group: 'politics', cat: 'politics', url: 'http://feeds.bbci.co.uk/news/politics/rss.xml', source: 'BBC Politics (Live)' },
    { group: 'business', cat: 'business', url: 'http://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business (Live)' },
    { group: 'tech', cat: 'tech', url: 'http://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Technology (Live)' },
  ];

  try {
    const feedPromises = feedSources.map(async (src) => {
      try {
        const response = await fetch(src.url, { signal: AbortSignal.timeout(5000) });
        if (!response.ok) return [];
        const xml = await response.text();
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        const items: any[] = [];
        let match;
        let count = 0;
        while ((match = itemRegex.exec(xml)) !== null && count < 8) {
          const block = match[1];
          const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
          const descMatch = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
          const linkMatch = block.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/);
          const pubMatch = block.match(/<pubDate>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/pubDate>/);

          const title = titleMatch ? titleMatch[1].trim() : '';
          const desc = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';
          const link = linkMatch ? linkMatch[1].trim() : '';
          const pubDate = pubMatch ? pubMatch[1].trim() : '';

          if (title && !title.includes('BBC News')) {
            items.push({
              title,
              summary: desc || `${title} - Live international dispatch.`,
              category: src.cat,
              newsGroup: src.group,
              source: src.source,
              url: link,
              pubDate,
            });
            count++;
          }
        }
        return items;
      } catch (e) {
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    const combined = results.flat();
    if (combined.length > 0) {
      newsCache = combined;
      lastNewsFetchTime = now;
      return res.json({ articles: combined, cached: false, count: combined.length, timestamp: now });
    }
    return res.json({ articles: newsCache, cached: true, timestamp: now });
  } catch (err: any) {
    return res.json({ articles: newsCache, cached: true, timestamp: now, error: err.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Earth Nexus Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
