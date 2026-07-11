/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, SlidersHorizontal, Calendar, Clock, Landmark, CreditCard, 
  Tag, MapPin, FileText, X, CheckCircle2, ChevronRight, Download, 
  HelpCircle, Coffee, ShoppingBag, Smartphone, Music, Car, Plane, 
  ArrowUpRight, ArrowDownLeft, ReceiptText
} from 'lucide-react';
import { Transaction } from '../types';

interface TransactionsViewProps {
  transactions: Transaction[];
  onOpenTransactionDetails: (tx: Transaction) => void;
  selectedTransaction: Transaction | null;
  onCloseTransactionDetails: () => void;
  formatCurrency: (value: number) => string;
}

type PeriodFilter = 'tout' | 'aujourd_hui' | 'semaine' | 'mois' | 'annee';
type TypeFilter = 'all' | 'credit' | 'debit';

export default function TransactionsView({
  transactions,
  onOpenTransactionDetails,
  selectedTransaction,
  onCloseTransactionDetails,
  formatCurrency
}: TransactionsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('tout');
  const [selectedType, setSelectedType] = useState<TypeFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');

  // Categories list extraction
  const categories = useMemo(() => {
    const list = new Set(transactions.map(t => t.category));
    return ['Toutes', ...Array.from(list)];
  }, [transactions]);

  // Date helper to check ranges relative to current date (July 11, 2026)
  const isWithinPeriod = (txDateStr: string, period: PeriodFilter): boolean => {
    if (period === 'tout') return true;

    const txDate = new Date(txDateStr);
    const currentDate = new Date('2026-07-11');

    if (period === 'aujourd_hui') {
      return txDateStr === '2026-07-11';
    }

    if (period === 'semaine') {
      // Calculate the start of the week (Sunday to Saturday)
      const diff = currentDate.getDate() - currentDate.getDay();
      const startOfWeek = new Date(currentDate.setDate(diff));
      startOfWeek.setHours(0, 0, 0, 0);
      return txDate >= startOfWeek;
    }

    if (period === 'mois') {
      // July 2026
      return txDate.getMonth() === currentDate.getMonth() && txDate.getFullYear() === currentDate.getFullYear();
    }

    if (period === 'annee') {
      // 2026
      return txDate.getFullYear() === currentDate.getFullYear();
    }

    return true;
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search matches name, category, or notes
      const matchesSearch = 
        tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tx.reference.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType = 
        selectedType === 'all' ||
        (selectedType === 'credit' && tx.amount > 0) ||
        (selectedType === 'debit' && tx.amount < 0);

      // Period filter
      const matchesPeriod = isWithinPeriod(tx.date, selectedPeriod);

      // Category filter
      const matchesCategory = selectedCategory === 'Toutes' || tx.category === selectedCategory;

      return matchesSearch && matchesType && matchesPeriod && matchesCategory;
    });
  }, [transactions, searchQuery, selectedPeriod, selectedType, selectedCategory]);

  const getCategoryIcon = (category: string, name: string) => {
    const n = name.toLowerCase();
    if (category === 'Alimentation') {
      if (n.includes('restaurant') || n.includes('gourmet')) return <Coffee className="w-5 h-5 text-amber-500" />;
      return <ShoppingBag className="w-5 h-5 text-orange-500" />;
    }
    if (category === 'Shopping') return <ShoppingBag className="w-5 h-5 text-indigo-500" />;
    if (category === 'Abonnements') {
      if (n.includes('netflix')) return <Smartphone className="w-5 h-5 text-red-500" />;
      if (n.includes('spotify')) return <Music className="w-5 h-5 text-green-500" />;
      return <Smartphone className="w-5 h-5 text-blue-500" />;
    }
    if (category === 'Salaire') return <Landmark className="w-5 h-5 text-emerald-500" />;
    if (category === 'Transport') {
      if (n.includes('total') || n.includes('carburant')) return <Car className="w-5 h-5 text-yellow-500" />;
      return <Car className="w-5 h-5 text-blue-400" />;
    }
    if (category === 'Loisirs') {
      if (n.includes('air france') || n.includes('voyage')) return <Plane className="w-5 h-5 text-cyan-500" />;
      return <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>;
    }
    if (category === 'Logement') return <Landmark className="w-5 h-5 text-teal-500" />;
    return <HelpCircle className="w-5 h-5 text-gray-500" />;
  };

  const formatDateFrench = (dateStr: string) => {
    if (dateStr === '2026-07-11') return "Aujourd'hui";
    if (dateStr === '2026-07-10') return 'Hier';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div id="transactions-view" className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">Historique</span>
        <h1 className="text-3xl font-sans font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Mes Transactions
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Consultez et filtrez tous vos mouvements bancaires premium.
        </p>
      </div>

      {/* Search & Filter bar */}
      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
          <input
            id="search-transactions-input"
            type="text"
            placeholder="Rechercher une transaction (ex: Carrefour, Amazon, Fnac...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800/80 rounded-xl focus:outline-none focus:border-blue-500 text-sm transition-all"
          />
        </div>

        {/* Filters Grid */}
        <div className="flex flex-col gap-3 pt-1">
          {/* Tri par Période */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-slate-400 font-semibold mr-2 font-mono">Période:</span>
            {[
              { id: 'tout', label: 'Toutes' },
              { id: 'aujourd_hui', label: "Aujourd'hui" },
              { id: 'semaine', label: 'Cette semaine' },
              { id: 'mois', label: 'Ce mois-ci' },
              { id: 'annee', label: 'Cette année' },
            ].map((period) => (
              <button
                key={period.id}
                id={`filter-period-${period.id}-btn`}
                onClick={() => setSelectedPeriod(period.id as PeriodFilter)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedPeriod === period.id
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Tri par Type (Crédit/Débit) */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-slate-400 font-semibold mr-2 font-mono">Type:</span>
            {[
              { id: 'all', label: 'Tout' },
              { id: 'credit', label: 'Entrées (+)' },
              { id: 'debit', label: 'Sorties (-)' },
            ].map((type) => (
              <button
                key={type.id}
                id={`filter-type-${type.id}-btn`}
                onClick={() => setSelectedType(type.id as TypeFilter)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedType === type.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Tri par Catégorie */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-slate-400 font-semibold mr-2 font-mono">Catégorie:</span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {categories.map((category) => (
                <button
                  key={category}
                  id={`filter-cat-${category.replace(/\s+/g, '-').toLowerCase()}-btn`}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Count and Results */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold font-mono text-slate-400">
            {filteredTransactions.length} TRANSACTION{filteredTransactions.length > 1 ? 'S' : ''} TROUVÉE{filteredTransactions.length > 1 ? 'S' : ''}
          </span>
          {searchQuery || selectedPeriod !== 'tout' || selectedType !== 'all' || selectedCategory !== 'Toutes' ? (
            <button
              id="reset-filters-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedPeriod('tout');
                setSelectedType('all');
                setSelectedCategory('Toutes');
              }}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Réinitialiser les filtres
            </button>
          ) : null}
        </div>

        {filteredTransactions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center"
          >
            <div className="p-4 bg-slate-50 dark:bg-slate-950 text-slate-400 rounded-full mb-3">
              <Search className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Aucune transaction trouvée</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Modifiez vos mots clés de recherche ou essayez d'autres filtres pour trouver ce que vous cherchez.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((tx, idx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.04, 0.4), duration: 0.4 }}
                onClick={() => onOpenTransactionDetails(tx)}
                className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100/80 dark:border-slate-800/80 rounded-2xl hover:border-blue-100 dark:hover:border-blue-900/50 shadow-sm hover:shadow-md cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30 transition-colors">
                    {getCategoryIcon(tx.category, tx.name)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tx.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDateFrench(tx.date)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {tx.time}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-base font-bold font-mono ${tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mt-1.5 border border-slate-200/40 dark:border-slate-700/50">
                    {tx.status === 'validé' ? 'Paiement validé' : tx.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Details Side Sheet / Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseTransactionDetails}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 z-10"
            >
              {/* Top abstract card header */}
              <div className="bg-gradient-to-br from-slate-900 via-[#0d1527] to-slate-900 p-6 text-white text-center relative">
                <button
                  id="close-tx-details-btn"
                  onClick={onCloseTransactionDetails}
                  className="absolute right-4 top-4 p-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="inline-flex p-3 rounded-full bg-white/5 border border-white/10 mb-3">
                  {getCategoryIcon(selectedTransaction.category, selectedTransaction.name)}
                </div>
                <h3 className="text-lg font-bold tracking-tight text-white">{selectedTransaction.name}</h3>
                <p className="text-2xl md:text-3xl font-mono font-bold mt-2 text-white">
                  {selectedTransaction.amount > 0 ? '+' : ''}
                  {formatCurrency(selectedTransaction.amount)}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mt-3 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Paiement validé
                </div>
              </div>

              {/* Receipt Information Grid */}
              <div className="p-6 space-y-4 text-slate-800 dark:text-slate-100">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-400 uppercase tracking-widest font-mono">
                  <ReceiptText className="w-4 h-4 text-blue-500" />
                  Détails du reçu
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Catégorie</span>
                    <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                      <Tag className="w-3.5 h-3.5 text-blue-500" /> {selectedTransaction.category}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Mode de paiement</span>
                    <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                      <CreditCard className="w-3.5 h-3.5 text-blue-500" /> {selectedTransaction.paymentMethod}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Date et Heure</span>
                    <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" /> {formatDateFrench(selectedTransaction.date)} à {selectedTransaction.time}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Référence</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{selectedTransaction.reference}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-slate-400 block mb-0.5">Localisation</span>
                    <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" /> {selectedTransaction.location || 'Sans localisation'}
                    </span>
                  </div>

                  {selectedTransaction.notes && (
                    <div className="col-span-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 italic">
                      <span className="text-[10px] text-slate-400 font-mono block not-italic mb-1 font-semibold uppercase">Notes</span>
                      "{selectedTransaction.notes}"
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                  <button
                    id="receipt-help-btn"
                    onClick={() => alert(`Demande d'aide pour la transaction ${selectedTransaction.reference} envoyée au support.`)}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition"
                  >
                    Contester / Aide
                  </button>
                  <button
                    id="download-receipt-btn"
                    onClick={() => alert(`Téléchargement du reçu ${selectedTransaction.reference} au format PDF...`)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Reçu PDF
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
