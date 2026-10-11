import React, { useState } from 'react';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { ActiveLayers } from '../types/nexus';
import { tacticalAudio } from '../services/audio';

interface LayerControlsProps {
  layers: ActiveLayers;
  onChangeLayers: (layers: ActiveLayers) => void;
  eventCounts?: {
    earthquakes: number;
    volcanoes: number;
    wildfires: number;
    hurricanes: number;
    floods: number;
    flights: number;
    storms: number;
  };
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  layers,
  onChangeLayers,
  eventCounts = {
    earthquakes: 4,
    volcanoes: 4,
    wildfires: 3,
    hurricanes: 2,
    floods: 3,
    flights: 4,
    storms: 3,
  },
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSublayer = (key: keyof ActiveLayers) => {
    tacticalAudio.playClick();
    onChangeLayers({
      ...layers,
      [key]: !layers[key],
    });
  };

  const setAll = (val: boolean) => {
    tacticalAudio.playClick();
    onChangeLayers({
      ...layers,
      disasters: val,
      weather: val,
      transport: val,
      earthquakes: val,
      volcanoes: val,
      wildfires: val,
      hurricanes: val,
      floods: val,
      flights: val,
      storms: val,
      aircraft: val,
      lightning: val,
    });
  };

  const simpleToggles: {
    key: keyof ActiveLayers;
    label: string;
    emoji: string;
    desc: string;
    count: number;
    color: string;
  }[] = [
    {
      key: 'earthquakes',
      label: 'Earthquakes',
      emoji: '🌍',
      desc: 'Ground shaking & tremors',
      count: eventCounts.earthquakes,
      color: 'text-amber-400',
    },
    {
      key: 'volcanoes',
      label: 'Active Volcanoes',
      emoji: '🌋',
      desc: 'Ash clouds & active lava',
      count: eventCounts.volcanoes,
      color: 'text-red-400',
    },
    {
      key: 'wildfires',
      label: 'Wildfires',
      emoji: '🔥',
      desc: 'Forest & brush fires',
      count: eventCounts.wildfires,
      color: 'text-orange-400',
    },
    {
      key: 'hurricanes',
      label: 'Hurricanes',
      emoji: '🌀',
      desc: 'Tropical cyclones & typhoons',
      count: eventCounts.hurricanes,
      color: 'text-sky-400',
    },
    {
      key: 'floods',
      label: 'Floods',
      emoji: '🌊',
      desc: 'Overflowing rivers & heavy rain',
      count: eventCounts.floods,
      color: 'text-blue-400',
    },
    {
      key: 'flights',
      label: 'Flights',
      emoji: '✈️',
      desc: 'Airplanes currently in the sky',
      count: eventCounts.flights,
      color: 'text-emerald-400',
    },
    {
      key: 'storms',
      label: 'Storms',
      emoji: '⛈️',
      desc: 'Lightning, high wind & hail',
      count: eventCounts.storms,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="absolute top-16 left-4 z-20 w-72 bg-[#060b17]/95 backdrop-blur-md rounded-xl border border-cyan-500/30 overflow-hidden text-xs shadow-2xl select-none">
      {/* Header */}
      <div
        onClick={() => {
          tacticalAudio.playClick();
          setIsExpanded(!isExpanded);
        }}
        className="flex items-center justify-between px-3.5 py-2.5 bg-cyan-950/40 border-b border-cyan-500/20 cursor-pointer hover:bg-cyan-900/30 transition-colors"
      >
        <div className="flex items-center gap-2 text-cyan-300 font-bold">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Show on Map</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-cyan-400/80 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
            {simpleToggles.filter((t) => layers[t.key] !== false).length} of 7 On
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-2.5 space-y-1.5 max-h-[70vh] overflow-y-auto">
          {/* Quick All On / All Off buttons */}
          <div className="flex items-center gap-2 mb-2 px-1">
            <button
              onClick={() => setAll(true)}
              className="flex-1 py-1 rounded bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 text-[11px] font-medium transition-colors cursor-pointer"
            >
              Turn All On
            </button>
            <button
              onClick={() => setAll(false)}
              className="flex-1 py-1 rounded bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 text-[11px] font-medium transition-colors cursor-pointer"
            >
              Turn All Off
            </button>
          </div>

          {/* The 7 Core Requested Categories */}
          {simpleToggles.map((item) => {
            const isEnabled = layers[item.key] !== false;
            return (
              <div
                key={item.key}
                onClick={() => toggleSublayer(item.key)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                  isEnabled
                    ? 'bg-slate-900/90 border-cyan-500/30 text-white'
                    : 'bg-black/30 border-slate-800/80 text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{item.emoji}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-semibold ${isEnabled ? 'text-white' : 'text-slate-400'}`}>
                        {item.label}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-slate-400 font-mono">
                        {item.count}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 leading-none mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div
                    className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${
                      isEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Country Borders and Country Nametags */}
          <div className="pt-2 border-t border-slate-800 mt-2">
            <div
              onClick={() => toggleSublayer('countryBorders')}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                layers.countryBorders
                  ? 'bg-slate-900/90 border-cyan-500/30 text-white'
                  : 'bg-black/30 border-slate-800/80 text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-semibold text-white">Country Borders & Names</div>
                  <div className="text-[10px] text-slate-400">Labels & borders for all 177 countries</div>
                </div>
              </div>

              <div
                className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${
                  layers.countryBorders ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white transition-transform ${
                    layers.countryBorders ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
