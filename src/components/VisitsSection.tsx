/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Camera, 
  User, 
  Compass,
  List,
  CalendarDays,
  ArrowLeft
} from 'lucide-react';
import { DB } from '../services/db';
import { Visit, Pharmacy, User as UserType } from '../types';

interface VisitsSectionProps {
  currentUser: UserType;
  preSelectedPharmacyId?: string | null;
  onClearPreSelection?: () => void;
}

export default function VisitsSection({ currentUser, preSelectedPharmacyId, onClearPreSelection }: VisitsSectionProps) {
  const visits = DB.getVisits();
  const pharmacies = DB.getPharmacies().filter(p => p.status === 'active' && (currentUser.roleType === 'admin' || p.assignedSellerId === currentUser.id));
  const sellers = DB.getUsers().filter(u => u.roleType === 'seller');

  // View state
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'schedule'>('calendar');
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed (July = 6)

  // Filters
  const [filterCity, setFilterCity] = useState('');
  const [filterSeller, setFilterSeller] = useState('');

  // Form scheduling inputs
  const [formPharmacyId, setFormPharmacyId] = useState(preSelectedPharmacyId || '');
  const [formDate, setFormDate] = useState('2026-07-02');
  const [formTime, setFormTime] = useState('10:00');
  const [formObjective, setFormObjective] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Notifications inside section
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal / Reschedule State
  const [reschedulingVisitId, setReschedulingVisitId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('2026-07-02');
  const [rescheduleTime, setRescheduleTime] = useState('11:00');

  // Calendar setup helpers
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Filtered visits for view
  const visibleVisits = visits.filter(v => {
    // Role permissions
    if (currentUser.roleType === 'seller' && v.sellerId !== currentUser.id) return false;

    // Filters
    const ph = pharmacies.find(p => p.id === v.pharmacyId);
    if (!ph) return false;

    if (filterCity && ph.city !== filterCity) return false;
    if (currentUser.roleType === 'admin' && filterSeller && v.sellerId !== filterSeller) return false;

    return true;
  });

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formPharmacyId || !formDate || !formTime || !formObjective) {
      setErrorMsg('Preencha os campos obrigatórios (*).');
      return;
    }

    try {
      DB.scheduleVisit({
        companyId: 'company-1',
        pharmacyId: formPharmacyId,
        sellerId: currentUser.id,
        scheduledDate: formDate,
        scheduledTime: formTime,
        objective: formObjective,
        notes: formNotes
      });

      setSuccessMsg('Visita agendada e salva com sucesso!');
      setFormObjective('');
      setFormNotes('');
      if (onClearPreSelection) onClearPreSelection();

      setTimeout(() => {
        setSuccessMsg('');
        setViewMode('calendar');
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao agendar visita.');
    }
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingVisitId) return;

    const original = visits.find(v => v.id === reschedulingVisitId);
    if (original) {
      DB.updateVisit({
        ...original,
        scheduledDate: rescheduleDate,
        scheduledTime: rescheduleTime,
        status: 'scheduled'
      });
      setReschedulingVisitId(null);
    }
  };

  const handleCancelVisit = (visitId: string) => {
    const original = visits.find(v => v.id === visitId);
    if (original) {
      DB.updateVisit({
        ...original,
        status: 'canceled'
      });
    }
  };

  const cities = Array.from(new Set(pharmacies.map(p => p.city)));

  // Generate days in month grid (Simplified representation for 2026 July - begins on Wednesday)
  // July 2026 starts on Wednesday, length is 31.
  const daysInMonth = 31;
  const firstDayIndex = 3; // Wednesday (Sunday = 0, Mon = 1, Tue = 2, Wed = 3)
  
  const calendarCells = [];
  // Empty slots for preceding month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  return (
    <div className="space-y-6" id="visits-calendar-section">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-3xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Agenda de Visitas</h1>
          <p className="text-xs text-gray-500 mt-1">Monitore compromissos, reagende visitas e confirme check-ins de representantes.</p>
        </div>
        <div className="flex gap-2 text-xs font-semibold">
          <button 
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1 cursor-pointer ${viewMode === 'calendar' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            <CalendarDays className="w-4 h-4" /> Calendário
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1 cursor-pointer ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            <List className="w-4 h-4" /> Lista
          </button>
          <button 
            onClick={() => { setViewMode('schedule'); setErrorMsg(''); setSuccessMsg(''); }}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Agendar Visita
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-3xs flex flex-col md:flex-row gap-3 text-xs">
        <select 
          className="border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
        >
          <option value="">Filtrar por Cidade</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {currentUser.roleType === 'admin' && (
          <select 
            className="border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
            value={filterSeller}
            onChange={(e) => setFilterSeller(e.target.value)}
          >
            <option value="">Filtrar por Representante</option>
            {sellers.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
          </select>
        )}
      </div>

      {/* 1. MONTHLY CALENDAR GRID VIEW */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar main structure */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-100 shadow-3xs space-y-4">
            
            {/* Calendar header control */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-50">
              <h2 className="font-bold text-gray-800 text-sm">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <div className="flex gap-1">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-50 rounded-lg border border-gray-200 cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={handleNextMonth} className="p-1 hover:bg-slate-50 rounded-lg border border-gray-200 cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Grid cells */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <span>Dom</span>
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 h-64 md:h-80">
              {calendarCells.map((cellDay, idx) => {
                if (cellDay === null) {
                  return <div key={`empty-${idx}`} className="bg-slate-50/50 rounded-lg" />;
                }

                // Match visits to this day (July 2026 format: e.g. "2026-07-02")
                const cellDateStr = `2026-07-${cellDay.toString().padStart(2, '0')}`;
                const cellVisits = visibleVisits.filter(v => v.scheduledDate === cellDateStr);

                return (
                  <div 
                    key={`day-${cellDay}`} 
                    className={`border border-gray-100 rounded-lg p-1.5 flex flex-col justify-between items-start text-[11px] group relative hover:border-indigo-300 transition-all ${
                      cellDay === 2 ? 'bg-indigo-50/40 border-indigo-200' : 'bg-white'
                    }`}
                  >
                    <span className={`font-bold ${cellDay === 2 ? 'text-indigo-600 bg-indigo-100 px-1.5 rounded-md' : 'text-gray-700'}`}>
                      {cellDay}
                    </span>

                    {/* Miniature dot counts or links */}
                    {cellVisits.length > 0 && (
                      <div className="w-full mt-1 space-y-0.5">
                        {cellVisits.slice(0, 2).map(v => {
                          const ph = pharmacies.find(p => p.id === v.pharmacyId);
                          return (
                            <div 
                              key={v.id} 
                              className={`text-[8px] font-bold px-1 py-0.2 rounded-sm truncate ${
                                v.status === 'completed' 
                                  ? 'bg-green-50 text-green-700 border border-green-100' 
                                  : (v.status === 'canceled' ? 'bg-red-50 text-red-700 line-through' : 'bg-amber-50 text-amber-700 border border-amber-100')
                              }`}
                              title={ph?.name}
                            >
                              {v.scheduledTime} {ph?.name.split(' ')[0]}
                            </div>
                          );
                        })}
                        {cellVisits.length > 2 && (
                          <div className="text-[7px] text-gray-400 font-bold">+{cellVisits.length - 2} mais</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick schedule detailed list in side */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs space-y-4">
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Clock className="w-4 h-4 text-indigo-500" />
              Agenda do Período
            </h3>

            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {visibleVisits.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate) || a.scheduledTime.localeCompare(b.scheduledTime)).map(visit => {
                const ph = pharmacies.find(p => p.id === visit.pharmacyId);
                if (!ph) return null;

                const isCompleted = visit.status === 'completed';
                const isCanceled = visit.status === 'canceled';

                return (
                  <div key={visit.id} className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-lg border border-slate-100 text-xs relative space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800">
                        {new Date(visit.scheduledDate).toLocaleDateString('pt-BR')} às {visit.scheduledTime}h
                      </span>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                        isCompleted ? 'bg-green-100 text-green-800' : (isCanceled ? 'bg-red-50 text-red-700' : 'bg-indigo-50 text-indigo-700')
                      }`}>
                        {visit.status === 'completed' ? 'Conclúida' : (visit.status === 'scheduled' ? 'Agendada' : (visit.status === 'in_progress' ? 'Em campo' : 'Cancelada'))}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{ph.name}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" /> {ph.address}, {ph.number} - {ph.city}
                      </p>
                    </div>

                    <p className="text-[11px] text-gray-600 italic">"Objetivo: {visit.objective}"</p>

                    {/* Reschedule/Cancel shortcuts */}
                    {!isCompleted && !isCanceled && (
                      <div className="flex justify-end gap-1.5 pt-2 border-t border-gray-100 text-[10px]">
                        <button 
                          onClick={() => handleCancelVisit(visit.id)}
                          className="text-red-500 hover:underline cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={() => {
                            setReschedulingVisitId(visit.id);
                            setRescheduleDate(visit.scheduledDate);
                            setRescheduleTime(visit.scheduledTime);
                          }}
                          className="text-indigo-500 hover:underline font-bold cursor-pointer"
                        >
                          Reagendar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. AGENDA DETAILED LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-3xs overflow-hidden">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Data/Hora</th>
                  <th className="p-4">Farmácia</th>
                  <th className="p-4">Responsável</th>
                  <th className="p-4">Objetivo / Resultado</th>
                  <th className="p-4 text-center">GPS / Timestamps</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
                {visibleVisits.map(visit => {
                  const ph = pharmacies.find(p => p.id === visit.pharmacyId);
                  if (!ph) return null;

                  return (
                    <tr key={visit.id} className="hover:bg-slate-50/40">
                      <td className="p-4 font-bold text-gray-900 whitespace-nowrap">
                        {new Date(visit.scheduledDate).toLocaleDateString('pt-BR')} <br />
                        <span className="text-[11px] font-semibold text-slate-400">{visit.scheduledTime}h</span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{ph.name}</div>
                        <span className="text-[10px] text-gray-400">{ph.city} - {ph.state}</span>
                      </td>
                      <td className="p-4 text-gray-500">{ph.responsibleName}</td>
                      <td className="p-4 max-w-xs">
                        <p className="text-gray-700 font-semibold truncate" title={visit.objective}>{visit.objective}</p>
                        {visit.result && (
                          <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ {visit.result}</p>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {visit.status === 'completed' && visit.checkInAt ? (
                          <div className="text-[10px] text-slate-500 space-y-0.5 font-mono">
                            <div>Check-In: {new Date(visit.checkInAt).toLocaleTimeString('pt-BR')}</div>
                            <div>Check-Out: {visit.checkOutAt ? new Date(visit.checkOutAt).toLocaleTimeString('pt-BR') : '-'}</div>
                            <div className="text-[9px] text-indigo-500 font-bold">Lat: {visit.checkInLatitude?.toFixed(4)} Lng: {visit.checkInLongitude?.toFixed(4)}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-bold text-[10px]">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          visit.status === 'completed' ? 'bg-green-50 text-green-700' : (visit.status === 'scheduled' ? 'bg-indigo-50 text-indigo-700' : 'bg-red-50 text-red-700')
                        }`}>
                          {visit.status === 'completed' ? 'Concluída' : (visit.status === 'scheduled' ? 'Agendada' : 'Cancelada')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SCHEDULE NEW VISIT FORM */}
      {viewMode === 'schedule' && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-3xs max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="font-bold text-gray-900 text-sm">Agendar Nova Visita Técnica / Comercial</h2>
            <button onClick={() => setViewMode('calendar')} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-0.5 cursor-pointer font-semibold">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          </div>

          {errorMsg && <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-xs">⚠️ {errorMsg}</div>}
          {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 text-xs">✓ {successMsg}</div>}

          <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-500 mb-1">Selecione Farmácia Cliente *</label>
              <select 
                className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 bg-white"
                value={formPharmacyId}
                onChange={(e) => setFormPharmacyId(e.target.value)}
              >
                <option value="">Selecione farmácia...</option>
                {pharmacies.map(ph => (
                  <option key={ph.id} value={ph.id}>{ph.name} ({ph.city})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Data da Visita *</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Horário Programado *</label>
                <input 
                  type="time" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1">Objetivo do Atendimento *</label>
              <input 
                type="text" 
                placeholder="Ex: Conferência e reposição de estoque consignado mensal."
                className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                value={formObjective}
                onChange={(e) => setFormObjective(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1">Instruções / Anotações de Apoio</label>
              <textarea 
                placeholder="Ex: Tratar do faturamento pendente direto com Sandra..."
                className="w-full border border-gray-200 rounded-lg p-2.5 h-16 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Salvar Agendamento Comercial
            </button>
          </form>
        </div>
      )}

      {/* RE-SCHEDULE MODAL OVERLAY */}
      {reschedulingVisitId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xl max-w-sm w-full space-y-4 text-xs">
            <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">Reagendar Visita</h3>
            
            <form onSubmit={handleRescheduleSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Nova Data</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-500 mb-1">Novo Horário</label>
                <input 
                  type="time" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                <button 
                  type="button" 
                  onClick={() => setReschedulingVisitId(null)}
                  className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg cursor-pointer font-semibold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-lg cursor-pointer font-semibold"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
