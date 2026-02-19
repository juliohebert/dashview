
import React, { useMemo, useState } from 'react';
import { PlaylistItem } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: PlaylistItem[];
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, playlist }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    try {
      // Filtra apenas itens ativos ou essenciais para reduzir o tamanho da URL
      const compactPlaylist = playlist.map(item => ({
        id: item.id,
        title: item.title,
        advertiser: item.advertiser,
        type: item.type,
        duration: item.duration,
        status: item.status,
        mediaUrl: item.mediaUrl,
        thumbnail: item.thumbnail
      }));

      const jsonString = JSON.stringify(compactPlaylist);
      
      // Codificação robusta Unicode -> Base64 URL-Safe
      const bytes = new TextEncoder().encode(jsonString);
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      
      const base64 = btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, ''); // Remove padding para encurtar URL
      
      const baseUrl = window.location.origin + window.location.pathname;
      const url = `${baseUrl}?p=${base64}#display`;
      
      // Limite técnico para URLs estáveis em browsers antigos (Smart TVs)
      if (url.length > 7000) throw new Error("URL_TOO_LONG");
      
      return url;
    } catch (e) {
      console.error("Erro na geração do link:", e);
      return "URL_TOO_LONG";
    }
  }, [playlist]);

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shareUrl === "URL_TOO_LONG" ? "ERRO_TAMANHO" : shareUrl)}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    if (shareUrl === "URL_TOO_LONG") return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#0d1117] w-full max-w-lg rounded-[48px] border border-white/10 shadow-[0_0_150px_rgba(37,99,235,0.2)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
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
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-all active:scale-90">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="px-10 pb-12 space-y-10">
          
          <div className="flex flex-col items-center gap-8">
            <div className="relative group">
              <div className="absolute -inset-6 bg-blue-600/10 blur-[50px] rounded-full animate-pulse" />
              <div className="relative p-7 bg-white rounded-[44px] shadow-2xl transition-transform hover:scale-[1.03] duration-500 cursor-none">
                 {shareUrl === "URL_TOO_LONG" ? (
                   <div className="w-[200px] h-[200px] flex items-center justify-center text-center p-6 bg-red-50 rounded-3xl">
                     <p className="text-black text-[10px] font-bold leading-relaxed">
                       <span className="text-red-600 font-black text-xs uppercase block mb-2">Playlist Excedida!</span>
                       Remova arquivos carregados localmente (Upload Manual) e utilize apenas <span className="text-blue-600">Links Diretos de URL</span> para compartilhar com a TV.
                     </p>
                   </div>
                 ) : (
                   <img src={qrCodeUrl} alt="QR Code Acesso TV" className="w-[200px] h-[200px] select-none" />
                 )}
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
               {shareUrl !== "URL_TOO_LONG" && (
                 <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Link Gerado com Sucesso</p>
               )}
            </div>
          </div>

          <div className="space-y-4">
             <div className="relative flex items-center group">
                <div className="absolute left-5 text-blue-500 group-hover:scale-110 transition-transform">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <input 
                  readOnly
                  type="text" 
                  value={shareUrl === "URL_TOO_LONG" ? "Erro: Conteúdo local detectado" : shareUrl}
                  className={`w-full bg-[#161b22] border rounded-2xl py-5 pl-14 pr-36 text-[10px] font-mono transition-all cursor-default ${shareUrl === "URL_TOO_LONG" ? 'border-red-500/30 text-red-400' : 'border-white/5 text-gray-500 focus:ring-2 focus:ring-blue-500/50'}`}
                />
                <button 
                  disabled={shareUrl === "URL_TOO_LONG"}
                  onClick={handleCopy}
                  className={`absolute right-2.5 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/30'} disabled:opacity-30`}
                >
                  {copied ? 'Copiado' : 'Copiar Link'}
                </button>
             </div>

             <div className="bg-blue-600/5 border border-blue-500/10 rounded-[32px] p-6 flex gap-5 items-start">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center shrink-0 border border-blue-500/10">
                   <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div className="space-y-1">
                   <p className="text-xs text-blue-400 font-black uppercase tracking-widest">Guia de Instalação</p>
                   <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                     Para TVs, recomendamos o uso de links diretos (URL) nas mídias. O modo "Upload Manual" armazena dados no navegador local, o que impede o compartilhamento via link.
                   </p>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-[#161b22]/40 p-8 flex justify-center border-t border-white/5">
           <button 
             onClick={onClose}
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
