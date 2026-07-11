/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, Beneficiary, Transfer, Card, AppNotification } from '../types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    name: 'Carrefour Market',
    date: '2026-07-11',
    time: '14:24',
    amount: -84.30,
    category: 'Alimentation',
    status: 'validé',
    paymentMethod: 'Carte Bancaire',
    reference: 'CB-9482-CARREFOUR',
    location: 'Paris, France',
    notes: 'Courses hebdomadaires - Alimentation générale.'
  },
  {
    id: 'tx-2',
    name: 'Amazon Europe',
    date: '2026-07-11',
    time: '09:15',
    amount: -129.99,
    category: 'Shopping',
    status: 'validé',
    paymentMethod: 'Carte Bancaire',
    reference: 'CB-8831-AMZN-EU',
    location: 'Internet',
    notes: 'Achat de livres et matériel de bureau.'
  },
  {
    id: 'tx-3',
    name: 'Netflix',
    date: '2026-07-10',
    time: '23:58',
    amount: -15.99,
    category: 'Abonnements',
    status: 'validé',
    paymentMethod: 'Prélèvement',
    reference: 'PRLV-NETFLIX-992',
    location: 'Internet',
    notes: 'Abonnement mensuel formule Premium 4K.'
  },
  {
    id: 'tx-4',
    name: 'Salaire',
    date: '2026-07-01',
    time: '08:00',
    amount: 4500.00,
    category: 'Salaire',
    status: 'validé',
    paymentMethod: 'Virement',
    reference: 'VIR-SAL-PEUGEOT-2026',
    location: 'Lille, France',
    notes: 'Salaire du mois de Juin 2026.'
  },
  {
    id: 'tx-5',
    name: 'Orange',
    date: '2026-06-29',
    time: '07:30',
    amount: -42.99,
    category: 'Abonnements',
    status: 'validé',
    paymentMethod: 'Prélèvement',
    reference: 'PRLV-ORANGE-FIBRE',
    location: 'Internet',
    notes: 'Facture mensuelle Internet Fibre + TV.'
  },
  {
    id: 'tx-6',
    name: 'Uber',
    date: '2026-06-28',
    time: '18:45',
    amount: -18.40,
    category: 'Transport',
    status: 'validé',
    paymentMethod: 'Carte Bancaire',
    reference: 'CB-1102-UBER-TRIP',
    location: 'Lyon, France',
    notes: 'Course retour séminaire professionnel.'
  },
  {
    id: 'tx-7',
    name: 'Air France',
    date: '2026-06-26',
    time: '11:20',
    amount: -685.00,
    category: 'Loisirs',
    status: 'validé',
    paymentMethod: 'Carte Bancaire',
    reference: 'CB-5203-AIRFRANCE',
    location: 'Paris CDG',
    notes: 'Billets d\'avion aller-retour Paris - New York.'
  },
  {
    id: 'tx-8',
    name: 'Apple',
    date: '2026-06-25',
    time: '03:12',
    amount: -2.99,
    category: 'Abonnements',
    status: 'validé',
    paymentMethod: 'Carte Bancaire',
    reference: 'CB-0092-APPLE-ICLOUD',
    location: 'Internet',
    notes: 'Extension de stockage iCloud+ 200 Go.'
  },
  {
    id: 'tx-9',
    name: 'Spotify',
    date: '2026-06-24',
    time: '05:00',
    amount: -10.99,
    category: 'Abonnements',
    status: 'validé',
    paymentMethod: 'Prélèvement',
    reference: 'PRLV-SPOTIFY-MUSIC',
    location: 'Internet',
    notes: 'Abonnement mensuel Spotify Premium.'
  },
  {
    id: 'tx-10',
    name: 'Restaurant Le Gourmet',
    date: '2026-06-22',
    time: '21:15',
    amount: -83.00,
    category: 'Alimentation',
    status: 'validé',
    paymentMethod: 'Carte Bancaire',
    reference: 'CB-4491-LE-GOURMET',
    location: 'Bordeaux, France',
    notes: 'Dîner d\'affaires gastronomique.'
  },
  {
    id: 'tx-11',
    name: 'Remboursement Assurance',
    date: '2026-06-20',
    time: '14:10',
    amount: 275.00,
    category: 'Loisirs',
    status: 'validé',
    paymentMethod: 'Virement',
    reference: 'VIR-ASSUR-SANTE',
    location: 'Paris, France',
    notes: 'Remboursement frais optiques par la mutuelle.'
  },
  {
    id: 'tx-12',
    name: 'TotalEnergies',
    date: '2026-06-18',
    time: '17:40',
    amount: -72.00,
    category: 'Transport',
    status: 'validé',
    paymentMethod: 'Carte Bancaire',
    reference: 'CB-3392-TOTAL-ENERGY',
    location: 'Aix-en-Provence, France',
    notes: 'Plein de carburant - Sans Plomb 98.'
  },
  {
    id: 'tx-13',
    name: 'Fnac',
    date: '2026-06-17',
    time: '15:30',
    amount: -219.00,
    category: 'Shopping',
    status: 'validé',
    paymentMethod: 'Carte Bancaire',
    reference: 'CB-7732-FNAC-RETAIL',
    location: 'Marseille, France',
    notes: 'Casque audio sans fil à réduction de bruit.'
  },
  {
    id: 'tx-14',
    name: 'Décathlon',
    date: '2026-06-15',
    time: '11:05',
    amount: -146.00,
    category: 'Loisirs',
    status: 'validé',
    paymentMethod: 'Carte Bancaire',
    reference: 'CB-1029-DECATHLON',
    location: 'Nantes, France',
    notes: 'Achat de vêtements de randonnée et gourde.'
  },
  {
    id: 'tx-15',
    name: 'Paiement reçu',
    date: '2026-06-13',
    time: '10:15',
    amount: 800.00,
    category: 'Virement',
    status: 'validé',
    paymentMethod: 'Virement',
    reference: 'VIR-MONNET-REMBOURSEMENT',
    location: 'Strasbourg, France',
    notes: 'Remboursement frais de voyage partagés.'
  },
  {
    id: 'tx-16',
    name: 'Loyer',
    date: '2026-06-10',
    time: '01:00',
    amount: -950.00,
    category: 'Logement',
    status: 'validé',
    paymentMethod: 'Prélèvement',
    reference: 'PRLV-LOYER-PARIS-12',
    location: 'Paris, France',
    notes: 'Loyer mensuel appartement.'
  },
  {
    id: 'tx-17',
    name: 'EDF',
    date: '2026-06-09',
    time: '08:45',
    amount: -136.00,
    category: 'Logement',
    status: 'validé',
    paymentMethod: 'Prélèvement',
    reference: 'PRLV-EDF-ELECTRICITE',
    location: 'Internet',
    notes: 'Facture d\'électricité bimestrielle.'
  },
  {
    id: 'tx-18',
    name: 'Canal+',
    date: '2026-06-08',
    time: '20:10',
    amount: -29.00,
    category: 'Abonnements',
    status: 'validé',
    paymentMethod: 'Prélèvement',
    reference: 'PRLV-CANALPLUS-TV',
    location: 'Internet',
    notes: 'Abonnement TV mensuel sport & ciné.'
  },
  {
    id: 'tx-19',
    name: 'Google One',
    date: '2026-06-06',
    time: '02:00',
    amount: -1.99,
    category: 'Abonnements',
    status: 'validé',
    paymentMethod: 'Prélèvement',
    reference: 'PRLV-GOOGLE-STORAGE',
    location: 'Internet',
    notes: 'Abonnement Google One 100 Go.'
  }
];

export const INITIAL_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ben-1',
    name: 'Marie Dubois',
    iban: 'FR76 1000 2000 3000 4000 5678 911',
    bank: 'Société Générale',
    email: 'marie.dubois@email.com',
    phone: '+33 6 12 34 56 78'
  },
  {
    id: 'ben-2',
    name: 'Thomas Bernard',
    iban: 'FR76 3002 4001 5002 0001 9876 543',
    bank: 'Crédit Agricole',
    email: 't.bernard@email.com',
    phone: '+33 6 87 65 43 21'
  },
  {
    id: 'ben-3',
    name: 'Paul Martin',
    iban: 'FR76 2002 8000 9000 1100 2233 445',
    bank: 'Banque Populaire',
    email: 'paul.martin@email.com'
  },
  {
    id: 'ben-4',
    name: 'Julie Robert',
    iban: 'FR76 4000 2200 9900 8800 7766 554',
    bank: 'CIC',
    email: 'julie.robert@email.com',
    phone: '+33 7 44 55 66 77'
  },
  {
    id: 'ben-5',
    name: 'Entreprise ABC',
    iban: 'FR76 9999 8888 7777 6666 5555 444',
    bank: 'BNP Paribas',
    email: 'finance@abc-corp.com'
  }
];

export const INITIAL_TRANSFERS: Transfer[] = [
  {
    id: 'tr-1',
    beneficiaryName: 'Marie Dubois',
    iban: 'FR76 1000 2000 3000 4000 5678 911',
    amount: 350.00,
    reason: 'Remboursement vacances',
    date: '2026-07-08',
    status: 'Envoyé'
  },
  {
    id: 'tr-2',
    beneficiaryName: 'Thomas Bernard',
    iban: 'FR76 3002 4001 5002 0001 9876 543',
    amount: 120.00,
    reason: 'Cadeau anniversaire',
    date: '2026-07-06',
    status: 'Reçu'
  },
  {
    id: 'tr-3',
    beneficiaryName: 'Paul Martin',
    iban: 'FR76 2002 8000 9000 1100 2233 445',
    amount: 1200.00,
    reason: 'Frais d\'agence et caution',
    date: '2026-07-04',
    status: 'Envoyé'
  },
  {
    id: 'tr-4',
    beneficiaryName: 'Julie Robert',
    iban: 'FR76 4000 2200 9900 8800 7766 554',
    amount: 500.00,
    reason: 'Virement récurrent épargne',
    date: '2026-07-15',
    status: 'Programmé'
  },
  {
    id: 'tr-5',
    beneficiaryName: 'Entreprise ABC',
    iban: 'FR76 9999 8888 7777 6666 5555 444',
    amount: 4500.00,
    reason: 'Facture prestation freelance',
    date: '2026-07-01',
    status: 'Reçu'
  }
];

export const INITIAL_CARDS: Card[] = [
  {
    id: 'card-1',
    type: 'Physique',
    number: '4532 9482 1029 0014',
    expiry: '12/29',
    cvv: '382',
    holder: 'GÉRARD LOPEZ',
    isActive: true,
    contactless: true,
    intlPayments: true,
    monthlyLimit: 5000,
    currentSpend: 1354.28,
    pin: '••••',
    colorTheme: 'midnight'
  },
  {
    id: 'card-2',
    type: 'Virtuelle',
    number: '4970 8213 4452 9012',
    expiry: '08/27',
    cvv: '109',
    holder: 'GÉRARD LOPEZ',
    isActive: true,
    contactless: true,
    intlPayments: true,
    monthlyLimit: 1500,
    currentSpend: 216.28,
    pin: '••••',
    colorTheme: 'classic'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Salaire reçu',
    message: 'Votre salaire de 4 500,00 € de la part de PEUGEOT SA a été crédité.',
    date: '2026-07-01',
    time: '08:05',
    read: false,
    type: 'salary'
  },
  {
    id: 'notif-2',
    title: 'Paiement validé',
    message: 'Votre achat de 84,30 € chez Carrefour Market a été traité avec succès.',
    date: '2026-07-11',
    time: '14:25',
    read: false,
    type: 'payment'
  },
  {
    id: 'notif-3',
    title: 'Connexion réussie',
    message: 'Une connexion à votre espace client a été enregistrée depuis Paris, France.',
    date: '2026-07-11',
    time: '08:42',
    read: true,
    type: 'security'
  },
  {
    id: 'notif-4',
    title: 'Carte utilisée',
    message: 'Votre carte physique se terminant par 0014 a été utilisée pour un montant de 129,99 € sur Amazon Europe.',
    date: '2026-07-11',
    time: '09:16',
    read: true,
    type: 'payment'
  },
  {
    id: 'notif-5',
    title: 'Nouveau bénéficiaire ajouté',
    message: 'Julie Robert (CIC) a été ajoutée avec succès à votre liste de bénéficiaires.',
    date: '2026-06-25',
    time: '14:50',
    read: true,
    type: 'beneficiary'
  },
  {
    id: 'notif-6',
    title: 'Virement terminé',
    message: 'Votre virement de 350,00 € à destination de Marie Dubois a été exécuté.',
    date: '2026-07-08',
    time: '10:15',
    read: true,
    type: 'transfer'
  }
];
