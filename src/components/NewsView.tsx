import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Clock,
  MapPin,
  ChevronRight,
  Info,
  CheckCircle2,
  X,
  Globe2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Radio
} from 'lucide-react';
import { NewsArticle, NewsCategory } from '../types/nexus';
import { MOCK_NEWS_ARTICLES } from '../data/newsData';
import { fetchRealLiveNews } from '../services/liveNewsService';
import { tacticalAudio } from '../services/audio';

interface NewsViewProps {
  onClose?: () => void;
  onSelectCoordinates?: (coords: [number, number], title?: string) => void;
  onOpenArticleEvent?: (eventId?: string) => void;
  onSelectArticle?: (article: NewsArticle) => void;
}

export type MainCategoryTab = 'all' | 'politics' | 'business' | 'tech' | 'world' | 'disasters';

export const NewsView: React.FC<NewsViewProps> = ({
  onClose,
  onSelectCoordinates,
  onOpenArticleEvent,
  onSelectArticle,
}) => {
  const [activeGroup, setActiveGroup] = useState<MainCategoryTab>('all');
  const [subDisasterFilter, setSubDisasterFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Real-time live news state
  const [articles, setArticles] = useState<NewsArticle[]>(MOCK_NEWS_ARTICLES);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Live Connected');

  // Fetch real live news feeds on mount
  useEffect(() => {
    let isMounted = true;
    fetchRealLiveNews().then((data) => {
      if (isMounted) {
        setArticles(data.articles);
        setIsLiveConnected(data.isLive);
        setLastUpdated(data.lastUpdated);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    tacticalAudio.playPing();
    setIsRefreshing(true);
    try {
      const data = await fetchRealLiveNews(true);
      setArticles(data.articles);
      setIsLiveConnected(data.isLive);
      setLastUpdated(data.lastUpdated);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Group tab configuration with dynamic real counts
  const groupTabs: { id: MainCategoryTab; label: string; icon: string; count: number }[] = [
    {
      id: 'all',
      label: 'All Global News',
      icon: '🌐',
      count: articles.length,
    },
    {
      id: 'politics',
      label: 'Politics & Diplomacy',
      icon: '🏛️',
      count: articles.filter((a) => a.category === 'politics' || a.newsGroup === 'politics').length,
    },
    {
      id: 'business',
      label: 'Business & Economy',
      icon: '💼',
      count: articles.filter((a) => a.category === 'business' || a.newsGroup === 'business').length,
    },
    {
      id: 'tech',
      label: 'Tech & Innovation',
      icon: '🔬',
      count: articles.filter((a) => a.category === 'tech' || a.newsGroup === 'tech').length,
    },
    {
      id: 'world',
      label: 'World & Society',
      icon: '🌍',
      count: articles.filter((a) => a.category === 'world' || a.newsGroup === 'world').length,
    },
    {
      id: 'disasters',
      label: 'Earth & Weather Disasters',
      icon: '⚠️',
      count: articles.filter(
        (a) =>
          a.newsGroup === 'disasters' ||
          ['earthquake', 'volcano', 'wildfire', 'hurricane', 'flood', 'flight', 'storm'].includes(a.category)
      ).length,
    },
  ];

  // Disaster sub-filters
  const disasterSubFilters = [
    { id: 'all', label: 'All Earth Events', icon: '⚡' },
    { id: 'earthquake', label: 'Earthquakes', icon: '🌍' },
    { id: 'volcano', label: 'Volcanoes', icon: '🌋' },
    { id: 'wildfire', label: 'Wildfires', icon: '🔥' },
    { id: 'hurricane', label: 'Hurricanes', icon: '🌀' },
    { id: 'flood', label: 'Floods', icon: '🌊' },
    { id: 'flight', label: 'Flights', icon: '✈️' },
    { id: 'storm', label: 'Storms', icon: '⛈️' },
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // 1. Group filtering
      if (activeGroup !== 'all') {
        if (activeGroup === 'disasters') {
          const isDisaster =
            article.newsGroup === 'disasters' ||
            ['earthquake', 'volcano', 'wildfire', 'hurricane', 'flood', 'flight', 'storm'].includes(article.category);
          if (!isDisaster) return false;

          // Sub-filter for disasters
          if (subDisasterFilter !== 'all' && article.category !== subDisasterFilter) {
            return false;
          }
        } else {
          if (article.category !== activeGroup && article.newsGroup !== activeGroup) {
            return false;
          }
        }
      }

      // 2. Search filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = article.title.toLowerCase().includes(q);
        const matchesSummary = article.summary.toLowerCase().includes(q);
        const matchesLocation = article.location.toLowerCase().includes(q);
        const matchesCountry = article.country?.toLowerCase().includes(q) || false;
        const matchesPlain = article.plainExplanation.toLowerCase().includes(q);
        const matchesFacts = article.keyFacts.some((f) => f.toLowerCase().includes(q));

        if (!matchesTitle && !matchesSummary && !matchesLocation && !matchesCountry && !matchesPlain && !matchesFacts) {
          return false;
        }
      }

      return true;
    });
  }, [articles, activeGroup, subDisasterFilter, searchQuery]);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'politics':
        return { label: 'Politics', emoji: '🏛️', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      case 'business':
        return { label: 'Business', emoji: '💼', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'tech':
        return { label: 'Tech & Science', emoji: '🔬', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      case 'world':
        return { label: 'World News', emoji: '🌍', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
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
        return { label: 'Global', emoji: '📰', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Breaking':
        return 'bg-rose-500/25 text-rose-300 border-rose-500/60 animate-pulse';
      case 'Major':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'Severe':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'High':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'Developing':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/50';
    }
  };

  const handleShowOnGlobe = (article: NewsArticle) => {
    tacticalAudio.playPing();
    if (onSelectArticle) {
      onSelectArticle(article);
    }
    if (onSelectCoordinates && article.coordinates) {
      onSelectCoordinates(article.coordinates, article.title);
    }
    if (onOpenArticleEvent && article.relatedEventId) {
      onOpenArticleEvent(article.relatedEventId);
    }
    if (selectedArticle) {
      setSelectedArticle(null);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#050811] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Top Header / Navigation Bar */}
      <div className="bg-[#080d1a] border-b border-cyan-500/20 px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            📰
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-wide text-white">
                Global Live News Wire
              </h1>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Wire
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time dispatches from BBC World, Politics, Business, Tech and USGS Seismic Networks worldwide.
            </p>
          </div>
        </div>

        {/* Live Refresh Controls & Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Refresh latest live news headlines"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Fetching Live...' : 'Refresh Feed'}</span>
          </button>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search politics, business, tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Wire Telemetry Sub-bar */}
      <div className="px-4 sm:px-6 py-1.5 bg-[#03060f] border-b border-cyan-500/10 flex items-center justify-between text-[11px] text-slate-400 font-mono overflow-x-auto scrollbar-none shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            LIVE FEED CONNECTED
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">FEEDS: BBC WORLD · BBC POLITICS · BBC BUSINESS · BBC TECH · USGS REAL-TIME</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 shrink-0">
          <span>SYNC TIME: {lastUpdated}</span>
        </div>
      </div>

      {/* Main Categories Navigation Bar (Politics, Business, Tech, World, Disasters) */}
      <div className="px-4 sm:px-6 py-2.5 bg-[#070b16] border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        {groupTabs.map((tab) => {
          const isActive = activeGroup === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                tacticalAudio.playClick();
                setActiveGroup(tab.id);
                setSubDisasterFilter('all');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25 ring-1 ring-cyan-400'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-black/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Disaster Sub-filters (Shown when Disasters or All is selected) */}
      {activeGroup === 'disasters' && (
        <div className="px-4 sm:px-6 py-2 bg-[#060913] border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider mr-1">
            Filter by:
          </span>
          {disasterSubFilters.map((sub) => {
            const isSubActive = subDisasterFilter === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => {
                  tacticalAudio.playClick();
                  setSubDisasterFilter(sub.id);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isSubActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                <span>{sub.icon}</span>
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* News Articles Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-[#050811] via-[#050a16] to-[#040712]">
        <div className="max-w-7xl mx-auto">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-base font-bold text-slate-200">No News Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No articles matched your search or category filter. Try clearing the search or switching categories.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveGroup('all');
                  setSubDisasterFilter('all');
                }}
                className="mt-5 px-5 py-2 rounded-lg bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-600/50 cursor-pointer transition-colors"
              >
                Show All News
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredArticles.map((article) => {
                const badge = getCategoryBadge(article.category);
                return (
                  <article
                    key={article.id}
                    className="flex flex-col bg-[#090e1c] rounded-2xl border border-slate-800/90 hover:border-cyan-500/50 p-4 sm:p-5 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-950/20 group"
                  >
                    {/* Top Row: Category Badge, Importance & Timestamp */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}
                        >
                          <span>{badge.emoji}</span>
                          <span>{badge.label}</span>
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(
                            article.severity
                          )}`}
                        >
                          {article.severity}
                        </span>
                        {article.url && (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Live Wire
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{article.timestamp}</span>
                      </div>
                    </div>

                    {/* Headline */}
                    <h2
                      onClick={() => setSelectedArticle(article)}
                      className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug mb-2.5 cursor-pointer"
                    >
                      {article.title}
                    </h2>

                    {/* Plain Summary */}
                    <p className="text-xs text-slate-300 leading-relaxed mb-3 flex-1 line-clamp-3">
                      {article.summary}
                    </p>

                    {/* "In Simple Words" Explanation Box */}
                    <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-3 mb-3.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-300 mb-1">
                        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>In simple words:</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {article.plainExplanation}
                      </p>
                    </div>

                    {/* 3 Key Takeaways */}
                    <div className="space-y-1.5 mb-4 pt-2 border-t border-slate-800/80">
                      {article.keyFacts.slice(0, 2).map((fact, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <span className="leading-tight">{fact}</span>
                        </div>
                      ))}
                    </div>

                    {/* Card Footer: Location, Live Source Link & "Show on Globe" Button */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs mt-auto gap-2">
                      <div className="flex items-center gap-1.5 text-slate-400 truncate max-w-[140px]">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate font-medium">{article.location}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {article.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors"
                            title="Read original news dispatch"
                          >
                            <ExternalLink className="w-3 h-3 text-cyan-400" />
                            <span className="hidden sm:inline">Source</span>
                          </a>
                        )}

                        <button
                          onClick={() => handleShowOnGlobe(article)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/35 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-cyan-950"
                          title="Fly directly to this spot on the 3D globe"
                        >
                          <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Show on Globe</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Full Article Modal View */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#080d1c] border border-cyan-500/40 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badges & Timestamp */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span
                className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${
                  getCategoryBadge(selectedArticle.category).color
                }`}
              >
                <span>{getCategoryBadge(selectedArticle.category).emoji}</span>
                <span>{getCategoryBadge(selectedArticle.category).label}</span>
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {selectedArticle.timestamp}
              </span>
              <span className="text-xs text-slate-400">· {selectedArticle.readTime}</span>
              {selectedArticle.url && (
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Wire Dispatch
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-white leading-tight mb-3">
              {selectedArticle.title}
            </h2>

            {/* Source & Location */}
            <div className="flex items-center justify-between gap-4 text-xs text-slate-400 pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-200 font-medium">{selectedArticle.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span>Source: {selectedArticle.source}</span>
                {selectedArticle.url && (
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium underline"
                  >
                    <span>Read on {selectedArticle.source.split(' ')[0]}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Full Story Summary */}
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1.5">
                  The Story
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {selectedArticle.summary}
                </p>
              </div>

              {/* Simple Words Explanation */}
              <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-1.5">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>In Simple Words:</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  {selectedArticle.plainExplanation}
                </p>
              </div>

              {/* Key Takeaways */}
              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  Key Facts & Takeaways
                </h4>
                <div className="space-y-2">
                  {selectedArticle.keyFacts.map((fact, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Close Story
              </button>

              <button
                onClick={() => handleShowOnGlobe(selectedArticle)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                <Globe2 className="w-4 h-4" />
                <span>Fly to Location on 3D Globe</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
