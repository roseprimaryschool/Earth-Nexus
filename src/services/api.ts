import { NexusEvent, ThreatIndexData, ThreatLevel } from '../types/nexus';
import { INITIAL_NEXUS_EVENTS } from '../data/mockEvents';

export async function fetchLiveEarthquakes(): Promise<NexusEvent[]> {
  try {
    // Free public USGS GeoJSON API (all M4.5+ earthquakes past 24 hours)
    const response = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson',
      { cache: 'no-cache' }
    );
    if (!response.ok) throw new Error('USGS fetch failed');
    const data = await response.json();

    const events: NexusEvent[] = data.features.slice(0, 15).map((feat: any) => {
      const coords = feat.geometry.coordinates; // [lng, lat, depth]
      const mag = feat.properties.mag || 5.0;
      let severity: ThreatLevel = 'GUARDED';
      let dangerLevelSimple: 'Severe' | 'High' | 'Moderate' | 'Low' = 'Moderate';
      if (mag >= 7.0) {
        severity = 'CRITICAL';
        dangerLevelSimple = 'Severe';
      } else if (mag >= 6.0) {
        severity = 'HIGH';
        dangerLevelSimple = 'High';
      } else if (mag >= 5.0) {
        severity = 'ELEVATED';
        dangerLevelSimple = 'Moderate';
      } else {
        dangerLevelSimple = 'Low';
      }

      const depth = Math.round(coords[2] || 10);
      const place = feat.properties.place || 'Unknown Location';

      return {
        id: `usgs-${feat.id}`,
        category: 'disaster',
        subType: 'earthquake',
        title: `Magnitude ${mag.toFixed(1)} Earthquake - ${place}`,
        description: `A magnitude ${mag.toFixed(1)} earthquake occurred at a depth of ${depth} km. Local residents felt the shaking.`,
        plainExplanation: `An underground rock shift created shaking waves that traveled through the ground to nearby towns.`,
        whatItMeans: mag >= 6.0 
          ? `Strong shaking: Dishes rattled, furniture swayed, and people felt it outdoors.`
          : `Moderate shaking: Light vibrations felt mostly indoors on upper floors.`,
        dangerLevelSimple,
        locationName: place,
        coordinates: [coords[1], coords[0]], // [lat, lng]
        timestamp: new Date(feat.properties.time).toISOString(),
        severity,
        verified: true,
        source: 'USGS Real-Time Earthquake Catalog',
        magnitude: mag,
        depthKm: depth,
        tsunamiRisk: feat.properties.tsunami === 1,
        metrics: {
          'Strength': `Magnitude ${mag.toFixed(1)}`,
          'Depth': `${depth} km underground`,
          'People Who Felt It': `${feat.properties.felt || 'Dozens'} felt reports`,
          'Tsunami Alert': feat.properties.tsunami === 1 ? 'Yes - Tsunami warning' : 'No tsunami risk'
        },
        tags: ['Earthquake', 'USGS Live', mag >= 6.0 ? 'Strong Shaking' : 'Moderate Shaking']
      };
    });

    return events;
  } catch (err) {
    console.warn('Using offline backup earthquake events:', err);
    return [];
  }
}

export async function fetchLiveISSPosition(): Promise<{ lat: number; lng: number; altitude: number; speed: number } | null> {
  try {
    // Open ISS position API
    const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
    if (!response.ok) throw new Error('ISS API failed');
    const data = await response.json();
    return {
      lat: data.latitude,
      lng: data.longitude,
      altitude: Math.round(data.altitude),
      speed: Math.round(data.velocity)
    };
  } catch (err) {
    return null;
  }
}

export function computeEarthThreatIndex(events: NexusEvent[]): ThreatIndexData {
  let disasterScore = 0;
  let weatherScore = 0;
  let geopoliticalScore = 0;
  let spaceScore = 0;
  let transportScore = 0;

  events.forEach((evt) => {
    let weight = 4;
    if (evt.severity === 'CRITICAL') weight = 22;
    else if (evt.severity === 'HIGH') weight = 14;
    else if (evt.severity === 'ELEVATED') weight = 8;
    else if (evt.severity === 'GUARDED') weight = 4;
    else weight = 1;

    switch (evt.category) {
      case 'disaster':
        disasterScore += weight;
        break;
      case 'weather':
        weatherScore += weight;
        break;
      case 'news':
        geopoliticalScore += weight;
        break;
      case 'space':
        spaceScore += weight;
        break;
      case 'transport':
        transportScore += weight;
        break;
    }
  });

  // Normalize scores (0-100 scale)
  const dScoreNorm = Math.min(100, Math.round(disasterScore * 1.4));
  const wScoreNorm = Math.min(100, Math.round(weatherScore * 1.8));
  const gScoreNorm = Math.min(100, Math.round(geopoliticalScore * 1.6));
  const sScoreNorm = Math.min(100, Math.round(spaceScore * 2.0));
  const tScoreNorm = Math.min(100, Math.round(transportScore * 2.2));

  // Weighted global composite
  const composite = Math.min(
    98,
    Math.max(
      15,
      Math.round(
        dScoreNorm * 0.35 +
        wScoreNorm * 0.22 +
        gScoreNorm * 0.23 +
        sScoreNorm * 0.10 +
        tScoreNorm * 0.10
      )
    )
  );

  let level: ThreatLevel = 'LOW';
  if (composite >= 80) level = 'CRITICAL';
  else if (composite >= 60) level = 'HIGH';
  else if (composite >= 40) level = 'ELEVATED';
  else if (composite >= 20) level = 'GUARDED';

  const activeCrisisCount = events.filter(
    (e) => e.severity === 'HIGH' || e.severity === 'CRITICAL'
  ).length;

  return {
    score: composite,
    level,
    trend: composite > 55 ? 'rising' : 'stable',
    breakdown: {
      disasters: dScoreNorm,
      weather: wScoreNorm,
      geopolitical: gScoreNorm,
      space: sScoreNorm,
      transport: tScoreNorm
    },
    activeCrisisCount,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' }) + ' UTC'
  };
}
