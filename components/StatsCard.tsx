
import React from 'react';

interface StatsCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon }) => {
  return (
    <div className="bg-[#161b22] border border-white/5 rounded-3xl p-8 flex items-center gap-6 group hover:border-blue-500/30 transition-all">
      <div className="w-16 h-16 rounded-2xl bg-[#21262d] flex items-center justify-center text-blue-500 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase mb-1">{label}</p>
        <h3 className="text-2xl font-black tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

export default StatsCard;
