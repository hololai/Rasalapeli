import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, ShieldCheck, Image as ImageIcon, Loader2 } from 'lucide-react';

export function Login() {
  const { signInWithGoogle } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    // Kutsutaan kirjautumista VÄLITTÖMÄSTI, jotta iOS ei estä ponnahdusikkunaa
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Taustakuviointi (koriste) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-stone-800/80 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl border border-stone-700/50 text-center">
        
        <div className="w-20 h-20 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
          <ImageIcon className="w-10 h-10 text-amber-500" />
        </div>

        <h1 className="text-4xl font-bold font-serif text-stone-100 mb-3">
          Rasalan Kuvapankki
        </h1>
        
        <p className="text-stone-400 mb-10 leading-relaxed">
          Tämä palvelu sisältää suvun yksityisiä valokuvia. 
          Pääsy on sallittu ainoastaan kirjautumalla sisään Google-tunnuksella.
        </p>

        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-3 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Yhdistetään Googleen...</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>Kirjaudu sisään Googlella</span>
            </>
          )}
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-stone-500 text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>Yksityinen ja suojattu</span>
        </div>
      </div>
    </div>
  );
}
