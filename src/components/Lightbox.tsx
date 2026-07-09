import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Edit3, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LightboxProps {
  images: { src: string; title: string; year?: number | string; description?: string; rotation?: number }[];
  startIndex?: number;
  onClose: () => void;
  isAdmin?: boolean;
  onRotate?: (src: string) => void;
  onHide?: (src: string) => void;
  onSaveCaption?: (src: string, text: string) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ images, startIndex = 0, onClose, isAdmin, onRotate, onHide, onSaveCaption }) => {
  const [current, setCurrent] = useState(startIndex);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  
  const img = images[current];

  // Nollaa edit-tila kun kuva vaihtuu
  useEffect(() => {
    setIsEditing(false);
  }, [current]);

  const prev = () => setCurrent(i => Math.max(0, i - 1));
  const next = () => setCurrent(i => Math.min(images.length - 1, i + 1));

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isEditing) return; // Älä vaihda kuvaa jos kirjoitetaan tekstiä
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="lightbox-overlay"
      onClick={onClose}
    >
      {/* Oikean yläkulman napit */}
      <div className="absolute top-4 right-4 z-20 flex gap-3">
        {isAdmin && onSaveCaption && !isEditing && (
          <button
            onClick={(e) => { e.stopPropagation(); setEditText(img.description || ''); setIsEditing(true); }}
            className="p-3 rounded-full bg-red-600/50 hover:bg-red-500 text-white transition-colors backdrop-blur-md"
            title="Muokkaa kuvatekstiä"
          >
            <Edit3 size={24} />
          </button>
        )}
        {isAdmin && onRotate && (
          <button
            onClick={(e) => { e.stopPropagation(); onRotate(img.src); }}
            className="p-3 rounded-full bg-blue-600/50 hover:bg-blue-500 text-white transition-colors backdrop-blur-md"
            title="Käännä kuvaa"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
          </button>
        )}
        {isAdmin && onHide && (
          <button
            onClick={(e) => { e.stopPropagation(); onHide(img.src); }}
            className="p-3 rounded-full bg-gray-600/50 hover:bg-gray-500 text-white transition-colors backdrop-blur-md"
            title="Piilota kuva"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        )}
        <button
          onClick={onClose}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md"
        >
          <X size={24} />
        </button>
      </div>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white/70 text-sm font-medium">
          {current + 1} / {images.length}
        </div>
      )}

      {/* Main content */}
      <div
        className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-12"
        onClick={e => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center w-full max-w-5xl"
          >
            {/* Image — fills as much screen as possible */}
            <div className="w-full flex justify-center items-center" style={{ maxHeight: '75vh', overflow: 'hidden' }}>
              <img
                src={img.src}
                alt={img.title}
                className="object-contain rounded-xl shadow-cinema transition-transform duration-300"
                style={{ 
                  maxHeight: '75vh', 
                  maxWidth: '100%',
                  transform: `rotate(${img.rotation || 0}deg)` 
                }}
              />
            </div>

            {/* Caption */}
            <div className="mt-4 text-center w-full max-w-2xl px-4" onClick={e => e.stopPropagation()}>
              {img.year && (
                <span className="text-rasala-gold text-sm font-bold tracking-widest">{img.year}</span>
              )}
              {!isEditing && <h2 className="font-serif text-2xl sm:text-3xl text-white mt-1">{img.title}</h2>}
              
              {isEditing ? (
                <div className="mt-4 flex flex-col gap-3">
                  <textarea
                    autoFocus
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    placeholder="Kirjoita kuvateksti tai tarina tähän..."
                    className="w-full h-32 bg-black/60 border border-white/20 rounded-xl p-4 text-white focus:border-rasala-gold outline-none resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 font-medium">
                      Peruuta
                    </button>
                    <button 
                      onClick={() => { 
                        onSaveCaption?.(img.src, editText); 
                        setIsEditing(false); 
                      }} 
                      className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 font-bold"
                    >
                      <Save size={18} /> Tallenna
                    </button>
                  </div>
                </div>
              ) : (
                img.description && (
                  <p className="text-white/80 mt-2 text-base leading-relaxed">{img.description}</p>
                )
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              disabled={current === 0}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-rasala-gold/30 text-white disabled:opacity-20 transition-all backdrop-blur-md border border-white/10"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={next}
              disabled={current === images.length - 1}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-rasala-gold/30 text-white disabled:opacity-20 transition-all backdrop-blur-md border border-white/10"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};
