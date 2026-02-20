
import React, { useState, useEffect, useCallback } from 'react';
import { PlaylistItem, ViewMode } from './types';
import { INITIAL_PLAYLIST } from './constants';
import DisplayView from './components/DisplayView';
import DashboardView from './components/DashboardView';

const App: React.FC = () => {
  const getHashView = (): ViewMode => {
    const hash = window.location.hash.replace('#', '');
    return (hash === 'display' || hash === 'dashboard') ? (hash as ViewMode) : 'dashboard';
  };

  const [view, setView] = useState<ViewMode>(getHashView());
  
  const getInitialPlaylist = useCallback((): PlaylistItem[] => {
    const params = new URLSearchParams(window.location.search);
    
    // Método 1: Link curto com ID
    const shortId = params.get('id');
    if (shortId) {
      try {
        const storedPlaylist = localStorage.getItem(`playlist_${shortId}`);
        if (storedPlaylist) {
          console.log(`Carregando playlist do link curto: ${shortId}`);
          return JSON.parse(storedPlaylist);
        } else {
          console.warn(`Playlist não encontrada para ID: ${shortId}`);
        }
      } catch (e) {
        console.error("Erro ao carregar playlist do link curto:", e);
      }
    }
    
    // Método 2: Link longo com base64 (compatibilidade com links antigos)
    const encodedData = params.get('p');
    if (encodedData) {
      try {
        const normalizedBase64 = encodedData.replace(/-/g, '+').replace(/_/g, '/');
        const binaryString = atob(normalizedBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const decodedString = new TextDecoder().decode(bytes);
        const decoded = JSON.parse(decodedString);
        return decoded;
      } catch (e) {
        console.error("Erro na decodificação:", e);
      }
    }

    // Método 3: localStorage padrão
    const saved = localStorage.getItem('dashview_playlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PLAYLIST;
      }
    }
    return INITIAL_PLAYLIST;
  }, []);

  const [playlist, setPlaylist] = useState<PlaylistItem[]>(getInitialPlaylist);

  // Sincronização de visualização quando a Hash muda (botão voltar do navegador ou links)
  useEffect(() => {
    const handleHashChange = () => {
      setView(getHashView());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Persistência
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get('p')) {
      localStorage.setItem('dashview_playlist', JSON.stringify(playlist));
    }
  }, [playlist]);

  const navigateTo = (newView: ViewMode) => {
    window.location.hash = newView;
    setView(newView);
  };

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden selection:bg-blue-500/30">
      {view === 'display' ? (
        <DisplayView playlist={playlist} />
      ) : (
        <DashboardView 
          playlist={playlist}
          setPlaylist={setPlaylist}
          onViewChange={navigateTo} 
        />
      )}
      
      {/* Botões de controle flutuantes (Sutis) */}
      <div className="fixed bottom-6 right-6 z-[9999] flex gap-2 opacity-10 hover:opacity-100 transition-opacity duration-500">
        <button 
          onClick={() => navigateTo('display')}
          className="bg-gray-800 hover:bg-gray-700 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl border border-white/10 transition-all"
        >
          Modo TV
        </button>
        <button 
          onClick={() => navigateTo('dashboard')}
          className="bg-blue-600 hover:bg-blue-500 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl border border-white/10 transition-all shadow-xl shadow-blue-600/30"
        >
          Painel ADM
        </button>
      </div>
    </div>
  );
};

export default App;
