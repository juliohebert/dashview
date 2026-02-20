
import React from 'react';
import { PlaylistItem } from '../types';

interface MobileMediaCardProps {
  item: PlaylistItem;
  onToggleStatus: (id: string) => void;
  isReorderMode?: boolean;
  order?: number;
  onOrderChange?: (newOrder: number) => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

const MobileMediaCard: React.FC<MobileMediaCardProps> = ({ 
  item, 
  onToggleStatus, 
  isReorderMode, 
  order,
  onOrderChange,
  onEditClick,
  onDeleteClick
}) => {
  const isActive = item.status === 'Ativo';

  return (
    <div 
      className={`bg-[#161b22] border rounded-3xl p-4 flex items-center gap-4 shadow-xl transition-all ${isReorderMode ? 'border-blue-500 scale-[1.02]' : 'border-white/5'}`}
      onClick={() => !isReorderMode && onEditClick?.()}
    >
      
      {isReorderMode ? (
        <div className="flex flex-col items-center justify-center gap-1 min-w-[50px]">
           <span className="text-[8px] font-black uppercase text-blue-400">POS</span>
           <input 
              type="number"
              min="1"
              value={order}
              onChange={(e) => {
                e.stopPropagation();
                onOrderChange?.(parseInt(e.target.value) || 1);
              }}
              className="w-12 h-10 bg-white text-black text-center text-lg font-black rounded-xl border-none ring-2 ring-blue-500/30 focus:ring-blue-500"
           />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5">
           <span className="text-xs font-black text-gray-500">#{order}</span>
        </div>
      )}

      <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-black">
        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover opacity-80" />
      </div>

      <div className="flex-grow min-w-0">
        <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest truncate mb-0.5">{item.advertiser}</div>
        <h3 className="text-white font-bold text-sm truncate">{item.title}</h3>
        <div className="flex items-center gap-2 mt-1">
           <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-green-500' : 'text-gray-500'}`}>
             {isActive ? 'Ativo' : 'Pausado'}
           </span>
        </div>
      </div>

      {!isReorderMode && (
        <div className="flex gap-2 relative z-10">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick?.();
            }}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(item.id);
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isActive 
                ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                : 'bg-green-500/10 text-green-500 border border-green-500/20'
            }`}
          >
            {isActive ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MobileMediaCard;
