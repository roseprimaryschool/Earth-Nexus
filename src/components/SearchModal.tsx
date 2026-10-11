import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Globe2,
  Flame,
  CloudLightning,
  Newspaper,
  Rocket,
  Plane,
  ArrowRight
} from 'lucide-react';
import { CountryData, NexusEvent } from '../types/nexus';
import { tacticalAudio } from '../services/audio';

interface SearchModalProps {
  countries: CountryData[];
  events: NexusEvent[];
  onSelectCountry: (country: CountryData) => void;
  onSelectEvent: (event: NexusEvent) => void;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  countries,
  events,
  onSelectCountry,
  onSelectEvent,
  onClose,
}) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) {
      return {
        matchedCountries: countries.slice(0, 6),
        matchedEvents: events.slice(0, 6),
      };
    }
    const q = query.toLowerCase();

    const matchedCountries = countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
    );

    const matchedEvents = events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.locationName.toLowerCase().includes(q) ||
        e.subType.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    );

    return { matchedCountries, matchedEvents };
  }, [query, countries, events]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md font-code text-xs">
      <div className="relative w-full max-w-xl hud-panel rounded-sm border border-cyan-500/50 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-3.5 bg-cyan-950/40 border-b border-cyan-500/25">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search countries, disasters, flights (e.g. Japan, volcano, flood, storm)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-600 outline-none"
          />
          <button
            onClick={() => {
              tacticalAudio.playClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-cyan-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Countries Section */}
          {results.matchedCountries.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-2">
                COUNTRIES ({results.matchedCountries.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.matchedCountries.map((c) => (
                  <div
                    key={c.iso}
                    onClick={() => {
                      tacticalAudio.playPing();
                      onSelectCountry(c);
                      onClose();
                    }}
                    className="p-2.5 rounded bg-black/50 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400 font-bold text-[10px] flex items-center justify-center">
                        {c.iso}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 text-xs">{c.name}</div>
                        <div className="text-[10px] text-slate-500">{c.capital} · {c.region}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">
                      SCORE: {c.threatScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Section */}
          {results.matchedEvents.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider block mb-2">
                ACTIVE EVENTS & SIGNALS ({results.matchedEvents.length})
              </span>
              <div className="space-y-1.5">
                {results.matchedEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      tacticalAudio.playPing();
                      onSelectEvent(evt);
                      onClose();
                    }}
                    className="p-2.5 rounded bg-black/50 border border-slate-800 hover:border-orange-500/50 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                        <span>{evt.title}</span>
                        <span className="text-[9px] text-orange-400 uppercase font-bold">
                          [{evt.severity}]
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {evt.locationName} · {evt.subType}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.matchedCountries.length === 0 && results.matchedEvents.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">
              No tactical matching records found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
