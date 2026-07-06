/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Calendar, 
  Users, 
  AlertTriangle, 
  DollarSign, 
  MapPin, 
  Navigation,
  ChevronRight,
  TrendingDown,
  Activity,
  Map as MapIcon
} from 'lucide-react';
import { DB } from '../services/db';
import { Pharmacy, Product, Sale, Visit, User } from '../types';

export default function DashboardAdmin() {
  const pharmacies = DB.getPharmacies();
  const products = DB.getProducts();
  const mainStock = DB.getMainStock();
  const sellerStock = DB.getSellerStock();
  const pharmacyStock = DB.getPharmacyStock();
  const sales = DB.getSales();
  const visits = DB.getVisits();
  const sellers = DB.getUsers().filter(u => u.roleType === 'seller');

  // KPI Calculations
  const totalPharmacies = pharmacies.length;
  const activePharmacies = pharmacies.filter(p => p.status === 'active').length;
  const productsInCentralStock = mainStock.reduce((acc, curr) => acc + curr.quantity, 0);
  const productsDistributed = sellerStock.reduce((acc, curr) => acc + curr.quantity, 0) + 
                               pharmacyStock.reduce((acc, curr) => acc + curr.quantityRemaining, 0);
  const productsSold = sales.reduce((acc, curr) => acc + curr.quantity, 0);
  
  // Total Revenue Month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthSales = sales.filter(s => {
    const d = new Date(s.saleDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const totalSalesCount = thisMonthSales.length;
  const totalRevenueValue = thisMonthSales.reduce((acc, curr) => acc + curr.total, 0);

  // Visits
  const todayStr = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter(v => v.scheduledDate === todayStr);
  const completedVisitsToday = todayVisits.filter(v => v.status === 'completed').length;
  
  // Weekly Visits (within 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyVisits = visits.filter(v => new Date(v.scheduledDate) >= oneWeekAgo);

  // Low Stock Main
  const lowStockProducts = mainStock.filter(ms => ms.status === 'low' || ms.status === 'empty');

  // Vendedores online / ativos (with logged status)
  const sellersOnline = sellers.filter(s => s.status === 'active').length;

  // Selected visual elements for interactive map
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedSellerMap, setSelectedSellerMap] = useState<string | null>(null);

  // Filter pharmacies based on map selection
  const filteredMapPharmacies = pharmacies.filter(p => {
    if (selectedCity && p.city !== selectedCity) return false;
    if (selectedSellerMap && p.assignedSellerId !== selectedSellerMap) return false;
    return true;
  });

  // Calculate chart metrics
  // 1. Sales by Seller
  const salesBySeller = sellers.map(s => {
    const totalSalesValue = sales
      .filter(sale => sale.sellerId === s.id)
      .reduce((sum, curr) => sum + curr.total, 0);
    return { name: s.fullName.split(' ')[0], value: totalSalesValue };
  });

  // 2. Sales by City
  const cities = Array.from(new Set(pharmacies.map(p => p.city)));
  const salesByCity = cities.map(city => {
    const cityPharmacies = pharmacies.filter(p => p.city === city).map(p => p.id);
    const value = sales
      .filter(sale => cityPharmacies.includes(sale.pharmacyId))
      .reduce((sum, curr) => sum + curr.total, 0);
    return { name: city, value };
  });

  // 3. Sales by Product
  const salesByProduct = products.map(p => {
    const qty = sales
      .filter(sale => sale.productId === p.id)
      .reduce((sum, curr) => sum + curr.quantity, 0);
    return { name: p.name.split(' ')[0], value: qty };
  });

  // 4. Sales History (Last 5 days of June/July 2026)
  const salesHistory = [
    { date: '28/06', amount: 475 },
    { date: '29/06', amount: 395 },
    { date: '30/06', amount: 1296 },
    { date: '01/07', amount: 225 },
    { date: '02/07', amount: totalRevenueValue > 0 ? totalRevenueValue : 180 },
  ];

  const maxSellerValue = Math.max(...salesBySeller.map(s => s.value), 1);
  const maxCityValue = Math.max(...salesByCity.map(c => c.value), 1);
  const maxProductValue = Math.max(...salesByProduct.map(p => p.value), 1);
  const maxHistoryValue = Math.max(...salesHistory.map(h => h.amount), 1);

  return (
    <div className="space-y-6" id="dashboard-admin-view">
      {/* Welcome Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Painel Administrativo</h1>
          <p className="text-sm text-gray-500 mt-1">Bem-vindo de volta! Aqui está o andamento comercial da PharmaRoute.</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-medium">
          <Activity className="w-4 h-4 animate-pulse text-indigo-500" />
          Sincronizado Offline & Back4App
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Farmácias */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Farmácias</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">{totalPharmacies}</div>
            <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
              <span>●</span> {activePharmacies} Ativas
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Estoque Total */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estoque Central</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">{productsInCentralStock}</div>
            <p className="text-xs text-gray-500 mt-1">
              {productsDistributed} un. distribuídas
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Vendas do Mês */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Faturamento do Mês</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">R$ {totalRevenueValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {totalSalesCount} pedidos fechados
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Visitas */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Visitas</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">{todayVisits.length} Hoje</div>
            <p className="text-xs text-blue-600 font-medium mt-1">
              {completedVisitsToday} concluídas / {weeklyVisits.length} na semana
            </p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid Charts & Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Evolution Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Evolução do Faturamento diário</h3>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-medium">R$ Total</span>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 pt-6">
            {salesHistory.map((item, idx) => {
              const heightPct = (item.amount / maxHistoryValue) * 80; // max out at 80% height
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-xs font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-2 py-1 rounded-md absolute -translate-y-10 shadow-md">
                    R$ {item.amount.toFixed(2)}
                  </div>
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 hover:from-indigo-600 hover:to-indigo-500 rounded-t-md transition-all duration-500" 
                    style={{ height: `${Math.max(heightPct, 8)}%` }}
                  />
                  <span className="text-xs text-gray-500 font-medium">{item.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Secondary Info / Quick Alerts */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Alertas Importantes
            </h3>
            <p className="text-xs text-gray-400 mt-1">Monitore estoques e vendedores ativos.</p>
            
            <div className="mt-4 space-y-3">
              {/* Online indicator */}
              <div className="flex items-center justify-between p-3 bg-indigo-50/60 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="text-xs font-semibold text-gray-700">Equipe ativa</div>
                    <div className="text-[10px] text-gray-500">{sellersOnline} de {sellers.length} vendedores ativos</div>
                  </div>
                </div>
                <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              </div>

              {/* Central stock levels */}
              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-100">
                <div className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  Estoque Central Alerta
                </div>
                {lowStockProducts.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {lowStockProducts.map(p => {
                      const prodName = products.find(prod => prod.id === p.productId)?.name || 'Produto';
                      return (
                        <div key={p.id} className="text-[11px] text-amber-900 flex justify-between">
                          <span className="truncate max-w-[150px]">{prodName}</span>
                          <span className="font-semibold">{p.quantity} un (Mín: {p.minQuantity})</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-900 mt-1">Todos os produtos estão com níveis normais.</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Última checagem de regras</span>
            <span className="font-semibold text-gray-700">Hoje, 06:00</span>
          </div>
        </div>
      </div>

      {/* Custom Sub-charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Chart by Seller */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            Ranking Vendedores (R$)
          </h3>
          <div className="space-y-4">
            {salesBySeller.map((s, idx) => {
              const percentage = (s.value / maxSellerValue) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-700">{s.name}</span>
                    <span className="font-bold text-gray-900">R$ {s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart by City */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" />
            Distribuição por Cidade (R$)
          </h3>
          <div className="space-y-4">
            {salesByCity.map((c, idx) => {
              const percentage = (c.value / maxCityValue) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-700">{c.name}</span>
                    <span className="font-bold text-gray-900">R$ {c.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart by Product */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-500" />
            Produtos Mais Vendidos (Qtd)
          </h3>
          <div className="space-y-4">
            {salesByProduct.map((p, idx) => {
              const percentage = (p.value / maxProductValue) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-700 truncate max-w-[150px]" title={p.name}>{p.name}</span>
                    <span className="font-bold text-gray-900">{p.value} un</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Administrative Map Segment */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-indigo-500" />
              Mapa de Operações & Roteamento
            </h3>
            <p className="text-xs text-gray-400 mt-1">Monitore geograficamente vendedores e farmácias consignadas em tempo real.</p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select 
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedCity || ''}
              onChange={(e) => setSelectedCity(e.target.value || null)}
            >
              <option value="">Todas Cidades</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedSellerMap || ''}
              onChange={(e) => setSelectedSellerMap(e.target.value || null)}
            >
              <option value="">Todos Vendedores</option>
              {sellers.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </select>
            
            {(selectedCity || selectedSellerMap) && (
              <button 
                onClick={() => { setSelectedCity(null); setSelectedSellerMap(null); }}
                className="text-xs text-red-500 hover:underline px-2"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        </div>

        {/* Visual Map Render with SVG Overlay */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Map canvas container */}
          <div className="lg:col-span-3 border border-gray-100 rounded-xl bg-slate-50 relative overflow-hidden h-[380px] flex items-center justify-center">
            {/* Ambient map grid pattern representing SP state routing area */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="gray" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Simulated Geographic SVG overlay */}
            <svg viewBox="0 0 800 400" className="w-full h-full p-4 relative z-10">
              {/* Region outline paths representing SP state */}
              <path 
                d="M100 100 Q 250 80 400 120 T 700 150 Q 750 250 680 320 T 400 350 Q 200 370 120 280 Z" 
                fill="#f1f5f9" 
                stroke="#cbd5e1" 
                strokeWidth="2" 
                strokeDasharray="4 4"
              />

              {/* Major Highway simulation vectors linking cities */}
              {/* SP to Campinas */}
              <path d="M 450 250 L 380 180" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5" />
              {/* Campinas to Ribeirao */}
              <path d="M 380 180 L 300 80" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5" />

              {/* Route connecting active stops for Rodrigo */}
              <path 
                d="M 450 250 Q 400 200 380 180 T 360 120" 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="2" 
                className="animate-[dash_5s_linear_infinite]"
                strokeDasharray="8 4"
              />

              {/* Legend background */}
              <rect x="20" y="310" width="180" height="75" rx="8" fill="white" stroke="#e2e8f0" />
              <circle cx="35" cy="328" r="5" fill="#10b981" />
              <text x="48" y="332" className="text-[10px] fill-gray-500 font-sans">Farmácia Ativa</text>
              <circle cx="35" cy="348" r="5" fill="#f59e0b" />
              <text x="48" y="352" className="text-[10px] fill-gray-500 font-sans">Visita Agendada</text>
              <circle cx="35" cy="368" r="6" fill="#6366f1" />
              <text x="48" y="372" className="text-[10px] fill-gray-500 font-sans">Vendedor Local</text>

              {/* Pins for selected pharmacies */}
              {filteredMapPharmacies.map((ph, index) => {
                // Map latitude/longitude to SVG viewport coordinates (approximately)
                // São Paulo coordinates ~ lat: -23.55, lon: -46.63
                // Campinas coordinates ~ lat: -22.89, lon: -47.05
                // Ribeirão Preto ~ lat: -21.17, lon: -47.81
                let x = 450;
                let y = 250;
                
                if (ph.city.toLowerCase().includes('campinas')) {
                  x = 380 + (index * 15);
                  y = 180 + (index * 10);
                } else if (ph.city.toLowerCase().includes('ribeirão')) {
                  x = 300 + (index * 20);
                  y = 80 + (index * 5);
                } else if (ph.city.toLowerCase().includes('são paulo')) {
                  x = 480 + (index * 10);
                  y = 260 + (index * 8);
                }

                const isScheduledToday = todayVisits.some(v => v.pharmacyId === ph.id);
                const pinColor = isScheduledToday ? '#f59e0b' : '#10b981';

                return (
                  <g key={ph.id} className="cursor-pointer group/pin">
                    {/* Ring pulsing effect if scheduled today */}
                    {isScheduledToday && (
                      <circle cx={x} cy={y} r="12" fill="#f59e0b" opacity="0.2" className="animate-ping" />
                    )}
                    <circle cx={x} cy={y} r="6" fill={pinColor} stroke="white" strokeWidth="1.5" />
                    <text x={x + 10} y={y + 4} className="text-[10px] fill-gray-800 font-medium opacity-0 group-hover/pin:opacity-100 bg-white p-1 transition-opacity pointer-events-none">
                      {ph.name}
                    </text>
                  </g>
                );
              })}

              {/* Sellers pulsing points on map */}
              {sellers.map((s) => {
                let sX = 370;
                let sY = 190;
                if (s.fullName.includes('Mariana')) {
                  sX = 310;
                  sY = 90;
                }
                if (selectedSellerMap && selectedSellerMap !== s.id) return null;

                return (
                  <g key={s.id} className="cursor-pointer group/seller">
                    <circle cx={sX} cy={sY} r="18" fill="#6366f1" opacity="0.1" className="animate-pulse" />
                    <circle cx={sX} cy={sY} r="7" fill="#6366f1" stroke="white" strokeWidth="2" />
                    <path d={`M ${sX} ${sY} L ${sX + 12} ${sY - 12}`} stroke="#6366f1" strokeWidth="1.5" strokeDasharray="2 2" />
                    <rect x={sX + 14} y={sY - 24} width="90" height="20" rx="4" fill="#0f172a" opacity="0.9" />
                    <text x={sX + 18} y={sY - 11} fill="white" className="text-[9px] font-semibold">{s.fullName.split(' ')[0]} (Carro)</text>
                  </g>
                );
              })}
            </svg>

            {/* Overlay indicators */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs p-2 rounded-lg border border-gray-200 text-xs text-gray-600 flex flex-col gap-1 z-20">
              <span className="font-semibold text-gray-800">Cidades Atendidas</span>
              <span>São Paulo (Centro)</span>
              <span>Campinas (Cambuí, Taquaral)</span>
              <span>Ribeirão Preto (Boulevard)</span>
            </div>
          </div>

          {/* Quick list of pharmacies with consignments */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Acompanhamento de Visitas</h4>
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {filteredMapPharmacies.map(ph => {
                const associatedVisits = visits.filter(v => v.pharmacyId === ph.id);
                const nextV = associatedVisits.find(v => v.status === 'scheduled');
                
                return (
                  <div key={ph.id} className="p-3 bg-white border border-gray-100 rounded-lg shadow-2xs hover:border-indigo-200 transition-colors">
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-semibold text-gray-800 truncate block max-w-[150px]">{ph.name}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${ph.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {ph.status === 'active' ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">{ph.city} • Resp: {ph.responsibleName}</p>
                    
                    <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between text-[10px]">
                      <span className="text-gray-400">Próxima Visita:</span>
                      <span className="font-semibold text-indigo-700 flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {nextV ? new Date(nextV.scheduledDate).toLocaleDateString('pt-BR') : 'Sem agenda'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
