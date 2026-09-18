'use client';

import React, { useState } from 'react';
import ElimiHeader from '@/components/ElimiHeader';
import { useSettings } from '@/components/SettingsProvider';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ContactPage() {
  const settings = useSettings();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting form', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans flex flex-col">
      <ElimiHeader />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Contactez-<span className="text-[#0D52FF]">Nous</span>
          </h1>
          <p className="text-slate-600 text-lg">
            Notre équipe est à votre disposition pour toute demande de réservation, devis ou information sur nos services protocolaires.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Information */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Nos Coordonnées</h2>
            <p className="text-slate-600">
              N'hésitez pas à nous contacter directement via les coordonnées ci-dessous ou en remplissant le formulaire. Nous vous répondrons dans les plus brefs délais.
            </p>

            <div className="space-y-6 mt-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0D52FF] flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">Téléphone & WhatsApp</h3>
                  <p className="text-slate-600 mt-1">{settings.phoneNumber || settings.whatsappNumber || settings.contactPhone || '+257 64 44 45 46'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0D52FF] flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">Email</h3>
                  <p className="text-slate-600 mt-1">{settings.contactEmail || 'contact@elimi.com'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0D52FF] flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">Adresse</h3>
                  <p className="text-slate-600 mt-1">Bujumbura, Burundi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-100">
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Message Envoyé !</h3>
                <p className="text-slate-600">
                  Merci de nous avoir contactés. Notre équipe vous répondra très prochainement.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="mt-6 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full transition-colors"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">Nom Complet</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0D52FF] focus:ring-2 focus:ring-[#0D52FF]/20 transition-all outline-none bg-slate-50 focus:bg-white"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Adresse Email</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0D52FF] focus:ring-2 focus:ring-[#0D52FF]/20 transition-all outline-none bg-slate-50 focus:bg-white"
                    placeholder="vous@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">Sujet</label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0D52FF] focus:ring-2 focus:ring-[#0D52FF]/20 transition-all outline-none bg-slate-50 focus:bg-white"
                    placeholder="Objet de votre demande"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0D52FF] focus:ring-2 focus:ring-[#0D52FF]/20 transition-all outline-none bg-slate-50 focus:bg-white resize-none"
                    placeholder="Comment pouvons-nous vous aider ?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#0D52FF] hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Envoyer le Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
