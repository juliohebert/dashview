
import React, { useState, useEffect, useRef } from 'react';
import { PlaylistItem, Schedule } from '../types';
import ScheduleEditor from './ScheduleEditor';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<PlaylistItem, 'id' | 'status'> & { id?: string }) => void;
  initialData?: PlaylistItem;
}

const MediaModal: React.FC<MediaModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [autoDetectedDuration, setAutoDetectedDuration] = useState(false);
  const [detectingDuration, setDetectingDuration] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    advertiser: '',
    type: 'Image' as const,
    duration: '15',
    displayDays: 7,
    mediaUrl: '',
    ctaUrl: ''
  });

  const [schedule, setSchedule] = useState<Schedule>({
    enabled: false,
    daysOfWeek: [],
    timeSlots: []
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        title: initialData.title,
        advertiser: initialData.advertiser,
        type: initialData.type,
        duration: initialData.duration?.replace('s', '') || '15',
        displayDays: initialData.displayDays || 7,
        mediaUrl: initialData.mediaUrl || '',
        ctaUrl: initialData.ctaUrl || ''
      });
      setSchedule(initialData.schedule || {
        enabled: false,
        daysOfWeek: [],
        timeSlots: []
      });
      setUploadMethod(initialData.mediaUrl?.startsWith('data:') ? 'file' : 'url');
      setFilePreview(initialData.mediaUrl?.startsWith('data:') ? initialData.mediaUrl : null);
    } else if (!initialData && isOpen) {
      setFormData({
        title: '',
        advertiser: '',
        type: 'Image',
        duration: '15',
        displayDays: 7,
        mediaUrl: '',
        ctaUrl: ''
      });
      setSchedule({
        enabled: false,
        daysOfWeek: [],
        timeSlots: []
      });
      setUploadMethod('url');
      setFilePreview(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Função para detectar duração do vídeo
  const detectVideoDuration = (videoUrl: string, isVideoType: boolean) => {
    if (!isVideoType) return;

    // Criar elemento de vídeo temporário
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = videoUrl;
    
    video.onloadedmetadata = () => {
      const durationInSeconds = Math.ceil(video.duration);
      if (durationInSeconds && durationInSeconds > 0 && durationInSeconds < 1000) {
        setFormData(prev => ({ ...prev, duration: durationInSeconds.toString() }));
        setAutoDetectedDuration(true);
        setTimeout(() => setAutoDetectedDuration(false), 3000);
      }
      video.remove();
    };

    video.onerror = () => {
      video.remove();
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      const isVideo = file.type.startsWith('video');
      
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFilePreview(base64String);
        setFormData({ ...formData, mediaUrl: base64String, type: isVideo ? 'Video' : 'Image' });
        
        // Detectar duração do vídeo
        if (isVideo) {
          detectVideoDuration(base64String, true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Função para detectar duração de vídeo do YouTube
  const detectYouTubeDuration = async (videoId: string) => {
    setDetectingDuration(true);
    try {
      // Usar API do YouTube oEmbed (mais confiável)
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Tentar extrair duração do título ou usar valores comuns para YouTube
        let duration = 30; // Default para vídeos do YouTube
        
        // Se for um vídeo curto (Short), usar 60s
        if (data.title && data.title.toLowerCase().includes('short')) {
          duration = 60;
        }
        
        setFormData(prev => ({ ...prev, duration: duration.toString() }));
        setAutoDetectedDuration(true);
        setTimeout(() => setAutoDetectedDuration(false), 5000);
        setDetectingDuration(false);
        return;
      }
    } catch (e) {
      console.log('YouTube oEmbed falhou');
    }
    
    // Se tudo falhar, usar 30s como padrão para YouTube
    setFormData(prev => ({ ...prev, duration: '30' }));
    setAutoDetectedDuration(true);
    setTimeout(() => setAutoDetectedDuration(false), 3000);
    setDetectingDuration(false);
  };

  const handleUrlChange = (url: string) => {
    const ytId = getYouTubeId(url);
    const isVideo = ytId || url.match(/\.(mp4|webm|ogg|mov)$/i);
    
    setFormData({
      ...formData,
      mediaUrl: url,
      type: isVideo ? 'Video' : formData.type
    });

    // Detectar duração para YouTube
    if (ytId) {
      detectYouTubeDuration(ytId);
    }
    // Detectar duração para vídeos diretos (não YouTube)
    else if (isVideo && url) {
      detectVideoDuration(url, true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = getYouTubeId(formData.mediaUrl);
    const thumbnail = ytId 
      ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
      : (formData.mediaUrl || initialData?.thumbnail || `https://picsum.photos/seed/${Date.now()}/800/450`);

    onSave({
      id: initialData?.id,
      title: formData.title,
      advertiser: formData.advertiser,
      type: formData.type,
      duration: `${formData.duration}s`,
      displayDays: formData.displayDays,
      mediaUrl: formData.mediaUrl,
      ctaUrl: formData.ctaUrl,
      thumbnail: thumbnail,
      schedule: schedule
    });
    onClose();
  };

  const isEdit = !!initialData;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0d1117] w-full max-w-2xl rounded-[40px] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
          <div>
            <h2 className="text-3xl font-black tracking-tight">{isEdit ? 'Editar Mídia' : 'Configurar Mídia'}</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
              {isEdit ? `ID: ${initialData.id}` : 'Alta Definição & Agendamento'}
            </p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex bg-[#161b22] p-1 rounded-2xl border border-white/5">
            <button 
              type="button"
              onClick={() => setUploadMethod('url')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${uploadMethod === 'url' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              Link Direto (Recomendado TV)
            </button>
            <button 
              type="button"
              onClick={() => setUploadMethod('file')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${uploadMethod === 'file' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              Upload Manual
            </button>
          </div>

          {uploadMethod === 'url' ? (
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2 flex items-center gap-2">
                URL da Imagem ou Vídeo em Alta Qualidade
                <span className="text-blue-500 lowercase">(links diretos do HTML)</span>
              </label>
              <input 
                type="url" 
                placeholder="https://exemplo.com/midia-4k.mp4"
                className="w-full bg-[#161b22] border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 text-blue-400 font-mono"
                value={formData.mediaUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
              />

              {/* URL Preview Section */}
              {formData.mediaUrl && (
                <div className="mt-4 p-2 bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                  <div className="aspect-video w-full max-w-[240px] mx-auto rounded-xl overflow-hidden bg-[#0d1117] relative group">
                    {getYouTubeId(formData.mediaUrl) ? (
                      <img 
                        src={`https://img.youtube.com/vi/${getYouTubeId(formData.mediaUrl)}/mqdefault.jpg`}
                        className="w-full h-full object-cover"
                        alt="YouTube Preview"
                      />
                    ) : formData.type === 'Video' || formData.mediaUrl.toLowerCase().endsWith('.mp4') ? (
                      <video 
                        src={formData.mediaUrl} 
                        className="w-full h-full object-cover"
                        muted
                        onMouseOver={(e) => e.currentTarget.play()}
                        onMouseOut={(e) => e.currentTarget.pause()}
                      />
                    ) : (
                      <img 
                        src={formData.mediaUrl} 
                        className="w-full h-full object-cover"
                        alt="Preview"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/error/400/225?blur=10';
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 px-2 py-1 rounded">Pré-visualização</span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-[9px] text-gray-500 px-2 leading-relaxed">
                <span className="text-blue-500 font-black">Dica:</span> Use links diretos para garantir que a TV exiba o conteúdo em 4K/HD sem perdas de compressão.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Arquivo Local</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-white/5 hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden relative"
              >
                {filePreview ? (
                  <div className="absolute inset-0">
                    {formData.type === 'Video' ? (
                      <video src={filePreview} className="w-full h-full object-cover opacity-50" muted />
                    ) : (
                      <img src={filePreview} className="w-full h-full object-cover opacity-50" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                       <span className="bg-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Alterar Mídia</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">Selecione uma Imagem ou Vídeo</p>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">MP4, JPG, PNG ou GIF</p>
                    </div>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Título do Anúncio</label>
              <input 
                required
                type="text" 
                className="w-full bg-[#161b22] border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Anunciante</label>
              <input 
                required
                type="text" 
                className="w-full bg-[#161b22] border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                value={formData.advertiser}
                onChange={(e) => setFormData({...formData, advertiser: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2 flex items-center gap-2">
              Link de Ação (QR Code)
              <span className="text-blue-500 lowercase">(opcional - ex: site da oferta)</span>
            </label>
            <input 
              type="url" 
              placeholder="https://sua-loja.com/oferta"
              className="w-full bg-[#161b22] border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 text-blue-400 font-mono"
              value={formData.ctaUrl}
              onChange={(e) => setFormData({...formData, ctaUrl: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">
                Tempo (Seg)
                {detectingDuration ? (
                  <span className="ml-2 text-blue-500 text-[8px]">⏳</span>
                ) : autoDetectedDuration ? (
                  <span className="ml-2 text-green-500 text-[8px]">✓</span>
                ) : null}
              </label>
              <input 
                required
                type="number" 
                min="1"
                max="300"
                placeholder="15"
                className="w-full bg-[#161b22] border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                value={formData.duration}
                onChange={(e) => {
                  setFormData({...formData, duration: e.target.value});
                  setAutoDetectedDuration(false);
                }}
              />
            </div>
            <div className="space-y-2 col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Validade (Dias)</label>
              <input 
                required
                type="number" 
                min="1"
                className="w-full bg-[#161b22] border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                value={formData.displayDays}
                onChange={(e) => setFormData({...formData, displayDays: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2 col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Formato</label>
              <div className="flex bg-[#161b22] rounded-2xl p-1 h-[52px]">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'Image'})}
                  className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${formData.type === 'Image' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}
                >
                  IMG
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'Video'})}
                  className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${formData.type === 'Video' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}
                >
                  VIDEO
                </button>
              </div>
            </div>
          </div>

          {/* Schedule Editor */}
          <ScheduleEditor schedule={schedule} onChange={setSchedule} />

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-6 rounded-[30px] font-black text-xl shadow-2xl shadow-blue-600/30 active:scale-[0.98] transition-all mt-4 border border-blue-400/20"
          >
            {isEdit ? 'Salvar Alterações' : 'Adicionar à Playlist'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MediaModal;
