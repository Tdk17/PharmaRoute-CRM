/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Building, 
  RefreshCw, 
  Save, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Sliders, 
  Info,
  Server,
  Building2,
  FileText,
  BadgeAlert,
  Fingerprint,
  CloudDownload,
  CloudUpload
} from 'lucide-react';
import { DB } from '../services/db';

export default function ConfigsSection() {
  const currentConfig = DB.getBack4AppConfig();
  const currentCompany = DB.getCompany();

  // Local connection state
  const [activeTab, setActiveTab] = useState<'database' | 'company'>('database');
  const [useParse, setUseParse] = useState(currentConfig.enabled);
  const [appId, setAppId] = useState(currentConfig.appId);
  const [restKey, setRestKey] = useState(currentConfig.restKey);
  const [javascriptKey, setJavascriptKey] = useState(currentConfig.javascriptKey);
  const [serverUrl, setServerUrl] = useState(currentConfig.serverUrl);

  // Password visibility
  const [showRestKey, setShowRestKey] = useState(false);
  const [showJavascriptKey, setShowJavascriptKey] = useState(false);

  // Company details
  const [compName, setCompName] = useState(currentCompany.name);
  const [compTradeName, setCompTradeName] = useState(currentCompany.fantasyName);
  const [compCnpj, setCompCnpj] = useState(currentCompany.cnpj);
  const [compAddress, setCompAddress] = useState(currentCompany.address);
  const [compPhone, setCompPhone] = useState(currentCompany.phone);
  const [compEmail, setCompEmail] = useState(currentCompany.email);

  // Success / error notices
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (useParse && (!appId || !restKey || !serverUrl)) {
      setErrorMsg('Ao ativar a integração Parse Server (Back4App), preencha as credenciais obrigatórias (APP_ID, REST_API_KEY e SERVER_URL).');
      return;
    }

    try {
      DB.setBack4AppConfig({
        enabled: useParse,
        appId,
        restKey,
        javascriptKey: javascriptKey || '',
        serverUrl
      });
      setSuccessMsg('Configurações de banco de dados salvas com sucesso! Recarregando módulos...');
      setTimeout(() => {
        setSuccessMsg('');
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao salvar credenciais.');
    }
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!compName || !compTradeName || !compCnpj) {
      setErrorMsg('Os campos Nome, Nome Fantasia e CNPJ são obrigatórios.');
      return;
    }

    try {
      DB.updateCompany({
        ...currentCompany,
        name: compName,
        fantasyName: compTradeName,
        cnpj: compCnpj,
        address: compAddress,
        phone: compPhone,
        email: compEmail
      });
      setSuccessMsg('Branding e dados da empresa atualizados no servidor!');
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao salvar dados de faturamento.');
    }
  };

  return (
    <div className="space-y-6" id="configs-section">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-3xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Configurações Gerais do Sistema</h1>
          <p className="text-xs text-gray-500 mt-1">Conecte sua base de dados do Back4App, atualize o CNPJ de faturamento e customize a aplicação.</p>
        </div>

        {/* Inner Tab selectors */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
          <button 
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'database' ? 'bg-white text-gray-900 shadow-xs' : 'hover:bg-slate-50'}`}
          >
            <Database className="w-4 h-4 text-indigo-500" />
            Parse Server (Back4App)
          </button>
          <button 
            onClick={() => setActiveTab('company')}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'company' ? 'bg-white text-gray-900 shadow-xs' : 'hover:bg-slate-50'}`}
          >
            <Building className="w-4 h-4 text-emerald-500" />
            Dados da Empresa
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-700 text-xs p-3 rounded-lg border border-green-100 font-medium">
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* 1. BACK4APP DATABASE SYNC */}
      {activeTab === 'database' && (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border border-gray-100 shadow-3xs space-y-6 text-xs text-left">
          <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-gray-100 pb-6 text-center sm:text-left">
            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center shrink-0 border border-indigo-100 text-indigo-600 shadow-3xs relative">
              <Database className="w-7 h-7" />
              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${useParse ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
            </div>
            <div>
              <h2 className="font-bold text-gray-950 text-base flex items-center justify-center sm:justify-start gap-1.5">
                Configurações do Parse Server (Back4App)
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${useParse ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                  {useParse ? 'SINC. ATIVO' : 'SINC. DESATIVADO'}
                </span>
              </h2>
              <p className="text-gray-500 text-xs mt-1">
                A distribuidora sincroniza dados de forma transparente com o Back4App. Você pode ativar/desativar a integração e atualizar as chaves de conexão nesta tela.
              </p>
            </div>
          </div>

          {/* Sincronização Toggle Switch */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-gray-100">
            <div>
              <span className="font-bold text-gray-800 block text-xs">Ativar Sincronização em Tempo Real</span>
              <span className="text-[11px] text-gray-500">Quando ativado, os dados cadastrados locais são enviados e sincronizados com a nuvem Back4App.</span>
            </div>
            <button
              type="button"
              onClick={() => setUseParse(!useParse)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${useParse ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${useParse ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          <form onSubmit={handleSaveConnection} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-600 mb-1">Application ID (APP_ID) {useParse && '*'}</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 font-mono text-gray-700 text-[11px]"
                  placeholder="Seu Back4App App ID"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  required={useParse}
                  disabled={!useParse}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1">Server URL (SERVER_URL) {useParse && '*'}</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50 font-mono text-gray-700 text-[11px]"
                  placeholder="https://parseapi.back4app.com"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  required={useParse}
                  disabled={!useParse}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1">REST API Key (REST_API_KEY) {useParse && '*'}</label>
                <div className="relative">
                  <input
                    type={showRestKey ? "text" : "password"}
                    className="w-full border border-gray-200 rounded-lg p-2.5 pr-10 bg-slate-50/50 font-mono text-gray-700 text-[11px]"
                    placeholder="Sua REST API Key"
                    value={restKey}
                    onChange={(e) => setRestKey(e.target.value)}
                    required={useParse}
                    disabled={!useParse}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRestKey(!showRestKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    disabled={!useParse}
                  >
                    {showRestKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1">JavaScript Key (JAVASCRIPT_KEY) <span className="text-gray-400 font-normal">(Opcional)</span></label>
                <div className="relative">
                  <input
                    type={showJavascriptKey ? "text" : "password"}
                    className="w-full border border-gray-200 rounded-lg p-2.5 pr-10 bg-slate-50/50 font-mono text-gray-700 text-[11px]"
                    placeholder="Sua JavaScript Key"
                    value={javascriptKey}
                    onChange={(e) => setJavascriptKey(e.target.value)}
                    disabled={!useParse}
                  />
                  <button
                    type="button"
                    onClick={() => setShowJavascriptKey(!showJavascriptKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    disabled={!useParse}
                  >
                    {showJavascriptKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-amber-700 text-xs flex items-center gap-2">
                  <BadgeAlert className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>
                    <strong>Segurança:</strong> A <strong>MASTER_KEY</strong> deve ser configurada somente no Cloud Code, nunca no frontend (navegador).
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm text-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                Salvar Chaves de Conexão
              </button>
            </div>
          </form>
          
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-left space-y-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-1.5 text-[11px] tracking-wide uppercase">
              Ações Manuais de Sincronização
            </h3>
            <p className="text-gray-500 text-[11px]">
              Se você acabou de configurar a base de dados do Back4App, você pode forçar o carregamento inicial de dados (upload) ou baixar as informações existentes na nuvem (download).
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={async () => {
                  try {
                    setErrorMsg('');
                    setSuccessMsg('Sincronizando dados com a nuvem (Download)...');
                    await DB.syncFromCloud();
                    setSuccessMsg('Sincronização concluída com sucesso! Todos os dados atualizados a partir do Back4App. Atualizando...');
                    setTimeout(() => window.location.reload(), 2000);
                  } catch (err: any) {
                    setErrorMsg('Erro ao sincronizar dados: ' + err.message);
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 text-xs"
              >
                <CloudDownload className="w-4 h-4" />
                Baixar Dados da Nuvem (Pull)
              </button>
              <button
                onClick={async () => {
                  try {
                    setErrorMsg('');
                    setSuccessMsg('Sincronizando dados com a nuvem (Upload)...');
                    await DB.pushToCloud();
                    setSuccessMsg('Upload concluído com sucesso! Todos os dados locais foram salvos no Back4App.');
                  } catch (err: any) {
                    setErrorMsg('Erro ao fazer upload dos dados: ' + err.message);
                  }
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 text-xs"
              >
                <CloudUpload className="w-4 h-4" />
                Enviar Dados Locais para Nuvem (Push)
              </button>
            </div>
          </div>

          <div className="bg-indigo-50/50 text-indigo-700 p-4 rounded-xl border border-indigo-100/60 flex items-start gap-2.5 text-left text-[11px] leading-relaxed">
            <Info className="w-4 h-4 shrink-0 text-indigo-500 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-800 block mb-0.5">Nota de Segurança Administrativa</span>
              O acesso direto às chaves foi removido da interface do usuário para impedir o vazamento acidental de credenciais e garantir conformidade com políticas de privacidade de dados sensíveis da distribuidora.
            </div>
          </div>
        </div>
      )}

      {/* 2. BRANDING AND COMPANY DETAILS */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveCompany} className="bg-white p-6 rounded-xl border border-gray-100 shadow-3xs max-w-2xl mx-auto space-y-4 text-xs">
          <div className="border-b border-gray-50 pb-2">
            <h2 className="font-bold text-gray-900 text-sm">Dados de Faturamento e Branding da Empresa</h2>
            <p className="text-[11px] text-gray-400">Preencha os dados fiscais da distribuidora farmacêutica para estampar notas fiscais e relatórios gerenciais.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-500 mb-1">Razão Social *</label>
              <input 
                type="text" 
                className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1">Nome Fantasia *</label>
              <input 
                type="text" 
                className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50"
                value={compTradeName}
                onChange={(e) => setCompTradeName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-500 mb-1">CNPJ Faturamento *</label>
              <input 
                type="text" 
                placeholder="Ex: 12.345.678/0001-99"
                className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50"
                value={compCnpj}
                onChange={(e) => setCompCnpj(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1">Telefone Comercial</label>
              <input 
                type="text" 
                className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50"
                value={compPhone}
                onChange={(e) => setCompPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1">E-mail Administrativo</label>
              <input 
                type="email" 
                className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50"
                value={compEmail}
                onChange={(e) => setCompEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-500 mb-1">Endereço da Sede Administrativa</label>
            <input 
              type="text" 
              className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50"
              value={compAddress}
              onChange={(e) => setCompAddress(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button 
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              Atualizar Branding Empresa
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
