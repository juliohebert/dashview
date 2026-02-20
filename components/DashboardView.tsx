
import React, { useState, useEffect } from 'react';
import { PlaylistItem, ViewMode } from '../types';
import Sidebar from './Sidebar';
import MediaCard from './MediaCard';
import MobileMediaCard from './MobileMediaCard';
import LivePreview from './LivePreview';
import MediaModal from './MediaModal';
import ShareModal from './ShareModal';
import PlaylistTable from './PlaylistTable';
import AnalyticsView from './AnalyticsView';
import { midiasService } from '../lib/api';

interface DashboardViewProps {
  onViewChange: (v: ViewMode) => void;
  playlist: PlaylistItem[];
  setPlaylist: React.Dispatch<React.SetStateAction<PlaylistItem[]>>;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onViewChange, playlist, setPlaylist }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [viewType, setViewType] = useState<'grid' | 'table'>('grid');
  const [editingItem, setEditingItem] = useState<PlaylistItem | null>(null);
  const [activeSection, setActiveSection] = useState<'playlist' | 'analytics'>('playlist');

  // Debug: monitora mudanças no estado da modal
  useEffect(() => {
    console.log('🔔 isShareModalOpen mudou para:', isShareModalOpen);
  }, [isShareModalOpen]);

  const handleSaveMedia = async (data: Omit<PlaylistItem, 'id' | 'status'> & { id?: string }) => {
    setIsUploading(true);
    try {
      if (data.id) {
        // Edição: atualiza no banco
        await midiasService.update(data.id, data);
        setPlaylist(prev => prev.map(item => 
          item.id === data.id ? { ...item, ...data } as PlaylistItem : item
        ));
      } else {
        // Criação: salva no banco
        const newItem = await midiasService.create(data);
        setPlaylist(prev => [newItem, ...prev]);
      }
      setEditingItem(null);
    } catch (error) {
      console.error('Erro ao salvar mídia:', error);
      alert('Erro ao salvar mídia. Tente novamente.');
    } finally {
      setTimeout(() => setIsUploading(false), 2000);
    }
  };

  const handleEditClick = (item: PlaylistItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    setIsUploading(true);
    try {
      await midiasService.delete(id);
      setPlaylist(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Erro ao deletar mídia:', error);
      alert('Erro ao deletar mídia. Tente novamente.');
    } finally {
      setTimeout(() => setIsUploading(false), 2000);
    }
  };

  const toggleStatus = async (id: string) => {
    const item = playlist.find(item => item.id === id);
    if (!item) return;

    const newStatus = item.status === 'Ativo' ? 'Inativo' : 'Ativo';
    
    try {
      await midiasService.update(id, { ...item, status: newStatus });
      setPlaylist(prev => prev.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      ));
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status. Tente novamente.');
    }
  };

  const updateItemOrder = (id: string, newOrder: number) => {
    const currentIndex = playlist.findIndex(item => item.id === id);
    if (currentIndex === -1) return;

    const targetIndex = Math.max(0, Math.min(playlist.length - 1, newOrder - 1));
    if (currentIndex === targetIndex) return;

    const newPlaylist = [...playlist];
    const [movedItem] = newPlaylist.splice(currentIndex, 1);
    newPlaylist.splice(targetIndex, 0, movedItem);
    
    setPlaylist(newPlaylist);
  };

  const filteredPlaylist = playlist.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.advertiser.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full w-full bg-[#0b0e14]">
      <div className="hidden lg:block">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
        />
      </div>

      <div className="flex-grow flex flex-col h-full overflow-hidden">
        
        {/* Header Desktop */}
        <header className="hidden lg:flex h-20 items-center justify-between px-8 border-b border-white/5 flex-shrink-0 bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-6">
            {activeSection === 'playlist' && (
              <div className="relative w-96">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Buscar mídias..."
                  className="w-full bg-[#161b22] border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            {activeSection === 'analytics' && (
              <div>
                <h1 className="text-2xl font-black text-white">Analytics & Insights</h1>
                <p className="text-xs text-gray-500 font-semibold">Análise detalhada de performance</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            {activeSection === 'playlist' && (
              <button 
                onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
              >
                + Nova Mídia
              </button>
            )}
            <div className="h-8 w-px bg-white/10 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-bold text-white">Admin Dash</div>
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Master</div>
              </div>
              <img src="https://picsum.photos/seed/admin/100/100" className="w-10 h-10 rounded-2xl border-2 border-white/10" alt="Admin" />
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="lg:hidden h-20 flex items-center justify-between px-6 border-b border-white/5 bg-[#0d1117]/95 backdrop-blur-md z-40">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
             </div>
             <h1 className="text-lg font-black tracking-tight">DashView</h1>
           </div>
           <button 
            onClick={() => setIsReordering(!isReordering)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isReordering ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'}`}
           >
             {isReordering ? 'Salvar' : 'Ordenar'}
           </button>
        </header>

        <div className="flex-grow overflow-y-auto custom-scrollbar pb-32 lg:pb-8">
          {activeSection === 'analytics' ? (
            <AnalyticsView playlist={playlist} />
          ) : (
            <main className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
            
            <section className="bg-[#161b22] rounded-3xl p-6 lg:p-8 border border-white/5 shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full" />
              <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
                <div>
                  <h2 className="text-2xl lg:text-4xl font-black mb-1 tracking-tight">Lobby Central</h2>
                  <p className="text-gray-500 text-sm font-medium">Smart TV 50" • Sincronizado</p>
                  <div className="hidden lg:flex gap-4 mt-6">
                    <button onClick={() => onViewChange('display')} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
                      Abrir Player TV
                    </button>
                    <button 
                      onClick={() => setIsShareModalOpen(true)}
                      className="bg-white/5 text-white px-5 py-2.5 rounded-xl font-bold text-xs border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Gerar Link Externo
                    </button>
                    <button 
                      onClick={() => setIsReordering(!isReordering)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs border transition-all ${isReordering ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20'}`}
                    >
                      {isReordering ? 'Confirmar Ordem' : 'Ordenar Playlist'}
                    </button>
                  </div>
                </div>
                <div className="hidden lg:block">
                   <LivePreview />
                </div>
              </div>
            </section>

            {/* Lista Mobile */}
            <section className="lg:hidden space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black tracking-tight">Fila de Exibição</h2>
              </div>
              <div className="space-y-4">
                {filteredPlaylist.map((item, index) => (
                  <MobileMediaCard 
                    key={item.id} 
                    item={item} 
                    onToggleStatus={toggleStatus}
                    isReorderMode={isReordering}
                    order={index + 1}
                    onOrderChange={(newOrder) => updateItemOrder(item.id, newOrder)}
                    onEditClick={() => handleEditClick(item)}
                    onDeleteClick={() => handleDeleteClick(item.id)}
                  />
                ))}
              </div>
            </section>

            {/* Grid/Table Desktop */}
            <section className="hidden lg:block space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black tracking-tight">Gestão de Conteúdo</h2>
                <div className="flex bg-[#161b22] p-1 rounded-xl border border-white/5">
                  <button 
                    onClick={() => setViewType('grid')}
                    className={`p-2 rounded-lg transition-all ${viewType === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    title="Visualização em Grade"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button 
                    onClick={() => setViewType('table')}
                    className={`p-2 rounded-lg transition-all ${viewType === 'table' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    title="Visualização em Tabela"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M4 6h16M4 10h16M4 14h16M4 18h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              {viewType === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPlaylist.map((item, index) => (
                    <MediaCard 
                      key={item.id} 
                      item={item} 
                      isReorderMode={isReordering}
                      order={index + 1}
                      onOrderChange={(newOrder) => updateItemOrder(item.id, newOrder)}
                      onEditClick={() => handleEditClick(item)}
                      onDeleteClick={() => handleDeleteClick(item.id)}
                    />
                  ))}
                </div>
              ) : (
                <PlaylistTable 
                  items={filteredPlaylist} 
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              )}
            </section>

          </main>
          )}
        </div>

        <MediaModal 
          isOpen={isModalOpen} 
          initialData={editingItem || undefined}
          onClose={() => { setIsModalOpen(false); setEditingItem(null); }} 
          onSave={handleSaveMedia}
        />

        <ShareModal 
          isOpen={isShareModalOpen}
          onClose={() => {
            console.log('onClose chamado, isShareModalOpen atual:', isShareModalOpen);
            setIsShareModalOpen(false);
            console.log('setIsShareModalOpen(false) executado');
          }}
          playlist={playlist}
        />

        {/* Floating Action Mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-50">
           {!isReordering && (
             <div className="flex gap-2">
               <button 
                  onClick={() => setIsShareModalOpen(true)}
                  className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-white active:scale-95 transition-all"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
               </button>
               <button 
                 onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                 className="flex-grow bg-blue-600 text-white h-16 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(37,99,235,0.4)] active:scale-95 transition-all"
               >
                 + Nova Mídia
               </button>
             </div>
           )}
        </div>
      </div>

      {/* Notificação de Sucesso */}
      {isUploading && (
        <div className="fixed bottom-10 right-10 z-[110] animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-[#1c2128] text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-blue-500/30">
             <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
             </div>
             <div>
                <div className="font-bold text-sm">Pronto!</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Playlist Atualizada</div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
