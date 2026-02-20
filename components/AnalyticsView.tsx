
import React, { useMemo } from 'react';
import { PlaylistItem, AdvertiserStats, MediaStats, ScreenHealth } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Clock, Users, Activity, Wifi, WifiOff } from 'lucide-react';

interface AnalyticsViewProps {
  playlist: PlaylistItem[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#14b8a6'];

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ playlist }) => {
  
  // Simular dados de analytics (em produção, isso viria de um backend)
  const analyticsData = useMemo(() => {
    // Calcular estatísticas por anunciante
    const advertiserMap = new Map<string, AdvertiserStats>();
    const mediaStatsArray: MediaStats[] = [];
    
    playlist.forEach((item, index) => {
      const existing = advertiserMap.get(item.advertiser) || {
        advertiser: item.advertiser,
        totalExposureMinutes: 0,
        mediaCount: 0,
        plays: 0
      };
      
      // Simular dados de exposição baseado na duração
      const durationMinutes = parseInt(item.duration) || 30;
      const simulatedPlays = Math.floor(Math.random() * 500) + 100;
      const exposureMinutes = (durationMinutes * simulatedPlays) / 60;
      
      advertiserMap.set(item.advertiser, {
        advertiser: item.advertiser,
        totalExposureMinutes: existing.totalExposureMinutes + exposureMinutes,
        mediaCount: existing.mediaCount + 1,
        plays: existing.plays + simulatedPlays
      });
      
      // Stats por mídia
      mediaStatsArray.push({
        id: item.id,
        title: item.title,
        advertiser: item.advertiser,
        plays: simulatedPlays,
        totalExposureMinutes: exposureMinutes,
        lastPlayed: new Date(Date.now() - Math.random() * 86400000)
      });
    });
    
    return {
      advertiserStats: Array.from(advertiserMap.values()).sort((a, b) => b.totalExposureMinutes - a.totalExposureMinutes),
      mediaStats: mediaStatsArray.sort((a, b) => b.plays - a.plays).slice(0, 10)
    };
  }, [playlist]);

  // Simular health da tela
  const screenHealth: ScreenHealth = {
    online: true,
    lastSync: new Date(),
    uptime: 14320 // minutos
  };

  // Dados para o gráfico de linha (últimos 7 dias)
  const weeklyData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days.map((day, index) => ({
      day,
      plays: Math.floor(Math.random() * 1000) + 500,
      exposureHours: Math.floor(Math.random() * 20) + 10
    }));
  }, []);

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#010409] p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Analytics & Insights</h1>
        <p className="text-gray-500 font-semibold">Análise detalhada de performance e estatísticas</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">+12%</span>
          </div>
          <p className="text-2xl font-black text-white mb-1">
            {analyticsData.mediaStats.reduce((sum, m) => sum + m.plays, 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 font-bold">Total de Reproduções</p>
        </div>

        <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-600/10 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">+8%</span>
          </div>
          <p className="text-2xl font-black text-white mb-1">
            {formatMinutes(analyticsData.advertiserStats.reduce((sum, a) => sum + a.totalExposureMinutes, 0))}
          </p>
          <p className="text-xs text-gray-500 font-bold">Tempo Total de Exposição</p>
        </div>

        <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-pink-600/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-pink-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mb-1">
            {analyticsData.advertiserStats.length}
          </p>
          <p className="text-xs text-gray-500 font-bold">Anunciantes Ativos</p>
        </div>

        <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-12 h-12 ${screenHealth.online ? 'bg-green-600/10' : 'bg-red-600/10'} rounded-xl flex items-center justify-center`}>
              {screenHealth.online ? (
                <Wifi className="w-6 h-6 text-green-500" />
              ) : (
                <WifiOff className="w-6 h-6 text-red-500" />
              )}
            </div>
            <span className={`text-xs font-bold ${screenHealth.online ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'} px-2 py-1 rounded-lg`}>
              {screenHealth.online ? 'Online' : 'Offline'}
            </span>
          </div>
          <p className="text-2xl font-black text-white mb-1">
            {formatMinutes(screenHealth.uptime)}
          </p>
          <p className="text-xs text-gray-500 font-bold">Uptime da Tela</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exposição por Anunciante */}
        <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-1">Exposição por Anunciante</h3>
            <p className="text-xs text-gray-500 font-semibold">Tempo total de exposição em minutos</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.advertiserStats.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2128" />
              <XAxis 
                dataKey="advertiser" 
                stroke="#6e7681" 
                tick={{ fill: '#6e7681', fontSize: 11, fontWeight: 600 }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#6e7681" 
                tick={{ fill: '#6e7681', fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#161b22', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  fontWeight: 600
                }}
                labelStyle={{ color: '#fff', fontWeight: 700 }}
                itemStyle={{ color: '#3b82f6' }}
                formatter={(value: number) => [formatMinutes(value), 'Exposição']}
              />
              <Bar dataKey="totalExposureMinutes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por Anunciante (Pie) */}
        <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-1">Distribuição por Anunciante</h3>
            <p className="text-xs text-gray-500 font-semibold">Porcentagem de exposição</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.advertiserStats.slice(0, 7)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ advertiser, percent }) => `${advertiser} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="totalExposureMinutes"
              >
                {analyticsData.advertiserStats.slice(0, 7).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#161b22', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  fontWeight: 600
                }}
                formatter={(value: number) => [formatMinutes(value), 'Exposição']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-1">Tendência Semanal</h3>
          <p className="text-xs text-gray-500 font-semibold">Reproduções e exposição nos últimos 7 dias</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c2128" />
            <XAxis 
              dataKey="day" 
              stroke="#6e7681" 
              tick={{ fill: '#6e7681', fontSize: 12, fontWeight: 600 }}
            />
            <YAxis 
              yAxisId="left"
              stroke="#6e7681" 
              tick={{ fill: '#6e7681', fontSize: 11, fontWeight: 600 }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#6e7681" 
              tick={{ fill: '#6e7681', fontSize: 11, fontWeight: 600 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#161b22', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '12px',
                fontWeight: 600
              }}
              labelStyle={{ color: '#fff', fontWeight: 700 }}
            />
            <Legend 
              wrapperStyle={{ fontWeight: 600, fontSize: 12 }}
              iconType="circle"
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="plays" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Reproduções"
              dot={{ fill: '#3b82f6', r: 5 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="exposureHours" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              name="Exposição (horas)"
              dot={{ fill: '#8b5cf6', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Mídias */}
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-1">Top 10 Mídias Mais Reproduzidas</h3>
          <p className="text-xs text-gray-500 font-semibold">Rankings por número de reproduções</p>
        </div>
        
        <div className="space-y-3">
          {analyticsData.mediaStats.map((media, index) => (
            <div key={media.id} className="flex items-center gap-4 bg-[#161b22] p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                index === 0 ? 'bg-yellow-600 text-white' :
                index === 1 ? 'bg-gray-400 text-white' :
                index === 2 ? 'bg-orange-600 text-white' :
                'bg-[#0d1117] text-gray-500'
              }`}>
                {index + 1}
              </div>
              
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white mb-0.5">{media.title}</h4>
                <p className="text-xs text-gray-500 font-semibold">{media.advertiser}</p>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-black text-white">{media.plays.toLocaleString()}</p>
                <p className="text-xs text-gray-500 font-semibold">reproduções</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-bold text-blue-500">{formatMinutes(media.totalExposureMinutes)}</p>
                <p className="text-xs text-gray-500 font-semibold">exposição</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
