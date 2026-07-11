/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, EyeOff, Send, UserPlus, QrCode, ArrowDownLeft, FileText, 
  ChevronRight, Calendar, Clock, ShoppingBag, Landmark, Coffee, 
  Plane, Smartphone, Music, ShieldCheck, Car, HelpCircle, 
  MapPin, Clipboard, Download, Printer, Check, X, Camera 
} from 'lucide-react';
import { Transaction, Beneficiary, Card } from '../types';

interface HomeViewProps {
  onNavigate: (tab: string) => void;
  transactions: Transaction[];
  onOpenTransactionDetails: (tx: Transaction) => void;
  cards: Card[];
  beneficiaries: Beneficiary[];
  onAddBeneficiary: (ben: Omit<Beneficiary, 'id'>) => void;
  onAddNotification: (title: string, message: string, type: 'salary' | 'payment' | 'security' | 'transfer' | 'beneficiary') => void;
  formatCurrency: (value: number) => string;
  balance: number;
}

export default function HomeView({
  onNavigate,
  transactions,
  onOpenTransactionDetails,
  cards,
  beneficiaries,
  onAddBeneficiary,
  onAddNotification,
  formatCurrency,
  balance
}: HomeViewProps) {
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [animatedBalance, setAnimatedBalance] = useState(0);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showRIBModal, setShowRIBModal] = useState(false);
  const [showAddBenModal, setShowAddBenModal] = useState(false);
  
  // RIB / Transfer states
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Camera scanning mock state
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scannedResult, setScannedResult] = useState<string>('');

  // Add Beneficiary State
  const [newBen, setNewBen] = useState({
    name: '',
    iban: '',
    bank: '',
    email: '',
    phone: ''
  });
  const [benError, setBenError] = useState('');

  // Count animations
  useEffect(() => {
    let start = 0;
    const end = balance;
    if (start === end) return;
    
    const duration = 1200; // ms
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedBalance(end);
        clearInterval(timer);
      } else {
        setAnimatedBalance(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [balance]);

  // Copy helper
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Profile Image Path
  const profileImg = '/src/assets/images/gerard_lopez_profile_1783774149491.jpg';

  // Get dynamic icon based on category
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
      return <SmileIcon className="w-5 h-5 text-purple-500" />;
    }
    if (category === 'Logement') return <Landmark className="w-5 h-5 text-teal-500" />;
    return <HelpCircle className="w-5 h-5 text-gray-500" />;
  };

  // Helper component for smile icon
  function SmileIcon({ className }: { className?: string }) {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }

  // Handle Scan QR Code
  const handleStartScan = () => {
    setScanStatus('scanning');
    setTimeout(() => {
      // Simulate successful scan of a transfer payload or IBAN
      setScanStatus('success');
      setScannedResult('Virement de 150,00 € vers Gérad Lopez pré-approuvé.');
      onAddNotification(
        'QR Code scanné',
        'Le QR code a été identifié avec succès. Virement en cours de traitement.',
        'payment'
      );
    }, 2500);
  };

  // Handle Add Beneficiary Submission
  const handleAddBenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBen.name || !newBen.iban || !newBen.bank) {
      setBenError('Veuillez remplir les champs obligatoires (Nom, IBAN, Banque).');
      return;
    }
    if (!newBen.iban.replace(/\s/g, '').startsWith('FR')) {
      setBenError('L\'IBAN doit commencer par FR.');
      return;
    }

    onAddBeneficiary({
      name: newBen.name,
      iban: newBen.iban.toUpperCase(),
      bank: newBen.bank,
      email: newBen.email || undefined,
      phone: newBen.phone || undefined
    });

    onAddNotification(
      'Nouveau bénéficiaire',
      `${newBen.name} (${newBen.bank}) a été ajouté à vos bénéficiaires.`,
      'beneficiary'
    );

    // Reset state
    setNewBen({ name: '', iban: '', bank: '', email: '', phone: '' });
    setBenError('');
    setShowAddBenModal(false);
  };

  // Format date helper
  const formatDateFrench = (dateStr: string) => {
    if (dateStr === '2026-07-11') return "Aujourd'hui";
    if (dateStr === '2026-07-10') return 'Hier';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  const currentPhysCard = cards.find(c => c.type === 'Physique') || cards[0];

  return (
    <div id="home-view" className="space-y-6 pb-24">
      {/* Header with Greeting and Profile */}
      <div className="flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">Espace Client</span>
          <h1 className="text-3xl font-sans font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Bonjour, <span className="text-blue-600 dark:text-blue-400">Gérad Lopez</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
              💎 Compte Premium
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
              ● Actif
            </span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative group cursor-pointer"
          onClick={() => onNavigate('profil')}
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
          <img 
            src={profileImg} 
            alt="Gérad Lopez" 
            className="relative w-14 h-14 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-md"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>

      {/* Main Premium Card with Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0d1527] to-[#1e3a8a] text-white p-6 md:p-8 shadow-2xl border border-white/10"
      >
        {/* Ambient background glows */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col justify-between h-full min-h-[220px] relative z-10">
          {/* Top Line: Brand & Eye Toggle */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs tracking-widest text-slate-400 font-mono uppercase">Solde Disponible</p>
              <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight mt-1 text-white">
                {formatCurrency(animatedBalance)}
              </h2>
            </div>
            <button 
              id="toggle-details-btn"
              onClick={() => setShowCardDetails(!showCardDetails)}
              className="p-3 rounded-full bg-white/5 hover:bg-white/15 transition-colors border border-white/10 text-slate-300 hover:text-white"
            >
              {showCardDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Middle: Card Details in Glass Panel */}
          <AnimatePresence>
            {showCardDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="my-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden font-mono text-sm space-y-2 text-slate-300"
              >
                <div className="flex justify-between">
                  <span>Numéro de compte:</span>
                  <span className="text-white font-semibold">EDU-4587-9231-001</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>IBAN:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">FR76 3000 4000 5500 0000 1234 567</span>
                    <button 
                      id="copy-iban-btn"
                      onClick={() => handleCopy('FR76 3000 4000 5500 0000 1234 567', 'iban')}
                      className="text-blue-400 hover:text-white transition-colors"
                    >
                      {copiedField === 'iban' ? <Check className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>BIC:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">BNPAFRPPXXX</span>
                    <button 
                      id="copy-bic-btn"
                      onClick={() => handleCopy('BNPAFRPPXXX', 'bic')}
                      className="text-blue-400 hover:text-white transition-colors"
                    >
                      {copiedField === 'bic' ? <Check className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Card Footer */}
          <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/5">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">Titulaire du compte</p>
              <p className="text-base font-semibold tracking-wide text-white mt-0.5">GÉRAD LOPEZ</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">Carte Physique</p>
              <p className="text-sm font-semibold text-white mt-0.5">•••• {currentPhysCard.number.slice(-4)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Panel */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-200">Actions rapides</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <motion.button
            id="action-virement-btn"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('virements')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all text-slate-800 dark:text-slate-200 group text-center"
          >
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Faire un virement</span>
          </motion.button>

          <motion.button
            id="action-add-ben-btn"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddBenModal(true)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all text-slate-800 dark:text-slate-200 group text-center"
          >
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Ajouter bénéficiaire</span>
          </motion.button>

          <motion.button
            id="action-scan-qr-btn"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setScanStatus('idle');
              setScannedResult('');
              setShowQRScanner(true);
            }}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all text-slate-800 dark:text-slate-200 group text-center"
          >
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Scanner un QR Code</span>
          </motion.button>

          <motion.button
            id="action-receive-pay-btn"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowReceiveModal(true)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all text-slate-800 dark:text-slate-200 group text-center col-span-1"
          >
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Recevoir paiement</span>
          </motion.button>

          <motion.button
            id="action-download-rib-btn"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowRIBModal(true)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all text-slate-800 dark:text-slate-200 group text-center col-span-2 sm:col-span-1"
          >
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Télécharger RIB</span>
          </motion.button>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-200">Activité récente</h3>
          <button 
            id="see-all-transactions-btn"
            onClick={() => onNavigate('transactions')}
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Tout voir <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {transactions.slice(0, 5).map((tx, idx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              onClick={() => onOpenTransactionDetails(tx)}
              className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30 transition-colors">
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
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mt-1 border border-slate-200/40 dark:border-slate-700/50">
                  {tx.status === 'validé' ? 'Paiement validé' : tx.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* QR Code Scanner Modal */}
      <AnimatePresence>
        {showQRScanner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQRScanner(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Scanner un QR Code</h3>
                <button 
                  id="close-qr-btn"
                  onClick={() => setShowQRScanner(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Placez le QR Code de facturation ou du bénéficiaire dans le cadre pour scanner de manière autonome.
                </p>

                <div className="relative w-64 h-64 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                  {scanStatus === 'idle' && (
                    <div className="flex flex-col items-center space-y-2 text-slate-400">
                      <Camera className="w-12 h-12" />
                      <button 
                        id="activate-camera-btn"
                        onClick={handleStartScan}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
                      >
                        Activer la caméra
                      </button>
                    </div>
                  )}

                  {scanStatus === 'scanning' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
                      <div className="w-48 h-48 border-2 border-blue-500 rounded-xl relative">
                        <motion.div 
                          animate={{ top: ['0%', '100%', '0%'] }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                          className="absolute left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_10px_#3b82f6]"
                        />
                      </div>
                      <span className="text-xs text-blue-400 mt-4 font-semibold animate-pulse">Analyse en cours...</span>
                    </div>
                  )}

                  {scanStatus === 'success' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/20 text-emerald-400 p-4">
                      <ShieldCheck className="w-16 h-16 mb-2" />
                      <span className="text-sm font-bold text-center">Détecté avec succès</span>
                      <p className="text-xs text-slate-300 mt-2 text-center bg-black/40 p-2 rounded-lg">{scannedResult}</p>
                    </div>
                  )}
                </div>

                {scanStatus === 'success' && (
                  <button 
                    id="confirm-scan-virement-btn"
                    onClick={() => {
                      setShowQRScanner(false);
                      onNavigate('virements');
                    }}
                    className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition"
                  >
                    Aller aux virements
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recevoir paiement Modal */}
      <AnimatePresence>
        {showReceiveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReceiveModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recevoir un paiement</h3>
                <button 
                  id="close-receive-btn"
                  onClick={() => setShowReceiveModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  Présentez ce QR Code pour recevoir un virement instantané d'une autre banque.
                </p>

                {/* QR Code Graphic */}
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-inner flex items-center justify-center">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=IBAN:FR7630004000550000001234567;BIC:BNPAFRPPXXX;HOLDER:GERAD%20LOPEZ" 
                    alt="RIB QR Code" 
                    className="w-44 h-44"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="w-full space-y-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">IBAN</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono">FR76 3000...4567</span>
                      </div>
                      <button 
                        id="copy-modal-iban-btn"
                        onClick={() => handleCopy('FR76 3000 4000 5500 0000 1234 567', 'modal-iban')}
                        className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition"
                      >
                        {copiedField === 'modal-iban' ? <Check className="w-4 h-4 text-emerald-500" /> : <Clipboard className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">BIC</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono">BNPAFRPPXXX</span>
                      </div>
                      <button 
                        id="copy-modal-bic-btn"
                        onClick={() => handleCopy('BNPAFRPPXXX', 'modal-bic')}
                        className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition"
                      >
                        {copiedField === 'modal-bic' ? <Check className="w-4 h-4 text-emerald-500" /> : <Clipboard className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  id="share-rib-btn"
                  onClick={() => handleCopy('Nom: Gérad Lopez\nIBAN: FR76 3000 4000 5500 0000 1234 567\nBIC: BNPAFRPPXXX', 'share')}
                  className="w-full py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition"
                >
                  {copiedField === 'share' ? 'Coordonnées copiées !' : 'Partager mes coordonnées'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Télécharger RIB Modal */}
      <AnimatePresence>
        {showRIBModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRIBModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 z-10 p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Télécharger un RIB</h3>
                <button 
                  id="close-rib-modal-btn"
                  onClick={() => setShowRIBModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Document Preview */}
              <div id="rib-document" className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50 dark:bg-slate-950 space-y-6 text-slate-800 dark:text-slate-100 font-sans text-xs shadow-inner">
                <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">APEX BANQUE</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Établissement de crédit agréé</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400 font-semibold rounded uppercase tracking-wider text-[10px]">RELEVÉ D'IDENTITÉ BANCAIRE</span>
                    <p className="text-[10px] text-slate-400 mt-1">Généré le 11/07/2026 à {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-slate-600 dark:text-slate-300">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white uppercase mb-1">Titulaire du compte</h5>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">M. GÉRAD LOPEZ</p>
                    <p>88 Boulevard Saint-Germain</p>
                    <p>75005 Paris, France</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white uppercase mb-1">Domiciliation</h5>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">APEX PARIS HAUSSMANN</p>
                    <p>40 Boulevard Haussmann</p>
                    <p>75009 Paris</p>
                  </div>
                </div>

                <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-400 uppercase font-mono pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div>Code Banque</div>
                    <div>Code Guichet</div>
                    <div>N° Compte</div>
                    <div>Clé RIB</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                    <div>30004</div>
                    <div>00550</div>
                    <div>00001234567</div>
                    <div>76</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-mono">
                    <span>IBAN (International Bank Account Number)</span>
                  </div>
                  <p className="text-sm font-bold font-mono bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-center tracking-wider">
                    FR76 3000 4000 5500 0000 1234 567
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">BIC (Bank Identifier Code)</span>
                    <p className="text-xs font-bold font-mono bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 mt-1">
                      BNPAFRPPXXX
                    </p>
                  </div>
                  <div className="flex items-end justify-end text-[9px] text-slate-400 italic">
                    Document officiel à valeur de preuve d'identité bancaire.
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  id="print-rib-btn"
                  onClick={() => {
                    window.print();
                    onAddNotification('RIB Imprimé', 'L\'impression du relevé d\'identité bancaire a été demandée.', 'security');
                  }}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl font-semibold transition flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" /> Imprimer
                </button>
                <button 
                  id="download-pdf-rib-btn"
                  onClick={() => {
                    onAddNotification('RIB Téléchargé', 'Le PDF du relevé d\'identité bancaire a été téléchargé.', 'security');
                    const link = document.createElement('a');
                    link.href = '#';
                    link.setAttribute('download', 'RIB_Gerad_Lopez.pdf');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" /> Télécharger PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Beneficiary Modal */}
      <AnimatePresence>
        {showAddBenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddBenModal(false);
                setBenError('');
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ajouter un bénéficiaire</h3>
                <button 
                  id="close-add-ben-btn"
                  onClick={() => {
                    setShowAddBenModal(false);
                    setBenError('');
                  }}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddBenSubmit} className="space-y-4">
                {benError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
                    {benError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nom du bénéficiaire *</label>
                  <input 
                    id="add-ben-name-input"
                    type="text" 
                    placeholder="Ex: Marie Dubois"
                    required
                    value={newBen.name}
                    onChange={(e) => setNewBen({ ...newBen, name: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">IBAN *</label>
                  <input 
                    id="add-ben-iban-input"
                    type="text" 
                    placeholder="Ex: FR76 3000..."
                    required
                    value={newBen.iban}
                    onChange={(e) => setNewBen({ ...newBen, iban: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Banque *</label>
                    <input 
                      id="add-ben-bank-input"
                      type="text" 
                      placeholder="Ex: CIC"
                      required
                      value={newBen.bank}
                      onChange={(e) => setNewBen({ ...newBen, bank: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email</label>
                    <input 
                      id="add-ben-email-input"
                      type="email" 
                      placeholder="Ex: contact@email.com"
                      value={newBen.email}
                      onChange={(e) => setNewBen({ ...newBen, email: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Numéro de téléphone</label>
                  <input 
                    id="add-ben-phone-input"
                    type="tel" 
                    placeholder="Ex: +33 6..."
                    value={newBen.phone}
                    onChange={(e) => setNewBen({ ...newBen, phone: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button 
                  id="submit-add-ben-btn"
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition"
                >
                  Enregistrer le bénéficiaire
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
