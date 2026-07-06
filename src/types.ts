/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'seller';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  email: string;
  phone: string;
  roleType: UserRole;
  status: UserStatus;
  photoUrl?: string;
  city: string;
  state: string;
  createdBy?: string; // User ID
  lastAccess?: string; // Date string
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  fantasyName: string;
  cnpj: string;
  phone: string;
  whatsapp: string;
  email: string;
  logoUrl?: string;
  primaryColor: string;
  address: string;
  city: string;
  state: string;
  ownerId: string;
  theme: 'light' | 'dark';
}

export interface Pharmacy {
  id: string;
  companyId: string;
  name: string;
  legalName: string;
  cnpj: string;
  responsibleName: string;
  phone: string;
  whatsapp: string;
  email: string;
  cep: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
  preferredDays: string[]; // ['Seg', 'Ter', etc]
  preferredTime: string; // 'Manhã', 'Tarde', etc
  notes?: string;
  status: 'active' | 'inactive';
  assignedSellerId: string; // User ID
  lastVisitDate?: string;
  nextVisitDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  brand: string;
  description: string;
  sku: string;
  barcode: string;
  imageUrl?: string;
  salePrice: number;
  costPrice: number;
  minStock: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface MainStock {
  id: string;
  companyId: string;
  productId: string;
  quantity: number;
  minQuantity: number;
  status: 'normal' | 'low' | 'empty';
  updatedAt: string;
}

export interface SellerStock {
  id: string;
  companyId: string;
  sellerId: string; // User ID
  productId: string;
  quantity: number;
  lastUpdate: string;
}

export interface PharmacyStock {
  id: string;
  companyId: string;
  pharmacyId: string;
  productId: string;
  sellerId: string;
  quantityDelivered: number;
  quantitySold: number;
  quantityRemaining: number;
  unitPrice: number;
  totalValue: number;
  deliveryDate: string;
  nextCheckDate?: string;
  status: 'available' | 'low' | 'finished';
}

export interface Sale {
  id: string;
  companyId: string;
  pharmacyId: string;
  sellerId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number; // as percentage or value? Let's use percentage or flat value. We'll support both, stored as absolute value.
  total: number;
  paymentStatus: 'pending' | 'paid' | 'partial';
  saleDate: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface Visit {
  id: string;
  companyId: string;
  pharmacyId: string;
  sellerId: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  objective: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'canceled';
  checkInAt?: string;
  checkOutAt?: string;
  checkInLatitude?: number;
  checkInLongitude?: number;
  notes?: string;
  result?: string;
  photoUrl?: string;
  nextVisitDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  companyId: string;
  sellerId: string;
  routeDate: string;
  title: string;
  status: 'planned' | 'started' | 'completed' | 'canceled';
  totalDistanceKm: number;
  estimatedTimeMinutes: number;
  googleMapsUrl?: string;
  createdBy: string;
  createdAt: string;
}

export interface RouteStop {
  id: string;
  companyId: string;
  routeId: string;
  pharmacyId: string;
  sellerId: string;
  order: number;
  status: 'pending' | 'visited' | 'skipped';
  estimatedArrival?: string;
  visitedAt?: string;
  notes?: string;
}

export interface WhatsappMessage {
  id: string;
  companyId: string;
  pharmacyId: string;
  sellerId: string;
  phone: string;
  message: string;
  type: 'visit_reminder' | 'stock_followup' | 'sale_followup' | 'custom';
  status: 'pending' | 'sent' | 'failed';
  scheduledAt: string;
  sentAt?: string;
  errorMessage?: string;
}

export interface AutomationRule {
  id: string;
  companyId: string;
  name: string;
  triggerType: 'before_visit' | 'after_visit' | 'after_sale' | 'stock_low' | 'days_after_delivery';
  daysOffset: number;
  messageTemplate: string;
  active: boolean;
  createdBy: string;
}

export interface SystemNotification {
  id: string;
  companyId: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  relatedClass?: string;
  relatedObjectId?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  companyId: string;
  sellerId: string;
  month: number; // 1-12
  year: number;
  salesGoal: number; // quantity of sales
  visitsGoal: number; // quantity of visits
  revenueGoal: number; // total R$ amount
  currentSales: number;
  currentVisits: number;
  currentRevenue: number;
}

export interface Expense {
  id: string;
  companyId: string;
  sellerId: string;
  title: string;
  description?: string;
  amount: number;
  category: string; // 'Combustível', 'Alimentação', 'Hospedagem', 'Outros'
  expenseDate: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface SystemLog {
  id: string;
  companyId: string;
  userId: string;
  action: string;
  className: string;
  objectId: string;
  description: string;
  ip?: string;
  createdAt: string;
}
