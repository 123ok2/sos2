export type ThreatLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isPrimary: boolean;
  notifySMS: boolean;
  notifyCall: boolean;
  notifyEmail?: boolean;
}

export interface UserProfile {
  name: string;
  phone: string;
  email?: string;
  age: number;
  gender: string;
  bloodType: string;
  allergies: string;
  medicalConditions: string;
  guardianCode: string;
  emergencyContacts: EmergencyContact[];
  // Primary target recipient address for automatic collision alerts
  primaryRecipientName?: string;
  primaryRecipientPhone?: string;
  primaryRecipientEmail?: string;
  primaryRecipientAddress?: string;
}

export interface AutoDispatchLog {
  id: string;
  timestamp: number;
  triggerCause: string; // e.g. "Cảm biến điện thoại phát hiện va chạm mạnh (5.2G)"
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  recipientAddress?: string;
  gpsCoordinates: { lat: number; lng: number; address: string };
  status: "SENT_SMS" | "SENT_EMAIL" | "DISPATCHED_GUARDIAN";
  deliveryTime: string;
}

export interface GeoLocationState {
  lat: number;
  lng: number;
  address: string;
  accuracy: number;
  speed: number;
  heading: number | null;
  timestamp: number;
  isSimulated: boolean;
  batteryLevel: number;
}

export interface DangerZone {
  id: string;
  name: string;
  type: "crime" | "accident" | "flood" | "isolated" | "landslide";
  riskLevel: ThreatLevel;
  lat: number;
  lng: number;
  radiusMeters: number;
  description: string;
  incidentCount: number;
  safetyAdvice: string;
}

export interface IncidentAlert {
  id: string;
  timestamp: number;
  type: "FALL_DETECTED" | "CRASH_DETECTED" | "AUDIO_DISTRESS" | "MANUAL_SOS" | "DANGER_ZONE_ENTER";
  status: "COUNTDOWN" | "ACTIVE_SOS" | "RESOLVED" | "CANCELLED";
  threatScore: number;
  location: GeoLocationState;
  audioNote?: string;
  aiAnalysis?: string;
}

export interface FirstAidStep {
  stepNumber: number;
  title: string;
  description: string;
  importantNote?: string;
}

export interface FirstAidGuide {
  id: string;
  title: string;
  category: "cpr" | "drowning" | "fracture" | "snakebite" | "burn" | "choking" | "heatstroke" | "bleeding";
  urgencyLevel: ThreatLevel;
  summary: string;
  steps: string[];
  doList: string[];
  dontList: string[];
  speechScript: string;
  iconName: string;
}

export interface AudioDistressResult {
  threatLevel: ThreatLevel;
  distressScore: number;
  detectedDistressKeywords: string[];
  soundClassification: string;
  locationHintExtracted?: string;
  aiAnalysisSummary: string;
  recommendedAction: string;
}

export interface DangerRiskAssessment {
  riskScore: number;
  riskLevel: ThreatLevel;
  zoneCategory: string;
  primaryThreats: string[];
  voiceWarningText: string;
  recommendedSafetyTips: string[];
}

export interface SimulationState {
  isSimulatingFall: boolean;
  isSimulatingScream: boolean;
  isSimulatingDangerZone: boolean;
  isSirenPlaying: boolean;
  isStrobeActive: boolean;
  selectedDemoScenario: string;
}
