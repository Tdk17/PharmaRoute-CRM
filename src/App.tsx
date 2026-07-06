/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  Truck, 
  Activity,
  User,
  Shield,
  Download,
  Database,
  Compass
} from 'lucide-react';
import { DB } from './services/db';
import { User as UserType } from './types';

// Importing sectional modules
import DashboardAdmin from './components/DashboardAdmin';
import DashboardSeller from './components/DashboardSeller';
import PharmacySection from './components/PharmacySection';
import ProductSection from './components/ProductSection';
import StockSection from './components/StockSection';
import SaleSection from './components/SaleSection';
import VisitsSection from './components/VisitsSection';
import RoutesSection from './components/RoutesSection';
import TeamSection from './components/TeamSection';
import WhatsappSection from './components/WhatsappSection';
import ConfigsSection from './components/ConfigsSection';

type ActiveTab = 
  | 'dashboard' 
  | 'pharmacies' 
  | 'products' 
  | 'stock' 
  | 'sales' 
  | 'visits' 
  | 'routes' 
  | 'team' 
  | 'whatsapp' 
  | 'configs';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => DB.getCurrentUser());
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [syncTrigger, setSyncTrigger] = useState(0);
  
  // Login credentials states
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [loginError, setLoginError] = useState('');

  // Main UI States
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pwaPrompt, setPwaPrompt] = useState<any>(null);

  // Communication passing states (for check-ins or sales directly targeting a pharmacy)
  const [preSelectedPharmacyId, setPreSelectedPharmacyId] = useState<string | null>(null);

  // Sync with Back4App on startup
  useEffect(() => {
    const sync = async () => {
      try {
        setIsCloudSyncing(true);
        await DB.syncFromCloud();
        // Trigger render once synced
        setSyncTrigger(prev => prev + 1);
      } catch (err) {
        console.error('Error syncing on startup:', err);
      } finally {
        setIsCloudSyncing(false);
      }
    };
    sync();
  }, []);

  // PWA capture
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setPwaPrompt(e);
    });
  }, []);

  const handleInstallPWA = () => {
    if (pwaPrompt) {
      pwaPrompt.prompt();
      pwaPrompt.userChoice.then(() => {
        setPwaPrompt(null);
      });
    } else {
      alert('Seu navegador já instalou ou não suporta a instalação direta deste PWA.');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const u = DB.login(username, password);
      if (u) {
        setCurrentUser(u);
        setActiveTab('dashboard');
      } else {
        setLoginError('Usuário ou senha inválidos.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao realizar autenticação.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsername('');
    setPassword('');
  };

  // Helper handler for deep linking shortcuts (e.g. clicking Check-In inside seller dashboard)
  const handleQuickRedirect = (tab: ActiveTab, pharmacyId: string) => {
    setPreSelectedPharmacyId(pharmacyId);
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  // Clear shortcut params once consumed
  const handleClearPreSelection = () => {
    setPreSelectedPharmacyId(null);
  };

  // Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white" id="login-container">
        
        {/* PWA floating promo */}
        <div className="absolute top-4 right-4 bg-slate-800 border border-slate-700 rounded-xl p-2 flex items-center gap-2 text-xs">
          <span className="text-gray-400 font-medium">PharmaRoute Offline PWA</span>
          <button 
            onClick={handleInstallPWA}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Instalar
          </button>
        </div>

        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700/60 shadow-xl max-w-sm w-full space-y-6">
          {/* Logo Brand */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
              <Compass className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">PharmaRoute CRM</h1>
            <p className="text-xs text-slate-400">Distribuidora Comercial & Logística Farmacêutica</p>
          </div>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg text-center font-medium">
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs text-gray-300">
            <div>
              <label className="block font-bold text-slate-400 mb-1">Usuário / Username</label>
              <input 
                type="text" 
                className="w-full bg-slate-750/70 hover:bg-slate-750 border border-slate-700 focus:border-indigo-500 rounded-lg p-3 text-white focus:outline-none transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: admin, vendedor"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Senha de Acesso</label>
              <input 
                type="password" 
                className="w-full bg-slate-750/70 hover:bg-slate-750 border border-slate-700 focus:border-indigo-500 rounded-lg p-3 text-white focus:outline-none transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/15 text-sm"
            >
              Entrar no Portal
            </button>
          </form>

          {/* Quick credential cards for convenience */}
          <div className="space-y-2 border-t border-slate-700/60 pt-4">
            <span className="text-[10px] uppercase font-bold text-slate-500">Contas Demonstrativas</span>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button 
                onClick={() => { setUsername('admin'); setPassword('admin'); }}
                className="bg-slate-750 hover:bg-slate-700/80 p-2 rounded-lg border border-slate-700/50 text-left cursor-pointer transition-colors"
              >
                <span className="font-bold text-indigo-400 block">Administrador</span>
                <span className="text-slate-400">admin / admin</span>
              </button>
              <button 
                onClick={() => { setUsername('vendedor'); setPassword('123456'); }}
                className="bg-slate-750 hover:bg-slate-700/80 p-2 rounded-lg border border-slate-700/50 text-left cursor-pointer transition-colors"
              >
                <span className="font-bold text-emerald-400 block">Vendedor (Carro)</span>
                <span className="text-slate-400">vendedor / 123456</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.roleType === 'admin';
  const parseConfig = DB.getBack4AppConfig();

  // Navigation sidebar item schema
  const navItems = [
    { id: 'dashboard', label: 'Painel Central', icon: LayoutDashboard, roles: ['admin', 'seller'] },
    { id: 'pharmacies', label: 'Farmácias Clientes', icon: Building2, roles: ['admin', 'seller'] },
    { id: 'products', label: 'Catálogo Produtos', icon: Package, roles: ['admin', 'seller'] },
    { id: 'stock', label: 'Estoque Geral', icon: Activity, roles: ['admin'] },
    { id: 'sales', label: 'Efetuar Venda', icon: ShoppingCart, roles: ['admin', 'seller'] },
    { id: 'visits', label: 'Agenda de Visitas', icon: Calendar, roles: ['admin', 'seller'] },
    { id: 'routes', label: 'Roteirizador TSP', icon: Truck, roles: ['admin', 'seller'] },
    { id: 'team', label: 'Equipe e Metas', icon: Users, roles: ['admin'] },
    { id: 'whatsapp', label: 'Automação WhatsApp', icon: MessageSquare, roles: ['admin'] },
    { id: 'configs', label: 'Parâmetros / SaaS', icon: Settings, roles: ['admin'] },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex selection:bg-indigo-500 selection:text-white text-slate-800">
      
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-slate-900 border-r border-slate-800 shrink-0 select-none">
        <div className="space-y-6 pt-6">
          
          {/* Main Logo block */}
          <div className="px-6 flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <Compass className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm tracking-tight block">PharmaRoute CRM</span>
              <span className="text-[10px] text-indigo-400/80 font-bold tracking-wider uppercase">SaaS Distribuição</span>
            </div>
          </div>

          {/* Database connection indicator badge */}
          <div className="mx-4 p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-[10px] text-gray-400 flex items-center gap-1.5 font-medium justify-between">
            <div className="flex items-center gap-1.5">
              <Database className={`w-3.5 h-3.5 ${isCloudSyncing ? 'text-amber-400 animate-pulse' : 'text-indigo-400'}`} />
              <span>DB Status: {parseConfig.enabled ? 'Back4App' : 'LocalStorage'}</span>
            </div>
            {isCloudSyncing && (
              <span className="text-[9px] text-amber-400 font-bold tracking-wider animate-pulse uppercase">Sincronizando...</span>
            )}
          </div>

          {/* Nav groups */}
          <nav className="space-y-1 px-3 text-xs font-semibold">
            {navItems.filter(item => item.roles.includes(currentUser.roleType)).map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card footer block */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 shrink-0">
              {isAdmin ? <Shield className="w-4 h-4 text-indigo-400" /> : <User className="w-4 h-4 text-emerald-400" />}
            </div>
            <div className="truncate">
              <span className="font-bold text-white block truncate">{currentUser.fullName}</span>
              <span className="text-[10px] text-slate-500 font-mono capitalize">{currentUser.roleType}</span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 px-3 rounded-lg text-[11px] flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700/50"
          >
            <LogOut className="w-3.5 h-3.5" />
            Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Upper mobile responsive header bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center lg:hidden">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            <span className="font-extrabold text-sm text-gray-900">PharmaRoute</span>
          </div>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 hover:bg-slate-50 rounded-lg text-slate-600"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* MOBILE DRAWER PORTAL */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <div 
              className="bg-slate-900 w-64 h-full p-6 space-y-6 flex flex-col justify-between" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-black text-white text-base">Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1 text-xs font-semibold">
                  {navItems.filter(item => item.roles.includes(currentUser.roleType)).map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as ActiveTab);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive 
                            ? 'bg-indigo-600 text-white' 
                            : 'text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">{currentUser.fullName}</span>
                    <span className="text-[10px] text-slate-500 font-mono capitalize">{currentUser.roleType}</span>
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-lg text-[11px] flex items-center justify-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Deslogar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE AREA */}
        <main key={syncTrigger} className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          
          {/* TAB ROUTING COMPONENT SWITCHER */}
          {activeTab === 'dashboard' && (
            isAdmin ? (
              <DashboardAdmin />
            ) : (
              <DashboardSeller 
                sellerId={currentUser.id} 
                onNavigateToSection={(section) => {
                  setActiveTab(section as ActiveTab);
                }}
              />
            )
          )}

          {activeTab === 'pharmacies' && (
            <PharmacySection 
              currentUser={currentUser} 
              onNavigateToSale={(pharmId) => handleQuickRedirect('sales', pharmId)}
              onNavigateToSchedule={(pharmId) => handleQuickRedirect('visits', pharmId)}
            />
          )}

          {activeTab === 'products' && (
            <ProductSection currentUser={currentUser} />
          )}

          {activeTab === 'stock' && isAdmin && (
            <StockSection />
          )}

          {activeTab === 'sales' && (
            <SaleSection 
              currentUser={currentUser} 
              preSelectedPharmacyId={preSelectedPharmacyId}
              onClearPreSelection={handleClearPreSelection}
            />
          )}

          {activeTab === 'visits' && (
            <VisitsSection 
              currentUser={currentUser} 
              preSelectedPharmacyId={preSelectedPharmacyId}
              onClearPreSelection={handleClearPreSelection}
            />
          )}

          {activeTab === 'routes' && (
            <RoutesSection currentUser={currentUser} />
          )}

          {activeTab === 'team' && isAdmin && (
            <TeamSection />
          )}

          {activeTab === 'whatsapp' && isAdmin && (
            <WhatsappSection />
          )}

          {activeTab === 'configs' && isAdmin && (
            <ConfigsSection />
          )}

        </main>
      </div>

    </div>
  );
}
