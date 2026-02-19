
import React from 'react';
import { PlaylistItem } from '../types';

interface PlaylistTableProps {
  items: PlaylistItem[];
}

const PlaylistTable: React.FC<PlaylistTableProps> = ({ items }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left">
        <thead className="text-[10px] text-gray-600 font-black uppercase tracking-widest border-b border-white/5">
          <tr>
            <th className="px-8 py-4">Miniatura</th>
            <th className="px-8 py-4">Anunciante / Título</th>
            <th className="px-8 py-4">Duração</th>
            <th className="px-8 py-4">Status</th>
            <th className="px-8 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {items.map((item) => (
            <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
              <td className="px-8 py-6">
                <div className="w-24 h-14 rounded-xl overflow-hidden ring-1 ring-white/10 group-hover:ring-blue-500/50 transition-all bg-[#0d1117] flex items-center justify-center">
                   {item.thumbnail ? (
                     <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                   ) : (
                     <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                   )}
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="font-bold text-white text-base leading-tight mb-1">{item.title}</div>
                <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">{item.advertiser} • {item.type}</div>
              </td>
              <td className="px-8 py-6">
                <span className="text-gray-400 font-bold text-sm">{item.duration}</span>
              </td>
              <td className="px-8 py-6">
                <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                  item.status === 'Ativo' 
                    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                    : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
