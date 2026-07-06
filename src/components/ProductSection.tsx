/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Package, 
  Tag, 
  BarChart, 
  ArrowLeft, 
  UserPlus, 
  Truck, 
  Info, 
  AlertCircle,
  FileSpreadsheet,
  Edit
} from 'lucide-react';
import { DB } from '../services/db';
import { Product, MainStock, User } from '../types';

interface ProductSectionProps {
  currentUser: User;
}

export default function ProductSection({ currentUser }: ProductSectionProps) {
  const products = DB.getProducts();
  const mainStock = DB.getMainStock();
  const sellers = DB.getUsers().filter(u => u.roleType === 'seller');

  // Navigation states
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'transfer'>('list');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Form states
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formSalePrice, setFormSalePrice] = useState('');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formMinStock, setFormMinStock] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formInitialQty, setFormInitialQty] = useState('500');

  // Transfer states
  const [transferSellerId, setTransferSellerId] = useState('');
  const [transferProductId, setTransferProductId] = useState('');
  const [transferQty, setTransferQty] = useState('');

  // Error / success inside form
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const clearForm = () => {
    setFormName('');
    setFormBrand('');
    setFormDescription('');
    setFormSku('');
    setFormBarcode('');
    setFormSalePrice('');
    setFormCostPrice('');
    setFormMinStock('');
    setFormImageUrl('');
    setFormInitialQty('500');
    setFormStatus('active');
    setFormError('');
    setFormSuccess('');
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formName || !formSku || !formBarcode || !formSalePrice || !formCostPrice || !formMinStock) {
      setFormError('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    try {
      const payload = {
        companyId: 'company-1',
        name: formName,
        brand: formBrand || 'Medley',
        description: formDescription || 'Medicação para distribuição comercial.',
        sku: formSku,
        barcode: formBarcode,
        salePrice: parseFloat(formSalePrice),
        costPrice: parseFloat(formCostPrice),
        minStock: parseInt(formMinStock),
        status: formStatus,
        imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200'
      };

      if (viewMode === 'create') {
        const p = DB.createProduct(payload);
        
        // Add to main stock with initial quantity
        const initialQty = parseInt(formInitialQty) || 0;
        if (initialQty > 0) {
          DB.updateMainStockQuantity(p.id, initialQty, 'entrada');
        }

        setFormSuccess('Produto cadastrado com sucesso e adicionado ao estoque!');
        setTimeout(() => {
          setViewMode('list');
          clearForm();
        }, 1500);
      } else if (viewMode === 'edit' && selectedProductId) {
        const original = products.find(p => p.id === selectedProductId);
        if (original) {
          DB.updateProduct({
            ...original,
            ...payload
          });
          setFormSuccess('Produto atualizado com sucesso!');
          setTimeout(() => {
            setViewMode('list');
            clearForm();
          }, 1500);
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Erro ao registrar produto.');
    }
  };

  const startEdit = (p: Product) => {
    setFormName(p.name);
    setFormBrand(p.brand);
    setFormDescription(p.description);
    setFormSku(p.sku);
    setFormBarcode(p.barcode);
    setFormSalePrice(p.salePrice.toString());
    setFormCostPrice(p.costPrice.toString());
    setFormMinStock(p.minStock.toString());
    setFormImageUrl(p.imageUrl || '');
    setFormStatus(p.status);
    
    setSelectedProductId(p.id);
    setViewMode('edit');
  };

  const handleTransferStock = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!transferSellerId || !transferProductId || !transferQty) {
      setFormError('Por favor, preencha todos os campos.');
      return;
    }

    const qty = parseInt(transferQty);
    if (isNaN(qty) || qty <= 0) {
      setFormError('A quantidade transferida deve ser maior que zero.');
      return;
    }

    try {
      DB.transferStockToSeller(transferSellerId, transferProductId, qty);
      setFormSuccess('Estoque transferido com sucesso para o representante!');
      
      // Reset transfer inputs
      setTransferQty('');
      setTimeout(() => {
        setFormSuccess('');
      }, 3000);
    } catch (err: any) {
      setFormError(err.message || 'Falha na transferência de estoque.');
    }
  };

  // Filter Product List
  const visibleProducts = products.filter(p => {
    if (searchQuery) {
      const matchText = `${p.name} ${p.brand} ${p.sku} ${p.barcode}`.toLowerCase();
      if (!matchText.includes(searchQuery.toLowerCase())) return false;
    }
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6" id="products-section">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-3xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Catálogo de Medicamentos</h1>
          <p className="text-xs text-gray-500 mt-1">Gerencie preços de custo, venda, SKUs e parametrizações de produtos.</p>
        </div>
        {currentUser.roleType === 'admin' && viewMode === 'list' && (
          <div className="flex gap-2">
            <button 
              onClick={() => { setViewMode('transfer'); clearForm(); }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-4 h-4 text-indigo-500" />
              Carregar Veículo
            </button>
            <button 
              onClick={() => { setViewMode('create'); clearForm(); }}
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm shadow-indigo-500/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Produto
            </button>
          </div>
        )}
      </div>

      {/* 1. LIST CATALOG VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-3xs flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="Buscar por nome, marca, SKU, código de barras..." 
                className="w-full bg-slate-50/50 hover:bg-slate-50 text-xs pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos Status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>

          {/* Cards catalog layout */}
          {visibleProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <Package className="w-12 h-12 text-gray-200 mx-auto" />
              <p className="text-sm text-gray-500 mt-2 font-medium">Nenhum medicamento localizado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleProducts.map(p => {
                const stockItem = mainStock.find(ms => ms.productId === p.id);
                const currentQty = stockItem ? stockItem.quantity : 0;
                const isLow = stockItem ? stockItem.status !== 'normal' : false;

                return (
                  <div key={p.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-2xs hover:border-indigo-300 transition-colors flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      {/* Brand and Status tag */}
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {p.brand}
                        </span>
                        <span className={`font-semibold px-2 py-0.5 rounded-full ${
                          p.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {p.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      {/* Name & SKU */}
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm tracking-tight">{p.name}</h3>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">SKU: {p.sku} | EAN: {p.barcode}</p>
                      </div>

                      {/* Description info */}
                      <p className="text-xs text-gray-500 line-clamp-2 h-8">{p.description}</p>

                      {/* Pricing block */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-[9px] text-gray-400 uppercase font-bold">Preço de Custo</span>
                          <p className="text-xs font-semibold text-gray-700">R$ {p.costPrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-indigo-500 uppercase font-bold">Preço de Venda</span>
                          <p className="text-sm font-bold text-indigo-600">R$ {p.salePrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stock tracker footer and admin edit action */}
                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 font-medium">Estoque Central:</span>
                        <p className={`font-bold ${isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                          {currentQty} un {isLow && '⚠️'}
                        </p>
                      </div>

                      {currentUser.roleType === 'admin' && (
                        <button
                          onClick={() => startEdit(p)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Editar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* 2. REGISTER / UPDATE FORM */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-3xs max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="font-bold text-gray-900 text-base">
              {viewMode === 'create' ? 'Cadastrar Novo Medicamento' : 'Editar Parametrização do Produto'}
            </h2>
            <button 
              onClick={() => setViewMode('list')}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          </div>

          {formError && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100">
              ⚠️ {formError}
            </div>
          )}

          {formSuccess && (
            <div className="bg-green-50 text-green-700 text-xs p-3 rounded-lg border border-green-100">
              ✓ {formSuccess}
            </div>
          )}

          <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Nome do Produto *</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Paracetamol 750mg comprimidos"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Marca / Laboratório *</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  value={formBrand}
                  onChange={(e) => setFormBrand(e.target.value)}
                  placeholder="Ex: Medley, EMS, Eurofarma"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1">Descrição</label>
              <textarea 
                className="w-full border border-gray-200 rounded-lg p-2.5 h-16 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Ex: Cartucho com 30 comprimidos, analgésico..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">SKU do Produto *</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  placeholder="Ex: MED-PAR-750"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Código de Barras (EAN) *</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  value={formBarcode}
                  onChange={(e) => setFormBarcode(e.target.value)}
                  placeholder="789XXXXXXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Preço de Custo (R$) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                  value={formCostPrice}
                  onChange={(e) => setFormCostPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Preço de Venda (R$) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                  value={formSalePrice}
                  onChange={(e) => setFormSalePrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Qtd Mínima (Alerta Estoque) *</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                  value={formMinStock}
                  onChange={(e) => setFormMinStock(e.target.value)}
                  placeholder="Ex: 100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {viewMode === 'create' && (
                <div>
                  <label className="block font-bold text-gray-500 mb-1">Estoque Inicial Central (Unidades)</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                    value={formInitialQty}
                    onChange={(e) => setFormInitialQty(e.target.value)}
                  />
                </div>
              )}
              <div>
                <label className="block font-bold text-gray-500 mb-1">Imagem URL</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Status Atendimento</label>
                <select 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-indigo-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-indigo-600 shadow-sm cursor-pointer"
              >
                {viewMode === 'create' ? 'Cadastrar Produto' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. STOCK TRANSFER PANEL (CARGA DE VEÍCULO) */}
      {viewMode === 'transfer' && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-3xs max-w-lg mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="font-bold text-gray-900 text-base flex items-center gap-1.5">
              <Truck className="w-5 h-5 text-indigo-500" />
              Carga e Abastecimento de Veículo
            </h2>
            <button 
              onClick={() => setViewMode('list')}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 flex gap-2">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p>
              Transfira lotes do estoque principal (central) diretamente para o carro de transporte do vendedor. O vendedor usará esse estoque em campo para reposições e entregas imediatas.
            </p>
          </div>

          {formError && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="bg-green-50 text-green-700 text-xs p-3 rounded-lg border border-green-100 font-medium">
              ✓ {formSuccess}
            </div>
          )}

          <form onSubmit={handleTransferStock} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-500 mb-1">1. Selecionar Vendedor (Representante)</label>
              <select 
                className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
                value={transferSellerId}
                onChange={(e) => setTransferSellerId(e.target.value)}
              >
                <option value="">Selecione Vendedor</option>
                {sellers.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.city})</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1">2. Selecionar Medicamento</label>
              <select 
                className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
                value={transferProductId}
                onChange={(e) => {
                  setTransferProductId(e.target.value);
                  setFormError('');
                }}
              >
                <option value="">Selecione Medicamento</option>
                {products.filter(p => p.status === 'active').map(p => {
                  const s = mainStock.find(ms => ms.productId === p.id);
                  const qty = s ? s.quantity : 0;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} (Disponível Central: {qty} un)
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1">3. Quantidade a Carregar</label>
              <input 
                type="number" 
                placeholder="Ex: 50"
                className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                value={transferQty}
                onChange={(e) => setTransferQty(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              Transferir e Autorizar Carga
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
