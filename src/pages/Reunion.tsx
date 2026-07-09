import React from 'react';
import { reunionData } from '../data/mockData';
import { Calendar, MapPin, Users, ChefHat, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export const Reunion = () => {
  return (
    <div className="min-h-screen bg-rasala-light pb-24 sm:pt-16">

      {/* Hero */}
      <div className="relative w-full h-56 sm:h-72 bg-rasala-dark overflow-hidden">
        <img
          src="https://placehold.co/1200x500/1c2b1e/d4af37?text=Sukukokous+25.7.2026"
          alt="Sukukokous"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div className="text-rasala-gold text-sm font-bold tracking-widest uppercase mb-2">Ellan & Viken suku</div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white drop-shadow-lg">Sukukokous</h1>
          <p className="text-rasala-gold text-xl font-semibold mt-2">{reunionData.date}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Info cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { icon: MapPin, label: "Paikka", value: "Lappeenrannan Rauhanyhdistys" },
            { icon: Users, label: "Osallistujia", value: `${reunionData.guestCount} henkilöä` },
            { icon: Calendar, label: "Päivämäärä", value: reunionData.date },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="glass-panel p-4 flex flex-col items-center text-center"
            >
              <item.icon className="text-rasala-gold mb-2" size={28} />
              <div className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</div>
              <div className="font-bold text-rasala-dark text-sm mt-1">{item.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Ruokaohjelma */}
        <section>
          <h2 className="text-2xl font-serif font-bold text-rasala-dark mb-4 flex items-center gap-2">
            <ChefHat className="text-rasala-gold" /> Ruokaohjelma
          </h2>
          <div className="space-y-3">
            {reunionData.food.map((item, i) => (
              <motion.div
                key={item.meal}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="glass-panel p-4 flex items-start gap-4"
              >
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <div className="font-bold text-rasala-dark">{item.meal}</div>
                  <div className="text-gray-700">{item.description}</div>
                  {item.details && <div className="text-sm text-gray-500 mt-1">{item.details}</div>}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Vastuunjako */}
        <section>
          <h2 className="text-2xl font-serif font-bold text-rasala-dark mb-4 flex items-center gap-2">
            <Users className="text-rasala-gold" /> Vastuunjako
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reunionData.responsibilities.map((r, i) => (
              <motion.div
                key={r.name}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="glass-panel p-4 flex items-center gap-3"
              >
                <span className="text-2xl">{r.icon}</span>
                <div>
                  <div className="font-bold text-rasala-dark">{r.name}</div>
                  <div className="text-sm text-gray-500">{r.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Lastenlastten toiveet */}
        <section>
          <h2 className="text-2xl font-serif font-bold text-rasala-dark mb-4 flex items-center gap-2">
            <Heart className="text-rasala-gold" /> Lastenlastten toiveet ohjelmalle
          </h2>
          <div className="glass-panel p-6">
            <p className="text-gray-500 italic mb-4">"Kaikki käy! Kiitos, kun järjestätte!" — Lastenlasset</p>
            <ul className="space-y-2">
              {reunionData.grandchildrenWishes.map((wish, i) => (
                <li key={i} className="flex items-start gap-2 text-rasala-dark">
                  <span className="text-rasala-gold font-bold mt-0.5">•</span>
                  <span>{wish}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Budget note */}
        <div className="text-center text-sm text-gray-400 pb-4">
          Tilavuokra: {reunionData.budget} • {reunionData.costPerFamily} per sisarus
        </div>

      </div>
    </div>
  );
};
