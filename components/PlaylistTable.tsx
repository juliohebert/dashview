
import React from 'react';
import { PlaylistItem } from '../types';

interface PlaylistTableProps {
  items: PlaylistItem[];
  onEdit: (item: PlaylistItem) => void;
  onDelete: (id: string) => void;
}

const PlaylistTable: React.FC<PlaylistTableProps> = ({ items, onEdit, onDelete }) => {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead className="text-[10px] text-gray-600 font-black uppercase tracking-widest">
          <tr>
            <th className="px-6 py-4">Miniatura</th>
            <th className="px-6 py-4">Anunciante / Título</th>
            <th className="px-6 py-4">Duração</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="">
          {items.map((item) => (
            <tr key={item.id} className="group bg-[#161b22] hover:bg-[#1c2128] transition-colors rounded-2xl">
              <td className="px-6 py-4 first:rounded-l-2xl">
                <div className="w-20 h-12 rounded-xl overflow-hidden ring-1 ring-white/10 group-hover:ring-blue-500/50 transition-all bg-[#0d1117] flex items-center justify-center">
                   {item.thumbnail ? (
                     <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                   ) : (
                     <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                   )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="font-bold text-white text-sm leading-tight mb-0.5">{item.title}</div>
                <div className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">{item.advertiser} • {item.type}</div>
              </td>
              <td className="px-6 py-4">
                <span className="text-gray-400 font-bold text-xs">{item.duration}</span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${
                  item.status === 'Ativo' 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                    : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right last:rounded-r-2xl">
                <div className="flex items-center justify-end gap-1 relative z-10">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
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
                      onDelete(item.id);
                    }}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                    title="Excluir"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlaylistTable;
