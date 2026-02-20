
import React from 'react';
import { Schedule, TimeSlot } from '../types';
import { Clock, Plus, Trash2 } from 'lucide-react';

interface ScheduleEditorProps {
  schedule: Schedule;
  onChange: (schedule: Schedule) => void;
}

const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ schedule, onChange }) => {
  const daysOfWeek = [
    { label: 'Dom', value: 0 },
    { label: 'Seg', value: 1 },
    { label: 'Ter', value: 2 },
    { label: 'Qua', value: 3 },
    { label: 'Qui', value: 4 },
    { label: 'Sex', value: 5 },
    { label: 'Sáb', value: 6 },
  ];

  const toggleDay = (day: number) => {
    const days = schedule.daysOfWeek || [];
    const newDays = days.includes(day)
      ? days.filter(d => d !== day)
      : [...days, day].sort();
    
    onChange({ ...schedule, daysOfWeek: newDays });
  };

  const addTimeSlot = () => {
    const newSlot: TimeSlot = { start: '09:00', end: '17:00' };
    onChange({
      ...schedule,
      timeSlots: [...(schedule.timeSlots || []), newSlot]
    });
  };

  const removeTimeSlot = (index: number) => {
    const newSlots = schedule.timeSlots.filter((_, i) => i !== index);
    onChange({ ...schedule, timeSlots: newSlots });
  };

  const updateTimeSlot = (index: number, field: 'start' | 'end', value: string) => {
    const newSlots = [...schedule.timeSlots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    onChange({ ...schedule, timeSlots: newSlots });
  };

  return (
    <div className="space-y-6 bg-[#0d1117] border border-white/10 rounded-2xl p-6">
      {/* Enable/Disable Schedule */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-500" />
          <div>
            <h3 className="text-sm font-bold text-white">Agendamento Avançado</h3>
            <p className="text-xs text-gray-500">Configure horários e dias específicos</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={schedule.enabled}
            onChange={(e) => onChange({ ...schedule, enabled: e.target.checked })}
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {schedule.enabled && (
        <>
          {/* Days of Week */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
              Dias da Semana
            </label>
            <div className="flex gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    (schedule.daysOfWeek || []).includes(day.value)
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-[#161b22] text-gray-500 hover:bg-[#1c2128] hover:text-white'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Horários
              </label>
              <button
                type="button"
                onClick={addTimeSlot}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-lg text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar
              </button>
            </div>

            <div className="space-y-3">
              {(schedule.timeSlots || []).length === 0 ? (
                <div className="text-center py-8 bg-[#161b22] rounded-xl border border-white/5">
                  <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 font-semibold">Nenhum horário configurado</p>
                  <p className="text-xs text-gray-600 mt-1">Clique em "Adicionar" para criar um horário</p>
                </div>
              ) : (
                schedule.timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-3 bg-[#161b22] p-4 rounded-xl border border-white/5">
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                          Início
                        </label>
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateTimeSlot(index, 'start', e.target.value)}
                          className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                          Fim
                        </label>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateTimeSlot(index, 'end', e.target.value)}
                          className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(index)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Remover horário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Preview */}
          {schedule.daysOfWeek.length > 0 && schedule.timeSlots.length > 0 && (
            <div className="bg-blue-600/5 border border-blue-500/20 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-400 mb-2">📅 Resumo do Agendamento</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Esta mídia será exibida nos dias:{' '}
                <span className="text-white font-semibold">
                  {schedule.daysOfWeek.map(d => daysOfWeek[d].label).join(', ')}
                </span>
                {' '}nos horários:{' '}
                <span className="text-white font-semibold">
                  {schedule.timeSlots.map(s => `${s.start} - ${s.end}`).join(', ')}
                </span>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ScheduleEditor;
