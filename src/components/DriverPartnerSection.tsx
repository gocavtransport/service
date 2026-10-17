import React, { useState } from 'react';
import {
  PARTNER_CITIES,
  PARTNER_SLOTS,
  partnerCountForCity,
  CONTACT_INFO,
} from '../data/gocavData';
import { Users, Car, CheckCircle2, AlertTriangle, Send, ShieldCheck, DollarSign } from 'lucide-react';

export const DriverPartnerSection: React.FC = () => {
  const [partnerName, setPartnerName] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerCity, setPartnerCity] = useState('');
  const [partnerVehicle, setPartnerVehicle] = useState('Sedan (Accent / Vios / Mirage)');
  const [partnerYear, setPartnerYear] = useState('2022');
  const [partnerPlate, setPartnerPlate] = useState('');
  const [drivesOwnUnit, setDrivesOwnUnit] = useState(true);
  const [partnerNotes, setPartnerNotes] = useState('');
  const [appSubmitted, setAppSubmitted] = useState(false);

  const handleSubmit = (via: 'whatsapp' | 'email') => {
    if (!partnerName.trim() || !partnerPhone.trim() || !partnerCity) {
      alert('Please fill in your Name, Phone Number (+63), and Select an Open City.');
      return;
    }

    const payloadText =
      `DRIVER PARTNER APPLICATION\n` +
      `══════════════════════════\n` +
      `Name: ${partnerName.trim()}\n` +
      `Mobile: ${partnerPhone.trim()}\n` +
      `Base City Slot: ${partnerCity}\n` +
      `Vehicle Type: ${partnerVehicle}\n` +
      `Year: ${partnerYear}\n` +
      `Plate: ${partnerPlate.trim() || 'Pending verification'}\n` +
      `Drives Own Unit: ${drivesOwnUnit ? 'Yes' : 'No'}\n` +
      `Notes: ${partnerNotes.trim() || 'None'}\n` +
      `Terms: 20% coordination fee to GoCav; weekly payout. Toll & parking 100% reimbursed.\n` +
      `══════════════════════════\n` +
      `GoCav Transport Services`;

    setAppSubmitted(true);

    if (via === 'whatsapp') {
      const url = `https://wa.me/${CONTACT_INFO.whatsappRaw}?text=${encodeURIComponent(payloadText)}`;
      window.open(url, '_blank');
    } else {
      const subject = `Driver Partner Application — ${partnerName} — ${partnerCity}`;
      const url = `mailto:${CONTACT_INFO.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(payloadText)}`;
      window.location.href = url;
    }
  };

  return (
    <section id="partners" className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-xs font-bold uppercase tracking-wider text-[#f5d77f] mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Driver Partnership Network</span>
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            Drive with GoCav: City Partner Slots
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            We maintain approximately <strong className="text-white">2 partner units per city</strong> across Cavite, NCR, Laguna, and Batangas to prevent over-saturation and ensure solid earnings for each partner.
          </p>
        </div>

        {/* 3 Partnership Policy Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-[#141620] border border-[#242736] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#d4af37]/15 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-[#f5d77f]" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">20% Coordination Fee</div>
              <div className="text-[11px] text-slate-400">80% direct to partner, paid weekly</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#141620] border border-[#242736] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#d4af37]/15 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#f5d77f]" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Tolls &amp; Parking at Actual</div>
              <div className="text-[11px] text-slate-400">Reimbursed 100% · No deductions</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#141620] border border-[#242736] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#d4af37]/15 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5 text-[#f5d77f]" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Clean Units &amp; Vetted Chauffeurs</div>
              <div className="text-[11px] text-slate-400">Sedans, MPVs, and SUVs welcome</div>
            </div>
          </div>
        </div>

        {/* Dynamic City Slots Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Live City Slot Allocation</span>
              <span className="text-xs text-slate-400 font-normal">
                (Click an open city to select it in the form)
              </span>
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Open Slot
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Capped
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {PARTNER_CITIES.map((c) => {
              const filled = partnerCountForCity(c);
              const open = filled < PARTNER_SLOTS;
              const left = Math.max(0, PARTNER_SLOTS - filled);

              return (
                <div
                  key={c.name}
                  onClick={() => {
                    if (open) setPartnerCity(c.name);
                  }}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    open
                      ? 'bg-[#141620] border-emerald-500/30 hover:border-emerald-400 hover:bg-[#181d2a]'
                      : 'bg-rose-950/20 border-rose-500/30 opacity-75'
                  } ${partnerCity === c.name ? 'ring-2 ring-[#d4af37] bg-[#d4af37]/15' : ''}`}
                >
                  <div className={`text-xs font-bold ${open ? 'text-white' : 'text-rose-300'}`}>
                    {c.name}
                  </div>
                  <div className={`text-[11px] mt-1 ${open ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {open ? `Open · ${left} slot${left === 1 ? '' : 's'}` : `Full · 2 active units`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Application Form Card */}
        <div className="max-w-3xl mx-auto rounded-2xl bg-[#141620] border border-[#242736] p-6 sm:p-8 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Car className="w-5 h-5 text-[#d4af37]" />
            Apply for Driver Partnership
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Submit your vehicle and base location for review. Our fleet coordinator will verify your papers and schedule a physical vehicle inspection.
          </p>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Your Full Name *</label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g. Roberto Gomez"
                  className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Mobile (+63 Phone) *</label>
                <input
                  type="tel"
                  value={partnerPhone}
                  onChange={(e) => setPartnerPhone(e.target.value)}
                  placeholder="e.g. 0917 123 4567"
                  className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Base City Slot *</label>
                <select
                  value={partnerCity}
                  onChange={(e) => setPartnerCity(e.target.value)}
                  className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-sm text-white"
                >
                  <option value="">— Select Open City —</option>
                  {PARTNER_CITIES.map((c) => {
                    const filled = partnerCountForCity(c);
                    const left = Math.max(0, PARTNER_SLOTS - filled);
                    return (
                      <option
                        key={c.name}
                        value={c.name}
                        disabled={left === 0}
                      >
                        {c.name} {left > 0 ? `(${left} slot${left === 1 ? '' : 's'} open)` : '(Full)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Vehicle Classification</label>
                <select
                  value={partnerVehicle}
                  onChange={(e) => setPartnerVehicle(e.target.value)}
                  className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-sm text-white"
                >
                  <option value="Sedan (Accent / Vios / Mirage)">Sedan (Accent / Vios / Mirage / City)</option>
                  <option value="6-Seater MPV (Avanza / Xpander / Innova)">6-Seater MPV (Avanza / Xpander / Innova)</option>
                  <option value="SUV (Montero / Fortuner / Terra)">SUV (Montero / Fortuner / Terra)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Model Year</label>
                <input
                  type="text"
                  value={partnerYear}
                  onChange={(e) => setPartnerYear(e.target.value)}
                  placeholder="e.g. 2021 or newer"
                  className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Plate Number / Conduction</label>
                <input
                  type="text"
                  value={partnerPlate}
                  onChange={(e) => setPartnerPlate(e.target.value)}
                  placeholder="e.g. NFN 1971"
                  className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={drivesOwnUnit}
                onChange={(e) => setDrivesOwnUnit(e.target.checked)}
                className="accent-[#d4af37]"
              />
              <span className="text-slate-300">I am the primary registered driver of this unit</span>
            </label>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Additional Notes</label>
              <textarea
                rows={2}
                value={partnerNotes}
                onChange={(e) => setPartnerNotes(e.target.value)}
                placeholder="Experience in chauffeur driving, valid professional license, RFID tags equipped..."
                className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-3.5 py-2 text-sm text-white"
              />
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleSubmit('whatsapp')}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-950/40 transition"
              >
                <Send className="w-4 h-4" />
                <span>Submit Application via WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmit('email')}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-slate-200 bg-[#1e212f] border border-slate-700 hover:border-[#d4af37]/40 transition"
              >
                <span>Submit via Email</span>
              </button>
            </div>

            {appSubmitted && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Application message opened! Our partner coordinator will review within 24–48 hours.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
