export type AppPerspective = 'driftvakt' | 'beredskap' | 'trygg';

export type DeviceHealthStatus = 'optimal' | 'warning' | 'critical';

export interface SmartMetric {
  wearPercentage: number; // 0-100%
  totalBytesWrittenTB: number;
  expectedLifeRemainingDays: number;
  storageType: 'MicroSD' | 'eMMC' | 'NVMe SSD' | 'SATA SSD';
  dbSizeMB: number;
  dbFragmentation: number; // 0-100%
  iopsLoad: number; // IOPS
  temperatureC: number;
  undervoltageEvents: number;
}

export interface GatewayDevice {
  id: string;
  gatewayCode: string;
  locationName: string;
  unitAddress: string;
  residentName: string;
  residentAge: number;
  district: string;
  status: DeviceHealthStatus;
  haVersion: string;
  ipAddress: string;
  uptimeDays: number;
  lastSeen: string;
  smart: SmartMetric;
  sensorsConnected: number;
  lastBackupSnapshot: string;
  backupSizeMB: number;
  recommendedAction?: string;
  linkedSensors: {
    name: string;
    type: 'fall' | 'door' | 'bed' | 'alarm_button' | 'smoke' | 'motion';
    status: 'online' | 'offline' | 'warning';
    batteryPct: number;
    lastPing: string;
  }[];
}

export interface CarePlanConsequence {
  id: string;
  gatewayId: string;
  residentName: string;
  residentAge: number;
  address: string;
  roomOrUnit: string;
  failingComponent: string;
  failingReason: string;
  offlineSince: string;
  riskSeverity: 'kritisk' | 'høy' | 'moderat';
  carePlanDiagnosis: string;
  consequenceSummary: string;
  recommendedCareAction: string;
  supervisionInterval: string;
  primaryNurse: string;
  primaryPhone: string;
  fallbackChecklist: {
    id: string;
    text: string;
    completed: boolean;
    completedAt?: string;
    completedBy?: string;
  }[];
}

export interface IncidentReport {
  id: string;
  timestamp: string;
  residentName: string;
  unit: string;
  issueType: string;
  reportedBy: string;
  status: 'Sendt til leverandør' | 'Teknisk vakt på vei' | 'Utbedret' | 'Midlertidig sikret';
  details: string;
}

export interface RelativeActivityEvent {
  id: string;
  timeStr: string;
  category: 'morgen' | 'dag' | 'kveld' | 'natt';
  iconType: 'sun' | 'coffee' | 'walk' | 'moon' | 'check';
  message: string;
  detail: string;
  status: 'normal' | 'observasjon';
}

export interface CloudSnapshot {
  id: string;
  gatewayId: string;
  locationName: string;
  createdAt: string;
  sizeMB: number;
  haVersion: string;
  sha256: string;
  includedModules: string[];
  status: 'Validert' | 'Arkivert' | 'Klar til utrulling';
}
