export type IncidentType = 'MEDICAL' | 'FIRE' | 'POLICE' | 'ACCIDENT' | 'OTHER';

export type Severity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type IncidentStatus =
  | 'NEW'
  | 'ASSESSING'
  | 'READY_FOR_RESPONSE'
  | 'CONTACTING_RESPONSE_CENTRE'
  | 'RESPONSE_CENTRE_CONTACTED'
  | 'IN_PROGRESS'
  | 'DEMO_RESPONSE_INITIATED'
  | 'RESOLVED';

export type ResponderType =
  | 'AMBULANCE'
  | 'FIRE_SERVICE'
  | 'POLICE'
  | 'HOSPITAL';

export type LocationConfidence = 'EXACT' | 'APPROXIMATE' | 'UNKNOWN';

export interface Incident {
  id: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  location: string;
  locationConfidence: LocationConfidence;
  description: string;
  aiSummary?: string;
  peopleAffected?: number;
  immediateDanger?: boolean;
  conscious?: boolean;
  breathingStatus?: 'NORMAL' | 'ABNORMAL' | 'ABSENT' | 'UNKNOWN';
  bleeding?: boolean;
  firePresent?: boolean;
  personTrapped?: boolean;
  weaponPresent?: boolean;
  callerName?: string;
  callerPhone?: string;
  recommendedResponders: ResponderType[];
  assignedCentre?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  incidentId: string;
  eventType: string;
  message: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface Responder {
  id: string;
  name: string;
  type: ResponderType;
  location: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  contactMode: 'REAL' | 'DEMO';
}

export interface CreateIncidentPayload {
  type: IncidentType;
  severity: Severity;
  location: string;
  locationConfidence?: LocationConfidence;
  description: string;
  aiSummary?: string;
  peopleAffected?: number;
  immediateDanger?: boolean;
  conscious?: boolean;
  breathingStatus?: 'NORMAL' | 'ABNORMAL' | 'ABSENT' | 'UNKNOWN';
  bleeding?: boolean;
  firePresent?: boolean;
  personTrapped?: boolean;
  weaponPresent?: boolean;
  callerName?: string;
  callerPhone?: string;
}
