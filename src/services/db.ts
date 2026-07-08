/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  Company,
  Pharmacy,
  Product,
  MainStock,
  SellerStock,
  PharmacyStock,
  Sale,
  Visit,
  Route,
  RouteStop,
  WhatsappMessage,
  AutomationRule,
  SystemNotification,
  Goal,
  Expense,
  SystemLog,
  UserRole
} from '../types';

// Storage Keys
const KEYS = {
  USERS: 'pharmaroute_users',
  COMPANY: 'pharmaroute_company',
  PHARMACIES: 'pharmaroute_pharmacies',
  PRODUCTS: 'pharmaroute_products',
  MAIN_STOCK: 'pharmaroute_main_stock',
  SELLER_STOCK: 'pharmaroute_seller_stock',
  PHARMACY_STOCK: 'pharmaroute_pharmacy_stock',
  SALES: 'pharmaroute_sales',
  VISITS: 'pharmaroute_visits',
  ROUTES: 'pharmaroute_routes',
  ROUTE_STOPS: 'pharmaroute_route_stops',
  WHATSAPP_MESSAGES: 'pharmaroute_whatsapp_messages',
  AUTOMATION_RULES: 'pharmaroute_automation_rules',
  NOTIFICATIONS: 'pharmaroute_notifications',
  GOALS: 'pharmaroute_goals',
  EXPENSES: 'pharmaroute_expenses',
  SYSTEM_LOGS: 'pharmaroute_system_logs',
  CURRENT_USER: 'pharmaroute_current_user',
  BACK4APP_CONFIG: 'pharmaroute_back4app_config'
};

export interface Back4AppConfig {
  enabled: boolean;
  appId: string;
  restKey: string;
  javascriptKey: string;
  serverUrl: string;
}

// Default Configuration
const DEFAULT_BACK4APP_CONFIG: Back4AppConfig = {
  enabled: true,
  appId: 'o17wRqSmQlY9fMJb3Eq9vZ6FhnEwhhCWHcV9fzua',
  restKey: 'VX9JmupDLOkJel3fqSZ1KuCJZoOAsi067RG4WdTl',
  javascriptKey: '9iBsaMn58JqnVmtkwHTPIffC2dxEGzAMaMgQkl9S',
  serverUrl: 'https://parseapi.back4app.com'
};

const DEFAULT_COMPANY: Company = {
  id: 'company-1',
  name: 'PharmaRoute Logística Ltda',
  fantasyName: 'PharmaRoute Distribuidora',
  cnpj: '12.345.678/0001-90',
  phone: '(11) 3456-7890',
  whatsapp: '(11) 99876-5432',
  email: 'contato@pharmaroute.com.br',
  logoUrl: '',
  primaryColor: '#6366f1', // indigo-500
  address: 'Av. Paulista, 1000 - Bela Vista',
  city: 'São Paulo',
  state: 'SP',
  ownerId: 'user-admin',
  theme: 'light'
};

const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    username: 'admin',
    fullName: 'Dr. Carlos Eduardo (Diretor)',
    email: 'carlos@pharmaroute.com.br',
    phone: '(11) 98765-4321',
    roleType: 'admin',
    status: 'active',
    city: 'São Paulo',
    state: 'SP',
    createdAt: new Date('2026-01-10').toISOString(),
    updatedAt: new Date('2026-01-10').toISOString(),
    lastAccess: new Date().toISOString()
  }
];

const INITIAL_PRODUCTS: Product[] = [];

const INITIAL_PHARMACIES: Pharmacy[] = [];

const INITIAL_MAIN_STOCK: MainStock[] = [];

const INITIAL_SELLER_STOCK: SellerStock[] = [];

const INITIAL_PHARMACY_STOCK: PharmacyStock[] = [];

const INITIAL_SALES: Sale[] = [];

const INITIAL_VISITS: Visit[] = [];

const INITIAL_GOALS: Goal[] = [];

const INITIAL_AUTOMATION_RULES: AutomationRule[] = [];

const INITIAL_NOTIFICATIONS: SystemNotification[] = [];

const INITIAL_WHATSAPP_MESSAGES: WhatsappMessage[] = [];

const INITIAL_EXPENSES: Expense[] = [];

const INITIAL_LOGS: SystemLog[] = [];

// Helper to safely parse JSON from localStorage
function getStore<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
}

function getClassForStoreKey(key: string): string | null {
  switch (key) {
    case KEYS.USERS: return 'AppUser';
    case KEYS.COMPANY: return 'Company';
    case KEYS.PHARMACIES: return 'Pharmacy';
    case KEYS.PRODUCTS: return 'Product';
    case KEYS.MAIN_STOCK: return 'MainStock';
    case KEYS.SELLER_STOCK: return 'SellerStock';
    case KEYS.PHARMACY_STOCK: return 'PharmacyStock';
    case KEYS.SALES: return 'Sale';
    case KEYS.VISITS: return 'Visit';
    case KEYS.ROUTES: return 'Route';
    case KEYS.ROUTE_STOPS: return 'RouteStop';
    case KEYS.WHATSAPP_MESSAGES: return 'WhatsappMessage';
    case KEYS.AUTOMATION_RULES: return 'AutomationRule';
    case KEYS.NOTIFICATIONS: return 'SystemNotification';
    case KEYS.GOALS: return 'Goal';
    case KEYS.EXPENSES: return 'Expense';
    case KEYS.SYSTEM_LOGS: return 'SystemLog';
    default: return null;
  }
}

const syncDebounceTimers: Record<string, any> = {};

async function syncCollectionToBack4App(className: string, data: any, config: Back4AppConfig): Promise<void> {
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) return;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Parse-Application-Id': config.appId,
    'X-Parse-REST-API-Key': config.restKey,
  };
  if (config.javascriptKey) {
    headers['X-Parse-Javascript-Key'] = config.javascriptKey;
  }

  const baseUrl = config.serverUrl.endsWith('/') ? config.serverUrl.slice(0, -1) : config.serverUrl;

  // 1. Fetch existing objects
  const fetchUrl = `${baseUrl}/classes/${className}?limit=1000`;
  const response = await fetch(fetchUrl, { headers });
  let idMap = new Map<string, string>();
  if (response.ok) {
    const result = await response.json();
    const existingObjects = result.results || [];
    existingObjects.forEach((obj: any) => {
      if (obj.localId) {
        idMap.set(obj.localId, obj.objectId);
      } else if (obj.id) {
        idMap.set(obj.id, obj.objectId);
      }
    });
  } else {
    const errText = await response.text();
    let errObj: any = {};
    try { errObj = JSON.parse(errText); } catch(e){}
    // If it's a "class does not exist" error (code 102), we can ignore it as the class will be created.
    // Otherwise, throw!
    if (errObj.code !== 102 && !errText.includes("does not exist")) {
      throw new Error(`Erro de conexão com Back4App (${className}): ${errText}`);
    }
  }

  // 2. Prepare requests for Batch operations
  const requests: any[] = [];
  items.forEach((item: any) => {
    const cleanItem = { ...item };
    const localId = cleanItem.id || `local-${Date.now()}-${Math.random()}`;
    
    delete cleanItem.objectId;
    delete cleanItem.createdAt;
    delete cleanItem.updatedAt;
    delete cleanItem.id; // Delete id because it is reserved in Parse Server and causes "invalid field name" errors
    delete cleanItem.className; // Delete className because it is reserved in Parse Server and causes "invalid field name" errors

    const parseObjectId = idMap.get(localId);
    if (parseObjectId) {
      requests.push({
        method: 'PUT',
        path: `/classes/${className}/${parseObjectId}`,
        body: {
          ...cleanItem,
          localId
        }
      });
    } else {
      requests.push({
        method: 'POST',
        path: `/classes/${className}`,
        body: {
          ...cleanItem,
          localId
        }
      });
    }
  });

  // 3. Send in chunks of 50
  const chunkSize = 50;
  for (let i = 0; i < requests.length; i += chunkSize) {
    const chunk = requests.slice(i, i + chunkSize);
    const batchUrl = `${baseUrl}/batch`;
    const res = await fetch(batchUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ requests: chunk })
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Erro na API de Batch do Back4App: ${res.status} - ${errText}`);
    } else {
      const batchResult = await res.json();
      if (Array.isArray(batchResult)) {
        const errorItem = batchResult.find((r: any) => r.error);
        if (errorItem) {
          const errDetail = errorItem.error;
          throw new Error(`Erro no Back4App (${className}): [Code ${errDetail.code}] ${errDetail.error || JSON.stringify(errDetail)}`);
        }
      }
    }
  }
}

async function deleteFromBack4App(className: string, localId: string): Promise<void> {
  const config = getStore<Back4AppConfig>(KEYS.BACK4APP_CONFIG, DEFAULT_BACK4APP_CONFIG);
  if (!config.enabled) return;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Parse-Application-Id': config.appId,
    'X-Parse-REST-API-Key': config.restKey,
  };
  if (config.javascriptKey) {
    headers['X-Parse-Javascript-Key'] = config.javascriptKey;
  }

  const baseUrl = config.serverUrl.endsWith('/') ? config.serverUrl.slice(0, -1) : config.serverUrl;

  try {
    const fetchUrl = `${baseUrl}/classes/${className}?where=${encodeURIComponent(JSON.stringify({ localId }))}`;
    const response = await fetch(fetchUrl, { headers });
    if (response.ok) {
      const result = await response.json();
      const obj = result.results?.[0];
      if (obj && obj.objectId) {
        await fetch(`${baseUrl}/classes/${className}/${obj.objectId}`, {
          method: 'DELETE',
          headers
        });
      }
    }
  } catch (err) {
    console.error(`Error deleting ${localId} from Back4App:`, err);
  }
}

function triggerBack4AppSync(key: string, data: any): void {
  // Don't sync internal client keys
  if (key === KEYS.CURRENT_USER || key === KEYS.BACK4APP_CONFIG) return;

  const config = getStore<Back4AppConfig>(KEYS.BACK4APP_CONFIG, DEFAULT_BACK4APP_CONFIG);
  if (!config.enabled) return;

  const className = getClassForStoreKey(key);
  if (!className) return;

  if (syncDebounceTimers[key]) {
    clearTimeout(syncDebounceTimers[key]);
  }

  syncDebounceTimers[key] = setTimeout(() => {
    syncCollectionToBack4App(className, data, config).catch(err => {
      console.error(`Error syncing ${className} to Back4App:`, err);
    });
  }, 1000);
}

function setStore<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
  triggerBack4AppSync(key, data);
}

// Seed Database if empty or first-time
export function initializeDB(): void {
  const mockCleanedKey = 'pharmaroute_mock_cleaned_v6';
  if (!localStorage.getItem(mockCleanedKey)) {
    const oldConfig = localStorage.getItem(KEYS.BACK4APP_CONFIG);
    const oldCurrentUser = localStorage.getItem(KEYS.CURRENT_USER);
    
    // Clear old keys to remove all mock data
    Object.values(KEYS).forEach(k => {
      localStorage.removeItem(k);
    });
    
    if (oldConfig) localStorage.setItem(KEYS.BACK4APP_CONFIG, oldConfig);
    if (oldCurrentUser) localStorage.setItem(KEYS.CURRENT_USER, oldCurrentUser);
    
    localStorage.setItem(mockCleanedKey, 'true');
  }

  getStore<User[]>(KEYS.USERS, INITIAL_USERS);
  getStore<Company>(KEYS.COMPANY, DEFAULT_COMPANY);
  getStore<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  getStore<Pharmacy[]>(KEYS.PHARMACIES, INITIAL_PHARMACIES);
  getStore<MainStock[]>(KEYS.MAIN_STOCK, INITIAL_MAIN_STOCK);
  getStore<SellerStock[]>(KEYS.SELLER_STOCK, INITIAL_SELLER_STOCK);
  getStore<PharmacyStock[]>(KEYS.PHARMACY_STOCK, INITIAL_PHARMACY_STOCK);
  getStore<Sale[]>(KEYS.SALES, INITIAL_SALES);
  getStore<Visit[]>(KEYS.VISITS, INITIAL_VISITS);
  getStore<Goal[]>(KEYS.GOALS, INITIAL_GOALS);
  getStore<AutomationRule[]>(KEYS.AUTOMATION_RULES, INITIAL_AUTOMATION_RULES);
  getStore<SystemNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  getStore<WhatsappMessage[]>(KEYS.WHATSAPP_MESSAGES, INITIAL_WHATSAPP_MESSAGES);
  getStore<Expense[]>(KEYS.EXPENSES, INITIAL_EXPENSES);
  getStore<SystemLog[]>(KEYS.SYSTEM_LOGS, INITIAL_LOGS);
  getStore<Back4AppConfig>(KEYS.BACK4APP_CONFIG, DEFAULT_BACK4APP_CONFIG);
}

// DB API Service
export const DB = {
  // Configs Back4App
  getBack4AppConfig(): Back4AppConfig {
    const config = getStore<Back4AppConfig>(KEYS.BACK4APP_CONFIG, DEFAULT_BACK4APP_CONFIG);
    if (!config || !config.appId || !config.restKey || !config.serverUrl) {
      setStore(KEYS.BACK4APP_CONFIG, DEFAULT_BACK4APP_CONFIG);
      return DEFAULT_BACK4APP_CONFIG;
    }
    return config;
  },

  setBack4AppConfig(config: Back4AppConfig): void {
    setStore(KEYS.BACK4APP_CONFIG, config);
    this.logAction('CONFIG_UPDATE', 'Back4AppConfig', 'system', `Configuração Back4App atualizada. Ativo: ${config.enabled}`);
  },

  async syncFromCloud(): Promise<void> {
    const config = this.getBack4AppConfig();
    if (!config.enabled) return;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Parse-Application-Id': config.appId,
      'X-Parse-REST-API-Key': config.restKey,
    };
    if (config.javascriptKey) {
      headers['X-Parse-Javascript-Key'] = config.javascriptKey;
    }

    const baseUrl = config.serverUrl.endsWith('/') ? config.serverUrl.slice(0, -1) : config.serverUrl;

    const storeKeys = Object.values(KEYS).filter(k => k !== KEYS.CURRENT_USER && k !== KEYS.BACK4APP_CONFIG);

    for (const key of storeKeys) {
      const className = getClassForStoreKey(key);
      if (!className) continue;

      try {
        const fetchUrl = `${baseUrl}/classes/${className}?limit=1000`;
        const response = await fetch(fetchUrl, { headers });
        if (response.ok) {
          const result = await response.json();
          const parseItems = result.results || [];
          if (parseItems.length > 0) {
            if (key === KEYS.COMPANY) {
              const companyObj = parseItems[0];
              const cleanCompany = { ...companyObj, id: companyObj.localId || companyObj.id || 'company-1' };
              delete cleanCompany.objectId;
              delete cleanCompany.createdAt;
              delete cleanCompany.updatedAt;
              delete cleanCompany.localId;
              localStorage.setItem(key, JSON.stringify(cleanCompany));
            } else {
              const localItems = parseItems.map((item: any) => {
                const cleanItem = { ...item };
                if (item.localId) {
                  cleanItem.id = item.localId;
                }
                delete cleanItem.objectId;
                delete cleanItem.createdAt;
                delete cleanItem.updatedAt;
                delete cleanItem.localId;
                return cleanItem;
              });
              localStorage.setItem(key, JSON.stringify(localItems));
            }
          }
        } else {
          const errText = await response.text();
          let errObj: any = {};
          try { errObj = JSON.parse(errText); } catch(e){}
          if (errObj.code !== 102 && !errText.includes("does not exist")) {
            throw new Error(`Erro de autenticação ou permissão (Status ${response.status}): ${errText}`);
          }
        }
      } catch (err: any) {
        console.error(`Error pulling ${className} from Back4App:`, err);
        // Rethrow authentication, permission or batch connection errors
        if (err.message && (
          err.message.includes("Erro de autenticação") || 
          err.message.includes("Erro de conexão") || 
          err.message.includes("Batch") || 
          err.message.includes("401") || 
          err.message.includes("403") || 
          err.message.includes("Unauthorized")
        )) {
          throw err;
        }
      }
    }
    this.logAction('CLOUD_SYNC_PULL', 'System', 'system', 'Sincronização Cloud: dados baixados do Back4App com sucesso.');
  },

  async pushToCloud(): Promise<void> {
    const config = this.getBack4AppConfig();
    if (!config.enabled) return;

    const storeKeys = Object.values(KEYS).filter(k => k !== KEYS.CURRENT_USER && k !== KEYS.BACK4APP_CONFIG);

    for (const key of storeKeys) {
      const className = getClassForStoreKey(key);
      if (!className) continue;

      try {
        const localData = localStorage.getItem(key);
        if (localData) {
          const parsed = JSON.parse(localData);
          await syncCollectionToBack4App(className, parsed, config);
        }
      } catch (err: any) {
        console.error(`Error pushing ${className} to Back4App:`, err);
        if (err.message && (
          err.message.includes("autenticação") || 
          err.message.includes("conexão") || 
          err.message.includes("Batch") || 
          err.message.includes("401") || 
          err.message.includes("403") || 
          err.message.includes("Unauthorized")
        )) {
          throw err;
        }
      }
    }
    this.logAction('CLOUD_SYNC_PUSH', 'System', 'system', 'Sincronização Cloud: todos os dados locais enviados ao Back4App.');
  },

  // Log Activity
  logAction(action: string, className: string, objectId: string, description: string): void {
    const logs = getStore<any[]>(KEYS.SYSTEM_LOGS, []);
    let migrated = false;
    const migratedLogs = logs.map(log => {
      if (log && log.className !== undefined) {
        log.targetClass = log.targetClass || log.className;
        delete log.className;
        migrated = true;
      }
      return log;
    });

    const user = this.getCurrentUser();
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      companyId: 'company-1',
      userId: user?.id || 'system',
      action,
      targetClass: className,
      objectId,
      description,
      ip: '127.0.0.1',
      createdAt: new Date().toISOString()
    };
    migratedLogs.unshift(newLog);
    setStore(KEYS.SYSTEM_LOGS, migratedLogs.slice(0, 500)); // keep last 500 logs
  },

  getSystemLogs(): SystemLog[] {
    const logs = getStore<any[]>(KEYS.SYSTEM_LOGS, []);
    let migrated = false;
    const migratedLogs = logs.map(log => {
      if (log && log.className !== undefined) {
        log.targetClass = log.targetClass || log.className;
        delete log.className;
        migrated = true;
      }
      return log;
    });
    if (migrated) {
      setStore(KEYS.SYSTEM_LOGS, migratedLogs);
    }
    return migratedLogs;
  },

  // Auth Operations
  login(usernameInput: string, passwordInput: string): User | null {
    const users = getStore<User[]>(KEYS.USERS, INITIAL_USERS);
    // Standard verification - in mock, password matches username + "123" (or is just simple)
    const matchedUser = users.find(u => 
      u.username.toLowerCase() === usernameInput.toLowerCase() && 
      (passwordInput === 'admin123' || passwordInput === 'seller123' || passwordInput === '123' || passwordInput === u.username || u.password === passwordInput)
    );

    if (matchedUser) {
      if (matchedUser.status === 'inactive') {
        throw new Error('Usuário inativo. Entre em contato com o administrador.');
      }
      const updatedUser = { ...matchedUser, lastAccess: new Date().toISOString() };
      const updatedList = users.map(u => u.id === matchedUser.id ? updatedUser : u);
      setStore(KEYS.USERS, updatedList);
      setStore(KEYS.CURRENT_USER, updatedUser);
      this.logAction('LOGIN', '_User', updatedUser.id, `Usuário ${updatedUser.fullName} efetuou login.`);
      return updatedUser;
    }
    return null;
  },

  getCurrentUser(): User | null {
    return getStore<User | null>(KEYS.CURRENT_USER, null);
  },

  setCurrentUser(user: User | null): void {
    setStore(KEYS.CURRENT_USER, user);
  },

  logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.logAction('LOGOUT', '_User', user.id, `Usuário ${user.fullName} desconectou.`);
    }
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  // Users Management (Admin only)
  getUsers(): User[] {
    return getStore<User[]>(KEYS.USERS, INITIAL_USERS);
  },

  createUser(u: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const users = getStore<User[]>(KEYS.USERS, []);
    const currentUser = this.getCurrentUser();

    // Check unique username
    if (users.some(existing => existing.username.toLowerCase() === u.username.toLowerCase())) {
      throw new Error(`O usuário "${u.username}" já existe.`);
    }

    const newUser: User = {
      ...u,
      id: `user-${Date.now()}`,
      createdBy: currentUser?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    setStore(KEYS.USERS, users);
    
    // Auto-create goals for new seller
    if (newUser.roleType === 'seller') {
      this.createGoal({
        companyId: 'company-1',
        sellerId: newUser.id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        salesGoal: 30,
        visitsGoal: 15,
        revenueGoal: 10000,
        currentSales: 0,
        currentVisits: 0,
        currentRevenue: 0
      });
    }

    this.logAction('CREATE', '_User', newUser.id, `Vendedor/Usuário criado: ${newUser.fullName}`);
    return newUser;
  },

  updateUser(updated: User): void {
    const users = getStore<User[]>(KEYS.USERS, []);
    const index = users.findIndex(u => u.id === updated.id);
    if (index !== -1) {
      users[index] = { ...updated, updatedAt: new Date().toISOString() };
      setStore(KEYS.USERS, users);
      this.logAction('UPDATE', '_User', updated.id, `Usuário atualizado: ${updated.fullName}`);
    }
  },

  deleteUser(userId: string): void {
    const users = getStore<User[]>(KEYS.USERS, []);
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      const user = users[index];
      const remainingUsers = users.filter(u => u.id !== userId);
      setStore(KEYS.USERS, remainingUsers);
      this.logAction('DELETE', '_User', userId, `Usuário removido: ${user.fullName}`);
      deleteFromBack4App('AppUser', userId).catch(err => {
        console.error('Error deleting user from Back4App:', err);
      });
    }
  },

  // Company Settings
  getCompany(): Company {
    return getStore<Company>(KEYS.COMPANY, DEFAULT_COMPANY);
  },

  updateCompany(updated: Company): void {
    setStore(KEYS.COMPANY, updated);
    this.logAction('UPDATE', 'Company', updated.id, `Dados da empresa atualizados.`);
  },

  // Pharmacy Management
  getPharmacies(): Pharmacy[] {
    return getStore<Pharmacy[]>(KEYS.PHARMACIES, INITIAL_PHARMACIES);
  },

  createPharmacy(p: Omit<Pharmacy, 'id' | 'createdAt' | 'updatedAt'>): Pharmacy {
    const pharmacies = getStore<Pharmacy[]>(KEYS.PHARMACIES, []);
    const newPharmacy: Pharmacy = {
      ...p,
      id: `ph-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    pharmacies.push(newPharmacy);
    setStore(KEYS.PHARMACIES, pharmacies);
    this.logAction('CREATE', 'Pharmacy', newPharmacy.id, `Farmácia cadastrada: ${newPharmacy.name}`);
    return newPharmacy;
  },

  updatePharmacy(updated: Pharmacy): void {
    const pharmacies = getStore<Pharmacy[]>(KEYS.PHARMACIES, []);
    const index = pharmacies.findIndex(p => p.id === updated.id);
    if (index !== -1) {
      pharmacies[index] = { ...updated, updatedAt: new Date().toISOString() };
      setStore(KEYS.PHARMACIES, pharmacies);
      this.logAction('UPDATE', 'Pharmacy', updated.id, `Farmácia atualizada: ${updated.name}`);
    }
  },

  deletePharmacy(id: string): void {
    const pharmacies = getStore<Pharmacy[]>(KEYS.PHARMACIES, []);
    const index = pharmacies.findIndex(p => p.id === id);
    if (index !== -1) {
      const pName = pharmacies[index].name;
      pharmacies.splice(index, 1);
      setStore(KEYS.PHARMACIES, pharmacies);
      this.logAction('DELETE', 'Pharmacy', id, `Farmácia removida do sistema: ${pName}`);
      deleteFromBack4App('Pharmacy', id).catch(err => {
        console.error('Error deleting pharmacy from Back4App:', err);
      });

      // Optionally clean up pharmacy stock
      const pStock = getStore<PharmacyStock[]>(KEYS.PHARMACY_STOCK, INITIAL_PHARMACY_STOCK);
      const filteredStock = pStock.filter(ps => ps.pharmacyId !== id);
      if (filteredStock.length !== pStock.length) {
        setStore(KEYS.PHARMACY_STOCK, filteredStock);
      }
    }
  },

  // Products Management
  getProducts(): Product[] {
    return getStore<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  createProduct(p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = getStore<Product[]>(KEYS.PRODUCTS, []);
    const newProduct: Product = {
      ...p,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    products.push(newProduct);
    setStore(KEYS.PRODUCTS, products);

    // Initial Main Stock creation
    const mainStock = getStore<MainStock[]>(KEYS.MAIN_STOCK, []);
    mainStock.push({
      id: `ms-${Date.now()}`,
      companyId: newProduct.companyId,
      productId: newProduct.id,
      quantity: 500, // starting initial main stock
      minQuantity: newProduct.minStock,
      status: 'normal',
      updatedAt: new Date().toISOString()
    });
    setStore(KEYS.MAIN_STOCK, mainStock);

    this.logAction('CREATE', 'Product', newProduct.id, `Produto cadastrado: ${newProduct.name}`);
    return newProduct;
  },

  updateProduct(updated: Product): void {
    const products = getStore<Product[]>(KEYS.PRODUCTS, []);
    const index = products.findIndex(p => p.id === updated.id);
    if (index !== -1) {
      products[index] = { ...updated, updatedAt: new Date().toISOString() };
      setStore(KEYS.PRODUCTS, products);
      this.logAction('UPDATE', 'Product', updated.id, `Produto atualizado: ${updated.name}`);
    }
  },

  deleteProduct(id: string): void {
    const products = getStore<Product[]>(KEYS.PRODUCTS, []);
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      const prodName = products[index].name;
      products.splice(index, 1);
      setStore(KEYS.PRODUCTS, products);
      this.logAction('DELETE', 'Product', id, `Produto removido do catálogo: ${prodName}`);
      deleteFromBack4App('Product', id).catch(err => {
        console.error('Error deleting product from Back4App:', err);
      });

      // Also clean up main stock entry for this product
      const mainStock = getStore<MainStock[]>(KEYS.MAIN_STOCK, INITIAL_MAIN_STOCK);
      const stockIdx = mainStock.findIndex(ms => ms.productId === id);
      if (stockIdx !== -1) {
        const stockId = mainStock[stockIdx].id;
        mainStock.splice(stockIdx, 1);
        setStore(KEYS.MAIN_STOCK, mainStock);
        deleteFromBack4App('MainStock', stockId).catch(err => {
          console.error('Error deleting related stock entry from Back4App:', err);
        });
      }
    }
  },

  // Main Stock
  getMainStock(): MainStock[] {
    return getStore<MainStock[]>(KEYS.MAIN_STOCK, INITIAL_MAIN_STOCK);
  },

  updateMainStockQuantity(productId: string, deltaQuantity: number, type: 'entrada' | 'saida' | 'ajuste' | 'reposicao'): void {
    const mainStock = getStore<MainStock[]>(KEYS.MAIN_STOCK, INITIAL_MAIN_STOCK);
    const index = mainStock.findIndex(ms => ms.productId === productId);
    if (index !== -1) {
      let newQty = mainStock[index].quantity + deltaQuantity;
      if (newQty < 0) newQty = 0;

      let status: 'normal' | 'low' | 'empty' = 'normal';
      if (newQty === 0) status = 'empty';
      else if (newQty < mainStock[index].minQuantity) status = 'low';

      mainStock[index] = {
        ...mainStock[index],
        quantity: newQty,
        status,
        updatedAt: new Date().toISOString()
      };
      setStore(KEYS.MAIN_STOCK, mainStock);

      const products = this.getProducts();
      const pName = products.find(p => p.id === productId)?.name || 'Produto';
      this.logAction('STOCK_ADJUST', 'MainStock', mainStock[index].id, `Ajuste de estoque (${type}): ${pName} (${deltaQuantity > 0 ? '+' : ''}${deltaQuantity})`);

      // Trigger automatic warning notification if low
      if (status === 'low') {
        this.createNotification({
          userId: 'user-admin',
          title: 'Estoque Central Baixo!',
          message: `O estoque central do produto ${pName} está abaixo do mínimo desejável (${newQty} unidades).`,
          type: 'warning',
          relatedClass: 'MainStock',
          relatedObjectId: mainStock[index].id
        });
      }
    }
  },

  updateMainStockEntry(id: string, quantity: number, minQuantity: number): void {
    const mainStock = getStore<MainStock[]>(KEYS.MAIN_STOCK, INITIAL_MAIN_STOCK);
    const index = mainStock.findIndex(ms => ms.id === id);
    if (index !== -1) {
      let status: 'normal' | 'low' | 'empty' = 'normal';
      if (quantity === 0) status = 'empty';
      else if (quantity < minQuantity) status = 'low';

      mainStock[index] = {
        ...mainStock[index],
        quantity,
        minQuantity,
        status,
        updatedAt: new Date().toISOString()
      };
      setStore(KEYS.MAIN_STOCK, mainStock);

      const products = this.getProducts();
      const pName = products.find(p => p.id === mainStock[index].productId)?.name || 'Produto';
      this.logAction('STOCK_ADJUST', 'MainStock', id, `Atualizado registro de estoque: ${pName} (Qtd: ${quantity}, Mín: ${minQuantity})`);

      // Trigger automatic warning notification if low/empty
      if (status !== 'normal') {
        this.createNotification({
          userId: 'user-admin',
          title: status === 'empty' ? 'Estoque Zerado!' : 'Estoque Central Baixo!',
          message: `O estoque do produto ${pName} está em estado crítico (${quantity} de ${minQuantity} un).`,
          type: 'warning',
          relatedClass: 'MainStock',
          relatedObjectId: id
        });
      }

      // Sync to Back4App Parse Server if configured
      triggerBack4AppSync(KEYS.MAIN_STOCK, mainStock);
    } else {
      throw new Error('Registro de estoque não encontrado.');
    }
  },

  createMainStockEntry(productId: string, quantity: number, minQuantity: number): MainStock {
    const mainStock = getStore<MainStock[]>(KEYS.MAIN_STOCK, INITIAL_MAIN_STOCK);
    
    // Check if it already exists
    const existingIdx = mainStock.findIndex(ms => ms.productId === productId);
    if (existingIdx !== -1) {
      mainStock[existingIdx].quantity += quantity;
      if (minQuantity > 0) {
        mainStock[existingIdx].minQuantity = minQuantity;
      }
      let status: 'normal' | 'low' | 'empty' = 'normal';
      if (mainStock[existingIdx].quantity === 0) status = 'empty';
      else if (mainStock[existingIdx].quantity < mainStock[existingIdx].minQuantity) status = 'low';
      mainStock[existingIdx].status = status;
      mainStock[existingIdx].updatedAt = new Date().toISOString();
      setStore(KEYS.MAIN_STOCK, mainStock);
      
      const pName = this.getProducts().find(p => p.id === productId)?.name || 'Produto';
      this.logAction('STOCK_ADJUST', 'MainStock', mainStock[existingIdx].id, `Adicionado estoque ao item existente: ${pName} (+${quantity})`);
      return mainStock[existingIdx];
    }

    const products = this.getProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) throw new Error('Produto não encontrado.');

    let status: 'normal' | 'low' | 'empty' = 'normal';
    if (quantity === 0) status = 'empty';
    else if (quantity < minQuantity) status = 'low';

    const newEntry: MainStock = {
      id: `ms-${Date.now()}`,
      companyId: 'company-1',
      productId,
      quantity,
      minQuantity,
      status,
      updatedAt: new Date().toISOString()
    };

    mainStock.push(newEntry);
    setStore(KEYS.MAIN_STOCK, mainStock);

    this.logAction('CREATE', 'MainStock', newEntry.id, `Criado registro de estoque para: ${prod.name} (${quantity} un)`);
    return newEntry;
  },

  deleteMainStockEntry(id: string): void {
    const mainStock = getStore<MainStock[]>(KEYS.MAIN_STOCK, INITIAL_MAIN_STOCK);
    const index = mainStock.findIndex(ms => ms.id === id);
    if (index !== -1) {
      const ms = mainStock[index];
      const prod = this.getProducts().find(p => p.id === ms.productId);
      const prodName = prod ? prod.name : 'Produto';
      
      mainStock.splice(index, 1);
      setStore(KEYS.MAIN_STOCK, mainStock);
      this.logAction('DELETE', 'MainStock', id, `Removido registro de estoque geral do produto: ${prodName}`);
      deleteFromBack4App('MainStock', id).catch(err => {
        console.error('Error deleting main stock entry from Back4App:', err);
      });
    }
  },

  // Seller Stock
  getSellerStock(sellerId?: string): SellerStock[] {
    const stocks = getStore<SellerStock[]>(KEYS.SELLER_STOCK, INITIAL_SELLER_STOCK);
    if (sellerId) {
      return stocks.filter(s => s.sellerId === sellerId);
    }
    return stocks;
  },

  transferStockToSeller(sellerId: string, productId: string, quantityToTransfer: number): void {
    const mainStock = getStore<MainStock[]>(KEYS.MAIN_STOCK, INITIAL_MAIN_STOCK);
    const mStockIdx = mainStock.findIndex(ms => ms.productId === productId);
    
    if (mStockIdx === -1) throw new Error('Produto não localizado no estoque principal.');
    if (mainStock[mStockIdx].quantity < quantityToTransfer) {
      throw new Error(`Estoque principal insuficiente. Disponível: ${mainStock[mStockIdx].quantity}`);
    }

    // Subtract from Main Stock
    this.updateMainStockQuantity(productId, -quantityToTransfer, 'reposicao');

    // Add to Seller Stock
    const sellerStocks = getStore<SellerStock[]>(KEYS.SELLER_STOCK, INITIAL_SELLER_STOCK);
    const sStockIdx = sellerStocks.findIndex(ss => ss.sellerId === sellerId && ss.productId === productId);

    if (sStockIdx !== -1) {
      sellerStocks[sStockIdx] = {
        ...sellerStocks[sStockIdx],
        quantity: sellerStocks[sStockIdx].quantity + quantityToTransfer,
        lastUpdate: new Date().toISOString()
      };
    } else {
      sellerStocks.push({
        id: `ss-${Date.now()}`,
        companyId: 'company-1',
        sellerId,
        productId,
        quantity: quantityToTransfer,
        lastUpdate: new Date().toISOString()
      });
    }

    setStore(KEYS.SELLER_STOCK, sellerStocks);

    const sellers = this.getUsers();
    const sName = sellers.find(s => s.id === sellerId)?.fullName || 'Vendedor';
    const pName = this.getProducts().find(p => p.id === productId)?.name || 'Produto';
    
    this.logAction('STOCK_TRANSFER', 'SellerStock', sellerId, `Transferência de estoque: ${quantityToTransfer} un de ${pName} para carro de ${sName}`);
    
    // Create notification for seller
    this.createNotification({
      userId: sellerId,
      title: 'Estoque Recebido',
      message: `Você recebeu ${quantityToTransfer} unidades de ${pName} no seu veículo de transporte.`,
      type: 'success',
      relatedClass: 'SellerStock'
    });
  },

  // Pharmacy Consigned Stock
  getPharmacyStock(pharmacyId?: string): PharmacyStock[] {
    const pStock = getStore<PharmacyStock[]>(KEYS.PHARMACY_STOCK, INITIAL_PHARMACY_STOCK);
    if (pharmacyId) {
      return pStock.filter(ps => ps.pharmacyId === pharmacyId);
    }
    return pStock;
  },

  deliverPharmacyStock(pharmacyId: string, productId: string, sellerId: string, quantity: number, unitPrice: number): void {
    // Subtract from Seller stock first
    const sellerStocks = getStore<SellerStock[]>(KEYS.SELLER_STOCK, INITIAL_SELLER_STOCK);
    const ssIdx = sellerStocks.findIndex(ss => ss.sellerId === sellerId && ss.productId === productId);

    if (ssIdx === -1 || sellerStocks[ssIdx].quantity < quantity) {
      throw new Error(`Estoque no seu veículo é insuficiente para entrega (${ssIdx !== -1 ? sellerStocks[ssIdx].quantity : 0} disponíveis).`);
    }

    sellerStocks[ssIdx].quantity -= quantity;
    setStore(KEYS.SELLER_STOCK, sellerStocks);

    // Add to Pharmacy Consigned stock
    const pStocks = getStore<PharmacyStock[]>(KEYS.PHARMACY_STOCK, INITIAL_PHARMACY_STOCK);
    const psIdx = pStocks.findIndex(ps => ps.pharmacyId === pharmacyId && ps.productId === productId);

    const deliveryDateStr = new Date().toISOString().split('T')[0];
    const nextCheckDateStr = new Date(Date.now() + 3600000 * 24 * 15).toISOString().split('T')[0]; // check again in 15 days

    if (psIdx !== -1) {
      const remaining = pStocks[psIdx].quantityRemaining + quantity;
      pStocks[psIdx] = {
        ...pStocks[psIdx],
        quantityDelivered: pStocks[psIdx].quantityDelivered + quantity,
        quantityRemaining: remaining,
        deliveryDate: deliveryDateStr,
        nextCheckDate: nextCheckDateStr,
        status: remaining > 15 ? 'available' : 'low'
      };
    } else {
      pStocks.push({
        id: `ps-${Date.now()}`,
        companyId: 'company-1',
        pharmacyId,
        productId,
        sellerId,
        quantityDelivered: quantity,
        quantitySold: 0,
        quantityRemaining: quantity,
        unitPrice,
        totalValue: quantity * unitPrice,
        deliveryDate: deliveryDateStr,
        nextCheckDate: nextCheckDateStr,
        status: quantity > 15 ? 'available' : 'low'
      });
    }

    setStore(KEYS.PHARMACY_STOCK, pStocks);

    const pName = this.getPharmacies().find(ph => ph.id === pharmacyId)?.name || 'Farmácia';
    const prodName = this.getProducts().find(p => p.id === productId)?.name || 'Produto';
    this.logAction('CONSIGN_DELIVERY', 'PharmacyStock', pharmacyId, `Abastecimento consignado: ${quantity} un de ${prodName} na ${pName}`);

    // Trigger automation rules for after delivery
    this.runAutomationTrigger('days_after_delivery', pharmacyId, sellerId, {
      productNames: prodName,
      responsibleName: this.getPharmacies().find(ph => ph.id === pharmacyId)?.responsibleName || 'Comprador'
    });
  },

  // Sales Registration
  getSales(): Sale[] {
    return getStore<Sale[]>(KEYS.SALES, INITIAL_SALES);
  },

  registerSale(saleData: Omit<Sale, 'id' | 'createdAt'>): Sale {
    // Verify PharmacyStock remaining items
    const pharmacyStocks = getStore<PharmacyStock[]>(KEYS.PHARMACY_STOCK, INITIAL_PHARMACY_STOCK);
    const psIdx = pharmacyStocks.findIndex(ps => ps.pharmacyId === saleData.pharmacyId && ps.productId === saleData.productId);

    // If they are selling directly from vehicle stock (immediate sale)
    // Or if selling from consigned stock in the pharmacy.
    // Let's assume selling from vehicle stock or consigned stock depending on availability
    let soldFromConsigned = false;
    
    if (psIdx !== -1 && pharmacyStocks[psIdx].quantityRemaining >= saleData.quantity) {
      // Selling from consigned stock left at pharmacy!
      pharmacyStocks[psIdx].quantitySold += saleData.quantity;
      pharmacyStocks[psIdx].quantityRemaining -= saleData.quantity;
      pharmacyStocks[psIdx].status = pharmacyStocks[psIdx].quantityRemaining === 0 ? 'finished' : (pharmacyStocks[psIdx].quantityRemaining < 10 ? 'low' : 'available');
      setStore(KEYS.PHARMACY_STOCK, pharmacyStocks);
      soldFromConsigned = true;
    } else {
      // Selling directly from seller's car vehicle stock!
      const sellerStocks = getStore<SellerStock[]>(KEYS.SELLER_STOCK, INITIAL_SELLER_STOCK);
      const ssIdx = sellerStocks.findIndex(ss => ss.sellerId === saleData.sellerId && ss.productId === saleData.productId);

      if (ssIdx === -1 || sellerStocks[ssIdx].quantity < saleData.quantity) {
        throw new Error(`Estoque insuficiente no veículo ou consignado na farmácia (${ssIdx !== -1 ? sellerStocks[ssIdx].quantity : 0} disponíveis em carro).`);
      }

      sellerStocks[ssIdx].quantity -= saleData.quantity;
      setStore(KEYS.SELLER_STOCK, sellerStocks);
    }

    // Register Sale
    const sales = getStore<Sale[]>(KEYS.SALES, INITIAL_SALES);
    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    sales.unshift(newSale);
    setStore(KEYS.SALES, sales);

    // Update Seller Goal Progress
    const goals = getStore<Goal[]>(KEYS.GOALS, INITIAL_GOALS);
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const gIdx = goals.findIndex(g => g.sellerId === saleData.sellerId && g.month === currentMonth && g.year === currentYear);
    
    if (gIdx !== -1) {
      goals[gIdx].currentSales += 1;
      goals[gIdx].currentRevenue += newSale.total;
      setStore(KEYS.GOALS, goals);
    }

    // Log & Notify
    const pName = this.getPharmacies().find(ph => ph.id === saleData.pharmacyId)?.name || 'Farmácia';
    const prodName = this.getProducts().find(p => p.id === saleData.productId)?.name || 'Produto';
    const sellerName = this.getUsers().find(u => u.id === saleData.sellerId)?.fullName || 'Vendedor';

    this.logAction('SALE_CREATE', 'Sale', newSale.id, `Nova venda realizada por ${sellerName}: ${newSale.quantity} un de ${prodName} para ${pName}. Total: R$ ${newSale.total.toFixed(2)}`);

    // Notification for admin
    this.createNotification({
      userId: 'user-admin',
      title: 'Venda Realizada!',
      message: `${sellerName} vendeu ${newSale.quantity}un de ${prodName} para ${pName}. Valor: R$ ${newSale.total.toFixed(2)}.`,
      type: 'success',
      relatedClass: 'Sale',
      relatedObjectId: newSale.id
    });

    // Run Whatsapp automations for after sale
    this.runAutomationTrigger('after_sale', saleData.pharmacyId, saleData.sellerId, {
      saleTotal: `R$ ${newSale.total.toFixed(2)}`,
      responsibleName: this.getPharmacies().find(ph => ph.id === saleData.pharmacyId)?.responsibleName || 'Comprador'
    });

    // Run low stock automations if consigned stock just went low or finished
    if (soldFromConsigned && psIdx !== -1 && pharmacyStocks[psIdx].status !== 'available') {
      this.runAutomationTrigger('stock_low', saleData.pharmacyId, saleData.sellerId, {
        productNames: prodName,
        responsibleName: this.getPharmacies().find(ph => ph.id === saleData.pharmacyId)?.responsibleName || 'Comprador'
      });
    }

    return newSale;
  },

  // Visits & Calendar Operations
  getVisits(): Visit[] {
    return getStore<Visit[]>(KEYS.VISITS, INITIAL_VISITS);
  },

  scheduleVisit(visitData: Omit<Visit, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Visit {
    const visits = getStore<Visit[]>(KEYS.VISITS, INITIAL_VISITS);
    const newVisit: Visit = {
      ...visitData,
      id: `vis-${Date.now()}`,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    visits.unshift(newVisit);
    setStore(KEYS.VISITS, visits);

    const ph = this.getPharmacies().find(p => p.id === visitData.pharmacyId);
    if (ph) {
      ph.nextVisitDate = visitData.scheduledDate;
      this.updatePharmacy(ph);
    }

    const sellerName = this.getUsers().find(u => u.id === visitData.sellerId)?.fullName || 'Vendedor';
    const pharmacyName = ph?.name || 'Farmácia';
    this.logAction('VISIT_SCHEDULE', 'Visit', newVisit.id, `Visita agendada para ${pharmacyName} por ${sellerName} em ${visitData.scheduledDate} às ${visitData.scheduledTime}`);

    // Notify seller
    this.createNotification({
      userId: visitData.sellerId,
      title: 'Nova Visita Agendada',
      message: `Visita agendada para ${pharmacyName} no dia ${visitData.scheduledDate} às ${visitData.scheduledTime}.`,
      type: 'info',
      relatedClass: 'Visit',
      relatedObjectId: newVisit.id
    });

    // Trigger automated messages before visit (e.g. queue reminder WhatsApp)
    this.runAutomationTrigger('before_visit', visitData.pharmacyId, visitData.sellerId, {
      date: new Date(visitData.scheduledDate).toLocaleDateString('pt-BR'),
      time: visitData.scheduledTime,
      responsibleName: ph?.responsibleName || 'Responsável'
    });

    return newVisit;
  },

  updateVisit(updated: Visit): void {
    const visits = getStore<Visit[]>(KEYS.VISITS, INITIAL_VISITS);
    const index = visits.findIndex(v => v.id === updated.id);
    if (index !== -1) {
      visits[index] = { ...updated, updatedAt: new Date().toISOString() };
      setStore(KEYS.VISITS, visits);

      // If completed, update pharmacy lastVisitDate
      if (updated.status === 'completed') {
        const ph = this.getPharmacies().find(p => p.id === updated.pharmacyId);
        if (ph) {
          ph.lastVisitDate = updated.checkOutAt || new Date().toISOString();
          this.updatePharmacy(ph);
        }

        // Update Goal visits progress
        const goals = getStore<Goal[]>(KEYS.GOALS, INITIAL_GOALS);
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const gIdx = goals.findIndex(g => g.sellerId === updated.sellerId && g.month === currentMonth && g.year === currentYear);
        if (gIdx !== -1) {
          goals[gIdx].currentVisits += 1;
          setStore(KEYS.GOALS, goals);
        }

        // Trigger after visit automation
        this.runAutomationTrigger('after_visit', updated.pharmacyId, updated.sellerId, {
          responsibleName: ph?.responsibleName || 'Responsável'
        });
      }

      const pName = this.getPharmacies().find(ph => ph.id === updated.pharmacyId)?.name || 'Farmácia';
      this.logAction('VISIT_UPDATE', 'Visit', updated.id, `Status da visita na ${pName} alterado para: ${updated.status}`);
    }
  },

  deleteVisit(id: string): void {
    const visits = getStore<Visit[]>(KEYS.VISITS, INITIAL_VISITS);
    const index = visits.findIndex(v => v.id === id);
    if (index !== -1) {
      const pName = this.getPharmacies().find(ph => ph.id === visits[index].pharmacyId)?.name || 'Farmácia';
      const scheduledDate = visits[index].scheduledDate;
      visits.splice(index, 1);
      setStore(KEYS.VISITS, visits);
      this.logAction('DELETE', 'Visit', id, `Visita para ${pName} agendada para ${scheduledDate} foi removida`);
      deleteFromBack4App('Visit', id).catch(err => {
        console.error('Error deleting visit from Back4App:', err);
      });
    }
  },

  // Routes Management
  getRoutes(sellerId?: string): Route[] {
    const routes = getStore<Route[]>(KEYS.ROUTES, []);
    if (sellerId) {
      return routes.filter(r => r.sellerId === sellerId);
    }
    return routes;
  },

  getRouteStops(routeId?: string): RouteStop[] {
    const stops = getStore<RouteStop[]>(KEYS.ROUTE_STOPS, []);
    if (routeId) {
      return stops.filter(s => s.routeId === routeId).sort((a, b) => a.order - b.order);
    }
    return stops;
  },

  createRoute(r: Omit<Route, 'id' | 'status' | 'createdAt'>, stopPharmacyIds: string[]): Route {
    const routes = getStore<Route[]>(KEYS.ROUTES, []);
    const stops = getStore<RouteStop[]>(KEYS.ROUTE_STOPS, []);

    const newRoute: Route = {
      ...r,
      id: `route-${Date.now()}`,
      status: 'planned',
      createdAt: new Date().toISOString()
    };

    routes.unshift(newRoute);
    setStore(KEYS.ROUTES, routes);

    // Save stops
    stopPharmacyIds.forEach((pId, index) => {
      stops.push({
        id: `stop-${Date.now()}-${index}`,
        companyId: newRoute.companyId,
        routeId: newRoute.id,
        pharmacyId: pId,
        sellerId: newRoute.sellerId,
        order: index + 1,
        status: 'pending'
      });
    });

    setStore(KEYS.ROUTE_STOPS, stops);

    const sName = this.getUsers().find(u => u.id === r.sellerId)?.fullName || 'Vendedor';
    this.logAction('ROUTE_CREATE', 'Route', newRoute.id, `Rota criada para ${sName} com ${stopPharmacyIds.length} paradas.`);

    return newRoute;
  },

  updateRouteStatus(routeId: string, status: 'planned' | 'started' | 'completed' | 'canceled'): void {
    const routes = getStore<Route[]>(KEYS.ROUTES, []);
    const rIdx = routes.findIndex(r => r.id === routeId);
    if (rIdx !== -1) {
      routes[rIdx].status = status;
      setStore(KEYS.ROUTES, routes);

      // Log & Notify
      const sName = this.getUsers().find(u => u.id === routes[rIdx].sellerId)?.fullName || 'Vendedor';
      this.logAction('ROUTE_STATUS', 'Route', routeId, `Status da rota de ${sName} alterado para: ${status}`);

      if (status === 'started') {
        this.createNotification({
          userId: 'user-admin',
          title: 'Rota Iniciada!',
          message: `O vendedor ${sName} iniciou sua rota planejada para hoje.`,
          type: 'success',
          relatedClass: 'Route',
          relatedObjectId: routeId
        });
      }
    }
  },

  updateRouteStopStatus(stopId: string, status: 'pending' | 'visited' | 'skipped', notes?: string): void {
    const stops = getStore<RouteStop[]>(KEYS.ROUTE_STOPS, []);
    const idx = stops.findIndex(s => s.id === stopId);
    if (idx !== -1) {
      stops[idx].status = status;
      if (status === 'visited') {
        stops[idx].visitedAt = new Date().toISOString();
      }
      if (notes) {
        stops[idx].notes = notes;
      }
      setStore(KEYS.ROUTE_STOPS, stops);
    }
  },

  // Goals
  getGoals(sellerId?: string): Goal[] {
    const goals = getStore<Goal[]>(KEYS.GOALS, INITIAL_GOALS);
    if (sellerId) {
      return goals.filter(g => g.sellerId === sellerId);
    }
    return goals;
  },

  createGoal(g: Omit<Goal, 'id'>): Goal {
    const goals = getStore<Goal[]>(KEYS.GOALS, INITIAL_GOALS);
    const newGoal: Goal = {
      ...g,
      id: `goal-${g.sellerId}-${g.month}-${g.year}`
    };
    // Overwrite or create
    const idx = goals.findIndex(existing => existing.id === newGoal.id);
    if (idx !== -1) {
      goals[idx] = newGoal;
    } else {
      goals.push(newGoal);
    }
    setStore(KEYS.GOALS, goals);
    return newGoal;
  },

  // Expenses
  getExpenses(sellerId?: string): Expense[] {
    const expenses = getStore<Expense[]>(KEYS.EXPENSES, INITIAL_EXPENSES);
    if (sellerId) {
      return expenses.filter(e => e.sellerId === sellerId);
    }
    return expenses;
  },

  createExpense(e: Omit<Expense, 'id' | 'createdAt'>): Expense {
    const expenses = getStore<Expense[]>(KEYS.EXPENSES, INITIAL_EXPENSES);
    const newExpense: Expense = {
      ...e,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    expenses.unshift(newExpense);
    setStore(KEYS.EXPENSES, expenses);
    this.logAction('CREATE', 'Expense', newExpense.id, `Despesa registrada: ${newExpense.title} - R$ ${newExpense.amount.toFixed(2)}`);
    return newExpense;
  },

  // Notifications Hub
  getNotifications(userId?: string): SystemNotification[] {
    const notifs = getStore<SystemNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (userId) {
      return notifs.filter(n => n.userId === userId);
    }
    return notifs;
  },

  createNotification(n: Omit<SystemNotification, 'id' | 'companyId' | 'read' | 'createdAt'>): SystemNotification {
    const notifs = getStore<SystemNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotification: SystemNotification = {
      ...n,
      id: `not-${Date.now()}`,
      companyId: 'company-1',
      read: false,
      createdAt: new Date().toISOString()
    };
    notifs.unshift(newNotification);
    setStore(KEYS.NOTIFICATIONS, notifs);
    return newNotification;
  },

  markNotificationAsRead(id: string): void {
    const notifs = getStore<SystemNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const idx = notifs.findIndex(n => n.id === id);
    if (idx !== -1) {
      notifs[idx].read = true;
      setStore(KEYS.NOTIFICATIONS, notifs);
    }
  },

  markAllNotificationsAsRead(userId: string): void {
    const notifs = getStore<SystemNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = notifs.map(n => n.userId === userId ? { ...n, read: true } : n);
    setStore(KEYS.NOTIFICATIONS, updated);
  },

  // WhatsApp Messages & Queue
  getWhatsappMessages(): WhatsappMessage[] {
    return getStore<WhatsappMessage[]>(KEYS.WHATSAPP_MESSAGES, INITIAL_WHATSAPP_MESSAGES);
  },

  createWhatsappMessage(m: Omit<WhatsappMessage, 'id' | 'status'>): WhatsappMessage {
    const msgs = getStore<WhatsappMessage[]>(KEYS.WHATSAPP_MESSAGES, INITIAL_WHATSAPP_MESSAGES);
    const newMsg: WhatsappMessage = {
      ...m,
      id: `msg-${Date.now()}`,
      status: 'pending'
    };
    msgs.unshift(newMsg);
    setStore(KEYS.WHATSAPP_MESSAGES, msgs);
    return newMsg;
  },

  // Simulating the WhatsApp Send Queue Job (as requested by back4app cloud job)
  processWhatsappQueue(): void {
    const msgs = getStore<WhatsappMessage[]>(KEYS.WHATSAPP_MESSAGES, INITIAL_WHATSAPP_MESSAGES);
    let updatedCount = 0;
    const processed = msgs.map(m => {
      if (m.status === 'pending') {
        updatedCount++;
        return {
          ...m,
          status: 'sent' as const,
          sentAt: new Date().toISOString()
        };
      }
      return m;
    });
    if (updatedCount > 0) {
      setStore(KEYS.WHATSAPP_MESSAGES, processed);
      this.logAction('WHATSAPP_QUEUE', 'WhatsappMessage', 'system', `Fila de WhatsApp processada: ${updatedCount} mensagens disparadas.`);
    }
  },

  // Automations Config
  getAutomationRules(): AutomationRule[] {
    return getStore<AutomationRule[]>(KEYS.AUTOMATION_RULES, INITIAL_AUTOMATION_RULES);
  },

  updateAutomationRule(rule: AutomationRule): void {
    const rules = getStore<AutomationRule[]>(KEYS.AUTOMATION_RULES, INITIAL_AUTOMATION_RULES);
    const idx = rules.findIndex(r => r.id === rule.id);
    if (idx !== -1) {
      rules[idx] = rule;
      setStore(KEYS.AUTOMATION_RULES, rules);
      this.logAction('UPDATE', 'AutomationRule', rule.id, `Regra de automação atualizada: ${rule.name}. Ativo: ${rule.active}`);
    }
  },

  // Run Automations Trigger
  runAutomationTrigger(
    type: AutomationRule['triggerType'],
    pharmacyId: string,
    sellerId: string,
    replacements: Record<string, string>
  ): void {
    const rules = this.getAutomationRules();
    const activeRules = rules.filter(r => r.active && r.triggerType === type);
    const pharmacy = this.getPharmacies().find(ph => ph.id === pharmacyId);
    const company = this.getCompany();
    const seller = this.getUsers().find(u => u.id === sellerId);

    if (!pharmacy || !seller) return;

    activeRules.forEach(rule => {
      // Build message string with replacements
      let msgBody = rule.messageTemplate;
      
      // Default standard replacements
      const allReplacements = {
        responsibleName: pharmacy.responsibleName,
        pharmacyName: pharmacy.name,
        sellerName: seller.fullName,
        companyName: company.fantasyName,
        phone: pharmacy.phone,
        ...replacements
      };

      Object.entries(allReplacements).forEach(([key, value]) => {
        msgBody = msgBody.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value);
      });

      // Queue message
      this.createWhatsappMessage({
        companyId: 'company-1',
        pharmacyId,
        sellerId,
        phone: pharmacy.whatsapp,
        message: msgBody,
        type: rule.triggerType === 'before_visit' ? 'visit_reminder' : (rule.triggerType === 'after_sale' ? 'sale_followup' : 'custom'),
        scheduledAt: new Date().toISOString()
      });

      // Also create system notification for user tracking
      this.createNotification({
        userId: sellerId,
        title: 'Mensagem Agendada!',
        message: `A automação "${rule.name}" agendou uma mensagem WhatsApp para ${pharmacy.name}.`,
        type: 'info',
        relatedClass: 'WhatsappMessage'
      });
    });
  }
};
