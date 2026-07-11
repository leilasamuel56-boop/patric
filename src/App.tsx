/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Send, ReceiptText, CreditCard, User, Bell, 
  Lock, Fingerprint, ShieldCheck, Sparkles, X, RotateCcw
} from 'lucide-react';

import { Transaction, Beneficiary, Transfer, Card, AppNotification } from './types';
import { 
  INITIAL_TRANSACTIONS, 
  INITIAL_BENEFICIARIES, 
  INITIAL_TRANSFERS, 
  INITIAL_CARDS, 
  INITIAL_NOTIFICATIONS 
} from './data/mockData';

import HomeView from './components/HomeView';
import TransactionsView from './components/TransactionsView';
import VirementsView from './components/VirementsView';
import CartesView from './components/CartesView';
import ProfilView from './components/ProfilView';

export default function App() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isBiometricsScanning, setIsBiometricsScanning] = useState(false);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<string>('accueil');

  // Shared Core States
  const [balance, setBalance] = useState<number>(38000); // Solde initial: 38 000 €
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(INITIAL_BENEFICIARIES);
  const [transfers, setTransfers] = useState<Transfer[]>(INITIAL_TRANSFERS);
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Preference Settings States
  const [darkMode, setDarkMode] = useState<boolean>(true); // Luxuriously dark by default
  const [language, setLanguage] = useState<'FR' | 'EN'>('FR');
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'GBP'>('EUR');

  // Global details sheet state
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Synchronize Dark Mode Class on Document
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle Passcode Input
  const handlePinInput = (num: string) => {
    if (pinCode.length >= 4) return;
    const nextPin = pinCode + num;
    setPinCode(nextPin);
    setAuthError('');

    // Check if passcode is correct (Correct PIN is "1234" for this premium demo)
    if (nextPin === '1234') {
      setTimeout(() => {
        setIsAuthenticated(true);
        setPinCode('');
        handleAddNotification(
          'Connexion réussie',
          'Ravi de vous revoir, M. Lopez. Votre session est entièrement sécurisée.',
          'security'
        );
      }, 300);
    } else if (nextPin.length === 4) {
      // Wrong PIN
      setTimeout(() => {
        setAuthError('Code d\'accès incorrect. Essayez 1234.');
        setPinCode('');
      }, 400);
    }
  };

  const handleBackspace = () => {
    setPinCode(prev => prev.slice(0, -1));
  };

  // Simulate Biometric login
  const handleBiometricLogin = () => {
    setIsBiometricsScanning(true);
    setAuthError('');

    setTimeout(() => {
      setIsAuthenticated(true);
      setIsBiometricsScanning(false);
      handleAddNotification(
        'Connexion biométrique',
        'Face ID validé. Accès sécurisé à vos comptes Apex.',
        'security'
      );
    }, 1800);
  };

  // Logout Handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinCode('');
    setActiveTab('accueil');
  };

  // State modification helpers
  const handleDeductBalance = (amount: number) => {
    setBalance(prev => prev - amount);
  };

  const handleAddTransfer = (newTransfer: Omit<Transfer, 'id'>) => {
    const completeTransfer: Transfer = {
      ...newTransfer,
      id: `tr-added-${Date.now()}`
    };
    setTransfers(prev => [completeTransfer, ...prev]);

    // Also inject as an official transaction in ledger
    const txFromTransfer: Transaction = {
      id: `tx-added-${Date.now()}`,
      name: newTransfer.beneficiaryName,
      date: newTransfer.date,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      amount: -newTransfer.amount, // negative
      category: 'Virement',
      status: 'validé',
      paymentMethod: 'Virement',
      reference: `VIR-${Math.floor(Math.random() * 900000 + 100000)}`,
      notes: newTransfer.reason
    };
    setTransactions(prev => [txFromTransfer, ...prev]);
  };

  const handleAddBeneficiary = (newBen: Omit<Beneficiary, 'id'>) => {
    const completeBen: Beneficiary = {
      ...newBen,
      id: `ben-added-${Date.now()}`
    };
    setBeneficiaries(prev => [completeBen, ...prev]);
  };

  const handleAddNewCard = (newCard: Card) => {
    setCards(prev => [...prev, newCard]);
  };

  const handleUpdateCardSettings = (cardId: string, settings: Partial<Card>) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, ...settings } : c));
  };

  const handleAddNotification = (
    title: string, 
    message: string, 
    type: 'salary' | 'payment' | 'security' | 'transfer' | 'beneficiary'
  ) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      date: '2026-07-11',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleMarkNotificationRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Currency Converter formatter
  const formatCurrency = (value: number) => {
    let rate = 1;
    let symbol = '€';
    let code = 'EUR';

    if (currency === 'USD') {
      rate = 1.09;
      symbol = '$';
      code = 'USD';
    } else if (currency === 'GBP') {
      rate = 0.85;
      symbol = '£';
      code = 'GBP';
    }

    const convertedValue = value * rate;
    return convertedValue.toLocaleString('fr-FR', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2
    });
  };

  // Render proper screen view based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'accueil':
        return (
          <HomeView
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            transactions={transactions}
            onOpenTransactionDetails={(tx) => setSelectedTx(tx)}
            cards={cards}
            beneficiaries={beneficiaries}
            onAddBeneficiary={handleAddBeneficiary}
            onAddNotification={handleAddNotification}
            formatCurrency={formatCurrency}
            balance={balance}
          />
        );
      case 'virements':
        return (
          <VirementsView
            beneficiaries={beneficiaries}
            transfers={transfers}
            onAddTransfer={handleAddTransfer}
            onAddBeneficiary={handleAddBeneficiary}
            onAddNotification={handleAddNotification}
            formatCurrency={formatCurrency}
            balance={balance}
            onDeductBalance={handleDeductBalance}
          />
        );
      case 'transactions':
        return (
          <TransactionsView
            transactions={transactions}
            onOpenTransactionDetails={(tx) => setSelectedTx(tx)}
            selectedTransaction={selectedTx}
            onCloseTransactionDetails={() => setSelectedTx(null)}
            formatCurrency={formatCurrency}
          />
        );
      case 'cartes':
        return (
          <CartesView
            cards={cards}
            transactions={transactions}
            onUpdateCardSettings={handleUpdateCardSettings}
            onAddNewCard={handleAddNewCard}
            onAddNotification={handleAddNotification}
            formatCurrency={formatCurrency}
          />
        );
      case 'profil':
        return (
          <ProfilView
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            language={language}
            onChangeLanguage={setLanguage}
            currency={currency}
            onChangeCurrency={setCurrency}
            onLogout={handleLogout}
            onAddNotification={handleAddNotification}
            formatCurrency={formatCurrency}
          />
        );
      default:
        return null;
    }
  };

  // Unread notifications indicator helper
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans antialiased selection:bg-blue-500/30">
      
      {/* Background ambient radial gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -left-1/4 -top-1/4 w-1/2 h-1/2 bg-blue-600/5 dark:bg-blue-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute -right-1/4 -bottom-1/4 w-1/2 h-1/2 bg-indigo-600/5 dark:bg-indigo-500/5 rounded-full blur-[120px]"></div>
      </div>

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          /* Lockscreen portal */
          <motion.div
            key="lockscreen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950 text-white p-6 md:p-8 overflow-y-auto"
          >
            {/* Header / Brand */}
            <div className="flex justify-between items-center max-w-md mx-auto w-full pt-4">
              <span className="font-mono text-sm tracking-widest font-extrabold text-blue-400">APEX BANQUE</span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 bg-blue-500/15 border border-blue-500/30 rounded-full text-blue-300">
                Premium secure client
              </span>
            </div>

            {/* Middle lock block */}
            <div className="max-w-xs mx-auto w-full text-center space-y-6 my-auto">
              <div className="relative inline-block">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-45 animate-pulse"></div>
                <div className="relative p-5 bg-slate-900 border border-slate-800 rounded-full text-blue-400">
                  <Lock className="w-8 h-8" />
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">Espace Sécurisé</h1>
                <p className="text-xs text-slate-400 mt-1.5">
                  Saisissez votre code PIN client pour accéder à l'administration de votre compte Gérad Lopez.
                </p>
              </div>

              {/* Enter PIN dots indicator */}
              <div className="flex justify-center gap-4 py-3">
                {[0, 1, 2, 3].map((dot) => (
                  <div
                    key={dot}
                    className={`w-3.5 h-3.5 rounded-full border-2 border-blue-500/60 transition-all ${
                      pinCode.length > dot 
                        ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' 
                        : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>

              {authError && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-semibold text-red-400 font-mono"
                >
                  {authError}
                </motion.p>
              )}

              {/* Keypad Panel */}
              <div className="grid grid-cols-3 gap-3.5 max-w-[260px] mx-auto pt-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <motion.button
                    key={num}
                    id={`keypad-${num}-btn`}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePinInput(num)}
                    className="w-14 h-14 rounded-full bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 font-bold text-lg flex items-center justify-center transition-all shadow-inner font-mono"
                  >
                    {num}
                  </motion.button>
                ))}
                
                {/* Backspace */}
                <motion.button
                  id="keypad-backspace-btn"
                  whileTap={{ scale: 0.9 }}
                  onClick={handleBackspace}
                  className="w-14 h-14 rounded-full bg-slate-950 border border-transparent font-bold text-sm flex items-center justify-center text-slate-400 hover:text-white transition-all font-mono"
                >
                  Retour
                </motion.button>

                {/* Zero */}
                <motion.button
                  id="keypad-0-btn"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePinInput('0')}
                  className="w-14 h-14 rounded-full bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 font-bold text-lg flex items-center justify-center transition-all shadow-inner font-mono"
                >
                  0
                </motion.button>

                {/* Biometrics biometric simulation trigger */}
                <motion.button
                  id="keypad-biometrics-btn"
                  whileTap={{ scale: 0.9 }}
                  onClick={handleBiometricLogin}
                  className="w-14 h-14 rounded-full bg-blue-950/40 border border-blue-900/40 text-blue-400 hover:bg-blue-950 hover:text-blue-300 flex items-center justify-center transition-all shadow-md shadow-blue-500/5"
                >
                  <Fingerprint className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Lockscreen footer */}
            <div className="max-w-md mx-auto w-full text-center text-[10px] text-slate-500 font-mono pb-4">
              {isBiometricsScanning ? (
                <div className="flex items-center justify-center gap-2 text-blue-400 font-semibold animate-pulse">
                  <Fingerprint className="w-4 h-4 animate-bounce" /> Scan biométrique Face ID en cours...
                </div>
              ) : (
                "SÉCURISÉ PAR CHIFFREMENT DE BOUT EN BOUT AES-256. PIN DE DÉMO: 1234"
              )}
            </div>
          </motion.div>
        ) : (
          /* Real logged in dashboard */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-6 pt-6 min-h-screen"
          >
            {/* Top Micro-Bar for Notifications Count alert */}
            <div className="flex justify-between items-center py-2.5 mb-4 border-b border-slate-100 dark:border-slate-800/60">
              <span className="font-mono text-xs font-bold tracking-widest text-slate-400">
                👑 APEX BANKING GROUP
              </span>

              <div className="flex items-center gap-4">
                <button
                  id="nav-to-notifs-btn"
                  onClick={() => setActiveTab('profil')}
                  className="relative p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-all flex items-center"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-600 text-white font-bold font-mono text-[9px] rounded-full flex items-center justify-center border border-white dark:border-slate-950">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Multi-Screen Tab Content with staggered enter effect */}
            <motion.main
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              {renderTabContent()}
            </motion.main>

            {/* Bottom floating premium blur navbar */}
            <div className="fixed bottom-5 left-0 right-0 z-40 px-4 max-w-md mx-auto pointer-events-none">
              <nav className="pointer-events-auto h-16 rounded-2xl bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl dark:shadow-black/50 px-3 flex items-center justify-between">
                {[
                  { id: 'accueil', icon: <Home className="w-5 h-5" />, label: 'Accueil' },
                  { id: 'virements', icon: <Send className="w-5 h-5" />, label: 'Virements' },
                  { id: 'transactions', icon: <ReceiptText className="w-5 h-5" />, label: 'Transactions' },
                  { id: 'cartes', icon: <CreditCard className="w-5 h-5" />, label: 'Cartes' },
                  { id: 'profil', icon: <User className="w-5 h-5" />, label: 'Profil' }
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`nav-${tab.id}-btn`}
                      onClick={() => {
                        setActiveTab(tab.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all relative group"
                    >
                      {/* Active item visual backing pill */}
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/15 rounded-xl -z-10 mx-1.5"
                          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        />
                      )}
                      
                      <div className={`transition-transform duration-300 ${isActive ? 'text-blue-600 dark:text-blue-400 scale-110' : 'group-hover:scale-105'}`}>
                        {tab.icon}
                      </div>
                      <span className={`text-[9px] mt-1 font-semibold ${isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail transactions pop-up modal shared globally (handled inside Transaction Details on TransactionsView or can be shown inside any screen if needed) */}
      <AnimatePresence>
        {selectedTx && activeTab !== 'transactions' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 z-10"
            >
              {/* Receipt Visual Header */}
              <div className="bg-gradient-to-br from-slate-900 via-[#0d1527] to-slate-900 p-6 text-white text-center relative">
                <button
                  id="close-shared-tx-details-btn"
                  onClick={() => setSelectedTx(null)}
                  className="absolute right-4 top-4 p-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-lg font-bold tracking-tight text-white">{selectedTx.name}</h3>
                <p className="text-3xl font-mono font-bold mt-2 text-white">
                  {selectedTx.amount > 0 ? '+' : ''}
                  {formatCurrency(selectedTx.amount)}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mt-3 font-mono">
                  Paiement validé
                </div>
              </div>

              {/* Receipt details */}
              <div className="p-6 space-y-4 text-slate-800 dark:text-slate-100">
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Catégorie</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTx.category}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Mode de paiement</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTx.paymentMethod}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Date et Heure</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTx.date} à {selectedTx.time}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Référence</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{selectedTx.reference}</span>
                  </div>

                  {selectedTx.notes && (
                    <div className="col-span-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 italic">
                      <span className="text-[10px] text-slate-400 font-mono block not-italic mb-1 font-bold uppercase">Note</span>
                      "{selectedTx.notes}"
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                  <button
                    id="shared-tx-close-btn"
                    onClick={() => setSelectedTx(null)}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-2xl text-xs transition"
                  >
                    Fermer le reçu
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
