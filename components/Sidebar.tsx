
import React from 'react';

const Sidebar: React.FC = () => {
  const menuItems = [
    { icon: <path d="M4 6h16M4 12h16m-7 6h7" />, label: 'Dashboard', active: true },
    { icon: <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />, label: 'Playlists Ativas', active: false },
    { icon: <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />, label: 'Gestão de Mídia', active: false },
    { icon: <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />, label: 'Monitorar Telas', active: false },
    { icon: <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />, label: 'Configurações', active: false },
  ];

  return (
    <aside className="w-72 bg-[#0d1117] border-r border-white/5 flex flex-col flex-shrink-0 h-screen sticky top-0">
      <div className="p-8 flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight leading-none text-white">DashView</h2>
          <span className="text-[9px] text-gray-500 font-black tracking-[0.2em] uppercase">Enterprise Management</span>
        </div>
      </div>

      <nav className="flex-grow px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${
              item.active 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/10' 
                : 'text-gray-500 hover:bg-[#161b22] hover:text-white'
            }`}
          >
            <svg className={`w-5 h-5 transition-colors ${item.active ? 'text-white' : 'text-gray-500 group-hover:text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {item.icon}
            </svg>
            <span className="font-bold text-sm tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-[#161b22] p-4 rounded-3xl border border-white/5 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
               <span className="text-[9px] font-black tracking-widest text-gray-400 uppercase">Plano Enterprise</span>
            </div>
            <p className="text-xs text-gray-500 font-bold mb-4 leading-relaxed">Seu painel está sincronizado com 12 telas em tempo real.</p>
            <button className="w-full bg-white/5 hover:bg-white/10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all border border-white/5">
              Falar com Suporte
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
