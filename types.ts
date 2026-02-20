
export type ViewMode = 'display' | 'dashboard';

export interface TimeSlot {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

export interface Schedule {
  enabled: boolean;
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
  timeSlots: TimeSlot[];
}

export interface PlaylistItem {
  id: string;
  title: string;
  advertiser: string;
  type: 'Video' | 'Image' | 'Widget';
  duration: string;
  displayDays?: number;
  status: 'Ativo' | 'Inativo';
  thumbnail: string;
  mediaUrl?: string; // Link direto para a imagem ou vídeo de alta qualidade
  ctaUrl?: string; // Link para QR Code (opcional)
  schedule?: Schedule; // Agendamento avançado
}

export interface WeatherData {
  temp: number;
  condition: string;
  city: string;
}

export interface StatsData {
  storageUsed: number;
  storageTotal: number;
  nextSyncMinutes: number;
  signalStrength: number;
}

export interface MediaStats {
  id: string;
  title: string;
  advertiser: string;
  plays: number;
  totalExposureMinutes: number;
  lastPlayed?: Date;
}

export interface AdvertiserStats {
  advertiser: string;
  totalExposureMinutes: number;
  mediaCount: number;
  plays: number;
}

export interface ScreenHealth {
  online: boolean;
  lastSync: Date;
  uptime: number; // minutes
}
