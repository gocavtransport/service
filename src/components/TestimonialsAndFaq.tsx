import React, { useState } from 'react';
import { ChevronDown, Star, MessageSquareQuote, HelpCircle, MapPin, Phone, Mail, FileText, Smartphone } from 'lucide-react';
import { CONTACT_INFO } from '../data/gocavData';

interface TestimonialsAndFaqProps {
  onOpenInstallModal: () => void;
}

export const TestimonialsAndFaq: React.FC<TestimonialsAndFaqProps> = ({ onOpenInstallModal }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const testimonials = [
    {
      quote:
        'Our company uses GoCav for all site visits across Cavite industrial parks and Laguna technoparks. Invoicing is clean, drivers are professional, and the full-day rate is completely fair.',
      client: 'Operations Director',
      route: 'CEPZ Rosario / FCIE Site Tours',
      vehicle: 'Executive Sedan & Avanza',
    },
    {
      quote:
        'Booked from Las Piñas for my senior parents travelling to Batangas. The chauffeur was respectful, assisted with luggage, and updated me when they arrived. That peace of mind is priceless.',
      client: 'Maria Santos',
      route: 'Las Piñas to Batangas',
      vehicle: 'Montero Sport SUV',
    },
    {
      quote:
        'Late night arrival at NAIA Terminal 3 at 2:00 AM. Driver was already waiting curbside with my nameplate. Smooth ride via NAIAX and CAVITEX directly home to General Trias.',
      client: 'Engr. D. Ramos',
      route: 'NAIA T3 to General Trias',
      vehicle: 'Sedan Transfer',
    },
  ];

  const faqs = [
    {
      q: 'Do you serve all of Metro Manila, Cavite, and Luzon provinces?',
      a: 'Yes. We provide complete chauffeur transfers and site rentals across Cavite, Metro Manila (NAIA 1–4, BGC, Makati, Pasay, QC), Laguna, Batangas, Rizal, Bulacan, Pampanga (Clark/Subic), Tarlac, Pangasinan, La Union, Baguio (Benguet), and Western Quezon. All routes feature instant distance calculation and expressway tolls.',
    },
    {
      q: 'How does the GoCav Android App (PWA) work?',
      a: 'GoCav is built as a progressive Android application (PWA / WebAPK). By tapping "Install on Android" or selecting "Install app" in Google Chrome, it installs directly to your home screen and Android apps drawer with a native icon. It uses minimal storage (<2 MB), launches instantly in full screen without the browser URL bar, and operates offline.',
    },
    {
      q: 'Are fuel and expressway tolls really included in the live quote?',
      a: 'Yes. Every quotation clearly itemizes the base dispatch, loaded distance, and specific expressway tollways (such as CAVITEX, Skyway Stage 3, SLEX, NLEX, SCTEX, TPLEX, or STAR Tollway). Parking fees at airports or mall garages are billed at actual official receipt cost.',
    },
    {
      q: 'Can my company obtain corporate invoices and billing?',
      a: 'Yes. Gocav Transport Services is officially registered with DTI (Business Name: Gocav Transport Services No. 2802580, Registered Owner: Tuhamie Angka Dimanang) and BIR Non-VAT Reg. 940-158-988-0000. We issue itemized billing statements, official receipts, and PDF quotations tailored for corporate procurement and expense reports.',
    },
    {
      q: 'Are GoCav vehicles protected against LTFRB & LTO "Colorum" apprehensions?',
      a: 'Yes, 100%. Every dispatched GoCav vehicle operates as a lawful private charter and carries an official on-board Certificate of Vehicle Lease Agreement (COL) pursuant to LTFRB JAO No. 2014-01 and R.A. 4136. Each trip is documented with client details, driver professional license, and LTO OR/CR copies. Companies simply sign our Master COL Agreement once per year for streamlined invoicing and compliance.',
    },
    {
      q: 'What is your standby time policy for same-day round trips?',
      a: 'Same-day return transfers include up to 2 hours of free standby waiting at your destination. Additional standby hours are billed at a transparent rate of ₱450–₱550/hour depending on vehicle classification.',
    },
    {
      q: 'When do I receive driver and vehicle plate assignment?',
      a: 'For scheduled departures, your assigned chauffeur name, mobile number, vehicle model, and plate number are confirmed via SMS / WhatsApp at least 24 hours prior to pickup, or immediately for same-day dispatches.',
    },
  ];

  return (
    <section className="py-12 lg:py-16 bg-[#0c0d13]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Testimonials Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-xs font-bold uppercase tracking-wider text-[#f5d77f] mb-3">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Client Experiences</span>
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            Trusted by Travelers &amp; Corporations
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Serving airport passengers, corporate executives, and families since 2019.
          </p>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#141620] border border-[#242736] p-6 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-[#d4af37] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#d4af37]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic mb-4">
                  &quot;{t.quote}&quot;
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{t.client}</span>
                  <span className="text-[11px] text-slate-400">{t.route}</span>
                </div>
                <span className="text-[10px] text-[#f5d77f] bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/20">
                  {t.vehicle}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div id="faq" className="max-w-4xl mx-auto mb-16 scroll-mt-24">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f5d77f] mb-2">
              <HelpCircle className="w-4 h-4 text-[#d4af37]" />
              <span>Frequently Asked Questions</span>
            </div>
            <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white">
              Everything You Need to Know
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-xl bg-[#141620] border border-[#242736] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 text-sm font-semibold text-white hover:text-[#f5d77f] transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#d4af37] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Android PWA Feature Callout Banner */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-[#181a24] via-[#221f15] to-[#181a24] border border-[#d4af37]/40 p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#9a7b1c] p-0.5 shrink-0 shadow-lg">
              <div className="w-full h-full bg-[#0e1017] rounded-[14px] flex items-center justify-center">
                <Smartphone className="w-7 h-7 text-[#f5d77f]" />
              </div>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white">
                GoCav Android Application (PWA)
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                Fast, light, and battery-friendly. Install once to keep instantaneous fare quotes, flight tracking, and direct chauffeur dispatch at your fingertips.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenInstallModal}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-black bg-gradient-to-r from-[#f5d77f] to-[#d4af37] hover:brightness-110 active:scale-95 shadow-md shadow-[#d4af37]/25 shrink-0 transition"
          >
            Direct Install App Now
          </button>
        </div>

        {/* Footer & Base Info */}
        <footer className="mt-16 pt-10 border-t border-[#242736] text-xs text-slate-400">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img
                  src={CONTACT_INFO.logoUrl}
                  alt="GoCav"
                  className="h-8 w-auto rounded object-contain border border-[#d4af37]/30"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="font-serif-luxury font-bold text-base text-white">
                  GOCAV TRANSPORT
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Premium chauffeur transfers, airport shuttles, and corporate site rental across Cavite, NCR, Laguna, Batangas, and the entire Luzon island.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#d4af37]" /> Home Base &amp; Coverage
              </h5>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                {CONTACT_INFO.address}
              </p>
              <p className="text-[11px] text-[#f5d77f]">
                Home Base: General Trias, Cavite
              </p>
            </div>

            <div>
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#d4af37]" /> Contact &amp; Registration
              </h5>
              <div className="space-y-1.5 text-[11px]">
                <p className="text-slate-300">
                  <strong className="text-white">{CONTACT_INFO.ownerName}</strong> · {CONTACT_INFO.dtiNumber}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-[#d4af37]" />
                  <span>{CONTACT_INFO.phone1} / {CONTACT_INFO.phone2}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-[#d4af37]" />
                  <span>{CONTACT_INFO.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <FileText className="w-3 h-3 text-[#d4af37]" />
                  <span>{CONTACT_INFO.tin}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <span>© 2019–2026 GoCav Transport Services. All rights reserved.</span>
            <span className="text-slate-500">
              Progressive Web App · Android WebAPK Compliant
            </span>
          </div>
        </footer>
      </div>
    </section>
  );
};
