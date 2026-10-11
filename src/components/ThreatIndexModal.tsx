import React from 'react';
import {
  X,
  Info,
  CheckCircle2,
  TrendingUp,
  Activity
} from 'lucide-react';
import { ThreatIndexData, NexusEvent } from '../types/nexus';
import { tacticalAudio } from '../services/audio';

interface ThreatIndexModalProps {
  threatData: ThreatIndexData;
  events: NexusEvent[];
  onClose: () => void;
}

export const ThreatIndexModal: React.FC<ThreatIndexModalProps> = ({
  threatData,
  events,
  onClose,
}) => {
  const getStatusSummary = (score: number) => {
    if (score >= 70) {
      return {
        title: 'High Disaster Activity',
        desc: 'Multiple major natural disasters are active right now (major earthquakes, super typhoons, or volcanic eruptions).',
        badgeColor: 'bg-red-500/20 text-red-300 border-red-500/50',
      };
    }
    if (score >= 45) {
      return {
        title: 'Moderate Global Activity',
        desc: 'A typical number of seasonal storms, wildfires, and localized earthquakes are taking place.',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      };
    }
    return {
      title: 'Calm Global Activity',
      desc: 'The planet is relatively quiet with minimal destructive disasters at this time.',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    };
  };

  const status = getStatusSummary(threatData.score);
  const majorEvents = events.filter((e) => e.severity === 'CRITICAL' || e.severity === 'HIGH');

  const categoryCounts = {
    earthquakes: events.filter((e) => e.subType === 'earthquake').length,
    volcanoes: events.filter((e) => e.subType === 'volcano').length,
    wildfires: events.filter((e) => e.subType === 'wildfire').length,
    hurricanes: events.filter((e) => e.subType === 'hurricane').length,
    floods: events.filter((e) => e.subType === 'flood').length,
    flights: events.filter((e) => e.subType === 'aircraft' || e.category === 'transport').length,
    storms: events.filter((e) => e.subType === 'storm' || e.category === 'weather').length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-xl bg-[#080d1c] rounded-2xl border border-cyan-500/40 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-cyan-950/40 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-xl shadow-lg">
              🌍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                  Global Overview
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.badgeColor}`}>
                  Score: {threatData.score}/100
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                What is Happening on Earth Right Now
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              tacticalAudio.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Plain English explanation box */}
          <div className="p-3.5 rounded-xl bg-cyan-950/25 border border-cyan-500/25 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>How this works (Simple explanation):</span>
            </div>
            <p className="text-slate-200 leading-relaxed text-xs">
              We continuously count active earthquakes, active volcanoes, wildfires, floods, hurricanes, and severe storms across all continents. A higher score means more severe disasters are occurring simultaneously.
            </p>
          </div>

          {/* Current Status Card */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800 flex items-center gap-4">
            <div className="text-3xl font-black text-cyan-400 font-mono">
              {threatData.score}
              <span className="text-xs text-slate-500 font-normal">/100</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">{status.title}</h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {status.desc}
              </p>
            </div>
          </div>

          {/* Breakdown by the 7 categories requested by user */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Current Events by Category
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌍</span>
                  <span className="text-slate-200 font-medium">Earthquakes</span>
                </div>
                <span className="font-bold text-amber-300">{categoryCounts.earthquakes}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌋</span>
                  <span className="text-slate-200 font-medium">Volcanoes</span>
                </div>
                <span className="font-bold text-red-300">{categoryCounts.volcanoes}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔥</span>
                  <span className="text-slate-200 font-medium">Wildfires</span>
                </div>
                <span className="font-bold text-orange-300">{categoryCounts.wildfires}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌀</span>
                  <span className="text-slate-200 font-medium">Hurricanes</span>
                </div>
                <span className="font-bold text-sky-300">{categoryCounts.hurricanes}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌊</span>
                  <span className="text-slate-200 font-medium">Floods</span>
                </div>
                <span className="font-bold text-blue-300">{categoryCounts.floods}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">✈️</span>
                  <span className="text-slate-200 font-medium">Flights</span>
                </div>
                <span className="font-bold text-emerald-300">{categoryCounts.flights}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 flex items-center justify-between col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">⛈️</span>
                  <span className="text-slate-200 font-medium">Storms</span>
                </div>
                <span className="font-bold text-purple-300">{categoryCounts.storms}</span>
              </div>
            </div>
          </div>

          {/* Biggest ongoing events */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Biggest Events Right Now
            </h4>
            <div className="space-y-1.5">
              {majorEvents.slice(0, 4).map((evt) => (
                <div
                  key={evt.id}
                  className="p-2 rounded-lg bg-black/30 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-2">
                    <span className="font-semibold text-white truncate block">{evt.title}</span>
                    <span className="text-[11px] text-slate-400 truncate block">{evt.locationName}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold shrink-0 bg-orange-500/20 text-orange-300 border border-orange-500/40">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-black/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Continuous global calculation</span>
          <button
            onClick={() => {
              tacticalAudio.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
