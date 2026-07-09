import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Login } from '../pages/Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, loading, logout } = useAuth();

  // Näytä latausruutu, kun Firebase vasta selvittää onko käyttäjä kirjautunut
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-stone-400 font-medium">Avataan holvia...</p>
        </div>
      </div>
    );
  }

  // Jos käyttäjä EI ole kirjautunut sisään, näytetään Kirjautumisruutu!
  // Tämä estää täysin lasten komponenttien (koko sovelluksen) renderöinnin ja lataamisen.
  if (!user || !profile) {
    return <Login />;
  }

  // Jos käyttäjä on odotustilassa, näytetään odotusruutu
  if (profile.role === 'pending') {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md bg-stone-800 p-8 rounded-2xl shadow-xl border border-stone-700">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⏳</span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-stone-100 mb-4">Odotetaan hyväksyntää</h2>
          <p className="text-stone-400 mb-6">
            Hei <strong>{profile.displayName}</strong>!<br/><br/>
            Kirjautumisesi onnistui, mutta ylläpitäjän täytyy vielä hyväksyä käyttöoikeutesi.
            Palaa myöhemmin takaisin!
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-stone-700 hover:bg-stone-600 text-white font-medium py-3 px-4 rounded-xl transition-colors mb-4"
          >
            Päivitä sivu
          </button>
          
          <button 
            onClick={logout}
            className="text-stone-500 hover:text-stone-300 text-sm font-medium transition-colors"
          >
            Kirjaudu ulos
          </button>
        </div>
      </div>
    );
  }

  // Jos käyttäjä on kirjautunut (ja vähintään user-tasolla), päästetään hänet läpi katsomaan sovellusta
  return <>{children}</>;
}
