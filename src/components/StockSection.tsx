/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
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
  Filter,
  Trash2,
  Edit
} from 'lucide-react';
import { DB } from '../services/db';
import { MainStock, SellerStock, PharmacyStock, Product } from '../types';

export default function StockSection() {
  const [refreshKey, setRefreshKey] = useState(0);

  const products = useMemo(() => DB.getProducts(), [refreshKey]);
  const mainStock = useMemo(() => DB.getMainStock(), [refreshKey]);
  const sellerStock = useMemo(() => DB.getSellerStock(), [refreshKey]);
  const pharmacyStock = useMemo(() => DB.getPharmacyStock(), [refreshKey]);
  const sellers = useMemo(() => DB.getUsers().filter(u => u.roleType === 'seller'), [refreshKey]);
  const pharmacies = useMemo(() => DB.getPharmacies(), [refreshKey]);
  const systemLogs = useMemo(() => DB.getSystemLogs().filter(log => log.targetClass.includes('Stock') || log.action.includes('STOCK')), [refreshKey]);

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

  // New States for General Stock (Adding and Removing completely)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addProductId, setAddProductId] = useState('');
  const [addQty, setAddQty] = useState('');
  const [addMinQty, setAddMinQty] = useState('');
  const [addError, setAddError] = useState('');

  // Deletion confirmation state to bypass sandboxed window.confirm blocker
  const [deletingStockId, setDeletingStockId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  // Direct editing of stock entry
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editStockQty, setEditStockQty] = useState('');
  const [editStockMinQty, setEditStockMinQty] = useState('');
  const [editStockError, setEditStockError] = useState('');

  const deletingStockProduct = useMemo(() => {
    if (!deletingStockId) return null;
    const entry = mainStock.find(ms => ms.id === deletingStockId);
    if (!entry) return null;
    return products.find(p => p.id === entry.productId);
  }, [deletingStockId, mainStock, products]);

  const handleCreateStockEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    if (!addProductId || !addQty || !addMinQty) {
      setAddError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const qty = parseInt(addQty);
    const minQty = parseInt(addMinQty);

    if (isNaN(qty) || qty < 0) {
      setAddError('A quantidade inicial deve ser um número maior ou igual a zero.');
      return;
    }

    if (isNaN(minQty) || minQty < 0) {
      setAddError('O nível mínimo de estoque deve ser um número maior ou igual a zero.');
      return;
    }

    try {
      DB.createMainStockEntry(addProductId, qty, minQty);
      setIsAddModalOpen(false);
      setAddProductId('');
      setAddQty('');
      setAddMinQty('');
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      setAddError(err.message || 'Erro ao adicionar registro de estoque.');
    }
  };

  const handleDeleteStock = (id: string) => {
    setDeletingStockId(id);
    setDeleteError('');
  };

  const confirmDeleteStock = () => {
    if (!deletingStockId) return;
    try {
      DB.deleteMainStockEntry(deletingStockId);
      setDeletingStockId(null);
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      setDeleteError(err.message || 'Erro ao remover registro.');
    }
  };

  const startEditStock = (ms: MainStock) => {
    setEditingStockId(ms.id);
    setEditStockQty(ms.quantity.toString());
    setEditStockMinQty(ms.minQuantity.toString());
    setEditStockError('');
  };

  const handleEditStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditStockError('');

    if (!editingStockId) return;

    const qty = parseInt(editStockQty);
    const minQty = parseInt(editStockMinQty);

    if (isNaN(qty) || qty < 0) {
      setEditStockError('A quantidade deve ser maior ou igual a zero.');
      return;
    }
    if (isNaN(minQty) || minQty < 0) {
      setEditStockError('O nível mínimo deve ser maior ou igual a zero.');
      return;
    }

    try {
      DB.updateMainStockEntry(editingStockId, qty, minQty);
      setEditingStockId(null);
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      setEditStockError(err.message || 'Erro ao atualizar estoque.');
    }
  };

  const editingStockProduct = useMemo(() => {
    if (!editingStockId) return null;
    const entry = mainStock.find(ms => ms.id === editingStockId);
    if (!entry) return null;
    return products.find(p => p.id === entry.productId);
  }, [editingStockId, mainStock, products]);

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
      setRefreshKey(prev => prev + 1);
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
          <div className="p-4 bg-slate-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-sm font-bold text-gray-800">Medicamentos no Estoque Central</h2>
              <p className="text-[11px] text-gray-400">Gerencie a disponibilidade geral, registre entradas e saídas físicas.</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar ao Estoque Central
            </button>
          </div>

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
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => setAdjustProductId(ms.productId)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-1.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors text-[10px]"
                            title="Lançar entrada/saída física"
                          >
                            <Sliders className="w-3 h-3 text-indigo-500" />
                            Ajustar
                          </button>
                          <button 
                            onClick={() => startEditStock(ms)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2 py-1.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors text-[10px]"
                            title="Editar quantidade e nível mínimo diretamente"
                          >
                            <Edit className="w-3 h-3" />
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDeleteStock(ms.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold p-1.5 rounded-md flex items-center justify-center cursor-pointer transition-colors"
                            title="Remover do Estoque Geral"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
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

          {/* ADD TO GENERAL STOCK MODAL */}
          {isAddModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden transform scale-100 transition-all text-left">
                <div className="bg-indigo-50 p-5 border-b border-indigo-100 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-indigo-900">
                    <Package className="w-5 h-5" />
                    <h3 className="font-bold text-sm">Adicionar Item ao Estoque Geral</h3>
                  </div>
                  <button 
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 font-bold text-base cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateStockEntry} className="p-6 space-y-4">
                  {addError && (
                    <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-lg text-xs font-semibold">
                      {addError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">Selecione o Produto/Medicamento *</label>
                    <select 
                      className="w-full border border-gray-200 rounded-xl p-3 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={addProductId}
                      onChange={(e) => setAddProductId(e.target.value)}
                      required
                    >
                      <option value="">-- Escolha um medicamento --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.brand}) • {p.sku}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700">Quantidade Inicial *</label>
                      <input 
                        type="number" 
                        placeholder="Ex: 500"
                        className="w-full border border-gray-200 rounded-xl p-3 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={addQty}
                        onChange={(e) => setAddQty(e.target.value)}
                        min="0"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700">Nível Mínimo *</label>
                      <input 
                        type="number" 
                        placeholder="Ex: 50"
                        className="w-full border border-gray-200 rounded-xl p-3 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={addMinQty}
                        onChange={(e) => setAddMinQty(e.target.value)}
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 italic">
                    * Se o produto já possuir registro de estoque geral, a quantidade informada será somada ao saldo atual.
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                    <button 
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 bg-slate-50 border border-gray-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      Confirmar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* DELETE GENERAL STOCK CONFIRMATION MODAL */}
          {deletingStockId && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden transform scale-100 transition-all text-left text-xs">
                <div className="bg-red-50 p-5 border-b border-red-100 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-red-900">
                    <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                    <h3 className="font-bold text-sm">Remover Registro de Estoque</h3>
                  </div>
                  <button 
                    onClick={() => setDeletingStockId(null)}
                    className="text-gray-400 hover:text-gray-600 font-bold text-base cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {deleteError && (
                    <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-lg text-xs font-semibold">
                      {deleteError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Tem certeza absoluta de que deseja remover o registro de estoque central do produto:
                    </p>
                    {deletingStockProduct ? (
                      <div className="p-3.5 bg-slate-50 border border-gray-100 rounded-xl">
                        <p className="font-bold text-gray-900 text-xs">{deletingStockProduct.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {deletingStockProduct.sku} • {deletingStockProduct.brand}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                        <p className="font-semibold text-gray-800 text-xs">Registro de estoque selecionado</p>
                      </div>
                    )}
                    <p className="text-[11px] text-red-500 font-medium leading-relaxed">
                      ⚠️ Esta ação é irreversível e o item não constará mais nos relatórios de estoque central até que seja readicionado.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                    <button 
                      type="button"
                      onClick={() => setDeletingStockId(null)}
                      className="px-4 py-2 bg-slate-50 border border-gray-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="button"
                      onClick={confirmDeleteStock}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      Remover Estoque
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EDIT GENERAL STOCK MODAL */}
          {editingStockId && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden transform scale-100 transition-all text-left text-xs">
                <div className="bg-indigo-50 p-5 border-b border-indigo-100 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-indigo-900">
                    <Edit className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-sm">Editar Registro de Estoque</h3>
                  </div>
                  <button 
                    onClick={() => setEditingStockId(null)}
                    className="text-gray-400 hover:text-gray-600 font-bold text-base cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleEditStockSubmit} className="p-6 space-y-4">
                  {editStockError && (
                    <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-lg text-xs font-semibold">
                      {editStockError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500">Medicamento</label>
                    {editingStockProduct ? (
                      <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                        <p className="font-bold text-gray-900 text-xs">{editingStockProduct.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {editingStockProduct.sku} • {editingStockProduct.brand}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                        <p className="font-semibold text-gray-800 text-xs">Registro de estoque selecionado</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700">Quantidade Atual *</label>
                      <input 
                        type="number" 
                        placeholder="Ex: 500"
                        className="w-full border border-gray-200 rounded-xl p-3 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={editStockQty}
                        onChange={(e) => setEditStockQty(e.target.value)}
                        min="0"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700">Nível Mínimo *</label>
                      <input 
                        type="number" 
                        placeholder="Ex: 50"
                        className="w-full border border-gray-200 rounded-xl p-3 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={editStockMinQty}
                        onChange={(e) => setEditStockMinQty(e.target.value)}
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                    <button 
                      type="button"
                      onClick={() => setEditingStockId(null)}
                      className="px-4 py-2 bg-slate-50 border border-gray-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </div>
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
