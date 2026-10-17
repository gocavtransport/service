import React, { useState, useEffect } from 'react';
import {
  EmergencyContact,
  getStoredEmergencyContacts,
  saveEmergencyContacts,
  addEmergencyContact,
  removeEmergencyContact,
  SYSTEM_HOTLINES,
} from '../data/emergencyContacts';
import { StoredRideRecord } from '../data/rideHistory';
import { CONTACT_INFO, VEHICLES } from '../data/gocavData';
import {
  ShieldAlert,
  MapPin,
  Send,
  MessageCircle,
  Phone,
  Copy,
  Check,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  Radio,
  ExternalLink,
  Users,
  Clock,
  Compass,
  RefreshCw,
} from 'lucide-react';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRide?: StoredRideRecord | null;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  activeRide,
}) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [locStatus, setLocStatus] = useState<'acquiring' | 'ready' | 'error'>('acquiring');
  const [locErrorMessage, setLocErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRel, setNewRel] = useState('Spouse / Family');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // Load contacts
  useEffect(() => {
    setContacts(getStoredEmergencyContacts());
    const handleUpdate = () => setContacts(getStoredEmergencyContacts());
    window.addEventListener('gocav_emergency_contacts_updated', handleUpdate);
    return () => window.removeEventListener('gocav_emergency_contacts_updated', handleUpdate);
  }, []);

  // Acquire Geolocation
  const acquireLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('error');
      setLocErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setLocStatus('acquiring');
    setLocErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
        });
        setLocStatus('ready');
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setLocStatus('error');
        setLocErrorMessage(
          error.code === error.PERMISSION_DENIED
            ? 'Location access was declined. You can still share trip details or allow location in browser settings.'
            : 'Unable to pinpoint GPS. Retrying...'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000,
      }
    );
  };

  useEffect(() => {
    if (isOpen) {
      acquireLocation();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const vehicle = activeRide ? VEHICLES[activeRide.vehicleKey] || VEHICLES.accent : null;
  const mapsUrl = coords
    ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        activeRide ? activeRide.pickup : 'GoCav Chauffeur Ride'
      )}`;

  // Construct structured emergency message
  const constructSOSMessage = () => {
    const timestamp = new Date().toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const dateStr = new Date().toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    let msg = `🚨 EMERGENCY ALERT — GOCAV PASSENGER SAFETY\n`;
    msg += `I am currently in transit with GoCav Chauffeur and requesting immediate assistance / location check.\n\n`;

    if (coords) {
      msg += `📍 MY LIVE GPS LOCATION:\n${mapsUrl}\n`;
      msg += `Coordinates: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)} (±${coords.accuracy || 10}m)\n`;
      msg += `Time: ${timestamp} · ${dateStr}\n\n`;
    } else {
      msg += `📍 ESTIMATED ROUTE LOCATION:\n${mapsUrl}\n`;
    }

    if (activeRide) {
      msg += `🚘 RIDE DETAILS:\n`;
      msg += `Trip Reference : ${activeRide.id}\n`;
      msg += `Service Tier   : ${activeRide.serviceLabel}\n`;
      msg += `Vehicle Tier   : ${vehicle?.name || activeRide.vehicleName} (${vehicle?.models || ''})\n`;
      msg += `Pickup Point   : ${activeRide.pickup}\n`;
      msg += `Destination    : ${activeRide.dropoff || 'As designated'}\n`;
      if (activeRide.clientName) msg += `Passenger Name : ${activeRide.clientName}\n`;
    }

    msg += `\n📞 GOCAV 24/7 FLEET DISPATCH: ${CONTACT_INFO.phone1}\n`;
    msg += `Please check in on me immediately.`;

    return msg;
  };

  const handleShareNative = async () => {
    const text = constructSOSMessage();
    if (navigator.share) {
      try {
        await navigator.share({
          title: '🚨 EMERGENCY SOS — GoCav Passenger Safety',
          text,
          url: mapsUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('Share error:', err);
        }
      }
    } else {
      handleCopyMessage();
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(constructSOSMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsAppContact = (contact: EmergencyContact) => {
    const text = constructSOSMessage();
    const cleanPhone = contact.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSmsContact = (contact: EmergencyContact) => {
    const text = constructSOSMessage();
    const cleanPhone = contact.phone.replace(/[^0-9]/g, '');
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const smsUrl = isIOS
      ? `sms:${cleanPhone}&body=${encodeURIComponent(text)}`
      : `sms:${cleanPhone}?body=${encodeURIComponent(text)}`;
    window.location.href = smsUrl;
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    addEmergencyContact({
      name: newName.trim(),
      phone: newPhone.trim(),
      relationship: newRel,
      notifyVia: 'both',
    });

    setNewName('');
    setNewPhone('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0e1017] border border-rose-500/40 shadow-2xl overflow-hidden text-slate-100">
        {/* Top Discreet Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-950/60 via-[#161824] to-[#12141e] border-b border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Emergency &amp; Safety Dispatch
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  SOS Broadcast
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Discreetly share your live GPS location &amp; ride details with trusted contacts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close SOS"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Live GPS Coordinates Card */}
          <div className="p-4 rounded-xl bg-[#141724] border border-[#2b3046] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#d4af37]/15 text-[#f5d77f] shrink-0 mt-0.5">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                    Live GPS Status
                  </span>
                  {locStatus === 'acquiring' && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-400">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Acquiring satellite fix...
                    </span>
                  )}
                  {locStatus === 'ready' && coords && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                      <Radio className="w-3 h-3 animate-pulse" /> Live (±{coords.accuracy}m accuracy)
                    </span>
                  )}
                  {locStatus === 'error' && (
                    <span className="text-[11px] text-rose-400">Location unavailable</span>
                  )}
                </div>

                {coords ? (
                  <div className="mt-1">
                    <p className="font-mono text-xs sm:text-sm text-white font-semibold">
                      {coords.lat.toFixed(5)}° N, {coords.lng.toFixed(5)}° E
                    </p>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#f5d77f] hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>Preview Live Google Maps Location</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">
                    {locErrorMessage || 'Pinpointing your device location to include in the SOS alert.'}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={acquireLocation}
              disabled={locStatus === 'acquiring'}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center justify-center gap-1.5 transition self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${locStatus === 'acquiring' ? 'animate-spin' : ''}`} />
              <span>Refresh GPS</span>
            </button>
          </div>

          {/* Active Ride Summary Box (if an active/booked ride exists) */}
          {activeRide && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900/90 to-[#12141e] border border-white/10 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-1.5">
                <span className="font-bold uppercase tracking-wider text-slate-300">
                  Active Ride Snapshot
                </span>
                <span className="font-mono text-[#f5d77f] font-bold">
                  {activeRide.id}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                <div className="truncate">
                  <span className="text-slate-500">From: </span>
                  <span className="font-semibold text-white">{activeRide.pickup}</span>
                </div>
                <div className="truncate">
                  <span className="text-slate-500">To: </span>
                  <span className="font-semibold text-white">{activeRide.dropoff || 'As designated'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Vehicle: </span>
                  <span className="font-semibold text-white">
                    {vehicle?.name || activeRide.vehicleName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Scheduled: </span>
                  <span className="font-semibold text-white">
                    {activeRide.date} @ {activeRide.pickupTime}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Primary 1-Tap SOS Broadcaster */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                <span>Instant 1-Tap Broadcaster</span>
              </span>
              <span className="text-[11px] text-slate-400">Sends GPS link + trip metadata</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleShareNative}
                className="py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 hover:brightness-110 active:scale-95 shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                <span>Share Location with Contacts (System Share)</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-200 bg-[#1c1f2e] border border-slate-700 hover:border-slate-500 active:scale-95 flex items-center justify-center gap-2 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#f5d77f]" />}
                <span>{copied ? '✓ Emergency Message Copied!' : 'Copy Emergency Text & Link'}</span>
              </button>
            </div>
          </div>

          {/* Pre-Saved Emergency Contacts List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#f5d77f]" />
                <h4 className="text-sm font-bold text-white">
                  Pre-Saved Emergency Contacts ({contacts.length})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs font-bold text-[#f5d77f] hover:text-white flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Cancel' : 'Add New Contact'}</span>
              </button>
            </div>

            {/* Quick Add Form Drawer */}
            {showAddForm && (
              <form
                onSubmit={handleAddContactSubmit}
                className="p-3.5 rounded-xl bg-[#161824] border border-[#2e334a] space-y-3 animate-in fade-in duration-150"
              >
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Add Emergency Contact to Device Storage
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    placeholder="Contact Name (e.g. Maria)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="p-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                  <input
                    type="tel"
                    placeholder="Phone (e.g. +639171234567)"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    required
                    className="p-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                  <select
                    value={newRel}
                    onChange={(e) => setNewRel(e.target.value)}
                    className="p-2 rounded-lg bg-[#1a1c28] border border-white/10 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="Spouse / Partner">Spouse / Partner</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling / Family">Sibling / Family</option>
                    <option value="Trusted Friend">Trusted Friend</option>
                    <option value="Office / Security">Office / Security</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-black bg-[#d4af37] hover:brightness-110 shadow"
                  >
                    Save Contact
                  </button>
                </div>
              </form>
            )}

            {/* Contacts Cards Grid */}
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 rounded-xl bg-[#141724] border border-[#242838] hover:border-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white">
                          {contact.name}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                          {contact.relationship}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[#f5d77f]">
                        {contact.phone}
                      </span>
                    </div>
                  </div>

                  {/* 1-Tap Trigger for this contact */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleWhatsAppContact(contact)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition"
                      title="Send WhatsApp SOS"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSmsContact(contact)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                      title="Send SMS SOS"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>SMS</span>
                    </button>

                    <a
                      href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Direct Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => removeEmergencyContact(contact.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                      title="Remove contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Hotlines Quick Bar */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
              Direct Emergency Hotlines (24/7)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href="tel:911"
                className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs font-bold flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-rose-400" />
                  <span>Call 911 (PNP Emergency)</span>
                </div>
                <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded text-rose-300 font-mono">
                  Toll-Free 911
                </span>
              </a>

              <a
                href={`tel:${CONTACT_INFO.phone1}`}
                className="p-2.5 rounded-xl bg-[#1a1c28] hover:bg-[#202334] border border-[#d4af37]/30 text-[#f5d77f] text-xs font-bold flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#d4af37]" />
                  <span>GoCav Fleet Security Desk</span>
                </div>
                <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-slate-300 font-mono">
                  {CONTACT_INFO.phone1}
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-[#0a0b10] border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px]">
            GoCav Transport Passenger Safety Protocol · General Trias Base
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
