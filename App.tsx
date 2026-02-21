
import React, { useState, useEffect, useCallback } from 'react';
import { PlaylistItem, ViewMode } from './types';
import { INITIAL_PLAYLIST } from './constants';
import DisplayView from './components/DisplayView';
import DashboardView from './components/DashboardView';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import { midiasService, linksService, localStorageService } from './lib/api';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading: authLoading, login, register, logout } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const getHashView = (): ViewMode => {
    const hash = window.location.hash.replace('#', '');
    return (hash === 'display' || hash === 'dashboard') ? (hash as ViewMode) : 'dashboard';
  };

  const [view, setView] = useState<ViewMode>(getHashView());
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar playlist ao iniciar
  useEffect(() => {
    loadPlaylist();
  }, []);

  const loadPlaylist = async () => {
    setLoading(true);
    const params = new URLSearchParams(window.location.search);
    const liveMode = params.get('mode') === 'live';
    
    try {
      // Método 1: Link curto com ID - buscar da API (ignorado em modo live)
      const shortId = params.get('id');
      if (shortId && !liveMode) {
        console.log(`Carregando playlist compartilhada: ${shortId}`);
        try {
          const response = await linksService.getByCode(shortId);
          setPlaylist(response.playlist);
          setLoading(false);
          return;
        } catch (error) {
          console.warn('Erro ao buscar link da API, tentando localStorage:', error);
          // Fallback para localStorage
          const storedPlaylist = localStorage.getItem(`playlist_${shortId}`);
          if (storedPlaylist) {
            setPlaylist(JSON.parse(storedPlaylist));
            setLoading(false);
            return;
          }
        }
      }
      
      // Método 2: Link longo com base64 (compatibilidade)
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
          setPlaylist(decoded);
          setLoading(false);
          return;
        } catch (e) {
          console.error("Erro na decodificação:", e);
        }
      }

      // Método 3: Carregar mídias salvas
      console.log('Carregando mídias salvas...');
      const apiPlaylist = await midiasService.getAll();
      setPlaylist(apiPlaylist);
      console.log(`✅ ${apiPlaylist.length} mídias carregadas`);
      
    } catch (error) {
      console.warn('Erro ao carregar mídias, usando dados iniciais:', error);
      // Fallback: localStorage ou dados iniciais
      const fallbackPlaylist = localStorageService.get();
      setPlaylist(fallbackPlaylist.length > 0 ? fallbackPlaylist : INITIAL_PLAYLIST);
    } finally {
      setLoading(false);
    }
  };

  // Sincronização de visualização quando a Hash muda (botão voltar do navegador ou links)
  useEffect(() => {
    const handleHashChange = () => {
      setView(getHashView());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newView: ViewMode) => {
    window.location.hash = newView;
    setView(newView);
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="w-full h-screen bg-[#010409] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white font-bold text-lg">Carregando DashView...</p>
          <p className="text-gray-500 text-sm">Preparando playlist</p>
        </div>
      </div>
    );
  }

  // Tela de autenticação
  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <RegisterView
          onRegister={async (nomeEmpresa, nomeUsuario, email, senha) => {
            await register(nomeEmpresa, nomeUsuario, email, senha);
            setShowRegister(false);
          }}
          onVoltar={() => setShowRegister(false)}
        />
      );
    }

    return (
      <LoginView
        onLogin={login}
        onCadastro={() => setShowRegister(true)}
      />
    );
  }

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden selection:bg-blue-500/30">
      {view === 'display' ? (
        <DisplayView 
          playlist={playlist} 
          onPlaylistUpdate={setPlaylist}
        />
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
