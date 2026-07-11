/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, UserPlus, History, User, CreditCard, ChevronRight, Check, X,
  AlertCircle, Calendar, DollarSign, TextQuote, Lock, CheckCircle2,
  Phone, Mail, Landmark, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { Beneficiary, Transfer } from '../types';

interface VirementsViewProps {
  beneficiaries: Beneficiary[];
  transfers: Transfer[];
  onAddTransfer: (transfer: Omit<Transfer, 'id'>) => void;
  onAddBeneficiary: (ben: Omit<Beneficiary, 'id'>) => void;
  onAddNotification: (title: string, message: string, type: 'salary' | 'payment' | 'security' | 'transfer' | 'beneficiary') => void;
  formatCurrency: (value: number) => string;
  balance: number;
  onDeductBalance: (amount: number) => void;
}

type VirementStep = 'select_beneficiary' | 'enter_details' | 'confirm_biometrics' | 'success';

export default function VirementsView({
  beneficiaries,
  transfers,
  onAddTransfer,
  onAddBeneficiary,
  onAddNotification,
  formatCurrency,
  balance,
  onDeductBalance
}: VirementsViewProps) {
  const [activeFormTab, setActiveFormTab] = useState<'make_transfer' | 'add_beneficiary'>('make_transfer');
  
  // Virement Flow States
  const [currentStep, setCurrentStep] = useState<VirementStep>('select_beneficiary');
  const [selectedBen, setSelectedBen] = useState<Beneficiary | null>(null);
  
  // Form fields
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferReason, setTransferReason] = useState<string>('');
  const [transferDate, setTransferDate] = useState<string>('2026-07-11');
  const [formError, setFormError] = useState<string>('');
  
  // Custom manual beneficiary selection
  const [manualIban, setManualIban] = useState('');
  const [manualName, setManualName] = useState('');

  // Add Beneficiary States
  const [newBen, setNewBen] = useState({
    name: '',
    iban: '',
    bank: '',
    email: '',
    phone: ''
  });
  const [addBenError, setAddBenError] = useState('');
  const [addBenSuccess, setAddBenSuccess] = useState(false);

  // Handle transfer step progress
  const handleSelectBeneficiary = (ben: Beneficiary) => {
    setSelectedBen(ben);
    setFormError('');
    setCurrentStep('enter_details');
  };

  const handleManualBeneficiaryNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualIban) {
      setFormError('Veuillez remplir le nom et l\'IBAN.');
      return;
    }
    if (!manualIban.toUpperCase().replace(/\s/g, '').startsWith('FR')) {
      setFormError('L\'IBAN doit commencer par FR.');
      return;
    }

    // Create a temporary beneficiary object
    const tempBen: Beneficiary = {
      id: 'temp-manual',
      name: manualName,
      iban: manualIban.toUpperCase(),
      bank: 'Banque externe'
    };

    setSelectedBen(tempBen);
    setFormError('');
    setCurrentStep('enter_details');
  };

  const handleEnterDetailsNext = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transferAmount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Veuillez saisir un montant supérieur à 0 €.');
      return;
    }
    if (amountNum > balance) {
      setFormError(`Solde insuffisant. Votre solde disponible est de ${formatCurrency(balance)}.`);
      return;
    }
    if (!transferReason) {
      setFormError('Veuillez spécifier le motif du virement.');
      return;
    }

    setFormError('');
    setCurrentStep('confirm_biometrics');
  };

  // Process and finalize the transfer
  const handleConfirmBiometrics = () => {
    if (!selectedBen) return;
    const amountNum = parseFloat(transferAmount);

    // 1. Deduct balance
    onDeductBalance(amountNum);

    // 2. Add transfer object
    onAddTransfer({
      beneficiaryName: selectedBen.name,
      iban: selectedBen.iban,
      amount: amountNum,
      reason: transferReason,
      date: transferDate,
      status: transferDate === '2026-07-11' ? 'Envoyé' : 'Programmé'
    });

    // 3. Trigger Notification
    onAddNotification(
      'Virement exécuté',
      `Votre virement de ${formatCurrency(amountNum)} vers ${selectedBen.name} a été envoyé avec succès.`,
      'transfer'
    );

    setCurrentStep('success');
  };

  // Reset transfer form
  const handleResetTransferFlow = () => {
    setSelectedBen(null);
    setTransferAmount('');
    setTransferReason('');
    setTransferDate('2026-07-11');
    setManualIban('');
    setManualName('');
    setFormError('');
    setCurrentStep('select_beneficiary');
  };

  // Add Beneficiary Form Submission
  const handleAddBenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBen.name || !newBen.iban || !newBen.bank) {
      setAddBenError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (!newBen.iban.toUpperCase().replace(/\s/g, '').startsWith('FR')) {
      setAddBenError('L\'IBAN de destination doit commencer par FR.');
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
      'Bénéficiaire enregistré',
      `Le bénéficiaire ${newBen.name} (${newBen.bank}) est désormais disponible pour vos virements.`,
      'beneficiary'
    );

    setNewBen({ name: '', iban: '', bank: '', email: '', phone: '' });
    setAddBenError('');
    setAddBenSuccess(true);
    setTimeout(() => setAddBenSuccess(false), 3000);
  };

  const getTransferStatusColor = (status: 'Envoyé' | 'Reçu' | 'Programmé') => {
    if (status === 'Reçu') return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40';
    if (status === 'Programmé') return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40';
    return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40';
  };

  return (
    <div id="virements-view" className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">Transactions externes</span>
        <h1 className="text-3xl font-sans font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Virements & Bénéficiaires
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Gérez vos comptes externes et transférez des fonds instantanément.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        <button
          id="tab-make-transfer-btn"
          onClick={() => setActiveFormTab('make_transfer')}
          className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
            activeFormTab === 'make_transfer'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          💸 Faire un virement
        </button>
        <button
          id="tab-add-ben-btn"
          onClick={() => setActiveFormTab('add_beneficiary')}
          className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
            activeFormTab === 'add_beneficiary'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          👤 Ajouter bénéficiaire
        </button>
      </div>

      {/* Make Transfer Panel */}
      {activeFormTab === 'make_transfer' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            {/* Step 1: Select Beneficiary */}
            {currentStep === 'select_beneficiary' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">1. Sélectionnez un bénéficiaire</h3>
                  <button 
                    id="switch-to-add-ben-subtab-btn"
                    onClick={() => setActiveFormTab('add_beneficiary')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Créer un nouveau
                  </button>
                </div>

                {/* Pre-saved Beneficiary list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-60 overflow-y-auto pr-1">
                  {beneficiaries.map((ben) => (
                    <div
                      key={ben.id}
                      id={`select-ben-${ben.id}-card`}
                      onClick={() => handleSelectBeneficiary(ben)}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 cursor-pointer transition-all group"
                    >
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {ben.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{ben.iban}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative flex py-3 items-center">
                  <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                  <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold font-mono">OU Saisir manuellement</span>
                  <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                </div>

                {/* Manual Form */}
                <form onSubmit={handleManualBeneficiaryNext} className="space-y-3.5">
                  {formError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nom complet</label>
                      <input
                        id="manual-ben-name-input"
                        type="text"
                        placeholder="Ex: Jean Dupont"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">IBAN de destination</label>
                      <input
                        id="manual-ben-iban-input"
                        type="text"
                        placeholder="Ex: FR76 3000..."
                        value={manualIban}
                        onChange={(e) => setManualIban(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-mono"
                      />
                    </div>
                  </div>

                  <button
                    id="manual-ben-submit-btn"
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition"
                  >
                    Suivant : Détails du virement
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 2: Enter Details */}
            {currentStep === 'enter_details' && selectedBen && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">2. Renseignez les détails du transfert</h3>
                  <button 
                    id="back-to-select-ben-btn"
                    onClick={() => setCurrentStep('select_beneficiary')}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    Retour
                  </button>
                </div>

                <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/40 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Bénéficiaire sélectionné</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedBen.name}</span>
                    <span className="text-xs text-slate-400 font-mono block mt-0.5">{selectedBen.iban}</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-xs uppercase font-mono shadow-sm">
                    {selectedBen.bank || 'Externe'}
                  </div>
                </div>

                <form onSubmit={handleEnterDetailsNext} className="space-y-4">
                  {formError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
                      {formError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Montant du virement (€) *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-3.5 w-5 h-5 text-blue-500" />
                      <input
                        id="transfer-amount-input"
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Motif du virement *</label>
                    <div className="relative">
                      <TextQuote className="absolute left-3.5 top-3.5 w-5 h-5 text-blue-500" />
                      <input
                        id="transfer-reason-input"
                        type="text"
                        required
                        placeholder="Ex: Facture #1283 ou Cadeau de Noël"
                        value={transferReason}
                        onChange={(e) => setTransferReason(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Date d'exécution *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-3.5 w-5 h-5 text-blue-500" />
                      <input
                        id="transfer-date-input"
                        type="date"
                        required
                        value={transferDate}
                        onChange={(e) => setTransferDate(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-mono"
                      />
                    </div>
                  </div>

                  <button
                    id="transfer-details-submit-btn"
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition"
                  >
                    Suivant : Valider le transfert
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 3: Biometrics Confirmation */}
            {currentStep === 'confirm_biometrics' && selectedBen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-5 text-center py-4"
              >
                <div className="mx-auto p-4 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-full w-16 h-16 flex items-center justify-center animate-pulse">
                  <Lock className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Validation biométrique requise</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Confirmez l'envoi de <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(parseFloat(transferAmount))}</span> vers <span className="font-bold text-slate-900 dark:text-white">{selectedBen.name}</span>.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl text-xs space-y-2 text-left max-w-sm mx-auto border border-slate-100 dark:border-slate-800 font-mono">
                  <div className="flex justify-between text-slate-500">
                    <span>Destinataire:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{selectedBen.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>IBAN:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[180px]">{selectedBen.iban}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Motif:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{transferReason}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pt-1.5 border-t border-dashed border-slate-200 dark:border-slate-800">
                    <span className="text-sm font-bold">Total à débiter:</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatCurrency(parseFloat(transferAmount))}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    id="cancel-transfer-btn"
                    onClick={handleResetTransferFlow}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl transition text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    id="confirm-transfer-submit-btn"
                    onClick={handleConfirmBiometrics}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition text-sm flex items-center justify-center gap-2"
                  >
                    ⚡ Valider le virement
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success Screen */}
            {currentStep === 'success' && selectedBen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 text-center py-6"
              >
                <div className="mx-auto p-4 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full w-20 h-20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-12 h-12" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Virement envoyé avec succès !</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Le montant de <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(parseFloat(transferAmount))}</span> a bien été transféré à {selectedBen.name}.
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-mono">
                  REF: VIR-{Math.floor(Math.random() * 900000 + 100000)}
                </div>

                <button
                  id="done-transfer-btn"
                  onClick={handleResetTransferFlow}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition"
                >
                  Faire un autre virement
                </button>
              </motion.div>
            )}
          </div>

          {/* Transfer History Logs */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-500" /> Historique des virements
            </h3>

            <div className="space-y-2.5">
              {transfers.map((tr) => (
                <div
                  key={tr.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <Send className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{tr.beneficiaryName}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-[200px]">{tr.iban}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-sm font-bold font-mono ${tr.status === 'Reçu' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {tr.status === 'Reçu' ? '+' : '-'}{tr.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${getTransferStatusColor(tr.status)}`}>
                      {tr.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Beneficiary Panel */}
      {activeFormTab === 'add_beneficiary' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">Créer un bénéficiaire permanent</h3>

            <form onSubmit={handleAddBenSubmit} className="space-y-4">
              {addBenError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
                  {addBenError}
                </div>
              )}

              {addBenSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold">
                  ✓ Bénéficiaire ajouté avec succès ! Il apparaît dans votre liste d'envoi.
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nom complet *</label>
                <input
                  id="tab-add-ben-name-input"
                  type="text"
                  required
                  placeholder="Ex: Marie Dubois"
                  value={newBen.name}
                  onChange={(e) => setNewBen({ ...newBen, name: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">IBAN de destination *</label>
                <input
                  id="tab-add-ben-iban-input"
                  type="text"
                  required
                  placeholder="Ex: FR76 3000..."
                  value={newBen.iban}
                  onChange={(e) => setNewBen({ ...newBen, iban: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Établissement bancaire *</label>
                  <input
                    id="tab-add-ben-bank-input"
                    type="text"
                    required
                    placeholder="Ex: Société Générale"
                    value={newBen.bank}
                    onChange={(e) => setNewBen({ ...newBen, bank: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Adresse e-mail</label>
                  <input
                    id="tab-add-ben-email-input"
                    type="email"
                    placeholder="Ex: marie@email.com"
                    value={newBen.email}
                    onChange={(e) => setNewBen({ ...newBen, email: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Numéro de téléphone</label>
                <input
                  id="tab-add-ben-phone-input"
                  type="tel"
                  placeholder="Ex: +33 6 12 34 56 78"
                  value={newBen.phone}
                  onChange={(e) => setNewBen({ ...newBen, phone: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <button
                id="tab-add-ben-submit-btn"
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition shadow-md shadow-blue-500/20"
              >
                Enregistrer le bénéficiaire
              </button>
            </form>
          </div>

          {/* Current Saved Beneficiaries */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-sans">Bénéficiaires enregistrés ({beneficiaries.length})</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {beneficiaries.map((ben) => (
                <div 
                  key={ben.id}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{ben.name}</p>
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold uppercase font-mono">
                        {ben.bank}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-1.5">{ben.iban}</p>
                  </div>

                  {(ben.email || ben.phone) && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-slate-50 dark:border-slate-850 text-[11px] text-slate-400">
                      {ben.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {ben.email}</span>}
                      {ben.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {ben.phone}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
