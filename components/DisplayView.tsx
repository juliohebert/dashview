
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PlaylistItem, WeatherData } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  Wind, 
  Thermometer, 
  MapPin, 
  Clock,
  ArrowRight,
  Tv
} from 'lucide-react';

interface DisplayViewProps {
  playlist?: PlaylistItem[];
}

const DisplayView: React.FC<DisplayViewProps> = ({ playlist = [] }) => {
  const [time, setTime] = useState(new Date());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [weather, setWeather] = useState<WeatherData>({ temp: 22, condition: 'Parcial', city: 'Carregando...' });
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeItems = useMemo(() => 
    playlist.filter(item => item.status === 'Ativo'),
  [playlist]);

  const currentItem = activeItems[currentIndex];
  const nextItem = activeItems[(currentIndex + 1) % activeItems.length];

  // 1. News Ticker Data (Mock RSS)
  const news = useMemo(() => [
    "Bem-vindo ao DashView Signage - O futuro da comunicação digital.",
    "Confira as ofertas da semana no setor de varejo.",
    "Temperatura em alta: Hidrate-se e proteja-se do sol.",
    "Novos widgets disponíveis no painel administrativo.",
    "Siga-nos nas redes sociais para mais novidades @dashview_signage"
  ], []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Weather Fetching
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        if (weatherRes.ok) {
          const data = await weatherRes.json();
          setWeather(prev => ({ ...prev, temp: Math.round(data.current_weather.temperature) }));
        }
        
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
          headers: { 'Accept-Language': 'pt-BR' }
        });
        if (geoRes.ok) {
          const data = await geoRes.json();
          const cityName = data.address.city || data.address.town || data.address.village || 'Local Atual';
          setWeather(prev => ({ ...prev, city: cityName }));
        }
      } catch (e) {
        setWeather(prev => ({ ...prev, city: 'Rede Ativa' }));
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => fetchWeather(p.coords.latitude, p.coords.longitude),
        () => setWeather({ temp: 22, condition: 'Padrão', city: 'Sinalizador' })
      );
    }
  }, []);

  // 2. Progress Bar & Switch Logic
  useEffect(() => {
    if (activeItems.length === 0) return;
    
    const durationSec = parseInt(currentItem?.duration) || 10;
    const durationMs = durationSec * 1000;
    const intervalMs = 50; // Update every 50ms for smoothness
    
    setProgress(0);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (intervalMs / durationMs) * 100;
        return next >= 100 ? 100 : next;
      });
    }, intervalMs);

    const switchTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeItems.length);
    }, durationMs);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(switchTimer);
    };
  }, [currentIndex, activeItems, currentItem]);

  // 3. Preloading next media
  useEffect(() => {
    if (!nextItem) return;
    if (nextItem.type === 'Image') {
      const img = new Image();
      img.src = nextItem.mediaUrl || nextItem.thumbnail;
    }
  }, [nextItem]);

  const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
  const formatDate = (date: Date) => {
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    const dayMonth = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }).toUpperCase();
    return { weekday, dayMonth };
  };

  const handleExit = () => {
    window.location.hash = 'dashboard';
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const WeatherIcon = ({ temp }: { temp: number }) => {
    if (temp > 28) return <Sun className="w-full h-full text-orange-400" />;
    if (temp > 20) return <Cloud className="w-full h-full text-blue-300" />;
    if (temp > 10) return <Wind className="w-full h-full text-gray-400" />;
    return <CloudSnow className="w-full h-full text-white" />;
  };

  const { weekday, dayMonth } = formatDate(time);

  if (activeItems.length === 0) {
    return (
      <div className="flex h-screen w-screen bg-black items-center justify-center font-inter p-10">
        <div className="text-center animate-pulse space-y-6">
          <div className="w-32 h-32 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-600/20">
             <Tv className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Aguardando Playlist</h2>
          <button onClick={handleExit} className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all">Voltar ao Painel</button>
        </div>
      </div>
    );
  }

  const youtubeId = currentItem?.mediaUrl ? getYouTubeId(currentItem.mediaUrl) : null;
  const isVideo = currentItem?.type === 'Video' || currentItem?.mediaUrl?.toLowerCase().endsWith('.mp4');

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-black overflow-hidden cursor-none select-none font-inter">
      
      {/* 2. Progress Bar (Top) */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-white/5 z-[100]">
        <motion.div 
          className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </div>

      <main className="relative flex-grow h-full bg-black overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentItem.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            className="w-full h-full"
          >
            {youtubeId ? (
              <iframe
                key={youtubeId}
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&modestbranding=1&rel=0`}
                className="w-full h-full border-none"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : isVideo ? (
              <video 
                key={currentItem.mediaUrl} 
                ref={videoRef} 
                autoPlay 
                muted 
                loop 
                playsInline 
                className="w-full h-full object-cover"
              >
                <source src={currentItem.mediaUrl || currentItem.thumbnail} type="video/mp4" />
              </video>
            ) : (
              <img 
                src={currentItem?.mediaUrl || currentItem?.thumbnail} 
                className="w-full h-full object-cover animate-ken-burns" 
                alt="Signage Content" 
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />

            <div className="absolute bottom-[12vh] lg:bottom-[15vh] left-[5vw] right-[5vw] max-w-[90%] lg:max-w-[70%] space-y-[1.5vh]">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3"
              >
                <span className="bg-blue-600 px-4 py-1.5 lg:px-[1.5vw] lg:py-[0.5vw] rounded-lg lg:rounded-[0.8vw] text-sm lg:text-[1.2vw] font-black uppercase tracking-widest text-white shadow-xl border border-blue-400/30">
                  {currentItem?.advertiser}
                </span>
                <span className="bg-white/10 backdrop-blur-xl px-3 py-1 rounded-lg text-[10px] lg:text-[0.8vw] font-bold text-white/70 border border-white/10 uppercase">
                  Em Exibição
                </span>
              </motion.div>
              <motion.h2 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-[clamp(2rem,6vh,8vh)] lg:text-[clamp(3.5rem,8vw,14rem)] font-black text-white tracking-tighter leading-[0.85] uppercase drop-shadow-2xl"
              >
                {currentItem?.title}
              </motion.h2>
            </div>

            {/* 5. QR Code Dinâmico */}
            {currentItem?.ctaUrl && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className="absolute bottom-[12vh] right-[5vw] p-4 bg-white rounded-[2rem] shadow-2xl flex flex-col items-center gap-2 group"
              >
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentItem.ctaUrl)}`} 
                  alt="QR Code"
                  className="w-24 h-24 lg:w-32 lg:h-32"
                />
                <div className="text-center">
                  <p className="text-[8px] lg:text-[10px] font-black text-black uppercase tracking-widest">Acesse Agora</p>
                  <p className="text-[6px] lg:text-[8px] text-blue-600 font-bold truncate max-w-[80px]">Ver Oferta</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 1. News Ticker (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 h-12 lg:h-16 bg-blue-600/90 backdrop-blur-md flex items-center overflow-hidden z-50 border-t border-blue-400/30">
          <div className="bg-white text-blue-600 h-full px-6 lg:px-10 flex items-center gap-3 z-10 shadow-[20px_0_40px_rgba(0,0,0,0.3)]">
            <Wind className="w-5 h-5 lg:w-6 lg:h-6 animate-pulse" />
            <span className="text-xs lg:text-sm font-black uppercase tracking-widest whitespace-nowrap">Últimas Notícias</span>
          </div>
          <div className="flex-grow overflow-hidden relative">
            <div className="flex animate-ticker whitespace-nowrap items-center h-full">
              {news.map((item, idx) => (
                <span key={idx} className="text-white text-xs lg:text-sm font-bold uppercase tracking-widest mx-10 flex items-center gap-4">
                  <div className="w-2 h-2 bg-white/30 rounded-full" />
                  {item}
                </span>
              ))}
              {/* Duplicate for seamless loop */}
              {news.map((item, idx) => (
                <span key={`dup-${idx}`} className="text-white text-xs lg:text-sm font-bold uppercase tracking-widest mx-10 flex items-center gap-4">
                  <div className="w-2 h-2 bg-white/30 rounded-full" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      <aside className="w-full lg:w-[20%] lg:min-w-[320px] h-[30%] lg:h-full bg-[#05070a] flex lg:flex-col z-30 shadow-[-40px_0_100px_rgba(0,0,0,1)]">
        
        <section className="hidden lg:flex flex-col p-[2.5vw] border-b border-white/10 bg-gradient-to-br from-[#0a0d14] to-transparent shrink-0 group/sidebar">
          <div className="flex items-start justify-between mb-4">
             <div className="w-8 h-8 lg:w-12 lg:h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-600/20">
                <Tv className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
             </div>
             <button 
               onClick={handleExit}
               className="cursor-pointer opacity-20 hover:opacity-100 p-3 bg-white/5 hover:bg-red-600 rounded-2xl transition-all group/btn"
             >
                <ArrowRight className="w-5 h-5 text-white group-hover/btn:translate-x-1 transition-transform" />
             </button>
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,10rem)] font-black tracking-tighter leading-none text-white flex items-center gap-2">
            <Clock className="w-[1.5vw] h-[1.5vw] text-blue-500" />
            {formatTime(time)}
          </h1>
          <div className="mt-2 space-y-1">
             <p className="text-gray-400 text-[1.2vw] font-bold capitalize">{weekday}</p>
             <p className="text-blue-500 text-[0.8vw] font-black tracking-[0.4em] uppercase">{dayMonth}</p>
          </div>
        </section>

        <section className="flex-grow flex flex-row lg:flex-col items-center justify-center p-4 lg:p-[2vw] gap-4 lg:gap-10">
          <div className="relative shrink-0">
            <div className="absolute -inset-4 lg:-inset-[4vw] bg-blue-600/10 blur-[5vw] rounded-full" />
            <div className="w-12 h-12 lg:w-[7vw] lg:h-[7vw] drop-shadow-2xl">
              <WeatherIcon temp={weather.temp} />
            </div>
          </div>
          <div className="text-left lg:text-center space-y-1">
            <div className="flex items-center lg:justify-center gap-2">
              <Thermometer className="w-4 h-4 text-blue-500 hidden lg:block" />
              <div className="text-3xl lg:text-[4.5vw] font-black text-white leading-none">{weather.temp}°</div>
            </div>
            <p className="text-gray-400 text-[10px] lg:text-[0.9vw] font-black uppercase tracking-widest truncate max-w-[120px] lg:max-w-none flex items-center gap-1 lg:justify-center">
              <MapPin className="w-2 h-2 lg:w-3 lg:h-3 text-blue-500" />
              {weather.city}
            </p>
          </div>
          <div className="lg:hidden ml-auto flex items-center gap-4">
             <div className="text-right">
                <div className="text-2xl font-black text-white leading-none">{formatTime(time)}</div>
                <p className="text-blue-500 text-[7px] font-black tracking-widest uppercase mt-1">{dayMonth}</p>
             </div>
             <button onClick={handleExit} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 active:bg-red-600 transition-colors">
                <ArrowRight className="w-5 h-5 text-white" />
             </button>
          </div>
        </section>

        <section className="hidden lg:block p-[2vw] bg-black/40 border-t border-white/10 shrink-0">
          <h3 className="text-[0.7vw] font-black uppercase tracking-[0.4em] text-gray-600 mb-6">PRÓXIMAS MÍDIAS</h3>
          <div className="space-y-4">
            {activeItems.slice(0, 3).map((item, idx) => (
              <div key={item.id} className={`flex gap-3 items-center transition-all ${idx === currentIndex % 3 ? 'opacity-100' : 'opacity-20 grayscale blur-[1px]'}`}>
                <div className="w-0.5 h-8 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,1)]" />
                <div className="min-w-0">
                  <p className="text-white text-[1vw] font-black truncate uppercase tracking-tighter leading-none">{item.title}</p>
                  <p className="text-blue-500/80 text-[0.6vw] font-black tracking-widest mt-1 uppercase">DURAÇÃO: {item.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="hidden lg:block p-3 text-center border-t border-white/5 bg-black">
           <span className="text-[0.5vw] text-blue-500/20 font-black tracking-[1em] uppercase">LINK ATIVO</span>
        </div>
      </aside>

      <style>{`
        @keyframes ken-burns {
          0% { transform: scale(1.0); }
          50% { transform: scale(1.1) translate(-0.5%, -0.5%); }
          100% { transform: scale(1.0); }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ken-burns { animation: ken-burns 60s ease-in-out infinite; }
        .animate-ticker { animation: ticker 40s linear infinite; }
        ::-webkit-scrollbar { width: 0px; }
        body { background-color: black; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default DisplayView;
