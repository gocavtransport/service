export interface VehicleTier {
  id: 'accent' | 'avanza' | 'montero';
  name: string;
  tier: string;
  models: string;
  maxPax: number;
  comfortPax: number;
  maxBags: number;
  comfortBags: number;
  base: number;
  perKm: number;
  perMinute: number;
  repositionKm: number;
  minFare: number;
  naiaFee: number;
  clarkFee: number;
  homeDiscount: number;
  dayExcessKm: number;
  dayExcessHr: number;
  imageUrl: string;
  description: string;
}

export const VEHICLES: Record<'accent' | 'avanza' | 'montero', VehicleTier> = {
  accent: {
    id: 'accent',
    name: 'Sedan',
    tier: 'Sedan (Max 4 Pax)',
    models: 'Hyundai Accent / Mitsubishi Mirage G4 / Toyota Vios',
    maxPax: 4,
    comfortPax: 3,
    maxBags: 2,
    comfortBags: 2,
    base: 75,
    perKm: 28,
    perMinute: 9,
    repositionKm: 23,
    minFare: 550,
    naiaFee: 75,
    clarkFee: 175,
    homeDiscount: 200,
    dayExcessKm: 20,
    dayExcessHr: 450,
    imageUrl: 'https://i.imgur.com/xbQhOQU.jpeg',
    description: 'Strict limit of 4 passengers and 2 luggage bags. For 5+ persons or 3+ bags, 6-Seater MPV or SUV is recommended.',
  },
  avanza: {
    id: 'avanza',
    name: '6-Seater MPV',
    tier: '6-Seater MPV',
    models: 'Toyota Avanza / Mitsubishi Xpander',
    maxPax: 6,
    comfortPax: 5,
    maxBags: 5,
    comfortBags: 4,
    base: 100,
    perKm: 34,
    perMinute: 11,
    repositionKm: 23,
    minFare: 700,
    naiaFee: 90,
    clarkFee: 200,
    homeDiscount: 250,
    dayExcessKm: 24,
    dayExcessHr: 500,
    imageUrl: 'https://i.imgur.com/8lpLbVA.jpeg',
    description: 'Recommended for 5 to 6 passengers or trips with up to 5 luggage bags. Flexible folding seats.',
  },
  montero: {
    id: 'montero',
    name: 'Executive SUV',
    tier: 'Executive SUV',
    models: 'Mitsubishi Montero Sport',
    maxPax: 6,
    comfortPax: 5,
    maxBags: 5,
    comfortBags: 4,
    base: 125,
    perKm: 40,
    perMinute: 13,
    repositionKm: 23,
    minFare: 850,
    naiaFee: 100,
    clarkFee: 225,
    homeDiscount: 300,
    dayExcessKm: 28,
    dayExcessHr: 550,
    imageUrl: 'https://i.imgur.com/XR0EhsT.jpeg',
    description: 'First-class luxury, commanding SUV road poise, and generous cargo capacity for up to 6 passengers and 5 luggage bags.',
  },
};

export const CONTACT_INFO = {
  businessName: 'Gocav Transport Services',
  ownerName: 'Tuhamie Angka Dimanang',
  dtiBusinessName: 'Gocav Transport Services',
  dtiNumber: 'DTI Business Name: Gocav Transport Services No. 2802580',
  dtiCertNo: '2802580',
  phone1: '+63 976 046 5134',
  phone2: '+63 955 435 5514',
  whatsappRaw: '639760465134',
  viberRaw: '639760465134',
  email: 'gocav.transport@gmail.com',
  address: 'Le Rica Homes, Begonia St B19 L68, Brgy. San Francisco, General Trias, Cavite',
  tin: 'Non-VAT Reg. 940-158-988-0000',
  yearsInService: '2019–2026',
  sheetUrl: 'https://script.google.com/macros/s/AKfycbzDKQQy0XcKvip6WQ22Fd6CsKoVYCp5lXyfFme3WkkAHjs_3j6uzOGbRbbQJvBgxFFdNQ/exec',
  sheetToken: 'gocav-2026',
  logoUrl: 'https://i.imgur.com/DWfEGWv.png',
};

export interface GeoLocation {
  k: string[];
  lat: number;
  lng: number;
  name: string;
  zone: 'airport' | 'zone1' | 'zone2' | 'zone3' | 'zone4' | 'zone5' | 'custom';
}

export interface HomeBase {
  id: string;
  lat: number;
  lng: number;
  name: string;
  shortName: string;
  keywords: string[];
}

export const HOME_BASES: HomeBase[] = [
  {
    id: 'gentri',
    lat: 14.3137,
    lng: 120.8814,
    name: 'Le Rica Homes, General Trias, Cavite',
    shortName: 'General Trias',
    keywords: ['general trias', 'gen trias', 'gentri', 'le rica'],
  },
  {
    id: 'bfresort',
    lat: 14.4475,
    lng: 120.9820,
    name: 'BF Resort Village, Las Piñas',
    shortName: 'BF Resort Las Piñas',
    keywords: ['bf resort', 'bf homes', 'las pinas', 'las piñas', 'almanza', 'pamplona'],
  },
];

// Backward-compatible default (used only if no geo available)
export const HOME = { lat: HOME_BASES[0].lat, lng: HOME_BASES[0].lng, name: HOME_BASES[0].name };
export const BASE_KEYWORDS = HOME_BASES.flatMap((b) => b.keywords);

/** Return the nearer home base to a geo point. */
export function getNearestBase(geo: { lat: number; lng: number }): { base: HomeBase; km: number } {
  let best = HOME_BASES[0];
  let bestKm = roadKm(HOME_BASES[0], geo);
  for (let i = 1; i < HOME_BASES.length; i++) {
    const km = roadKm(HOME_BASES[i], geo);
    if (km < bestKm) {
      best = HOME_BASES[i];
      bestKm = km;
    }
  }
  return { base: best, km: bestKm };
}
/** Use a forced base if provided, otherwise nearest. */
export function resolveBase(
  geo: { lat: number; lng: number },
  preferredId?: string
): { base: HomeBase; km: number } {
  if (preferredId) {
    const forced = HOME_BASES.find((b) => b.id === preferredId);
    if (forced) return { base: forced, km: roadKm(forced, geo) };
  }
  return getNearestBase(geo);
}


export const DAY_RATES: Record<string, { label: string; accent: number; avanza: number; montero: number }> = {
  zone1: { label: 'Home Cavite', accent: 4500, avanza: 5500, montero: 6000 },
  zone2: { label: 'Extended Cavite', accent: 4800, avanza: 5900, montero: 6500 },
  zone3: { label: 'Core NCR', accent: 5200, avanza: 6300, montero: 7000 },
  zone4: { label: 'Greater NCR', accent: 5500, avanza: 6700, montero: 7400 },
  zone5: { label: 'Laguna Border', accent: 5200, avanza: 6300, montero: 7000 },
  airport: { label: 'Airport Site Runs', accent: 5800, avanza: 7000, montero: 7800 },
};


export const GEO_HUBS: GeoLocation[] = [
  { k: ['naia', 'airport', 'terminal 1', 'terminal 2', 'terminal 3', 'terminal 4', 'miaa'], lat: 14.5080, lng: 121.0194, name: 'NAIA Airport (Terminals 1, 2, 3, 4)', zone: 'airport' },
  { k: ['clark', 'dmia', 'clark airport'], lat: 15.1850, lng: 120.5610, name: 'Clark International Airport (CRK)', zone: 'airport' },
  { k: ['canlubang', 'carmelray', 'carmelray 1', 'carmelray 2'], lat: 14.2185, lng: 121.1070, name: 'Carmelray / Canlubang Industrial Park', zone: 'zone5' },
  { k: ['laguna technopark', 'technopark', 'ltp', 'nuvali', 'ayala technopark'], lat: 14.2750, lng: 121.0500, name: 'Laguna Technopark / Nuvali (Sta. Rosa/Biñan)', zone: 'zone5' },
  { k: ['fpip', 'first philippine industrial park', 'sto tomas industrial', 'tanauan park'], lat: 14.0890, lng: 121.1440, name: 'FPIP (First Philippine Industrial Park, Batangas)', zone: 'zone5' },
  { k: ['lisp', 'lisp 1', 'lisp 2', 'lisp 3', 'light industry and science park'], lat: 14.2400, lng: 121.1300, name: 'LISP (Light Industry & Science Park, Cabuyao/Calamba)', zone: 'zone5' },
  { k: ['ceza', 'cepz', 'cavite economic zone', 'rosario epza', 'peza rosario'], lat: 14.4170, lng: 120.8660, name: 'Cavite Economic Zone (CEPZ Rosario)', zone: 'zone1' },
  { k: ['gateway business park', 'gateway gentri', 'crispina'], lat: 14.2660, lng: 120.9160, name: 'Gateway Business Park (General Trias)', zone: 'zone1' },
  { k: ['fcie', 'first cavite industrial estate', 'langkaan'], lat: 14.3000, lng: 120.9500, name: 'FCIE (First Cavite Industrial Estate, Dasma)', zone: 'zone1' },
  { k: ['general trias', 'gen trias', 'gentri', 'le rica'], lat: 14.3137, lng: 120.8814, name: 'General Trias, Cavite (Home Base)', zone: 'zone1' },
  { k: ['manggahan', "governor's drive gentri"], lat: 14.2980, lng: 120.9050, name: 'General Trias (Manggahan / Gov Drive)', zone: 'zone1' },
  { k: ['imus north', 'imus cavitex', 'buhay na tubig', 'palico', 'tanzang luma'], lat: 14.4450, lng: 120.9380, name: 'Imus (North / Palico / Buhay na Tubig)', zone: 'zone1' },
  { k: ['imus', 'imus south', 'anabu', 'anabu 1', 'anabu 2', 'malagasang'], lat: 14.4050, lng: 120.9360, name: 'Imus (South / Anabu / Malagasang)', zone: 'zone1' },
  { k: ['bacoor north', 'talaba', 'longos', 'panapaan', 'bacoor cavitex'], lat: 14.4650, lng: 120.9500, name: 'Bacoor (North / Talaba / Longos)', zone: 'zone1' },
  { k: ['bacoor', 'molino', 'daang hari bacoor', 'springville', 'meadowood'], lat: 14.4150, lng: 120.9780, name: 'Bacoor (South / Molino / Daang Hari)', zone: 'zone1' },
  { k: ['dasmarinas north', 'dasmariñas north', 'salitran', 'golden city'], lat: 14.3480, lng: 120.9400, name: 'Dasmariñas (North / Salitran)', zone: 'zone1' },
  { k: ['dasmarinas', 'dasmariñas', 'pala-pala', 'palapala', 'sm dasma', 'robinsons dasma', 'town and country', 'town & country', 'town country'], lat: 14.3050, lng: 120.9580, name: 'Dasmariñas (Central / Pala-Pala)', zone: 'zone1' },
  { k: ['kawit', 'noveleta', 'rosario'], lat: 14.4333, lng: 120.9000, name: 'Kawit / Noveleta / Rosario, Cavite', zone: 'zone1' },
  { k: ['tanza'], lat: 14.3964, lng: 120.8536, name: 'Tanza, Cavite', zone: 'zone1' },
  { k: ['silang'], lat: 14.2250, lng: 120.9764, name: 'Silang, Cavite', zone: 'zone2' },
  { k: ['tagaytay'], lat: 14.1167, lng: 120.9833, name: 'Tagaytay City', zone: 'zone2' },
  { k: ['carmona'], lat: 14.3167, lng: 121.0500, name: 'Carmona, Cavite', zone: 'zone2' },
  { k: ['trece', 'trece martires'], lat: 14.2828, lng: 120.8647, name: 'Trece Martires, Cavite', zone: 'zone2' },
  { k: ['amadeo', 'indang', 'naic', 'ternate', 'alfonso', 'maragondon'], lat: 14.2000, lng: 120.8500, name: 'Western Cavite (Naic / Indang / Alfonso)', zone: 'zone2' },
  { k: ['makati', 'ayala', 'buendia', 'bel-air', 'legazpi', 'salcedo', 'poblacion', 'chino roces'], lat: 14.5547, lng: 121.0244, name: 'Makati Central Business District', zone: 'zone3' },
  { k: ['bgc', 'taguig', 'bonifacio', 'fort', 'market market', 'sm aura', 'mckinley'], lat: 14.5450, lng: 121.0500, name: 'Bonifacio Global City (BGC) / Taguig', zone: 'zone3' },
  { k: ['pasay', 'moa', 'mall of asia', 'roxas blvd', 'macapagal'], lat: 14.5378, lng: 121.0014, name: 'Pasay / Mall of Asia / Entertainment City', zone: 'zone3' },
  { k: ['paranaque', 'parañaque', 'bf homes', 'sucat', 'bicutan'], lat: 14.4793, lng: 121.0198, name: 'Parañaque / BF Homes', zone: 'zone3' },
  { k: ['las piñas', 'las pinas', 'alabang-zapote', 'zapote'], lat: 14.4445, lng: 120.9939, name: 'Las Piñas City', zone: 'zone3' },
  { k: ['alabang', 'muntinlupa', 'filinvest', 'ayala alabang', 'madrigal'], lat: 14.4197, lng: 121.0231, name: 'Alabang / Muntinlupa / Filinvest', zone: 'zone3' },
  { k: ['manila', 'intramuros', 'binondo', 'ermita', 'malate', 'port area', 'quiapo'], lat: 14.5995, lng: 120.9842, name: 'City of Manila / Port Area', zone: 'zone3' },
  { k: ['mandaluyong', 'ortigas', 'shaw', 'edsa central'], lat: 14.5794, lng: 121.0359, name: 'Mandaluyong / Ortigas Center', zone: 'zone3' },
  { k: ['pasig', 'kapitolyo', 'tiendesitas', 'rosario pasig'], lat: 14.5810, lng: 121.0640, name: 'Pasig City', zone: 'zone4' },
  { k: ['san juan', 'greenhills'], lat: 14.6000, lng: 121.0333, name: 'San Juan / Greenhills', zone: 'zone3' },
  { k: ['quezon city', 'qc', 'cubao', 'timog', 'katipunan', 'diliman', 'commonwealth'], lat: 14.6760, lng: 121.0437, name: 'Quezon City', zone: 'zone4' },
  { k: ['marikina', 'antipolo', 'cainta', 'taytay', 'rizal'], lat: 14.6507, lng: 121.1023, name: 'Marikina / Rizal Border', zone: 'zone4' },
  { k: ['caloocan', 'malabon', 'navotas', 'valenzuela', 'monumento'], lat: 14.6667, lng: 120.9833, name: 'CAMANAVA / Northern NCR', zone: 'zone4' },
  { k: ['santa rosa', 'sta rosa', 'sta. rosa', 'balibago'], lat: 14.3110, lng: 121.1160, name: 'Santa Rosa, Laguna', zone: 'zone5' },
  { k: ['biñan', 'binan', 'mamplasan'], lat: 14.3333, lng: 121.0833, name: 'Biñan, Laguna', zone: 'zone5' },
  { k: ['cabuyao'], lat: 14.2750, lng: 121.1219, name: 'Cabuyao, Laguna', zone: 'zone5' },
  { k: ['calamba', 'calamba crossing', 'pansol', 'bucal'], lat: 14.2089, lng: 121.1710, name: 'Calamba, Laguna', zone: 'zone5' },
  { k: ['san pedro'], lat: 14.3611, lng: 121.0578, name: 'San Pedro, Laguna', zone: 'zone5' },
  { k: ['los baños', 'los banos', 'uplb'], lat: 14.1794, lng: 121.2467, name: 'Los Baños, Laguna', zone: 'zone5' },
  { k: ['san pablo'], lat: 14.0700, lng: 121.3200, name: 'San Pablo, Laguna', zone: 'zone5' },
  { k: ['tanauan'], lat: 14.0833, lng: 121.1500, name: 'Tanauan, Batangas', zone: 'zone5' },
  { k: ['lipa', 'tambo lipa'], lat: 13.9418, lng: 121.1647, name: 'Lipa City, Batangas', zone: 'zone5' },
  { k: ['batangas city', 'batangas port', 'bauan'], lat: 13.7561, lng: 121.0583, name: 'Batangas City / Batangas Port', zone: 'custom' },
  { k: ['nasugbu', 'matabungkay', 'calatagan', 'lian'], lat: 14.0700, lng: 120.6300, name: 'Nasugbu / Calatagan / West Batangas Coast', zone: 'custom' },
  { k: ['lemery', 'taal'], lat: 13.8822, lng: 120.9119, name: 'Lemery / Taal Heritage Town, Batangas', zone: 'custom' },
  { k: ['baguio', 'camp john hay', 'session rd', 'benguet'], lat: 16.4023, lng: 120.5960, name: 'Baguio City, Benguet (Summer Capital)', zone: 'custom' },
  { k: ['subic', 'subic bay', 'sbfz', 'olongapo', 'zambales'], lat: 14.8291, lng: 120.2828, name: 'Subic Bay Freeport Zone / Zambales', zone: 'custom' },
  { k: ['angeles', 'pampanga', 'san fernando pampanga', 'clark freeport'], lat: 15.0307, lng: 120.6845, name: 'Angeles / San Fernando, Pampanga', zone: 'custom' },
  { k: ['tarlac', 'tarlac city', 'capas', 'luisita'], lat: 15.4802, lng: 120.5979, name: 'Tarlac City / New Clark City / Luisita', zone: 'custom' },
  { k: ['dagupan', 'pangasinan', 'urdaneta', 'rosales'], lat: 16.0433, lng: 120.3333, name: 'Dagupan / Pangasinan Corridor', zone: 'custom' },
  { k: ['la union', 'san fernando la union', 'san juan la union', 'elyu'], lat: 16.6150, lng: 120.3209, name: 'La Union (San Juan Surf / San Fernando)', zone: 'custom' },
  { k: ['bulacan', 'malolos', 'meycauayan', 'marilao', 'bocaue'], lat: 14.7943, lng: 120.9333, name: 'Bulacan Corridor (Malolos / Marilao)', zone: 'custom' },
  { k: ['bataan', 'mariveles', 'balanga'], lat: 14.6753, lng: 120.5367, name: 'Bataan Freeport / Mariveles / Balanga', zone: 'custom' },
  { k: ['cabanatuan', 'nueva ecija'], lat: 15.4865, lng: 120.9674, name: 'Cabanatuan, Nueva Ecija', zone: 'custom' },
  { k: ['lucena', 'quezon province', 'sariaya', 'candelaria', 'tiaong'], lat: 13.9374, lng: 121.6163, name: 'Lucena / Western Quezon Corridor', zone: 'custom' },
];

export interface TollLine {
  label: string;
  val: number;
  zeroToll?: boolean;
}

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function roadKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  return haversineKm(a, b) * 1.35;
}
/** Estimate actual travel minutes from road km (traffic-aware). */
export function estimateTravelMinutes(distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  // Urban / mixed Metro-Cavite ~28 km/h; longer expressway runs ~40 km/h
  const avgSpeed = distanceKm > 80 ? 40 : 28;
  return Math.round((distanceKm / avgSpeed) * 60);
}

// Per-minute rates are now vehicle-specific (see VehicleTier.perMinute)


export function findGeo(text: string): GeoLocation | null {
  const raw = (text || '').toLowerCase().trim();
  if (!raw) return null;
  for (let i = 0; i < GEO_HUBS.length; i++) {
    for (let j = 0; j < GEO_HUBS[i].k.length; j++) {
      const keyword = GEO_HUBS[i].k[j];
      const reg = new RegExp('\\b' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
      if (reg.test(raw)) return GEO_HUBS[i];
    }
  }
  for (let i = 0; i < GEO_HUBS.length; i++) {
    for (let j = 0; j < GEO_HUBS[i].k.length; j++) {
      if (raw.includes(GEO_HUBS[i].k[j])) return GEO_HUBS[i];
    }
  }
  return null;
}

export function isBaseZone(text: string): boolean {
  const t = (text || '').toLowerCase();
  for (let i = 0; i < BASE_KEYWORDS.length; i++) {
    if (t.includes(BASE_KEYWORDS[i])) return true;
  }
  return false;
}

export function isNaia(text: string): boolean {
  return /naia|airport|terminal|miaa/i.test(text || '') && !/clark/i.test(text || '');
}

export function isClark(text: string): boolean {
  return /clark/i.test(text || '');
}

export function isNight(timeStr: string): boolean {
  if (!timeStr) return false;
  const h = parseInt(timeStr.split(':')[0], 10);
  return isNaN(h) ? false : h >= 22 || h < 6;
}

export type NaiaTerminal = '1' | '2' | '3' | '4';

export interface TollRouteOption {
  id: string;
  label: string;
  description: string;
  recommended?: boolean;
  segments: Array<{ label: string; val: number }>;
}

/** 2026 TRB Class 1 rates (VAT-inclusive, Feb/July 2026 matrices) */
const TOLL_2026 = {
  cavitexKawit: 127,      // Parañaque/Roxas ↔ Kawit
  cavitexBacoor: 39,      // Parañaque ↔ Bacoor/Zapote
  naiaxT1: 45,            // Terminal 1
  naiaxT2: 45,            // Terminal 2
  naiaxT3: 35,            // Andrews Ave / Terminal 3
  naiaxT4: 45,            // Entertainment City / Tramo (T4 access)
  naiaxFromCavitexT1: 35, // CAVITEX → T1
  naiaxFromCavitexT2: 35,
  naiaxFromCavitexT3: 45,
  naiaxFromCavitexT4: 45,
  mcx: 46,                // MCX Daang Hari ↔ SLEX (approx)
  slexSkywayToNaiax: 164, // Skyway Stages 1/2 or SLEX to NAIAX area
  skywayStage3: 264,
  slexAlabangCalamba: 137, // post-July 2026
  slexMagallanesAlabang: 118,
  calax: 81,
  star: 121,              // STAR post-July 2026 end-to-end approx
};

function naiaxForTerminal(terminal: NaiaTerminal, viaCavitex = false): { label: string; val: number } {
  if (viaCavitex) {
    const map: Record<NaiaTerminal, number> = {
      '1': TOLL_2026.naiaxFromCavitexT1,
      '2': TOLL_2026.naiaxFromCavitexT2,
      '3': TOLL_2026.naiaxFromCavitexT3,
      '4': TOLL_2026.naiaxFromCavitexT4,
    };
    return { label: `Toll: NAIAX to Terminal ${terminal} (2026)`, val: map[terminal] };
  }
  const map: Record<NaiaTerminal, number> = {
    '1': TOLL_2026.naiaxT1,
    '2': TOLL_2026.naiaxT2,
    '3': TOLL_2026.naiaxT3,
    '4': TOLL_2026.naiaxT4,
  };
  return { label: `Toll: NAIAX to Terminal ${terminal} (2026)`, val: map[terminal] };
}

export function getSouthernRouteOptions(
  pickupTxt: string,
  dropoffTxt: string,
  terminal: NaiaTerminal = '3'
): TollRouteOption[] {
  const combo = `${pickupTxt || ''} ${dropoffTxt || ''}`.toLowerCase();
  const isNaiaTrip = isNaia(pickupTxt) || isNaia(dropoffTxt);
  if (!isNaiaTrip) return [];

  const isCaviteSouth = /molino|bacoor|imus|general trias|gentri|kawit|tanza|noveleta|rosario|daang hari|las piñas|las pinas|dasmarinas|dasmariñas|town and country|town & country|silang|tagaytay|carmona|gensan|gma|trece|tanza|naic|indang|amadeo|alfonso|magallanes|maragondon|cavite/i.test(combo);
  if (!isCaviteSouth) return [];

  const viaCavitex = naiaxForTerminal(terminal, true);
  const viaSkyway = naiaxForTerminal(terminal, false);

  return [
    {
      id: 'cavitex-naiax',
      label: 'CAVITEX + Coastal / Parañaque + NAIAX',
      description: 'Recommended fastest from Molino/Bacoor/Imus/Gen. Trias. Via CAVITEX (Kawit & Parañaque plazas) then NAIAX.',
      recommended: true,
      segments: [
        { label: 'Toll: CAVITEX (Parañaque + Kawit Plazas) 2026', val: TOLL_2026.cavitexKawit },
        viaCavitex,
      ],
    },
    {
      id: 'mcx-slex-skyway-naiax',
      label: 'MCX + SLEX / Skyway + NAIAX',
      description: 'Alternate via Daang Hari → MCX → SLEX or Skyway → NAIAX. Often used when CAVITEX is congested.',
      segments: [
        { label: 'Toll: MCX (Muntinlupa-Cavite Expressway) 2026', val: TOLL_2026.mcx },
        { label: 'Toll: SLEX / Skyway Stages 1/2 to NAIAX 2026', val: TOLL_2026.slexSkywayToNaiax },
        viaSkyway,
      ],
    },
    {
      id: 'cavitex-bacoor-naiax',
      label: 'CAVITEX Bacoor/Zapote + Coastal + NAIAX',
      description: 'Shorter CAVITEX segment if exiting near Bacoor/Zapote then coastal to NAIAX.',
      segments: [
        { label: 'Toll: CAVITEX (Parañaque ↔ Bacoor/Zapote) 2026', val: TOLL_2026.cavitexBacoor },
        viaCavitex,
      ],
    },
  ];
}

export function getTollBreakdown(
  pickupTxt: string,
  dropoffTxt: string,
  routePref: 'fastest' | 'budget' = 'fastest',
  selectedRouteId?: string,
  naiaTerminal: NaiaTerminal = '3'
): { total: number; lines: TollLine[] } {
  const p = (pickupTxt || '').toLowerCase();
  const d = (dropoffTxt || '').toLowerCase();
  const combo = `${p} ${d}`;
  const isToOrFromNaia = isNaia(p) || isNaia(d);
  const lines: TollLine[] = [];

  if (routePref === 'budget') {
    lines.push({ label: 'Toll: National Highway Bypass (Toll-Free)', val: 0, zeroToll: true });
    return { total: 0, lines };
  }

  // Southern route selection (client chooses; we suggest recommended)
  const southern = getSouthernRouteOptions(pickupTxt, dropoffTxt, naiaTerminal);
  if (southern.length > 0) {
    const chosen = southern.find((r) => r.id === selectedRouteId) || southern.find((r) => r.recommended) || southern[0];
    chosen.segments.forEach((seg) => {
      lines.push({ label: seg.label, val: seg.val });
    });
    const sum = lines.reduce((acc, cur) => acc + cur.val, 0);
    return { total: sum, lines };
  }

  // Fallback / other corridors — 2026 rates
  if (combo.includes('baguio') || combo.includes('la union') || combo.includes('pangasinan')) {
    if (routePref === 'fastest') lines.push({ label: 'Toll: Skyway Stage 3 (2026)', val: TOLL_2026.skywayStage3 });
    lines.push({ label: 'Toll: NLEX / SCTEX Mainline (2026)', val: 670 });
    lines.push({ label: 'Toll: TPLEX (Full length to Rosario) 2026', val: 311 });
  } else if (combo.includes('subic') || combo.includes('zambales') || combo.includes('bataan')) {
    if (routePref === 'fastest') lines.push({ label: 'Toll: Skyway Stage 3 (2026)', val: TOLL_2026.skywayStage3 });
    lines.push({ label: 'Toll: NLEX & SCTEX (Subic Connector) 2026', val: 607 });
  } else if (combo.includes('clark') || combo.includes('angeles') || combo.includes('pampanga') || combo.includes('tarlac')) {
    if (routePref === 'fastest') lines.push({ label: 'Toll: Skyway Stage 3 (2026)', val: TOLL_2026.skywayStage3 });
    lines.push({ label: 'Toll: NLEX / SCTEX Expressway (2026)', val: 670 });
  } else if (combo.includes('lucena') || combo.includes('quezon')) {
    lines.push({ label: 'Toll: SLEX & STAR Tollway to Quezon Corridor (2026)', val: 278 });
    if (routePref === 'fastest') lines.push({ label: 'Toll: Skyway Stages 1/2 (2026)', val: 164 });
  } else if (combo.includes('lipa') || combo.includes('tanauan') || combo.includes('batangas')) {
    lines.push({ label: 'Toll: STAR Tollway & SLEX (Alabang to Batangas) 2026', val: 295 });
    if (routePref === 'fastest') lines.push({ label: 'Toll: Skyway Stages 1/2 (2026)', val: 164 });
  } else if (combo.includes('calamba') || combo.includes('san pablo') || combo.includes('los baños')) {
    lines.push({ label: 'Toll: SLEX (Calamba ↔ Alabang) 2026', val: TOLL_2026.slexAlabangCalamba });
    if (routePref === 'fastest') lines.push({ label: 'Toll: Skyway Stages 1/2 (2026)', val: 164 });
  } else if (combo.includes('santa rosa') || combo.includes('sta rosa')) {
    lines.push({ label: 'Toll: SLEX (Sta. Rosa ↔ Alabang) 2026', val: 75 });
    if (routePref === 'fastest') lines.push({ label: 'Toll: Skyway Stages 1/2 (2026)', val: 164 });
  } else if (combo.includes('biñan') || combo.includes('binan') || combo.includes('carmona') || combo.includes('cabuyao')) {
    lines.push({ label: 'Toll: SLEX (Mamplasan/Carmona/Biñan ↔ Alabang) 2026', val: 59 });
    if (routePref === 'fastest') lines.push({ label: 'Toll: Skyway Stages 1/2 (2026)', val: 164 });
  } else if (combo.includes('daang hari') || combo.includes('mcx')) {
    lines.push({ label: 'Toll: MCX & SLEX Connector (2026)', val: TOLL_2026.mcx });
    if (routePref === 'fastest') lines.push({ label: 'Toll: Skyway Stages 1/2 (2026)', val: 164 });
  } else if (/general trias|gentri|imus|bacoor|kawit|tanza|noveleta|rosario|molino|dasmarinas|dasmariñas|town and country|silang|carmona|trece|naic/i.test(combo)) {
    lines.push({ label: 'Toll: CAVITEX (Parañaque + Kawit Plazas) 2026', val: TOLL_2026.cavitexKawit });
    if (isToOrFromNaia) {
      lines.push(naiaxForTerminal(naiaTerminal, true));
    }
  } else if (combo.includes('tagaytay') || combo.includes('silang')) {
    lines.push({ label: 'Toll: CALAX (Cavite-Laguna Expressway) 2026', val: TOLL_2026.calax });
    lines.push({ label: 'Toll: SLEX to Alabang (2026)', val: 59 });
    if (routePref === 'fastest') lines.push({ label: 'Toll: Skyway Stages 1/2 (2026)', val: 164 });
  } else {
    if (routePref === 'fastest') lines.push({ label: 'Toll: Skyway / Elevated Base (2026)', val: TOLL_2026.skywayStage3 });
    else lines.push({ label: 'Toll: Expressway Base (2026)', val: 86 });
  }

  if (isToOrFromNaia && !lines.some((l) => l.label.includes('NAIAX'))) {
    lines.push(naiaxForTerminal(naiaTerminal, false));
  }

  const sum = lines.reduce((acc, cur) => acc + cur.val, 0);
  return { total: sum, lines };
}

export interface FareCalculationResult {
  total: number;
  lines: Array<{ label: string; val: number; disc?: boolean; zeroToll?: boolean }>;
  notes: string;
  isCustomQuote: boolean;
  distanceKm?: number;
  tollTotal: number;
}

export function calculateFare(params: {
  serviceValue: string;
  pickup: string;
  dropoff: string;
  vehicleKey: 'accent' | 'avanza' | 'montero';
  pickupTime: string;
  returnTime?: string;
  days?: number;
  routePref?: 'fastest' | 'budget';
  selectedRouteId?: string;
  naiaTerminal?: NaiaTerminal;
  isCorporate?: boolean;
  excessDayKm?: number;
  excessDayHrs?: number;
  sameDayWaitHrs?: number;
  preferredBaseId?: string;
  manualMinutes?: number;
}): FareCalculationResult {
  const {
    serviceValue,
    pickup,
    dropoff,
    vehicleKey,
    pickupTime,
    returnTime = '',
    days = 1,
    routePref = 'fastest',
    isCorporate = false,
    excessDayKm = 0,
    excessDayHrs = 0,
    sameDayWaitHrs = 2,
    preferredBaseId,
    manualMinutes = 0,
    selectedRouteId,
    naiaTerminal = '3',
  } = params;

  const v = VEHICLES[vehicleKey];
  const parts = serviceValue.split('|');
  const svcType = parts[2] || '';

  const isDayRental = svcType === 'DAYRENTAL' || svcType === 'DAYRENTAL_MULTI' || svcType === 'DAYRENTAL_OOT';
  const isDayMulti = svcType === 'DAYRENTAL_MULTI' || svcType === 'DAYRENTAL_OOT';
  const isOOT = svcType === 'DAYRENTAL_OOT';
  const isSplit = svcType === 'TRANSFER_ROUND_SPLIT';
  const isMulti = svcType === 'TRANSFER_ROUND_MULTIDAY';
  const isSameDay = svcType === 'TRANSFER_ROUND_SAMEDAY';
  const isAirport = svcType === 'TRANSFER_AIRPORT';

  const pickupTxt = pickup.trim();
  const dropoffTxt = dropoff.trim();
  const lines: Array<{ label: string; val: number; disc?: boolean; zeroToll?: boolean }> = [];
  let total = 0;

  if (isDayRental) {
    if (!pickupTxt) {
      return { total: 0, lines: [], notes: 'Enter pickup location for day rental calculation.', isCustomQuote: false, tollTotal: 0 };
    }
    const numDays = isDayMulti ? Math.max(2, Math.min(7, days)) : 1;
    const pg = findGeo(pickupTxt);
    if (!pg || !pg.zone || pg.zone === 'custom') {
      return {
        total: 0,
        lines: [{ label: 'Custom Route Quotation', val: 0 }],
        notes: "We could not match this pickup to a standard zone. GoCav will confirm the exact fare after checking the address — no charge until confirmed.",
        isCustomQuote: true,
        tollTotal: 0,
      };
    }

    const zone = pg.zone;
    const zoneLabel = DAY_RATES[zone].label;
    const dayRate = DAY_RATES[zone][vehicleKey];
    const dayRateTotal = dayRate * numDays;

    lines.push({
      label: `Full-Day Rate (${zoneLabel} Zone)${numDays > 1 ? ` × ${numDays} days` : ''} — ${v.name} (8 hrs / 100 km/day)`,
      val: dayRateTotal,
    });
    total += dayRateTotal;

    if (!isBaseZone(pickupTxt)) {
      const nearest = resolveBase(pg, preferredBaseId);
      const posKm = nearest.km;
      const posFee = Math.round(posKm * v.repositionKm);
      lines.push({
        label: `Vehicle Positioning Fee (${nearest.base.shortName} → Pickup, ~${posKm.toFixed(0)} km @ ₱${v.repositionKm}/km)`,
        val: posFee,
      });
      total += posFee;
    }

    // Client discounts removed

    if (isOOT) {
      const nights = numDays - 1;
      if (nights > 0) {
        const allowancePerNight = 1200;
        const totalAllowance = allowancePerNight * nights;
        lines.push({
          label: `Chauffeur Overnight Lodging Allowance (${nights} nights @ ₱${allowancePerNight}/night)`,
          val: totalAllowance,
        });
        total += totalAllowance;
      }
    }

    if (dropoffTxt) {
      const dgDay = findGeo(dropoffTxt);
      if (dgDay) {
        const roundDistance = Math.round(roadKm(pg, dgDay) * 2);
        const included = 100 * numDays;
        if (roundDistance > included && excessDayKm === 0) {
          const autoEx = (roundDistance - included) * v.dayExcessKm;
          lines.push({
            label: `Estimated Route Excess Mileage (~${roundDistance} km total, ${roundDistance - included} km excess)`,
            val: autoEx,
          });
          total += autoEx;
        }
      }
    }

    if (excessDayKm > 100) {
      const exKmFee = (excessDayKm - 100) * v.dayExcessKm * numDays;
      lines.push({
        label: `Excess distance (${excessDayKm - 100} km/day × ₱${v.dayExcessKm}${numDays > 1 ? ` × ${numDays}d` : ''})`,
        val: exKmFee,
      });
      total += exKmFee;
    }

    if (excessDayHrs > 8) {
      const exHrFee = Math.ceil(excessDayHrs - 8) * v.dayExcessHr * numDays;
      lines.push({
        label: `Excess standby hours (${Math.ceil(excessDayHrs - 8)} hr/day × ₱${v.dayExcessHr}${numDays > 1 ? ` × ${numDays}d` : ''})`,
        val: exHrFee,
      });
      total += exHrFee;
    }

    const tollData = getTollBreakdown(pickupTxt, dropoffTxt || pickupTxt, routePref, selectedRouteId, naiaTerminal);
    const tollMult = isOOT ? 1 : numDays;
    let tollSum = 0;

    tollData.lines.forEach((seg) => {
      const segVal = seg.val * 2 * tollMult;
      tollSum += segVal;
      lines.push({
        label: `${seg.label}${isOOT ? ' (2-way trip)' : ` (2-way × ${numDays}d)`}`,
        val: segVal,
        zeroToll: seg.zeroToll,
      });
      total += segVal;
    });

    let noteText = '✓ Fuel, chauffeur & expressway tolls included · Parking at actual';
    if (isOOT) noteText += ` · Chauffeur stays with party · ${numDays} consecutive days`;
    else if (isDayMulti) noteText += ` · 8 hrs / 100 km daily · Returned to pickup point · ${numDays} days`;
    else noteText += ` · 8 hrs / 100 km included · Client returned to pickup point`;

    return {
      total: Math.max(0, Math.round(total)),
      lines,
      notes: noteText,
      isCustomQuote: false,
      tollTotal: tollSum,
    };
  }

  // Transfers
  if (!pickupTxt || !dropoffTxt) {
    return { total: 0, lines: [], notes: 'Enter both pickup and drop-off to compute live fare.', isCustomQuote: false, tollTotal: 0 };
  }

  const pg2 = findGeo(pickupTxt);
  const dg = findGeo(dropoffTxt);
  if (!pg2 || !dg) {
    return {
      total: 0,
      lines: [{ label: 'Custom Corridor Quotation', val: 0 }],
      notes: 'Address not fully recognized. Please pick a suggested location or wait for GoCav to confirm the exact fare and toll route.',
      isCustomQuote: true,
      tollTotal: 0,
    };
  }

  const oneLegKm = roadKm(pg2, dg);
  // Parking fee on NAIA pickup. For multi-day/split, also charge if the return leg picks up from NAIA.
  const isNaiaPickup = isNaia(pickupTxt);
  const isNaiaReturnPickup = (isSplit || isMulti) && isNaia(dropoffTxt);
  const naiaParkingFee = (isNaiaPickup || isNaiaReturnPickup) ? 56 : 0;
  // Positioning toll from nearer home base to NAIA
  // Applied when the client is picked up at NAIA (initial pickup OR multi-day return pickup)
  const positioningTollLines: Array<{label: string; val: number}> = [];
  if (isNaiaPickup || isNaiaReturnPickup) {
    const nearerForNaia = resolveBase({ lat: 14.5086, lng: 121.0198 }, preferredBaseId); // approx NAIA
    if (nearerForNaia.base.id === 'bfresort') {
      // Las Piñas is closer — shorter positioning via NAIAX / Coastal
      const naiax = naiaxForTerminal(naiaTerminal, false);
      positioningTollLines.push({ label: 'Positioning Toll: NAIAX (BF Resort Las Piñas → NAIA) 2026', val: naiax.val });
    } else {
      // General Trias — CAVITEX + NAIAX
      positioningTollLines.push({ label: 'Positioning Toll: CAVITEX (General Trias → NAIA) 2026', val: TOLL_2026.cavitexKawit });
      const naiax = naiaxForTerminal(naiaTerminal, true);
      positioningTollLines.push({ label: 'Positioning Toll: ' + naiax.label, val: naiax.val });
    }
  }


  const tollData = getTollBreakdown(pickupTxt, dropoffTxt, routePref, selectedRouteId, naiaTerminal);
  let tollTotal = 0;

  if (isSplit || isMulti) {
    const deadheadFactor = oneLegKm > 20 ? 1.4 : 1.0;
    const trip1Base = 0; // Airport premium removed
    const trip1Dist = Math.max(oneLegKm * v.perKm * deadheadFactor, v.minFare);
    const trip1Sub = Math.round(trip1Base + trip1Dist);
    const trip1Night = isNight(pickupTime);
    const trip1NightFee = trip1Night ? Math.round(trip1Sub * 0.15) : 0;

    lines.push({
      label: `Trip 1 Departure (Dedicated Chauffeur Dispatch ~${oneLegKm.toFixed(0)} km + empty-leg return)`,
      val: trip1Sub,
    });
    if (trip1Night) {
      lines.push({ label: 'Trip 1 Night Surcharge (22:00–06:00, +15%)', val: trip1NightFee });
    }

    const trip2Base = trip1Base;
    const trip2Dist = trip1Dist;
    const trip2Sub = trip2Base + trip2Dist;
    const trip2Night = isNight(returnTime);
    const trip2NightFee = trip2Night ? Math.round(trip2Sub * 0.15) : 0;

    lines.push({
      label: `Trip 2 Return Dispatch`,
      val: trip2Sub,
    });
    if (trip2Night) {
      lines.push({ label: 'Trip 2 Night Surcharge (22:00–06:00, +15%)', val: trip2NightFee });
    }

    total += trip1Sub + trip1NightFee + trip2Sub + trip2NightFee;

    if (naiaParkingFee > 0) {
      lines.push({
        label: `NAIA Parking Fee (Pickup only — 2026 short-term rate, first 2 hrs)`,
        val: naiaParkingFee,
      });
      total += naiaParkingFee;
    }
    positioningTollLines.forEach((seg) => {
      lines.push({ label: seg.label, val: seg.val });
      total += seg.val;
      tollTotal += seg.val;
    });

    const splitMinutes = manualMinutes > 0 ? manualMinutes : estimateTravelMinutes(oneLegKm * 2);
    if (splitMinutes > 0) {
      const timeFee = splitMinutes * v.perMinute;
      lines.push({
        label: `Estimated Travel Time (~${splitMinutes} min × ₱${v.perMinute}/min)`,
        val: timeFee,
      });
      total += timeFee;
    }

    if (!isBaseZone(pickupTxt)) {
      const nearest = resolveBase(pg2, preferredBaseId);
      const posKm = nearest.km;
      const posFeeEach = Math.round(posKm * v.repositionKm);
      const posFee = posFeeEach * 2;
      lines.push({
        label: `Vehicle Positioning Fee (${nearest.base.shortName}, 2 dispatches, ~${posKm.toFixed(0)} km each @ ₱${v.repositionKm}/km)`,
        val: posFee,
      });
      total += posFee;
    }

    tollData.lines.forEach((seg) => {
      const segVal = seg.val * 2;
      tollTotal += segVal;
      lines.push({
        label: `${seg.label} (2 dedicated dispatches)`,
        val: segVal,
        zeroToll: seg.zeroToll,
      });
      total += segVal;
    });

    return {
      total: Math.round(total),
      lines,
      notes: '✓ Two dedicated dispatches · No waiting time charges · Fuel & tolls included',
      isCustomQuote: false,
      distanceKm: Math.round(oneLegKm * 2),
      tollTotal,
    };
  }

  // Standard One-Way or Same-Day Round Trip
  const isRound = isSameDay;
  const isLongHaulRound = isRound && oneLegKm > 120;
  const isLongDistanceOneWay =
    !isRound &&
    (oneLegKm > 20 ||
      isClark(dropoffTxt) ||
      /baguio|subic|tarlac|angeles|lucena|batangas|laguna|tagaytay/i.test(dropoffTxt));

  let legs = 1;
  if (isRound) {
    legs = isLongHaulRound ? 1.7 : 2.0;
  } else if (isLongDistanceOneWay) {
    legs = 1.4;
  }

  // Base Dispatch fee removed

  const loadedPerLeg = Math.max(oneLegKm * v.perKm, v.minFare);
  const loaded = Math.round(loadedPerLeg * legs);

  let distLabel = `Trip Distance (~${oneLegKm.toFixed(0)} km × ₱${v.perKm}/km)`;
  if (isLongHaulRound) {
    distLabel = `Round-Trip Loaded (~${(oneLegKm * 2).toFixed(0)} km with long-haul standby adjustment)`;
  } else if (isRound) {
    distLabel = `Round-Trip Loaded (~${(oneLegKm * 2).toFixed(0)} km + 2 hrs standby included)`;
  } else if (isLongDistanceOneWay) {
    distLabel = `Trip Distance (~${oneLegKm.toFixed(0)} km one-way + return repositioning)`;
  }

  lines.push({ label: distLabel, val: loaded });
  total += loaded;

  if (naiaParkingFee > 0) {
    lines.push({
      label: `NAIA Parking Fee (Pickup only — 2026 short-term rate, first 2 hrs)`,
      val: naiaParkingFee,
    });
    total += naiaParkingFee;
  }
  positioningTollLines.forEach((seg) => {
    lines.push({ label: seg.label, val: seg.val });
    total += seg.val;
    tollTotal += seg.val;
  });


  // Per-minute rate based on estimated actual travel time
  const estMinutes = manualMinutes > 0 ? manualMinutes : estimateTravelMinutes(oneLegKm * (isRound ? 2 : 1));
  if (estMinutes > 0) {
    const timeFee = estMinutes * v.perMinute;
    lines.push({
      label: `Estimated Travel Time (~${estMinutes} min × ₱${v.perMinute}/min)`,
      val: timeFee,
    });
    total += timeFee;
  }

  if (isSameDay && sameDayWaitHrs > 2) {
    const excessWait = sameDayWaitHrs - 2;
    const waitFee = Math.round(excessWait * v.dayExcessHr);
    lines.push({
      label: `Standby Waiting Fee (${excessWait.toFixed(1)} excess hours @ ₱${v.dayExcessHr}/hr)`,
      val: waitFee,
    });
    total += waitFee;
  }

  if (!isBaseZone(pickupTxt)) {
    const nearest = resolveBase(pg2, preferredBaseId);
    const posKm = nearest.km;
    const posFee = Math.round(posKm * v.repositionKm);
    lines.push({
      label: `Vehicle Positioning Fee (${nearest.base.shortName} → Pickup, ~${posKm.toFixed(0)} km @ ₱${v.repositionKm}/km)`,
      val: posFee,
    });
    total += posFee;
  }

  // Client discounts removed

  tollData.lines.forEach((seg) => {
    const segVal = seg.val * (isRound ? 2 : 1);
    tollTotal += segVal;
    lines.push({
      label: `${seg.label}${isRound ? ' (Round-trip ×2)' : ''}`,
      val: segVal,
      zeroToll: seg.zeroToll,
    });
    total += segVal;
  });

  if (isNight(pickupTime) || (isRound && isNight(returnTime))) {
    const nightSurcharge = Math.round(total * 0.15);
    lines.push({
      label: 'Night Departure Surcharge (22:00–06:00, +15%)',
      val: nightSurcharge,
    });
    total += nightSurcharge;
  }

  let noteDesc = isRound
    ? `✓ Fuel, driver & tolls included · Includes up to 2 hours free standby`
    : `✓ Fuel, driver & tolls included · Flight tracking included`;

  return {
    total: Math.max(0, Math.round(total)),
    lines,
    notes: noteDesc,
    isCustomQuote: false,
    distanceKm: Math.round(oneLegKm * (isRound ? 2 : 1)),
    tollTotal,
  };
}

export interface PartnerUnit {
  id: string;
  driver: string;
  phone: string;
  plate: string;
  unit: string;
  cls: 'accent' | 'avanza' | 'montero';
  base: string;
  keys: string[];
}

export const PARTNER_UNITS: PartnerUnit[] = [
  {
    id: 'tom-accent',
    driver: 'Tom',
    phone: '63955-435-5514',
    plate: 'NGF 5260',
    unit: 'Hyundai Accent Sedan',
    cls: 'accent',
    base: 'General Trias',
    keys: ['general trias', 'pasay', 'gentri', 'le rica', 'imus', 'dasmari', 'kawit', 'bacoor', 'paranaque', 'parañaque', 'las pinas', 'las piñas', 'trece', 'alabang', 'muntinlupa'],
  },
  {
    id: 'tom-montero',
    driver: 'Tom',
    phone: '63955-435-5514',
    plate: 'WIX 453',
    unit: 'Mitsubishi Montero Sport',
    cls: 'montero',
    base: 'Las Piñas',
    keys: ['las pinas', 'las piñas', 'bacoor', 'molino', 'paranaque', 'parañaque', 'imus', 'dasmari', 'alabang', 'muntinlupa'],
  },
  {
    id: 'ramon-mirage',
    driver: 'Ramon',
    phone: '63927-417-6683',
    plate: 'NFN 1971',
    unit: 'Mitsubishi Mirage G4',
    cls: 'accent',
    base: 'Dasmariñas',
    keys: ['dasmari', 'gma', 'carmona', 'imus', 'general trias', 'gentri'],
  },
  {
    id: 'heman-avanza',
    driver: 'Heman',
    phone: '63956-187-9849',
    plate: 'DBS 3479',
    unit: 'Toyota Avanza MPV',
    cls: 'avanza',
    base: 'Las Piñas',
    keys: ['las pinas', 'pasay', 'las piñas', 'muntinlupa', 'imus', 'bacoor', 'paranaque', 'parañaque', 'alabang'],
  },
  {
    id: 'rommel-mirage',
    driver: 'Rommel',
    phone: '63977-791-2003',
    plate: 'NIL 7317',
    unit: 'Mitsubishi Mirage',
    cls: 'accent',
    base: 'Tanza',
    keys: ['tanza', 'pasay', 'kawit', 'trece', 'dasmari'],
  },
  {
    id: 'jessie-mirage',
    driver: 'Jessie',
    phone: '63999-486-7533',
    plate: 'NKH 7122',
    unit: 'Mitsubishi Mirage G4',
    cls: 'accent',
    base: 'Las Piñas',
    keys: ['las pinas', 'pasay', 'las piñas', 'paranaque', 'parañaque', 'muntinlupa', 'alabang'],
  },
  {
    id: 'carlo-vios',
    driver: 'Carlo',
    phone: '63977-749-1816',
    plate: 'NFE 9810',
    unit: 'Toyota Vios',
    cls: 'accent',
    base: 'Bacoor',
    keys: ['las pinas', 'bacoor', 'imus', 'muntinlupa', 'dasmari', 'alabang'],
  },
  {
    id: 'jose-expander',
    driver: 'Jose Michael',
    phone: '63995-580-8288',
    plate: 'DAS 3211',
    unit: 'Mitsubishi Xpander',
    cls: 'avanza',
    base: 'Muntinlupa',
    keys: ['muntinlupa', 'pasay', 'san pedro', 'las pinas', 'las piñas', 'alabang'],
  },
];

export interface PartnerCity {
  name: string;
  match: string[];
}

export const PARTNER_CITIES: PartnerCity[] = [
  { name: 'Pasay / NAIA', match: ['pasay', 'naia'] },
  { name: 'Parañaque', match: ['paranaque', 'parañaque'] },
  { name: 'Las Piñas', match: ['las pinas', 'las piñas'] },
  { name: 'Muntinlupa', match: ['muntinlupa'] },
  { name: 'Alabang', match: ['alabang'] },
  { name: 'General Trias', match: ['general trias', 'gentri'] },
  { name: 'Dasmariñas', match: ['dasmari'] },
  { name: 'Imus', match: ['imus'] },
  { name: 'Bacoor', match: ['bacoor'] },
  { name: 'Kawit', match: ['kawit'] },
  { name: 'Tanza', match: ['tanza'] },
  { name: 'Trece Martires', match: ['trece'] },
  { name: 'Carmona', match: ['carmona'] },
  { name: 'GMA', match: ['gma'] },
  { name: 'Santa Rosa', match: ['santa rosa'] },
  { name: 'Biñan', match: ['biñan', 'binan'] },
  { name: 'San Pedro', match: ['san pedro'] },
  { name: 'Cabuyao', match: ['cabuyao'] },
  { name: 'Calamba', match: ['calamba'] },
];

export const PARTNER_SLOTS = 2;

export function partnerCountForCity(city: PartnerCity): number {
  let count = 0;
  PARTNER_UNITS.forEach((unit) => {
    const hit = city.match.some((m) => (unit.keys || []).includes(m));
    if (hit) count++;
  });
  return count;
}

export function matchPartnerUnitsForPickup(pickupText: string): Array<{ unit: PartnerUnit; score: number }> {
  const p = (pickupText || '').toLowerCase().trim();
  if (p.length < 3) return [];
  const hits: Array<{ unit: PartnerUnit; score: number }> = [];

  PARTNER_UNITS.forEach((unit) => {
    let score = 0;
    unit.keys.forEach((key) => {
      if (p.includes(key)) score += 2;
    });
    if (unit.base.toLowerCase().includes(p) || p.includes(unit.base.toLowerCase())) {
      score += 4;
    }
    if (score > 0) hits.push({ unit, score });
  });

  hits.sort((a, b) => b.score - a.score);
  return hits;
}

export async function logBookingToGoogleSheet(data: Record<string, any>): Promise<{ success: boolean; payload?: Record<string, any>; error?: string }> {
  try {
    const totalFare = Number(data.total || data['Est. fare'] || data.estFare || data.fare || 0);
    const gocav20 = Number(data['GoCav 20%'] || data.gocavShare || Math.round(totalFare * 0.20));
    const partner80 = Number(data['Partner 80%'] || data.partnerShare || Math.round(totalFare * 0.80));
    const daysVal = Number(data.days ?? data['Days'] ?? 1);
    const paxVal = Number(data.pax ?? data['Pax'] ?? 1);
    const bagsVal = Number(data.bags ?? data['Bags'] ?? 0);
    const flightVal = String(data.flight || data['Flight'] || data.flightNumber || 'N/A').trim();
    const clientVal = String(data.client || data['Client'] || data.clientName || 'Valued Guest').trim();
    const emailVal = String(data['Billing email'] || data.billingEmail || data.email || data.clientEmail || 'Tuhamied@gmail.com').trim();
    const tinVal = String(data.tin || data['TIN'] || data.clientTin || '940-158-988-0000').trim();
    const isCorp = Boolean(data.isCorporate || data.corporate === 'Yes' || data['Corporate'] === 'Yes');
    const corporateVal = isCorp ? 'Yes' : 'No';
    const companyVal = String(data.company || data['Company'] || data.companyName || (isCorp ? 'Corporate Account' : 'Individual Client')).trim();

    const payload: Record<string, any> = {
      ...data,
      token: CONTACT_INFO.sheetToken,
      timestamp: new Date().toISOString(),

      // Exact 12 columns requested by user for Google Sheets & BIR compliance
      'Days': daysVal,
      'Pax': paxVal,
      'Bags': bagsVal,
      'Flight': flightVal,
      'Est. fare': totalFare,
      'GoCav 20%': gocav20,
      'Partner 80%': partner80,
      'Corporate': corporateVal,
      'Company': companyVal,
      'Billing email': emailVal,
      'TIN': tinVal,
      'Client': clientVal,

      // Flexible alias variants to support various Google Sheet header casings
      'Est Fare': totalFare,
      'GoCav 20': gocav20,
      'Partner 80': partner80,
      'Billing Email': emailVal,
      'Tin': tinVal,
      'Flight Number': flightVal,
      'Flight/Gate': flightVal,

      // Normalized lowerCamelCase aliases
      days: daysVal,
      pax: paxVal,
      bags: bagsVal,
      flight: flightVal,
      flightNumber: flightVal,
      total: totalFare,
      estFare: totalFare,
      gocavShare: gocav20,
      partnerShare: partner80,
      corporate: corporateVal,
      isCorporate: isCorp,
      company: companyVal,
      companyName: companyVal,
      billingEmail: emailVal,
      email: emailVal,
      clientEmail: emailVal,
      tin: tinVal,
      clientTin: tinVal,
      client: clientVal,
      clientName: clientVal,
    };

    // Append all parameters to URL query string as well, ensuring Google Apps Script
    // will populate the spreadsheet whether it reads e.parameter or JSON postData
    const urlObj = new URL(CONTACT_INFO.sheetUrl);
    Object.entries(payload).forEach(([k, v]) => {
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        urlObj.searchParams.set(k, String(v));
      }
    });

    await fetch(urlObj.toString(), {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return { success: true, payload };
  } catch (err: any) {
    console.warn('Google Sheets background sync notice:', err);
    return { success: false, error: err?.message || 'Sync warning' };
  }
}
