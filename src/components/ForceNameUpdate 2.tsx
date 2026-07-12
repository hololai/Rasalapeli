import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth, updateProfile } from 'firebase/auth';
import { User, Loader2 } from 'lucide-react';

export function ForceNameUpdate() {
  const { user, profile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('Täytä sekä etunimi että sukunimi.');
      return;
    }

    if (!user || !profile) return;

    try {
      setIsSaving(true);
      setError('');
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      
      // Päivitetään Auth
      const auth = getAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: fullName });
      }

      // Päivitetään Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { displayName: fullName });
      
      // Ladataan sivu uudelleen, jotta context päivittyy nätisti
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      setError('Tietojen päivitys epäonnistui. Yritä uudelleen.');
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-stone-800/80 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl border border-stone-700/50">
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-8 h-8 text-amber-500" />
        </div>
        
        <h2 className="text-2xl font-bold font-serif text-stone-100 mb-4">
          Täydennä profiilisi
        </h2>
        
        <p className="text-stone-400 mb-8 text-sm leading-relaxed">
          Tervetuloa kuvapankkiin! Koska ohjelmaan on lisätty kommentointimahdollisuus, tarvitsemme oikean nimesi. Nimesi näkyy kommenteissa.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Etunimi"
            className="w-full bg-stone-900/50 border border-stone-700 text-stone-100 rounded-xl py-3 px-4 focus:outline-none focus:border-amber-500 transition-colors"
            required
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Sukunimi"
            className="w-full bg-stone-900/50 border border-stone-700 text-stone-100 rounded-xl py-3 px-4 focus:outline-none focus:border-amber-500 transition-colors"
            required
          />
          
          <button
            type="submit"
            disabled={isSaving}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-medium py-3 px-6 rounded-xl transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            <span>Tallenna ja jatka</span>
          </button>
        </form>
      </div>
    </div>
  );
}
