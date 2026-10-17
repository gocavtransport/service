import React, { useState, useEffect } from 'react';
import {
  StoredRideRecord,
  getStoredRides,
  deleteStoredRide,
  clearStoredRides,
  seedSampleRide,
  updateRideRating,
} from '../data/rideHistory';
import { VEHICLES, CONTACT_INFO, VehicleTier } from '../data/gocavData';
import { generateQuotePdf } from '../utils/generateQuotePdf';
import { PrintableReceiptModal, PrintableReceiptData } from './PrintableReceiptModal';
import { EmergencySOSModal } from './EmergencySOSModal';
import {
  History,
  Car,
  Calendar,
  Clock,
  MapPin,
  FileDown,
  MessageCircle,
  Trash2,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  FileText,
  PlusCircle,
  Sparkles,
  Star,
  Check,
  Printer,
  Receipt,
} from 'lucide-react';

interface MyRidesSectionProps {
  onLoadRideToForm: (ride: StoredRideRecord) => void;
}

export const MyRidesSection: React.FC<MyRidesSectionProps> = ({ onLoadRideToForm }) => {
  const [rides, setRides] = useState<StoredRideRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'booked' | 'estimate' | 'rated'>('all');
  const [expandedRideId, setExpandedRideId] = useState<string | null>(null);
  const [ratingDrawerRideId, setRatingDrawerRideId] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState<{ id: string; stars: number } | null>(null);
  const [customComment, setCustomComment] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedReceiptRide, setSelectedReceiptRide] = useState<StoredRideRecord | null>(null);
  const [receiptModalInitialTab, setReceiptModalInitialTab] = useState<'receipt' | 'col'>('receipt');
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosTargetRide, setSosTargetRide] = useState<StoredRideRecord | null>(null);

  const quickReviewTags = [
    'Punctual Chauffeur',
    'Spotless Interior',
    'Smooth Expressway Drive',
    'Polite & Professional',
    'Cold Air Conditioning',
    'Luggage Assisted',
  ];

  const refreshRides = () => {
    setRides(getStoredRides());
  };

  useEffect(() => {
    refreshRides();
    const handleUpdate = () => refreshRides();
    window.addEventListener('gocav_rides_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('gocav_rides_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleRateTrip = (id: string, stars: number) => {
    updateRideRating(id, stars);
    setRatingDrawerRideId(id);
    refreshRides();
  };

  const handleSaveReviewComment = (id: string) => {
    const ride = rides.find((r) => r.id === id);
    const existingStars = ride?.rating || 5;
    const finalComment = [selectedTag, customComment.trim()].filter(Boolean).join(' · ');
    updateRideRating(id, existingStars, finalComment || 'Great chauffeur service');
    setRatingDrawerRideId(null);
    setCustomComment('');
    setSelectedTag('');
    refreshRides();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this ride record from your saved history?')) {
      deleteStoredRide(id);
      refreshRides();
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all saved rides and estimates from your device?')) {
      clearStoredRides();
      refreshRides();
    }
  };

  const handleDownloadPdf = (ride: StoredRideRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const vehicle = VEHICLES[ride.vehicleKey] || VEHICLES.accent;
    generateQuotePdf({
      quoteRef: ride.id,
      clientName: ride.clientName || 'Valued Guest',
      clientPhone: ride.clientPhone || 'Not provided',
      serviceLabel: ride.serviceLabel,
      pickup: ride.pickup,
      dropoff: ride.dropoff,
      date: ride.date,
      pickupTime: ride.pickupTime,
      returnDate: ride.returnDate,
      returnTime: ride.returnTime,
      vehicle,
      fare: {
        total: ride.total,
        lines: ride.lines,
        notes: ride.notes || 'Inclusions: fuel, chauffeur & designated tolls.',
        isCustomQuote: false,
        tollTotal: 0,
      },
      notes: ride.notes,
      isCorporate: ride.isCorporate,
    });
  };

  const handleWhatsApp = (ride: StoredRideRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const vehicle = VEHICLES[ride.vehicleKey] || VEHICLES.accent;
    let msg = `GOCAV CHAUFFEUR DISPATCH — SAVED RIDE\n`;
    msg += `Ref: ${ride.id}\n`;
    msg += `Service: ${ride.serviceLabel}\n`;
    msg += `Vehicle: ${vehicle.name} (${vehicle.models})\n`;
    msg += `Pickup: ${ride.pickup}\n`;
    msg += `Drop-off: ${ride.dropoff}\n`;
    msg += `Schedule: ${ride.date} at ${ride.pickupTime}\n`;
    msg += `Pax: ${ride.pax} | Luggage: ${ride.bags}\n`;
    msg += `Fare Estimate: ₱${ride.total.toLocaleString()}\n`;
    if (ride.clientName) msg += `Client: ${ride.clientName}\n`;
    if (ride.clientPhone) msg += `Contact: ${ride.clientPhone}\n`;
    if (ride.rating) msg += `Client Rating: ${ride.rating}/5 Stars\n`;
    msg += `\nPlease confirm chauffeur availability for this itinerary.`;

    const url = `https://wa.me/${CONTACT_INFO.whatsappRaw}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const ratedRides = rides.filter((r) => !!r.rating && r.rating > 0);
  const averageRating =
    ratedRides.length > 0
      ? (
          ratedRides.reduce((acc, cur) => acc + (cur.rating || 0), 0) /
          ratedRides.length
        ).toFixed(1)
      : null;

  const filteredRides = rides.filter((r) => {
    if (filter === 'booked') return r.status === 'booked';
    if (filter === 'estimate') return r.status === 'estimate';
    if (filter === 'rated') return !!r.rating && r.rating > 0;
    return true;
  });

  const activeBookedRide = rides.find((r) => r.status === 'booked') || (rides.length > 0 ? rides[0] : null);

  return (
    <section id="my-rides" className="py-12 lg:py-16 bg-[#0c0d14] border-t border-[#242736] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-xs font-bold uppercase tracking-wider text-[#f5d77f] mb-3">
              <History className="w-3.5 h-3.5" />
              <span>Offline &amp; Device Storage</span>
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              My Saved Rides &amp; Estimates
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Persistent itinerary history saved on your device via localStorage. Re-quote, download PDF, or re-book anytime.
            </p>
          </div>

          {/* Filter Pills & Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {averageRating && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/35 text-xs font-bold text-[#f5d77f] mr-1">
                <Star className="w-3.5 h-3.5 fill-[#d4af37]" />
                <span>{averageRating} / 5.0 Avg ({ratedRides.length} rated)</span>
              </div>
            )}

            <div className="inline-flex p-1 rounded-xl bg-[#141620] border border-[#262938]">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === 'all'
                    ? 'bg-[#d4af37] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({rides.length})
              </button>
              <button
                onClick={() => setFilter('booked')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === 'booked'
                    ? 'bg-[#d4af37] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Booked ({rides.filter((r) => r.status === 'booked').length})
              </button>
              <button
                onClick={() => setFilter('estimate')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === 'estimate'
                    ? 'bg-[#d4af37] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Estimates ({rides.filter((r) => r.status === 'estimate').length})
              </button>
              <button
                onClick={() => setFilter('rated')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === 'rated'
                    ? 'bg-[#d4af37] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Rated ({ratedRides.length})
              </button>
            </div>

            {/* Discreet Emergency / SOS Location Sharing Button */}
            <button
              type="button"
              onClick={() => {
                setSosTargetRide(activeBookedRide || (rides.length > 0 ? rides[0] : null));
                setSosModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-500/40 hover:border-rose-400 active:scale-95 transition flex items-center gap-1.5 shadow-sm shadow-rose-950/30"
              title="Discreet Passenger Safety SOS & Live Location Sharing"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Safety / SOS</span>
            </button>

            {rides.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-500/20 transition flex items-center gap-1.5"
                title="Clear all stored rides"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear History</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Ride Live Safety & Location Tracking Banner */}
        {activeBookedRide && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#141624] via-[#10121d] to-[#1c131d] border border-rose-500/35 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                <Car className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Active Chauffeur Reservation: {activeBookedRide.id}</span>
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {activeBookedRide.date} @ {activeBookedRide.pickupTime}
                  </span>
                </div>
                <div className="text-sm sm:text-base font-bold text-white mt-1 truncate">
                  {activeBookedRide.pickup} → {activeBookedRide.dropoff || 'Designated Destination'}
                </div>
                <div className="text-xs text-slate-300">
                  {activeBookedRide.vehicleName} · {activeBookedRide.pax} Guests · Coordinated by GoCav Dispatch
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSosTargetRide(activeBookedRide);
                  setSosModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 hover:brightness-110 active:scale-95 shadow-lg shadow-rose-950/60 flex items-center gap-2 border border-rose-400/40 transition"
                title="Discreet Emergency SOS: Transmit Live Location to Pre-Saved Contacts"
              >
                <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
                <span>Discreet SOS / Share Location</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredRides.length === 0 ? (
          <div className="max-w-2xl mx-auto rounded-2xl bg-[#141620] border border-dashed border-[#2b2e3e] p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#1a1c28] border border-[#d4af37]/30 flex items-center justify-center mx-auto mb-4 text-[#f5d77f]">
              <History className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No Saved Rides in this View</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
              When you generate a fare estimate, download an official PDF quote, or dispatch a booking, details will automatically be saved to your device.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="#booking"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-[#f5d77f] to-[#d4af37] hover:brightness-110 flex items-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Calculate &amp; Book a Ride</span>
              </a>
              <button
                onClick={() => {
                  seedSampleRide();
                  refreshRides();
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-[#181a24] border border-[#2b2e3e] hover:border-[#d4af37]/40 flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Load Sample Cavite–NAIA Ride</span>
              </button>
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRides.map((ride) => {
              const vehicle = VEHICLES[ride.vehicleKey] || VEHICLES.accent;
              const isExpanded = expandedRideId === ride.id;

              return (
                <div
                  key={ride.id}
                  className="rounded-2xl bg-[#141620] border border-[#242736] hover:border-[#d4af37]/50 shadow-xl overflow-hidden flex flex-col justify-between transition-all group"
                >
                  <div className="p-5">
                    {/* Top Row: Ref, Status, and Date Created */}
                    <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#f5d77f]">
                          {ride.id}
                        </span>
                        {ride.status === 'booked' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Booked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#f5d77f]">
                            <FileText className="w-3 h-3" /> Estimate
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(ride.createdAt).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Route Visual */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="w-3 h-3" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">
                            Pickup Point
                          </span>
                          <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                            {ride.pickup}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="w-3 h-3" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">
                            Drop-off Destination
                          </span>
                          <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                            {ride.dropoff || 'As designated by client'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Schedule and Vehicle Info */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#181a24] border border-white/5 text-xs text-slate-300 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                        <span className="truncate">{ride.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                        <span>{ride.pickupTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2 pt-1 border-t border-white/5 text-[11px] text-slate-400">
                        <Car className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                        <span className="truncate">
                          {vehicle.name} · {ride.pax} Guests · {ride.bags} Bags
                        </span>
                      </div>
                    </div>

                    {/* Fare Total and Breakdown Accordion Toggle */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                            Fare Estimate (Tolls Included)
                          </span>
                          <div className="text-xl font-extrabold text-[#f5d77f]">
                            ₱{ride.total.toLocaleString()}
                          </div>
                        </div>

                        {ride.lines && ride.lines.length > 0 && (
                          <button
                            onClick={() =>
                              setExpandedRideId(isExpanded ? null : ride.id)
                            }
                            className="text-[11px] text-[#f5d77f] hover:underline flex items-center gap-1"
                          >
                            <span>{isExpanded ? 'Hide Items' : 'View Tolls'}</span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Expanded Itemized Breakdown */}
                      {isExpanded && ride.lines && (
                        <div className="mt-3 p-3 rounded-xl bg-[#0e1017] border border-white/5 text-[11px] space-y-1.5 animate-in fade-in duration-200">
                          {ride.lines.map((line, idx) => (
                            <div key={idx} className="flex justify-between text-slate-300">
                              <span className="truncate pr-2">{line.label}</span>
                              <span className="font-mono text-white shrink-0">
                                {line.val === 0 && line.zeroToll
                                  ? '₱0'
                                  : `${line.val < 0 ? '-' : ''}₱${Math.abs(
                                      Math.round(line.val)
                                    ).toLocaleString()}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Star Rating Section */}
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          {ride.rating ? 'Trip Rating & Feedback' : 'Rate Your Trip Experience'}
                        </span>
                        {ride.rating ? (
                          <span className="text-[10px] font-bold text-[#f5d77f]">
                            {ride.rating}.0 / 5.0 Stars
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Tap stars to rate</span>
                        )}
                      </div>

                      {/* Interactive 5-Star Row */}
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isHovered =
                            hoverRating?.id === ride.id && hoverRating.stars >= star;
                          const isFilled = (ride.rating || 0) >= star;
                          const active = isHovered || (!hoverRating && isFilled);

                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRateTrip(ride.id, star)}
                              onMouseEnter={() =>
                                setHoverRating({ id: ride.id, stars: star })
                              }
                              onMouseLeave={() => setHoverRating(null)}
                              className="p-1 rounded-md hover:bg-white/10 transition active:scale-125 focus:outline-none"
                              title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                            >
                              <Star
                                className={`w-4 h-4 transition-colors ${
                                  active
                                    ? 'text-[#d4af37] fill-[#d4af37] drop-shadow-[0_0_6px_rgba(212,175,55,0.6)]'
                                    : 'text-slate-600'
                                }`}
                              />
                            </button>
                          );
                        })}

                        {ride.rating && (
                          <button
                            type="button"
                            onClick={() =>
                              setRatingDrawerRideId(
                                ratingDrawerRideId === ride.id ? null : ride.id
                              )
                            }
                            className="text-[10px] text-slate-400 hover:text-[#f5d77f] underline ml-2 transition"
                          >
                            {ratingDrawerRideId === ride.id ? 'Close' : 'Add Note'}
                          </button>
                        )}
                      </div>

                      {/* Existing Comment Quote Bubble */}
                      {ride.ratingComment && ratingDrawerRideId !== ride.id && (
                        <div className="mt-2 p-2 rounded-lg bg-[#181a24] border border-white/5 text-[11px] text-slate-300 italic flex items-start gap-1.5">
                          <span className="text-[#d4af37] font-serif not-italic">“</span>
                          <span className="flex-1">{ride.ratingComment}</span>
                          <span className="text-[#d4af37] font-serif not-italic">”</span>
                        </div>
                      )}

                      {/* Review & Tag Drawer */}
                      {ratingDrawerRideId === ride.id && (
                        <div className="mt-3 p-3 rounded-xl bg-[#181a24] border border-[#d4af37]/30 space-y-2.5 animate-in fade-in duration-200">
                          <span className="text-[10px] font-bold uppercase text-[#f5d77f] block">
                            Trip Highlights (Quick select)
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {quickReviewTags.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() =>
                                  setSelectedTag(selectedTag === tag ? '' : tag)
                                }
                                className={`text-[10px] px-2 py-0.5 rounded-full border transition ${
                                  selectedTag === tag
                                    ? 'bg-[#d4af37] text-black border-[#d4af37] font-bold'
                                    : 'bg-[#12141c] text-slate-300 border-white/10 hover:border-[#d4af37]/40'
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>

                          <input
                            type="text"
                            value={customComment}
                            onChange={(e) => setCustomComment(e.target.value)}
                            placeholder="Add your feedback (e.g. prompt arrival, smooth trip)..."
                            className="w-full bg-[#12141c] border border-white/10 focus:border-[#d4af37] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                          />

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setRatingDrawerRideId(null);
                                setCustomComment('');
                                setSelectedTag('');
                              }}
                              className="px-2.5 py-1 rounded-lg text-[10px] text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveReviewComment(ride.id)}
                              className="px-3 py-1 rounded-lg text-[10px] font-bold text-black bg-gradient-to-r from-[#f5d77f] to-[#d4af37] hover:brightness-110 flex items-center gap-1 shadow-sm"
                            >
                              <Check className="w-3 h-3" />
                              <span>Save Review</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-4 bg-[#11131a] border-t border-[#202330] flex items-center justify-between gap-2">
                    <button
                      onClick={() => onLoadRideToForm(ride)}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-bold text-black bg-gradient-to-r from-[#f5d77f] to-[#d4af37] hover:brightness-110 flex items-center justify-center gap-1.5 transition active:scale-95"
                      title="Load into booking form"
                    >
                      <span>Re-Book / Edit</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => handleWhatsApp(ride, e)}
                      className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/50 transition"
                      title="Send to WhatsApp Dispatch"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setReceiptModalInitialTab('receipt');
                        setSelectedReceiptRide(ride);
                      }}
                      className="p-2 rounded-lg bg-[#1a1c28] border border-slate-700 text-[#f5d77f] hover:text-white hover:border-[#d4af37]/60 transition"
                      title="View & Print Official Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {ride.isCorporate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReceiptModalInitialTab('col');
                          setSelectedReceiptRide(ride);
                        }}
                        className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:text-white hover:bg-emerald-900/60 transition"
                        title="View / Download LTFRB Lease Agreement (COL)"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDownloadPdf(ride, e)}
                      className="p-2 rounded-lg bg-[#1a1c28] border border-slate-700 text-slate-300 hover:text-white hover:border-[#d4af37]/40 transition"
                      title="Download PDF Quotation"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>

                    {/* Discreet Emergency / SOS Location Share button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSosTargetRide(ride);
                        setSosModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/35 text-rose-300 hover:text-white hover:bg-rose-900/60 hover:border-rose-400 transition"
                      title="Discreet Emergency SOS & Share Location"
                      aria-label="Discreet Emergency SOS"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(ride.id, e)}
                      className="p-2 rounded-lg bg-[#1a1c28] border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition"
                      title="Delete from history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Printable Receipt Modal for Stored Rides */}
      {selectedReceiptRide && (
        <PrintableReceiptModal
          isOpen={!!selectedReceiptRide}
          onClose={() => setSelectedReceiptRide(null)}
          initialViewMode={receiptModalInitialTab}
          data={{
            ref: selectedReceiptRide.id,
            clientName: selectedReceiptRide.clientName || 'Valued Guest',
            clientPhone: selectedReceiptRide.clientPhone || '',
            clientEmail: selectedReceiptRide.clientEmail,
            tin: selectedReceiptRide.tin || '940-158-988-0000',
            flightNumber: selectedReceiptRide.flightNumber,
            companyName: selectedReceiptRide.companyName,
            pax: selectedReceiptRide.pax,
            bags: selectedReceiptRide.bags,
            serviceLabel: selectedReceiptRide.serviceLabel,
            pickup: selectedReceiptRide.pickup,
            dropoff: selectedReceiptRide.dropoff,
            date: selectedReceiptRide.date,
            pickupTime: selectedReceiptRide.pickupTime,
            returnDate: selectedReceiptRide.returnDate,
            returnTime: selectedReceiptRide.returnTime,
            days: selectedReceiptRide.days,
            vehicle: VEHICLES[selectedReceiptRide.vehicleKey] || VEHICLES.accent,
            fare: {
              total: selectedReceiptRide.total,
              lines: selectedReceiptRide.lines || [],
              notes: selectedReceiptRide.notes || '',
              isCustomQuote: false,
              tollTotal: 0,
            },
            notes: selectedReceiptRide.notes,
            isCorporate: selectedReceiptRide.isCorporate,
            status: selectedReceiptRide.status,
            dispatchChannel: selectedReceiptRide.dispatchChannel,
          }}
        />
      )}

      {/* Discreet Emergency / SOS Location Sharing Modal */}
      <EmergencySOSModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        activeRide={sosTargetRide}
      />
    </section>
  );
};
