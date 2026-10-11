import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { NexusEvent } from '../types/nexus';
import { generateAIBriefing, AIBriefingResponse } from '../services/gemini';
import { tacticalAudio } from '../services/audio';

interface EventDetailModalProps {
  event: NexusEvent;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
  const [aiReport, setAiReport] = useState<AIBriefingResponse | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleGenerateAi = async () => {
    tacticalAudio.playPing();
    setIsLoadingAi(true);
    try {
      const result = await generateAIBriefing(event);
      setAiReport(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const getCategoryDetails = () => {
    if (event.subType === 'earthquake') {
      return { emoji: '🌍', name: 'Earthquake', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    }
    if (event.subType === 'volcano') {
      return { emoji: '🌋', name: 'Active Volcano', color: 'bg-red-500/20 text-red-300 border-red-500/40' };
    }
    if (event.subType === 'wildfire') {
      return { emoji: '🔥', name: 'Wildfire', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
    }
    if (event.subType === 'hurricane') {
      return { emoji: '🌀', name: 'Hurricane', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
    }
    if (event.subType === 'flood') {
      return { emoji: '🌊', name: 'Flood', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
    }
    if (event.subType === 'aircraft' || event.category === 'transport') {
      return { emoji: '✈️', name: 'Commercial Flight', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    }
    if (event.subType === 'storm' || event.category === 'weather') {
      return { emoji: '⛈️', name: 'Storm', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
    }
    return { emoji: '📍', name: 'Natural Event', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
  };

  const getDangerBadge = () => {
    if (event.dangerLevelSimple) {
      switch (event.dangerLevelSimple) {
        case 'Severe':
          return { label: 'Severe Alert', style: 'bg-red-500/20 text-red-300 border-red-500/50' };
        case 'High':
          return { label: 'High Danger', style: 'bg-orange-500/20 text-orange-300 border-orange-500/50' };
        case 'Moderate':
          return { label: 'Moderate', style: 'bg-amber-500/20 text-amber-300 border-amber-500/50' };
        default:
          return { label: 'Normal / Safe', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' };
      }
    }

    switch (event.severity) {
      case 'CRITICAL':
        return { label: 'Severe Alert', style: 'bg-red-500/20 text-red-300 border-red-500/50' };
      case 'HIGH':
        return { label: 'High Danger', style: 'bg-orange-500/20 text-orange-300 border-orange-500/50' };
      case 'ELEVATED':
        return { label: 'Moderate', style: 'bg-amber-500/20 text-amber-300 border-amber-500/50' };
      default:
        return { label: 'Normal / Safe', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' };
    }
  };

  const cat = getCategoryDetails();
  const danger = getDangerBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-lg bg-[#080d1c] rounded-2xl border border-cyan-500/40 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-cyan-950/40 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/60 border border-cyan-500/30 flex items-center justify-center text-xl shadow-inner">
              {cat.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${cat.color}`}>
                  {cat.name}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${danger.style}`}>
                  {danger.label}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1 leading-snug">
                {event.title}
              </h3>
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
          {/* Quick metadata strip */}
          <div className="flex flex-wrap items-center gap-3 text-slate-400 p-2.5 rounded-lg bg-black/40 border border-slate-800">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-white font-medium">{event.locationName}</span>
            </div>
            <span className="text-slate-600">·</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{new Date(event.timestamp).toLocaleString()}</span>
            </div>
            <span className="text-slate-600">·</span>
            <div className="text-slate-400">
              Source: <span className="text-slate-200">{event.source}</span>
            </div>
          </div>

          {/* Simple Explanation Box (The user requested simple plain English!) */}
          {(event.whatItMeans || event.plainExplanation) && (
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>What this means in plain words:</span>
              </div>
              <p className="text-slate-200 leading-relaxed text-xs">
                {event.whatItMeans || event.plainExplanation}
              </p>
            </div>
          )}

          {/* What Happened Section */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              What Happened
            </h4>
            <p className="p-3 rounded-xl bg-black/40 border border-slate-800 text-slate-200 leading-relaxed text-xs">
              {event.description}
            </p>
          </div>

          {/* Key Facts & Numbers (Simple Grid) */}
          {event.metrics && Object.keys(event.metrics).length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Key Facts & Measurements
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(event.metrics).map(([key, val]) => (
                  <div key={key} className="p-2.5 rounded-lg bg-black/50 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block truncate">{key}</span>
                    <span className="text-xs font-bold text-white mt-0.5 block truncate">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Easy Explanation Generator */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Need an easy summary?</span>
              </div>
              <button
                onClick={handleGenerateAi}
                disabled={isLoadingAi}
                className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg text-cyan-300 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoadingAi ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    <span>Explaining...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{aiReport ? 'Refresh Summary' : 'Explain Simply'}</span>
                  </>
                )}
              </button>
            </div>

            {aiReport ? (
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block">
                    Quick Summary:
                  </span>
                  <p className="text-slate-200 leading-relaxed mt-0.5">
                    {aiReport.summary}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-orange-400 block">
                    Is It Dangerous?
                  </span>
                  <p className="text-slate-200 leading-relaxed mt-0.5">
                    {aiReport.threatAssessment}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                    What People Are Doing:
                  </span>
                  <ul className="space-y-1 mt-1">
                    {aiReport.recommendedResponse.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Click "Explain Simply" to get a 3-bullet breakdown with zero complicated jargon.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-black/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Location: [{event.coordinates[0].toFixed(2)}°, {event.coordinates[1].toFixed(2)}°]</span>
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
