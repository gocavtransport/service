import { CONTACT_INFO } from './gocavData';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  notifyVia: 'whatsapp' | 'sms' | 'both';
  isDefault?: boolean;
}

const EMERGENCY_STORAGE_KEY = 'gocav_emergency_contacts_v1';

export const SYSTEM_HOTLINES: EmergencyContact[] = [
  {
    id: 'gocav-dispatch',
    name: 'GoCav 24/7 Safety Dispatch',
    phone: CONTACT_INFO.phone1,
    relationship: 'Chauffeur Fleet Base',
    notifyVia: 'both',
    isDefault: true,
  },
  {
    id: 'ph-police-911',
    name: 'Philippine National Emergency',
    phone: '911',
    relationship: 'Police / Emergency Hotline',
    notifyVia: 'sms',
    isDefault: true,
  },
];

export function getStoredEmergencyContacts(): EmergencyContact[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EMERGENCY_STORAGE_KEY);
    if (!raw) {
      // Default initial contact suggestion
      const initial: EmergencyContact[] = [
        {
          id: 'contact-personal-1',
          name: 'Trusted Family / Contact',
          phone: '+63 917 000 0000',
          relationship: 'Spouse / Family',
          notifyVia: 'both',
        },
      ];
      localStorage.setItem(EMERGENCY_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Error reading emergency contacts:', err);
    return [];
  }
}

export function saveEmergencyContacts(contacts: EmergencyContact[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EMERGENCY_STORAGE_KEY, JSON.stringify(contacts));
    window.dispatchEvent(new Event('gocav_emergency_contacts_updated'));
  } catch (err) {
    console.warn('Error saving emergency contacts:', err);
  }
}

export function addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): EmergencyContact {
  const current = getStoredEmergencyContacts();
  const newContact: EmergencyContact = {
    ...contact,
    id: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
  };
  saveEmergencyContacts([...current, newContact]);
  return newContact;
}

export function updateEmergencyContact(id: string, updates: Partial<EmergencyContact>): void {
  const current = getStoredEmergencyContacts();
  const updated = current.map((c) => (c.id === id ? { ...c, ...updates } : c));
  saveEmergencyContacts(updated);
}

export function removeEmergencyContact(id: string): void {
  const current = getStoredEmergencyContacts();
  const filtered = current.filter((c) => c.id !== id);
  saveEmergencyContacts(filtered);
}
