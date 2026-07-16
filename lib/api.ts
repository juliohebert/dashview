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
      const response = await fetch(`${API_BASE_URL}/midias`, {
        headers: getAuthHeaders()
      });
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
// Função para detectar IP local usando WebRTC
const getLocalIP = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    const rtc = new RTCPeerConnection({ iceServers: [] });
    rtc.createDataChannel('');
    
    rtc.onicecandidate = (event) => {
      if (!event || !event.candidate) {
        rtc.close();
        return;
      }
      
      const candidate = event.candidate.candidate;
      const ipRegex = /([0-9]{1,3}\.){3}[0-9]{1,3}/;
      const match = candidate.match(ipRegex);
      
      if (match && !match[0].startsWith('127.')) {
        resolve(match[0]);
        rtc.close();
      }
    };
    
    rtc.createOffer()
      .then(offer => rtc.setLocalDescription(offer))
      .catch(() => resolve(null));
    
    // Timeout após 2 segundos
    setTimeout(() => {
      rtc.close();
      resolve(null);
    }, 2000);
  });
};

// Função auxiliar para obter URL base correta (IP da rede para compartilhamento com TV)
const getShareableBaseUrl = async (): Promise<string> => {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const port = window.location.port;
  
  // Se estiver em localhost, tentar usar o IP da rede
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    const localIP = await getLocalIP();
    
    if (localIP) {
      const protocol = window.location.protocol;
      const newOrigin = `${protocol}//${localIP}${port ? ':' + port : ''}`;
      console.log(`✅ IP da rede detectado: ${localIP}`);
      return newOrigin + pathname;
    }
    
    console.warn('⚠️ Não foi possível detectar IP da rede. Usando localhost.');
  }
  
  return origin + pathname;
};

export const linksService = {
  // Criar link curto (SEM autenticação - público)
  async create(codigo: string, playlist: PlaylistItem[]): Promise<{ codigoCurto: string; url: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ codigo, playlist })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro ao criar link:', response.status, errorData);
        throw new Error('API error');
      }
      
      const baseUrl = await getShareableBaseUrl();
      console.log('✅ Link salvo no banco:', codigo);
      
      return {
        codigoCurto: codigo,
        url: `${baseUrl}?id=${codigo}#display`
      };
    } catch (error) {
      console.warn('⚠️ API indisponível, usando localStorage:', error);
      localStorage.setItem(`playlist_${codigo}`, JSON.stringify(playlist));
      localStorage.setItem(`playlist_${codigo}_created`, Date.now().toString());
      
      const baseUrl = await getShareableBaseUrl();
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
      console.warn('💡 Dica: Para testar links compartilhados localmente, use "vercel dev" ao invés de "npm run dev"');
      
      const data = localStorage.getItem(`playlist_${codigo}`);
      if (!data) {
        console.error('❌ Link não encontrado no localStorage. Playlist não disponível.');
        throw new Error('Link não encontrado');
      }
      console.log('✅ Link carregado do localStorage (fallback)');
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


