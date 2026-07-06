/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Building2, 
  Package, 
  Percent, 
  DollarSign, 
  ArrowLeft, 
  Clock, 
  Compass, 
  FileText,
  Search,
  CheckCircle,
  Truck
} from 'lucide-react';
import { DB } from '../services/db';
import { Pharmacy, Product, Sale, User } from '../types';

interface SaleSectionProps {
  currentUser: User;
  preSelectedPharmacyId?: string | null;
  onClearPreSelection?: () => void;
}

export default function SaleSection({ currentUser, preSelectedPharmacyId, onClearPreSelection }: SaleSectionProps) {
  const pharmacies = DB.getPharmacies().filter(p => p.status === 'active' && (currentUser.roleType === 'admin' || p.assignedSellerId === currentUser.id));
  const products = DB.getProducts().filter(p => p.status === 'active');
  const allSales = DB.getSales();

  // Navigation
  const [viewMode, setViewMode] = useState<'create' | 'list'>('create');

  // Form inputs
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(preSelectedPharmacyId || '');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [inputQuantity, setInputQuantity] = useState('');
  const [inputUnitPrice, setInputUnitPrice] = useState('0.00');
  const [inputDiscount, setInputDiscount] = useState('0'); // percentage
  const [inputNotes, setInputNotes] = useState('');

  // Search & Filter list
  const [searchQuery, setSearchQuery] = useState('');

  // States for calculations
  const [totalPrice, setTotalPrice] = useState(0);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Set initial preselected pharmacy
  useEffect(() => {
    if (preSelectedPharmacyId) {
      setSelectedPharmacyId(preSelectedPharmacyId);
      setViewMode('create');
    }
  }, [preSelectedPharmacyId]);

  // Pre-fill default price when product is selected
  useEffect(() => {
    const p = products.find(prod => prod.id === selectedProductId);
    if (p) {
      setInputUnitPrice(p.salePrice.toFixed(2));
    }
  }, [selectedProductId]);

  // Recalculate totals
  useEffect(() => {
    const qty = parseInt(inputQuantity) || 0;
    const price = parseFloat(inputUnitPrice) || 0;
    const disc = parseFloat(inputDiscount) || 0;

    const base = qty * price;
    const discounted = base - (base * (disc / 100));
    setTotalPrice(discounted);
  }, [inputQuantity, inputUnitPrice, inputDiscount]);

  const handleRegisterSale = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!selectedPharmacyId || !selectedProductId || !inputQuantity || !inputUnitPrice) {
      setFormError('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    const qty = parseInt(inputQuantity);
    if (isNaN(qty) || qty <= 0) {
      setFormError('Quantidade de venda deve ser maior que zero.');
      return;
    }

    const price = parseFloat(inputUnitPrice);
    const disc = parseFloat(inputDiscount) || 0;

    try {
      // Fetch GPS position if available
      const registerSaleWithLocation = (lat?: number, lng?: number) => {
        DB.registerSale({
          companyId: 'company-1',
          pharmacyId: selectedPharmacyId,
          sellerId: currentUser.id,
          productId: selectedProductId,
          quantity: qty,
          unitPrice: price,
          discount: disc,
          total: totalPrice,
          paymentStatus: 'paid',
          saleDate: new Date().toISOString(),
          notes: inputNotes,
          latitude: lat,
          longitude: lng
        });

        setFormSuccess('Venda concluída com sucesso! Os estoques e as metas foram sincronizados.');
        
        // Clear forms
        setSelectedProductId('');
        setInputQuantity('');
        setInputDiscount('0');
        setInputNotes('');

        // Callback clean
        if (onClearPreSelection) onClearPreSelection();

        setTimeout(() => {
          setFormSuccess('');
          setViewMode('list');
        }, 2000);
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => registerSaleWithLocation(pos.coords.latitude, pos.coords.longitude),
          () => {
            const ph = pharmacies.find(p => p.id === selectedPharmacyId);
            registerSaleWithLocation(ph?.latitude, ph?.longitude);
          }
        );
      } else {
        const ph = pharmacies.find(p => p.id === selectedPharmacyId);
        registerSaleWithLocation(ph?.latitude, ph?.longitude);
      }

    } catch (err: any) {
      setFormError(err.message || 'Falha ao registrar venda.');
    }
  };

  // Filter Sales list (Only show representative's own sales, unless admin)
  const visibleSales = allSales.filter(s => {
    if (currentUser.roleType === 'seller' && s.sellerId !== currentUser.id) return false;

    if (searchQuery) {
      const ph = pharmacies.find(p => p.id === s.pharmacyId);
      const prod = products.find(p => p.id === s.productId);
      const matchText = `${ph?.name} ${prod?.name} ${s.notes}`.toLowerCase();
      if (!matchText.includes(searchQuery.toLowerCase())) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6" id="sales-section">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-3xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Registro de Vendas</h1>
          <p className="text-xs text-gray-500 mt-1">Fature e liquide vendas imediatas ou acertos de consignação física.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode(viewMode === 'create' ? 'list' : 'create')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            {viewMode === 'create' ? 'Ver Histórico de Vendas' : 'Nova Venda'}
          </button>
        </div>
      </div>

      {/* 1. REGISTER NEW SALE FORM */}
      {viewMode === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Checkout parameters */}
          <form onSubmit={handleRegisterSale} className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-3xs space-y-4 text-xs">
            <h2 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">Dados Faturamento</h2>
            
            {formError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 font-medium">
                ⚠️ {formError}
              </div>
            )}

            {formSuccess && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 font-medium flex items-center gap-1.5">
                <CheckCircle className="w-4.5 h-4.5 text-green-600 animate-bounce" />
                {formSuccess}
              </div>
            )}

            {/* Farmácia */}
            <div>
              <label className="block font-bold text-gray-500 mb-1">Selecionar Farmácia Cliente *</label>
              <select 
                className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white text-xs"
                value={selectedPharmacyId}
                onChange={(e) => {
                  setSelectedPharmacyId(e.target.value);
                  setFormError('');
                }}
              >
                <option value="">Selecione a farmácia...</option>
                {pharmacies.map(ph => (
                  <option key={ph.id} value={ph.id}>{ph.name} ({ph.city})</option>
                ))}
              </select>
            </div>

            {/* Produto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Selecionar Produto / Medicamento *</label>
                <select 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white text-xs"
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setFormError('');
                  }}
                  disabled={!selectedPharmacyId}
                >
                  <option value="">Selecione o produto...</option>
                  {products.map(prod => {
                    const consignStock = DB.getPharmacyStock(selectedPharmacyId).find(ps => ps.productId === prod.id);
                    const vehicleStock = DB.getSellerStock(currentUser.id).find(ss => ss.productId === prod.id);
                    
                    const consignQty = consignStock ? consignStock.quantityRemaining : 0;
                    const vehicleQty = vehicleStock ? vehicleStock.quantity : 0;

                    return (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} (Prateleira: {consignQty} | Veículo: {vehicleQty})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-500 mb-1">Quantidade Vendida *</label>
                <input 
                  type="number" 
                  placeholder="Ex: 10"
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                  value={inputQuantity}
                  onChange={(e) => {
                    setInputQuantity(e.target.value);
                    setFormError('');
                  }}
                  disabled={!selectedProductId}
                />
              </div>
            </div>

            {/* Preços e Desconto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Preço Unitário Praticado (R$) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                  value={inputUnitPrice}
                  onChange={(e) => setInputUnitPrice(e.target.value)}
                  disabled={!selectedProductId}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-500 mb-1">Desconto Comercial (%)</label>
                <input 
                  type="number" 
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                  value={inputDiscount}
                  onChange={(e) => setInputDiscount(e.target.value)}
                  disabled={!selectedProductId}
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block font-bold text-gray-500 mb-1">Observações do Pedido</label>
              <textarea 
                className="w-full border border-gray-200 rounded-lg p-2.5 h-16 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                value={inputNotes}
                onChange={(e) => setInputNotes(e.target.value)}
                placeholder="Ex: Desconto promocional aplicado. Condição de pagamento líquida 30 dias..."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!selectedProductId || totalPrice === 0}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold shadow-md transition-all cursor-pointer ${
                (!selectedProductId || totalPrice === 0)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Finalizar Faturamento
            </button>
          </form>

          {/* Right sidebar: Real-time receipt summary breakdown */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs flex flex-col justify-between space-y-4">
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-gray-900 border-b border-gray-50 pb-2">Resumo da Cobrança</h3>
              
              {selectedProductId ? (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Medicamento</span>
                    <p className="font-bold text-slate-800">{products.find(p => p.id === selectedProductId)?.name}</p>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                      Marca: {products.find(p => p.id === selectedProductId)?.brand}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Quantidade</span>
                    <p className="font-semibold text-slate-700">{inputQuantity || 0} un</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Parâmetros Cálculo</span>
                    <div className="flex justify-between text-gray-600">
                      <span>Valor Base:</span>
                      <span>R$ {((parseInt(inputQuantity) || 0) * (parseFloat(inputUnitPrice) || 0)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-amber-600 font-semibold">
                      <span>Desconto ({inputDiscount || 0}%):</span>
                      <span>- R$ {(((parseInt(inputQuantity) || 0) * (parseFloat(inputUnitPrice) || 0)) * ((parseFloat(inputDiscount) || 0) / 100)).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total Faturado:</span>
                    <span className="text-xl font-black text-emerald-600">R$ {totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 italic">
                  Selecione um cliente e produto para simular o cupom.
                </div>
              )}
            </div>

            {/* GPS check flag */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
              <Compass className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span>Coordenadas GPS logadas ao faturar para Back4App.</span>
            </div>
          </div>

        </div>
      )}

      {/* 2. RECENT SALES HISTORY VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-3xs overflow-hidden">
          {/* Internal search */}
          <div className="p-4 bg-slate-50/50 border-b border-gray-100">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="Filtrar histórico por farmácia, produto, observação..." 
                className="w-full bg-white text-xs pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 border-b border-gray-100 text-gray-400 font-bold uppercase">
                  <th className="p-4">Farmácia</th>
                  <th className="p-4">Medicamento</th>
                  <th className="p-4 text-center">Quantidade</th>
                  <th className="p-4 text-center">Desconto</th>
                  <th className="p-4 text-right">Valor Líquido</th>
                  <th className="p-4 text-right">Data Liquidação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {visibleSales.map((s) => {
                  const ph = DB.getPharmacies().find(p => p.id === s.pharmacyId);
                  const prod = products.find(p => p.id === s.productId);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/40">
                      <td className="p-4 font-bold text-gray-900">{ph ? ph.name : 'Farmácia'}</td>
                      <td className="p-4">{prod ? prod.name : 'Produto'}</td>
                      <td className="p-4 text-center">{s.quantity} un</td>
                      <td className="p-4 text-center text-amber-600 font-semibold">{s.discount}%</td>
                      <td className="p-4 text-right font-bold text-emerald-600">R$ {s.total.toFixed(2)}</td>
                      <td className="p-4 text-right text-gray-400 font-mono">
                        {new Date(s.saleDate).toLocaleDateString('pt-BR')} {new Date(s.saleDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
