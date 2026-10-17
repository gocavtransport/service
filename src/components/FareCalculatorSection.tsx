import React, { useState, useEffect, useId, useRef } from 'react';
import {
  VEHICLES,
  VehicleTier,
  GEO_HUBS,
  HOME_BASES,
  calculateFare,
  getSouthernRouteOptions,
  type NaiaTerminal,
  FareCalculationResult,
  CONTACT_INFO,
  logBookingToGoogleSheet,
  matchPartnerUnitsForPickup,
} from '../data/gocavData';
import { generateQuotePdf, generateReceiptPdf, generateColPdf } from '../utils/generateQuotePdf';
import {
  saveRideToStorage,
  StoredRideRecord,
} from '../data/rideHistory';
import { GoogleMapsRouteAdvisor } from './GoogleMapsRouteAdvisor';
import { PWAInstallButton } from './PWAInstallButton';
import { PrintableReceiptModal, PrintableReceiptData } from './PrintableReceiptModal';
import {
  Car,
  Calendar,
  Clock,
  Users,
  Briefcase,
  FileDown,
  MessageCircle,
  Mail,
  Copy,
  Check,
  Building2,
  AlertCircle,
  Info,
  ArrowRight,
  ShieldCheck,
  Plane,
  Bookmark,
  ExternalLink,
  Printer,
  Receipt,
  FileSpreadsheet,
  RefreshCw,
  FileCheck,
  Phone,
} from 'lucide-react';

interface FareCalculatorSectionProps {
  selectedServicePreload?: string;
  loadedRide?: StoredRideRecord | null;
}

export const FareCalculatorSection: React.FC<FareCalculatorSectionProps> = ({
  selectedServicePreload,
  loadedRide,
}) => {
  const pickupDataListId = useId();
  const dropoffDataListId = useId();

  // State
  const [service, setService] = useState<string>(
    selectedServicePreload || 'ONEWAY|One-Way Transfer|TRANSFER_ONEWAY'
  );
  const [pickup, setPickup] = useState<string>('');
  const [dropoff, setDropoff] = useState<string>('');
  const [vehicleKey, setVehicleKey] = useState<'accent' | 'avanza' | 'montero'>('accent');
  const [routePref, setRoutePref] = useState<'fastest' | 'budget'>('fastest');
  const [naiaTerminal, setNaiaTerminal] = useState<NaiaTerminal>('3');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [preferredBaseId, setPreferredBaseId] = useState<string>('');
  const [manualMinutes, setManualMinutes] = useState<number>(0);
  const [pickupSuggestOpen, setPickupSuggestOpen] = useState(false);
  const [dropoffSuggestOpen, setDropoffSuggestOpen] = useState(false);
  const [isCorporate, setIsCorporate] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>('');

  // Schedule & Pax
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState<string>(today);
  const [pickupTime, setPickupTime] = useState<string>('08:00');
  const [returnDate, setReturnDate] = useState<string>(today);
  const [returnTime, setReturnTime] = useState<string>('17:00');
  const [days, setDays] = useState<number>(3);
  const [pax, setPax] = useState<number>(2);
  const [bags, setBags] = useState<number>(2);
  const [sameDayWaitHrs, setSameDayWaitHrs] = useState<number>(2);
  const [excessDayKm, setExcessDayKm] = useState<number>(0);
  const [excessDayHrs, setExcessDayHrs] = useState<number>(0);

  // Client Details & BIR Compliance
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('Tuhamied@gmail.com');
  const [clientTin, setClientTin] = useState<string>('940-158-988-0000');
  const [flightNumber, setFlightNumber] = useState<string>('');
  const [clientNotes, setClientNotes] = useState<string>('');

  // UI Flow & Interaction State
  const [step, setStep] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedToRides, setSavedToRides] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [quoteRef, setQuoteRef] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [lastDispatchedVia, setLastDispatchedVia] = useState<'whatsapp' | 'email' | 'call' | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [receiptModalInitialTab, setReceiptModalInitialTab] = useState<'receipt' | 'col'>('receipt');
  const [sheetSyncStatus, setSheetSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [sedanClickAlert, setSedanClickAlert] = useState<boolean>(false);

  // Form input refs for auto-focus, cursor placement, and scroll-into-view
  const wizardContainerRef = useRef<HTMLDivElement>(null);
  const liveCalcRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const tinInputRef = useRef<HTMLInputElement>(null);
  const flightInputRef = useRef<HTMLInputElement>(null);
  const companyInputRef = useRef<HTMLInputElement>(null);
  const notesInputRef = useRef<HTMLTextAreaElement>(null);

  // Smooth step navigator that eliminates dragging up & down
  const navigateToStep = (targetStep: number) => {
    setStep(targetStep);
    setValidationError(null);
    setTimeout(() => {
      wizardContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  };

  // Auto-focus the cursor on Passenger Name whenever Step 4 is reached
  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // When a ride is loaded from My Rides history
  useEffect(() => {
    if (loadedRide) {
      if (loadedRide.serviceValue) setService(loadedRide.serviceValue);
      if (loadedRide.pickup) setPickup(loadedRide.pickup);
      if (loadedRide.dropoff) setDropoff(loadedRide.dropoff);
      if (loadedRide.date) setDate(loadedRide.date);
      if (loadedRide.pickupTime) setPickupTime(loadedRide.pickupTime);
      if (loadedRide.returnDate) setReturnDate(loadedRide.returnDate);
      if (loadedRide.returnTime) setReturnTime(loadedRide.returnTime);
      if (loadedRide.vehicleKey) setVehicleKey(loadedRide.vehicleKey);
      if (loadedRide.pax) setPax(loadedRide.pax);
      if (loadedRide.bags) setBags(loadedRide.bags);
      if (loadedRide.clientName) setClientName(loadedRide.clientName);
      if (loadedRide.clientPhone) setClientPhone(loadedRide.clientPhone);
      if (loadedRide.clientEmail) setClientEmail(loadedRide.clientEmail);
      if (loadedRide.tin) setClientTin(loadedRide.tin);
      if (loadedRide.flightNumber) setFlightNumber(loadedRide.flightNumber);
      if (loadedRide.companyName) setCompanyName(loadedRide.companyName);
      if (loadedRide.isCorporate !== undefined) setIsCorporate(loadedRide.isCorporate);
      if (loadedRide.notes) setClientNotes(loadedRide.notes);
      setQuoteRef(loadedRide.id);
      navigateToStep(3); // Jump right to the vehicle & fare breakdown review
    }
  }, [loadedRide]);

  // Service helpers
  const svcType = service.split('|')[2] || 'TRANSFER_ONEWAY';
  const serviceLabel = service.split('|')[1] || 'One-Way Transfer';
  const isDayRental = svcType === 'DAYRENTAL' || svcType === 'DAYRENTAL_MULTI' || svcType === 'DAYRENTAL_OOT';
  const isDayMulti = svcType === 'DAYRENTAL_MULTI' || svcType === 'DAYRENTAL_OOT';
  const isOOT = svcType === 'DAYRENTAL_OOT';
  const isSplit = svcType === 'TRANSFER_ROUND_SPLIT';
  const isMulti = svcType === 'TRANSFER_ROUND_MULTIDAY';
  const isSameDay = svcType === 'TRANSFER_ROUND_SAMEDAY';
  const isAirport = svcType === 'TRANSFER_AIRPORT';

  // Live Fare Compute
  const fareResult: FareCalculationResult = calculateFare({
    serviceValue: service,
    pickup,
    dropoff,
    vehicleKey,
    pickupTime,
    returnTime,
    days,
    routePref,
    selectedRouteId,
    naiaTerminal,
    preferredBaseId: preferredBaseId || undefined,
    manualMinutes,
    isCorporate,
    excessDayKm,
    excessDayHrs,
    sameDayWaitHrs,
  });

  const selectedVehicle: VehicleTier = VEHICLES[vehicleKey];
  const matchedDrivers = matchPartnerUnitsForPickup(pickup);

  // Quick Location Setters
  const quickDestinations = [
    'NAIA Airport (Terminals 1, 2, 3, 4)',
    'Bonifacio Global City (BGC) / Taguig',
    'Makati Central Business District',
    'Clark International Airport (CRK)',
    'Laguna Technopark / Nuvali (Sta. Rosa/Biñan)',
    'Batangas City / Batangas Port',
    'Baguio City, Benguet (Summer Capital)',
    'Subic Bay Freeport Zone / Zambales',
  ];

  const isSedanDisabled = pax > 4 || bags > 2;
  const sedanDisabledReason =
    pax > 4 && bags > 2
      ? 'Exceeds Sedan Limit (Max 4 Persons & 2 Bags)'
      : pax > 4
      ? 'Exceeds Sedan Passenger Limit (Max 4 Persons)'
      : 'Exceeds Sedan Baggage Allowance (Max 2 Bags)';

  const handlePaxChange = (newPax: number) => {
    setPax(newPax);
    if ((newPax > 4 || bags > 2) && vehicleKey === 'accent') {
      setVehicleKey('avanza');
    }
  };

  const handleBagsChange = (newBags: number) => {
    setBags(newBags);
    if ((pax > 4 || newBags > 2) && vehicleKey === 'accent') {
      setVehicleKey('avanza');
    }
  };

  // Enforce automatic switch away from disabled Sedan
  useEffect(() => {
    if (isSedanDisabled && vehicleKey === 'accent') {
      setVehicleKey('avanza');
    }
  }, [pax, bags, vehicleKey, isSedanDisabled]);

  const generateReference = () => {
    if (!quoteRef) {
      const ref = `GC-${Math.floor(100000 + Math.random() * 900000)}`;
      setQuoteRef(ref);
      return ref;
    }
    return quoteRef;
  };

  const getBookingSummaryText = (ref: string) => {
    let summary = `GOCAV CHAUFFEUR BOOKING / QUOTE REQUEST\n`;
    summary += `Ref: ${ref}\n`;
    summary += `═════════════════════════════════\n`;
    summary += `Client: ${clientName || 'Valued Guest'}\n`;
    summary += `Mobile: ${clientPhone || 'Not provided'}\n`;
    if (clientEmail) summary += `Billing Email: ${clientEmail}\n`;
    if (clientTin) summary += `TIN (BIR Reg): ${clientTin}\n`;
    if (flightNumber) summary += `Flight / Gate: ${flightNumber}\n`;
    if (isCorporate && companyName) summary += `Company: ${companyName}\n`;
    summary += `Corporate Account: ${isCorporate ? 'Yes' : 'No'}\n`;
    summary += `Service: ${serviceLabel}\n`;
    summary += `Vehicle: ${selectedVehicle.name} (${selectedVehicle.models})\n`;
    summary += `Pickup: ${pickup}\n`;
    if (!isDayRental || dropoff) summary += `Drop-off: ${dropoff}\n`;
    summary += `Date: ${date} at ${pickupTime}\n`;
    if (isSameDay || isSplit || isMulti) {
      summary += `Return: ${returnDate} at ${returnTime}\n`;
    }
    const effectiveDays = isDayMulti ? days : 1;
    summary += `Duration: ${effectiveDays} Day(s)\n`;
    summary += `Passengers: ${pax} pax | Luggage: ${bags} bags\n`;
    summary += `Route Preference: ${routePref === 'fastest' ? 'Fastest Expressways' : 'Budget Bypass'}\n`;
    summary += `═════════════════════════════════\n`;
    summary += `EST. FARE: ₱${fareResult.total.toLocaleString()}\n`;
    fareResult.lines.forEach((l) => {
      const vStr = l.val === 0 && l.zeroToll ? '₱0' : `${l.val < 0 ? '-' : ''}₱${Math.abs(l.val).toLocaleString()}`;
      summary += ` • ${l.label}: ${vStr}\n`;
    });
    summary += `COMMERCIAL & BIR SPLIT:\n`;
    summary += ` • GoCav Platform (20%): ₱${Math.round(fareResult.total * 0.20).toLocaleString()}\n`;
    summary += ` • Partner Driver (80%): ₱${Math.round(fareResult.total * 0.80).toLocaleString()}\n`;
    summary += `Inclusions: Fuel, chauffeur & tolls included. Parking at actual.\n`;
    if (clientNotes) summary += `Notes: ${clientNotes}\n`;
    summary += `Driver Assignment: Coordinated by GoCav Dispatch. The assigned driver will be sent after confirming available unit and driver.\n`;
    if (preferredBaseId) {
      const b = HOME_BASES.find((x) => x.id === preferredBaseId);
      if (b) summary += `Forced Home Base: ${b.shortName}\n`;
    }
    if (manualMinutes > 0) summary += `Manual Travel Time: ${manualMinutes} min\n`;
    if (matchedDrivers.length > 0) {
      summary += `Nearest Recommendation (not auto-assigned): ${matchedDrivers[0].unit.driver} - ${matchedDrivers[0].unit.unit}, ${matchedDrivers[0].unit.base} Base\n`;
    }
    summary += `═════════════════════════════════\n`;
    summary += `GoCav Transport Services · Le Rica Homes Gen. Trias & BF Resort Las Piñas`;
    return summary;
  };

  // Sync booking record to Google Sheet Base (all 12 BIR compliance columns)
  const syncToGoogleBase = async (channel: string = 'manual_sync') => {
    setSheetSyncStatus('syncing');
    const ref = quoteRef || generateReference();
    const effectiveDays = isDayMulti ? days : 1;
    const effectiveFare = fareResult.total;
    const effectiveGoCav = Math.round(effectiveFare * 0.20);
    const effectivePartner = Math.round(effectiveFare * 0.80);
    const effectiveTin = clientTin.trim() || '940-158-988-0000';
    const isAirport =
      pickup.toLowerCase().includes('naia') ||
      dropoff.toLowerCase().includes('naia') ||
      pickup.toLowerCase().includes('clark') ||
      dropoff.toLowerCase().includes('clark') ||
      pickup.toLowerCase().includes('airport') ||
      dropoff.toLowerCase().includes('airport');
    const effectiveFlight = flightNumber.trim() || (isAirport ? 'Airport Transfer' : 'N/A');
    const effectiveCompany = companyName.trim() || (isCorporate ? 'Corporate Account' : 'Individual Client');
    const effectiveClient = clientName.trim() || 'Valued Guest';
    const effectiveEmail = clientEmail.trim() || 'Tuhamied@gmail.com';

    const result = await logBookingToGoogleSheet({
      ref,
      // Exact 12 columns required for Google Sheet base & BIR compliance:
      'Days': effectiveDays,
      'Pax': pax,
      'Bags': bags,
      'Flight': effectiveFlight,
      'Est. fare': effectiveFare,
      'GoCav 20%': effectiveGoCav,
      'Partner 80%': effectivePartner,
      'Corporate': isCorporate ? 'Yes' : 'No',
      'Company': effectiveCompany,
      'Billing email': effectiveEmail,
      'TIN': effectiveTin,
      'Client': effectiveClient,

      // Flexible aliases
      days: effectiveDays,
      pax,
      bags,
      flight: effectiveFlight,
      flightNumber: effectiveFlight,
      total: effectiveFare,
      estFare: effectiveFare,
      gocavShare: effectiveGoCav,
      partnerShare: effectivePartner,
      corporate: isCorporate ? 'Yes' : 'No',
      isCorporate,
      company: effectiveCompany,
      companyName: effectiveCompany,
      billingEmail: effectiveEmail,
      email: effectiveEmail,
      clientEmail: effectiveEmail,
      tin: effectiveTin,
      clientTin: effectiveTin,
      client: effectiveClient,
      clientName: effectiveClient,
      clientPhone,
      service: serviceLabel,
      pickup,
      dropoff,
      date,
      time: pickupTime,
      vehicle: selectedVehicle.name,
      channel,
      notes: clientNotes,
    });

    if (result.success) {
      setSheetSyncStatus('synced');
      setTimeout(() => setSheetSyncStatus('idle'), 4000);
    } else {
      setSheetSyncStatus('error');
      setTimeout(() => setSheetSyncStatus('idle'), 4000);
    }
    return result;
  };

  const handleSaveToMyRides = () => {
    const ref = generateReference();
    const effectiveDays = isDayMulti ? days : 1;
    const effectiveTin = clientTin.trim() || '940-158-988-0000';
    const effectiveFlight = flightNumber.trim() || undefined;
    const effectiveCompany = companyName.trim() || (isCorporate ? 'Corporate Account' : undefined);

    saveRideToStorage({
      id: ref,
      status: 'estimate',
      serviceLabel,
      serviceValue: service,
      pickup,
      dropoff,
      date,
      pickupTime,
      returnDate: isSameDay || isSplit || isMulti ? returnDate : undefined,
      returnTime: isSameDay || isSplit || isMulti ? returnTime : undefined,
      days: effectiveDays,
      vehicleKey,
      vehicleName: `${selectedVehicle.name} (${selectedVehicle.models})`,
      pax,
      bags,
      total: fareResult.total,
      lines: fareResult.lines,
      notes: clientNotes,
      clientName,
      clientPhone,
      clientEmail,
      tin: effectiveTin,
      flightNumber: effectiveFlight,
      companyName: effectiveCompany,
      isCorporate,
      gocavShare: Math.round(fareResult.total * 0.20),
      partnerShare: Math.round(fareResult.total * 0.80),
      routePref,
    selectedRouteId,
    naiaTerminal,
      dispatchChannel: 'saved',
    });
    syncToGoogleBase('saved');
    setSavedToRides(true);
    setTimeout(() => setSavedToRides(false), 3000);
  };

  const handleCopySummary = () => {
    const ref = generateReference();
    const txt = getBookingSummaryText(ref);
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);

    const effectiveDays = isDayMulti ? days : 1;
    const effectiveTin = clientTin.trim() || '940-158-988-0000';
    const effectiveFlight = flightNumber.trim() || undefined;
    const effectiveCompany = companyName.trim() || (isCorporate ? 'Corporate Account' : undefined);

    // Also persist to My Rides
    saveRideToStorage({
      id: ref,
      status: 'estimate',
      serviceLabel,
      serviceValue: service,
      pickup,
      dropoff,
      date,
      pickupTime,
      returnDate: isSameDay || isSplit || isMulti ? returnDate : undefined,
      returnTime: isSameDay || isSplit || isMulti ? returnTime : undefined,
      days: effectiveDays,
      vehicleKey,
      vehicleName: `${selectedVehicle.name} (${selectedVehicle.models})`,
      pax,
      bags,
      total: fareResult.total,
      lines: fareResult.lines,
      notes: clientNotes,
      clientName,
      clientPhone,
      clientEmail,
      tin: effectiveTin,
      flightNumber: effectiveFlight,
      companyName: effectiveCompany,
      isCorporate,
      gocavShare: Math.round(fareResult.total * 0.20),
      partnerShare: Math.round(fareResult.total * 0.80),
      routePref,
    selectedRouteId,
    naiaTerminal,
      dispatchChannel: 'saved',
    });
  };

  const handleDownloadPdf = () => {
    const ref = generateReference();
    const effectiveDays = isDayMulti ? days : 1;
    const effectiveTin = clientTin.trim() || '940-158-988-0000';
    const effectiveFlight = flightNumber.trim() || undefined;
    const effectiveCompany = companyName.trim() || (isCorporate ? 'Corporate Account' : undefined);

    generateReceiptPdf({
      quoteRef: ref,
      clientName: clientName || 'Valued Guest',
      clientPhone,
      clientEmail,
      clientTin: effectiveTin,
      flightNumber: effectiveFlight,
      companyName: effectiveCompany,
      days: effectiveDays,
      pax,
      bags,
      serviceLabel,
      pickup,
      dropoff,
      date,
      pickupTime,
      returnDate,
      returnTime,
      vehicle: selectedVehicle,
      fare: fareResult,
      notes: clientNotes,
      isCorporate,
      mode: 'receipt',
    });

    syncToGoogleBase('pdf');

    // Also persist to My Rides
    saveRideToStorage({
      id: ref,
      status: 'estimate',
      serviceLabel,
      serviceValue: service,
      pickup,
      dropoff,
      date,
      pickupTime,
      returnDate: isSameDay || isSplit || isMulti ? returnDate : undefined,
      returnTime: isSameDay || isSplit || isMulti ? returnTime : undefined,
      days: effectiveDays,
      vehicleKey,
      vehicleName: `${selectedVehicle.name} (${selectedVehicle.models})`,
      pax,
      bags,
      total: fareResult.total,
      lines: fareResult.lines,
      notes: clientNotes,
      clientName,
      clientPhone,
      clientEmail,
      tin: effectiveTin,
      flightNumber: effectiveFlight,
      companyName: effectiveCompany,
      isCorporate,
      gocavShare: Math.round(fareResult.total * 0.20),
      partnerShare: Math.round(fareResult.total * 0.80),
      routePref,
    selectedRouteId,
    naiaTerminal,
      dispatchChannel: 'pdf',
    });
  };

  const handleOpenColModal = () => {
    setReceiptModalInitialTab('col');
    setShowReceiptModal(true);
  };

  const handleOpenReceiptModal = () => {
    setReceiptModalInitialTab('receipt');
    setShowReceiptModal(true);
  };

  const handleDownloadColDirect = () => {
    const ref = quoteRef || generateReference();
    const effectiveTin = clientTin.trim() || '940-158-988-0000';
    const effectiveCompany = companyName.trim() || (isCorporate ? 'Corporate Account' : undefined);

    generateColPdf({
      quoteRef: ref,
      clientName: clientName.trim() || 'Valued Guest',
      clientPhone,
      clientEmail,
      clientTin: effectiveTin,
      companyName: effectiveCompany,
      serviceLabel,
      pickup,
      dropoff,
      date,
      pickupTime,
      returnDate: isSameDay || isSplit || isMulti ? returnDate : undefined,
      returnTime: isSameDay || isSplit || isMulti ? returnTime : undefined,
      vehicleName: selectedVehicle.name,
      vehicleModels: selectedVehicle.models,
      matchedDriver: matchedDrivers.length > 0 ? matchedDrivers[0].unit : null,
      totalFare: fareResult.total,
      isCorporate,
    });
  };

  const validateBookingDetails = (): boolean => {
    if (!clientName.trim()) {
      setValidationError('Please enter Passenger / Contact Name before dispatching.');
      nameInputRef.current?.focus();
      nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    if (!clientPhone.trim() || clientPhone.replace(/\D/g, '').length < 8) {
      setValidationError('Please enter a valid Mobile Phone Number (+63) for chauffeur coordination.');
      phoneInputRef.current?.focus();
      phoneInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    if (!pickup.trim()) {
      setValidationError('Pickup location is missing. Please select pickup location.');
      navigateToStep(1);
      return false;
    }
    if (!isDayRental && !dropoff.trim()) {
      setValidationError('Drop-off destination is missing. Please select destination.');
      navigateToStep(1);
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleDispatch = async (via: 'whatsapp' | 'email' | 'call') => {
    if (!validateBookingDetails()) {
      return;
    }

    const ref = generateReference();
    const summary = getBookingSummaryText(ref);
    setLastDispatchedVia(via);

    // Save to Google Sheet with all 12 columns for BIR compliance and booking record
    await syncToGoogleBase(via);

    const effectiveDays = isDayMulti ? days : 1;
    const effectiveTin = clientTin.trim() || '940-158-988-0000';
    const effectiveFlight = flightNumber.trim() || undefined;
    const effectiveCompany = companyName.trim() || (isCorporate ? 'Corporate Account' : undefined);

    // Save to localStorage as a booked ride
    saveRideToStorage({
      id: ref,
      status: 'booked',
      serviceLabel,
      serviceValue: service,
      pickup,
      dropoff,
      date,
      pickupTime,
      returnDate: isSameDay || isSplit || isMulti ? returnDate : undefined,
      returnTime: isSameDay || isSplit || isMulti ? returnTime : undefined,
      days: effectiveDays,
      vehicleKey,
      vehicleName: `${selectedVehicle.name} (${selectedVehicle.models})`,
      pax,
      bags,
      total: fareResult.total,
      lines: fareResult.lines,
      notes: clientNotes,
      clientName,
      clientPhone,
      clientEmail,
      tin: effectiveTin,
      flightNumber: effectiveFlight,
      companyName: effectiveCompany,
      isCorporate,
      gocavShare: Math.round(fareResult.total * 0.20),
      partnerShare: Math.round(fareResult.total * 0.80),
      routePref,
    selectedRouteId,
    naiaTerminal,
      dispatchChannel: via,
    });

    setIsSubmitted(true);

    if (via === 'whatsapp') {
      const url = `https://wa.me/${CONTACT_INFO.whatsappRaw}?text=${encodeURIComponent(summary)}`;
      window.open(url, '_blank');
    } else if (via === 'email') {
      const subject = `GoCav Chauffeur Reservation [${ref}] — ${clientName || 'Guest'}`;
      const ccList = [clientEmail.trim(), 'Tuhamied@gmail.com'].filter(Boolean).join(',');
      const mailtoUrl = `mailto:${CONTACT_INFO.email}?cc=${encodeURIComponent(ccList)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;
      window.location.href = mailtoUrl;
    } else if (via === 'call') {
      window.location.href = `tel:${CONTACT_INFO.whatsappRaw}`;
    }
  };

  return (
    <section id="booking" className="py-12 lg:py-16 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-xs font-bold uppercase tracking-wider text-[#f5d77f] mb-3">
            <Plane className="w-3.5 h-3.5" />
            <span>Real-Time Distance &amp; Toll Fare Engine</span>
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            Book Chauffeur or Get Instant PDF Quote
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            Select your itinerary for dynamic fare calculation, toll passings, and driver matching.
          </p>
        </div>

        {/* Wizard Steps Navigation */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Route & Service' },
              { num: 2, label: 'Schedule & Pax' },
              { num: 3, label: 'Vehicle & Tolls' },
              { num: 4, label: 'Review & Dispatch' },
            ].map((s, idx, arr) => (
              <React.Fragment key={s.num}>
                <button
                  type="button"
                  onClick={() => navigateToStep(s.num)}
                  className="flex items-center gap-2.5 text-left group focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-extrabold text-sm sm:text-base transition-all ${
                      step === s.num
                        ? 'bg-[#d4af37] text-black ring-4 ring-[#d4af37]/35 shadow-lg'
                        : step > s.num
                        ? 'bg-emerald-500 text-black'
                        : 'bg-[#1a1c26] text-slate-300 border border-slate-700'
                    }`}
                  >
                    {step > s.num ? <Check className="w-5 h-5 stroke-[3]" /> : s.num}
                  </div>
                  <span
                    className={`hidden sm:inline text-sm md:text-base font-bold ${
                      step === s.num ? 'text-[#f5d77f]' : 'text-slate-300'
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
                {idx < arr.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-all ${
                      step > s.num ? 'bg-emerald-500' : 'bg-[#242736]'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Interactive Form Card */}
        <div
          ref={wizardContainerRef}
          className="max-w-4xl mx-auto rounded-2xl bg-[#12141c] border border-[#242736] shadow-2xl p-6 sm:p-8 scroll-mt-24"
        >
          {/* STEP 1: ROUTE & SERVICE */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200 mb-2">
                  Select Transportation Service
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-4 py-3.5 text-base sm:text-lg text-white font-semibold focus:outline-none transition shadow-sm"
                >
                  <option value="AIRPORT|Airport Transfer (NAIA Pickup or Drop-off)|TRANSFER_AIRPORT">
                    Airport Transfer — NAIA Pickup or Drop-off (Recommended for flights)
                  </option>
                  <option value="ONEWAY|One-Way Transfer|TRANSFER_ONEWAY">
                    One-Way Direct Transfer (Point A to Point B)
                  </option>
                  <option value="ROUND_SAMEDAY|Round Trip - Same-Day Return|TRANSFER_ROUND_SAMEDAY">
                    Round Trip — Standby / Immediate Return (Includes 2 hrs free wait)
                  </option>
                  <option value="ROUND_SPLIT|Same-Day Split Transfer (AM Drop-off + PM Return)|TRANSFER_ROUND_SPLIT">
                    Same-Day Split Transfer (AM Drop-off + PM Return)
                  </option>
                  <option value="ROUND_MULTIDAY|Round Trip - Multi-Day Return|TRANSFER_ROUND_MULTIDAY">
                    Round Trip — Multi-Day Return (Different Dates)
                  </option>
                  <option value="DAYRENTAL|Full-Day Rental / Site Visit|DAYRENTAL">
                    Full-Day Rental / Site Visit (8 hrs / 100 km, returned to pickup point)
                  </option>
                  <option value="DAYRENTAL_MULTI|Multi-Day Site Visit - Same Route Daily|DAYRENTAL_MULTI">
                    Multi-Day Site Visit — Same Route Daily (Corporate · 2–7 days)
                  </option>
                  <option value="DAYRENTAL_OOT|Out-of-Town Multi-Day (Vehicle Retained)|DAYRENTAL_OOT">
                    Out-of-Town Multi-Day (2–7 days, chauffeur stays with party)
                  </option>
                </select>
                {isAirport && (
                  <p className="text-xs text-[#f5d77f] mt-2">
                    Recommended for all NAIA trips. Includes flight monitoring, curbside assistance, and airport parking on pickup.
                  </p>
                )}
              {/* Popular sample routes */}
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-300 block mb-2">Popular routes (tap to fill):</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Molino → NAIA T3', pickup: 'Molino, Bacoor, Cavite', dropoff: 'NAIA Terminal 3', terminal: '3' as const, service: 'AIRPORT|Airport Transfer (NAIA Pickup or Drop-off)|TRANSFER_AIRPORT' },
                    { label: 'Gen Trias → BGC', pickup: 'General Trias, Cavite (Home Base)', dropoff: 'BGC, Taguig', terminal: '3' as const, service: 'ONEWAY|One-Way Transfer|TRANSFER_ONEWAY' },
                    { label: 'Town & Country → NAIA', pickup: 'Town and Country, Dasmariñas', dropoff: 'NAIA Terminal 3', terminal: '3' as const, service: 'AIRPORT|Airport Transfer (NAIA Pickup or Drop-off)|TRANSFER_AIRPORT' },
                    { label: 'BF Resort → NAIA', pickup: 'BF Resort, Las Piñas', dropoff: 'NAIA Terminal 3', terminal: '3' as const, service: 'AIRPORT|Airport Transfer (NAIA Pickup or Drop-off)|TRANSFER_AIRPORT' },
                  ].map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      onClick={() => {
                        setService(r.service);
                        setPickup(r.pickup);
                        setDropoff(r.dropoff);
                        setNaiaTerminal(r.terminal);
                      }}
                      className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-sky-500/40 bg-sky-950/40 text-sky-100 hover:border-sky-400 font-medium transition"
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs sm:text-sm text-slate-300">Install the app on your tablet for faster booking.</span>
                <PWAInstallButton variant="primary" />
              </div>

              </div>

              {/* Pickup and Dropoff inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200 mb-1.5 flex items-center justify-between">
                    <span>Pickup Location</span>
                    <span className="text-xs sm:text-sm text-[#f5d77f] font-semibold">Cavite base anchored</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pickup}
                      onChange={(e) => { setPickup(e.target.value); setPickupSuggestOpen(true); }}
                      onFocus={() => setPickupSuggestOpen(true)}
                      onBlur={() => setTimeout(() => setPickupSuggestOpen(false), 200)}
                      placeholder="e.g. General Trias, Bacoor, Makati, NAIA"
                      className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-4 py-3.5 text-base sm:text-lg text-white font-medium placeholder-slate-400 focus:outline-none transition"
                    />
                    {pickupSuggestOpen && pickup.trim().length >= 2 && (
                      <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl bg-[#1a1c26] border border-[#2e3244] shadow-xl">
                        {GEO_HUBS.filter((h) => h.name.toLowerCase().includes(pickup.toLowerCase()) || h.k.some((k) => k.includes(pickup.toLowerCase()))).slice(0, 8).map((hub) => (
                          <button
                            key={hub.name}
                            type="button"
                            onMouseDown={() => { setPickup(hub.name); setPickupSuggestOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-[#d4af37]/15 hover:text-white"
                          >
                            {hub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200 mb-1.5 flex items-center justify-between">
                    <span>Destination / Drop-off</span>
                    {isDayRental && <span className="text-xs text-slate-300">Optional for day rental</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={dropoff}
                      onChange={(e) => { setDropoff(e.target.value); setDropoffSuggestOpen(true); }}
                      onFocus={() => setDropoffSuggestOpen(true)}
                      onBlur={() => setTimeout(() => setDropoffSuggestOpen(false), 200)}
                      placeholder="e.g. NAIA Terminal 3, BGC, Baguio, Clark"
                      className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-4 py-3.5 text-base sm:text-lg text-white font-medium placeholder-slate-400 focus:outline-none transition"
                    />
                    {dropoffSuggestOpen && dropoff.trim().length >= 2 && (
                      <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl bg-[#1a1c26] border border-[#2e3244] shadow-xl">
                        {GEO_HUBS.filter((h) => h.name.toLowerCase().includes(dropoff.toLowerCase()) || h.k.some((k) => k.includes(dropoff.toLowerCase()))).slice(0, 8).map((hub) => (
                          <button
                            key={hub.name}
                            type="button"
                            onMouseDown={() => { setDropoff(hub.name); setDropoffSuggestOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-[#d4af37]/15 hover:text-white"
                          >
                            {hub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Destination Chips */}
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-300 block mb-2">Quick popular hubs:</span>
                <div className="flex flex-wrap gap-2">
                  {quickDestinations.map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => setDropoff(dest)}
                      className={`text-xs sm:text-sm px-3 py-1.5 rounded-lg border font-medium transition ${
                        dropoff === dest
                          ? 'bg-[#d4af37]/25 border-[#d4af37] text-[#f5d77f] font-bold shadow-sm'
                          : 'bg-[#161822] border-[#2b2e3e] text-slate-200 hover:border-[#d4af37]/40 hover:text-white'
                      }`}
                    >
                      {dest.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* NAIA Terminal Selector */}
              {(pickup.toLowerCase().includes('naia') || dropoff.toLowerCase().includes('naia') || pickup.toLowerCase().includes('airport') || dropoff.toLowerCase().includes('airport')) && (
                <div className="p-4 rounded-xl bg-[#161822] border border-[#d4af37]/30">
                  <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider block mb-2">
                    NAIA Terminal (each has different toll)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(['1','2','3','4'] as NaiaTerminal[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNaiaTerminal(t)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                          naiaTerminal === t
                            ? 'bg-[#d4af37] text-black border-[#d4af37]'
                            : 'bg-[#1f2230] text-slate-200 border-[#2b2e3e] hover:border-[#d4af37]/50'
                        }`}
                      >
                        Terminal {t}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    T3 is usually fastest/cheapest via Andrews Ave. T1 & T2 have direct ramps. T4 uses Entertainment City / Tramo.
                  </p>
                </div>
              )}

              {/* Southern Toll Route Chooser */}
              {(() => {
                const options = getSouthernRouteOptions(pickup, dropoff, naiaTerminal);
                if (options.length === 0) return null;
                const activeId = selectedRouteId || options.find(o => o.recommended)?.id || options[0].id;
                return (
                  <div className="p-4 rounded-xl bg-[#161822] border border-[#242736]">
                    <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider block mb-2">
                      Choose Toll Route (we suggest the fastest)
                    </span>
                    <div className="space-y-2">
                      {options.map((opt) => (
                        <label key={opt.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                          activeId === opt.id
                            ? 'border-[#d4af37] bg-[#d4af37]/10'
                            : 'border-[#2b2e3e] hover:border-[#d4af37]/40'
                        }`}>
                          <input
                            type="radio"
                            name="tollRoute"
                            checked={activeId === opt.id}
                            onChange={() => setSelectedRouteId(opt.id)}
                            className="accent-[#d4af37] mt-1"
                          />
                          <div>
                            <div className="font-semibold text-white text-sm flex items-center gap-2">
                              {opt.label}
                              {opt.recommended && <span className="text-[10px] bg-[#d4af37] text-black px-1.5 py-0.5 rounded font-bold">RECOMMENDED</span>}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">{opt.description}</div>
                            <div className="text-xs text-[#f5d77f] mt-1">
                              Est. toll: ₱{opt.segments.reduce((s, seg) => s + seg.val, 0).toLocaleString()}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Route Preference & Corporate Billing Options */}
              <div className="p-4 rounded-xl bg-[#161822] border border-[#242736] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider block mb-1.5">
                    Route Expressway Preference
                  </span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-200 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="routePref"
                        checked={routePref === 'fastest'}
                        onChange={() => setRoutePref('fastest')}
                        className="accent-[#d4af37] w-4 h-4"
                      />
                      <span>Fastest (Skyway &amp; Expressways)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-200 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="routePref"
                        checked={routePref === 'budget'}
                        onChange={() => setRoutePref('budget')}
                        className="accent-[#d4af37] w-4 h-4"
                      />
                      <span>Budget (National Highway / Toll-Free)</span>
                    </label>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer bg-[#1f2230] px-3.5 py-2.5 rounded-xl border border-[#2b2e3e]">
                  <input
                    type="checkbox"
                    checked={isCorporate}
                    onChange={(e) => setIsCorporate(e.target.checked)}
                    className="accent-[#d4af37] rounded w-4 h-4"
                  />
                  <div className="text-xs sm:text-sm">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-[#d4af37]" /> Corporate Account
                    </span>
                    <span className="text-xs text-slate-300">Corporate invoicing & priority staging</span>
                  </div>
                </label>
              </div>

              {/* Google Maps Grounded Live Route Advisor & Place Verification */}
              <GoogleMapsRouteAdvisor pickup={pickup} dropoff={dropoff} />

              {/* Step 1 Actions */}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                    Home Base (optional override)
                  </label>
                  <select
                    value={preferredBaseId}
                    onChange={(e) => setPreferredBaseId(e.target.value)}
                    className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                  >
                    <option value="">Nearest base (automatic)</option>
                    {HOME_BASES.map((b) => (
                      <option key={b.id} value={b.id}>{b.shortName}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">Leave on automatic unless GoCav assigns a specific base.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                    Actual travel time (optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={manualMinutes || ''}
                    onChange={(e) => setManualMinutes(Number(e.target.value) || 0)}
                    placeholder="Minutes (leave blank to estimate)"
                    className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Enter Google Maps time for a more accurate per-minute fare.</p>
                </div>
              </div>
<div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => navigateToStep(2)}
                  className="px-7 py-3 rounded-xl font-bold text-sm sm:text-base text-black bg-gradient-to-r from-[#f5d77f] to-[#d4af37] hover:brightness-110 flex items-center gap-2 transition active:scale-95 shadow-md shadow-[#d4af37]/25"
                >
                  <span>Next: Schedule &amp; Pax</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SCHEDULE & PASSENGERS */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200 mb-1.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#d4af37]" />
                    <span>Pickup Date</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-4 py-3.5 text-base sm:text-lg text-white font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#d4af37]" />
                      <span>Pickup Time</span>
                    </span>
                    <span className="text-xs text-amber-300 font-semibold">(22:00–06:00 night fee)</span>
                  </label>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-4 py-3.5 text-base sm:text-lg text-white font-semibold focus:outline-none"
                  />
                    {(parseInt(pickupTime.split(':')[0], 10) >= 22 || parseInt(pickupTime.split(':')[0], 10) < 6) && (
                      <p className="text-xs text-amber-300 mt-1.5 font-medium">
                        Night surcharge applies (22:00–06:00, +15%).
                      </p>
                    )}
                </div>
              </div>

              {/* Conditional Return Time or Days */}
              {(isSameDay || isSplit || isMulti) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#161822] border border-[#242736]">
                  <div>
                    <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                      Return Date
                    </label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full bg-[#181a24] border border-[#2e3244] rounded-xl px-4 py-3 text-base text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                      Return Time
                    </label>
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="w-full bg-[#181a24] border border-[#2e3244] rounded-xl px-4 py-3 text-base text-white font-semibold"
                    />
                  </div>
                </div>
              )}

              {isSameDay && (
                <div className="p-4 rounded-xl bg-[#161822] border border-[#242736]">
                  <label className="block text-sm sm:text-base font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                    <span>Estimated Standby Hours at Destination:</span>
                    <span className="text-[#f5d77f] font-mono font-bold text-base">{sameDayWaitHrs} hours (2 hrs free)</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={sameDayWaitHrs}
                    onChange={(e) => setSameDayWaitHrs(parseFloat(e.target.value))}
                    className="w-full accent-[#d4af37]"
                  />
                  <div className="flex justify-between text-xs text-slate-300 font-medium mt-1.5">
                    <span>1 hr (Quick drop &amp; wait)</span>
                    <span className="text-[#f5d77f] font-bold">2 hrs (Free included)</span>
                    <span>5 hrs</span>
                    <span>10 hrs</span>
                  </div>
                </div>
              )}

              {isDayMulti && (
                <div className="p-4 rounded-xl bg-[#161822] border border-[#242736]">
                  <label className="block text-sm sm:text-base font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                    <span>Number of Consecutive Days:</span>
                    <span className="text-[#f5d77f] font-bold text-lg">{days} Days</span>
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="7"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value, 10))}
                    className="w-full accent-[#d4af37]"
                  />
                  <span className="text-xs sm:text-sm text-slate-300 block mt-1.5 font-medium">
                    {isOOT
                      ? `Chauffeur stays with party for ${days} days (${days - 1} nights lodging allowance included)`
                      : `8 hours and 100 km per day included, client returned to pickup daily`}
                  </span>
                </div>
              )}

              {/* Passengers and Luggage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#d4af37]" />
                      <span>Passengers</span>
                    </span>
                    <span className="text-xs text-amber-300 font-bold">Sedan limit: max 4 persons</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handlePaxChange(num)}
                        className={`flex-1 py-3 px-1 rounded-xl text-base sm:text-lg font-bold transition flex flex-col items-center justify-center ${
                          pax === num
                            ? 'bg-[#d4af37] text-black shadow-md ring-2 ring-[#d4af37]/50'
                            : 'bg-[#181a24] text-slate-200 border border-[#2e3244] hover:border-[#d4af37]/40'
                        }`}
                      >
                        <span className="text-base sm:text-lg font-extrabold">{num}</span>
                        {num > 4 && (
                          <span className={`text-xs font-bold leading-none mt-0.5 ${pax === num ? 'text-black' : 'text-amber-400'}`}>
                            MPV/SUV
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#d4af37]" />
                      <span>Luggage Bags</span>
                    </span>
                    <span className="text-xs sm:text-sm text-amber-300 font-bold">Sedan trunk max: 2 bags</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[0, 1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleBagsChange(num)}
                        className={`flex-1 py-3 px-1 rounded-xl text-base sm:text-lg font-bold transition flex flex-col items-center justify-center ${
                          bags === num
                            ? 'bg-[#d4af37] text-black shadow-md ring-2 ring-[#d4af37]/50'
                            : 'bg-[#181a24] text-slate-200 border border-[#2e3244] hover:border-[#d4af37]/40'
                        }`}
                      >
                        <span className="text-base sm:text-lg font-extrabold">{num}</span>
                        {num > 2 && (
                          <span className={`text-xs font-bold leading-none mt-0.5 ${bags === num ? 'text-black' : 'text-amber-400'}`}>
                            MPV/SUV
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Capacity & Vehicle Recommendation Guidance */}
              {isSedanDisabled ? (
                <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-500/60 text-amber-100 text-sm sm:text-base flex items-start gap-3 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg">Sedan Option Disabled for this Trip</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-rose-500/30 text-rose-200 border border-rose-500/40 font-bold">
                        {pax > 4 && bags > 2
                          ? `${pax} Pax & ${bags} Bags (Exceeds Sedan limit)`
                          : pax > 4
                          ? `${pax} Passengers (Sedan Limit: 4 persons)`
                          : `${bags} Luggage Bags (Sedan Trunk Limit: 2 bags)`}
                      </span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-medium">
                      Sedans are strictly limited to <strong>4 persons</strong> and <strong>2 luggage bags</strong>. Because your trip requires space for <strong>{pax} passengers</strong> and <strong>{bags} luggage bags</strong>, the Sedan option has been disabled. In the next step, our <strong>6-Seater MPV (Toyota Avanza)</strong> or <strong>Executive SUV (Mitsubishi Montero Sport)</strong> is recommended.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-sm sm:text-base text-slate-200 flex items-center justify-between">
                  <span className="font-medium">Selected: {pax} Passenger{pax > 1 ? 's' : ''} · {bags} Bag{bags !== 1 ? 's' : ''}</span>
                  <span className="text-emerald-400 font-bold">✓ Fits standard Sedan limit (Max 4 Persons, 2 Bags)</span>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => navigateToStep(1)}
                  className="px-5 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white transition active:scale-95"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => navigateToStep(3)}
                  className="px-7 py-3 rounded-xl font-bold text-sm sm:text-base text-black bg-gradient-to-r from-[#f5d77f] to-[#d4af37] hover:brightness-110 flex items-center gap-2 transition active:scale-95 shadow-md shadow-[#d4af37]/25"
                >
                  <span>Next: Choose Vehicle</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: VEHICLE SELECTION & LIVE BREAKDOWN */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Notice if Sedan is disabled due to pax > 4 or baggage allowance */}
              {isSedanDisabled && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/60 via-[#181a24] to-[#181a24] border border-amber-500/50 text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block text-sm">
                      Sedan Choice Disabled — 6-Seater MPV or Executive SUV Recommended
                    </span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">
                      Sedans are strictly limited to a maximum of <strong>4 passengers</strong> and <strong>2 luggage bags</strong>. For your trip of <strong>{pax} passengers</strong> and <strong>{bags} luggage bags</strong>, the Sedan option has been disabled. Please select from our recommended <strong>6-Seater MPV (Toyota Avanza)</strong> or <strong>Executive SUV (Mitsubishi Montero Sport)</strong> below.
                    </p>
                  </div>
                </div>
              )}

              {/* Alert if user attempts to click disabled Sedan */}
              {sedanClickAlert && (
                <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-100 text-xs flex items-center justify-between gap-3 animate-in shake duration-300">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>
                      <strong>Sedan cannot be selected:</strong> Limited to max 4 passengers and 2 luggage bags. For your group of <strong>{pax} passengers</strong> and <strong>{bags} luggage bags</strong>, please choose our <strong>6-Seater MPV (Toyota Avanza)</strong> or <strong>Executive SUV (Mitsubishi Montero Sport)</strong>.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSedanClickAlert(false)}
                    className="text-rose-300 hover:text-white font-bold px-2 py-1 text-xs shrink-0"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Hint for vehicle selection */}
              <div className="p-3 rounded-xl bg-sky-950/50 border-2 border-sky-400 text-xs sm:text-sm text-sky-100 text-center font-bold animate-pulse shadow-[0_0_18px_rgba(56,189,248,0.9),0_0_6px_rgba(224,242,254,0.6)]">
                Double tap or hold to select a vehicle. It will jump to the fare breakdown.
              </div>

              {/* 3 Vehicle Tiers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['accent', 'avanza', 'montero'] as const).map((key) => {
                  const v = VEHICLES[key];
                  const isSelected = vehicleKey === key;
                  const isDisabled = key === 'accent' && isSedanDisabled;
                  const isRecommended =
                    (key === 'avanza' && (isSedanDisabled || (pax >= 4 && bags >= 3))) ||
                    (key === 'montero' && (pax >= 5 || bags >= 4));

                  return (
                    <div
                      key={key}
                      onDoubleClick={() => {
                        if (isDisabled) {
                          setSedanClickAlert(true);
                          setTimeout(() => setSedanClickAlert(false), 5000);
                          return;
                        }
                        setVehicleKey(key);
                        setTimeout(() => {
                          liveCalcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (isDisabled) {
                          setSedanClickAlert(true);
                          setTimeout(() => setSedanClickAlert(false), 5000);
                          return;
                        }
                        setVehicleKey(key);
                        setTimeout(() => {
                          liveCalcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                      onTouchStart={() => {
                        if (isDisabled) return;
                        const timer = setTimeout(() => {
                          setVehicleKey(key);
                          setTimeout(() => {
                            liveCalcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 100);
                        }, 500);
                        (window as any).__holdTimer = timer;
                      }}
                      onTouchEnd={() => {
                        clearTimeout((window as any).__holdTimer);
                      }}
                      onTouchMove={() => {
                        clearTimeout((window as any).__holdTimer);
                      }}
                      className={`relative rounded-2xl border p-4 sm:p-5 transition-all ${
                        isDisabled
                          ? 'opacity-40 grayscale-[35%] border-rose-500/30 bg-[#12131a] cursor-not-allowed'
                          : isSelected
                          ? 'border-[#d4af37] bg-gradient-to-b from-[#d4af37]/20 to-[#161822] shadow-xl shadow-[#d4af37]/25 scale-[1.02] cursor-pointer ring-2 ring-[#d4af37]/30'
                          : 'border-[#262938] bg-[#161822] hover:border-[#d4af37]/50 cursor-pointer'
                      }`}
                    >
                      {/* Status Badges */}
                      {isSelected && !isDisabled && (
                        <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-[#d4af37] text-black flex items-center justify-center text-sm font-bold shadow-md">
                          ✓
                        </div>
                      )}

                      {isDisabled && (
                        <div className="absolute top-3.5 right-3.5 text-xs font-bold text-rose-200 bg-rose-950/90 px-2.5 py-0.5 rounded-full border border-rose-500/50">
                          Sedan Disabled
                        </div>
                      )}

                      {isRecommended && !isSelected && !isDisabled && (
                        <span className={`absolute top-3.5 right-3.5 text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                          key === 'avanza' 
                            ? 'text-emerald-200 bg-emerald-950/90 border-emerald-500/50' 
                            : 'text-[#fdf4b8] bg-amber-950/90 border-amber-500/50'
                        }`}>
                          {key === 'avanza' ? '★ Recommended 6-Seater' : '★ Recommended SUV'}
                        </span>
                      )}

                      <img
                        src={v.imageUrl}
                        alt={v.name}
                        className="w-full h-28 object-cover rounded-xl mb-3.5 border border-white/10"
                      />

                      <div className="flex items-center justify-between">
                        <div className="text-base sm:text-lg font-bold text-white">{v.name}</div>
                        {key === 'accent' && (
                          <span className="text-xs text-amber-300 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">Limit: 4 Pax · 2 Bags</span>
                        )}
                        {key === 'avanza' && (
                          <span className="text-xs text-emerald-300 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">6-Seater MPV</span>
                        )}
                        {key === 'montero' && (
                          <span className="text-xs text-[#f5d77f] font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">Executive SUV 6-Seater</span>
                        )}
                      </div>

                      <div className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-1 font-medium">{v.models}</div>

                      <div className="mt-3 flex items-center gap-4 text-xs sm:text-sm font-semibold text-slate-200">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-[#d4af37]" /> {v.maxPax} max pax
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-[#d4af37]" /> {v.maxBags} bags max
                        </span>
                      </div>

                      {/* Special Capacity / Disabled Message */}
                      {isDisabled && (
                        <div className="mt-3 p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-xs text-rose-100 space-y-1">
                          <div className="font-bold flex items-center gap-1 text-rose-300">
                            <span>🚫 Exceeds Sedan Limit:</span>
                            <span>
                              {pax > 4 && bags > 2
                                ? `${pax} Pax & ${bags} Bags (Max 4 Pax, 2 Bags)`
                                : pax > 4
                                ? `${pax} Pax (Sedan Max 4 Persons)`
                                : `${bags} Bags (Sedan Trunk Max 2 Bags)`}
                            </span>
                          </div>
                          <p className="text-slate-200 leading-tight text-xs font-medium">
                            Please choose 6-Seater MPV (Toyota Avanza) or Executive SUV (Mitsubishi Montero Sport) recommended above.
                          </p>
                        </div>
                      )}

                      {!isDisabled && isRecommended && (
                        <div className="mt-3 p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs sm:text-sm font-semibold text-emerald-200">
                          ✓ Accommodates your {pax} guests and {bags} bags comfortably
                        </div>
                      )}

                      <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-sm sm:text-base">
                        <span className="text-slate-300 font-medium">Standard Rate:</span>
                        <span className="font-extrabold text-[#f5d77f] text-base sm:text-lg">₱{v.perKm}/km</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Driver Assignment: GoCav Coordinated Dispatch & Nearest Available Recommendation */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#141724] via-[#10121c] to-[#141724] border border-[#2d3248] shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
                    <span className="font-bold text-white text-sm sm:text-base">
                      Driver Assignment: Coordinated by GoCav Dispatch
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/35 w-fit">
                    <span>🔒 Central Dispatch Controlled</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  GoCav Central Dispatch coordinates driver allocation directly for every trip to ensure verified background clearance, route familiarity, and strict punctuality. <strong className="text-white">Clients do not choose individual drivers</strong>. The driver assigned will be sent to you after we confirm an available unit and driver.
                </p>

                {matchedDrivers.length > 0 ? (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                            Nearest Recommended Unit:
                          </span>
                          <span className="text-sm sm:text-base font-extrabold text-white">
                            {matchedDrivers[0].unit.driver}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 font-bold">
                            {matchedDrivers[0].unit.base} Base
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                          {matchedDrivers[0].unit.unit} · Plate {matchedDrivers[0].unit.plate}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="inline-block text-xs font-bold text-[#f5d77f] bg-black/50 px-2.5 py-1 rounded-lg border border-[#d4af37]/30">
                        ★ Nearest Driver (Recommendation Only)
                      </span>
                      <span className="block text-xs text-slate-400 mt-1">
                        Nearest recommendation only — final driver sent after confirmation
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-slate-300 gap-2">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-[#d4af37]" />
                      <span>General Trias Central Base Chauffeur Fleet</span>
                    </div>
                    <span className="text-emerald-400 font-semibold">
                      Nearest verified chauffeur allocated upon booking confirmation
                    </span>
                  </div>
                )}
              </div>

              {/* Itemized Fare Calculation Box */}
              <div className="rounded-2xl bg-[#0b0c10] border border-[#2b2e3e] p-5 sm:p-6 shadow-xl">
                <div ref={liveCalcRef} className="flex items-center justify-between pb-3.5 border-b border-[#242736]">
                  <span className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#d4af37]">
                    Live Itemized Calculation
                  </span>
                  <span className="text-xs sm:text-sm text-slate-300 font-medium">
                    Route: {pickup.split('(')[0].trim()} → {dropoff.split('(')[0].trim()}
                  </span>
                </div>

                {fareResult.lines.length === 0 ? (
                  <p className="text-sm text-slate-300 py-4 text-center">
                    Enter valid pickup &amp; drop-off locations to compute fare.
                  </p>
                ) : (
                  <div className="divide-y divide-white/5 py-2.5">
                    {fareResult.lines.map((l, i) => (
                      <div key={i} className="py-2.5 flex items-center justify-between text-sm sm:text-base">
                        <span className={l.disc ? 'text-emerald-400 font-bold' : 'text-slate-200 font-medium'}>
                          {l.label}
                        </span>
                        <span
                          className={`font-mono font-bold text-base ${
                            l.disc ? 'text-emerald-400' : l.zeroToll ? 'text-emerald-400' : 'text-white'
                          }`}
                        >
                          {l.val === 0 && l.zeroToll
                            ? '₱0 (Toll-Free)'
                            : `${l.val < 0 ? '-' : ''}₱${Math.abs(Math.round(l.val)).toLocaleString()}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total and Notes */}
                <div className="pt-4 mt-2 border-t border-[#242736] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-sm font-semibold text-slate-300 block mb-0.5">Estimated Total (Inclusive):</span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-[#fdf4b8] tracking-tight">
                      {fareResult.isCustomQuote ? (
                        <span className="text-amber-300">Quote on confirmation</span>
                      ) : (
                        `₱${fareResult.total.toLocaleString()}`
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowReceiptModal(true)}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#1e2130] text-[#f5d77f] border border-[#d4af37]/60 hover:bg-[#d4af37]/25 flex items-center gap-2 transition active:scale-95 shadow-sm"
                      title="View printable official receipt and simplified itinerary summary"
                    >
                      <Receipt className="w-4 h-4 text-[#d4af37]" />
                      <span>View Receipt</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveToMyRides}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#1e2130] text-[#f5d77f] border border-[#d4af37]/50 hover:bg-[#d4af37]/20 flex items-center gap-2 transition active:scale-95 shadow-sm"
                      title="Save this estimate to your device's My Rides section"
                    >
                      {savedToRides ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Bookmark className="w-4 h-4 text-[#d4af37]" />
                      )}
                      <span>{savedToRides ? 'Saved to My Rides!' : 'Save to My Rides'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#181a24] text-slate-100 border border-[#2e3244] hover:border-[#d4af37]/50 flex items-center gap-2 transition"
                    >
                      <FileDown className="w-4 h-4 text-[#d4af37]" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#181a24] text-slate-100 border border-[#2e3244] hover:border-[#d4af37]/50 flex items-center gap-2 transition"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#d4af37]" />}
                      <span>{copied ? 'Copied!' : 'Copy Quote'}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-3.5 text-xs sm:text-sm text-slate-300 bg-white/5 p-3 rounded-xl flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                  <span>{fareResult.notes}</span>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => navigateToStep(2)}
                  className="px-5 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white transition active:scale-95"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => navigateToStep(4)}
                  className="px-7 py-3 rounded-xl font-bold text-sm sm:text-base text-black bg-gradient-to-r from-[#f5d77f] to-[#d4af37] hover:brightness-110 flex items-center gap-2 transition active:scale-95 shadow-md shadow-[#d4af37]/25"
                >
                  <span>Next: Passenger Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & INSTANT DISPATCH */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Validation Alert Banner */}
              {validationError && (
                <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/70 text-rose-200 text-xs flex items-center gap-2.5 animate-pulse">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                  <span className="font-semibold">{validationError}</span>
                </div>
              )}

              {/* Client & Passenger Details Inputs with smart Enter-key navigation */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#161822] border border-[#2b2e3e] space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-5 h-5 text-[#d4af37]" />
                    <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#d4af37]">
                      Passenger Details &amp; BIR Compliance Information
                    </h3>
                  </div>
                  <span className="text-xs text-slate-300 hidden sm:inline font-medium">
                    Press <kbd className="px-2 py-0.5 rounded bg-white/15 text-white font-mono text-xs">Enter</kbd> to jump between fields
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* 1. Client / Passenger Name (Google Sheet: Client) */}
                  <div>
                    <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200 mb-1.5 flex items-center justify-between">
                      <span>Passenger Name (Client) *</span>
                      {!clientName.trim() && (
                        <span className="text-xs text-amber-300 font-bold">Required</span>
                      )}
                    </label>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          phoneInputRef.current?.focus();
                        }
                      }}
                      placeholder="e.g. Engr. Santos / Juan dela Cruz"
                      className={`w-full bg-[#181a24] border rounded-xl px-4 py-3.5 text-base sm:text-lg text-white font-semibold focus:outline-none transition ${
                        !clientName.trim() && validationError
                          ? 'border-rose-500 ring-2 ring-rose-500/50'
                          : 'border-[#2e3244] focus:border-[#d4af37]'
                      }`}
                      required
                    />
                  </div>

                  {/* 2. Mobile Phone Number */}
                  <div>
                    <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200 mb-1.5 flex items-center justify-between">
                      <span>Mobile Phone (+63) *</span>
                      {!clientPhone.trim() && (
                        <span className="text-xs text-amber-300 font-bold">Required</span>
                      )}
                    </label>
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => {
                        setClientPhone(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          emailInputRef.current?.focus();
                        }
                      }}
                      placeholder="e.g. 0976 046 5134"
                      className={`w-full bg-[#181a24] border rounded-xl px-4 py-3.5 text-base sm:text-lg text-white font-semibold focus:outline-none transition ${
                        !clientPhone.trim() && validationError
                          ? 'border-rose-500 ring-2 ring-rose-500/50'
                          : 'border-[#2e3244] focus:border-[#d4af37]'
                      }`}
                      required
                    />
                  </div>

                  {/* 3. Billing Email (Google Sheet: Billing email) */}
                  <div>
                    <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-[#d4af37]" />
                        <span>Billing Email</span>
                      </span>
                      <span className="text-xs text-emerald-300 font-semibold">e-Receipt</span>
                    </label>
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          tinInputRef.current?.focus();
                        }
                      }}
                      placeholder="e.g. Tuhamied@gmail.com"
                      className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-4 py-3.5 text-base sm:text-lg text-white font-semibold focus:outline-none transition"
                    />
                  </div>

                  {/* 4. Taxpayer Identification Number - TIN (Google Sheet: TIN for BIR compliance) */}
                  <div>
                    <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-[#d4af37]" />
                        <span>BIR TIN (Taxpayer ID)</span>
                      </span>
                      <span className="text-xs text-amber-300 font-mono font-bold">BIR Record</span>
                    </label>
                    <input
                      ref={tinInputRef}
                      type="text"
                      value={clientTin}
                      onChange={(e) => setClientTin(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          flightInputRef.current?.focus();
                        }
                      }}
                      placeholder="e.g. 940-158-988-0000"
                      className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-4 py-3.5 text-base sm:text-lg text-white font-mono font-semibold focus:outline-none transition"
                    />
                    <span className="text-xs text-slate-300 block mt-1 font-medium">
                      For official receipt registration &amp; Non-VAT booking compliance
                    </span>
                  </div>

                  {/* 5. Flight Number / Airline (Google Sheet: Flight) */}
                  <div>
                    <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Plane className="w-4 h-4 text-[#d4af37]" />
                        <span>Flight Number / Terminal</span>
                      </span>
                      <span className="text-xs text-slate-300">Airport Pickup</span>
                    </label>
                    <input
                      ref={flightInputRef}
                      type="text"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (isCorporate) {
                            companyInputRef.current?.focus();
                          } else {
                            notesInputRef.current?.focus();
                          }
                        }
                      }}
                      placeholder="e.g. PR 102 / NAIA Terminal 3"
                      className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-4 py-3.5 text-base sm:text-lg text-white font-semibold focus:outline-none transition"
                    />
                    <span className="text-xs text-slate-300 block mt-1 font-medium">
                      Chauffeur tracks live flight delay for curbside greeting
                    </span>
                  </div>

                  {/* 6. Corporate Account & Company Toggle (Google Sheet: Corporate & Company) */}
                  <div>
                    <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-[#d4af37]" />
                        <span>Account Type</span>
                      </span>
                      <span className={`text-xs font-bold ${isCorporate ? 'text-amber-400' : 'text-slate-300'}`}>
                        {isCorporate ? 'Corporate (Yes)' : 'Personal (No)'}
                      </span>
                    </label>
                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#181a24] border border-[#2e3244]">
                      <button
                        type="button"
                        onClick={() => setIsCorporate(false)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                          !isCorporate
                            ? 'bg-white/15 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Individual
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCorporate(true)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                          isCorporate
                            ? 'bg-[#d4af37] text-black shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Corporate
                      </button>
                    </div>
                    <span className="text-xs text-slate-300 block mt-1 font-medium">
                      Sets corporate billing status in Google Sheet record
                    </span>
                  </div>
                </div>

                {/* Company Name Field (if Corporate or explicitly entered) */}
                {isCorporate && (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="p-4 rounded-xl bg-[#11131c] border border-[#d4af37]/40 space-y-1.5">
                      <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-[#f5d77f] flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#d4af37]" />
                        <span>Company / Registered Business Name (for BIR Billing) *</span>
                      </label>
                      <input
                        ref={companyInputRef}
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            notesInputRef.current?.focus();
                          }
                        }}
                        placeholder="e.g. ACME Technologies Philippines Inc. / San Miguel Corp."
                        className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-4 py-3 text-base text-white font-semibold focus:outline-none transition"
                      />
                    </div>

                    {/* Corporate Discount Policy & LTFRB COL Requirement Notice */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#181a26] via-[#201d16] to-[#181a26] border border-[#d4af37]/40 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#f5d77f] font-bold">
                          <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                          <span>Corporate Discount Policy &amp; LTFRB COL Compliance</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-bold border border-[#d4af37]/30">
                          Signed COL Required
                        </span>
                      </div>
                      <p className="text-slate-200 leading-relaxed text-[11px]">
                        <strong>For corporate invoicing and priority staging:</strong> Corporate clients must provide a signed electronic or physical copy of the <strong>Certificate of Vehicle Lease Agreement (COL)</strong> pursuant to LTFRB Anti-Colorum regulations.
                      </p>

                      {/* Instant COL Download & Review Actions */}
                      <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-slate-300 text-[11px]">
                          Need an official copy for this booking or corporate accreditation?
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={handleDownloadColDirect}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#f5d77f] to-[#d4af37] text-black font-bold text-xs flex items-center gap-1.5 shadow hover:brightness-110 active:scale-95 transition"
                            title="Generate and download official COL agreement PDF"
                          >
                            <FileDown className="w-3.5 h-3.5 text-black" />
                            <span>Download COL Agreement (PDF)</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenColModal}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#f5d77f] font-semibold text-xs flex items-center gap-1.5 transition"
                            title="Preview lease agreement and signatories"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-[#f5d77f]" />
                            <span>Preview Lease (COL)</span>
                          </button>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-slate-400">
                        <span>
                          Registered Operator: <strong className="text-white">{CONTACT_INFO.ownerName}</strong> ({CONTACT_INFO.dtiNumber})
                        </span>
                        <span className="text-emerald-400 font-semibold">
                          ✓ Valid as Master COL for 1 year once signed
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chauffeur Notes */}
                <div>
                  <label className="block text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                    Chauffeur Notes &amp; Special Instructions
                  </label>
                  <textarea
                    ref={notesInputRef}
                    rows={2}
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Terminal arrival bay, child seats, luggage handling, specific landmarks or route preferences..."
                    className="w-full bg-[#181a24] border border-[#2e3244] focus:border-[#d4af37] rounded-xl px-4 py-3 text-base text-white focus:outline-none transition"
                  />
                </div>
              </div>

              {/* GOOGLE BASE & BIR COMPLIANCE RECORD CARD (Displays All 12 Columns Requested) */}
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-[#12141e] via-[#10121a] to-[#12141e] border border-[#d4af37]/45 text-xs space-y-3.5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-[#2b2e3e] gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white uppercase tracking-wider text-xs">
                          Google Sheet Base &amp; BIR Compliance Record
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/30">
                          12 Columns Live
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Synchronized with GoCav Google Spreadsheet database and BIR Non-VAT register
                      </span>
                    </div>
                  </div>

                  {/* Manual Sync Button */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => syncToGoogleBase('manual_sync')}
                      disabled={sheetSyncStatus === 'syncing'}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition active:scale-95 ${
                        sheetSyncStatus === 'synced'
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                          : 'bg-[#1e2130] text-[#f5d77f] border border-[#d4af37]/40 hover:bg-[#d4af37]/20'
                      }`}
                      title="Test write or sync record directly into Google Sheets base"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${sheetSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                      <span>
                        {sheetSyncStatus === 'syncing'
                          ? 'Syncing Base...'
                          : sheetSyncStatus === 'synced'
                          ? '✓ Synced to Google Base!'
                          : 'Sync to Google Base'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 12 Columns Visual Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {/* 1. Days */}
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">1. Days</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {isDayMulti ? days : 1}
                    </span>
                  </div>

                  {/* 2. Pax */}
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">2. Pax</span>
                    <span className="font-mono font-bold text-white text-sm">{pax}</span>
                  </div>

                  {/* 3. Bags */}
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">3. Bags</span>
                    <span className="font-mono font-bold text-white text-sm">{bags}</span>
                  </div>

                  {/* 4. Flight */}
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">4. Flight</span>
                    <span className="font-mono font-semibold text-[#f5d77f] truncate block" title={flightNumber || 'N/A'}>
                      {flightNumber.trim() ? flightNumber : 'N/A'}
                    </span>
                  </div>

                  {/* 5. Est. fare */}
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">5. Est. fare</span>
                    <span className="font-mono font-black text-[#f5d77f] text-sm">
                      ₱{fareResult.total.toLocaleString()}
                    </span>
                  </div>

                  {/* 6. GoCav 20% */}
                  <div className="p-2 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/25">
                    <span className="text-[10px] uppercase font-bold text-[#f5d77f] block">6. GoCav 20%</span>
                    <span className="font-mono font-bold text-white text-sm">
                      ₱{Math.round(fareResult.total * 0.20).toLocaleString()}
                    </span>
                  </div>

                  {/* 7. Partner 80% */}
                  <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/25">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">7. Partner 80%</span>
                    <span className="font-mono font-bold text-emerald-300 text-sm">
                      ₱{Math.round(fareResult.total * 0.80).toLocaleString()}
                    </span>
                  </div>

                  {/* 8. Corporate */}
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">8. Corporate</span>
                    <span className={`font-semibold block ${isCorporate ? 'text-amber-400 font-bold' : 'text-slate-300'}`}>
                      {isCorporate ? 'Yes' : 'No'}
                    </span>
                  </div>

                  {/* 9. Company */}
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">9. Company</span>
                    <span className="font-semibold text-white truncate block" title={companyName || (isCorporate ? 'Corporate Account' : 'Individual')}>
                      {companyName.trim() ? companyName : (isCorporate ? 'Corporate' : 'Individual')}
                    </span>
                  </div>

                  {/* 10. Billing email */}
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">10. Billing email</span>
                    <span className="font-mono text-[11px] text-[#f5d77f] truncate block" title={clientEmail}>
                      {clientEmail}
                    </span>
                  </div>

                  {/* 11. TIN */}
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">11. TIN (BIR)</span>
                    <span className="font-mono font-semibold text-emerald-400 truncate block" title={clientTin}>
                      {clientTin || '940-158-988-0000'}
                    </span>
                  </div>

                  {/* 12. Client */}
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">12. Client</span>
                    <span className="font-bold text-white truncate block" title={clientName || 'Valued Guest'}>
                      {clientName.trim() ? clientName : 'Valued Guest'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between pt-1 text-[11px] text-slate-400 gap-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>BIR Non-VAT Registration 940-158-988-0000 active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleOpenReceiptModal}
                      className="text-[#f5d77f] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Preview Official e-Receipt</span>
                    </button>
                    {isCorporate && (
                      <button
                        type="button"
                        onClick={handleOpenColModal}
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                        title="Review LTFRB Certificate of Lease Agreement"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Preview Lease (COL)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Booking Information Verification (Guarantees no missing information) */}
              <div className="p-5 rounded-2xl bg-[#0e1017] border border-[#d4af37]/45 text-sm sm:text-base space-y-3.5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-white/10 gap-2">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
                    <span className="font-bold text-white uppercase tracking-wider text-sm sm:text-base">
                      Live Booking Verification
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-slate-300 text-xs sm:text-sm font-semibold">All-Inclusive Total: </span>
                    <span className="font-extrabold text-[#fdf4b8] text-lg sm:text-2xl">
                      ₱{fareResult.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-200">
                  {/* Passenger Check */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-300 text-xs font-bold block uppercase mb-0.5">Passenger</span>
                    <span className="font-bold text-white truncate block text-sm sm:text-base">
                      {clientName.trim() ? (
                        <span className="text-emerald-400 flex items-center gap-1.5">
                          <Check className="w-4 h-4" /> {clientName}
                        </span>
                      ) : (
                        <span className="text-amber-400">⚠️ Enter name above</span>
                      )}
                    </span>
                    <span className="text-xs text-slate-300 truncate block mt-1 font-medium">
                      {clientPhone.trim() ? clientPhone : '⚠️ Phone required'}
                    </span>
                  </div>

                  {/* Route Check */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-300 text-xs font-bold block uppercase mb-0.5">Itinerary</span>
                    <span className="font-bold text-slate-100 truncate block text-sm sm:text-base">
                      {pickup.split('(')[0].trim()}
                    </span>
                    <span className="text-xs text-[#f5d77f] font-semibold truncate block mt-1">
                      → {dropoff ? dropoff.split('(')[0].trim() : 'As designated'}
                    </span>
                  </div>

                  {/* Schedule Check */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-300 text-xs font-bold block uppercase mb-0.5">Schedule</span>
                    <span className="font-bold text-white block text-sm sm:text-base">
                      {date} @ {pickupTime}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold block mt-1">
                      {pax} Pax · {bags} Bags
                    </span>
                  </div>

                  {/* Vehicle Check */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-300 text-xs font-bold block uppercase mb-0.5">Vehicle &amp; Chauffeur</span>
                    <span className="font-bold text-white block truncate text-sm sm:text-base">
                      {selectedVehicle.name}
                    </span>
                    <span className="text-xs text-emerald-300 font-semibold block truncate mt-1">
                      GoCav Dispatched · Driver will be confirmed and sent after unit availability check
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Dispatch Action Buttons with Direct Email Dispatch */}
              <div className="space-y-3 pt-2">
                <span className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200 block text-center">
                  Select Dispatch Channel to Complete Reservation
                </span>

                {/* Corporate Account Lease Agreement Banner (Visible when corporate account is active) */}
                {isCorporate && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/70 via-[#161a24] to-[#161a24] border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Corporate Account: LTFRB Vehicle Lease Agreement (COL)
                        </span>
                        <span className="text-[11px] text-slate-300">
                          Pre-populated with Gocav Transport details &amp; your company info ready for signature.
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadColDirect}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md"
                        title="Download official Certificate of Lease Agreement (PDF)"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Download COL (PDF)</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenColModal}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#f5d77f] font-semibold text-xs flex items-center gap-1.5 transition"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Review COL</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {/* 1. Email Dispatch Button (Direct User Request) */}
                  <button
                    type="button"
                    onClick={() => handleDispatch('email')}
                    className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base text-black bg-gradient-to-r from-[#f5d77f] to-[#d4af37] hover:brightness-110 shadow-lg shadow-[#d4af37]/25 active:scale-95 transition"
                    title="Send booking request to GoCav Dispatch via Email"
                  >
                    <Mail className="w-4 h-4 text-black" />
                    <span>Email Dispatch</span>
                  </button>

                  {/* 2. WhatsApp Booking Button */}
                  <button
                    type="button"
                    onClick={() => handleDispatch('whatsapp')}
                    className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 active:scale-95 transition"
                  >
                    <MessageCircle className="w-4 h-4 fill-white/20" />
                    <span>WhatsApp</span>
                  </button>

                  {/* 3. Direct Phone Dispatch */}
                  <button
                    type="button"
                    onClick={() => handleDispatch('call')}
                    className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base text-slate-100 bg-[#1e2130] border border-slate-700 hover:border-[#d4af37]/50 active:scale-95 transition"
                  >
                    <Phone className="w-4 h-4 text-[#d4af37]" />
                    <span>Call Base</span>
                  </button>

                  {/* 4. Download PDF Receipt / Quotation */}
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base text-slate-100 bg-[#181a24] border border-[#2e3244] hover:border-[#d4af37]/50 active:scale-95 transition"
                  >
                    <FileDown className="w-4 h-4 text-[#d4af37]" />
                    <span>PDF Quote</span>
                  </button>

                  {/* 5. View Printable Receipt */}
                  <button
                    type="button"
                    onClick={() => setShowReceiptModal(true)}
                    className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base text-[#f5d77f] bg-[#1a1c28] border border-[#d4af37]/40 hover:bg-[#d4af37]/20 active:scale-95 transition"
                  >
                    <Receipt className="w-4 h-4 text-[#d4af37]" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>

              {/* Back to Step 3 */}
              <div className="flex justify-start pt-2">
                <button
                  type="button"
                  onClick={() => navigateToStep(3)}
                  className="px-6 py-3 rounded-xl text-sm sm:text-base font-bold text-slate-300 hover:text-white transition active:scale-95"
                >
                  ← Back to Rates &amp; Vehicle
                </button>
              </div>

              {/* Submission Status Confirmation Card */}
              {isSubmitted && (
                <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-emerald-950/80 via-[#12141c] to-[#12141c] border border-emerald-500/50 text-emerald-200 text-xs space-y-3 animate-in fade-in">
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold text-white text-sm block">
                        Booking Dispatched to GoCav Transport!
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        Reservation Ref <strong className="text-[#f5d77f] font-mono">{quoteRef || 'GC-ACTIVE'}</strong> has been registered. Our dispatch manager will coordinate vehicle staging 30 minutes before your departure.
                      </p>
                    </div>
                  </div>

                  {/* Receipt & Download Actions */}
                  <div className="pt-1 flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleOpenReceiptModal}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#f5d77f] to-[#d4af37] text-black font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition"
                    >
                      <Printer className="w-3.5 h-3.5 text-black" />
                      <span>View &amp; Print Official Receipt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        generateReceiptPdf({
                          quoteRef: quoteRef || generateReference(),
                          clientName,
                          clientPhone,
                          clientEmail,
                          serviceLabel,
                          pickup,
                          dropoff,
                          date,
                          pickupTime,
                          returnDate,
                          returnTime,
                          vehicle: selectedVehicle,
                          fare: fareResult,
                          notes: clientNotes,
                          isCorporate,
                          mode: 'receipt',
                        });
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <FileDown className="w-3.5 h-3.5 text-[#f5d77f]" />
                      <span>Download Receipt (PDF)</span>
                    </button>
                    {isCorporate && (
                      <button
                        type="button"
                        onClick={handleDownloadColDirect}
                        className="px-3.5 py-2 rounded-xl bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition"
                        title="Download Certificate of Vehicle Lease Agreement (COL) for Corporate file"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Download Corporate COL (PDF)</span>
                      </button>
                    )}
                    {isCorporate && (
                      <button
                        type="button"
                        onClick={handleOpenColModal}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#f5d77f] text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-[#f5d77f]" />
                        <span>View / Sign COL</span>
                      </button>
                    )}
                  </div>

                  {lastDispatchedVia === 'email' && (
                    <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2.5 mt-2">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="w-4 h-4 text-emerald-400" />
                        <span>Dispatched to <strong>{CONTACT_INFO.email}</strong> (CC: {clientEmail || 'Tuhamied@gmail.com'})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                            CONTACT_INFO.email
                          )}&cc=${encodeURIComponent(
                            [clientEmail, 'Tuhamied@gmail.com'].filter(Boolean).join(',')
                          )}&su=${encodeURIComponent(
                            `GoCav Chauffeur Reservation [${quoteRef}] — ${clientName || 'Guest'}`
                          )}&body=${encodeURIComponent(getBookingSummaryText(quoteRef))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 text-[11px] font-semibold flex items-center gap-1.5 transition"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open in Gmail</span>
                        </a>
                        <button
                          type="button"
                          onClick={handleCopySummary}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] transition"
                        >
                          Copy Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <PrintableReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        initialViewMode={receiptModalInitialTab}
        data={{
          ref: quoteRef || generateReference(),
          clientName: clientName.trim() || 'Valued Guest',
          clientPhone,
          clientEmail,
          tin: clientTin.trim() || '940-158-988-0000',
          flightNumber: flightNumber.trim() || undefined,
          serviceLabel,
          pickup,
          dropoff,
          date,
          pickupTime,
          returnDate: isSameDay || isSplit || isMulti ? returnDate : undefined,
          returnTime: isSameDay || isSplit || isMulti ? returnTime : undefined,
          days: isDayMulti ? days : 1,
          pax,
          bags,
          vehicle: selectedVehicle,
          fare: fareResult,
          notes: clientNotes,
          isCorporate,
          companyName: companyName.trim() || (isCorporate ? 'Corporate Account' : undefined),
          status: isSubmitted ? 'booked' : 'estimate',
          matchedDriver: matchedDrivers.length > 0 ? matchedDrivers[0].unit : null,
          dispatchChannel: lastDispatchedVia || undefined,
        }}
      />
    </section>
  );
};
