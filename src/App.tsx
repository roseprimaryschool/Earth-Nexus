import React, { useState, useEffect, useMemo } from 'react';
import {
  NexusEvent,
  CountryData,
  ActiveLayers,
  GlobeViewMode,
  TimelinePlayback,
  ThreatIndexData
} from './types/nexus';
import { INITIAL_NEXUS_EVENTS } from './data/mockEvents';
import { COUNTRIES_DATA } from './data/countries';
import {
  fetchLiveEarthquakes,
  fetchLiveISSPosition,
  computeEarthThreatIndex
} from './services/api';
import { fetchLiveADSBTelemetry } from './services/flightApi';
import { GlobeView } from './components/GlobeView';
import { Header } from './components/Header';
import { LayerControls } from './components/LayerControls';
import { EventFeed } from './components/EventFeed';
import { CountryDossier } from './components/CountryDossier';
import { EventDetailModal } from './components/EventDetailModal';
import { TimelineBar } from './components/TimelineBar';
import { ThreatIndexModal } from './components/ThreatIndexModal';
import { AlertCenterModal } from './components/AlertCenterModal';
import { SearchModal } from './components/SearchModal';
import { NewsView } from './components/NewsView';
import { tacticalAudio } from './services/audio';

export default function App() {
  const [events, setEvents] = useState<NexusEvent[]>(INITIAL_NEXUS_EVENTS);
  const [countries] = useState<CountryData[]>(COUNTRIES_DATA);

  // Top level tab: 'globe' | 'news' (Requested News tab at the top!)
  const [currentTab, setCurrentTab] = useState<'globe' | 'news'>('globe');

  // Exact focus destination on globe from News or search
  const [focusTarget, setFocusTarget] = useState<{ coords: [number, number]; title?: string } | null>(null);

  // Active layer filters for the 7 requested categories
  const [activeLayers, setActiveLayers] = useState<ActiveLayers>({
    disasters: true,
    weather: true,
    news: true,
    space: true,
    transport: true,
    earthquakes: true,
    volcanoes: true,
    wildfires: true,
    hurricanes: true,
    floods: true,
    flights: true,
    storms: true,
    satellites: false,
    iss: false,
    aircraft: true,
    ships: false,
    lightning: true,
    clouds: true,
    heatmaps: false,
    countryBorders: true,
  });

  // View Mode
  const [viewMode, setViewMode] = useState<GlobeViewMode>('standard');

  // Timeline / Playback
  const [playback, setPlayback] = useState<TimelinePlayback>({
    isPlaying: false,
    currentOffsetHours: 0,
    speed: 1,
  });

  // Selected Entities
  const [selectedEvent, setSelectedEvent] = useState<NexusEvent | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

  // Panel & Modal Toggles
  const [isEventFeedOpen, setIsEventFeedOpen] = useState(true);
  const [isThreatModalOpen, setIsThreatModalOpen] = useState(false);
  const [isAlertCenterOpen, setIsAlertCenterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false); // Stationary by default

  // Live real data fetching on mount + interval
  useEffect(() => {
    let isMounted = true;

    const loadLiveTelemetry = async () => {
      // 1. Fetch live USGS earthquakes
      const liveQuakes = await fetchLiveEarthquakes();
      if (liveQuakes.length > 0 && isMounted) {
        setEvents((prev) => {
          const nonQuakes = prev.filter((e) => !e.id.startsWith('usgs-'));
          return [...liveQuakes, ...nonQuakes];
        });
      }

      // 2. Fetch live ISS position
      const issData = await fetchLiveISSPosition();
      if (issData && isMounted) {
        setEvents((prev) =>
          prev.map((e) => {
            if (e.subType === 'iss') {
              return {
                ...e,
                coordinates: [issData.lat, issData.lng],
                altitudeKm: issData.altitude,
                speedKmh: issData.speed,
                timestamp: new Date().toISOString(),
              };
            }
            return e;
          })
        );
      }

      // 3. Fetch real live ADS-B flights
      const liveFlights = await fetchLiveADSBTelemetry();
      if (liveFlights.length > 0 && isMounted) {
        setEvents((prev) => {
          const nonFlights = prev.filter((e) => e.subType !== 'aircraft' && e.category !== 'transport');
          return [...nonFlights, ...liveFlights];
        });
      }
    };

    loadLiveTelemetry();
    const interval = setInterval(loadLiveTelemetry, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Compute live Threat Index
  const threatData = useMemo(() => {
    return computeEarthThreatIndex(events);
  }, [events]);

  // Filter events based on Timeline playback offset
  const displayEvents = useMemo(() => {
    if (playback.currentOffsetHours === 0) {
      return events;
    }
    const cutoffTime = Date.now() + playback.currentOffsetHours * 60 * 60 * 1000;
    return events.filter((e) => new Date(e.timestamp).getTime() <= cutoffTime);
  }, [events, playback.currentOffsetHours]);

  // Specific counts for the 7 requested categories
  const earthquakeCount = useMemo(
    () => displayEvents.filter((e) => e.subType === 'earthquake').length,
    [displayEvents]
  );
  const volcanoCount = useMemo(
    () => displayEvents.filter((e) => e.subType === 'volcano').length,
    [displayEvents]
  );
  const wildfireCount = useMemo(
    () => displayEvents.filter((e) => e.subType === 'wildfire').length,
    [displayEvents]
  );
  const hurricaneCount = useMemo(
    () => displayEvents.filter((e) => e.subType === 'hurricane').length,
    [displayEvents]
  );
  const floodCount = useMemo(
    () => displayEvents.filter((e) => e.subType === 'flood').length,
    [displayEvents]
  );
  const flightCount = useMemo(
    () => displayEvents.filter((e) => e.subType === 'aircraft' || e.category === 'transport').length,
    [displayEvents]
  );
  const stormCount = useMemo(
    () => displayEvents.filter((e) => e.subType === 'storm' || e.category === 'weather').length,
    [displayEvents]
  );

  const activeAlertCount = useMemo(
    () => displayEvents.filter((e) => e.severity === 'CRITICAL' || e.severity === 'HIGH').length,
    [displayEvents]
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#04060c] text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header Control Center with prominent News Tab & Spin controls */}
      <Header
        threatData={threatData}
        disasterCount={earthquakeCount + volcanoCount + wildfireCount + hurricaneCount + floodCount}
        weatherCount={stormCount}
        spaceCount={0}
        transportCount={flightCount}
        activeAlertCount={activeAlertCount}
        viewMode={viewMode}
        onChangeViewMode={(mode) => setViewMode(mode)}
        onOpenThreatModal={() => setIsThreatModalOpen(true)}
        onOpenAlertsModal={() => setIsAlertCenterOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        isAutoRotating={isAutoRotating}
        onToggleAutoRotate={() => {
          tacticalAudio.playClick();
          setIsAutoRotating((prev) => !prev);
        }}
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        earthquakeCount={earthquakeCount}
        volcanoCount={volcanoCount}
        wildfireCount={wildfireCount}
        hurricaneCount={hurricaneCount}
        floodCount={floodCount}
        flightCount={flightCount}
        stormCount={stormCount}
      />

      {/* Main Content Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* TAB 1: 3D Interactive Globe Map */}
        <div className={`w-full h-full relative ${currentTab === 'globe' ? 'block' : 'hidden'}`}>
          <GlobeView
            events={displayEvents}
            countries={countries}
            activeLayers={activeLayers}
            viewMode={viewMode}
            selectedEvent={selectedEvent}
            selectedCountry={selectedCountry}
            focusCoords={focusTarget?.coords || null}
            focusLabel={focusTarget?.title || null}
            onClearFocus={() => setFocusTarget(null)}
            onSelectEvent={(evt) => {
              setSelectedEvent(evt);
              if (evt) setFocusTarget(null);
            }}
            onSelectCountry={(c) => {
              setSelectedCountry(c);
              if (c) setFocusTarget(null);
            }}
            isAutoRotating={isAutoRotating}
            onToggleAutoRotate={() => {
              tacticalAudio.playClick();
              setIsAutoRotating((prev) => !prev);
            }}
          />

          {/* Simple Show/Hide Layer Switchboard */}
          <LayerControls
            layers={activeLayers}
            onChangeLayers={(newLayers) => setActiveLayers(newLayers)}
            eventCounts={{
              earthquakes: earthquakeCount,
              volcanoes: volcanoCount,
              wildfires: wildfireCount,
              hurricanes: hurricaneCount,
              floods: floodCount,
              flights: flightCount,
              storms: stormCount,
            }}
          />

          {/* Collapsible Events List Sidebar */}
          <EventFeed
            events={displayEvents}
            selectedEvent={selectedEvent}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
            isOpen={isEventFeedOpen}
            onToggleOpen={() => setIsEventFeedOpen((prev) => !prev)}
          />

          {/* Bottom Timeline Bar */}
          <TimelineBar
            playback={playback}
            onChangePlayback={(pb) => setPlayback(pb)}
          />
        </div>

        {/* TAB 2: News Tab at the Top (Requested by User!) */}
        {currentTab === 'news' && (
          <div className="w-full h-full relative">
            <NewsView
              onClose={() => setCurrentTab('globe')}
              onSelectArticle={(article) => {
                setCurrentTab('globe');
                setFocusTarget({
                  coords: article.coordinates,
                  title: `${article.location}: ${article.title}`,
                });
                if (article.relatedEventId) {
                  const matching = events.find((e) => e.id === article.relatedEventId);
                  if (matching) {
                    setSelectedEvent(matching);
                  }
                }
              }}
              onSelectCoordinates={(coords, title) => {
                setCurrentTab('globe');
                setFocusTarget({
                  coords: coords,
                  title: title || 'Selected Story Location',
                });
              }}
              onOpenArticleEvent={(eventId) => {
                setCurrentTab('globe');
                if (eventId) {
                  const matching = events.find((e) => e.id === eventId);
                  if (matching) {
                    setSelectedEvent(matching);
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Country Profile Drawer */}
      {selectedCountry && (
        <CountryDossier
          country={selectedCountry}
          events={events}
          onClose={() => setSelectedCountry(null)}
          onSelectEvent={(evt) => setSelectedEvent(evt)}
        />
      )}

      {/* Event Details Inspector Modal with Simple Explanations */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Earth Danger Overview Modal */}
      {isThreatModalOpen && (
        <ThreatIndexModal
          threatData={threatData}
          events={events}
          onClose={() => setIsThreatModalOpen(false)}
        />
      )}

      {/* Active Alerts Center Modal */}
      {isAlertCenterOpen && (
        <AlertCenterModal
          events={events}
          onSelectEvent={(evt) => setSelectedEvent(evt)}
          onClose={() => setIsAlertCenterOpen(false)}
        />
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <SearchModal
          countries={countries}
          events={events}
          onSelectCountry={(c) => setSelectedCountry(c)}
          onSelectEvent={(evt) => setSelectedEvent(evt)}
          onClose={() => setIsSearchOpen(false)}
        />
      )}
    </div>
  );
}
