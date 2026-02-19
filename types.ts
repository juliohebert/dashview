
export type ViewMode = 'display' | 'dashboard';

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
