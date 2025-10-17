export type FunctionHypothesis =
  | 'escape'
  | 'attention'
  | 'tangible'
  | 'sensory'
  | 'unknown';

export interface Attachment {
  id: string;
  type: 'photo' | 'video' | 'audio';
  uri: string;
}

export interface SettingEvents {
  sleepQuality?: 'poor' | 'ok' | 'good';
  illness?: boolean;
  hunger?: boolean;
  scheduleChange?: boolean;
}

export interface Incident {
  id: string;
  childId: string;
  timestamp: string; // ISO string
  behaviorId?: string;
  behaviorText?: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  durationSec?: number;
  latencySec?: number;
  locationId?: string;
  locationText?: string;
  functionHypothesis: FunctionHypothesis;
  notes?: string;
  tags?: string[];
  antecedentIds?: string[];
  consequenceIds?: string[];
  interventionIds?: string[];
  settingEvents?: SettingEvents;
  attachments?: Attachment[];
}

export interface CatalogItem {
  id: string;
  label: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  dob?: string;
  avatarUrl?: string;
}

