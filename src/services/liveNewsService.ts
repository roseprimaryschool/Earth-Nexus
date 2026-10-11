import { NewsArticle, NewsCategory } from '../types/nexus';
import { MOCK_NEWS_ARTICLES } from '../data/newsData';

// Geographic reference for mapping live global news headlines to coordinates
const GEOGRAPHIC_LOOKUP: Record<string, { coords: [number, number]; location: string; country: string }> = {
  // Countries & Major Cities
  'united states': { coords: [38.9072, -77.0369], location: 'Washington D.C., USA', country: 'United States' },
  'us': { coords: [38.9072, -77.0369], location: 'Washington D.C., USA', country: 'United States' },
  'usa': { coords: [38.9072, -77.0369], location: 'Washington D.C., USA', country: 'United States' },
  'america': { coords: [38.9072, -77.0369], location: 'Washington D.C., USA', country: 'United States' },
  'uk': { coords: [51.5074, -0.1278], location: 'London, United Kingdom', country: 'United Kingdom' },
  'britain': { coords: [51.5074, -0.1278], location: 'London, United Kingdom', country: 'United Kingdom' },
  'london': { coords: [51.5074, -0.1278], location: 'London, United Kingdom', country: 'United Kingdom' },
  'france': { coords: [48.8566, 2.3522], location: 'Paris, France', country: 'France' },
  'paris': { coords: [48.8566, 2.3522], location: 'Paris, France', country: 'France' },
  'germany': { coords: [52.5200, 13.4050], location: 'Berlin, Germany', country: 'Germany' },
  'berlin': { coords: [52.5200, 13.4050], location: 'Berlin, Germany', country: 'Germany' },
  'japan': { coords: [35.6762, 139.6503], location: 'Tokyo, Japan', country: 'Japan' },
  'tokyo': { coords: [35.6762, 139.6503], location: 'Tokyo, Japan', country: 'Japan' },
  'china': { coords: [39.9042, 116.4074], location: 'Beijing, China', country: 'China' },
  'beijing': { coords: [39.9042, 116.4074], location: 'Beijing, China', country: 'China' },
  'india': { coords: [28.6139, 77.2090], location: 'New Delhi, India', country: 'India' },
  'russia': { coords: [55.7558, 37.6173], location: 'Moscow, Russia', country: 'Russia' },
  'moscow': { coords: [55.7558, 37.6173], location: 'Moscow, Russia', country: 'Russia' },
  'ukraine': { coords: [50.4501, 30.5234], location: 'Kyiv, Ukraine', country: 'Ukraine' },
  'kyiv': { coords: [50.4501, 30.5234], location: 'Kyiv, Ukraine', country: 'Ukraine' },
  'israel': { coords: [31.7683, 35.2137], location: 'Jerusalem, Israel', country: 'Israel' },
  'gaza': { coords: [31.5017, 34.4668], location: 'Gaza City', country: 'Palestine' },
  'iran': { coords: [35.6892, 51.3890], location: 'Tehran, Iran', country: 'Iran' },
  'saudi': { coords: [24.7136, 46.6753], location: 'Riyadh, Saudi Arabia', country: 'Saudi Arabia' },
  'riyadh': { coords: [24.7136, 46.6753], location: 'Riyadh, Saudi Arabia', country: 'Saudi Arabia' },
  'turkey': { coords: [39.9334, 32.8597], location: 'Ankara, Turkey', country: 'Turkey' },
  'brazil': { coords: [-15.8267, -47.9218], location: 'Brasília, Brazil', country: 'Brazil' },
  'canada': { coords: [45.4215, -75.6972], location: 'Ottawa, Canada', country: 'Canada' },
  'australia': { coords: [-35.2809, 149.1300], location: 'Canberra, Australia', country: 'Australia' },
  'sydney': { coords: [-33.8688, 151.2093], location: 'Sydney, Australia', country: 'Australia' },
  'south korea': { coords: [37.5665, 126.9780], location: 'Seoul, South Korea', country: 'South Korea' },
  'seoul': { coords: [37.5665, 126.9780], location: 'Seoul, South Korea', country: 'South Korea' },
  'taiwan': { coords: [25.0330, 121.5654], location: 'Taipei, Taiwan', country: 'Taiwan' },
  'singapore': { coords: [1.3521, 103.8198], location: 'Singapore', country: 'Singapore' },
  'egypt': { coords: [30.0444, 31.2357], location: 'Cairo, Egypt', country: 'Egypt' },
  'cairo': { coords: [30.0444, 31.2357], location: 'Cairo, Egypt', country: 'Egypt' },
  'south africa': { coords: [-25.7479, 28.2293], location: 'Pretoria, South Africa', country: 'South Africa' },
  'nigeria': { coords: [9.0765, 7.3986], location: 'Abuja, Nigeria', country: 'Nigeria' },
  'kenya': { coords: [-1.2921, 36.8219], location: 'Nairobi, Kenya', country: 'Kenya' },
  'mexico': { coords: [19.4326, -99.1332], location: 'Mexico City, Mexico', country: 'Mexico' },
  'argentina': { coords: [-34.6037, -58.3816], location: 'Buenos Aires, Argentina', country: 'Argentina' },
  'italy': { coords: [41.9028, 12.4964], location: 'Rome, Italy', country: 'Italy' },
  'rome': { coords: [41.9028, 12.4964], location: 'Rome, Italy', country: 'Italy' },
  'spain': { coords: [40.4168, -3.7038], location: 'Madrid, Spain', country: 'Spain' },
  'madrid': { coords: [40.4168, -3.7038], location: 'Madrid, Spain', country: 'Spain' },
  'netherlands': { coords: [52.3676, 4.9041], location: 'Amsterdam, Netherlands', country: 'Netherlands' },
  'switzerland': { coords: [46.9480, 7.4474], location: 'Bern, Switzerland', country: 'Switzerland' },
  'geneva': { coords: [46.2044, 6.1432], location: 'Geneva, Switzerland', country: 'Switzerland' },
  'brussels': { coords: [50.8503, 4.3517], location: 'Brussels, Belgium', country: 'Belgium' },
};

function detectLocation(text: string): { coords: [number, number]; location: string; country: string } {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(GEOGRAPHIC_LOOKUP)) {
    // Word boundary check
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(lower)) {
      return val;
    }
  }
  // Default to global international center (Geneva / UN)
  return {
    coords: [46.2044, 6.1432],
    location: 'International / Geneva',
    country: 'Switzerland',
  };
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Just now';
  try {
    const pub = new Date(dateStr).getTime();
    if (isNaN(pub)) return 'Today';
    const now = Date.now();
    const diffMs = Math.max(0, now - pub);
    const diffMins = Math.round(diffMs / (1000 * 60));
    if (diffMins < 5) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '').trim();
}

export interface LiveNewsState {
  articles: NewsArticle[];
  isLive: boolean;
  isLoading: boolean;
  lastUpdated: string;
  sourceBreakdown: {
    world: number;
    politics: number;
    business: number;
    tech: number;
    disasters: number;
  };
}

// Global cache
let cachedLiveState: LiveNewsState | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 1000 * 60 * 3; // 3 minutes

export async function fetchRealLiveNews(forceRefresh = false): Promise<LiveNewsState> {
  const now = Date.now();
  if (!forceRefresh && cachedLiveState && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedLiveState;
  }

  const liveArticles: NewsArticle[] = [];
  let isLiveSuccessful = false;

  // 1. Try server-side live BBC News Wire endpoint first (/api/news/live)
  try {
    const serverRes = await fetch('/api/news/live');
    if (serverRes.ok) {
      const serverData = await serverRes.json();
      if (Array.isArray(serverData.articles) && serverData.articles.length > 0) {
        isLiveSuccessful = true;
        serverData.articles.forEach((item: any, idx: number) => {
          const loc = detectLocation(`${item.title} ${item.summary || ''}`);
          const relTime = formatRelativeTime(item.pubDate);
          liveArticles.push({
            id: `live-wire-${item.category}-${idx}-${Date.now() % 10000}`,
            title: item.title,
            category: item.category as NewsCategory,
            newsGroup: item.newsGroup,
            summary: item.summary,
            plainExplanation: `Real-time BBC dispatch: ${item.summary.slice(0, 190)}...`,
            location: loc.location,
            country: loc.country,
            coordinates: loc.coords,
            timestamp: relTime,
            severity: idx === 0 ? 'Breaking' : 'Major',
            source: item.source || 'BBC World News (Live Wire)',
            readTime: '2 min read',
            keyFacts: [
              `Dispatched live via ${item.source || 'BBC News Wire'}`,
              `Reported: ${relTime}`,
              `Location: ${loc.location}`
            ],
            url: item.url,
          });
        });
      }
    }
  } catch (err) {
    console.warn('Server news proxy fetch error, attempting client RSS:', err);
  }

  // 2. Fallback to client-side RSS2JSON if server endpoint returned empty
  if (liveArticles.length === 0) {
    const feedUrls = [
      {
        group: 'world' as const,
        category: 'world' as const,
        url: 'https://api.rss2json.com/v1/api.json?rss_url=http://feeds.bbci.co.uk/news/world/rss.xml',
        sourceName: 'BBC World News (Live)',
      },
      {
        group: 'politics' as const,
        category: 'politics' as const,
        url: 'https://api.rss2json.com/v1/api.json?rss_url=http://feeds.bbci.co.uk/news/politics/rss.xml',
        sourceName: 'BBC Politics (Live)',
      },
      {
        group: 'business' as const,
        category: 'business' as const,
        url: 'https://api.rss2json.com/v1/api.json?rss_url=http://feeds.bbci.co.uk/news/business/rss.xml',
        sourceName: 'BBC Business (Live)',
      },
      {
        group: 'tech' as const,
        category: 'tech' as const,
        url: 'https://api.rss2json.com/v1/api.json?rss_url=http://feeds.bbci.co.uk/news/technology/rss.xml',
        sourceName: 'BBC Technology (Live)',
      },
    ];

    try {
      const feedPromises = feedUrls.map(async (feed) => {
        try {
          const res = await fetch(feed.url, { cache: 'no-cache' });
          if (!res.ok) return [];
          const json = await res.json();
          if (json.status !== 'ok' || !Array.isArray(json.items)) return [];

          isLiveSuccessful = true;
          return json.items.slice(0, 8).map((item: any, idx: number): NewsArticle => {
            const title = item.title || 'Breaking Global News';
            const cleanDesc = stripHtml(item.description || item.content || '');
            const loc = detectLocation(`${title} ${cleanDesc}`);
            const relTime = formatRelativeTime(item.pubDate);

            return {
              id: `live-feed-${feed.category}-${idx}-${Date.now() % 10000}`,
              title,
              category: feed.category,
              newsGroup: feed.group,
              summary: cleanDesc.length > 20 ? cleanDesc : `${title} - Live dispatch reported directly by international correspondents.`,
              plainExplanation: cleanDesc.length > 20 
                ? `Real-time verified report: ${cleanDesc.slice(0, 180)}...`
                : `Live international news coverage regarding ${title}.`,
              location: loc.location,
              country: loc.country,
              coordinates: loc.coords,
              timestamp: relTime,
              severity: idx === 0 ? 'Breaking' : 'Major',
              source: feed.sourceName,
              readTime: '2 min read',
              keyFacts: [
                `Reported live on ${new Date(item.pubDate || Date.now()).toLocaleDateString()}`,
                `Dispatched via ${feed.sourceName}`,
                `Location: ${loc.location}`
              ],
              url: item.link || undefined,
              imageUrl: item.thumbnail || item.enclosure?.link || undefined,
            };
          });
        } catch (err) {
          console.warn(`Failed to fetch ${feed.sourceName}:`, err);
          return [];
        }
      });

      const results = await Promise.all(feedPromises);
      results.forEach((arr) => liveArticles.push(...arr));
    } catch {
      // Ignored
    }
  }

  // 2. Fetch Live USGS Earthquakes for Disasters Tab
  try {
    const usgsRes = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson', { cache: 'no-cache' });
    if (usgsRes.ok) {
      const usgsData = await usgsRes.json();
      if (Array.isArray(usgsData.features)) {
        isLiveSuccessful = true;
        const liveQuakes: NewsArticle[] = usgsData.features.slice(0, 5).map((feat: any, idx: number) => {
          const mag = feat.properties.mag || 5.0;
          const place = feat.properties.place || 'Seismic Zone';
          const coords = feat.geometry.coordinates; // [lng, lat]
          const time = new Date(feat.properties.time).toISOString();

          return {
            id: `live-usgs-${feat.id || idx}`,
            title: `Magnitude ${mag.toFixed(1)} Earthquake Strikes ${place}`,
            category: 'earthquake',
            newsGroup: 'disasters',
            summary: `A magnitude ${mag.toFixed(1)} earthquake was recorded live by USGS seismic monitoring sensors at a depth of ${Math.round(coords[2] || 10)} km.`,
            plainExplanation: `An underground rock shift created strong shaking waves recorded by global sensors.`,
            location: place,
            country: place.split(',').pop()?.trim() || 'Global',
            coordinates: [coords[1], coords[0]], // [lat, lng]
            timestamp: formatRelativeTime(time),
            severity: mag >= 6.5 ? 'Severe' : mag >= 5.5 ? 'High' : 'Moderate',
            source: 'USGS Real-Time Earthquake Wire',
            readTime: '1 min read',
            keyFacts: [
              `Magnitude: ${mag.toFixed(1)}`,
              `Depth: ${Math.round(coords[2] || 10)} km`,
              `Tsunami Alert: ${feat.properties.tsunami === 1 ? 'Yes' : 'No tsunami threat'}`
            ],
            url: feat.properties.url || undefined,
            relatedEventId: `usgs-${feat.id}`
          };
        });
        liveArticles.push(...liveQuakes);
      }
    }
  } catch (err) {
    console.warn('Live USGS news error:', err);
  }

  // 3. Fallback & Enrichment with Curated Articles
  // If live feeds returned items, prepend them to the curated database, avoiding duplicates.
  // If offline/error, use MOCK_NEWS_ARTICLES.
  let combinedArticles: NewsArticle[] = [];
  if (liveArticles.length > 0) {
    // Put live breaking news first, followed by curated news in categories that didn't get enough live items
    const nonDisasterCurated = MOCK_NEWS_ARTICLES.filter(
      (m) => m.newsGroup !== 'disasters' && !liveArticles.some((l) => l.title.toLowerCase() === m.title.toLowerCase())
    );
    const disasterCurated = MOCK_NEWS_ARTICLES.filter((m) => m.newsGroup === 'disasters');

    combinedArticles = [
      ...liveArticles,
      ...nonDisasterCurated,
      ...disasterCurated,
    ];
  } else {
    combinedArticles = [...MOCK_NEWS_ARTICLES];
  }

  // Count breakdown
  const sourceBreakdown = {
    world: combinedArticles.filter((a) => a.newsGroup === 'world' || a.category === 'world').length,
    politics: combinedArticles.filter((a) => a.newsGroup === 'politics' || a.category === 'politics').length,
    business: combinedArticles.filter((a) => a.newsGroup === 'business' || a.category === 'business').length,
    tech: combinedArticles.filter((a) => a.newsGroup === 'tech' || a.category === 'tech').length,
    disasters: combinedArticles.filter((a) => a.newsGroup === 'disasters' || ['earthquake', 'volcano', 'wildfire', 'hurricane', 'flood', 'flight', 'storm'].includes(a.category)).length,
  };

  const newState: LiveNewsState = {
    articles: combinedArticles,
    isLive: isLiveSuccessful || liveArticles.length > 0,
    isLoading: false,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' }) + ' UTC',
    sourceBreakdown,
  };

  cachedLiveState = newState;
  lastFetchTime = now;
  return newState;
}
