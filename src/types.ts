/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  name: string;
  date: string; // e.g. "2026-07-11" or "2026-06-25"
  time: string; // e.g. "14:32"
  amount: number; // positive for credit, negative for debit
  category: string; // e.g. "Alimentation", "Shopping", "Loisirs", "Salaire", "Abonnement", "Transport", "Santé"
  status: 'validé' | 'en_attente' | 'échoué' | 'en_cours';
  paymentMethod: string; // e.g. "Carte Bancaire", "Virement", "Prélèvement"
  reference: string;
  notes?: string;
  location?: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  iban: string;
  bank: string;
  email?: string;
  phone?: string;
}

export interface Transfer {
  id: string;
  beneficiaryName: string;
  iban: string;
  amount: number;
  reason: string;
  date: string;
  status: 'Envoyé' | 'Reçu' | 'Programmé';
}

export interface Card {
  id: string;
  type: 'Physique' | 'Virtuelle';
  number: string; // e.g. "**** **** **** 8432"
  expiry: string;
  cvv: string;
  holder: string;
  isActive: boolean;
  contactless: boolean;
  intlPayments: boolean;
  monthlyLimit: number;
  currentSpend: number;
  pin: string;
  colorTheme: 'classic' | 'midnight' | 'gold' | 'emerald';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  time: string;
  read: boolean;
  type: 'salary' | 'payment' | 'security' | 'transfer' | 'beneficiary';
}
