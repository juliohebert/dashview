
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PlaylistItem, WeatherData } from '../types';

interface DisplayViewProps {
  playlist?: PlaylistItem[];
}

const DisplayView: React.FC<DisplayViewProps> = ({ playlist = [] }) => {
  const [time, setTime] = useState(new Date());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [weather, setWeather] = useState<WeatherData>({ temp: 22, condition: 'Parcial', city: 'Carregando...' });
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeItems = useMemo(() => 
    playlist.filter(item => item.status === 'Ativo'),
  [playlist]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  useEffect(() => {
    if (activeItems.length === 0) return;
    const currentItem = activeItems[currentIndex];
    const durationMs = (parseInt(currentItem?.duration) || 10) * 1000;
    const fadeOutTimer = setTimeout(() => setFade(false), durationMs - 1200);
    const switchTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeItems.length);
      setFade(true);
    }, durationMs);
    return () => { clearTimeout(fadeOutTimer); clearTimeout(switchTimer); };
  }, [currentIndex, activeItems]);

  const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
  const formatDate = (date: Date) => {
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    const dayMonth = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }).toUpperCase();
    return { weekday, dayMonth };
  };

  const handleExit = () => {
    window.location.hash = 'dashboard';
  };

  const { weekday, dayMonth } = formatDate(time);
  const currentItem = activeItems[currentIndex];

  if (activeItems.length === 0) {
    return (
      <div className="flex h-screen w-screen bg-black items-center justify-center font-inter p-10">
        <div className="text-center animate-pulse space-y-6">
          <div className="w-32 h-32 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-600/20">
             <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Aguardando Playlist</h2>
          <button onClick={handleExit} className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all">Voltar ao Painel</button>
        </div>
      </div>
    );
  }

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = currentItem?.mediaUrl ? getYouTubeId(currentItem.mediaUrl) : null;
  const isVideo = currentItem?.type === 'Video' || currentItem?.mediaUrl?.toLowerCase().endsWith('.mp4');

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-black overflow-hidden cursor-none select-none font-inter">
      
      <main className="relative flex-grow h-full bg-black overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
        <div className={`w-full h-full transition-all duration-[1200ms] ease-out ${fade ? 'opacity-100 scale-100' : 'opacity-0 scale-105 blur-lg'}`}>
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

          <div className="absolute bottom-[5vh] lg:bottom-[10vh] left-[5vw] right-[5vw] max-w-[90%] lg:max-w-[70%] space-y-[1.5vh]">
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 px-4 py-1.5 lg:px-[1.5vw] lg:py-[0.5vw] rounded-lg lg:rounded-[0.8vw] text-sm lg:text-[1.2vw] font-black uppercase tracking-widest text-white shadow-xl border border-blue-400/30">
                {currentItem?.advertiser}
              </span>
              <span className="bg-white/10 backdrop-blur-xl px-3 py-1 rounded-lg text-[10px] lg:text-[0.8vw] font-bold text-white/70 border border-white/10 uppercase">
                Em Exibição
              </span>
            </div>
            <h2 className="text-[clamp(2rem,6vh,8vh)] lg:text-[clamp(3.5rem,8vw,14rem)] font-black text-white tracking-tighter leading-[0.85] uppercase drop-shadow-2xl">
              {currentItem?.title}
            </h2>
          </div>
        </div>
      </main>

      <aside className="w-full lg:w-[20%] lg:min-w-[320px] h-[30%] lg:h-full bg-[#05070a] flex lg:flex-col z-30 shadow-[-40px_0_100px_rgba(0,0,0,1)]">
        
        <section className="hidden lg:flex flex-col p-[2.5vw] border-b border-white/10 bg-gradient-to-br from-[#0a0d14] to-transparent shrink-0 group/sidebar">
          <div className="flex items-start justify-between mb-4">
             <div className="w-8 h-8 lg:w-12 lg:h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-600/20">
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
             </div>
             <button 
               onClick={handleExit}
               className="cursor-pointer opacity-20 hover:opacity-100 p-3 bg-white/5 hover:bg-red-600 rounded-2xl transition-all group/btn"
             >
                <svg className="w-5 h-5 text-white group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
             </button>
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,10rem)] font-black tracking-tighter leading-none text-white">{formatTime(time)}</h1>
          <div className="mt-2 space-y-1">
             <p className="text-gray-400 text-[1.2vw] font-bold capitalize">{weekday}</p>
             <p className="text-blue-500 text-[0.8vw] font-black tracking-[0.4em] uppercase">{dayMonth}</p>
          </div>
        </section>

        <section className="flex-grow flex flex-row lg:flex-col items-center justify-center p-4 lg:p-[2vw] gap-4 lg:gap-10">
          <div className="relative shrink-0">
            <div className="absolute -inset-4 lg:-inset-[4vw] bg-blue-600/10 blur-[5vw] rounded-full" />
            <svg className="w-12 h-12 lg:w-[7vw] lg:h-[7vw] text-blue-500 drop-shadow-2xl" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
              <path d="M12 3v1m0 16v1m9-9h1M3 12h1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-left lg:text-center space-y-1">
            <div className="text-3xl lg:text-[4.5vw] font-black text-white leading-none">{weather.temp}°</div>
            <p className="text-gray-400 text-[10px] lg:text-[0.9vw] font-black uppercase tracking-widest truncate max-w-[120px] lg:max-w-none">
              {weather.city}
            </p>
          </div>
          <div className="lg:hidden ml-auto flex items-center gap-4">
             <div className="text-right">
                <div className="text-2xl font-black text-white leading-none">{formatTime(time)}</div>
                <p className="text-blue-500 text-[7px] font-black tracking-widest uppercase mt-1">{dayMonth}</p>
             </div>
             <button onClick={handleExit} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 active:bg-red-600 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
        .animate-ken-burns { animation: ken-burns 60s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 0px; }
        body { background-color: black; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default DisplayView;
