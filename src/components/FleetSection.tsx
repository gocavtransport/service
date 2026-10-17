import React from 'react';
import { VEHICLES } from '../data/gocavData';
import { Users, Briefcase, Check, Shield, Sparkles, Fuel, Compass } from 'lucide-react';

interface FleetSectionProps {
  onSelectVehicle: (key: 'accent' | 'avanza' | 'montero') => void;
}

export const FleetSection: React.FC<FleetSectionProps> = ({ onSelectVehicle }) => {
  const fleetList = [
    {
      key: 'accent' as const,
      data: VEHICLES.accent,
      features: [
        'Compact Sedan (Accent / Mirage G4 / Vios)',
        'Strict Limit: Max 4 Persons & 2 Luggage Bags',
        'Fuel-efficient & agile Cavite-NCR transfers',
        'Cold Air Conditioning & Sanitized Cabin',
        'For 5+ pax or 3+ bags, 6-Seater or SUV is required',
      ],
      idealFor: 'Solo Business, Couples, Small Families (Max 4 Pax)',
    },
    {
      key: 'avanza' as const,
      data: VEHICLES.avanza,
      features: [
        'Spacious Multi-Purpose Vehicle (Avanza / Xpander)',
        'Recommended for 5 to 6 Guests & up to 5 Luggage Bags',
        'Foldable rear seats for extended baggage capacity',
        'Dual-blower Air Conditioning for Tropical Comfort',
        'High Ground Clearance for Cavite & Regional Trips',
      ],
      idealFor: 'Families & Groups exceeding Sedan capacity (5–6 Pax)',
    },
    {
      key: 'montero' as const,
      data: VEHICLES.montero,
      features: [
        'Executive SUV (Mitsubishi Montero Sport)',
        'Full 6-Seater Capacity + Expansive Cargo Room',
        'Plush Leather Seating & Superior Highway Poise',
        'Heavy Luggage & Mountain Highway Command (Baguio / TPLEX)',
        'VIP Dignitary & High-Profile Executive Comfort',
      ],
      idealFor: 'VIP Executives, Heavy Luggage, Long-Haul Trips',
    },
  ];

  return (
    <section id="fleet" className="py-12 lg:py-16 bg-[#0e1017] border-y border-[#242736]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-xs font-bold uppercase tracking-wider text-[#f5d77f] mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>Strict Quality Standards</span>
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            The GoCav Fleet &amp; Chauffeur Standards
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            Every vehicle in our fleet is clean, comprehensively maintained, and piloted by a vetted, experienced chauffeur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {fleetList.map((item) => (
            <div
              key={item.key}
              className="rounded-2xl bg-[#141620] border border-[#242736] hover:border-[#d4af37]/50 shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group"
            >
              <div>
                {/* Vehicle Photo with Gradient Overlay */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-black/40">
                  <img
                    src={item.data.imageUrl}
                    alt={item.data.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141620] via-transparent to-black/20" />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#d4af37] text-black shadow-md">
                    ₱{item.data.perKm}/km
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-bold text-white">{item.data.name}</h3>
                    <span className="text-xs font-semibold text-[#f5d77f]">{item.data.tier}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{item.data.models}</p>

                  {/* Capacity Bar */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#1a1c28] border border-white/5 text-xs text-slate-300 mb-5">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#d4af37]" />
                      <span>{item.data.comfortPax}–{item.data.maxPax} Guests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#d4af37]" />
                      <span>{item.data.comfortBags}–{item.data.maxBags} Suitcases</span>
                    </div>
                  </div>

                  {/* Bullet features */}
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {item.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 pt-4 border-t border-white/10 text-xs">
                    <span className="text-slate-400 font-semibold block mb-0.5">Ideal For:</span>
                    <span className="text-[#f5d77f]">{item.idealFor}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <a
                  href="#booking"
                  onClick={() => onSelectVehicle(item.key)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-[#f5d77f] to-[#d4af37] hover:brightness-110 active:scale-95 transition"
                >
                  <span>Select {item.data.name}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Fleet Guarantees Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-[#141620] border border-[#d4af37]/30 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#f5d77f]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Sanitized &amp; Fresh</h4>
              <p className="text-xs text-slate-400">
                Every unit undergoes full vacuuming, air-conditioning cleaning, and cabin deodorizing prior to client pickup.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 flex items-center justify-center shrink-0">
              <Fuel className="w-5 h-5 text-[#f5d77f]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Fuel &amp; Expressway Tolls</h4>
              <p className="text-xs text-slate-400">
                Transparent quotes include driver, fuel, and standard RFID toll tags (Easytrip and Autosweep).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-[#f5d77f]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Experienced Route Navigation</h4>
              <p className="text-xs text-slate-400">
                Drivers know local bypass routes, Cavite access roads, Skyway stages, and Luzon provincial expressways.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
