/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Unlock, ShieldAlert, Sliders, KeyRound, Globe, Wifi, 
  Plus, History, CreditCard, ChevronRight, Check, AlertCircle, 
  HelpCircle, Sparkles, X, Eye, EyeOff
} from 'lucide-react';
import { Card, Transaction } from '../types';

interface CartesViewProps {
  cards: Card[];
  transactions: Transaction[];
  onUpdateCardSettings: (cardId: string, settings: Partial<Card>) => void;
  onAddNewCard: (card: Card) => void;
  onAddNotification: (title: string, message: string, type: 'salary' | 'payment' | 'security' | 'transfer' | 'beneficiary') => void;
  formatCurrency: (value: number) => string;
}

export default function CartesView({
  cards,
  transactions,
  onUpdateCardSettings,
  onAddNewCard,
  onAddNotification,
  formatCurrency
}: CartesViewProps) {
  const [activeCardId, setActiveCardId] = useState<string>(cards[0]?.id || '');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  
  // PIN change states
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  // New Card states
  const [newCardTheme, setNewCardTheme] = useState<'classic' | 'midnight' | 'gold' | 'emerald'>('gold');
  const [isCreatingCard, setIsCreatingCard] = useState(false);

  // Card details visibility
  const [revealedCardNumbers, setRevealedCardNumbers] = useState<Record<string, boolean>>({});

  const activeCard = cards.find(c => c.id === activeCardId) || cards[0];

  const toggleRevealCardNumber = (cardId: string) => {
    setRevealedCardNumbers(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Filter transactions for active card
  // Since our mock data doesn't explicitly link transactions to cards, we mock this by filtering debits / shopping for cards
  const cardTransactions = transactions.filter(tx => {
    if (activeCard.type === 'Physique') {
      // Physical card has grocery, transport, travel, restaurant
      return tx.amount < 0 && (tx.category === 'Alimentation' || tx.category === 'Transport' || tx.category === 'Loisirs' || tx.category === 'Logement');
    } else {
      // Virtual card is internet-focused (Amazon, Netflix, Apple, Spotify, Google, etc.)
      return tx.amount < 0 && (tx.category === 'Shopping' || tx.category === 'Abonnements');
    }
  });

  const handleToggleFreeze = () => {
    const nextStatus = !activeCard.isActive;
    onUpdateCardSettings(activeCard.id, { isActive: nextStatus });
    
    onAddNotification(
      nextStatus ? 'Carte débloquée' : 'Carte bloquée',
      `Votre carte ${activeCard.type} se terminant par ${activeCard.number.slice(-4)} a été ${nextStatus ? 'débloquée avec succès' : 'bloquée temporairement par sécurité'}.`,
      'security'
    );
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const limit = parseInt(e.target.value);
    onUpdateCardSettings(activeCard.id, { monthlyLimit: limit });
  };

  const handleToggleContactless = () => {
    const status = !activeCard.contactless;
    onUpdateCardSettings(activeCard.id, { contactless: status });
    onAddNotification(
      'Paiement sans contact',
      `Le paiement sans contact a été ${status ? 'activé' : 'désactivé'} sur votre carte.`,
      'security'
    );
  };

  const handleToggleIntl = () => {
    const status = !activeCard.intlPayments;
    onUpdateCardSettings(activeCard.id, { intlPayments: status });
    onAddNotification(
      'Paiements internationaux',
      `Les transactions à l'étranger ont été ${status ? 'activées' : 'désactivées'} sur votre carte.`,
      'security'
    );
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPin || !newPin || !confirmPin) {
      setPinError('Tous les champs sont requis.');
      return;
    }
    if (newPin.length !== 4 || isNaN(Number(newPin))) {
      setPinError('Le nouveau code PIN doit contenir exactement 4 chiffres.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('Le code de confirmation ne correspond pas.');
      return;
    }

    onUpdateCardSettings(activeCard.id, { pin: newPin });
    onAddNotification(
      'Code PIN modifié',
      `Le code PIN de votre carte se terminant par ${activeCard.number.slice(-4)} a été modifié avec succès.`,
      'security'
    );

    setPinSuccess(true);
    setPinError('');
    setTimeout(() => {
      setShowPinModal(false);
      setPinSuccess(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    }, 1500);
  };

  // Simulated virtual card minting
  const handleCreateVirtualCard = () => {
    setIsCreatingCard(true);
    
    setTimeout(() => {
      const randomCardNum = `4970 ${Math.floor(Math.random() * 9000 + 1000)} ${Math.floor(Math.random() * 9000 + 1000)} ${Math.floor(Math.random() * 9000 + 1000)}`;
      const randomCvv = String(Math.floor(Math.random() * 900 + 100));
      const expMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      const expYear = String(new Date().getFullYear() + 3).slice(-2);
      const randomId = `card-v-${Math.floor(Math.random() * 10000)}`;

      const mintedCard: Card = {
        id: randomId,
        type: 'Virtuelle',
        number: randomCardNum,
        expiry: `${expMonth}/${expYear}`,
        cvv: randomCvv,
        holder: 'GÉRAD LOPEZ',
        isActive: true,
        contactless: true,
        intlPayments: true,
        monthlyLimit: 1200,
        currentSpend: 0,
        pin: '••••',
        colorTheme: newCardTheme
      };

      onAddNewCard(mintedCard);
      setActiveCardId(randomId);
      onAddNotification(
        'Nouvelle carte virtuelle',
        `Votre carte de paiement virtuelle haut de gamme (${newCardTheme}) est prête à l'emploi.`,
        'security'
      );

      setIsCreatingCard(false);
      setShowCreateCardModal(false);
    }, 2500);
  };

  // Card themes styles
  const cardThemeStyles = {
    midnight: 'from-slate-900 via-[#111c34] to-blue-950 text-white border-white/10 shadow-slate-950/40',
    classic: 'from-slate-800 via-slate-900 to-[#1e293b] text-slate-100 border-slate-700/40 shadow-slate-950/30',
    gold: 'from-amber-700 via-amber-800 to-amber-950 text-amber-50 border-amber-600/20 shadow-amber-950/40',
    emerald: 'from-emerald-900 via-emerald-950 to-teal-950 text-emerald-50 border-emerald-800/20 shadow-emerald-950/40'
  };

  const getThemeLabel = (theme: string) => {
    if (theme === 'midnight') return 'Obsidian Navy';
    if (theme === 'gold') return 'Gold Royal';
    if (theme === 'emerald') return 'Emerald Luxe';
    return 'Classic Charcoal';
  };

  return (
    <div id="cartes-view" className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">Mes moyens de paiement</span>
          <h1 className="text-3xl font-sans font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Cartes Bancaires
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pilotez vos plafonds de dépenses, bloquez vos cartes ou générez-en de nouvelles.
          </p>
        </div>

        <motion.button
          id="trigger-create-card-btn"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowCreateCardModal(true)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/25 flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" /> Nouvelle carte
        </motion.button>
      </div>

      {/* Cards Slider / Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {cards.map((card) => (
          <button
            key={card.id}
            id={`select-card-${card.id}-btn`}
            onClick={() => setActiveCardId(card.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap border ${
              activeCardId === card.id
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            {card.type} (•••• {card.number.slice(-4)})
          </button>
        ))}
      </div>

      {/* Card Visual and Toggle detail actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card Visual & Balance */}
        <div className="lg:col-span-5 space-y-4">
          <motion.div
            key={activeCard.id}
            initial={{ opacity: 0, scale: 0.97, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.6 }}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${cardThemeStyles[activeCard.colorTheme]} p-6 text-white min-h-[220px] flex flex-col justify-between shadow-xl border relative`}
          >
            {/* Hologram card chip design */}
            <div className="flex justify-between items-start z-10">
              <div>
                <span className="px-2 py-0.5 rounded bg-white/10 text-[9px] uppercase tracking-widest font-mono border border-white/5">
                  {activeCard.type}
                </span>
                {!activeCard.isActive && (
                  <span className="ml-2 px-2 py-0.5 rounded bg-red-500/25 text-red-300 text-[9px] uppercase tracking-widest font-bold font-mono border border-red-500/10">
                    🔒 Carte bloquée
                  </span>
                )}
              </div>
              <span className="text-sm font-bold font-mono tracking-widest italic text-white/90">APEX</span>
            </div>

            {/* Chip icon graphic */}
            <div className="w-10 h-8 rounded bg-gradient-to-r from-amber-400/80 to-amber-200/50 shadow-inner border border-amber-300/10 my-1 z-10"></div>

            {/* Card number display */}
            <div className="flex items-center justify-between font-mono text-base md:text-lg tracking-widest text-white/90 z-10">
              <span>
                {revealedCardNumbers[activeCard.id] 
                  ? activeCard.number 
                  : `•••• •••• •••• ${activeCard.number.slice(-4)}`
                }
              </span>
              <button
                id={`reveal-card-${activeCard.id}-btn`}
                onClick={() => toggleRevealCardNumber(activeCard.id)}
                className="p-1.5 rounded bg-white/5 hover:bg-white/15 border border-white/5"
              >
                {revealedCardNumbers[activeCard.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Card Footer */}
            <div className="flex justify-between items-end mt-4 pt-3 border-t border-white/5 z-10">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/40 font-mono">Titulaire</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-white mt-0.5">{activeCard.holder}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/40 font-mono">Expire</p>
                  <p className="text-xs font-semibold text-white mt-0.5">{activeCard.expiry}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/40 font-mono">CVV</p>
                  <p className="text-xs font-semibold text-white mt-0.5">
                    {revealedCardNumbers[activeCard.id] ? activeCard.cvv : '•••'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Spend Summary */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold font-mono">DÉPENSÉ CE MOIS-CI</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold font-mono">
                {formatCurrency(activeCard.currentSpend)} / {formatCurrency(activeCard.monthlyLimit)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((activeCard.currentSpend / activeCard.monthlyLimit) * 100, 100)}%` }}
              />
            </div>

            <p className="text-[10px] text-slate-400 italic">
              Le plafond sera réinitialisé dans 20 jours. Les retraits au guichet sont limités à 1 000 € / semaine.
            </p>
          </div>
        </div>

        {/* Right Settings & Plafond controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-500" /> Options de sécurité & Plafonds
            </h3>

            {/* Sliders / Limit Control */}
            <div className="space-y-2 pb-4 border-b border-slate-50 dark:border-slate-850">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                  Plafond mensuel de paiement
                </label>
                <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">
                  {formatCurrency(activeCard.monthlyLimit)}
                </span>
              </div>
              <input 
                id="spending-limit-range"
                type="range" 
                min="500" 
                max="10000" 
                step="100"
                value={activeCard.monthlyLimit}
                onChange={handleLimitChange}
                className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>500 €</span>
                <span>5 000 €</span>
                <span>10 000 €</span>
              </div>
            </div>

            {/* Quick Action Toggles */}
            <div className="space-y-4">
              {/* Block/Unblock Card */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl ${activeCard.isActive ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'}`}>
                    {activeCard.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {activeCard.isActive ? 'Verrouiller temporairement la carte' : 'Déverrouiller la carte'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">Désactive instantanément les paiements et retraits.</p>
                  </div>
                </div>
                <button
                  id="toggle-freeze-card-btn"
                  onClick={handleToggleFreeze}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeCard.isActive 
                      ? 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}
                >
                  {activeCard.isActive ? 'Bloquer' : 'Débloquer'}
                </button>
              </div>

              {/* Pin Code change */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Code PIN de sécurité</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Consultez ou modifiez le code confidentiel de votre carte.</p>
                  </div>
                </div>
                <button
                  id="change-pin-btn"
                  onClick={() => setShowPinModal(true)}
                  className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 hover:text-slate-800 text-xs font-bold transition"
                >
                  Modifier PIN
                </button>
              </div>

              {/* Contactless payment toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Paiement sans contact</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Active ou désactive les règlements par carte à l'appareil de paiement.</p>
                  </div>
                </div>
                <button
                  id="toggle-contactless-btn"
                  onClick={handleToggleContactless}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none ${
                    activeCard.contactless ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300 ${activeCard.contactless ? 'translate-x-5.5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* International payment toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Paiements internationaux</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Autorise les paiements et retraits de devises en dehors de la zone Euro.</p>
                  </div>
                </div>
                <button
                  id="toggle-intl-payments-btn"
                  onClick={handleToggleIntl}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none ${
                    activeCard.intlPayments ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300 ${activeCard.intlPayments ? 'translate-x-5.5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card History */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-500" /> Historique d'achats de la carte ({activeCard.type})
        </h3>

        {cardTransactions.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-slate-400">
            <CreditCard className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">Aucune transaction récente enregistrée sur cette carte.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {cardTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{tx.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{tx.date} à {tx.time}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold font-mono text-slate-950 dark:text-white">
                    {tx.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </p>
                  <span className="inline-flex items-center px-1.5 py-0.25 rounded-full text-[9px] font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 mt-1">
                    Débit carte
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modify PIN code modal */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPinModal(false);
                setPinError('');
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Changer le code PIN</h3>
                <button 
                  id="close-pin-modal-btn"
                  onClick={() => {
                    setShowPinModal(false);
                    setPinError('');
                  }}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                {pinError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
                    {pinError}
                  </div>
                )}

                {pinSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold">
                    ✓ Code PIN modifié avec succès !
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Code PIN actuel</label>
                  <input
                    id="current-pin-input"
                    type="password"
                    maxLength={4}
                    required
                    placeholder="••••"
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-center font-mono tracking-widest focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nouveau PIN (4 chiffres)</label>
                  <input
                    id="new-pin-input"
                    type="password"
                    maxLength={4}
                    required
                    placeholder="••••"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-center font-mono tracking-widest focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Confirmer le nouveau PIN</label>
                  <input
                    id="confirm-pin-input"
                    type="password"
                    maxLength={4}
                    required
                    placeholder="••••"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-center font-mono tracking-widest focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  id="submit-pin-btn"
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition"
                >
                  Changer le code PIN
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create New Card Modal */}
      <AnimatePresence>
        {showCreateCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isCreatingCard) setShowCreateCardModal(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Créer une carte virtuelle</h3>
                {!isCreatingCard && (
                  <button 
                    id="close-create-card-btn"
                    onClick={() => setShowCreateCardModal(false)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {isCreatingCard ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative w-24 h-16 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse flex items-center justify-center text-white text-lg font-bold">
                    <Sparkles className="w-8 h-8 animate-spin" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Génération des clés de chiffrement...</h4>
                  <p className="text-xs text-slate-400 text-center max-w-xs">
                    Veuillez patienter pendant la création sécurisée de votre carte virtuelle Premium.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Générez une carte de paiement virtuelle instantanée, hautement sécurisée pour tous vos règlements Internet.
                  </p>

                  {/* Theme Select Visual */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono uppercase">
                      Style de la carte virtuelle
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: 'gold', name: 'Gold' },
                        { id: 'emerald', name: 'Emerald' },
                        { id: 'midnight', name: 'Midnight' }
                      ].map((theme) => (
                        <button
                          key={theme.id}
                          id={`select-theme-${theme.id}-btn`}
                          onClick={() => setNewCardTheme(theme.id as any)}
                          className={`p-3 rounded-xl border text-xs font-bold text-center capitalize transition-all ${
                            newCardTheme === theme.id
                              ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500'
                          }`}
                        >
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card parameters preview */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-mono uppercase text-[10px]">Plafond de dépenses</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">1 200 € / mois</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-mono uppercase text-[10px]">Titulaire de la carte</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">GÉRAD LOPEZ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-mono uppercase text-[10px]">Style sélectionné</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{getThemeLabel(newCardTheme)}</span>
                    </div>
                  </div>

                  <button
                    id="confirm-create-card-btn"
                    onClick={handleCreateVirtualCard}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" /> Générer ma carte virtuelle
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
