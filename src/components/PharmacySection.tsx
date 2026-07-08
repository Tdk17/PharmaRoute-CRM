/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Plus, 
  Search, 
  Calendar, 
  ShoppingBag, 
  ExternalLink, 
  MessageSquare, 
  PlusCircle, 
  Edit, 
  Check, 
  ArrowLeft,
  ChevronRight,
  Package,
  Clock,
  User,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { DB } from '../services/db';
import { Pharmacy, PharmacyStock, Sale, Visit, User as UserType } from '../types';

interface PharmacySectionProps {
  currentUser: UserType;
  onNavigateToSale: (pharmacyId: string) => void;
  onNavigateToSchedule: (pharmacyId: string) => void;
}

export default function PharmacySection({ currentUser, onNavigateToSale, onNavigateToSchedule }: PharmacySectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const pharmacies = useMemo(() => DB.getPharmacies(), [refreshKey]);
  const sellers = useMemo(() => DB.getUsers().filter(u => u.roleType === 'seller'), [refreshKey]);
  const allSales = useMemo(() => DB.getSales(), [refreshKey]);
  const allVisits = useMemo(() => DB.getVisits(), [refreshKey]);
  const pStocks = useMemo(() => DB.getPharmacyStock(), [refreshKey]);
  const products = useMemo(() => DB.getProducts(), [refreshKey]);

  // Navigation State inside Section
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'detail' | 'edit'>('list');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);

  // Delete Pharmacy states
  const [deletingPharmacyId, setDeletingPharmacyId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const confirmDeletePharmacy = () => {
    if (!deletingPharmacyId) return;
    try {
      DB.deletePharmacy(deletingPharmacyId);
      setDeletingPharmacyId(null);
      setSelectedPharmacyId(null);
      setViewMode('list');
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      setDeleteError(err.message || 'Erro ao remover farmácia do banco de dados.');
    }
  };

  const deletingPharmacyObj = useMemo(() => {
    if (!deletingPharmacyId) return null;
    return pharmacies.find(p => p.id === deletingPharmacyId);
  }, [deletingPharmacyId, pharmacies]);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterSeller, setFilterSeller] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formLegalName, setFormLegalName] = useState('');
  const [formCnpj, setFormCnpj] = useState('');
  const [formResponsible, setFormResponsible] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCep, setFormCep] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formNeighborhood, setFormNeighborhood] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('SP');
  const [formComplement, setFormComplement] = useState('');
  const [formLatitude, setFormLatitude] = useState('-22.8944');
  const [formLongitude, setFormLongitude] = useState('-47.0503');
  const [formPreferredDays, setFormPreferredDays] = useState<string[]>([]);
  const [formPreferredTime, setFormPreferredTime] = useState('Manhã');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formAssignedSeller, setFormAssignedSeller] = useState('');

  // Error/Success Notification Inside form
  const [formError, setFormError] = useState('');

  // Toggle Days Checklist
  const handleDayToggle = (day: string) => {
    if (formPreferredDays.includes(day)) {
      setFormPreferredDays(formPreferredDays.filter(d => d !== day));
    } else {
      setFormPreferredDays([...formPreferredDays, day]);
    }
  };

  // Populate form for Edit
  const startEdit = (ph: Pharmacy) => {
    setFormName(ph.name);
    setFormLegalName(ph.legalName);
    setFormCnpj(ph.cnpj);
    setFormResponsible(ph.responsibleName);
    setFormPhone(ph.phone);
    setFormWhatsapp(ph.whatsapp);
    setFormEmail(ph.email);
    setFormCep(ph.cep);
    setFormAddress(ph.address);
    setFormNumber(ph.number);
    setFormNeighborhood(ph.neighborhood);
    setFormCity(ph.city);
    setFormState(ph.state);
    setFormComplement(ph.complement || '');
    setFormLatitude(ph.latitude.toString());
    setFormLongitude(ph.longitude.toString());
    setFormPreferredDays(ph.preferredDays);
    setFormPreferredTime(ph.preferredTime);
    setFormNotes(ph.notes || '');
    setFormStatus(ph.status);
    setFormAssignedSeller(ph.assignedSellerId);
    
    setSelectedPharmacyId(ph.id);
    setViewMode('edit');
  };

  // Save new or updated pharmacy
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName || !formCnpj || !formResponsible || !formWhatsapp || !formAddress || !formCity) {
      setFormError('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    const payload = {
      companyId: 'company-1',
      name: formName,
      legalName: formLegalName || formName,
      cnpj: formCnpj,
      responsibleName: formResponsible,
      phone: formPhone || formWhatsapp,
      whatsapp: formWhatsapp,
      email: formEmail || 'contato@farmacia.com',
      cep: formCep,
      address: formAddress,
      number: formNumber,
      neighborhood: formNeighborhood,
      city: formCity,
      state: formState,
      complement: formComplement,
      latitude: parseFloat(formLatitude) || -22.8944,
      longitude: parseFloat(formLongitude) || -47.0503,
      googleMapsUrl: `https://maps.google.com/?q=${formLatitude},${formLongitude}`,
      preferredDays: formPreferredDays.length > 0 ? formPreferredDays : ['Seg'],
      preferredTime: formPreferredTime,
      notes: formNotes,
      status: formStatus,
      assignedSellerId: formAssignedSeller || currentUser.id
    };

    try {
      if (viewMode === 'create') {
        const ph = DB.createPharmacy(payload);
        setSelectedPharmacyId(ph.id);
        setViewMode('detail');
      } else if (viewMode === 'edit' && selectedPharmacyId) {
        const original = pharmacies.find(p => p.id === selectedPharmacyId);
        if (original) {
          DB.updatePharmacy({
            ...original,
            ...payload
          });
          setViewMode('detail');
        }
      }
      // Reset form states
      clearForm();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar farmácia.');
    }
  };

  const clearForm = () => {
    setFormName('');
    setFormLegalName('');
    setFormCnpj('');
    setFormResponsible('');
    setFormPhone('');
    setFormWhatsapp('');
    setFormEmail('');
    setFormCep('');
    setFormAddress('');
    setFormNumber('');
    setFormNeighborhood('');
    setFormCity('');
    setFormState('SP');
    setFormComplement('');
    setFormLatitude('-22.8944');
    setFormLongitude('-47.0503');
    setFormPreferredDays([]);
    setFormPreferredTime('Manhã');
    setFormNotes('');
    setFormStatus('active');
    setFormAssignedSeller('');
  };

  const startCreate = () => {
    clearForm();
    setViewMode('create');
  };

  // Filter List based on permissions
  const visiblePharmacies = pharmacies.filter(p => {
    // Sellers can only view their assigned pharmacies
    if (currentUser.roleType === 'seller' && p.assignedSellerId !== currentUser.id) {
      return false;
    }

    // Search query matches
    if (searchQuery) {
      const matchText = `${p.name} ${p.legalName} ${p.cnpj} ${p.responsibleName}`.toLowerCase();
      if (!matchText.includes(searchQuery.toLowerCase())) return false;
    }

    // City Filter
    if (filterCity && p.city !== filterCity) return false;

    // Seller Filter (Admin only)
    if (currentUser.roleType === 'admin' && filterSeller && p.assignedSellerId !== filterSeller) return false;

    // Status Filter
    if (filterStatus && p.status !== filterStatus) return false;

    return true;
  });

  const cities = Array.from(new Set(pharmacies.map(p => p.city)));

  // Selected Detail Elements
  const selectedPharmacy = pharmacies.find(p => p.id === selectedPharmacyId);
  const pharmacyVisits = selectedPharmacy ? allVisits.filter(v => v.pharmacyId === selectedPharmacy.id) : [];
  const pharmacySales = selectedPharmacy ? allSales.filter(s => s.pharmacyId === selectedPharmacy.id) : [];
  const pharmacyStockLevels = selectedPharmacy ? pStocks.filter(ps => ps.pharmacyId === selectedPharmacy.id) : [];

  return (
    <div className="space-y-6" id="pharmacies-section">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-3xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Farmácias Clientes</h1>
          <p className="text-xs text-gray-500 mt-1">Cadastre, localize e acompanhe consignações em tempo real.</p>
        </div>
        {viewMode === 'list' && (
          <button 
            onClick={startCreate}
            className="bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm shadow-indigo-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Farmácia
          </button>
        )}
      </div>

      {/* 1. LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-3xs flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="Buscar por nome, CNPJ, responsável..." 
                className="w-full bg-slate-50/50 hover:bg-slate-50 text-xs pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* City */}
            <select 
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
            >
              <option value="">Todas Cidades</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {/* Seller (Admin only) */}
            {currentUser.roleType === 'admin' && (
              <select 
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={filterSeller}
                onChange={(e) => setFilterSeller(e.target.value)}
              >
                <option value="">Todos Representantes</option>
                {sellers.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
              </select>
            )}
            {/* Status */}
            <select 
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos Status</option>
              <option value="active">Ativa</option>
              <option value="inactive">Inativa</option>
            </select>
          </div>

          {/* Cards List Grid */}
          {visiblePharmacies.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <Building2 className="w-12 h-12 text-gray-200 mx-auto" />
              <p className="text-sm text-gray-500 mt-2 font-medium">Nenhuma farmácia localizada para os filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visiblePharmacies.map((ph) => {
                const assignedSeller = sellers.find(s => s.id === ph.assignedSellerId);
                const isMyPharmacy = currentUser.roleType === 'seller' && ph.assignedSellerId === currentUser.id;
                
                return (
                  <div 
                    key={ph.id}
                    onClick={() => { setSelectedPharmacyId(ph.id); setViewMode('detail'); }}
                    className="bg-white p-5 rounded-xl border border-gray-100 hover:border-indigo-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors text-sm truncate max-w-[200px]" title={ph.name}>
                          {ph.name}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-mono">CNPJ: {ph.cnpj}</p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ph.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {ph.status === 'active' ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-gray-50 pt-3 text-xs text-gray-600">
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{ph.address}, {ph.number} - {ph.city}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{ph.whatsapp} ({ph.responsibleName})</span>
                      </p>
                      {currentUser.roleType === 'admin' && assignedSeller && (
                        <p className="flex items-center gap-1.5 text-[11px] bg-slate-50 p-1.5 rounded-md mt-1 font-medium text-slate-700">
                          <User className="w-3 h-3 text-indigo-500" />
                          <span>Rep: {assignedSeller.fullName}</span>
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                      <div>
                        <span>Última visita: </span>
                        <span className="font-semibold text-slate-700">
                          {ph.lastVisitDate ? new Date(ph.lastVisitDate).toLocaleDateString('pt-BR') : 'Nenhuma realizada'}
                        </span>
                      </div>
                      {currentUser.roleType === 'admin' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingPharmacyId(ph.id);
                            setDeleteError('');
                          }}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          title="Excluir Farmácia"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* 2. CREATE / EDIT FORM */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-3xs max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="font-bold text-gray-900 text-base">
              {viewMode === 'create' ? 'Cadastrar Nova Farmácia' : 'Editar Dados da Farmácia'}
            </h2>
            <button 
              onClick={() => setViewMode(viewMode === 'edit' ? 'detail' : 'list')}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          </div>

          {formError && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2 border border-red-100">
              <span>⚠️</span> {formError}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Nome Fantasia *</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Farmácia do Povo Centro"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Razão Social</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  value={formLegalName}
                  onChange={(e) => setFormLegalName(e.target.value)}
                  placeholder="Razão Social completa"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">CNPJ *</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  value={formCnpj}
                  onChange={(e) => setFormCnpj(e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Farmacêutico Responsável / Comprador *</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  value={formResponsible}
                  onChange={(e) => setFormResponsible(e.target.value)}
                  placeholder="Nome do contato principal"
                />
              </div>
            </div>

            {/* Contacts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">WhatsApp de Contato *</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  value={formWhatsapp}
                  onChange={(e) => setFormWhatsapp(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Telefone Fixo</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="(11) 3333-3333"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">E-mail</label>
                <input 
                  type="email" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="contato@empresa.com"
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3">
                <label className="block font-bold text-gray-500 mb-1">Endereço Completo *</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Número *</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value)}
                  placeholder="Ex: 123"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Bairro</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  value={formNeighborhood}
                  onChange={(e) => setFormNeighborhood(e.target.value)}
                  placeholder="Ex: Cambuí"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">CEP</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  value={formCep}
                  onChange={(e) => setFormCep(e.target.value)}
                  placeholder="00000-000"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Cidade *</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  placeholder="Ex: Campinas"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Estado</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  value={formState}
                  onChange={(e) => setFormState(e.target.value)}
                  placeholder="SP"
                />
              </div>
            </div>

            {/* GPS Simulation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Latitude (GPS)</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                  value={formLatitude}
                  onChange={(e) => setFormLatitude(e.target.value)}
                  placeholder="Ex: -22.8944"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Longitude (GPS)</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                  value={formLongitude}
                  onChange={(e) => setFormLongitude(e.target.value)}
                  placeholder="Ex: -47.0503"
                />
              </div>
            </div>

            {/* Assignment & Routing specifics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Representante Atribuído</label>
                <select 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
                  value={formAssignedSeller}
                  onChange={(e) => setFormAssignedSeller(e.target.value)}
                >
                  <option value="">Selecione Vendedor</option>
                  {sellers.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Horário de Atendimento</label>
                <select 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
                  value={formPreferredTime}
                  onChange={(e) => setFormPreferredTime(e.target.value)}
                >
                  <option value="Manhã">Manhã (08h às 12h)</option>
                  <option value="Tarde">Tarde (13h às 18h)</option>
                  <option value="Integral">Integral</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Status</label>
                <select 
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                >
                  <option value="active">Ativa</option>
                  <option value="inactive">Inativa</option>
                </select>
              </div>
            </div>

            {/* Days selection */}
            <div>
              <label className="block font-bold text-gray-500 mb-1">Dias Preferenciais de Atendimento</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => {
                  const selected = formPreferredDays.includes(day);
                  return (
                    <button
                       type="button"
                       key={day}
                       onClick={() => handleDayToggle(day)}
                       className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                        selected 
                          ? 'bg-indigo-500 text-white border-indigo-500' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-bold text-gray-500 mb-1">Observações / Instruções Internas</label>
              <textarea 
                className="w-full border border-gray-200 rounded-lg p-2.5 h-20 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Insira detalhes sobre contato, melhor horário ou acordos específicos..."
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'edit' ? 'detail' : 'list')}
                className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-indigo-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-indigo-600 shadow-sm cursor-pointer"
              >
                Salvar Farmácia
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. DETAIL VIEW */}
      {viewMode === 'detail' && selectedPharmacy && (
        <div className="space-y-6">
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100">
            <button 
              onClick={() => setViewMode('list')}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer self-start sm:self-auto font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para a lista
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => startEdit(selectedPharmacy)}
                className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" /> Editar
              </button>

              <button 
                onClick={() => onNavigateToSchedule(selectedPharmacy.id)}
                className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-100 flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Nova Visita
              </button>

              <button 
                onClick={() => onNavigateToSale(selectedPharmacy.id)}
                className="bg-emerald-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg hover:bg-emerald-600 flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Nova Venda
              </button>

              {currentUser.roleType === 'admin' && (
                <button 
                  onClick={() => {
                    setDeletingPharmacyId(selectedPharmacy.id);
                    setDeleteError('');
                  }}
                  className="bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-100 flex items-center gap-1 cursor-pointer"
                  title="Remover Farmácia permanentemente"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </button>
              )}
            </div>
          </div>

          {/* Details Overview Block */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side card: parameters & contacts */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs space-y-4 lg:col-span-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Farmácia Cliente</span>
                <h2 className="text-lg font-bold text-gray-900 mt-1">{selectedPharmacy.name}</h2>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 ${selectedPharmacy.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {selectedPharmacy.status === 'active' ? 'Atendimento Ativo' : 'Atendimento Inativo'}
                </span>
              </div>

              {/* Contacts info list */}
              <div className="space-y-3 pt-3 border-t border-gray-50 text-xs">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Responsável</div>
                  <div className="text-gray-800 font-medium">{selectedPharmacy.responsibleName}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Documentação</div>
                  <div className="text-gray-800 font-mono">CNPJ: {selectedPharmacy.cnpj}</div>
                  {selectedPharmacy.legalName && (
                    <div className="text-[11px] text-gray-500">Razão: {selectedPharmacy.legalName}</div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Contato Direto</div>
                  <div className="text-gray-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {selectedPharmacy.whatsapp}
                  </div>
                  <div className="text-gray-800 flex items-center gap-1 truncate">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {selectedPharmacy.email}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Endereço</div>
                  <div className="text-gray-800 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <span>
                      {selectedPharmacy.address}, {selectedPharmacy.number} {selectedPharmacy.complement && `(${selectedPharmacy.complement})`} <br />
                      {selectedPharmacy.neighborhood} • {selectedPharmacy.city} - {selectedPharmacy.state} <br />
                      CEP: {selectedPharmacy.cep}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Regras de Atendimento</div>
                  <div className="text-gray-800 font-medium">Dias: {selectedPharmacy.preferredDays.join(', ')}</div>
                  <div className="text-gray-800 font-medium">Horário: {selectedPharmacy.preferredTime}</div>
                </div>

                {selectedPharmacy.notes && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600">
                    <strong>Anotações:</strong> {selectedPharmacy.notes}
                  </div>
                )}
              </div>

              {/* Actions shortcuts */}
              <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-2 text-xs">
                <a 
                  href={`https://maps.google.com/?q=${selectedPharmacy.latitude},${selectedPharmacy.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-indigo-50 text-indigo-700 font-semibold p-2.5 rounded-lg hover:bg-indigo-100 text-center flex items-center justify-center gap-1 border border-indigo-100"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir GPS
                </a>
                <a 
                  href={`https://wa.me/55${selectedPharmacy.whatsapp.replace(/\D/g, '')}?text=Ol%C3%A1!%20Como%20est%C3%A3o%20os%20estoques%3F`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-green-50 text-green-700 font-semibold p-2.5 rounded-lg hover:bg-green-100 text-center flex items-center justify-center gap-1 border border-green-100"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Right side tab sections: Consigned stock, Visits, and Sales histories */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Consigned Stocks (Produtos deixados) */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 mb-4">
                  <Package className="w-4 h-4 text-indigo-500" />
                  Produtos em Consignação (Estoque Deixado)
                </h3>

                {pharmacyStockLevels.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-6 text-center bg-slate-50/50 rounded-lg">
                    Nenhum estoque consignado registrado nesta farmácia. Use "Nova Venda" para reabastecer.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                          <th className="pb-2">Produto</th>
                          <th className="pb-2 text-center">Entregue</th>
                          <th className="pb-2 text-center">Vendido</th>
                          <th className="pb-2 text-center">Restante</th>
                          <th className="pb-2 text-right">Data Envio</th>
                          <th className="pb-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-gray-700">
                        {pharmacyStockLevels.map(ps => {
                          const prod = products.find(p => p.id === ps.productId);
                          return (
                            <tr key={ps.id}>
                              <td className="py-3 font-semibold text-gray-900">{prod ? prod.name : 'Produto'}</td>
                              <td className="py-3 text-center">{ps.quantityDelivered}</td>
                              <td className="py-3 text-center text-emerald-600 font-medium">{ps.quantitySold}</td>
                              <td className="py-3 text-center font-bold text-slate-800 bg-slate-50 rounded-md">{ps.quantityRemaining}</td>
                              <td className="py-3 text-right text-gray-500">{new Date(ps.deliveryDate).toLocaleDateString('pt-BR')}</td>
                              <td className="py-3 text-right">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  ps.status === 'available' ? 'bg-green-50 text-green-700' : (ps.status === 'low' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700')
                                }`}>
                                  {ps.status === 'available' ? 'Normal' : (ps.status === 'low' ? 'Baixo' : 'Esgotado')}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Double history block: Sales & Visits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visits History */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs space-y-3">
                  <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1 mb-2 uppercase tracking-wider text-gray-400">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    Histórico de Visitas
                  </h3>

                  {pharmacyVisits.length === 0 ? (
                    <p className="text-xs text-gray-500 italic py-4 text-center">Nenhuma visita registrada.</p>
                  ) : (
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                      {pharmacyVisits.map(v => (
                        <div key={v.id} className="p-2.5 bg-slate-50/50 rounded-lg border border-slate-100 text-xs">
                          <div className="flex justify-between font-bold text-gray-900">
                            <span>{new Date(v.scheduledDate).toLocaleDateString('pt-BR')} às {v.scheduledTime}h</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                              v.status === 'completed' ? 'bg-green-50 text-green-700' : (v.status === 'scheduled' ? 'bg-indigo-50 text-indigo-700' : 'bg-red-50 text-red-700')
                            }`}>
                              {v.status === 'completed' ? 'Conclúida' : (v.status === 'scheduled' ? 'Agendada' : 'Cancelada')}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{v.objective}</p>
                          {v.result && (
                            <p className="text-[11px] text-green-700 font-medium mt-1">Resultado: {v.result}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sales history */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs space-y-3">
                  <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1 mb-2 uppercase tracking-wider text-gray-400">
                    <ShoppingBag className="w-4 h-4 text-emerald-500" />
                    Histórico de Faturamento
                  </h3>

                  {pharmacySales.length === 0 ? (
                    <p className="text-xs text-gray-500 italic py-4 text-center">Nenhuma venda faturada.</p>
                  ) : (
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                      {pharmacySales.map(s => {
                        const prodName = products.find(p => p.id === s.productId)?.name || 'Produto';
                        return (
                          <div key={s.id} className="p-2.5 bg-slate-50/50 rounded-lg border border-slate-100 text-xs">
                            <div className="flex justify-between font-bold text-gray-900">
                              <span>R$ {s.total.toFixed(2)}</span>
                              <span className="text-[10px] text-gray-400">{new Date(s.saleDate).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <p className="text-gray-600 mt-1">{s.quantity}un de {prodName}</p>
                            {s.discount > 0 && <span className="text-[10px] text-amber-600 font-semibold">Desconto: {s.discount}%</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* DELETE PHARMACY CONFIRMATION MODAL */}
      {deletingPharmacyId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden transform scale-100 transition-all text-left text-xs">
            <div className="bg-red-50 p-5 border-b border-red-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                <h3 className="font-bold text-sm">Remover Farmácia do Sistema</h3>
              </div>
              <button 
                onClick={() => setDeletingPharmacyId(null)}
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
                  Tem certeza absoluta de que deseja remover a seguinte farmácia de forma permanente?
                </p>
                {deletingPharmacyObj ? (
                  <div className="p-3.5 bg-slate-50 border border-gray-100 rounded-xl">
                    <p className="font-bold text-gray-900 text-xs">{deletingPharmacyObj.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      CNPJ: {deletingPharmacyObj.cnpj} • {deletingPharmacyObj.city} - {deletingPharmacyObj.state}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                    <p className="font-semibold text-gray-800 text-xs">Farmácia selecionada</p>
                  </div>
                )}
                <p className="text-[11px] text-red-500 font-medium leading-relaxed">
                  ⚠️ Esta ação excluirá a farmácia permanentemente de todos os relatórios, visitas e do banco de dados (local e Back4App)!
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setDeletingPharmacyId(null)}
                  className="px-4 py-2 bg-slate-50 border border-gray-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={confirmDeletePharmacy}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
