import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Login } from '../pages/Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

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
  if (!user) {
    return <Login />;
  }

  // Jos käyttäjä on kirjautunut, päästetään hänet läpi katsomaan sovellusta
  return <>{children}</>;
}
