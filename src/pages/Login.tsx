import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, ShieldCheck, Image as ImageIcon, Loader2, Mail, Lock, AlertCircle, Info } from 'lucide-react';

export function Login() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  const handleEmailAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoggingIn(true);

    try {
      if (mode === 'forgot') {
        if (!email) throw new Error('Syötä sähköpostiosoite ensin.');
        await resetPassword(email);
        setSuccess('Palautuslinkki on lähetetty sähköpostiisi!\n\nHUOM 1: Tarkista myös roskapostikansio.\nHUOM 2: Turvallisuussyistä aseta uusi salasana vähintään 15 merkin pituiseksi.');
        setMode('login');
      } else if (mode === 'register') {
        if (!email || !password || !firstName || !lastName) throw new Error('Täytä kaikki kentät (Etunimi, Sukunimi, Sähköposti, Salasana).');
        if (password.length < 15) {
          throw new Error('Turvallisuussyistä salasanan on oltava vähintään 15 merkkiä pitkä.');
        }
        await signUpWithEmail(email, password, firstName, lastName);
      } else {
        if (!email || !password) throw new Error('Täytä molemmat kentät.');
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes('auth/invalid-email')) {
        setError('Virheellinen sähköpostiosoite.');
      } else if (err.message.includes('auth/user-not-found') || err.message.includes('auth/wrong-password') || err.message.includes('auth/invalid-credential')) {
        setError('Väärä sähköposti tai salasana.');
      } else if (err.message.includes('auth/email-already-in-use')) {
        setError('Tällä sähköpostilla on jo tili. Kokeile kirjautua tai palauttaa salasana.');
      } else {
        setError(err.message || 'Tapahtui tuntematon virhe.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-stone-800/80 backdrop-blur-md p-6 md:p-10 rounded-3xl shadow-2xl border border-stone-700/50 text-center">
        
        <div className="w-20 h-20 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
          <ImageIcon className="w-10 h-10 text-amber-500" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold font-serif text-stone-100 mb-3">
          Rasalan Kuvapankki
        </h1>
        
        <p className="text-stone-400 mb-8 leading-relaxed text-sm">
          Yksityinen sukualbumi. Valitse kirjautumistapa alta.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-left">
            <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-400 whitespace-pre-line">{success}</p>
          </div>
        )}

        {!isMobile && mode === 'login' && (
          <div className="mb-8">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-amber-600 hover:bg-amber-500 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-lg active:scale-[0.98]"
            >
              <LogIn className="w-5 h-5" />
              <span>Kirjaudu Googlella (Ylläpito)</span>
            </button>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex-1 h-px bg-stone-700"></div>
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">TAI SALASANALLA</span>
              <div className="flex-1 h-px bg-stone-700"></div>
            </div>
          </div>
        )}



        <form onSubmit={handleEmailAction} className="space-y-4">
          {mode === 'register' && (
            <div className="flex gap-3">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Etunimi"
                className="w-1/2 bg-stone-900/50 border border-stone-700 text-stone-100 rounded-xl py-3 px-4 focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sukunimi"
                className="w-1/2 bg-stone-900/50 border border-stone-700 text-stone-100 rounded-xl py-3 px-4 focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Sähköpostiosoite"
              className="w-full bg-stone-900/50 border border-stone-700 text-stone-100 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-amber-500 transition-colors"
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? "Vähintään 15 merkkiä" : "Salasana"}
                className="w-full bg-stone-900/50 border border-stone-700 text-stone-100 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-amber-500 transition-colors"
                required
                minLength={mode === 'register' ? 15 : undefined}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-2 bg-stone-700 hover:bg-stone-600 disabled:bg-stone-800 disabled:text-stone-500 text-white font-medium py-3 px-6 rounded-xl transition-all active:scale-[0.98]"
          >
            {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            <span>
              {mode === 'login' ? 'Kirjaudu salasanalla' : mode === 'register' ? 'Luo uusi tili' : 'Lähetä palautuslinkki'}
            </span>
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-4 text-sm">
          {mode === 'login' ? (
            <>
              <button onClick={() => setMode('forgot')} className="text-amber-500 hover:text-amber-400 font-medium transition-colors mb-2">
                Unohdin salasanani / Aseta mobiilisalasana
              </button>
              
              <div className="w-full flex flex-col items-center gap-3">
                <span className="text-stone-400 text-xs uppercase tracking-wider font-medium">Uusi käyttäjä?</span>
                <button 
                  onClick={() => setMode('register')} 
                  className="w-full max-w-[200px] flex items-center justify-center bg-transparent border-2 border-amber-500/50 hover:border-amber-500 text-amber-500 hover:text-amber-400 font-bold py-2.5 px-6 rounded-xl transition-all"
                >
                  Rekisteröidy
                </button>
                <span className="text-stone-500 text-xs">(Katseluoikeus arkistoon)</span>
              </div>
            </>
          ) : (
            <button onClick={() => setMode('login')} className="text-stone-400 hover:text-stone-300 transition-colors">
              Palaa kirjautumiseen
            </button>
          )}
        </div>

        {isMobile && mode === 'login' && (
          <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left text-sm text-amber-200/80">
            <p className="mb-2"><strong>Oletko Google-käyttäjä?</strong></p>
            <p>Vältä selaimesi yhteysongelmat tällä mobiililaitteella: Paina yltä <em>Unohdin salasanani</em> ja syötä Google-sähköpostisi, niin saat linkin mobiilisalasanan asettamiseen.</p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-2 text-stone-600 text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>Suojattu yhteys</span>
        </div>
      </div>
    </div>
  );
}
