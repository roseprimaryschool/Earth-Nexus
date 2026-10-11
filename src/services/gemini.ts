import { NexusEvent, CountryData } from '../types/nexus';

export interface AIBriefingResponse {
  summary: string;
  threatAssessment: string;
  projectedCasualtiesOrImpact: string;
  recommendedResponse: string[];
  strategicPosture: string;
  source: 'gemini' | 'simulation';
}

export async function generateAIBriefing(event: NexusEvent): Promise<AIBriefingResponse> {
  try {
    const res = await fetch('/api/ai/briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'event', event })
    });

    if (res.ok) {
      const data = await res.json();
      return { ...data, source: 'gemini' };
    }
  } catch (err) {
    console.warn('AI API endpoint unavailable, falling back to local heuristic synthesis', err);
  }

  // Fallback high-fidelity heuristic generator
  return generateHeuristicEventBriefing(event);
}

export async function generateCountryThreatAssessment(country: CountryData, events: NexusEvent[]): Promise<AIBriefingResponse> {
  try {
    const res = await fetch('/api/ai/briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'country', country, events: events.slice(0, 5) })
    });

    if (res.ok) {
      const data = await res.json();
      return { ...data, source: 'gemini' };
    }
  } catch (err) {
    console.warn('AI API endpoint unavailable, falling back to local heuristic synthesis', err);
  }

  return generateHeuristicCountryAssessment(country, events);
}

function generateHeuristicEventBriefing(event: NexusEvent): AIBriefingResponse {
  const categoryTerms: Record<string, string> = {
    disaster: 'tectonic, volcanic, or atmospheric kinetic stress',
    weather: 'convective atmospheric anomaly and tropospheric moisture flux',
    news: 'geopolitical friction and critical infrastructure fragility',
    space: 'orbital mechanics disturbance and heliospheric radiation pulse',
    transport: 'transcontinental logistics corridor choke point pressure'
  };

  return {
    summary: `Tactical synthesis of ${event.title} in ${event.locationName}. This incident exhibits high-order dynamics driven by ${categoryTerms[event.category] || 'dynamic planetary forces'}. Real-time telemetry corroborates sustained elevation in operational risk vectors.`,
    threatAssessment: `Priority level classified as ${event.severity}. Immediate exposure zone covers critical populated nodes within regional proximity. Primary vulnerability correlates with cascading disruption across civil infrastructure, emergency logistics, and local power distribution grids.`,
    projectedCasualtiesOrImpact: `Estimated direct impact footprint affects municipal infrastructure, air corridors, and local trade operations. Risk of secondary cascading failures rated at ${event.severity === 'CRITICAL' ? '86%' : event.severity === 'HIGH' ? '68%' : '42%'}.`,
    recommendedResponse: [
      `Enforce Level 3 tactical telemetry surveillance over coordinates [${event.coordinates[0].toFixed(2)}, ${event.coordinates[1].toFixed(2)}].`,
      `Issue automated NOTAMs and maritime routing advisories across adjacent transit vectors.`,
      `Mobilize regional civil protection response units and verify satellite communications uplink redundancy.`,
      `Continuously cross-correlate seismic and atmospheric telemetry against predictive baseline matrices.`
    ],
    strategicPosture: event.severity === 'CRITICAL' ? 'DEFCON-2 GLOBAL EMERGENCY RESPONSE' : event.severity === 'HIGH' ? 'HEIGHTENED TACTICAL MONITORING' : 'GUARDED READINESS POSTURE',
    source: 'simulation'
  };
}

function generateHeuristicCountryAssessment(country: CountryData, events: NexusEvent[]): AIBriefingResponse {
  const localIncidents = events.filter(e => e.country === country.name);
  
  return {
    summary: `Strategic planetary appraisal for ${country.name} (${country.region}). National Threat Score currently calibrated at ${country.threatScore}/100 [${country.threatLevel}]. Nation maintains governance over a population of ${(country.population / 1e6).toFixed(1)}M citizens with an economic output of $${country.gdpBillionUsd}B USD.`,
    threatAssessment: `Primary national risk profile is dominated by: ${country.keyRisks.join(', ')}. Currently tracking ${localIncidents.length} active high-priority anomalies in domestic territory. Climate resilience index stands at ${country.environmentalScore}/100.`,
    projectedCasualtiesOrImpact: `Regional infrastructure demonstrates strong vulnerability to compounding climate-geological shocks. Critical supply chain bottlenecks identified in maritime port gateways and national power grids.`,
    recommendedResponse: [
      `Enhance early-warning siren and mobile cell-broadcast trigger thresholds.`,
      `Review national strategic oil and food stockpiles for 60-day resilience buffer.`,
      `Pre-position civil protection search and rescue assets in high-risk zones.`,
      `Audit cyber-physical defense barriers on national energy and potable water grids.`
    ],
    strategicPosture: country.threatLevel === 'CRITICAL' ? 'SEVERE CRISIS POSTURE' : country.threatLevel === 'HIGH' ? 'HEIGHTENED ALERT STATUS' : 'ROUTINE SURVEILLANCE POSTURE',
    source: 'simulation'
  };
}
