import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock } from 'lucide-react';
import { TimelinePlayback } from '../types/nexus';
import { tacticalAudio } from '../services/audio';

interface TimelineBarProps {
  playback: TimelinePlayback;
  onChangePlayback: (playback: TimelinePlayback) => void;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({ playback, onChangePlayback }) => {
  // Playback timer ticker
  useEffect(() => {
    if (!playback.isPlaying) return;

    const interval = setInterval(() => {
      // Step backwards or forwards in time
      const nextOffset = playback.currentOffsetHours + 1 * playback.speed;
      if (nextOffset >= 0) {
        onChangePlayback({ ...playback, currentOffsetHours: 0, isPlaying: false });
      } else {
        onChangePlayback({ ...playback, currentOffsetHours: nextOffset });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [playback, onChangePlayback]);

  const handleTogglePlay = () => {
    tacticalAudio.playClick();
    if (playback.currentOffsetHours >= 0 && !playback.isPlaying) {
      // Reset to -72 hours if at LIVE and hitting play
      onChangePlayback({ ...playback, currentOffsetHours: -72, isPlaying: true });
    } else {
      onChangePlayback({ ...playback, isPlaying: !playback.isPlaying });
    }
  };

  const handlePreset = (hours: number) => {
    tacticalAudio.playClick();
    onChangePlayback({ ...playback, currentOffsetHours: hours, isPlaying: false });
  };

  const formatOffsetLabel = (hours: number) => {
    if (hours === 0) return 'LIVE (NOW)';
    return `${Math.abs(hours)} HOURS AGO`;
  };

  return (
    <div className="absolute bottom-2 left-4 right-4 z-20 hud-panel px-4 py-2 rounded-xl border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 font-sans text-xs shadow-2xl">
      {/* Left: Playback transport controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
          <Clock className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Past Events:</span>
        </div>

        <button
          onClick={handleTogglePlay}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${
            playback.isPlaying
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30'
          }`}
        >
          {playback.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{playback.isPlaying ? 'PAUSE' : 'PLAYBACK'}</span>
        </button>

        {/* Speed multiplier selector */}
        <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded border border-slate-800 text-[10px]">
          {[1, 2, 5].map((spd) => (
            <button
              key={spd}
              onClick={() => {
                tacticalAudio.playClick();
                onChangePlayback({ ...playback, speed: spd });
              }}
              className={`px-1.5 py-0.5 rounded ${
                playback.speed === spd
                  ? 'bg-cyan-500/30 text-cyan-300 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Middle: Interactive Scrubber Slider */}
      <div className="flex-1 w-full max-w-xl flex items-center gap-3 px-2">
        <span className="text-[10px] text-slate-500 shrink-0">-7 DAYS</span>
        <input
          type="range"
          min={-168}
          max={0}
          step={2}
          value={playback.currentOffsetHours}
          onChange={(e) => {
            onChangePlayback({ ...playback, currentOffsetHours: parseInt(e.target.value) });
          }}
          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
        />
        <span className="text-[10px] text-cyan-400 font-bold shrink-0">LIVE</span>
      </div>

      {/* Right: Quick preset jump buttons */}
      <div className="flex items-center gap-1.5 text-[10px]">
        <button
          onClick={() => handlePreset(-6)}
          className={`px-2 py-1 rounded transition-colors ${
            playback.currentOffsetHours === -6 ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200 bg-black/40'
          }`}
        >
          -6H
        </button>
        <button
          onClick={() => handlePreset(-24)}
          className={`px-2 py-1 rounded transition-colors ${
            playback.currentOffsetHours === -24 ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200 bg-black/40'
          }`}
        >
          -24H
        </button>
        <button
          onClick={() => handlePreset(-72)}
          className={`px-2 py-1 rounded transition-colors ${
            playback.currentOffsetHours === -72 ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200 bg-black/40'
          }`}
        >
          -72H
        </button>
        <button
          onClick={() => handlePreset(0)}
          className={`px-2.5 py-1 rounded font-bold transition-colors ${
            playback.currentOffsetHours === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'text-slate-400 hover:text-slate-200 bg-black/40'
          }`}
        >
          LIVE
        </button>
      </div>
    </div>
  );
};
