
import React from 'react';
import { MAIN_DISPLAY_IMAGE } from '../constants';

const LivePreview: React.FC = () => {
  return (
    <div className="relative w-full lg:w-[480px] h-[270px] bg-[#0b0e14] rounded-2xl overflow-hidden shadow-inner ring-4 ring-[#21262d] flex-shrink-0 group">
      <img 
        src={MAIN_DISPLAY_IMAGE} 
        alt="Live Preview" 
        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      
      {/* Mocking the Display Elements in Mini */}
      <div className="absolute top-4 left-4 scale-50 origin-top-left">
        <div className="bg-black/40 backdrop-blur px-3 py-1 rounded text-xs font-bold border border-white/20 uppercase tracking-widest">
          AO VIVO
        </div>
      </div>

      <div className="absolute top-4 right-4 flex flex-col items-end scale-[0.6] origin-top-right">
        <span className="text-4xl font-black">14:45</span>
        <span className="text-blue-500 font-bold uppercase tracking-widest">23 Out</span>
      </div>

      <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-white/10">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
        Live Preview
      </div>
    </div>
  );
};

export default LivePreview;
