/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Target, 
  Plus, 
  TrendingUp, 
  Award, 
  ShieldAlert, 
  Edit, 
  ArrowLeft,
  Mail,
  MapPin,
  Lock,
  Percent,
  CheckCircle,
  FileCheck,
  Trash2
} from 'lucide-react';
import { DB } from '../services/db';
import { User, Goal } from '../types';

export default function TeamSection() {
  const sellers = DB.getUsers().filter(u => u.roleType === 'seller');
  const goals = DB.getGoals();

  // Navigation
  const [viewMode, setViewMode] = useState<'list' | 'create_seller' | 'set_goal' | 'edit_seller'>('list');

  // Seller Form States
  const [formUsername, setFormUsername] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formPassword, setFormPassword] = useState('');

  // Goal Form States
  const [goalSellerId, setGoalSellerId] = useState('');
  const [goalMonth, setGoalMonth] = useState('7'); // July
  const [goalYear, setGoalYear] = useState('2026');
  const [goalTargetSales, setGoalTargetSales] = useState('');
  const [goalTargetRevenue, setGoalTargetRevenue] = useState('');

  // Local notifications
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editing and Deleting States
  const [editingSellerId, setEditingSellerId] = useState<string | null>(null);
  const [deletingSeller, setDeletingSeller] = useState<User | null>(null);

  const clearFormSeller = () => {
    setFormUsername('');
    setFormFullName('');
    setFormEmail('');
    setFormCity('');
    setFormPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const clearFormGoal = () => {
    setGoalSellerId('');
    setGoalTargetSales('');
    setGoalTargetRevenue('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const startEditSeller = (seller: User) => {
    setEditingSellerId(seller.id);
    setFormUsername(seller.username);
    setFormFullName(seller.fullName);
    setFormEmail(seller.email);
    setFormCity(seller.city);
    setFormPassword(''); // blank to keep current
    setViewMode('edit_seller');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const startDeleteSeller = (seller: User) => {
    setDeletingSeller(seller);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const confirmDeleteSeller = () => {
    if (!deletingSeller) return;
    try {
      DB.deleteUser(deletingSeller.id);
      setSuccessMsg(`Vendedor ${deletingSeller.fullName} foi removido com sucesso.`);
      setTimeout(() => {
        setDeletingSeller(null);
        setSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao remover vendedor.');
    }
  };

  const handleCreateSeller = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formUsername || !formFullName || !formEmail || !formCity || !formPassword) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    try {
      DB.createUser({
        username: formUsername,
        password: formPassword,
        fullName: formFullName,
        email: formEmail,
        city: formCity,
        state: 'SP',
        phone: '(11) 9' + Math.floor(10000000 + Math.random() * 90000000),
        roleType: 'seller',
        status: 'active'
      });

      setSuccessMsg('Vendedor / Representante cadastrado com sucesso!');
      setTimeout(() => {
        setViewMode('list');
        clearFormSeller();
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao cadastrar vendedor.');
    }
  };

  const handleEditSeller = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formUsername || !formFullName || !formEmail || !formCity) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    try {
      const existingUsers = DB.getUsers();
      const current = existingUsers.find(u => u.id === editingSellerId);
      if (!current) {
        throw new Error('Vendedor não encontrado.');
      }

      // Check unique username if username changed
      if (formUsername.toLowerCase() !== current.username.toLowerCase() &&
          existingUsers.some(existing => existing.id !== current.id && existing.username.toLowerCase() === formUsername.toLowerCase())) {
        throw new Error(`O usuário "${formUsername}" já existe.`);
      }

      const updatedUser: User = {
        ...current,
        username: formUsername,
        fullName: formFullName,
        email: formEmail,
        city: formCity,
        password: formPassword || current.password,
      };

      DB.updateUser(updatedUser);

      setSuccessMsg('Vendedor atualizado com sucesso!');
      setTimeout(() => {
        setViewMode('list');
        clearFormSeller();
        setEditingSellerId(null);
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao atualizar vendedor.');
    }
  };

  const handleSetGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!goalSellerId || !goalTargetSales || !goalTargetRevenue) {
      setErrorMsg('Preencha os campos de metas obrigatórios (*).');
      return;
    }

    const sales = parseInt(goalTargetSales);
    const rev = parseFloat(goalTargetRevenue);

    if (isNaN(sales) || sales <= 0 || isNaN(rev) || rev <= 0) {
      setErrorMsg('Metas de volume e receita devem ser maiores que zero.');
      return;
    }

    try {
      DB.createGoal({
        sellerId: goalSellerId,
        companyId: 'company-1',
        month: parseInt(goalMonth),
        year: parseInt(goalYear),
        salesGoal: sales,
        revenueGoal: rev,
        visitsGoal: 15,
        currentSales: 0,
        currentVisits: 0,
        currentRevenue: 0
      });

      setSuccessMsg('Metas comerciais estabelecidas com sucesso para o período!');
      setTimeout(() => {
        setViewMode('list');
        clearFormGoal();
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao parametrizar metas.');
    }
  };

  return (
    <div className="space-y-6" id="team-section">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-3xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gestão de Equipe e Metas</h1>
          <p className="text-xs text-gray-500 mt-1">Supervisione representantes farmacêuticos, defina objetivos mensais e acompanhe metas de faturamento.</p>
        </div>
        
        {viewMode === 'list' && (
          <div className="flex gap-2 text-xs font-semibold">
            <button 
              onClick={() => { setViewMode('set_goal'); clearFormGoal(); }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Target className="w-4 h-4 text-emerald-500" />
              Estipular Meta
            </button>
            <button 
              onClick={() => { setViewMode('create_seller'); clearFormSeller(); }}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm shadow-indigo-500/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Vendedor
            </button>
          </div>
        )}
      </div>

      {/* 1. MANAGEMENT LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          
          {/* Sellers card grid list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sellers.map((seller) => {
              // Fetch goals for this seller for current month (July 2026)
              const sellerGoal = goals.find(g => g.sellerId === seller.id && g.month === 7 && g.year === 2026);
              
              const currentSales = sellerGoal ? sellerGoal.currentSales : 0;
              const targetSales = sellerGoal ? sellerGoal.salesGoal : 0;
              const salesPct = targetSales > 0 ? Math.min(Math.round((currentSales / targetSales) * 100), 100) : 0;

              const currentRev = sellerGoal ? sellerGoal.currentRevenue : 0;
              const targetRev = sellerGoal ? sellerGoal.revenueGoal : 0;
              const revPct = targetRev > 0 ? Math.min(Math.round((currentRev / targetRev) * 100), 100) : 0;

              return (
                <div key={seller.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs flex flex-col justify-between gap-5 hover:border-indigo-200 transition-all text-xs">
                  <div className="space-y-3">
                    {/* Header seller metadata */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-gray-900 text-sm">{seller.fullName}</h3>
                        <p className="text-[10px] text-gray-400 font-mono">@{seller.username}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {seller.city}
                        </span>
                        <button
                          onClick={() => startEditSeller(seller)}
                          className="p-1 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                          title="Editar representante"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => startDeleteSeller(seller)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                          title="Remover representante"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-gray-500">
                      <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {seller.email}</p>
                      <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> Cobertura: {seller.city} (SP)</p>
                    </div>

                    {/* Progress indicators for goals */}
                    {sellerGoal ? (
                      <div className="space-y-3 pt-2">
                        {/* 1. Sales Target */}
                        <div className="space-y-1">
                          <div className="flex justify-between font-semibold text-[10px] text-gray-500">
                            <span>Vendas: {currentSales} / {targetSales} un</span>
                            <span className="text-indigo-600 font-bold">{salesPct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${salesPct}%` }} />
                          </div>
                        </div>

                        {/* 2. Revenue Target */}
                        <div className="space-y-1">
                          <div className="flex justify-between font-semibold text-[10px] text-gray-500">
                            <span>Receita: R$ {currentRev.toFixed(0)} / R$ {targetRev.toFixed(0)}</span>
                            <span className="text-emerald-600 font-bold">{revPct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${revPct}%` }} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-lg text-center text-gray-400 italic">
                        Nenhuma meta estabelecida para Julho/2026.
                      </div>
                    )}
                  </div>

                  {/* Achievements footer */}
                  {sellerGoal && (salesPct >= 100 || revPct >= 100) && (
                    <div className="p-2 bg-amber-50/60 rounded-lg border border-amber-100 flex items-center gap-1.5 text-[11px] text-amber-700 font-bold">
                      <Award className="w-4 h-4 text-amber-500 animate-bounce" />
                      <span>Premiações de superação liberadas!</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* 2. CREATE SELLER ACCOUNT FORM */}
      {viewMode === 'create_seller' && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-3xs max-w-md mx-auto space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="font-bold text-gray-900 text-sm">Criar Conta de Representante Comercial</h2>
            <button onClick={() => setViewMode('list')} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-0.5 cursor-pointer font-semibold">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          </div>

          {errorMsg && <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-xs font-medium">⚠️ {errorMsg}</div>}
          {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 text-xs font-medium">✓ {successMsg}</div>}

          <form onSubmit={handleCreateSeller} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-500 mb-1">Nome de Usuário (Username) *</label>
              <input 
                type="text" 
                placeholder="Ex: joao_representante"
                className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 text-xs focus:ring-1 focus:ring-indigo-500"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1">Nome Completo *</label>
              <input 
                type="text" 
                placeholder="Ex: João da Silva Santos"
                className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 text-xs focus:ring-1 focus:ring-indigo-500"
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">E-mail Comercial *</label>
                <input 
                  type="email" 
                  placeholder="joao@pharmaroute.com"
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 text-xs focus:ring-1 focus:ring-indigo-500"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-500 mb-1">Cidade Cobertura (Atuação) *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Campinas, Bauru"
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 text-xs focus:ring-1 focus:ring-indigo-500"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1">Senha de Acesso Temporária *</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="********"
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 text-xs focus:ring-1 focus:ring-indigo-500 pl-9"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              Cadastrar Representante Back4App
            </button>
          </form>
        </div>
      )}

      {/* 3. SET COMMERCIAL GOALS FORM */}
      {viewMode === 'set_goal' && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-3xs max-w-md mx-auto space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="font-bold text-gray-900 text-sm">Estipular Metas Mensais de Atendimento</h2>
            <button onClick={() => setViewMode('list')} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-0.5 cursor-pointer font-semibold">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          </div>

          {errorMsg && <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-xs font-medium">⚠️ {errorMsg}</div>}
          {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 text-xs font-medium">✓ {successMsg}</div>}

          <form onSubmit={handleSetGoal} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-500 mb-1">Selecionar Representante *</label>
              <select 
                className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs focus:ring-1 focus:ring-indigo-500"
                value={goalSellerId}
                onChange={(e) => setGoalSellerId(e.target.value)}
              >
                <option value="">Selecione o vendedor...</option>
                {sellers.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.city})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Mês Comercial *</label>
                <select 
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs focus:ring-1 focus:ring-indigo-500"
                  value={goalMonth}
                  onChange={(e) => setGoalMonth(e.target.value)}
                >
                  <option value="1">Janeiro</option>
                  <option value="2">Fevereiro</option>
                  <option value="3">Março</option>
                  <option value="4">Abril</option>
                  <option value="5">Maio</option>
                  <option value="6">Junho</option>
                  <option value="7">Julho</option>
                  <option value="8">Agosto</option>
                  <option value="9">Setembro</option>
                  <option value="10">Outubro</option>
                  <option value="11">Novembro</option>
                  <option value="12">Dezembro</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-500 mb-1">Ano Comercial *</label>
                <select 
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs focus:ring-1 focus:ring-indigo-500"
                  value={goalYear}
                  onChange={(e) => setGoalYear(e.target.value)}
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Meta Volumétrica (Vendas un) *</label>
                <input 
                  type="number" 
                  placeholder="Ex: 1000"
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 text-xs focus:ring-1 focus:ring-indigo-500"
                  value={goalTargetSales}
                  onChange={(e) => setGoalTargetSales(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-500 mb-1">Meta Faturamento Líquido (R$) *</label>
                <input 
                  type="number" 
                  placeholder="Ex: 50000"
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 text-xs focus:ring-1 focus:ring-indigo-500"
                  value={goalTargetRevenue}
                  onChange={(e) => setGoalTargetRevenue(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              Sincronizar Metas
            </button>
          </form>
        </div>
      )}

      {/* 4. EDIT SELLER ACCOUNT FORM */}
      {viewMode === 'edit_seller' && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-3xs max-w-md mx-auto space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="font-bold text-gray-900 text-sm">Editar Conta de Representante Comercial</h2>
            <button onClick={() => { setViewMode('list'); clearFormSeller(); setEditingSellerId(null); }} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-0.5 cursor-pointer font-semibold">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          </div>

          {errorMsg && <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-xs font-medium">⚠️ {errorMsg}</div>}
          {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 text-xs font-medium">✓ {successMsg}</div>}

          <form onSubmit={handleEditSeller} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-500 mb-1">Nome de Usuário (Username) *</label>
              <input 
                type="text" 
                placeholder="Ex: joao_representante"
                className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 text-xs focus:ring-1 focus:ring-indigo-500"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1">Nome Completo *</label>
              <input 
                type="text" 
                placeholder="Ex: João da Silva Santos"
                className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 text-xs focus:ring-1 focus:ring-indigo-500"
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">E-mail Comercial *</label>
                <input 
                  type="email" 
                  placeholder="joao@pharmaroute.com"
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 text-xs focus:ring-1 focus:ring-indigo-500"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-500 mb-1">Cidade Cobertura (Atuação) *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Campinas, Bauru"
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 text-xs focus:ring-1 focus:ring-indigo-500"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1">Nova Senha (deixe em branco para manter a atual)</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="Defina se deseja alterar"
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 text-xs focus:ring-1 focus:ring-indigo-500 pl-9"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              Salvar Alterações
            </button>
          </form>
        </div>
      )}

      {/* 5. CONFIRM DELETE MODAL */}
      {deletingSeller && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-sm w-full space-y-4 shadow-xl animate-in fade-in zoom-in-95 text-center text-xs">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 text-sm">Remover Representante?</h3>
              <p className="text-gray-500 leading-relaxed">
                Você está prestes a remover <strong>{deletingSeller.fullName}</strong> (@{deletingSeller.username}). Esta ação irá desvincular o vendedor, mas manterá os históricos de vendas anteriores.
              </p>
            </div>

            {errorMsg && <div className="bg-red-50 text-red-700 p-2 rounded-lg border border-red-100 text-[10px] font-medium">⚠️ {errorMsg}</div>}
            {successMsg && <div className="bg-green-50 text-green-700 p-2 rounded-lg border border-green-100 text-[10px] font-medium">✓ {successMsg}</div>}

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setDeletingSeller(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteSeller}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-xl shadow-md shadow-rose-600/10 cursor-pointer"
              >
                Confirmar Remoção
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
