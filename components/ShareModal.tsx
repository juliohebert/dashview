
import React, { useMemo, useState, useEffect } from 'react';
import { PlaylistItem } from '../types';
import { linksService } from '../lib/api';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: PlaylistItem[];
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, playlist }) => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Gera o link compartilhável ao abrir o modal
  useEffect(() => {
    if (isOpen && !shareUrl) {
      generateShareLink();
    }
  }, [isOpen]);

  // Função para gerar ID curto (6 caracteres alfanuméricos)
  const generateShortId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sem I, O, 0, 1 para evitar confusão
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  const generateShareLink = async () => {
    setIsGenerating(true);
    try {
      // Filtra apenas dados essenciais
      const compactPlaylist = playlist.map(item => ({
        id: item.id,
        title: item.title,
        advertiser: item.advertiser,
        type: item.type,
        duration: item.duration,
        status: item.status,
        mediaUrl: item.mediaUrl,
        thumbnail: item.thumbnail,
        schedule: item.schedule
      }));

      // Gera ID curto único
      let shortId = generateShortId();
      while (localStorage.getItem(`playlist_${shortId}`)) {
        shortId = generateShortId();
      }
      
      // Salva link
      const result = await linksService.create(shortId, compactPlaylist);
      setShareUrl(result.url);
      
    } catch (error) {
      console.error("Erro ao gerar link:", error);
      const fallbackUrl = `${window.location.origin}${window.location.pathname}#display`;
      setShareUrl(fallbackUrl);
    } finally {
      setIsGenerating(false);
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shareUrl)}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    console.log('Backdrop clicked', e.target === e.currentTarget);
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    console.log('Close button clicked');
    alert('Botão de fechar foi clicado! Fechando a modal...');
    e.stopPropagation();
    onClose();
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0d1117] w-full max-w-lg rounded-[48px] border border-white/10 shadow-[0_0_150px_rgba(37,99,235,0.2)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
      >
        
        <div className="p-10 pb-6 flex items-start justify-between bg-gradient-to-b from-blue-600/5 to-transparent">
          <div className="space-y-1">
            <div className="flex items-center gap-4 mb-2">
               <div className="w-12 h-12 bg-blue-600 rounded-[20px] flex items-center justify-center shadow-2xl shadow-blue-600/40 border border-blue-400/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
               </div>
               <div>
                  <h2 className="text-3xl font-black tracking-tight text-white leading-none">Compartilhar TV</h2>
                  <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Sessão Digital Signage</p>
               </div>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleCloseClick} 
            className="p-3 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-all active:scale-90"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="px-10 pb-12 space-y-10">
          
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-6 bg-blue-600/10 blur-[50px] rounded-full animate-pulse" />
              <div className="relative p-7 bg-white rounded-[44px] shadow-2xl transition-transform hover:scale-[1.03] duration-500 cursor-none">
                 <img src={qrCodeUrl} alt="QR Code Acesso TV" className="w-[200px] h-[200px] select-none" />
                 <div className="absolute -bottom-4 -right-4 bg-[#0d1117] p-2 rounded-2xl border border-white/10">
                    <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-xl">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                 </div>
              </div>
            </div>
            <div className="text-center space-y-2">
               <p className="text-gray-400 text-sm font-medium">Escaneie para abrir o player na sua <span className="text-white font-bold tracking-tight">Smart TV</span>.</p>
               <p className="text-[9px] text-green-500 font-black uppercase tracking-[0.2em]">Link Curto • Fácil Digitação</p>
            </div>
          </div>

          {/* Código Curto para Digitação */}
          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-2 border-blue-500/30 rounded-3xl p-6 text-center">
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-4">🎯 Digite na TV</p>
            <div className="flex flex-col items-center gap-3 mb-2">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-gray-400 text-sm font-medium">{window.location.origin}{window.location.pathname}?id=</span>
                <div className="bg-blue-600 px-6 py-3 rounded-2xl shadow-2xl shadow-blue-600/50 border-2 border-blue-400">
                  <span className="text-white text-3xl font-black tracking-[0.3em] font-mono">
                    {shareUrl.split('id=')[1]?.split('#')[0] || '------'}
                  </span>
                </div>
                <span className="text-gray-400 text-sm font-medium">#display</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Digite o endereço completo ou copie o link abaixo</p>
          </div>

          <div className="space-y-4">
             <div className="relative flex items-center group">
                <div className="absolute left-5 text-blue-500 group-hover:scale-110 transition-transform">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <input 
                  readOnly
                  type="text" 
                  value={shareUrl}
                  className="w-full bg-[#161b22] border border-white/10 rounded-2xl py-6 pl-16 pr-36 text-sm font-mono transition-all cursor-text select-all text-white focus:ring-2 focus:ring-blue-500/50"
                />
                <button 
                  type="button"
                  onClick={handleCopy}
                  className={`absolute right-2.5 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/30'}`}
                >
                  {copied ? '✓ Copiado' : 'Copiar Link'}
                </button>
             </div>

             <div className="bg-blue-600/5 border border-blue-500/10 rounded-[32px] p-6 flex gap-5 items-start">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center shrink-0 border border-blue-500/10">
                   <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div className="space-y-2.5">
                   <p className="text-xs text-blue-400 font-black uppercase tracking-widest">✨ Como Usar</p>
                   <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                     <span className="text-white font-bold">1.</span> Escaneie o QR Code com o celular, ou<br/>
                     <span className="text-white font-bold">2.</span> Copie o link completo abaixo, ou<br/>
                     <span className="text-white font-bold">3.</span> Digite o endereço completo destacado acima na TV.<br/>
                     <span className="text-blue-400 mt-2 block">O código tem apenas 6 caracteres para facilitar!</span>
                   </p>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-[#161b22]/40 p-8 flex justify-center border-t border-white/5">
           <button 
             type="button"
             onClick={handleCloseClick}
             className="text-gray-600 hover:text-white text-[10px] font-black uppercase tracking-[0.5em] transition-all"
           >
             Fechar Painel
           </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
