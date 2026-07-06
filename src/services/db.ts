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
  },
  {
    id: 'user-seller-rodrigo',
    username: 'rodrigo',
    fullName: 'Rodrigo Silva',
    email: 'rodrigo@pharmaroute.com.br',
    phone: '(11) 97654-3210',
    roleType: 'seller',
    status: 'active',
    city: 'Campinas',
    state: 'SP',
    createdBy: 'user-admin',
    createdAt: new Date('2026-02-15').toISOString(),
    updatedAt: new Date('2026-02-15').toISOString(),
    lastAccess: new Date().toISOString()
  },
  {
    id: 'user-seller-mariana',
    username: 'mariana',
    fullName: 'Mariana Costa',
    email: 'mariana@pharmaroute.com.br',
    phone: '(19) 98888-7777',
    roleType: 'seller',
    status: 'active',
    city: 'Ribeirão Preto',
    state: 'SP',
    createdBy: 'user-admin',
    createdAt: new Date('2026-03-01').toISOString(),
    updatedAt: new Date('2026-03-01').toISOString(),
    lastAccess: new Date().toISOString()
  }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    companyId: 'company-1',
    name: 'Dipirona Monoidratada 500mg',
    brand: 'Medley Genéricos',
    description: 'Analgésico e antitérmico eficaz, cartucho com 30 comprimidos.',
    sku: 'MED-DIP-500',
    barcode: '7891012345678',
    salePrice: 12.50,
    costPrice: 4.20,
    minStock: 200,
    status: 'active',
    createdAt: new Date('2026-01-15').toISOString(),
    updatedAt: new Date('2026-01-15').toISOString()
  },
  {
    id: 'prod-2',
    companyId: 'company-1',
    name: 'Paracetamol 750mg',
    brand: 'EMS S/A',
    description: 'Analgésico potente contra febre e dor de cabeça, embalagem com 20 comprimidos.',
    sku: 'EMS-PAR-750',
    barcode: '7891011223344',
    salePrice: 15.80,
    costPrice: 5.10,
    minStock: 150,
    status: 'active',
    createdAt: new Date('2026-01-15').toISOString(),
    updatedAt: new Date('2026-01-15').toISOString()
  },
  {
    id: 'prod-3',
    companyId: 'company-1',
    name: 'Ibuprofeno 600mg',
    brand: 'Neo Química',
    description: 'Anti-inflamatório e analgésico de rápida ação, caixa com 20 cápsulas moles.',
    sku: 'NEO-IBU-600',
    barcode: '7892020202020',
    salePrice: 22.90,
    costPrice: 8.50,
    minStock: 100,
    status: 'active',
    createdAt: new Date('2026-01-15').toISOString(),
    updatedAt: new Date('2026-01-15').toISOString()
  },
  {
    id: 'prod-4',
    companyId: 'company-1',
    name: 'Amoxicilina 500mg',
    brand: 'Eurofarma',
    description: 'Antibiótico de amplo espectro para infecções bacterianas comuns.',
    sku: 'EUR-AMO-500',
    barcode: '7893030303030',
    salePrice: 45.00,
    costPrice: 18.20,
    minStock: 50,
    status: 'active',
    createdAt: new Date('2026-01-15').toISOString(),
    updatedAt: new Date('2026-01-15').toISOString()
  },
  {
    id: 'prod-5',
    companyId: 'company-1',
    name: 'Losartana Potássica 50mg',
    brand: 'Prati-Donaduzzi',
    description: 'Anti-hipertensivo de uso contínuo, embalagem econômica com 60 comprimidos.',
    sku: 'PRATI-LOS-50',
    barcode: '7894040404040',
    salePrice: 18.00,
    costPrice: 5.90,
    minStock: 300,
    status: 'active',
    createdAt: new Date('2026-01-15').toISOString(),
    updatedAt: new Date('2026-01-15').toISOString()
  }
];

const INITIAL_PHARMACIES: Pharmacy[] = [
  {
    id: 'ph-1',
    companyId: 'company-1',
    name: 'Drogaria São Paulo - Centro',
    legalName: 'Drogaria São Paulo S/A',
    cnpj: '61.437.220/0001-70',
    responsibleName: 'Farm. Ricardo Prado',
    phone: '(11) 3214-4567',
    whatsapp: '(11) 91122-3344',
    email: 'dsp_centro@drogariasaopaulo.com.br',
    cep: '01001-000',
    address: 'Praça da Sé',
    number: '110',
    neighborhood: 'Centro Histórico',
    city: 'São Paulo',
    state: 'SP',
    latitude: -23.5505,
    longitude: -46.6333,
    googleMapsUrl: 'https://maps.google.com/?q=-23.5505,-46.6333',
    preferredDays: ['Seg', 'Qua'],
    preferredTime: 'Manhã',
    notes: 'Priorizar atendimento no início da manhã. Ricardo prefere contato por WhatsApp.',
    status: 'active',
    assignedSellerId: 'user-seller-rodrigo',
    lastVisitDate: '2026-06-25T14:30:00Z',
    nextVisitDate: '2026-07-03',
    createdAt: new Date('2026-02-01').toISOString(),
    updatedAt: new Date('2026-02-01').toISOString()
  },
  {
    id: 'ph-2',
    companyId: 'company-1',
    name: 'Droga Raia - Cambuí',
    legalName: 'Raia Drogasil S/A',
    cnpj: '61.585.865/0120-99',
    responsibleName: 'Juliana Mendes (Gerente)',
    phone: '(19) 3251-9988',
    whatsapp: '(19) 92233-4455',
    email: 'raia_cambui@raiadrogasil.com.br',
    cep: '13024-000',
    address: 'Av. Júlio de Mesquita',
    number: '850',
    neighborhood: 'Cambuí',
    city: 'Campinas',
    state: 'SP',
    latitude: -22.8944,
    longitude: -47.0503,
    googleMapsUrl: 'https://maps.google.com/?q=-22.8944,-47.0503',
    preferredDays: ['Ter', 'Qui'],
    preferredTime: 'Tarde',
    notes: 'Fazer conferência de estoque físico antes de fechar novos pedidos.',
    status: 'active',
    assignedSellerId: 'user-seller-rodrigo',
    lastVisitDate: '2026-06-26T15:00:00Z',
    nextVisitDate: '2026-07-02',
    createdAt: new Date('2026-02-01').toISOString(),
    updatedAt: new Date('2026-02-01').toISOString()
  },
  {
    id: 'ph-3',
    companyId: 'company-1',
    name: 'Farmácia Preço Popular - Taquaral',
    legalName: 'Clamed Farmácias Ltda',
    cnpj: '84.684.512/0350-10',
    responsibleName: 'Carlos Henrique (Comprador)',
    phone: '(19) 3208-1122',
    whatsapp: '(19) 93344-5566',
    email: 'fpp_taquaral@clamed.com.br',
    cep: '13076-000',
    address: 'Av. Nossa Senhora de Fátima',
    number: '1220',
    neighborhood: 'Taquaral',
    city: 'Campinas',
    state: 'SP',
    latitude: -22.8791,
    longitude: -47.0422,
    googleMapsUrl: 'https://maps.google.com/?q=-22.8791,-47.0422',
    preferredDays: ['Qua', 'Sex'],
    preferredTime: 'Manhã',
    notes: 'Solicitar reabastecimento de Dipirona e Ibuprofeno.',
    status: 'active',
    assignedSellerId: 'user-seller-rodrigo',
    lastVisitDate: '2026-06-20T10:00:00Z',
    nextVisitDate: '2026-07-04',
    createdAt: new Date('2026-02-01').toISOString(),
    updatedAt: new Date('2026-02-01').toISOString()
  },
  {
    id: 'ph-4',
    companyId: 'company-1',
    name: 'Farma Ponte - Botafogo',
    legalName: 'Grupo Farma Ponte S/A',
    cnpj: '45.123.456/0002-88',
    responsibleName: 'Dra. Sandra Regina',
    phone: '(19) 3233-4455',
    whatsapp: '(19) 94455-6677',
    email: 'fp_botafogo@farmaponte.com.br',
    cep: '13020-000',
    address: 'Av. Barão de Itapura',
    number: '1500',
    neighborhood: 'Botafogo',
    city: 'Campinas',
    state: 'SP',
    latitude: -22.8905,
    longitude: -47.0612,
    googleMapsUrl: 'https://maps.google.com/?q=-22.8905,-47.0612',
    preferredDays: ['Ter', 'Qui'],
    preferredTime: 'Manhã',
    notes: 'Espaço bom para displays promocionais na entrada.',
    status: 'active',
    assignedSellerId: 'user-seller-rodrigo',
    lastVisitDate: '2026-06-18T16:00:00Z',
    nextVisitDate: '2026-07-02',
    createdAt: new Date('2026-02-01').toISOString(),
    updatedAt: new Date('2026-02-01').toISOString()
  },
  {
    id: 'ph-5',
    companyId: 'company-1',
    name: 'Drogasil - Boulevard',
    legalName: 'Raia Drogasil S/A',
    cnpj: '61.585.865/0280-50',
    responsibleName: 'Felipe Souza (Gerente)',
    phone: '(16) 3610-1010',
    whatsapp: '(16) 95566-7788',
    email: 'drogasil_boulevard@raiadrogasil.com.br',
    cep: '14020-000',
    address: 'Av. do Café',
    number: '500',
    neighborhood: 'Boulevard',
    city: 'Ribeirão Preto',
    state: 'SP',
    latitude: -21.1775,
    longitude: -47.8103,
    googleMapsUrl: 'https://maps.google.com/?q=-21.1775,-47.8103',
    preferredDays: ['Seg', 'Sex'],
    preferredTime: 'Tarde',
    notes: 'Atendido por Mariana. Foco em repor antibióticos.',
    status: 'active',
    assignedSellerId: 'user-seller-mariana',
    lastVisitDate: '2026-06-27T11:00:00Z',
    nextVisitDate: '2026-07-06',
    createdAt: new Date('2026-03-05').toISOString(),
    updatedAt: new Date('2026-03-05').toISOString()
  }
];

const INITIAL_MAIN_STOCK: MainStock[] = [
  { id: 'ms-1', companyId: 'company-1', productId: 'prod-1', quantity: 2450, minQuantity: 200, status: 'normal', updatedAt: new Date().toISOString() },
  { id: 'ms-2', companyId: 'company-1', productId: 'prod-2', quantity: 1800, minQuantity: 150, status: 'normal', updatedAt: new Date().toISOString() },
  { id: 'ms-3', companyId: 'company-1', productId: 'prod-3', quantity: 120, minQuantity: 100, status: 'low', updatedAt: new Date().toISOString() },
  { id: 'ms-4', companyId: 'company-1', productId: 'prod-4', quantity: 450, minQuantity: 50, status: 'normal', updatedAt: new Date().toISOString() },
  { id: 'ms-5', companyId: 'company-1', productId: 'prod-5', quantity: 2900, minQuantity: 300, status: 'normal', updatedAt: new Date().toISOString() }
];

const INITIAL_SELLER_STOCK: SellerStock[] = [
  // Stock with Rodrigo Silva
  { id: 'ss-1', companyId: 'company-1', sellerId: 'user-seller-rodrigo', productId: 'prod-1', quantity: 150, lastUpdate: new Date().toISOString() },
  { id: 'ss-2', companyId: 'company-1', sellerId: 'user-seller-rodrigo', productId: 'prod-2', quantity: 80, lastUpdate: new Date().toISOString() },
  { id: 'ss-3', companyId: 'company-1', sellerId: 'user-seller-rodrigo', productId: 'prod-3', quantity: 45, lastUpdate: new Date().toISOString() },
  { id: 'ss-4', companyId: 'company-1', sellerId: 'user-seller-rodrigo', productId: 'prod-4', quantity: 15, lastUpdate: new Date().toISOString() },
  { id: 'ss-5', companyId: 'company-1', sellerId: 'user-seller-rodrigo', productId: 'prod-5', quantity: 120, lastUpdate: new Date().toISOString() },
  // Stock with Mariana Costa
  { id: 'ss-6', companyId: 'company-1', sellerId: 'user-seller-mariana', productId: 'prod-1', quantity: 200, lastUpdate: new Date().toISOString() },
  { id: 'ss-7', companyId: 'company-1', sellerId: 'user-seller-mariana', productId: 'prod-2', quantity: 100, lastUpdate: new Date().toISOString() }
];

const INITIAL_PHARMACY_STOCK: PharmacyStock[] = [
  {
    id: 'ps-1',
    companyId: 'company-1',
    pharmacyId: 'ph-1',
    productId: 'prod-1',
    sellerId: 'user-seller-rodrigo',
    quantityDelivered: 100,
    quantitySold: 75,
    quantityRemaining: 25,
    unitPrice: 12.50,
    totalValue: 1250,
    deliveryDate: '2026-06-10',
    nextCheckDate: '2026-07-03',
    status: 'low'
  },
  {
    id: 'ps-2',
    companyId: 'company-1',
    pharmacyId: 'ph-2',
    productId: 'prod-2',
    sellerId: 'user-seller-rodrigo',
    quantityDelivered: 50,
    quantitySold: 42,
    quantityRemaining: 8,
    unitPrice: 15.80,
    totalValue: 790,
    deliveryDate: '2026-06-12',
    nextCheckDate: '2026-07-02',
    status: 'low'
  },
  {
    id: 'ps-3',
    companyId: 'company-1',
    pharmacyId: 'ph-3',
    productId: 'prod-5',
    sellerId: 'user-seller-rodrigo',
    quantityDelivered: 150,
    quantitySold: 110,
    quantityRemaining: 40,
    unitPrice: 18.00,
    totalValue: 2700,
    deliveryDate: '2026-06-20',
    nextCheckDate: '2026-07-04',
    status: 'available'
  }
];

const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1',
    companyId: 'company-1',
    pharmacyId: 'ph-1',
    sellerId: 'user-seller-rodrigo',
    productId: 'prod-1',
    quantity: 40,
    unitPrice: 12.50,
    discount: 5,
    total: 475.00,
    paymentStatus: 'paid',
    saleDate: '2026-06-10T14:45:00Z',
    notes: 'Pedido faturado e entregue no ato.',
    latitude: -23.5505,
    longitude: -46.6333,
    createdAt: '2026-06-10T14:45:00Z'
  },
  {
    id: 'sale-2',
    companyId: 'company-1',
    pharmacyId: 'ph-2',
    sellerId: 'user-seller-rodrigo',
    productId: 'prod-2',
    quantity: 25,
    unitPrice: 15.80,
    discount: 0,
    total: 395.00,
    paymentStatus: 'paid',
    saleDate: '2026-06-12T15:30:00Z',
    latitude: -22.8944,
    longitude: -47.0503,
    createdAt: '2026-06-12T15:30:00Z'
  },
  {
    id: 'sale-3',
    companyId: 'company-1',
    pharmacyId: 'ph-3',
    sellerId: 'user-seller-rodrigo',
    productId: 'prod-5',
    quantity: 80,
    unitPrice: 18.00,
    discount: 10,
    total: 1296.00,
    paymentStatus: 'paid',
    saleDate: '2026-06-20T10:30:00Z',
    notes: 'Desconto de 10% autorizado pela diretoria.',
    latitude: -22.8791,
    longitude: -47.0422,
    createdAt: '2026-06-20T10:30:00Z'
  },
  {
    id: 'sale-4',
    companyId: 'company-1',
    pharmacyId: 'ph-1',
    sellerId: 'user-seller-rodrigo',
    productId: 'prod-4',
    quantity: 5,
    unitPrice: 45.00,
    discount: 0,
    total: 225.00,
    paymentStatus: 'paid',
    saleDate: '2026-06-25T14:40:00Z',
    latitude: -23.5505,
    longitude: -46.6333,
    createdAt: '2026-06-25T14:40:00Z'
  }
];

const INITIAL_VISITS: Visit[] = [
  {
    id: 'vis-1',
    companyId: 'company-1',
    pharmacyId: 'ph-2',
    sellerId: 'user-seller-rodrigo',
    scheduledDate: '2026-07-02',
    scheduledTime: '10:00',
    objective: 'Reposição de estoque de Paracetamol e conferência física.',
    status: 'scheduled',
    createdAt: '2026-06-30T10:00:00Z',
    updatedAt: '2026-06-30T10:00:00Z'
  },
  {
    id: 'vis-2',
    companyId: 'company-1',
    pharmacyId: 'ph-4',
    sellerId: 'user-seller-rodrigo',
    scheduledDate: '2026-07-02',
    scheduledTime: '14:30',
    objective: 'Apresentação do novo catálogo e fechamento de novos lotes.',
    status: 'scheduled',
    createdAt: '2026-06-30T10:05:00Z',
    updatedAt: '2026-06-30T10:05:00Z'
  },
  {
    id: 'vis-3',
    companyId: 'company-1',
    pharmacyId: 'ph-1',
    sellerId: 'user-seller-rodrigo',
    scheduledDate: '2026-07-03',
    scheduledTime: '09:00',
    objective: 'Visita de relacionamento e pós-venda da última entrega.',
    status: 'scheduled',
    createdAt: '2026-06-30T10:10:00Z',
    updatedAt: '2026-06-30T10:10:00Z'
  },
  {
    id: 'vis-4',
    companyId: 'company-1',
    pharmacyId: 'ph-5',
    sellerId: 'user-seller-mariana',
    scheduledDate: '2026-07-06',
    scheduledTime: '15:00',
    objective: 'Verificação de devolução de produtos e nova remessa.',
    status: 'scheduled',
    createdAt: '2026-06-30T11:00:00Z',
    updatedAt: '2026-06-30T11:00:00Z'
  },
  {
    id: 'vis-past-1',
    companyId: 'company-1',
    pharmacyId: 'ph-1',
    sellerId: 'user-seller-rodrigo',
    scheduledDate: '2026-06-25',
    scheduledTime: '14:00',
    objective: 'Verificar estoque consignado.',
    status: 'completed',
    checkInAt: '2026-06-25T14:15:00Z',
    checkOutAt: '2026-06-25T14:50:00Z',
    checkInLatitude: -23.5505,
    checkInLongitude: -46.6333,
    notes: 'Atendimento tranquilo com o Ricardo. Fechada venda de 5 unidades de Amoxicilina.',
    result: 'Venda realizada com sucesso.',
    createdAt: '2026-06-24T08:00:00Z',
    updatedAt: '2026-06-25T14:50:00Z'
  }
];

const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-rodrigo-7-2026',
    companyId: 'company-1',
    sellerId: 'user-seller-rodrigo',
    month: 7,
    year: 2026,
    salesGoal: 50,
    visitsGoal: 20,
    revenueGoal: 15000.00,
    currentSales: 0,
    currentVisits: 0,
    currentRevenue: 0
  },
  {
    id: 'goal-mariana-7-2026',
    companyId: 'company-1',
    sellerId: 'user-seller-mariana',
    month: 7,
    year: 2026,
    salesGoal: 40,
    visitsGoal: 15,
    revenueGoal: 12000.00,
    currentSales: 0,
    currentVisits: 0,
    currentRevenue: 0
  }
];

const INITIAL_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'auto-1',
    companyId: 'company-1',
    name: 'Lembrete de Visita de Amanhã',
    triggerType: 'before_visit',
    daysOffset: 1,
    messageTemplate: 'Olá, {{responsibleName}}! Aqui é o Rodrigo Silva, representante da {{companyName}}. Passando para confirmar que realizaremos uma visita à {{pharmacyName}} amanhã, dia {{date}} às {{time}}h para reabastecimento. Até logo!',
    active: true,
    createdBy: 'user-admin'
  },
  {
    id: 'auto-2',
    companyId: 'company-1',
    name: 'Alerta de Baixo Estoque',
    triggerType: 'stock_low',
    daysOffset: 0,
    messageTemplate: 'Olá {{responsibleName}}, notamos que o estoque dos seguintes produtos na {{pharmacyName}} está baixo: {{productNames}}. Gostaria de agendar uma visita para reposição esta semana?',
    active: true,
    createdBy: 'user-admin'
  },
  {
    id: 'auto-3',
    companyId: 'company-1',
    name: 'Agradecimento após Venda',
    triggerType: 'after_sale',
    daysOffset: 0,
    messageTemplate: 'Olá, {{responsibleName}}! Muito obrigado pela parceria na compra realizada hoje na {{pharmacyName}} no valor total de {{saleTotal}}. Já estamos preparando o faturamento.',
    active: true,
    createdBy: 'user-admin'
  }
];

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'not-1',
    companyId: 'company-1',
    userId: 'user-admin',
    title: 'Estoque Baixo Registrado',
    message: 'O estoque de Ibuprofeno 600mg na farmácia Droga Raia - Cambuí está classificado como BAIXO.',
    type: 'warning',
    read: false,
    relatedClass: 'PharmacyStock',
    relatedObjectId: 'ps-2',
    createdAt: new Date().toISOString()
  },
  {
    id: 'not-2',
    companyId: 'company-1',
    userId: 'user-seller-rodrigo',
    title: 'Visitas Agendadas para Hoje',
    message: 'Você possui 2 visitas programadas para hoje em Campinas. Abra sua rota inteligente!',
    type: 'info',
    read: false,
    relatedClass: 'Visit',
    relatedObjectId: 'vis-1',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_WHATSAPP_MESSAGES: WhatsappMessage[] = [
  {
    id: 'msg-1',
    companyId: 'company-1',
    pharmacyId: 'ph-2',
    sellerId: 'user-seller-rodrigo',
    phone: '(19) 92233-4455',
    message: 'Olá, Juliana Mendes! Passando para confirmar que realizaremos uma visita à Droga Raia - Cambuí amanhã, dia 02/07 às 10:00h para reabastecimento.',
    type: 'visit_reminder',
    status: 'sent',
    scheduledAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    sentAt: new Date(Date.now() - 3600000 * 19).toISOString()
  }
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    companyId: 'company-1',
    sellerId: 'user-seller-rodrigo',
    title: 'Abastecimento de Combustível',
    description: 'Posto Shell Campinas - Visitas do dia',
    amount: 140.00,
    category: 'Combustível',
    expenseDate: '2026-06-25',
    createdAt: new Date('2026-06-25').toISOString()
  },
  {
    id: 'exp-2',
    companyId: 'company-1',
    sellerId: 'user-seller-rodrigo',
    title: 'Almoço Executivo',
    description: 'Restaurante Varandão Cambuí',
    amount: 45.90,
    category: 'Alimentação',
    expenseDate: '2026-06-25',
    createdAt: new Date('2026-06-25').toISOString()
  }
];

const INITIAL_LOGS: SystemLog[] = [
  {
    id: 'log-1',
    companyId: 'company-1',
    userId: 'user-admin',
    action: 'LOGIN',
    className: '_User',
    objectId: 'user-admin',
    description: 'Usuário administrador efetuou login no sistema.',
    ip: '192.168.1.100',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

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
    const logs = getStore<SystemLog[]>(KEYS.SYSTEM_LOGS, []);
    const user = this.getCurrentUser();
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      companyId: 'company-1',
      userId: user?.id || 'system',
      action,
      className,
      objectId,
      description,
      ip: '127.0.0.1',
      createdAt: new Date().toISOString()
    };
    logs.unshift(newLog);
    setStore(KEYS.SYSTEM_LOGS, logs.slice(0, 500)); // keep last 500 logs
  },

  getSystemLogs(): SystemLog[] {
    return getStore<SystemLog[]>(KEYS.SYSTEM_LOGS, []);
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
