import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  MapPin,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { NexusEvent, SimpleCategory } from '../types/nexus';
import { tacticalAudio } from '../services/audio';

interface EventFeedProps {
  events: NexusEvent[];
  selectedEvent: NexusEvent | null;
  onSelectEvent: (event: NexusEvent) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const EventFeed: React.FC<EventFeedProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  isOpen,
  onToggleOpen,
}) => {
  const [filterCategory, setFilterCategory] = useState<SimpleCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to map event to the 7 simple categories
  const getEventCategory = (evt: NexusEvent): SimpleCategory => {
    if (evt.subType === 'earthquake') return 'earthquake';
    if (evt.subType === 'volcano') return 'volcano';
    if (evt.subType === 'wildfire') return 'wildfire';
    if (evt.subType === 'hurricane') return 'hurricane';
    if (evt.subType === 'flood') return 'flood';
    if (evt.subType === 'aircraft' || evt.category === 'transport') return 'flight';
    if (evt.subType === 'storm' || evt.category === 'weather' || evt.subType === 'lightning') return 'storm';
    return 'all';
  };

  const filteredEvents = events.filter((evt) => {
    if (filterCategory !== 'all') {
      const cat = getEventCategory(evt);
      if (cat !== filterCategory) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        evt.title.toLowerCase().includes(q) ||
        evt.locationName.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        (evt.plainExplanation && evt.plainExplanation.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getCategoryInfo = (evt: NexusEvent) => {
    const cat = getEventCategory(evt);
    switch (cat) {
      case 'earthquake':
        return { label: 'Earthquake', emoji: '🌍', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'volcano':
        return { label: 'Volcano', emoji: '🌋', color: 'bg-red-500/20 text-red-300 border-red-500/40' };
      case 'wildfire':
        return { label: 'Wildfire', emoji: '🔥', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
      case 'hurricane':
        return { label: 'Hurricane', emoji: '🌀', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
      case 'flood':
        return { label: 'Flood', emoji: '🌊', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'flight':
        return { label: 'Flight', emoji: '✈️', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'storm':
        return { label: 'Storm', emoji: '⛈️', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      default:
        return { label: 'Event', emoji: '📍', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
    }
  };

  const getDangerBadge = (evt: NexusEvent) => {
    if (evt.dangerLevelSimple) {
      switch (evt.dangerLevelSimple) {
        case 'Severe':
          return { label: 'Severe', style: 'bg-red-500/20 text-red-300 border-red-500/40' };
        case 'High':
          return { label: 'High', style: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
        case 'Moderate':
          return { label: 'Moderate', style: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
        default:
          return { label: 'Normal', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      }
    }

    switch (evt.severity) {
      case 'CRITICAL':
        return { label: 'Severe', style: 'bg-red-500/20 text-red-300 border-red-500/40' };
      case 'HIGH':
        return { label: 'High', style: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
      case 'ELEVATED':
        return { label: 'Moderate', style: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      default:
        return { label: 'Normal', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    }
  };

  const filterTabs: { id: SimpleCategory; label: string; emoji: string }[] = [
    { id: 'all', label: 'All', emoji: '🌐' },
    { id: 'earthquake', label: 'Earthquakes', emoji: '🌍' },
    { id: 'volcano', label: 'Volcanoes', emoji: '🌋' },
    { id: 'wildfire', label: 'Wildfires', emoji: '🔥' },
    { id: 'hurricane', label: 'Hurricanes', emoji: '🌀' },
    { id: 'flood', label: 'Floods', emoji: '🌊' },
    { id: 'flight', label: 'Flights', emoji: '✈️' },
    { id: 'storm', label: 'Storms', emoji: '⛈️' },
  ];

  return (
    <>
      {/* Toggle button when closed */}
      {!isOpen && (
        <button
          onClick={() => {
            tacticalAudio.playClick();
            onToggleOpen();
          }}
          className="absolute top-16 right-4 z-20 flex items-center gap-2 bg-[#060b17]/95 backdrop-blur-md px-3.5 py-2.5 text-xs text-cyan-300 hover:text-white border border-cyan-500/40 rounded-xl shadow-2xl transition-all cursor-pointer"
        >
          <span className="text-sm">📋</span>
          <span className="font-semibold">Live Events List</span>
          <ChevronLeft className="w-4 h-4 text-cyan-400" />
        </button>
      )}

      {/* Slide-out Feed Panel */}
      {isOpen && (
        <aside className="absolute top-16 right-4 bottom-20 z-20 w-80 sm:w-96 bg-[#060b17]/95 backdrop-blur-md rounded-xl border border-cyan-500/30 flex flex-col overflow-hidden text-xs shadow-2xl select-none">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-cyan-950/40 border-b border-cyan-500/20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-sm font-bold text-white tracking-wide">
                Live Events Feed
              </span>
              <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30 font-semibold">
                {filteredEvents.length} Active
              </span>
            </div>
            <button
              onClick={() => {
                tacticalAudio.playClick();
                onToggleOpen();
              }}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close list"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Search box */}
          <div className="p-3 border-b border-slate-800 bg-black/40">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search events (e.g. Japan, volcano, flood)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-black/60 border border-slate-700/80 focus:border-cyan-500 rounded-lg text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
              />
            </div>

            {/* Quick Category filter buttons */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    tacticalAudio.playClick();
                    setFilterCategory(tab.id);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                    filterCategory === tab.id
                      ? 'bg-cyan-500 text-black font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800'
                  }`}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Event List Cards */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 p-2.5 space-y-2">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                <span className="text-3xl block mb-2">🔍</span>
                <p className="font-semibold text-slate-300">No events found</p>
                <p className="text-[11px] text-slate-500 mt-1">Try clearing your search query or selecting "All".</p>
              </div>
            ) : (
              filteredEvents.map((evt) => {
                const isSelected = selectedEvent?.id === evt.id;
                const cat = getCategoryInfo(evt);
                const danger = getDangerBadge(evt);

                return (
                  <div
                    key={evt.id}
                    onClick={() => {
                      tacticalAudio.playPing();
                      onSelectEvent(evt);
                    }}
                    className={`p-3 rounded-xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-lg shadow-cyan-950/40'
                        : 'bg-[#080d1a] border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Top Row: Category + Danger badge */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cat.color}`}
                        >
                          <span>{cat.emoji}</span>
                          <span>{cat.label}</span>
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${danger.style}`}
                        >
                          {danger.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-xs text-white leading-snug mb-1">
                      {evt.title}
                    </h4>

                    {/* Simple Explanation or Description */}
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-2">
                      {evt.plainExplanation || evt.description}
                    </p>

                    {/* Location */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{evt.locationName}</span>
                      </div>
                      <span className="text-cyan-400/80 font-medium hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      )}
    </>
  );
};
