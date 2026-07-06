/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Settings, 
  History, 
  RefreshCw, 
  CheckCircle, 
  ExternalLink, 
  Info,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { DB } from '../services/db';
import { WhatsappMessage, Pharmacy } from '../types';

export default function WhatsappSection() {
  const messages = DB.getWhatsappMessages();
  const pharmacies = DB.getPharmacies();
  const automations = DB.getAutomationRules();

  // Navigation
  const [activeTab, setActiveTab] = useState<'rules' | 'history'>('rules');

  // Interactive message test sender state
  const [testPharmacyId, setTestPharmacyId] = useState('');
  const [testMessageContent, setTestMessageContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle manual WhatsApp deep-link trigger
  const handleTriggerManualWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!testPharmacyId || !testMessageContent) {
      setErrorMsg('Por favor, selecione o destinatário e preencha a mensagem.');
      return;
    }

    const ph = pharmacies.find(p => p.id === testPharmacyId);
    if (!ph) return;

    // Sanitize phone: remove any brackets, spaces, hyphens
    const cleanPhone = ph.phone.replace(/[^\d]/g, '');
    
    // Encode text
    const encodedText = encodeURIComponent(testMessageContent);
    const url = `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodedText}`;

    // Log message dispatch in mock db
    DB.createWhatsappMessage({
      pharmacyId: ph.id,
      companyId: 'company-1',
      sellerId: 'user-admin',
      phone: ph.whatsapp || ph.phone,
      message: testMessageContent,
      type: 'custom',
      scheduledAt: new Date().toISOString(),
      sentAt: new Date().toISOString()
    });

    setSuccessMsg('Cupom de faturamento compilado! Redirecionando para o WhatsApp Web...');
    
    setTimeout(() => {
      window.open(url, '_blank');
      setSuccessMsg('');
      setTestMessageContent('');
    }, 1500);
  };

  return (
    <div className="space-y-6" id="whatsapp-section">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-3xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notificações por WhatsApp</h1>
          <p className="text-xs text-gray-500 mt-1">Configure templates de faturamento, recibos de consignação e agendamentos automatizados.</p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
          <button 
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'rules' ? 'bg-white text-gray-900 shadow-xs' : 'hover:bg-slate-50'}`}
          >
            <Sliders className="w-4 h-4 text-emerald-500" />
            Automações & Templates
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'history' ? 'bg-white text-gray-900 shadow-xs' : 'hover:bg-slate-50'}`}
          >
            <History className="w-4 h-4 text-indigo-500" />
            Log de Disparos
          </button>
        </div>
      </div>

      {/* 1. AUTOMATION RULES & PRESETS */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          
          {/* Rules lists */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-bold text-gray-900 text-sm">Gatilhos de Notificações Ativos</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {automations.map((rule) => {
                const isActive = rule.active;

                return (
                  <div key={rule.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs space-y-3.5 relative">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">
                        Gatilho: {rule.triggerType}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {isActive ? 'Ativo' : 'Pausado'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-900 text-sm">{rule.name}</h4>
                      <p className="text-[11px] text-gray-500 line-clamp-3">" {rule.messageTemplate} "</p>
                    </div>

                    <div className="pt-2 border-t border-gray-50 text-[10px] text-gray-400">
                      Disparos automáticos efetuados via faturamento comercial.
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manual deep link tester */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs space-y-4">
            <div className="border-b border-gray-50 pb-2">
              <h3 className="font-bold text-gray-900 text-sm">Simulador de WhatsApp</h3>
              <p className="text-[11px] text-gray-400">Envie um recibo manual instantâneo para um cliente usando sua própria conta do WhatsApp.</p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-100">
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 text-green-700 p-2.5 rounded-lg border border-green-100 font-medium">
                ✓ {successMsg}
              </div>
            )}

            <form onSubmit={handleTriggerManualWhatsApp} className="space-y-3.5">
              <div>
                <label className="block font-bold text-gray-500 mb-1">1. Farmácia Destinatária</label>
                <select 
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-white"
                  value={testPharmacyId}
                  onChange={(e) => setTestPharmacyId(e.target.value)}
                >
                  <option value="">Selecione a farmácia...</option>
                  {pharmacies.map(ph => (
                    <option key={ph.id} value={ph.id}>{ph.name} ({ph.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-500 mb-1">2. Texto do Recibo / Cupom</label>
                <textarea 
                  placeholder="Ex: Olá Sandra! Segue o recibo de faturamento no total de R$ 450,00 referente aos medicamentos repostos hoje."
                  className="w-full border border-gray-200 rounded-lg p-2.5 h-24 bg-slate-50/50"
                  value={testMessageContent}
                  onChange={(e) => setTestMessageContent(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Compilar e Enviar via API
              </button>
            </form>
          </div>

        </div>
      )}

      {/* 2. HISTORY OF AUTOMATIC OUTGOING LOGS */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-3xs overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Farmácia</th>
                  <th className="p-4">Número Destinatário</th>
                  <th className="p-4">Mensagem Disparada</th>
                  <th className="p-4 text-center">Gatilho</th>
                  <th className="p-4 text-center">Data Envio</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                      Nenhuma mensagem enviada ou agendada ainda.
                    </td>
                  </tr>
                ) : (
                  messages.map((msg) => {
                    const ph = pharmacies.find(p => p.id === msg.pharmacyId);

                    return (
                      <tr key={msg.id} className="hover:bg-slate-50/40">
                        <td className="p-4 font-bold text-gray-900">{ph ? ph.name : 'Farmácia'}</td>
                        <td className="p-4 font-mono text-gray-500">{msg.phone}</td>
                        <td className="p-4 max-w-sm truncate" title={msg.message}>{msg.message}</td>
                        <td className="p-4 text-center">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold uppercase text-[9px]">
                            {msg.type}
                          </span>
                        </td>
                        <td className="p-4 text-center text-gray-400 font-mono">
                          {new Date(msg.sentAt || msg.scheduledAt).toLocaleDateString('pt-BR')} {new Date(msg.sentAt || msg.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            msg.status === 'sent' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {msg.status === 'sent' ? 'Sucesso' : 'Falhou'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
