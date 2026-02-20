import { PlaylistItem } from '../types';

// Serviços de Mídias - LocalStorage como storage principal
export const midiasService = {
  // Buscar todas as mídias
  async getAll(): Promise<PlaylistItem[]> {
    try {
      const saved = localStorage.getItem('dashview_midias');
      if (!saved) return [];
      return JSON.parse(saved);
    } catch (error) {
      console.error('Erro ao buscar mídias:', error);
      return [];
    }
  },

  // Criar nova mídia
  async create(midia: Omit<PlaylistItem, 'id' | 'status'>): Promise<PlaylistItem> {
    try {
      const midias = await this.getAll();
      const newItem: PlaylistItem = {
        ...midia,
        id: Date.now().toString(),
        status: 'Ativo'
      };
      
      const updated = [newItem, ...midias];
      localStorage.setItem('dashview_midias', JSON.stringify(updated));
      
      console.log('✅ Mídia criada:', newItem);
      return newItem;
    } catch (error) {
      console.error('❌ Erro ao criar mídia:', error);
      throw new Error('Falha ao salvar mídia');
    }
  },

  // Atualizar mídia
  async update(id: string, midia: Partial<PlaylistItem>): Promise<PlaylistItem> {
    try {
      const midias = await this.getAll();
      const index = midias.findIndex(m => m.id === id);
      
      if (index === -1) {
        throw new Error('Mídia não encontrada');
      }
      
      const updated = {
        ...midias[index],
        ...midia
      };
      
      midias[index] = updated;
      localStorage.setItem('dashview_midias', JSON.stringify(midias));
      
      console.log('✅ Mídia atualizada:', updated);
      return updated;
    } catch (error) {
      console.error('❌ Erro ao atualizar mídia:', error);
      throw new Error('Falha ao atualizar mídia');
    }
  },

  // Deletar mídia
  async delete(id: string): Promise<void> {
    try {
      const midias = await this.getAll();
      const filtered = midias.filter(m => m.id !== id);
      localStorage.setItem('dashview_midias', JSON.stringify(filtered));
      console.log('✅ Mídia deletada:', id);
    } catch (error) {
      console.error('❌ Erro ao deletar mídia:', error);
      throw new Error('Falha ao deletar mídia');
    }
  },
};

// Serviços de Links (Compartilhamento)
export const linksService = {
  // Criar link curto
  async create(codigo: string, playlist: PlaylistItem[]): Promise<{ codigoCurto: string; url: string }> {
    try {
      localStorage.setItem(`playlist_${codigo}`, JSON.stringify(playlist));
      localStorage.setItem(`playlist_${codigo}_created`, Date.now().toString());
      
      const baseUrl = window.location.origin + window.location.pathname;
      return {
        codigoCurto: codigo,
        url: `${baseUrl}?id=${codigo}#display`
      };
    } catch (error) {
      console.error('Erro ao criar link:', error);
      throw new Error('Falha ao salvar link');
    }
  },

  // Buscar playlist por código
  async getByCode(codigo: string): Promise<{ playlist: PlaylistItem[] }> {
    try {
      const data = localStorage.getItem(`playlist_${codigo}`);
      
      if (!data) {
        throw new Error('Link não encontrado');
      }
      
      return {
        playlist: JSON.parse(data)
      };
    } catch (error) {
      console.error('Erro ao buscar link:', error);
      throw new Error('Falha ao carregar link');
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


