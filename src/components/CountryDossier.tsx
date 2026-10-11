import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Thermometer,
  Cloud,
  Wind,
  Globe2,
  Users,
  DollarSign,
  AlertOctagon,
  Sparkles,
  CheckCircle,
  FileText,
  Activity
} from 'lucide-react';
import { CountryData, NexusEvent } from '../types/nexus';
import { generateCountryThreatAssessment, AIBriefingResponse } from '../services/gemini';
import { tacticalAudio } from '../services/audio';

interface CountryDossierProps {
  country: CountryData;
  events: NexusEvent[];
  onClose: () => void;
  onSelectEvent: (event: NexusEvent) => void;
}

export const CountryDossier: React.FC<CountryDossierProps> = ({
  country,
  events,
  onClose,
  onSelectEvent,
}) => {
  const [aiReport, setAiReport] = useState<AIBriefingResponse | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const localEvents = events.filter(
    (e) => e.country === country.name || e.locationName.includes(country.name)
  );

  const handleGenerateAi = async () => {
    tacticalAudio.playPing();
    setIsLoadingAi(true);
    try {
      const result = await generateCountryThreatAssessment(country, events);
      setAiReport(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'HIGH': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'ELEVATED': return 'text-amber-400 bg-amber-500/20 border-amber-500/50';
      case 'GUARDED': return 'text-sky-400 bg-sky-500/20 border-sky-500/50';
      default: return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[460px] md:w-[500px] hud-panel border-l border-cyan-500/40 shadow-2xl flex flex-col font-code text-xs bg-[#060a12]/95 backdrop-blur-xl animate-in slide-in-from-right duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 bg-cyan-950/40 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-cyan-900/40 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-tech font-bold text-lg">
            {country.iso}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-tech text-xl font-bold text-slate-100 tracking-wide">
                {country.name}
              </h2>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getThreatColor(country.threatLevel)}`}>
                {country.threatLevel}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {country.capital} · {country.region} · Coordinates: {country.coordinates[0].toFixed(2)}°, {country.coordinates[1].toFixed(2)}°
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            tacticalAudio.playClick();
            onClose();
          }}
          className="p-1.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded bg-black/50 border border-slate-800">
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" />
              <span>POPULATION</span>
            </div>
            <div className="text-sm font-bold text-slate-100 mt-1">
              {(country.population / 1e6).toFixed(1)}M
            </div>
          </div>

          <div className="p-2.5 rounded bg-black/50 border border-slate-800">
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <span>GDP (NOMINAL)</span>
            </div>
            <div className="text-sm font-bold text-emerald-300 mt-1">
              ${country.gdpBillionUsd}B
            </div>
          </div>

          <div className="p-2.5 rounded bg-black/50 border border-slate-800">
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-orange-400" />
              <span>SURFACE TEMP</span>
            </div>
            <div className="text-sm font-bold text-orange-300 mt-1">
              {country.currentTempC}°C
            </div>
          </div>

          <div className="p-2.5 rounded bg-black/50 border border-slate-800">
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-red-400" />
              <span>THREAT SCORE</span>
            </div>
            <div className="text-sm font-bold text-red-300 mt-1">
              {country.threatScore}/100
            </div>
          </div>
        </div>

        {/* Live Weather & Environmental Security */}
        <div className="p-3 rounded bg-black/40 border border-cyan-500/20 space-y-2">
          <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5" />
            <span>Weather & Air Quality</span>
          </h4>
          <div className="flex items-center justify-between text-xs text-slate-200">
            <span>Current Forecast:</span>
            <span className="font-semibold text-cyan-300">{country.weatherCondition}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-200">
            <span>Air Quality:</span>
            <span className={`font-semibold ${country.airQuality === 'Hazardous' ? 'text-red-400' : country.airQuality === 'Unhealthy' ? 'text-orange-400' : 'text-emerald-400'}`}>
              {country.airQuality}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-200">
            <span>Environmental Health:</span>
            <span className="font-semibold text-emerald-400">{country.environmentalScore}/100</span>
          </div>
        </div>

        {/* Primary Risks */}
        <div className="p-3 rounded bg-black/40 border border-slate-800 space-y-2">
          <h4 className="text-[11px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Main Natural Hazards</span>
          </h4>
          <ul className="space-y-1.5">
            {country.keyRisks.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Local Active Disasters / Incidents */}
        <div className="p-3 rounded bg-black/40 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Events Happening Here ({localEvents.length})</span>
            </h4>
          </div>

          {localEvents.length === 0 ? (
            <p className="text-slate-500 text-xs py-2 italic">
              No active natural disasters currently reported in this country.
            </p>
          ) : (
            <div className="space-y-1.5">
              {localEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => {
                    tacticalAudio.playPing();
                    onSelectEvent(evt);
                  }}
                  className="p-2 rounded bg-black/60 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{evt.title}</div>
                    <div className="text-[10px] text-slate-500">{evt.subType} · {evt.locationName}</div>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getThreatColor(evt.severity)}`}>
                    {evt.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Strategic Assessment Section */}
        <div className="p-3.5 rounded bg-gradient-to-br from-cyan-950/40 to-black border border-cyan-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs tracking-wide">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI Simple Country Summary</span>
            </div>
            <button
              onClick={handleGenerateAi}
              disabled={isLoadingAi}
              className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded text-cyan-300 text-[11px] font-semibold transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoadingAi ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  <span>Summarizing...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3 h-3 text-cyan-400" />
                  <span>{aiReport ? 'Refresh Summary' : 'Generate Summary'}</span>
                </>
              )}
            </button>
          </div>

          {aiReport && (
            <div className="space-y-3 pt-2 border-t border-cyan-500/20 text-slate-300">
              <div>
                <span className="text-[10px] text-cyan-400 font-semibold block uppercase">
                  Strategic Synthesis:
                </span>
                <p className="text-xs leading-relaxed mt-0.5 text-slate-200">
                  {aiReport.summary}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-orange-400 font-semibold block uppercase">
                  Tactical Threat Profile:
                </span>
                <p className="text-xs leading-relaxed mt-0.5 text-slate-200">
                  {aiReport.threatAssessment}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-emerald-400 font-semibold block uppercase">
                  Recommended Planetary Protocols:
                </span>
                <ul className="space-y-1 mt-1">
                  {aiReport.recommendedResponse.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                      <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[10px] text-cyan-400/80 font-mono">
                <span>POSTURE: {aiReport.strategicPosture}</span>
                <span>ENGINE: GEMINI-2.5-FLASH</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
