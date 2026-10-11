import React from 'react';
import {
  X,
  Bell,
  ArrowRight
} from 'lucide-react';
import { NexusEvent } from '../types/nexus';
import { tacticalAudio } from '../services/audio';

interface AlertCenterModalProps {
  events: NexusEvent[];
  onSelectEvent: (event: NexusEvent) => void;
  onClose: () => void;
}

export const AlertCenterModal: React.FC<AlertCenterModalProps> = ({
  events,
  onSelectEvent,
  onClose,
}) => {
  const alerts = events.filter((e) => e.severity === 'CRITICAL' || e.severity === 'HIGH');

  const getEmojiAndName = (e: NexusEvent) => {
    if (e.subType === 'earthquake') return { emoji: '🌍', name: 'Earthquake' };
    if (e.subType === 'volcano') return { emoji: '🌋', name: 'Volcano' };
    if (e.subType === 'wildfire') return { emoji: '🔥', name: 'Wildfire' };
    if (e.subType === 'hurricane') return { emoji: '🌀', name: 'Hurricane' };
    if (e.subType === 'flood') return { emoji: '🌊', name: 'Flood' };
    if (e.subType === 'aircraft' || e.category === 'transport') return { emoji: '✈️', name: 'Flight' };
    if (e.subType === 'storm' || e.category === 'weather') return { emoji: '⛈️', name: 'Storm' };
    return { emoji: '⚠️', name: 'Alert' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-lg bg-[#080d1c] rounded-2xl border border-red-500/40 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-red-950/40 border-b border-red-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-900/40 border border-red-500/50 flex items-center justify-center shadow-lg">
              <Bell className="w-5 h-5 text-red-400 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-300 uppercase tracking-wide">
                  Emergency Alert Center
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-red-600 text-white rounded-full">
                  {alerts.length} Major Events
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                Big Disasters Right Now
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

        {/* List of Alerts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <span className="text-3xl block mb-2">✅</span>
              <p className="font-semibold text-white">No severe emergencies right now</p>
              <p className="text-[11px] text-slate-500 mt-1">All monitored events are at normal or guarded levels.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const meta = getEmojiAndName(alert);
              return (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl bg-black/60 border border-red-500/25 hover:border-red-500/60 transition-all flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{meta.emoji}</span>
                      <span className="text-xs font-bold text-red-400">
                        {alert.severity === 'CRITICAL' ? 'Severe Alert' : 'High Alert'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        · {meta.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {alert.plainExplanation || alert.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">{alert.locationName}</span>
                    <button
                      onClick={() => {
                        tacticalAudio.playPing();
                        onSelectEvent(alert);
                        onClose();
                      }}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-200 font-bold transition-colors cursor-pointer"
                    >
                      <span>Show on Globe</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-black/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Updates automatically every 30 seconds</span>
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
