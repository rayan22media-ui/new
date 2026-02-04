
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum Currency {
  USD = 'USD',
  TRY = 'TRY',
  SYP = 'SYP',
  SAR = 'SAR'
}

export interface ExchangeRates {
  USD: number; // Always 1
  TRY: number;
  SYP: number;
  SAR: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  quantity: number;
  date: string;
  customerName?: string;
  invoiceNumber: string;
  isPaid: boolean;
  currency: Currency;
  exchangeRate: number; // The rate at the time of transaction relative to USD
}

export interface FinancialStats {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  paidIncome: number;
  pendingIncome: number;
  paidExpense?: number;
  pendingExpense?: number;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface AppConfig {
  sheetUrl: string;
  googleSheetId: string;
  lastSync: string;
  rates: ExchangeRates;
}
