import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Map, HelpCircle, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const cards = [
  {
    path: '/timeline',
    label: 'Aikamatka',
    subtitle: '1935 Ranua → Lappeenranta',
    icon: Clock,
    bg: 'from-amber-950/80 to-rasala-dark/90',
    accent: 'text-amber-300',
    delay: 0,
  },
  {
    path: '/map',
    label: 'Rasala Kartalla',
    subtitle: 'Kylä, kotitontti ja muistot',
    icon: Map,
    bg: 'from-green-950/80 to-rasala-dark/90',
    accent: 'text-green-300',
    delay: 0.1,
  },
  {
    path: '/quiz',
    label: 'Salapoliisipeli',
    subtitle: 'Ratkaise Rasalan arvoitus',
    icon: HelpCircle,
    bg: 'from-blue-950/80 to-rasala-dark/90',
    accent: 'text-blue-300',
    delay: 0.2,
  },
];

export const Home = () => {
  return (
    <div className="min-h-screen bg-rasala-dark overflow-x-hidden">

      {/* ── Cinematic Hero ── */}
      <div className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Taustakuva */}
        <div className="absolute inset-0">
          <img
            src="https://placehold.co/1600x900/0e1a10/1c2b1e?text=."
            alt="bg"
            className="w-full h-full object-cover opacity-40"
          />
          {/* Radiaali vinjetti */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(14,26,16,0.9)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-rasala-dark/60 via-transparent to-rasala-dark" />
        </div>

        {/* Hero-teksti */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-rasala-gold/70 text-sm font-semibold tracking-[0.3em] uppercase mb-4"
          >
            1935 – 2026
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="font-serif text-5xl sm:text-7xl lg:text-8xl font-black leading-tight"
          >
            <span className="gold-shimmer">Ellan ja Viken</span>
            <br />
            <span className="text-white/90">suku</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="mt-6 text-white/50 text-lg sm:text-xl font-light max-w-xl mx-auto leading-relaxed"
          >
            Matka Ranualta Lappeenrantaan. Kahdeksan lasta —
            tarinat, paikat ja muistot elävänä.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/timeline">
              <button className="btn-gold px-8 py-4 rounded-2xl text-base shadow-gold">
                <span>Aloita Aikamatka ↓</span>
              </button>
            </Link>
            <Link to="/map">
              <button className="px-8 py-4 rounded-2xl text-base border border-white/20 text-white/70 hover:border-rasala-gold/40 hover:text-white transition-all backdrop-blur-sm">
                Avaa Kartta
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 animate-float"
        >
          <span className="text-xs tracking-widest uppercase">Selaa</span>
          <ChevronDown size={18} />
        </motion.div>
      </div>

      {/* ── Navigaatiokortit ── */}
      <div className="relative pb-28 sm:pb-16 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map(({ path, label, subtitle, icon: Icon, bg, accent, delay }) => (
            <motion.div
              key={path}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay }}
            >
              <Link to={path} className="group block">
                <div className={`cinema-card bg-gradient-to-br ${bg} p-6 sm:p-8 h-full transition-all duration-300 group-hover:border-rasala-gold/30 group-hover:shadow-gold-lg group-hover:-translate-y-1`}>
                  <div className={`mb-4 ${accent}`}>
                    <Icon size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white mb-1">{label}</h3>
                  <p className="text-white/45 text-sm">{subtitle}</p>
                  <div className={`mt-6 text-xs font-semibold tracking-widest uppercase ${accent} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    Avaa →
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};
