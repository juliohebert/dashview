
import React from 'react';
import { PlaylistItem } from '../types';

interface MediaCardProps {
  item: PlaylistItem;
  isReorderMode?: boolean;
  order?: number;
  onOrderChange?: (newOrder: number) => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, isReorderMode, order, onOrderChange, onEditClick, onDeleteClick }) => {
  const isLocal = item.mediaUrl?.startsWith('data:');

  return (
    <div className={`bg-[#161b22] border rounded-2xl overflow-hidden group transition-all duration-300 flex flex-col shadow-lg ${isReorderMode ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-white/5 hover:border-blue-500/50'}`}>
      <div className="relative aspect-video overflow-hidden bg-[#0d1117]">
        <img 
          src={item.thumbnail} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" 
        />
        
        {isReorderMode && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 p-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Posição</span>
            <input 
              type="number"
              min="1"
              value={order}
              onChange={(e) => onOrderChange?.(parseInt(e.target.value) || 1)}
              className="w-20 h-14 bg-white text-black text-center text-2xl font-black rounded-2xl border-none ring-4 ring-blue-500/50 focus:ring-blue-500 transition-all"
            />
          </div>
        )}

        <div className="absolute top-3 left-3 flex gap-2">
          {!isReorderMode && (
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">
              #{order}
            </span>
          )}
          {(item.mediaUrl || isLocal) && (
            <span className={`${isLocal ? 'bg-orange-600' : 'bg-green-600'} text-white px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1`}>
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              {isLocal ? 'LOCAL' : 'HD'}
            </span>
          )}
          <span className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border border-white/10">
            {item.type}
          </span>
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="bg-blue-600/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">
            {item.duration}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{item.advertiser}</div>
          <h3 className="text-white font-bold text-lg leading-tight mb-4 group-hover:text-blue-400 transition-colors">{item.title}</h3>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${item.status === 'Ativo' ? 'text-green-500' : 'text-gray-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Ativo' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            {item.status}
          </span>
          
          <div className="flex gap-2 relative z-10">
            {!isReorderMode && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick?.();
                  }}
                  className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                  title="Editar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick?.();
                  }}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                  title="Excluir"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
