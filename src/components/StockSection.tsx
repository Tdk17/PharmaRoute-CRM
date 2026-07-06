/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  Building2, 
  AlertTriangle, 
  History, 
  Plus, 
  Minus, 
  TrendingUp, 
  RefreshCw, 
  Sliders, 
  Search,
  Filter
} from 'lucide-react';
import { DB } from '../services/db';
import { MainStock, SellerStock, PharmacyStock, Product } from '../types';

export default function StockSection() {
  const products = DB.getProducts();
  const mainStock = DB.getMainStock();
  const sellerStock = DB.getSellerStock();
  const pharmacyStock = DB.getPharmacyStock();
  const sellers = DB.getUsers().filter(u => u.roleType === 'seller');
  const pharmacies = DB.getPharmacies();
  const systemLogs = DB.getSystemLogs().filter(log => log.className.includes('Stock') || log.action.includes('STOCK'));

  // Tab state
  const [activeTab, setActiveTab] = useState<'central' | 'sellers' | 'pharmacies' | 'logs'>('central');

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState('');

  // Adjustment Modal State
  const [adjustProductId, setAdjustProductId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState<'entrada' | 'saida'>('entrada');

  const handleManualAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId || !adjustQty) return;

    const delta = parseInt(adjustQty);
    if (isNaN(delta) || delta <= 0) return;

    const signedDelta = adjustType === 'entrada' ? delta : -delta;

    try {
      DB.updateMainStockQuantity(adjustProductId, signedDelta, 'ajuste');
      setAdjustProductId(null);
      setAdjustQty('');
    } catch (err: any) {
      alert(err.message || 'Erro ao reajustar estoque.');
    }
  };

  return (
    <div className="space-y-6" id="stock-section">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-3xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Controle de Estoques Geral</h1>
          <p className="text-xs text-gray-500 mt-1">Monitore e ajuste o estoque central, estoques veiculares e estoques em consignação.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-auto text-xs font-semibold text-gray-600">
          <button 
            onClick={() => setActiveTab('central')}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'central' ? 'bg-white text-gray-900 shadow-xs' : 'hover:bg-slate-50'}`}
          >
            <Package className="w-4 h-4 text-indigo-500" />
            Central
          </button>
          <button 
            onClick={() => setActiveTab('sellers')}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'sellers' ? 'bg-white text-gray-900 shadow-xs' : 'hover:bg-slate-50'}`}
          >
            <Truck className="w-4 h-4 text-emerald-500" />
            Vendedores
          </button>
          <button 
            onClick={() => setActiveTab('pharmacies')}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'pharmacies' ? 'bg-white text-gray-900 shadow-xs' : 'hover:bg-slate-50'}`}
          >
            <Building2 className="w-4 h-4 text-purple-500" />
            Consignados
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'logs' ? 'bg-white text-gray-900 shadow-xs' : 'hover:bg-slate-50'}`}
          >
            <History className="w-4 h-4 text-gray-500" />
            Histórico
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-3xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Buscar por nome de medicamento..." 
            className="w-full bg-slate-50/50 text-xs pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {activeTab === 'sellers' && (
          <select 
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
            value={selectedSeller}
            onChange={(e) => setSelectedSeller(e.target.value)}
          >
            <option value="">Filtrar Vendedor</option>
            {sellers.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
          </select>
        )}

        {activeTab === 'pharmacies' && (
          <select 
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
            value={selectedPharmacy}
            onChange={(e) => setSelectedPharmacy(e.target.value)}
          >
            <option value="">Filtrar Farmácia</option>
            {pharmacies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>

      {/* TAB CONTENTS */}
      
      {/* TAB 1: CENTRAL STOCK */}
      {activeTab === 'central' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-3xs overflow-hidden">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Medicamento</th>
                  <th className="p-4">SKU / Marca</th>
                  <th className="p-4 text-center">Quantidade Atual</th>
                  <th className="p-4 text-center">Nível Mínimo</th>
                  <th className="p-4 text-center">Status Nível</th>
                  <th className="p-4 text-right">Ajuste Manual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
                {mainStock.filter(ms => {
                  const prod = products.find(p => p.id === ms.productId);
                  return prod && prod.name.toLowerCase().includes(searchQuery.toLowerCase());
                }).map((ms) => {
                  const prod = products.find(p => p.id === ms.productId);
                  if (!prod) return null;

                  return (
                    <tr key={ms.id} className="hover:bg-slate-50/40">
                      <td className="p-4 font-bold text-gray-900">{prod.name}</td>
                      <td className="p-4 text-gray-500">{prod.sku} • {prod.brand}</td>
                      <td className="p-4 text-center font-bold text-slate-800 text-sm">{ms.quantity} un</td>
                      <td className="p-4 text-center text-gray-400">{ms.minQuantity} un</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ms.status === 'normal' ? 'bg-green-50 text-green-700' : (ms.status === 'low' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700')
                        }`}>
                          {ms.status === 'normal' ? 'Normal' : (ms.status === 'low' ? 'Baixo' : 'Zerado')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => setAdjustProductId(ms.productId)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-md flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                          Ajustar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Modal / Inline form for manual adjustments */}
          {adjustProductId && (
            <div className="p-4 bg-indigo-50/50 border-t border-indigo-100 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="font-bold text-indigo-900">
                  Ajuste Rápido de Estoque Central: {products.find(p => p.id === adjustProductId)?.name}
                </span>
                <p className="text-[11px] text-indigo-700">Modifique o estoque em caso de compras, quebras ou auditorias físicas.</p>
              </div>

              <form onSubmit={handleManualAdjustment} className="flex items-center gap-2">
                <select 
                  className="border border-indigo-200 rounded-lg p-2 bg-white"
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as 'entrada' | 'saida')}
                >
                  <option value="entrada">Entrada (+)</option>
                  <option value="saida">Saída (-)</option>
                </select>

                <input 
                  type="number" 
                  placeholder="Qtd"
                  className="w-20 border border-indigo-200 rounded-lg p-2 bg-white"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                />

                <button 
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-3 py-2 rounded-lg cursor-pointer"
                >
                  Confirmar
                </button>
                <button 
                  type="button"
                  onClick={() => setAdjustProductId(null)}
                  className="bg-white border border-indigo-200 hover:bg-slate-100 text-slate-600 font-bold px-3 py-2 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SELLERS STOCK */}
      {activeTab === 'sellers' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-3xs overflow-hidden">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Vendedor</th>
                  <th className="p-4">Medicamento</th>
                  <th className="p-4">SKU / Marca</th>
                  <th className="p-4 text-center">Quantidade no Carro</th>
                  <th className="p-4 text-right">Último Abastecimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
                {sellerStock.filter(ss => {
                  const prod = products.find(p => p.id === ss.productId);
                  if (!prod) return false;
                  
                  // search query
                  if (searchQuery && !prod.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                  // seller filter
                  if (selectedSeller && ss.sellerId !== selectedSeller) return false;

                  return true;
                }).map((ss) => {
                  const seller = sellers.find(s => s.id === ss.sellerId);
                  const prod = products.find(p => p.id === ss.productId);
                  
                  if (!seller || !prod) return null;

                  return (
                    <tr key={ss.id} className="hover:bg-slate-50/40">
                      <td className="p-4 font-bold text-gray-900">{seller.fullName}</td>
                      <td className="p-4">{prod.name}</td>
                      <td className="p-4 text-gray-500">{prod.sku} • {prod.brand}</td>
                      <td className="p-4 text-center font-bold text-slate-800 text-sm">{ss.quantity} un</td>
                      <td className="p-4 text-right text-gray-500">
                        {new Date(ss.lastUpdate).toLocaleDateString('pt-BR')} {new Date(ss.lastUpdate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PHARMACIES CONSIGNED STOCK */}
      {activeTab === 'pharmacies' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-3xs overflow-hidden">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Farmácia</th>
                  <th className="p-4">Medicamento</th>
                  <th className="p-4 text-center">Fornecido (Consignado)</th>
                  <th className="p-4 text-center">Faturado (Vendido)</th>
                  <th className="p-4 text-center">Saldo Atual Prateleira</th>
                  <th className="p-4 text-center">Data Envio</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
                {pharmacyStock.filter(ps => {
                  const ph = pharmacies.find(p => p.id === ps.pharmacyId);
                  const prod = products.find(p => p.id === ps.productId);
                  if (!ph || !prod) return false;

                  if (searchQuery && !prod.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                  if (selectedPharmacy && ps.pharmacyId !== selectedPharmacy) return false;

                  return true;
                }).map((ps) => {
                  const ph = pharmacies.find(p => p.id === ps.pharmacyId);
                  const prod = products.find(p => p.id === ps.productId);
                  if (!ph || !prod) return null;

                  return (
                    <tr key={ps.id} className="hover:bg-slate-50/40">
                      <td className="p-4 font-bold text-gray-900">{ph.name}</td>
                      <td className="p-4">{prod.name}</td>
                      <td className="p-4 text-center text-slate-500">{ps.quantityDelivered} un</td>
                      <td className="p-4 text-center text-emerald-600 font-semibold">{ps.quantitySold} un</td>
                      <td className="p-4 text-center font-bold text-slate-800 text-sm bg-slate-50/60">{ps.quantityRemaining} un</td>
                      <td className="p-4 text-center text-gray-500">{new Date(ps.deliveryDate).toLocaleDateString('pt-BR')}</td>
                      <td className="p-4 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ps.status === 'available' ? 'bg-green-50 text-green-700' : (ps.status === 'low' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700')
                        }`}>
                          {ps.status === 'available' ? 'Abastecido' : (ps.status === 'low' ? 'Baixo' : 'Zerado')}
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

      {/* TAB 4: SYSTEM LOGS HISTORIC */}
      {activeTab === 'logs' && (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Histórico de Ajustes e Movimentações</h3>
            <span className="text-xs text-gray-400">Exibindo últimas 50 ocorrências</span>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {systemLogs.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-6 text-center bg-slate-50/50 rounded-lg">
                Nenhum log de movimentação de estoque registrado ainda.
              </p>
            ) : (
              systemLogs.map(log => (
                <div key={log.id} className="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-lg text-xs transition-colors flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-gray-800 font-medium">
                      {log.description}
                    </p>
                    <span className="text-[10px] text-gray-400 font-mono">ID Objeto: {log.objectId} | IP: {log.ip}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono text-right whitespace-nowrap shrink-0 mt-0.5">
                    {new Date(log.createdAt).toLocaleDateString('pt-BR')} {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
