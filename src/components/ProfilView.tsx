/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, ShieldCheck, Mail, Phone, Landmark, Settings, Bell, 
  Moon, Sun, Globe, DollarSign, HelpCircle, LogOut, KeyRound, 
  Fingerprint, MessageSquare, ChevronRight, X, ArrowUpRight, 
  Send, Headphones, Sparkles, Check, Clipboard
} from 'lucide-react';
import { AppNotification, Beneficiary } from '../types';

interface ProfilViewProps {
  notifications: AppNotification[];
  onMarkNotificationRead: (notifId: string) => void;
  onMarkAllNotificationsRead: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  language: 'FR' | 'EN';
  onChangeLanguage: (lang: 'FR' | 'EN') => void;
  currency: 'EUR' | 'USD' | 'GBP';
  onChangeCurrency: (curr: 'EUR' | 'USD' | 'GBP') => void;
  onLogout: () => void;
  onAddNotification: (title: string, message: string, type: 'salary' | 'payment' | 'security' | 'transfer' | 'beneficiary') => void;
  formatCurrency: (value: number) => string;
}

export default function ProfilView({
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  darkMode,
  onToggleDarkMode,
  language,
  onChangeLanguage,
  currency,
  onChangeCurrency,
  onLogout,
  onAddNotification,
  formatCurrency
}: ProfilViewProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Password fields
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  // Security Toggles
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);

  // Live support chatbot states
  const [supportMessage, setSupportMessage] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    { 
      sender: 'agent', 
      text: 'Bonjour M. Lopez, je suis Éva, votre assistante Apex Concierge privée. Comment puis-je vous assister aujourd\'hui ?', 
      time: '08:00' 
    }
  ]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPass || !newPass || !confirmPass) {
      setPassError('Veuillez remplir tous les champs.');
      return;
    }
    if (newPass.length < 6) {
      setPassError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('Les mots de passe ne correspondent pas.');
      return;
    }

    onAddNotification(
      'Sécurité modifiée',
      'Votre mot de passe d\'accès a été changé avec succès.',
      'security'
    );

    setPassSuccess(true);
    setPassError('');
    setTimeout(() => {
      setShowPasswordModal(false);
      setPassSuccess(false);
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    }, 1500);
  };

  const handleSendSupportMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    const userMsg = supportMessage;
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    setChatLog(prev => [...prev, { sender: 'user', text: userMsg, time: timeStr }]);
    setSupportMessage('');

    // Simulate Agent responses based on keyword
    setTimeout(() => {
      let reply = 'Je prends note de votre demande. Un conseiller de votre agence parisienne va vous rappeler sous 15 minutes.';
      const msgLower = userMsg.toLowerCase();
      
      if (msgLower.includes('carte') || msgLower.includes('bloquer')) {
        reply = 'M. Lopez, en cas d\'urgence sur votre carte, vous pouvez la bloquer instantanément depuis l\'onglet "Cartes". Le blocage est réversible à tout moment et sécurisé.';
      } else if (msgLower.includes('virement') || msgLower.includes('limite')) {
        reply = 'Les virements nationaux SEPA vers vos bénéficiaires sont instantanés et gratuits. Vous pouvez ajuster vos plafonds de paiement directement depuis l\'onglet de votre carte.';
      } else if (msgLower.includes('rib') || msgLower.includes('iban')) {
        reply = 'Vous pouvez télécharger ou imprimer votre RIB officiel au format PDF directement depuis l\'Accueil en cliquant sur "Télécharger RIB".';
      } else if (msgLower.includes('premium')) {
        reply = 'En tant que client Premium, vous bénéficiez de garanties d\'assurances élargies pour vos voyages à l\'étranger ainsi qu\'une assistance téléphonique 24/7.';
      }

      setChatLog(prev => [...prev, { sender: 'agent', text: reply, time: timeStr }]);
    }, 1200);
  };

  // Notification styling matching types
  const getNotificationIcon = (type: string) => {
    if (type === 'salary') return <Landmark className="w-4 h-4 text-emerald-600" />;
    if (type === 'payment') return <Fingerprint className="w-4 h-4 text-indigo-600" />;
    if (type === 'security') return <ShieldCheck className="w-4 h-4 text-rose-600" />;
    if (type === 'transfer') return <Send className="w-4 h-4 text-blue-600" />;
    return <User className="w-4 h-4 text-cyan-600" />;
  };

  const getNotificationBg = (type: string) => {
    if (type === 'salary') return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30';
    if (type === 'payment') return 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/30';
    if (type === 'security') return 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/30';
    if (type === 'transfer') return 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30';
    return 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-100 dark:border-cyan-900/30';
  };

  const profileImg = '/src/assets/images/gerard_lopez_profile_1783774149491.jpg';

  return (
    <div id="profil-view" className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">Mon Compte</span>
        <h1 className="text-3xl font-sans font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Profil & Préférences
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card & Info */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur opacity-40 group-hover:opacity-85 transition duration-500"></div>
              <img 
                src={profileImg} 
                alt="Gérad Lopez" 
                className="relative w-28 h-28 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">Gérad Lopez</h2>
            <span className="mt-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40 font-mono uppercase tracking-wider">
              Compte Premium
            </span>

            {/* Profile Fields List */}
            <div className="w-full mt-6 space-y-3.5 text-xs text-left">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-50 dark:border-slate-850">
                <span className="text-slate-400 flex items-center gap-1.5 font-semibold"><Landmark className="w-4 h-4 text-blue-500" /> N° Compte</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">EDU-4587-9231-001</span>
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-slate-50 dark:border-slate-850">
                <span className="text-slate-400 flex items-center gap-1.5 font-semibold"><Mail className="w-4 h-4 text-blue-500" /> E-mail</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">gerad.lopez@apex-banque.com</span>
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-slate-50 dark:border-slate-850">
                <span className="text-slate-400 flex items-center gap-1.5 font-semibold"><Phone className="w-4 h-4 text-blue-500" /> Téléphone</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">+33 6 88 99 00 11</span>
              </div>

              <div className="flex flex-col gap-1 py-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold font-mono">IBAN</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">FR76 3000...1234 567</span>
                    <button 
                      id="profile-copy-iban-btn"
                      onClick={() => handleCopy('FR76 3000 4000 5500 0000 1234 567', 'p-iban')}
                      className="text-blue-500 hover:text-blue-600 transition"
                    >
                      {copiedField === 'p-iban' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Support chat card */}
          <div className="p-5 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl border border-white/10 shadow-lg relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <Headphones className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Une question, M. Lopez ?</h4>
                <p className="text-xs text-blue-200 mt-0.5">Votre concierge privé répond 24h/24.</p>
              </div>
            </div>
            <button
              id="trigger-support-chat-btn"
              onClick={() => setShowSupportModal(true)}
              className="w-full py-2.5 bg-white text-blue-900 rounded-xl font-bold text-xs mt-4 hover:bg-blue-50 transition flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" /> Discuter avec Éva
            </button>
          </div>
        </div>

        {/* Right Settings & Preferences */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-500" /> Paramètres de l'application
            </h3>

            {/* General Settings Controls */}
            <div className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
              {/* Theme Selector */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-50 dark:border-slate-850">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                    {darkMode ? <Sun className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} /> : <Moon className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">Mode Sombre</h4>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">Basculez entre le thème épuré et le bleu nuit luxueux.</p>
                  </div>
                </div>
                <button
                  id="toggle-dark-mode-btn"
                  onClick={onToggleDarkMode}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none ${
                    darkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300 ${darkMode ? 'translate-x-5.5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Language Selector */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-50 dark:border-slate-850">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                    <Globe className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">Langue d'affichage</h4>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">Choisissez votre langue pour l'ensemble des interfaces.</p>
                  </div>
                </div>
                <select
                  id="select-language-dropdown"
                  value={language}
                  onChange={(e) => onChangeLanguage(e.target.value as 'FR' | 'EN')}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="FR">Français (FR)</option>
                  <option value="EN">English (EN)</option>
                </select>
              </div>

              {/* Currency Selector */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-50 dark:border-slate-850">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                    <DollarSign className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">Devise Principale</h4>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5 font-sans">Afficher les soldes et graphiques dans votre monnaie.</p>
                  </div>
                </div>
                <select
                  id="select-currency-dropdown"
                  value={currency}
                  onChange={(e) => onChangeCurrency(e.target.value as 'EUR' | 'USD' | 'GBP')}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar ($)</option>
                  <option value="GBP">Livre Sterling (£)</option>
                </select>
              </div>

              {/* Push Notifications Switch */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-50 dark:border-slate-850">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                    <Bell className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">Notifications Push</h4>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">Recevoir des alertes immédiates d'achats et virements entrants.</p>
                  </div>
                </div>
                <button
                  id="toggle-push-notifications-btn"
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none ${
                    pushEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300 ${pushEnabled ? 'translate-x-5.5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Biometrics biometric lock */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-50 dark:border-slate-850">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                    <Fingerprint className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">Authentification biométrique</h4>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">Utiliser Face ID / Touch ID pour valider vos transactions.</p>
                  </div>
                </div>
                <button
                  id="toggle-biometrics-btn"
                  onClick={() => setBiometricsEnabled(!biometricsEnabled)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none ${
                    biometricsEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300 ${biometricsEnabled ? 'translate-x-5.5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Password change panel */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-50 dark:border-slate-850">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                    <KeyRound className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">Changer de mot de passe</h4>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">Modifiez la clé d'accès sécurisée de votre application.</p>
                  </div>
                </div>
                <button
                  id="trigger-password-modal-btn"
                  onClick={() => setShowPasswordModal(true)}
                  className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 hover:text-slate-850 text-xs font-bold transition"
                >
                  Changer
                </button>
              </div>

              {/* Logout Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-600 dark:text-red-400">Déconnexion sécurisée</h4>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">Fermer votre session client instantanément.</p>
                  </div>
                </div>
                <button
                  id="logout-submit-btn"
                  onClick={onLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-500/10"
                >
                  Se déconnecter
                </button>
              </div>
            </div>

            {/* Version and Brand */}
            <div className="pt-4 border-t border-slate-50 dark:border-slate-850 text-center text-[10px] text-slate-400 font-mono">
              APEX PREMIUM BANKING CORPORATION • VERSION 2.4.1 (BUILD 99A2)
            </div>
          </div>

          {/* Notifications Center List */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-850">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500 animate-pulse" /> Centre de Notifications
              </h3>
              <button
                id="mark-all-read-btn"
                onClick={onMarkAllNotificationsRead}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Tout marquer lu
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => onMarkNotificationRead(notif.id)}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3.5 transition-all cursor-pointer relative overflow-hidden ${
                    notif.read 
                      ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-800/80' 
                      : `${getNotificationBg(notif.type)} shadow-sm font-semibold`
                  }`}
                >
                  {!notif.read && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></span>
                  )}
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold text-slate-850 dark:text-slate-100 ${!notif.read ? 'text-blue-900 dark:text-blue-200' : ''}`}>
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                      {notif.date === '2026-07-11' ? "Aujourd'hui" : notif.date} à {notif.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPasswordModal(false);
                setPassError('');
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Changer de mot de passe</h3>
                <button 
                  id="close-password-modal-btn"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassError('');
                  }}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
                    {passError}
                  </div>
                )}

                {passSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold">
                    ✓ Mot de passe modifié avec succès !
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ancien mot de passe</label>
                  <input
                    id="old-password-input"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={oldPass}
                    onChange={(e) => setOldPass(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nouveau mot de passe</label>
                  <input
                    id="new-password-input"
                    type="password"
                    required
                    placeholder="Min. 6 caractères"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Confirmer le mot de passe</label>
                  <input
                    id="confirm-password-input"
                    type="password"
                    required
                    placeholder="Min. 6 caractères"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                <button
                  id="submit-password-btn"
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition"
                >
                  Enregistrer les modifications
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Concierge private support Modal */}
      <AnimatePresence>
        {showSupportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSupportModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[500px] z-10"
            >
              {/* Support header */}
              <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl border border-white/10 relative">
                    <Headphones className="w-5 h-5 text-blue-300 animate-bounce" />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Éva • Apex Conciergerie</h4>
                    <span className="text-[10px] text-blue-200 font-semibold font-mono uppercase tracking-wider">Ligne Client Privilège</span>
                  </div>
                </div>
                <button 
                  id="close-support-modal-btn"
                  onClick={() => setShowSupportModal(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950 text-xs">
                {chatLog.map((chat, idx) => (
                  <div 
                    key={idx}
                    className={`flex flex-col max-w-[80%] ${chat.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div className={`p-3 rounded-2xl leading-relaxed ${
                      chat.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-sm' 
                        : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none shadow-sm'
                    }`}>
                      {chat.text}
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono mt-1">{chat.time}</span>
                  </div>
                ))}
              </div>

              {/* Input area */}
              <form onSubmit={handleSendSupportMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <input
                  id="support-message-input"
                  type="text"
                  placeholder="Posez votre question (ex: Comment télécharger mon RIB ?)"
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-xs"
                />
                <button
                  id="send-support-message-btn"
                  type="submit"
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
