import { PlaylistItem } from '../types';

const API_BASE_URL = '/api';

// Função auxiliar para obter headers com autenticação
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('dashview_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Serviços de Mídias - API com fallback localStorage
export const midiasService = {
  // Buscar todas as mídias
  async getAll(): Promise<PlaylistItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/midias`);
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      console.log('✅ Mídias carregadas da API:', data.length);
      return data;
    } catch (error) {
      console.warn('API indisponível, usando localStorage:', error);
      const saved = localStorage.getItem('dashview_midias');
      return saved ? JSON.parse(saved) : [];
    }
  },

  // Criar nova mídia
  async create(midia: Omit<PlaylistItem, 'id' | 'status'>): Promise<PlaylistItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/midias`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(midia)
      });
      
      if (!response.ok) throw new Error('API error');
      const newMidia = await response.json();
      
      console.log('✅ Mídia criada no banco:', newMidia);
      return newMidia;
    } catch (error) {
      console.warn('API indisponível, usando localStorage:', error);
      const midias = await this.getAll();
      const newItem: PlaylistItem = {
        ...midia,
        id: Date.now().toString(),
        status: 'Ativo'
      };
      const updated = [newItem, ...midias];
      localStorage.setItem('dashview_midias', JSON.stringify(updated));
      return newItem;
    }
  },

  // Atualizar mídia
  async update(id: string, midia: Partial<PlaylistItem>): Promise<PlaylistItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/midias/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(midia)
      });
      
      if (!response.ok) throw new Error('API error');
      const updated = await response.json();
      
      console.log('✅ Mídia atualizada no banco:', updated);
      return updated;
    } catch (error) {
      console.warn('API indisponível, usando localStorage:', error);
      const midias = await this.getAll();
      const index = midias.findIndex(m => m.id === id);
      if (index === -1) throw new Error('Mídia não encontrada');
      
      const updated = { ...midias[index], ...midia };
      midias[index] = updated;
      localStorage.setItem('dashview_midias', JSON.stringify(midias));
      return updated;
    }
  },

  // Deletar mídia
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/midias/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('API error');
      console.log('✅ Mídia deletada do banco:', id);
    } catch (error) {
      console.warn('API indisponível, usando localStorage:', error);
      const midias = await this.getAll();
      const filtered = midias.filter(m => m.id !== id);
      localStorage.setItem('dashview_midias', JSON.stringify(filtered));
    }
  },
};

// Serviços de Links (Compartilhamento)
export const linksService = {
  // Criar link curto
  async create(codigo: string, playlist: PlaylistItem[]): Promise<{ codigoCurto: string; url: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/links`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ codigo, playlist })
      });
      
      if (!response.ok) throw new Error('API error');
      
      const baseUrl = window.location.origin + window.location.pathname;
      console.log('✅ Link salvo no banco:', codigo);
      
      return {
        codigoCurto: codigo,
        url: `${baseUrl}?id=${codigo}#display`
      };
    } catch (error) {
      console.warn('API indisponível, usando localStorage:', error);
      localStorage.setItem(`playlist_${codigo}`, JSON.stringify(playlist));
      localStorage.setItem(`playlist_${codigo}_created`, Date.now().toString());
      
      const baseUrl = window.location.origin + window.location.pathname;
      return {
        codigoCurto: codigo,
        url: `${baseUrl}?id=${codigo}#display`
      };
    }
  },

  // Buscar playlist por código
  async getByCode(codigo: string): Promise<{ playlist: PlaylistItem[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/links/${codigo}`);
      if (!response.ok) throw new Error('API error');
      
      const data = await response.json();
      console.log('✅ Link carregado da API:', codigo);
      return data;
    } catch (error) {
      console.warn('API indisponível, usando localStorage:', error);
      const data = localStorage.getItem(`playlist_${codigo}`);
      if (!data) throw new Error('Link não encontrado');
      return { playlist: JSON.parse(data) };
    }
  },
};

// Fallback para localStorage (caso a API esteja indisponível)
export const localStorageService = {
  get(): PlaylistItem[] {
    try {
      const saved = localStorage.getItem('dashview_playlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  set(playlist: PlaylistItem[]): void {
    try {
      localStorage.setItem('dashview_playlist', JSON.stringify(playlist));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  },
};


