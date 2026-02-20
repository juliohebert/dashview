
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

interface SidebarProps {
  activeSection: 'playlist' | 'analytics';
  onSectionChange: (section: 'playlist' | 'analytics') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { usuario, logout } = useAuth();
  const menuItems = [
    { 
      id: 'playlist' as const,
      icon: <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />, 
      label: 'Gestão de Playlist',
      emoji: '📋'
    },
    { 
      id: 'analytics' as const,
      icon: <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />, 
      label: 'Analytics & Insights',
      emoji: '📊'
    },
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
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${
              activeSection === item.id
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/10' 
                : 'text-gray-500 hover:bg-[#161b22] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <svg className={`w-5 h-5 transition-colors ${activeSection === item.id ? 'text-white' : 'text-gray-500 group-hover:text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {item.icon}
              </svg>
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </div>
            <span className="text-lg">{item.emoji}</span>
          </button>
        ))}
        
        {/* Divider */}
        <div className="py-2">
          <div className="h-px bg-white/5"></div>
        </div>
        
        {/* Placeholder para futuras funcionalidades */}
        <div className="px-6 py-4 rounded-2xl bg-[#161b22]/50 border border-white/5 border-dashed">
          <p className="text-xs text-gray-600 font-bold text-center">Mais recursos em breve...</p>
        </div>
      </nav>

      <div className="p-4 mt-auto space-y-3">
        {/* Informações do Usuário */}
        <div className="bg-[#161b22] p-4 rounded-2xl border border-white/5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{usuario?.nome}</p>
              <p className="text-xs text-gray-500 truncate">{usuario?.email}</p>
              <p className="text-[9px] text-gray-600 uppercase tracking-wider mt-1">{usuario?.tenantNome}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 py-2.5 rounded-xl text-xs font-bold text-red-400 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair do Sistema
          </button>
        </div>
        
        {/* Info Card */}
        <div className="bg-[#161b22] p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black tracking-widest text-gray-400 uppercase">Plano Enterprise</span>
          </div>
          <p className="text-xs text-gray-500 font-bold leading-relaxed">Seu painel está sincronizado em tempo real.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
