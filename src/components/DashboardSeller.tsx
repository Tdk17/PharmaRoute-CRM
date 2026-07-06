/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Package, 
  ShoppingCart, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Navigation, 
  Play, 
  TrendingUp, 
  UserCheck, 
  Phone, 
  MessageSquare, 
  Compass, 
  Award,
  AlertCircle
} from 'lucide-react';
import { DB } from '../services/db';
import { Visit, Pharmacy, Product, Goal } from '../types';

interface DashboardSellerProps {
  sellerId: string;
  onNavigateToSection: (section: string) => void;
}

export default function DashboardSeller({ sellerId, onNavigateToSection }: DashboardSellerProps) {
  const allVisits = DB.getVisits();
  const pharmacies = DB.getPharmacies();
  const products = DB.getProducts();
  const sellerStock = DB.getSellerStock(sellerId);
  const sales = DB.getSales().filter(s => s.sellerId === sellerId);
  const goals = DB.getGoals(sellerId);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter Today's Visits for this Seller
  const todayVisits = allVisits.filter(v => v.sellerId === sellerId && v.scheduledDate === todayStr);
  const completedVisitsToday = todayVisits.filter(v => v.status === 'completed');
  const pendingVisitsToday = todayVisits.filter(v => v.status === 'scheduled' || v.status === 'in_progress');

  // Next Visit
  const nextVisit = pendingVisitsToday.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))[0];
  const nextPharmacy = nextVisit ? pharmacies.find(p => p.id === nextVisit.pharmacyId) : null;

  // Car Products count
  const totalCarStock = sellerStock.reduce((acc, curr) => acc + curr.quantity, 0);

  // Units sold by this seller
  const totalUnitsSold = sales.reduce((acc, curr) => acc + curr.quantity, 0);

  // Sales total value
  const totalSalesValue = sales.reduce((acc, curr) => acc + curr.total, 0);

  // Monthly goals metrics (July 2026)
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const sellerGoal = goals.find(g => g.month === currentMonth && g.year === currentYear) || {
    salesGoal: 40,
    visitsGoal: 15,
    revenueGoal: 12000,
    currentSales: sales.length,
    currentVisits: allVisits.filter(v => v.sellerId === sellerId && v.status === 'completed').length,
    currentRevenue: totalSalesValue
  };

  // Check-In and Check-Out Simulation State
  const [activeVisitId, setActiveVisitId] = useState<string | null>(() => {
    const active = todayVisits.find(v => v.status === 'in_progress');
    return active ? active.id : null;
  });
  const [visitResultInput, setVisitResultInput] = useState('');
  const [visitNotesInput, setVisitNotesInput] = useState('');
  const [photoMockUrl, setPhotoMockUrl] = useState('');
  const [simulatedGPS, setSimulatedGPS] = useState<{ lat: number; lng: number } | null>(null);

  // Trigger simulated Check-In
  const handleCheckIn = (visitId: string) => {
    const visit = allVisits.find(v => v.id === visitId);
    if (!visit) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setSimulatedGPS({ lat, lng });
          
          const updated: Visit = {
            ...visit,
            status: 'in_progress',
            checkInAt: new Date().toISOString(),
            checkInLatitude: lat,
            checkInLongitude: lng
          };
          DB.updateVisit(updated);
          setActiveVisitId(visitId);
        },
        () => {
          // Fallback coordinate simulation
          const ph = pharmacies.find(p => p.id === visit.pharmacyId);
          const lat = ph ? ph.latitude : -22.8944;
          const lng = ph ? ph.longitude : -47.0503;
          setSimulatedGPS({ lat, lng });

          const updated: Visit = {
            ...visit,
            status: 'in_progress',
            checkInAt: new Date().toISOString(),
            checkInLatitude: lat,
            checkInLongitude: lng
          };
          DB.updateVisit(updated);
          setActiveVisitId(visitId);
        }
      );
    }
  };

  // Trigger simulated Check-Out
  const handleCheckOut = (visitId: string) => {
    const visit = allVisits.find(v => v.id === visitId);
    if (!visit) return;

    const updated: Visit = {
      ...visit,
      status: 'completed',
      checkOutAt: new Date().toISOString(),
      result: visitResultInput || 'Reposição efetuada com sucesso.',
      notes: visitNotesInput || 'Estoque reabastecido.',
      photoUrl: photoMockUrl || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=200'
    };
    DB.updateVisit(updated);
    setActiveVisitId(null);
    setVisitResultInput('');
    setVisitNotesInput('');
    setPhotoMockUrl('');
    setSimulatedGPS(null);
  };

  return (
    <div className="space-y-6" id="dashboard-seller-view">
      {/* Upper representative summary */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        {/* Ambient absolute vector accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full opacity-10 filter blur-xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600 rounded-full opacity-10 filter blur-xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-500/20 rounded-full border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xl">
              {DB.getUsers().find(u => u.id === sellerId)?.fullName.charAt(0) || 'V'}
            </div>
            <div>
              <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase">Vendedor em Campo</span>
              <h1 className="text-2xl font-bold tracking-tight">Olá, {DB.getUsers().find(u => u.id === sellerId)?.fullName}!</h1>
              <p className="text-xs text-slate-400 mt-1">Pronto para otimizar suas rotas e bater as metas de vendas?</p>
            </div>
          </div>

          <button 
            onClick={() => onNavigateToSection('rotas')}
            className="self-start md:self-auto bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            Iniciar Rota Inteligente
          </button>
        </div>
      </div>

      {/* KPI Cards for mobile representative */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Visitas de Hoje */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Visitas Hoje</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-gray-900 mt-2">{todayVisits.length}</div>
          <p className="text-[10px] text-gray-500 mt-1">
            {completedVisitsToday.length} concluídas / {pendingVisitsToday.length} pendentes
          </p>
        </div>

        {/* Produtos no carro */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">No Veículo</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-gray-900 mt-2">{totalCarStock} un</div>
          <p className="text-[10px] text-gray-500 mt-1">
            Estoque carregado no carro
          </p>
        </div>

        {/* Total vendido em R$ */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Vendido (Mês)</span>
            <ShoppingCart className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-gray-900 mt-2">R$ {totalSalesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <p className="text-[10px] text-green-600 font-medium mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            {sales.length} vendas registradas
          </p>
        </div>

        {/* Concluído e Metas */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Atingido (Meta)</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-gray-900 mt-2">
            {sellerGoal.revenueGoal > 0 ? Math.round((totalSalesValue / sellerGoal.revenueGoal) * 100) : 0}%
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            Meta: R$ {sellerGoal.revenueGoal.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Goal Target Progress Indicators */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-2xs space-y-4">
        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
          <Award className="w-4 h-4 text-yellow-500" />
          Desempenho Comercial do Mês
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Revenue progress */}
          <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Faturamento</span>
              <span className="font-bold">R$ {totalSalesValue.toFixed(2)} / R$ {sellerGoal.revenueGoal.toFixed(0)}</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((totalSalesValue / sellerGoal.revenueGoal) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Visits progress */}
          <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Visitas Concluídas</span>
              <span className="font-bold">{sellerGoal.currentVisits} / {sellerGoal.visitsGoal}</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((sellerGoal.currentVisits / sellerGoal.visitsGoal) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Sales count progress */}
          <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Frequência de Vendas</span>
              <span className="font-bold">{sellerGoal.currentSales} / {sellerGoal.salesGoal}</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((sellerGoal.currentSales / sellerGoal.salesGoal) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Focus: Today's agenda with Check-in / Checkout controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive check-in panel */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              Rotina de Visitas para Hoje
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
              {todayVisits.length} Visitas
            </span>
          </div>

          {todayVisits.length === 0 ? (
            <div className="text-center py-8 bg-slate-50/50 rounded-lg border border-dashed border-gray-200">
              <UserCheck className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm text-gray-500 mt-2 font-medium">Nenhuma visita planejada para hoje.</p>
              <button 
                onClick={() => onNavigateToSection('agenda')}
                className="text-xs text-indigo-500 hover:underline mt-1 font-semibold"
              >
                Agendar nova visita
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {todayVisits.map((visit) => {
                const ph = pharmacies.find(p => p.id === visit.pharmacyId);
                const isActive = activeVisitId === visit.id;
                const isCompleted = visit.status === 'completed';
                
                if (!ph) return null;

                return (
                  <div 
                    key={visit.id} 
                    className={`p-4 rounded-xl border transition-all ${
                      isActive 
                        ? 'bg-indigo-50/50 border-indigo-300 shadow-sm ring-1 ring-indigo-200' 
                        : isCompleted 
                          ? 'bg-slate-50/50 border-gray-100 opacity-80' 
                          : 'bg-white border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            {visit.scheduledTime}h
                          </span>
                          <h4 className="font-bold text-gray-900 text-sm">{ph.name}</h4>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {ph.address}, {ph.number} - {ph.city}
                        </p>
                        <p className="text-xs text-gray-600 italic mt-1 font-medium">
                          "Objetivo: {visit.objective}"
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="self-end sm:self-center">
                        {isCompleted ? (
                          <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-green-100">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Concluído
                          </span>
                        ) : isActive ? (
                          <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse border border-indigo-200">
                            <Clock className="w-4 h-4" />
                            Em progresso
                          </span>
                        ) : (
                          <button
                            disabled={activeVisitId !== null}
                            onClick={() => handleCheckIn(visit.id)}
                            className={`text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                              activeVisitId !== null 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                          >
                            <Compass className="w-3.5 h-3.5" />
                            Fazer Check-In
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Active Check-In Logging Dialog */}
                    {isActive && (
                      <div className="mt-4 pt-4 border-t border-indigo-200 space-y-3">
                        <div className="bg-white p-3 rounded-lg border border-indigo-100 space-y-2">
                          <div className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                            GPS Capturado: <span className="text-indigo-600">{simulatedGPS?.lat.toFixed(5)}, {simulatedGPS?.lng.toFixed(5)}</span>
                          </div>
                          <div className="text-[10px] text-gray-400">
                            O check-in registra latitude/longitude e horário exatos em segundo plano (enviado para Back4App).
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">Resultado da Visita</label>
                            <input 
                              type="text" 
                              placeholder="Ex: Abastecimento de estoque fechado"
                              className="text-xs w-full border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                              value={visitResultInput}
                              onChange={(e) => setVisitResultInput(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">Observações Adicionais</label>
                            <input 
                              type="text" 
                              placeholder="Observações complementares"
                              className="text-xs w-full border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                              value={visitNotesInput}
                              onChange={(e) => setVisitNotesInput(e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 mb-1">Anexar Comprovante / Foto (URL)</label>
                          <input 
                            type="text" 
                            placeholder="Insira URL da foto ou use padrão de amostra"
                            className="text-xs w-full border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            value={photoMockUrl}
                            onChange={(e) => setPhotoMockUrl(e.target.value)}
                          />
                        </div>

                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => onNavigateToSection('venda')}
                            className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3.5 py-1.5 rounded-lg hover:bg-emerald-100 border border-emerald-100 cursor-pointer"
                          >
                            Registrar Venda na Visita
                          </button>
                          <button
                            onClick={() => handleCheckOut(visit.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-xs cursor-pointer animate-pulse"
                          >
                            Fazer Check-Out (Salvar)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar: Next Scheduled visit, direct links to WhatsApp reminders & navigation map */}
        <div className="space-y-6">
          
          {/* Próxima Visita details */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-2xs space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-indigo-500" />
              Destino do Próximo Atendimento
            </h3>
            
            {nextPharmacy ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs font-bold text-slate-800">{nextPharmacy.name}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{nextPharmacy.responsibleName} • {nextPharmacy.phone}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a 
                    href={`https://maps.google.com/?q=${nextPharmacy.latitude},${nextPharmacy.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-semibold py-2 rounded-lg hover:bg-indigo-100 border border-indigo-100"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Abrir no GPS
                  </a>
                  <a 
                    href={`https://wa.me/55${nextPharmacy.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1 bg-green-50 text-green-700 text-xs font-semibold py-2 rounded-lg hover:bg-green-100 border border-green-100"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                </div>

                <div className="text-xs text-gray-500 flex items-start gap-1.5 p-2 bg-amber-50/60 rounded-md border border-amber-100">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Observação interna:</strong> {nextPharmacy.notes || 'Nenhuma anotada.'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic text-center py-4">Nenhuma outra visita pendente para hoje.</p>
            )}
          </div>

          {/* Quick instructions / help */}
          <div className="bg-slate-50 p-5 rounded-xl border border-gray-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lembrete de Vendedor</h4>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>Ao chegar no cliente, clique em "Fazer Check-In" para autenticar sua localização.</li>
              <li>Consulte o estoque que você carrega clicando em "No Veículo".</li>
              <li>Para repor produtos faturados em consignação, clique em "Registrar Venda".</li>
              <li>Sua rota inteligente organiza o trajeto ideal automaticamente no mapa.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
