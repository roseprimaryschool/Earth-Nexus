import React, { useState, useEffect } from 'react';
import {
  Globe,
  Newspaper,
  Volume2,
  VolumeX,
  Search,
  Bell,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { ThreatIndexData, GlobeViewMode, SimpleCategory } from '../types/nexus';
import { tacticalAudio } from '../services/audio';

interface HeaderProps {
  threatData: ThreatIndexData;
  disasterCount: number;
  weatherCount: number;
  spaceCount: number;
  transportCount: number;
  activeAlertCount: number;
  viewMode: GlobeViewMode;
  onChangeViewMode: (mode: GlobeViewMode) => void;
  onOpenThreatModal: () => void;
  onOpenAlertsModal: () => void;
  onOpenSearch: () => void;
  isAutoRotating?: boolean;
  onToggleAutoRotate?: () => void;
  currentTab?: 'globe' | 'news';
  onSelectTab?: (tab: 'globe' | 'news') => void;
  activeCategory?: SimpleCategory;
  onSelectCategory?: (cat: SimpleCategory) => void;
  earthquakeCount?: number;
  volcanoCount?: number;
  wildfireCount?: number;
  hurricaneCount?: number;
  floodCount?: number;
  flightCount?: number;
  stormCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  threatData,
  activeAlertCount,
  onOpenThreatModal,
  onOpenAlertsModal,
  onOpenSearch,
  isAutoRotating = false,
  onToggleAutoRotate,
  currentTab = 'globe',
  onSelectTab,
  activeCategory = 'all',
  onSelectCategory,
  earthquakeCount = 4,
  volcanoCount = 4,
  wildfireCount = 3,
  hurricaneCount = 2,
  floodCount = 3,
  flightCount = 4,
  stormCount = 3,
}) => {
  const [localTime, setLocalTime] = useState('');
  const [isMuted, setIsMuted] = useState(tacticalAudio.getMuted());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLocalTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
        ' · ' +
        now.toLocaleDateString([], { month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMute = () => {
    const muted = tacticalAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) tacticalAudio.playClick();
  };

  // Plain-English danger level
  const getDangerStatus = () => {
    switch (threatData.level) {
      case 'CRITICAL':
        return { label: 'High Alert', color: 'bg-red-500/20 text-red-400 border-red-500/50' };
      case 'HIGH':
        return { label: 'Active Disasters', color: 'bg-orange-500/20 text-orange-400 border-orange-500/50' };
      case 'ELEVATED':
        return { label: 'Moderate Events', color: 'bg-amber-500/20 text-amber-400 border-amber-500/50' };
      default:
        return { label: 'Normal Activity', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' };
    }
  };

  const danger = getDangerStatus();

  return (
    <header className="relative z-30 w-full bg-[#050811]/95 backdrop-blur-md border-b border-cyan-500/20 px-3 sm:px-5 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs select-none">
      {/* Top Left: Logo & Simple Brand */}
      <div className="flex items-center justify-between md:justify-start gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/10">
            <Globe className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-wide text-white">
                Earth Tracker
              </span>
              <span className="text-[10px] text-cyan-300 font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30">
                Live
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Natural Disasters & Flights</span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400 font-medium">{localTime}</span>
            </div>
          </div>
        </div>

        {/* Global Danger Level (Plain Language) */}
        <button
          onClick={() => {
            tacticalAudio.playPing();
            onOpenThreatModal();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all cursor-pointer hover:scale-[1.02] ${danger.color}`}
          title="Click to see what is happening around the world right now"
        >
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase tracking-wider opacity-80 leading-none">
              Global Status
            </span>
            <span className="text-[11px] font-bold mt-0.5 leading-none">
              {danger.label}
            </span>
          </div>
        </button>
      </div>

      {/* Center: Main View Tabs - Live Globe vs News Tab (Requested by user!) */}
      <div className="flex items-center justify-center gap-1.5 bg-black/60 p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => {
            tacticalAudio.playClick();
            if (onSelectTab) onSelectTab('globe');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-all cursor-pointer ${
            currentTab === 'globe'
              ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Interactive Globe</span>
        </button>

        <button
          onClick={() => {
            tacticalAudio.playClick();
            if (onSelectTab) onSelectTab('news');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-all cursor-pointer relative ${
            currentTab === 'news'
              ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>News & Reports</span>
          <span className="ml-1 w-2 h-2 rounded-full bg-red-400 animate-ping" />
        </button>
      </div>

      {/* Right Controls: Spin Globe Toggle, Search, Alerts, Audio */}
      <div className="flex items-center justify-end gap-2">
        {/* Simple Spin Globe Button (Default OFF, spins only on user click!) */}
        {onToggleAutoRotate && currentTab === 'globe' && (
          <button
            onClick={() => {
              tacticalAudio.playClick();
              onToggleAutoRotate();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
              isAutoRotating
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900/80 border-slate-700/60'
            }`}
            title="Start or stop the globe from spinning automatically"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            <span>{isAutoRotating ? 'Spin: ON' : 'Spin: OFF'}</span>
          </button>
        )}

        {/* Search button */}
        <button
          onClick={() => {
            tacticalAudio.playClick();
            onOpenSearch();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900/80 border border-slate-700/70 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors cursor-pointer"
          title="Search countries or disasters"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline text-xs">Search</span>
        </button>

        {/* Big Alerts Center Trigger */}
        <button
          onClick={() => {
            tacticalAudio.playAlert();
            onOpenAlertsModal();
          }}
          className="relative p-1.5 rounded-md bg-slate-900/80 border border-red-500/30 text-slate-300 hover:text-red-300 hover:border-red-500/60 transition-colors cursor-pointer"
          title="View big active disasters and alerts"
        >
          <Bell className="w-4 h-4 text-red-400" />
          {activeAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
              {activeAlertCount}
            </span>
          )}
        </button>

        {/* Audio Mute / Unmute */}
        <button
          onClick={handleToggleMute}
          className="p-1.5 rounded-md bg-slate-900/80 border border-slate-700/70 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
          title={isMuted ? 'Turn sound on' : 'Mute sound effects'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>
    </header>
  );
};
