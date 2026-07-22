import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Clock, Map, BookOpen, LogOut, LogIn, User, ShieldAlert, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { InfoButton } from './InfoButton';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const defaultNavItems = [
  { path: '/',          label: 'Valokuvat', icon: Home },
  { path: '/map',       label: 'Kartta',    icon: Map },
  { path: '/quiz',      label: 'Tietovisa', icon: BookOpen },
];

export const Navbar = () => {
  const location = useLocation();
  const { user, profile, signInWithGoogle, logout } = useAuth();

  const navItems = (profile?.role === 'superadmin' || profile?.role === 'admin')
    ? [...defaultNavItems, { path: '/admin', label: 'Käyttäjähallinta', icon: ShieldAlert }] 
    : defaultNavItems;

  return (
    <>
      {/* Desktop – yläpalkki */}
      <nav className="navbar-glass-top hidden sm:flex fixed top-0 left-0 right-0 z-50 px-8 py-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-serif text-xl font-bold text-rasala-gold tracking-wide">Ellan ja Viken suku</span>
          <InfoButton 
            title="Tervetuloa!"
            iconSize={18}
            buttonClassName="p-1.5"
            instructions={[
              "Tervetuloa Rasalapeliin – yhteiseen muistojen arkistoomme.",
              "Tämä sovellus on tarkoitettu tarinoiden, valokuvien ja historian jakamiseen turvallisesti perheen ja suvun kesken.",
              "Jos sinulla on vanhoja valokuvia tai muistat mielenkiintoisen tarinan jostakin paikasta, ota yhteyttä ylläpitäjään, jotta voimme tallentaa sen tänne!"
            ]}
          />
          <a 
            href="https://drive.google.com/drive/folders/11OZae2hP4XBVIJbbD8Kca8VKmeAiRNdu?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white/70 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all ml-2"
          >
            <ExternalLink size={14} />
            Alkuperäiset tarkat kuvat
          </a>
        </div>
        <div className="flex gap-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={(e) => {
                  if (active) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-rasala-gold/20 text-rasala-gold border border-rasala-gold/30'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
          
          <div className="w-px h-6 bg-white/10 mx-2 self-center" />
          
          {user ? (
            <div className="flex items-center gap-3 ml-2">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profiili" className="w-8 h-8 rounded-full border border-rasala-gold/30" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-rasala-gold/30 text-rasala-gold"><User size={16} /></div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white/90">{user.displayName?.split(' ')[0] || 'Käyttäjä'}</span>
                  <span className="text-[10px] text-rasala-gold uppercase tracking-widest">{profile?.role || 'Vieras'}</span>
                </div>
              </div>
              <button onClick={logout} className="p-2 text-white/40 hover:text-red-400 transition-colors" title="Kirjaudu ulos">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="flex items-center gap-2 ml-2 px-4 py-2 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/20 transition-all duration-200 border border-white/10"
            >
              <LogIn size={16} />
              Kirjaudu
            </button>
          )}
        </div>
      </nav>

      {/* Mobile – alapalkki (yläpalkkiin laitetaan mobiilissa logo ja info) */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
        <span className="font-serif text-lg font-bold text-rasala-gold tracking-wide">Ellan ja Viken suku</span>
        <div className="flex items-center gap-2">
          <a 
            href="https://drive.google.com/drive/folders/11OZae2hP4XBVIJbbD8Kca8VKmeAiRNdu?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1.5 bg-white/5 text-white/70 border border-white/10 rounded-lg text-[10px] font-bold uppercase hover:bg-white/10"
            title="Alkuperäiset tarkat kuvat"
          >
            <ExternalLink size={14} />
            Kuvat
          </a>
          <InfoButton 
            title="Tervetuloa!"
            iconSize={18}
            buttonClassName="p-1.5 bg-black/50"
            instructions={[
              "Tervetuloa Rasalapeliin – yhteiseen muistojen arkistoomme.",
              "Tämä sovellus on tarkoitettu tarinoiden, valokuvien ja historian jakamiseen turvallisesti perheen ja suvun kesken.",
              "Jos sinulla on vanhoja valokuvia tai muistat mielenkiintoisen tarinan jostakin paikasta, ota yhteyttä ylläpitäjään, jotta voimme tallentaa sen tänne!"
            ]}
          />
        </div>
      </div>

      <nav className="navbar-glass sm:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around py-2 px-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={(e) => {
                if (active) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200',
                active
                  ? 'text-rasala-gold'
                  : 'text-white/40 hover:text-white/70'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </Link>
          );
        })}
        {/* Mobiilin profiili/kirjautuminen */}
        {user ? (
          <button onClick={logout} className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-white/40 hover:text-red-400 transition-all duration-200">
            <LogOut size={22} strokeWidth={1.8} />
            <span className="text-[10px] font-semibold tracking-wide">Ulos</span>
          </button>
        ) : (
          <button onClick={signInWithGoogle} className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-white/40 hover:text-white/70 transition-all duration-200">
            <LogIn size={22} strokeWidth={1.8} />
            <span className="text-[10px] font-semibold tracking-wide">Kirjaudu</span>
          </button>
        )}
      </nav>
    </>
  );
};
