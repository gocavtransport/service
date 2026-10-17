import React, { useState, useEffect } from 'react';
import {
  Printer,
  FileDown,
  Copy,
  Check,
  X,
  ShieldCheck,
  Car,
  MapPin,
  Calendar,
  Clock,
  Users,
  Briefcase,
  Mail,
  Phone,
  Building2,
  FileText,
  Share2,
} from 'lucide-react';
import { VehicleTier, CONTACT_INFO, FareCalculationResult } from '../data/gocavData';
import { generateReceiptPdf, generateColPdf } from '../utils/generateQuotePdf';

export interface PrintableReceiptData {
  ref: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  tin?: string;
  flightNumber?: string;
  serviceLabel: string;
  pickup: string;
  dropoff: string;
  date: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  days?: number;
  pax?: number;
  bags?: number;
  vehicle: VehicleTier;
  fare: FareCalculationResult;
  notes?: string;
  isCorporate?: boolean;
  companyName?: string;
  status?: 'booked' | 'estimate' | 'dispatched';
  matchedDriver?: {
    driver: string;
    unit: string;
    plate: string;
    base: string;
  } | null;
  dispatchChannel?: string;
}

interface PrintableReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PrintableReceiptData;
  initialViewMode?: 'receipt' | 'col';
}

export const PrintableReceiptModal: React.FC<PrintableReceiptModalProps> = ({
  isOpen,
  onClose,
  data,
  initialViewMode = 'receipt',
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'receipt' | 'col'>(initialViewMode);

  useEffect(() => {
    if (isOpen) {
      setViewMode(initialViewMode);
    }
  }, [isOpen, initialViewMode]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    generateReceiptPdf({
      quoteRef: data.ref,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientEmail: data.clientEmail,
      clientTin: data.tin,
      flightNumber: data.flightNumber,
      serviceLabel: data.serviceLabel,
      pickup: data.pickup,
      dropoff: data.dropoff,
      date: data.date,
      pickupTime: data.pickupTime,
      returnDate: data.returnDate,
      returnTime: data.returnTime,
      vehicle: data.vehicle,
      fare: data.fare,
      notes: data.notes,
      isCorporate: data.isCorporate,
      mode: 'receipt',
    });
  };

  const handleDownloadColPdf = () => {
    generateColPdf({
      quoteRef: data.ref,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientEmail: data.clientEmail,
      clientTin: data.tin,
      companyName: data.companyName,
      serviceLabel: data.serviceLabel,
      pickup: data.pickup,
      dropoff: data.dropoff,
      date: data.date,
      pickupTime: data.pickupTime,
      returnDate: data.returnDate,
      returnTime: data.returnTime,
      vehicleName: data.vehicle.name,
      vehicleModels: data.vehicle.models,
      matchedDriver: data.matchedDriver,
      totalFare: data.fare.total,
      isCorporate: data.isCorporate,
    });
  };

  const handleCopyText = () => {
    let txt = `═══════════════════════════════════════\n`;
    txt += `   GOCAV TRANSPORT OFFICIAL RECEIPT   \n`;
    txt += `═══════════════════════════════════════\n`;
    txt += `Receipt Ref : ${data.ref}\n`;
    txt += `Issued Date : ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}\n`;
    txt += `Status      : ${data.status === 'booked' ? 'CONFIRMED & DISPATCHED' : 'OFFICIAL FARE ESTIMATE'}\n`;
    txt += `───────────────────────────────────────\n`;
    txt += `Passenger   : ${data.clientName || 'Valued Guest'}\n`;
    txt += `Mobile      : ${data.clientPhone || 'N/A'}\n`;
    if (data.clientEmail) txt += `Email       : ${data.clientEmail}\n`;
    if (data.tin) txt += `TIN (BIR)   : ${data.tin}\n`;
    if (data.companyName) txt += `Company     : ${data.companyName}\n`;
    if (data.flightNumber) txt += `Flight/Gate : ${data.flightNumber}\n`;
    txt += `───────────────────────────────────────\n`;
    txt += `Service     : ${data.serviceLabel}\n`;
    txt += `Vehicle     : ${data.vehicle.name} (${data.vehicle.models})\n`;
    txt += `Pickup      : ${data.pickup}\n`;
    txt += `Destination : ${data.dropoff || 'As designated'}\n`;
    txt += `Schedule    : ${data.date} @ ${data.pickupTime}\n`;
    if (data.returnDate) txt += `Return      : ${data.returnDate} @ ${data.returnTime || 'TBD'}\n`;
    if (data.matchedDriver) {
      txt += `Chauffeur   : Coordinated by GoCav Dispatch (${data.matchedDriver.driver} · ${data.matchedDriver.unit} · Plate ${data.matchedDriver.plate})\n`;
    }
    txt += `───────────────────────────────────────\n`;
    txt += `ITEMIZED CHARGES:\n`;
    data.fare.lines.forEach((l) => {
      const v = l.val === 0 && l.zeroToll ? '₱0 (Toll-Free)' : `₱${Math.round(l.val).toLocaleString()}`;
      txt += ` • ${l.label.padEnd(28, ' ')} : ${v}\n`;
    });
    txt += `───────────────────────────────────────\n`;
    txt += `TOTAL FARE  : ₱${data.fare.total.toLocaleString()}\n`;
    txt += `Inclusions  : Fuel, Chauffeur & Express Tolls Included\n`;
    if (data.notes) txt += `Notes       : ${data.notes}\n`;
    txt += `═══════════════════════════════════════\n`;
    txt += `GoCav Transport Services · Gen. Trias, Cavite\n`;
    txt += `Hotline: ${CONTACT_INFO.phone1} · Email: ${CONTACT_INFO.email}\n`;

    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isBooked = data.status === 'booked' || data.status === 'dispatched';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[#141622] border border-[#d4af37]/40 shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden when Printing) */}
        <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 bg-[#0e1017] border-b border-[#242736] print:hidden gap-2">
          {/* View Mode Toggle: Receipt vs LTFRB COL */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-[#161824] border border-[#2e3244]">
              <button
                type="button"
                onClick={() => setViewMode('receipt')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'receipt'
                    ? 'bg-[#d4af37] text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>e-Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('col')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'col'
                    ? 'bg-[#d4af37] text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>LTFRB Lease (COL)</span>
              </button>
            </div>
            <span className="hidden sm:inline text-[11px] text-slate-400 font-mono">Ref: {data.ref}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-white hover:bg-white/20 active:scale-95 transition"
              title="Print document or save via browser print dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1e2130] text-slate-200 border border-white/10 hover:bg-white/10 active:scale-95 transition"
              title="Download official e-receipt PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Receipt PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadColPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#f5d77f] to-[#d4af37] text-black hover:brightness-110 active:scale-95 shadow-md shadow-[#d4af37]/20 transition"
              title="Download official LTFRB Certificate of Lease (COL) PDF for roadside and corporate compliance"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Download COL (PDF)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 active:scale-95 transition"
              title="Copy text summary"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Receipt View OR LTFRB COL View */}
        <div id="gocav-printable-receipt" className="p-5 sm:p-7 space-y-5 print:p-0 print:text-black">
          {viewMode === 'col' ? (
            /* ========================================================== */
            /* FULL LTFRB CERTIFICATE OF LEASE AGREEMENT (COL) VIEW       */
            /* ========================================================== */
            <div className="space-y-4 print:text-black">
              {/* Jurisdiction Header */}
              <div className="text-center pb-3 border-b border-[#282c3c] print:border-slate-300">
                <div className="text-[11px] font-bold text-[#d4af37] print:text-slate-700 uppercase tracking-widest">
                  Republic of the Philippines · Province of Cavite · City of General Trias
                </div>
                <h2 className="font-serif-luxury text-xl sm:text-2xl font-black text-white print:text-black mt-1">
                  CERTIFICATE OF VEHICLE LEASE AGREEMENT (COL)
                </h2>
                <p className="text-xs text-slate-300 print:text-slate-600 mt-0.5">
                  Official Instrument pursuant to LTFRB JAO No. 2014-01, Memorandum Circulars &amp; R.A. No. 4136
                </p>
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold print:border-slate-400 print:text-slate-900 print:bg-slate-100">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>DOCUMENT CONTROL NO: COL-{data.ref}</span>
                </div>
              </div>

              {/* Article I: Contracting Parties */}
              <div className="p-3.5 rounded-xl bg-[#181a26] border border-[#2b2f42] print:bg-slate-50 print:border-slate-300 text-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] print:text-slate-700 block">
                  ARTICLE I: CONTRACTING PARTIES (LESSOR &amp; LESSEE)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 print:text-slate-600 text-[11px] block font-bold mb-1">LESSOR (CAR RENTAL OPERATOR):</span>
                    <div className="font-bold text-white print:text-black text-sm">GOCAV TRANSPORT SERVICES</div>
                    <div className="text-slate-300 print:text-slate-700 mt-0.5">
                      Registered Owner: <strong className="text-white print:text-black">{CONTACT_INFO.ownerName}</strong>
                    </div>
                    <div className="text-slate-300 print:text-slate-700">
                      DTI Registration: <strong className="text-white print:text-black">Gocav Transport Services No. 2802580</strong>
                    </div>
                    <div className="text-slate-300 print:text-slate-700">Tax ID: {CONTACT_INFO.tin}</div>
                    <div className="text-slate-400 print:text-slate-600 text-[11px] mt-1">{CONTACT_INFO.address}</div>
                    <div className="text-slate-400 print:text-slate-600 text-[11px]">Hotline: {CONTACT_INFO.phone1} · {CONTACT_INFO.email}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-slate-600 text-[11px] block font-bold mb-1">LESSEE (CLIENT / CORPORATE RENTER):</span>
                    <div className="font-bold text-white print:text-black text-sm">{data.clientName || 'Valued Client'}</div>
                    <div className="text-slate-300 print:text-slate-700 mt-0.5">
                      Company: <strong className="text-white print:text-black">{data.companyName || (data.isCorporate ? 'Corporate Account' : 'Individual Charter')}</strong>
                    </div>
                    <div className="text-slate-300 print:text-slate-700">Contact: {data.clientPhone || 'On File'}</div>
                    {data.clientEmail && <div className="text-slate-300 print:text-slate-700">Email: {data.clientEmail}</div>}
                    <div className="text-slate-300 print:text-slate-700">TIN / Valid ID: {data.tin || 'Valid Government ID on record'}</div>
                    <div className="text-slate-400 print:text-slate-600 text-[11px] mt-1">
                      Account Type: <strong className="text-[#f5d77f] print:text-slate-900">{data.isCorporate ? 'Corporate Account' : 'Standard Private Charter'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Article II: Corporate Discount Requirement Callout */}
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 print:bg-amber-50 print:border-amber-300 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 print:text-amber-900 font-bold uppercase tracking-wider text-[11px]">
                  <Building2 className="w-4 h-4 text-[#d4af37]" />
                  <span>ARTICLE II: SPECIAL CORPORATE CLIENT DISCOUNT POLICY &amp; E-SIGNATURE COVENANT</span>
                </div>
                <p className="text-slate-200 print:text-slate-800 leading-relaxed text-[11px]">
                  <strong>Corporate Account Requirement:</strong> For monthly billing statements and priority fleet staging, the Lessee <strong>must provide a signed electronic or physical copy of this Certificate of Lease Agreement (COL)</strong> prior to or upon dispatch.
                </p>
                <p className="text-slate-300 print:text-slate-700 text-[10px] leading-relaxed">
                  <em>*Master Lease Validity: Once executed by an authorized corporate representative, this Agreement operates as a valid Master Lease Instrument for all future booking schedules and trips requested during its term without requiring resubmission every trip.</em>
                </p>
              </div>

              {/* Article III: Leased Vehicle & Driver */}
              <div className="p-3.5 rounded-xl bg-[#181a26] border border-[#2b2f42] print:bg-slate-50 print:border-slate-300 text-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] print:text-slate-700 block">
                  ARTICLE III: LEASED MOTOR VEHICLE &amp; CHAUFFEUR PARTICULARS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-300 print:text-slate-800">
                  <div>Vehicle Model: <strong className="text-white print:text-black">{data.vehicle.name} ({data.vehicle.models})</strong></div>
                  <div>Classification: <strong className="text-white print:text-black">{data.serviceLabel} (Chauffeur-Driven Private Lease)</strong></div>
                  <div>Assigned Plate / Unit: <strong className="text-[#f5d77f] print:text-slate-900">{data.matchedDriver ? `${data.matchedDriver.unit} (${data.matchedDriver.plate})` : 'Dispatched per Booking Manifest'}</strong></div>
                  <div>Chauffeur: <strong className="text-emerald-400 print:text-slate-900">{data.matchedDriver ? data.matchedDriver.driver : 'GoCav Licensed Professional Chauffeur (License On-Board)'}</strong></div>
                  <div className="col-span-1 sm:col-span-2 text-[11px] text-slate-400 print:text-slate-600">
                    Registration &amp; Roadworthiness: Complete with Valid LTO Official Receipt (OR) and Certificate of Registration (CR).
                  </div>
                </div>
              </div>

              {/* Article IV: Schedule & Itinerary */}
              <div className="p-3.5 rounded-xl bg-[#10121a] border border-[#2b2f42] print:bg-slate-50 print:border-slate-300 text-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] print:text-slate-700 block">
                  ARTICLE IV: TRIP SCHEDULE, ITINERARY &amp; VALUATION
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-300 print:text-slate-800">
                  <div>Pickup Location: <strong className="text-white print:text-black">{data.pickup}</strong></div>
                  <div>Destination: <strong className="text-white print:text-black">{data.dropoff || 'As instructed by Lessee within designated territorial scope'}</strong></div>
                  <div>Start Schedule: <strong className="text-white print:text-black">{data.date} at {data.pickupTime}</strong></div>
                  {data.returnDate && <div>Return Schedule: <strong className="text-white print:text-black">{data.returnDate} at {data.returnTime || 'TBD'}</strong></div>}
                  <div>Total Lease Consideration: <strong className="text-[#f5d77f] print:text-slate-900">₱{data.fare.total.toLocaleString()} (All-Inclusive)</strong></div>
                  <div>Territorial Scope: <strong className="text-white print:text-black">Cavite, Metro Manila, Calabarzon &amp; Luzon Routes</strong></div>
                </div>
              </div>

              {/* Article V: LTFRB Anti-Colorum Warranty */}
              <div className="p-3.5 rounded-xl bg-[#141620] border border-[#2b2f42] print:bg-slate-50 print:border-slate-300 text-xs space-y-1.5 text-slate-300 print:text-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 print:text-rose-700 block">
                  ARTICLE V: MANDATORY LTFRB ANTI-COLORUM &amp; LAWFUL USE WARRANTY
                </span>
                <p className="text-[11px] leading-relaxed">
                  1. <strong>Private Lease Warranty:</strong> This vehicle is contracted under a private civil lease for the exclusive use of the named Lessee and authorized companions. It is <strong>NOT a public utility vehicle (PUV)</strong> and is strictly prohibited from picking up street-hail or random paying passengers.
                </p>
                <p className="text-[11px] leading-relaxed">
                  2. <strong>To Traffic Enforcers (LTFRB / LTO / PNP-HPG / I-ACT):</strong> This document is affirmative legal proof of private charter. Valid LTO OR/CR and professional driver credentials are kept on board.
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-4 border-t border-white/10 print:border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-300 print:text-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block mb-6">LESSOR (OPERATOR):</span>
                  <div className="border-t border-white/30 print:border-slate-400 pt-1.5">
                    <strong className="text-white print:text-black block">{CONTACT_INFO.ownerName}</strong>
                    <span className="text-[10px] text-slate-400 print:text-slate-600 block">DTI Business Name: Gocav Transport Services No. 2802580</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block mb-6">LESSEE (CLIENT / CORP REPRESENTATIVE):</span>
                  <div className="border-t border-white/30 print:border-slate-400 pt-1.5">
                    <strong className="text-white print:text-black block">{data.clientName || 'AUTHORIZED CLIENT SIGNATORY'}</strong>
                    <span className="text-[10px] text-slate-400 print:text-slate-600 block">Signature over Printed Name · (Electronic / Physical Copy)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================== */
            /* STANDARD OFFICIAL E-RECEIPT VIEW                           */
            /* ========================================================== */
            <>
          {/* Receipt Top Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#282c3c] print:border-slate-300 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-luxury text-xl sm:text-2xl font-black tracking-wider text-[#f5d77f] print:text-slate-900">
                  GOCAV TRANSPORT
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40 print:border-slate-800 print:text-slate-800">
                  e-Receipt
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
                Executive Chauffeur &amp; Airport Transfer Services · Luzon Network
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 print:border-slate-400 print:text-slate-900 print:bg-slate-100">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isBooked ? 'CONFIRMED & DISPATCHED' : 'OFFICIAL FARE ESTIMATE'}</span>
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-600 font-mono mt-1">
                Ref: <strong className="text-white print:text-black">{data.ref}</strong> · Issued: {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Passenger & Itinerary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Passenger Info */}
            <div className="p-3.5 rounded-xl bg-[#181a26] border border-[#2b2f42] print:border-slate-300 print:bg-slate-50 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] print:text-slate-700 block">
                Passenger / Client Details
              </span>
              <div className="space-y-1 text-slate-200 print:text-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 print:text-slate-600">Full Name:</span>
                  <span className="font-bold text-white print:text-black">{data.clientName || 'Valued Guest'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 print:text-slate-600">Mobile (+63):</span>
                  <span className="font-mono font-semibold">{data.clientPhone || 'Not provided'}</span>
                </div>
                {data.clientEmail && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 print:text-slate-600">Billing Email:</span>
                    <span className="font-mono text-[11px] text-[#f5d77f] print:text-slate-800">{data.clientEmail}</span>
                  </div>
                )}
                {data.companyName && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 print:text-slate-600">Company:</span>
                    <span className="font-semibold">{data.companyName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 print:text-slate-600">TIN (BIR Reg):</span>
                  <span className="font-mono font-semibold text-emerald-400 print:text-slate-900">
                    {data.tin || 'Non-VAT Consumer'}
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle & Chauffeur Info */}
            <div className="p-3.5 rounded-xl bg-[#181a26] border border-[#2b2f42] print:border-slate-300 print:bg-slate-50 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] print:text-slate-700 block">
                Assigned Vehicle &amp; Service
              </span>
              <div className="space-y-1 text-slate-200 print:text-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 print:text-slate-600">Service:</span>
                  <span className="font-bold truncate max-w-[180px]">{data.serviceLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 print:text-slate-600">Vehicle:</span>
                  <span className="font-bold text-[#f5d77f] print:text-slate-900">{data.vehicle.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 print:text-slate-600">Capacity:</span>
                  <span>{data.pax ?? data.vehicle.maxPax} Pax · {data.bags ?? data.vehicle.maxBags} Bags</span>
                </div>
                {data.flightNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 print:text-slate-600">Flight / Gate:</span>
                    <span className="font-mono font-bold text-[#f5d77f] print:text-slate-900">{data.flightNumber}</span>
                  </div>
                )}
                {data.matchedDriver && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 print:text-slate-600">Chauffeur:</span>
                    <span className="font-mono text-xs font-bold text-emerald-400 print:text-emerald-700">
                      GoCav Dispatch · {data.matchedDriver.driver} ({data.matchedDriver.plate})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Itinerary Schedule Box */}
          <div className="p-3.5 rounded-xl bg-[#10121a] border border-[#2b2f42] print:border-slate-300 print:bg-slate-50 text-xs space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] print:text-slate-700 block">
              Trip Itinerary &amp; Timeline
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300 print:text-slate-900">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5 print:text-slate-700" />
                <div>
                  <span className="text-[10px] text-slate-400 print:text-slate-600 block">PICKUP LOCATION</span>
                  <span className="font-semibold text-white print:text-black">{data.pickup}</span>
                  <span className="block text-[11px] text-[#f5d77f] print:text-slate-700 mt-0.5">
                    {data.date} at {data.pickupTime}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 print:text-slate-700" />
                <div>
                  <span className="text-[10px] text-slate-400 print:text-slate-600 block">DESTINATION DROP-OFF</span>
                  <span className="font-semibold text-white print:text-black">{data.dropoff || 'As designated'}</span>
                  {data.returnDate && (
                    <span className="block text-[11px] text-emerald-400 print:text-slate-700 mt-0.5">
                      Return: {data.returnDate} at {data.returnTime || 'TBD'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {data.notes && (
              <div className="pt-2 border-t border-white/5 print:border-slate-200 text-[11px] text-slate-400 print:text-slate-700">
                <strong className="text-slate-300 print:text-black">Special Notes / Flight: </strong>
                {data.notes}
              </div>
            )}
          </div>

          {/* Itemized Fare Calculation Table */}
          <div className="rounded-xl border border-[#2b2f42] print:border-slate-300 overflow-hidden text-xs">
            <div className="bg-[#181a26] print:bg-slate-200 px-4 py-2 flex justify-between font-bold text-slate-300 print:text-slate-800 uppercase tracking-wider text-[10px]">
              <span>Itemized Fare Breakdown</span>
              <span>Amount (PHP)</span>
            </div>
            <div className="divide-y divide-white/5 print:divide-slate-200 bg-[#12141c] print:bg-white px-4 py-1">
              {data.fare.lines.map((line, idx) => (
                <div key={idx} className="py-1.5 flex justify-between items-center text-slate-300 print:text-slate-800">
                  <span className={line.disc ? 'text-emerald-400 font-medium' : ''}>
                    {line.label}
                  </span>
                  <span className={`font-mono font-bold ${line.disc ? 'text-emerald-400' : 'text-white print:text-black'}`}>
                    {line.val === 0 && line.zeroToll
                      ? '₱0 (Toll-Free)'
                      : `${line.val < 0 ? '-' : ''}₱${Math.abs(Math.round(line.val)).toLocaleString()}`}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Highlight */}
            <div className="bg-[#1a1c28] print:bg-slate-100 px-4 py-3 flex items-center justify-between border-t border-[#2b2f42] print:border-slate-300">
              <div>
                <span className="text-xs font-bold text-white print:text-black block">TOTAL FARE:</span>
                <span className="text-[10px] text-slate-400 print:text-slate-600">
                  All-Inclusive (Fuel, Chauffeur &amp; Designated Expressways)
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-black text-[#f5d77f] print:text-slate-900 font-mono">
                  ₱{data.fare.total.toLocaleString()}
                </span>
                <span className="block text-[10px] text-emerald-400 print:text-emerald-700 font-bold uppercase">
                  Inclusive of VAT / Tolls
                </span>
              </div>
            </div>

            {/* BIR Compliance & Commission Revenue Split */}
            <div className="bg-[#12141e] print:bg-slate-50 px-4 py-2 border-t border-white/5 print:border-slate-200 flex flex-wrap items-center justify-between text-[10px] text-slate-400 print:text-slate-600 gap-2">
              <span className="font-semibold text-slate-300 print:text-slate-800">
                BIR Revenue Share:
              </span>
              <div className="flex items-center gap-3 font-mono">
                <span>GoCav Platform (20%): <strong className="text-[#f5d77f] print:text-slate-900">₱{Math.round(data.fare.total * 0.20).toLocaleString()}</strong></span>
                <span>•</span>
                <span>Partner Payout (80%): <strong className="text-emerald-400 print:text-slate-900">₱{Math.round(data.fare.total * 0.80).toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          {/* Footer Notice & Contacts */}
          <div className="pt-2 text-[10px] text-slate-400 print:text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-white/10 print:border-slate-300 gap-2">
            <div>
              <p className="font-semibold text-slate-300 print:text-black">
                GoCav Transport Services · Registered Owner: {CONTACT_INFO.ownerName} ({CONTACT_INFO.dtiNumber})
              </p>
              <p>Hotline / WhatsApp / Viber: {CONTACT_INFO.phone1} · {CONTACT_INFO.phone2}</p>
              <p>Email: {CONTACT_INFO.email} · {CONTACT_INFO.tin} · General Trias, Cavite</p>
            </div>
            <div className="text-left sm:text-right font-mono">
              <span className="block text-[#f5d77f] print:text-slate-800 font-bold">Thank you for choosing GoCav!</span>
              <span>Keep this e-receipt for your records</span>
            </div>
          </div>
          </>
          )}
        </div>

        {/* Modal Bottom Close Button (Hidden when Printing) */}
        <div className="p-4 bg-[#0e1017] border-t border-[#242736] flex justify-end print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 transition"
          >
            Close Receipt View
          </button>
        </div>
      </div>
    </div>
  );
};
