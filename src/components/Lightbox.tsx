import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Edit3, Save, RotateCw, Trash2, Heart, MessageCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Comments } from './Comments';
import { useAuth } from '../contexts/AuthContext';

interface LightboxProps {
  images: { id: string; src: string; title: string; year?: number | string; description?: string; rotation?: number; uploaderName?: string; uploaderEmail?: string; views?: number; rawDriveUrl?: string; hidden?: boolean }[];
  startIndex?: number;
  onClose: () => void;
  isAdmin?: boolean;
  onRotate?: (id: string) => void;
  onHide?: (id: string) => void;
  onSaveCaption?: (id: string, text: string) => void;
  onView?: (id: string) => void;
  onIndexChange?: (index: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ images, startIndex = 0, onClose, isAdmin, onRotate, onHide, onSaveCaption, onView, onIndexChange }) => {
  const { profile, toggleFavorite } = useAuth();
  const [current, setCurrent] = useState(startIndex);
  const [direction, setDirection] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  const img = images[current];

  if (!img) {
    return null;
  }

  // Nollaa edit-tila ja zoom kun kuva vaihtuu
  useEffect(() => {
    setIsEditing(false);
    setIsZoomed(false);
    
    // Päivitä katselukerrat kun kuva vaihtuu
    if (images[current] && onView) {
      onView(images[current].id);
    }
    if (onIndexChange) {
      onIndexChange(current);
    }
  }, [current]);

  const prev = () => {
    setCurrent(c => {
      if (c > 0) {
        setDirection(-1);
        return c - 1;
      }
      return c;
    });
  };
  const next = () => {
    setCurrent(c => {
      if (c < images.length - 1) {
        setDirection(1);
        return c + 1;
      }
      return c;
    });
  };

  // Swaippauksen käsittely
  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = offset.x;
    if (swipe < -50) {
      next();
    } else if (swipe > 50) {
      prev();
    }
  };

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
      className="fixed inset-0 z-[100] bg-black flex flex-col"
      onClick={onClose}
    >
      {/* Oikean yläkulman napit */}
      <div className="absolute top-4 right-4 z-[110] flex gap-3">
        {isAdmin && onSaveCaption && !isEditing && (
          <button onClick={(e) => { e.stopPropagation(); setEditText(img.description || ''); setIsEditing(true); }} className="p-3 rounded-full bg-red-600/50 hover:bg-red-500 text-white transition-colors backdrop-blur-md" title="Muokkaa kuvatekstiä">
            <Edit3 size={24} />
          </button>
        )}
        {isAdmin && onRotate && (
          <button onClick={(e) => { e.stopPropagation(); onRotate(img.id); }} className="p-3 rounded-full bg-blue-600/50 hover:bg-blue-500 text-white transition-colors backdrop-blur-md" title="Käännä kuvaa">
            <RotateCw size={24} />
          </button>
        )}
        {isAdmin && onHide && (
          <button onClick={(e) => { e.stopPropagation(); onHide(img.id); }} className={`p-3 rounded-full ${img.hidden ? 'bg-red-600/80 hover:bg-green-600' : 'bg-gray-700/50 hover:bg-gray-600'} text-white transition-colors backdrop-blur-md`} title={img.hidden ? 'Palauta näkyviin' : 'Piilota kuva'}>
            {img.hidden ? <Lock size={24} /> : <Trash2 size={24} />}
          </button>
        )}
        <button onClick={onClose} className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md">
          <X size={24} />
        </button>
      </div>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[110] px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white/70 text-sm font-medium pointer-events-none">
          {current + 1} / {images.length}
        </div>
      )}

      {/* Prev / Next (Hidden on very small screens, use swipe) */}
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} disabled={current === 0} className="hidden sm:block absolute left-6 top-1/2 -translate-y-1/2 z-[110] p-3 rounded-full bg-black/40 hover:bg-rasala-gold/30 text-white disabled:opacity-20 transition-all backdrop-blur-md border border-white/10">
            <ChevronLeft size={28} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} disabled={current === images.length - 1} className="hidden sm:block absolute right-6 top-1/2 -translate-y-1/2 z-[110] p-3 rounded-full bg-black/40 hover:bg-rasala-gold/30 text-white disabled:opacity-20 transition-all backdrop-blur-md border border-white/10">
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* Main content - Edge to Edge */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 200 : direction < 0 ? -200 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -200 : direction < 0 ? 200 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, opacity: { duration: 0.2 } }}
            drag={isZoomed ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 touch-pan-y"
          >
            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={4}
              centerOnInit
              onTransform={(ref: any) => setIsZoomed(ref.state.scale > 1.05)}
            >
              <TransformComponent 
                wrapperStyle={{ width: '100vw', height: '100vh' }}
                contentStyle={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                <img
                  src={img.src}
                  alt={img.title}
                  className="object-contain"
                  style={{ 
                    maxHeight: '100vh', 
                    maxWidth: '100vw',
                    transform: `rotate(${img.rotation || 0}deg)` 
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </TransformComponent>
            </TransformWrapper>
          </motion.div>
        </AnimatePresence>

        {/* Gradient Overlay for bottom info and actions */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pb-8 sm:p-8 pointer-events-none flex items-end justify-between z-[105]">
          
          {/* Left Side: Caption */}
          <div className="flex-1 max-w-3xl pr-4 pointer-events-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-1">
              {img.year && <span className="text-rasala-gold text-sm font-bold tracking-widest">{img.year}</span>}
              {img.uploaderName && (
                <div 
                  className="flex items-center justify-center p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition-colors border border-white/10 cursor-help"
                  title={`Lisännyt: ${img.uploaderName}`}
                >
                  <User size={14} className="text-white/80" />
                </div>
              )}
            </div>
            {!isEditing && <h2 className="font-serif text-2xl sm:text-3xl text-white drop-shadow-md">{img.title}</h2>}
            
            {isEditing ? (
              <div className="mt-4 flex flex-col gap-3">
                 <textarea autoFocus value={editText} onChange={e => setEditText(e.target.value)} className="w-full min-h-[80px] max-h-32 bg-black/80 border border-white/20 rounded-xl p-4 text-white focus:border-rasala-gold outline-none resize-none" placeholder="Kirjoita kuvateksti..." />
                 <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <button onClick={() => setIsEditing(false)} className="px-5 py-2 rounded-xl text-white/60 hover:bg-white/10 font-medium w-full sm:w-auto">Peruuta</button>
                    <button onClick={() => { if(onSaveCaption) { onSaveCaption(img.id, editText); setIsEditing(false); } }} className="bg-amber-600 hover:bg-amber-500 px-6 py-2 rounded-xl font-bold flex items-center justify-center gap-2 w-full sm:w-auto"><Save size={18}/> Tallenna</button>
                 </div>
              </div>
            ) : (
              img.description && <p className="text-white/90 mt-2 text-sm sm:text-base leading-relaxed drop-shadow-md line-clamp-3 hover:line-clamp-none transition-all">{img.description}</p>
            )}
          </div>

          {/* Right Side: Action Buttons (Heart, Comments) */}
          <div className="flex flex-col gap-4 items-center shrink-0 pointer-events-auto mb-2" onClick={e => e.stopPropagation()}>
            {profile && (
              <button
                onClick={() => toggleFavorite(img.id)}
                className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex flex-col items-center gap-1 transition-transform hover:scale-110 active:scale-90"
              >
                <Heart size={26} fill={profile.favorites?.includes(img.id) ? "#ef4444" : "none"} color={profile.favorites?.includes(img.id) ? "#ef4444" : "white"} />
              </button>
            )}
            
            <button
              onClick={() => setShowComments(true)}
              className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex flex-col items-center gap-1 transition-transform hover:scale-110 active:scale-90"
            >
              <MessageCircle size={26} color="white" />
            </button>
          </div>
        </div>

        {/* Bottom Sheet for Comments & Metadata */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="absolute bottom-0 left-0 right-0 h-[85vh] bg-rasala-dark/95 backdrop-blur-xl border-t border-white/10 z-[120] rounded-t-3xl overflow-hidden flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-full flex justify-center py-3 cursor-pointer shrink-0" onClick={() => setShowComments(false)}>
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>
              
              <div className="overflow-y-auto px-4 sm:px-8 pb-safe flex-1 max-w-4xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6 mt-2">
                  <h3 className="text-xl font-serif text-rasala-gold">Tiedot ja Kommentit</h3>
                  <button onClick={() => setShowComments(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/70">
                    <X size={20} />
                  </button>
                </div>
                
                {/* Metatiedot */}
                <div className="flex flex-wrap gap-4 text-sm text-white/70 bg-black/30 p-4 rounded-xl border border-white/5 mb-8">
                  {img.uploaderName && <span>Lisännyt: <strong className="text-white">{img.uploaderName}</strong></span>}
                  {img.views !== undefined && <span>Katsottu: <strong className="text-white">{img.views} krt</strong></span>}
                  
                  {img.rawDriveUrl ? (
                    <a href={img.rawDriveUrl} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 font-medium underline w-full sm:w-auto">Avaa alkuperäinen kuva (Drive)</a>
                  ) : img.uploaderEmail ? (
                    <a href={`mailto:${img.uploaderEmail}?subject=Rasalapeli:%20Pyyntö%20alkuperäiselle%20kuvalle&body=Hei%20${img.uploaderName},%0A%0Apyytäisin%20alkuperäistä%20(korkearesoluutioista)%20versiota%20kuvasta:%20${img.id}.%0A%0AKiitos!`} className="text-amber-500 hover:text-amber-400 font-medium underline w-full sm:w-auto">Kysy alkuperäistä kuvaa (Sähköposti)</a>
                  ) : null}
                </div>

                <Comments imageId={img.id} isAdmin={isAdmin || false} />
                <div className="h-20" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
