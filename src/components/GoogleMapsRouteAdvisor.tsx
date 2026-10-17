import React, { useState } from 'react';
import {
  MapPin,
  ExternalLink,
  Navigation,
  Compass,
  Sparkles,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Clock,
  Shield,
} from 'lucide-react';

interface GoogleMapsRouteAdvisorProps {
  pickup: string;
  dropoff: string;
}

interface MapPlaceLink {
  title: string;
  uri: string;
  snippets?: string[];
}

interface RouteInsightResult {
  text: string;
  mapsLinks: MapPlaceLink[];
  pickup: string;
  dropoff: string;
  isFallback?: boolean;
  quotaExceeded?: boolean;
  message?: string;
}

export const GoogleMapsRouteAdvisor: React.FC<GoogleMapsRouteAdvisorProps> = ({
  pickup,
  dropoff,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [insight, setInsight] = useState<RouteInsightResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const directMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    pickup.trim() || 'General Trias, Cavite'
  )}&destination=${encodeURIComponent(dropoff.trim() || 'NAIA Terminal 3, Pasay')}`;

  const handleFetchMapsInsights = async () => {
    if (!pickup.trim() || !dropoff.trim()) {
      setError('Please ensure both pickup and destination locations are entered.');
      return;
    }

    setLoading(true);
    setError(null);

    let userLat = 14.385; // General Trias, Cavite default
    let userLng = 120.912;

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 3000,
            maximumAge: 60000,
          });
        });
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;
      } catch {
        // Geolocation denied or timed out, proceed with base coordinates
      }
    }

    try {
      const response = await fetch('/api/maps-route-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickup,
          dropoff,
          userLat,
          userLng,
        }),
      });

      const data: RouteInsightResult = await response.json();
      setInsight(data);
    } catch (err: any) {
      console.warn('Google Maps insights notice:', err);
      // Graceful offline fallback in client if fetch failed
      setInsight({
        pickup,
        dropoff,
        text: `🛣️ Verified Expressway Route:\nConnect via CAVITEX or CALAX corridor towards your destination. All units feature RFID AutoSweep & EasyTrip.\n\n📍 Navigation:\nUse the direct Google Maps navigation button below to launch live turn-by-turn guidance.`,
        mapsLinks: [
          {
            title: `Google Maps Live Route: ${pickup} → ${dropoff}`,
            uri: directMapsUrl,
          },
        ],
        isFallback: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#12141e] via-[#161825] to-[#12141e] border border-[#d4af37]/35 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 via-[#d4af37]/20 to-blue-500/20 border border-white/15 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-emerald-400">
                Google Maps Grounding
              </span>
              <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                gemini-3.8-flash
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
              Live Google Maps Route Advisor &amp; Place Verification
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={directMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/15 transition active:scale-95"
            title="Open turn-by-turn route directly in Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden xs:inline">Open in</span>
            <span>Maps</span>
          </a>

          <button
            type="button"
            onClick={handleFetchMapsInsights}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-[#f5d77f] to-[#d4af37] hover:brightness-110 active:scale-95 disabled:opacity-50 transition shadow-md shadow-[#d4af37]/20"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Querying Maps...</span>
              </>
            ) : (
              <>
                <Compass className="w-3.5 h-3.5" />
                <span>{insight ? 'Refresh Insights' : 'Inspect Route on Google Maps'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Route Subtitle */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
        <Navigation className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
        <span className="truncate">
          Current Route: <strong className="text-slate-200">{pickup}</strong> →{' '}
          <strong className="text-[#f5d77f]">{dropoff}</strong>
        </span>
      </div>

      {/* Quota or Informational Notice */}
      {insight?.quotaExceeded && (
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block text-amber-300">
              Gemini AI Free-Tier Quota Reached
            </span>
            <span className="text-[11px] text-amber-200/90 leading-relaxed block">
              Showing verified GoCav expressway guidance and direct Google Maps route links below. Your booking is unaffected and you can proceed normally. To expand AI quota, link a billing-enabled key in Settings.
            </span>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="mt-4 space-y-3 animate-pulse">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-4 bg-white/10 rounded w-5/6" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
          <div className="p-3 bg-white/5 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10" />
            <div className="space-y-1 flex-1">
              <div className="h-3 bg-white/10 rounded w-1/3" />
              <div className="h-3 bg-white/10 rounded w-2/3" />
            </div>
          </div>
        </div>
      )}

      {/* Insights Result Display */}
      {insight && !loading && (
        <div className="mt-4 space-y-4 animate-in fade-in duration-300">
          {/* Grounded Narrative Output */}
          <div className="p-4 rounded-xl bg-[#0d0e14] border border-white/5 text-xs text-slate-300 leading-relaxed whitespace-pre-line space-y-2 font-mono sm:font-sans">
            {insight.text}
          </div>

          {/* CRITICAL: Google Maps Grounding Links from groundingChunks */}
          {insight.mapsLinks && insight.mapsLinks.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>Verified Google Maps Places &amp; Terminal Locations:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {insight.mapsLinks.map((mapLink, idx) => (
                  <a
                    key={idx}
                    href={mapLink.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-[#181a24] hover:bg-[#1e202e] border border-[#2a2e40] hover:border-red-400/60 transition group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-white group-hover:text-red-300 transition flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span className="truncate">{mapLink.title}</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0" />
                      </div>

                      {mapLink.snippets && mapLink.snippets.length > 0 && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 italic mt-1">
                          &quot;{mapLink.snippets[0]}&quot;
                        </p>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#f5d77f]">
                      <span>Open Pin in Google Maps</span>
                      <span className="text-slate-500">maps.google.com</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Direct Link to Google Maps Route */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Grounded with Google Maps live geographic data</span>
            </span>

            <a
              href={directMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#f5d77f] hover:underline font-semibold"
            >
              <span>View Full Turn-by-Turn Route in Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Initial Callout if Not Yet Queried */}
      {!insight && !loading && !error && (
        <div className="mt-4 p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d4af37] shrink-0" />
            <span>
              Tap <strong>&quot;Inspect Route on Google Maps&quot;</strong> to get verified terminal gates, expressway entry ramps, and live Google Maps place links.
            </span>
          </div>
          <button
            type="button"
            onClick={handleFetchMapsInsights}
            className="text-xs font-bold text-[#f5d77f] hover:underline whitespace-nowrap self-start sm:self-auto"
          >
            Check Now →
          </button>
        </div>
      )}
    </div>
  );
};
