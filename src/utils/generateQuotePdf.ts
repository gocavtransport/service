import { jsPDF } from 'jspdf';
import { FareCalculationResult, VehicleTier, CONTACT_INFO } from '../data/gocavData';

export interface QuotePdfParams {
  quoteRef: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientTin?: string;
  flightNumber?: string;
  companyName?: string;
  days?: number;
  pax?: number;
  bags?: number;
  serviceLabel: string;
  pickup: string;
  dropoff: string;
  date: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  vehicle: VehicleTier;
  fare: FareCalculationResult;
  notes?: string;
  isCorporate?: boolean;
  mode?: 'quotation' | 'receipt';
  status?: string;
}

export function generateQuotePdf(params: QuotePdfParams): void {
  const isReceipt = params.mode === 'receipt';
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Background Bar
  doc.setFillColor(14, 15, 20);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Gold accent line
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 38, pageWidth, 2, 'F');

  // Brand Name
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('GOCAV TRANSPORT', 16, 18);

  // Subtitle
  doc.setTextColor(230, 230, 235);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Premium Chauffeur & Executive Transport Services', 16, 25);
  doc.setFontSize(8);
  doc.setTextColor(160, 163, 175);
  doc.text('Cavite · NCR · Laguna · Batangas · Northern & Southern Luzon', 16, 31);

  // Reference Box (Top Right)
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(isReceipt ? 'OFFICIAL E-RECEIPT' : 'OFFICIAL QUOTATION', pageWidth - 16, 17, { align: 'right' });

  doc.setTextColor(220, 220, 230);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`${isReceipt ? 'Receipt' : 'Quote'} Ref: ${params.quoteRef}`, pageWidth - 16, 23, { align: 'right' });
  doc.text(`Issued: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}`, pageWidth - 16, 29, { align: 'right' });

  y = 48;

  // Client & Itinerary Grid (height adjusted to accommodate BIR TIN and details)
  const boxHeight = params.flightNumber || params.companyName ? 56 : 50;
  doc.setFillColor(248, 249, 251);
  doc.setDrawColor(225, 228, 235);
  doc.roundedRect(14, y, pageWidth - 28, boxHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(isReceipt ? 'PASSENGER, BIR COMPLIANCE & BOOKING SPECIFICATIONS' : 'CLIENT & ITINERARY SPECIFICATIONS', 20, y + 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  const leftColX = 20;
  const rightColX = 110;

  // Left Column (Client Details & BIR Compliance)
  doc.text('Client / Passenger:', leftColX, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(params.clientName || 'Valued Guest', leftColX + 32, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Contact Mobile:', leftColX, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(params.clientPhone || 'Not provided', leftColX + 32, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Billing Email:', leftColX, y + 30);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(params.clientEmail || 'Tuhamied@gmail.com', leftColX + 32, y + 30);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('TIN (BIR Reg):', leftColX, y + 37);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(params.clientTin || '940-158-988-0000 (Non-VAT)', leftColX + 32, y + 37);

  if (params.companyName) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Company Entity:', leftColX, y + 44);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(params.companyName.slice(0, 32), leftColX + 32, y + 44);
  } else if (params.flightNumber) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Flight / Gate:', leftColX, y + 44);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text(params.flightNumber, leftColX + 32, y + 44);
  }

  // Right Column (Trip Logistics & Vehicle)
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Vehicle Assigned:', rightColX, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text(`${params.vehicle.name} (${params.vehicle.models})`, rightColX + 27, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Pickup Origin:', rightColX, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(params.pickup.slice(0, 36) || 'N/A', rightColX + 27, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Drop-off Dest.:', rightColX, y + 30);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(params.dropoff.slice(0, 36) || 'As designated', rightColX + 27, y + 30);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Schedule / Date:', rightColX, y + 37);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${params.date} at ${params.pickupTime || 'TBD'}`, rightColX + 27, y + 37);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Capacity / Bags:', rightColX, y + 44);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${params.pax ?? params.vehicle.maxPax} Pax · ${params.bags ?? params.vehicle.maxBags} Bags ${params.days && params.days > 1 ? `· ${params.days} Days` : ''}`, rightColX + 27, y + 44);

  y = y + boxHeight + 8;

  // Breakdown Table Header
  doc.setFillColor(235, 238, 245);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(isReceipt ? 'ITEMIZED RECEIPT BREAKDOWN' : 'ITEMIZED SERVICE / FARE BREAKDOWN', 18, y + 5.5);
  doc.text('AMOUNT (PHP)', pageWidth - 18, y + 5.5, { align: 'right' });

  y += 12;

  // Table Lines
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  params.fare.lines.forEach((line) => {
    doc.setTextColor(51, 65, 85);
    const label = line.label.length > 70 ? line.label.slice(0, 68) + '...' : line.label;
    doc.text(label, 18, y);

    const valFormatted =
      line.val === 0 && line.zeroToll
        ? 'PHP 0 (Free)'
        : (line.val < 0 ? '-PHP ' : 'PHP ') + Math.abs(Math.round(line.val)).toLocaleString();

    if (line.disc) {
      doc.setTextColor(22, 163, 74);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.setFont('helvetica', 'bold');
    doc.text(valFormatted, pageWidth - 18, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    // Dotted line separator
    doc.setDrawColor(230, 233, 240);
    doc.line(18, y + 2, pageWidth - 18, y + 2);

    y += 7.5;
  });

  // Total Box
  y += 4;
  doc.setFillColor(14, 15, 20);
  doc.roundedRect(pageWidth - 94, y, 80, 16, 2, 2, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(isReceipt ? 'TOTAL FARE DUE/PAID:' : 'ESTIMATED TOTAL:', pageWidth - 88, y + 10.5);
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(`PHP ${params.fare.total.toLocaleString()}`, pageWidth - 18, y + 11, { align: 'right' });

  y += 26;

  // Policy & Inclusions Note
  doc.setFillColor(254, 252, 232);
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(133, 77, 14);
  doc.text('INCLUSIONS & SERVICE GUARANTEE', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(113, 63, 18);
  const inclusions = [
    '• Chauffeur, clean air-conditioned unit, fuel and all designated expressway toll gates are included.',
    '• Airport runs include flight delay tracking and designated curbside terminal staging.',
    '• Parking fees at airports or commercial garages are billed at actual official receipt cost.',
    '• Standby time beyond stated limits is billed at standard excess hourly rate.',
    '• Driver assignment and vehicle plate details are dispatched via SMS / WhatsApp 24 hours prior.',
  ];

  inclusions.forEach((inc, i) => {
    doc.text(inc, 18, y + 11 + i * 4);
  });

  y += 36;

  // Footer / Contact Dispatch
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('GoCav Transport Dispatch Office', 16, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(CONTACT_INFO.address, 16, y + 4.5);
  doc.text(`Mobile / WhatsApp / Viber: ${CONTACT_INFO.phone1} · ${CONTACT_INFO.phone2}`, 16, y + 9);
  doc.text(`Email: ${CONTACT_INFO.email} · Reg: ${CONTACT_INFO.tin}`, 16, y + 13.5);

  // Save PDF
  const safeFilename = isReceipt
    ? `GoCav_Receipt_${params.quoteRef}.pdf`
    : `GoCav_Quotation_${params.quoteRef}.pdf`;
  doc.save(safeFilename);
}

export function generateReceiptPdf(params: QuotePdfParams): void {
  generateQuotePdf({ ...params, mode: 'receipt' });
}

export interface ColPdfParams {
  quoteRef: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientTin?: string;
  companyName?: string;
  serviceLabel: string;
  pickup: string;
  dropoff: string;
  date: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  vehicleName: string;
  vehicleModels?: string;
  matchedDriver?: {
    driver: string;
    unit: string;
    plate: string;
  } | null;
  totalFare?: number;
  isCorporate?: boolean;
}

export function generateColPdf(params: ColPdfParams): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ===================== PAGE 1 =====================
  let y = 14;

  // Header Banner
  doc.setFillColor(14, 15, 20);
  doc.rect(0, 0, pageWidth, 36, 'F');

  // Gold accent line
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 36, pageWidth, 2, 'F');

  // Top official jurisdiction
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('REPUBLIC OF THE PHILIPPINES · PROVINCE OF CAVITE', 14, 11);

  // Document Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('CERTIFICATE OF VEHICLE LEASE AGREEMENT (COL)', 14, 19);

  // Subtitle / Compliance
  doc.setTextColor(200, 203, 215);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Official Instrument pursuant to LTFRB JAO 2014-01, Memorandum Circulars & R.A. No. 4136', 14, 25);
  doc.setTextColor(160, 165, 180);
  doc.setFontSize(7.5);
  doc.text('Anti-Colorum Exemption & Private Civil Lease Certification for Rent-a-Car / Chauffeur Service', 14, 30);

  // Right-hand Control Box
  doc.setFillColor(28, 30, 42);
  doc.roundedRect(pageWidth - 72, 8, 58, 24, 2, 2, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DOC CONTROL / TRIP REF:', pageWidth - 70, 14);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.text(`COL-${params.quoteRef}`, pageWidth - 70, 20);
  doc.setFontSize(7);
  doc.setTextColor(180, 185, 200);
  doc.text(`Date: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}`, pageWidth - 70, 26);

  y = 44;

  // SECTION 1: LESSOR & LESSEE IDENTIFICATION
  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(220, 224, 235);
  doc.roundedRect(12, y, pageWidth - 24, 46, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ARTICLE I: CONTRACTING PARTIES (LESSOR & LESSEE)', 16, y + 6);

  // Left side: Lessor
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('LESSOR (CAR RENTAL OPERATOR):', 16, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('GOCAV TRANSPORT SERVICES', 16, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Registered Owner: ${CONTACT_INFO.ownerName}`, 16, y + 23);
  doc.text(`DTI Registration: Gocav Transport Services No. 2802580`, 16, y + 28);
  doc.text(`Tax ID: ${CONTACT_INFO.tin}`, 16, y + 33);
  doc.text(`Address: ${CONTACT_INFO.address}`, 16, y + 38);
  doc.text(`Hotline: ${CONTACT_INFO.phone1} · ${CONTACT_INFO.email}`, 16, y + 43);

  // Right side: Lessee
  const midX = 112;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('LESSEE (CLIENT / CORPORATE RENTER):', midX, y + 13);
  doc.setTextColor(15, 23, 42);
  doc.text(params.clientName || 'Valued Corporate / Private Client', midX, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Company: ${params.companyName || (params.isCorporate ? 'Corporate Account' : 'Private Charter')}`, midX, y + 23);
  doc.text(`Mobile / Contact: ${params.clientPhone || 'On File'}`, midX, y + 28);
  doc.text(`Billing Email: ${params.clientEmail || 'On File'}`, midX, y + 33);
  doc.text(`TIN / ID Ref: ${params.clientTin || 'Submitted Valid Gov ID on Record'}`, midX, y + 38);
  doc.text(`Account Type: ${params.isCorporate ? 'Corporate Account' : 'Standard Private Charter'}`, midX, y + 43);

  y += 50;

  // SECTION 2: SPECIAL CORPORATE CLIENT POLICY & DISCOUNT COVENANT (Highlighted Callout)
  doc.setFillColor(254, 252, 232);
  doc.setDrawColor(250, 204, 21);
  doc.roundedRect(12, y, pageWidth - 24, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(133, 77, 14);
  doc.text('ARTICLE II: CORPORATE ACCOUNT & E-SIGNATURE REQUIREMENT', 16, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.3);
  doc.setTextColor(113, 63, 18);
  const corpNotice = [
    '• CORPORATE ACCOUNT POLICY: For monthly billing, priority vehicle reservation,',
    '  and priority vehicle reservation, corporate clients MUST provide a signed electronic or physical copy of this Agreement.',
    '• MASTER AGREEMENT VALIDITY: Once signed by an authorized corporate representative, this Agreement serves as an active Master',
    '  Lease Instrument for all future booking schedules and trips requested during its term without requiring resubmission every trip.',
    '• SUBMISSION: Send signed electronic copies (PDF/Scan) to gocav.transport@gmail.com or via WhatsApp (+63 976 046 5134).'
  ];
  corpNotice.forEach((ln, idx) => {
    doc.text(ln, 16, y + 11 + idx * 3.6);
  });

  y += 30;

  // SECTION 3: LEASED VEHICLE & CHAUFFEUR PARTICULARS
  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(220, 224, 235);
  doc.roundedRect(12, y, pageWidth - 24, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ARTICLE III: LEASED MOTOR VEHICLE & AUTHORIZED CHAUFFEUR', 16, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(51, 65, 85);
  doc.text(`Vehicle Description: ${params.vehicleName} (${params.vehicleModels || 'GoCav Standard Tier'})`, 16, y + 12);
  doc.text(`Service Classification: ${params.serviceLabel} (Chauffeur-Driven Private Lease)`, 16, y + 17);
  doc.text(`Registration & Inspection: Complete with Valid LTO Official Receipt (OR) and Certificate of Registration (CR)`, 16, y + 22);

  const plateStr = params.matchedDriver?.plate ? `Assigned Unit: ${params.matchedDriver.unit} · Plate: ${params.matchedDriver.plate}` : 'Assigned Unit & Plate: Dispatched per Official Booking Manifest';
  doc.text(plateStr, 16, y + 27);

  const driverStr = params.matchedDriver?.driver ? `Chauffeur: ${params.matchedDriver.driver} (Valid LTO Professional Driver's License On-Board)` : 'Chauffeur: GoCav Licensed Professional Driver (Valid LTO Professional Driver\'s License On-Board)';
  doc.text(driverStr, 16, y + 32);

  y += 38;

  // SECTION 4: TRIP SCHEDULE, ITINERARY & TERRITORIAL SCOPE
  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(220, 224, 235);
  doc.roundedRect(12, y, pageWidth - 24, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ARTICLE IV: ITINERARY, SCHEDULE & FINANCIAL CONSIDERATION', 16, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(51, 65, 85);
  doc.text(`Designated Pickup: ${params.pickup}`, 16, y + 12);
  doc.text(`Designated Destination: ${params.dropoff || 'As instructed by Lessee within designated territorial scope'}`, 16, y + 17);
  doc.text(`Lease Commencement: ${params.date} at ${params.pickupTime}`, 16, y + 22);
  if (params.returnDate) {
    doc.text(`Lease Expiration / Return: ${params.returnDate} at ${params.returnTime || 'TBD'}`, 16, y + 27);
  } else {
    doc.text(`Lease Expiration: Upon completion of designated point-to-point drop-off charter`, 16, y + 27);
  }
  doc.text(`Total Agreed Lease Value: PHP ${(params.totalFare || 0).toLocaleString()} (All-Inclusive: Fuel, Chauffeur & Expressways)`, 16, y + 32);
  doc.text('Territorial Coverage: Cavite, Metro Manila, Calabarzon, and authorized Luzon routes.', 16, y + 36);

  // Bottom Notice of Page 1
  doc.setFontSize(7);
  doc.setTextColor(140, 145, 160);
  doc.text('Certificate of Vehicle Lease Agreement (COL) · Continued on Page 2 (Anti-Colorum Warranty & Signatures) · Page 1 of 2', pageWidth / 2, pageHeight - 8, { align: 'center' });

  // ===================== PAGE 2 =====================
  doc.addPage();
  y = 16;

  // Top Page 2 Header
  doc.setFillColor(14, 15, 20);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 22, pageWidth, 1.5, 'F');

  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('GOCAV TRANSPORT SERVICES · CERTIFICATE OF LEASE AGREEMENT (COL)', 14, 10);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`LEGAL STIPULATIONS & JURAT · REF: COL-${params.quoteRef}`, 14, 17);

  y = 30;

  // ARTICLE V: MANDATORY LTFRB ANTI-COLORUM & LAWFUL USE WARRANTY
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(12, y, pageWidth - 24, 76, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ARTICLE V: MANDATORY LTFRB ANTI-COLORUM & LAWFUL USE WARRANTY', 16, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);

  const warranties = [
    '1. PRIVATE CIVIL LEASE WARRANTY: The Lessor and Lessee explicitly warrant that this transaction constitutes a bona fide private civil',
    '   lease under Articles 1642 to 1688 of the Civil Code of the Philippines and relevant LTFRB guidelines. The vehicle is leased exclusively for',
    '   the personal, executive, corporate, or tourism transport of the Lessee and authorized companions.',
    '',
    '2. ABSOLUTE PROHIBITION ON COMMON CARRIER USE (ANTI-COLORUM COVENANT):',
    '   a. The Leased Vehicle shall NEVER operate as a Public Utility Vehicle (PUV), UV Express, FX, taxi, or street-hail common carrier.',
    '   b. The driver and Lessee are STRICTLY PROHIBITED from soliciting, loading, or collecting individual fares from the general public',
    '      along roadways, terminals, or highway staging points.',
    '   c. Any violation of this clause constitutes a criminal and civil offense under Republic Act No. 4136 and LTFRB JAO No. 2014-01.',
    '',
    '3. TRAFFIC & SAFETY COMPLIANCE: The vehicle shall be operated strictly in adherence with the Land Transportation and Traffic Code',
    '   (R.A. 4136), Speed Limit Laws, the Anti-Distracted Driving Act (R.A. 10913), and the Mandatory Seat Belts Act (R.A. 8750).',
    '',
    '4. ON-BOARD INSPECTION NOTICE (LTFRB / LTO / PNP-HPG / I-ACT / TRAFFIC OFFICERS):',
    '   This document serves as the official on-board Certificate of Lease (COL). Authorized law enforcement personnel can verify that',
    '   this vehicle is operating under a legitimate pre-arranged private lease contract with valid LTO OR/CR and professional driver credentials.'
  ];

  let wy = y + 11;
  warranties.forEach((line) => {
    if (line === '') {
      wy += 2.2;
    } else {
      doc.text(line, 16, wy);
      wy += 3.7;
    }
  });

  y += 82;

  // ARTICLE VI: SIGNATURES & EXECUTION
  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(220, 224, 235);
  doc.roundedRect(12, y, pageWidth - 24, 52, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ARTICLE VI: SIGNATURES OF LESSOR & LESSEE', 16, y + 6);

  // Signatures split
  const sigMid = 112;

  // Lessor Signature
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('LESSOR (OPERATOR):', 20, y + 14);
  doc.line(20, y + 32, 95, y + 32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TUHAMIE ANGKA DIMANANG', 20, y + 36);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('GoCav Transport Services · Registered Owner', 20, y + 40);
  doc.text(`DTI Business Name: Gocav Transport Services No. 2802580 · TIN 940-158-988`, 20, y + 44);

  // Lessee Signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('LESSEE / CORPORATE CLIENT:', sigMid, y + 14);
  doc.line(sigMid, y + 32, pageWidth - 20, y + 32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(params.clientName || 'AUTHORIZED CLIENT REPRESENTATIVE', sigMid, y + 36);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Signature over Printed Name · ${params.companyName || 'Corporate / Private Lessee'}`, sigMid, y + 40);
  doc.text('Date Signed: ________________________ (Electronic / Physical)', sigMid, y + 44);

  y += 58;

  // ARTICLE VII: NOTARIAL / JURAT BLOCK
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(12, y, pageWidth - 24, 40, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('ACKNOWLEDGMENT / JURAT', 16, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text('REPUBLIC OF THE PHILIPPINES )', 16, y + 10);
  doc.text('PROVINCE OF CAVITE                  ) S.S. · CITY OF GENERAL TRIAS', 16, y + 14);
  doc.text('BEFORE ME, a Notary Public for and in the Province of Cavite, personally appeared the parties above, known to me to be the same', 16, y + 19);
  doc.text('persons who executed this Vehicle Lease Agreement, and they acknowledged that the same is their free and voluntary act and deed.', 16, y + 23);

  doc.text('Doc. No.  : ________', 16, y + 28);
  doc.text('Page No.  : ________', 16, y + 32);
  doc.text('Book No.  : ________', 16, y + 36);

  doc.text('WITNESS MY HAND AND SEAL this _____ day of _______________, 20____.', sigMid, y + 28);
  doc.text('_________________________________________________', sigMid, y + 34);
  doc.text('NOTARY PUBLIC', sigMid + 35, y + 38);

  // Bottom Footer of Page 2
  doc.setFontSize(7);
  doc.setTextColor(140, 145, 160);
  doc.text(`GoCav Transport Services · Owner: ${CONTACT_INFO.ownerName} · ${CONTACT_INFO.dtiNumber} · Page 2 of 2`, pageWidth / 2, pageHeight - 6, { align: 'center' });

  // Save PDF
  doc.save(`GoCav_LTFRB_COL_Agreement_${params.quoteRef}.pdf`);
}
