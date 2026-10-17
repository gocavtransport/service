import { VehicleTier, VEHICLES } from './gocavData';

export interface StoredRideRecord {
  id: string;
  createdAt: string;
  status: 'estimate' | 'booked';
  serviceLabel: string;
  serviceValue: string;
  pickup: string;
  dropoff: string;
  date: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  days?: number;
  vehicleKey: 'accent' | 'avanza' | 'montero';
  vehicleName: string;
  pax: number;
  bags: number;
  total: number;
  lines: Array<{ label: string; val: number; disc?: boolean; zeroToll?: boolean }>;
  notes?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  isCorporate?: boolean;
  companyName?: string;
  tin?: string;
  flightNumber?: string;
  gocavShare?: number;
  partnerShare?: number;
  routePref?: 'fastest' | 'budget';
  dispatchChannel?: 'whatsapp' | 'email' | 'call' | 'pdf' | 'saved';
  rating?: number;
  ratingComment?: string;
  ratedAt?: string;
}

const STORAGE_KEY = 'gocav_my_rides_v1';

export function getStoredRides(): StoredRideRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to parse rides from localStorage:', e);
    return [];
  }
}

export function saveRideToStorage(
  ride: Omit<StoredRideRecord, 'id' | 'createdAt'> & { id?: string }
): StoredRideRecord {
  const current = getStoredRides();
  const id = ride.id || `GC-${Math.floor(100000 + Math.random() * 900000)}`;
  const record: StoredRideRecord = {
    ...ride,
    id,
    createdAt: new Date().toISOString(),
  };

  // Prepend new ride, prevent exact duplicate IDs
  const filtered = current.filter((r) => r.id !== id);
  const updated = [record, ...filtered].slice(0, 30); // Store up to 30 rides

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('gocav_rides_updated'));
  } catch (e) {
    console.warn('Failed to save ride to localStorage:', e);
  }

  return record;
}

export function updateRideRating(
  id: string,
  rating: number,
  comment?: string
): void {
  const current = getStoredRides();
  const updated = current.map((r) => {
    if (r.id === id) {
      return {
        ...r,
        rating,
        ratingComment: comment !== undefined ? comment : r.ratingComment,
        ratedAt: new Date().toISOString(),
      };
    }
    return r;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('gocav_rides_updated'));
  } catch (e) {
    console.warn('Failed to update ride rating in localStorage:', e);
  }
}

export function deleteStoredRide(id: string): void {
  const current = getStoredRides();
  const updated = current.filter((r) => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('gocav_rides_updated'));
  } catch (e) {
    console.warn('Failed to delete ride:', e);
  }
}

export function clearStoredRides(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('gocav_rides_updated'));
  } catch (e) {
    console.warn('Failed to clear rides:', e);
  }
}

export function seedSampleRide(): StoredRideRecord {
  const sample: StoredRideRecord = {
    id: `GC-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'booked',
    serviceLabel: 'One-Way Direct Transfer',
    serviceValue: 'ONEWAY|One-Way Transfer|TRANSFER_ONEWAY',
    pickup: 'General Trias, Cavite (Home Base)',
    dropoff: 'NAIA Airport (Terminals 1, 2, 3, 4)',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    pickupTime: '05:30',
    vehicleKey: 'accent',
    vehicleName: 'Sedan (Hyundai Accent / Mirage G4)',
    pax: 2,
    bags: 2,
    total: 1650,
    lines: [
      { label: 'Trip Distance', val: 300 },
      { label: 'Trip Distance (~34 km + return repositioning)', val: 952 },
      { label: 'Toll: CAVITEX (Parañaque + Kawit Plazas)', val: 127 },
      { label: 'Toll: NAIAX Elevated Direct Ramp', val: 45 },
      { label: 'Night Departure Surcharge (22:00–06:00, +15%)', val: 226 },
    ],
    notes: 'Departure flight PR 102. Chauffeur pickup at lobby with name board.',
    clientName: 'Juan Dela Cruz',
    clientPhone: '+63 976 046 5134',
    isCorporate: false,
    routePref: 'fastest',
    dispatchChannel: 'whatsapp',
    rating: 5,
    ratingComment: 'Spotless vehicle, polite chauffeur, smooth CAVITEX drive!',
    ratedAt: new Date(Date.now() - 86400000).toISOString(),
  };

  saveRideToStorage(sample);
  return sample;
}
