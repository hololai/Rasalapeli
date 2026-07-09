import React, { useState, useEffect, useMemo } from 'react';
import { Lock, Unlock, ZoomIn, Edit3, X, Save, RotateCw, Trash2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbox } from '../components/Lightbox';
import { ImageUploader } from '../components/ImageUploader';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import localImagesData from '../data/localImages.json';

interface GalleryImage {
  id: string;         // Firestore doc ID (tiedostonimi ilman päätettä)
  path: string;       // URL from Firebase Storage
  decade: string;     
  filename: string;   
  caption: string;    
  rotation: number;
  hidden: boolean;
}

export const Gallery = () => {
  const { profile } = useAuth();
  const isAdminUser = profile?.role === 'superadmin' || profile?.role === 'admin';
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Pending changes for bulk save
  const [pendingChanges, setPendingChanges] = useState<Record<string, Partial<GalleryImage>>>({});

  const [selectedDecade, setSelectedDecade] = useState<string>('Kaikki');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [editCaptionText, setEditCaptionText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Hae kuvat Firestoresta
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      // Ohitetaan Firestore täysin väliaikaisesti, koska se jumiutuu.
      // Ladataan suoraan lokaalista tiedostosta kaikki 732 kuvaa!
      const fetched: GalleryImage[] = localImagesData.map((data: any) => ({
        id: data.id,
        path: data.url,
        decade: data.year ? `${Math.floor(data.year / 10) * 10}-luku` : 'Tuntematon',
        filename: data.filename,
        caption: data.title || '',
        rotation: 0,
        hidden: false
      }));
      setImages(fetched);
    } catch (e) {
      console.error("Virhe kuvien latauksessa paikallisesta tiedostosta:", e);
    } finally {
      setLoading(false);
    }
  };

  const getEffectiveImage = (img: GalleryImage): GalleryImage => {
    if (pendingChanges[img.id]) {
      return { ...img, ...pendingChanges[img.id] };
    }
    return img;
  };

  const handleUpdate = (id: string, updates: Partial<GalleryImage>) => {
    setPendingChanges(prev => {
      const currentPending = prev[id] || {};
      return { ...prev, [id]: { ...currentPending, ...updates } };
    });
  };

  const handleSaveCaption = () => {
    if (!editingImage) return;
    handleUpdate(editingImage.id, { caption: editCaptionText });
    setEditingImage(null);
  };

  const handleRotate = (id: string) => {
    const img = getEffectiveImage(images.find(i => i.id === id)!);
    handleUpdate(id, { rotation: ((img.rotation || 0) + 90) % 360 });
  };

  const handleHide = (id: string) => {
    if (!window.confirm("Haluatko varmasti piilottaa tämän kuvan? Se ei näy enää vieraille.")) return;
    handleUpdate(id, { hidden: true });
  };

  const saveAllChangesToDB = async () => {
    const changesCount = Object.keys(pendingChanges).length;
    if (changesCount === 0) return;

    try {
      setIsSaving(true);
      const batch = writeBatch(db);
      
      Object.keys(pendingChanges).forEach(id => {
        const ref = doc(db, 'images', id);
        batch.update(ref, pendingChanges[id]);
      });

      await batch.commit();
      
      // Update local state directly to avoid re-fetch if possible
      setImages(prev => prev.map(img => {
        if (pendingChanges[img.id]) return { ...img, ...pendingChanges[img.id] };
        return img;
      }));
      setPendingChanges({});
      alert("Muutokset tallennettu tietokantaan!");
    } catch (e) {
      console.error(e);
      alert("Virhe tallennuksessa!");
    } finally {
      setIsSaving(false);
    }
  };

  const displayImages = useMemo(() => {
    let list = images.map(getEffectiveImage);
    
    // Piilota hidden-kuvat (paitsi jos on admin mode)
    if (!isAdminMode) {
      list = list.filter(img => !img.hidden);
    }

    if (selectedDecade !== 'Kaikki') {
      list = list.filter(img => img.decade === selectedDecade);
    }
    
    return list.sort((a, b) => a.decade.localeCompare(b.decade));
  }, [images, pendingChanges, selectedDecade, isAdminMode]);

  const decades = useMemo(() => {
    const allVisible = images.map(getEffectiveImage).filter(img => isAdminMode || !img.hidden);
    const decs = Array.from(new Set(allVisible.map(img => img.decade))).sort();
    return ['Kaikki', ...decs];
  }, [images, pendingChanges, isAdminMode]);

  useEffect(() => {
    if (selectedDecade !== 'Kaikki' && !decades.includes(selectedDecade)) {
      setSelectedDecade('Kaikki');
    }
  }, [decades, selectedDecade]);

  const lightboxData = displayImages.map((img) => ({
    id: img.id,
    src: img.path,
    title: img.decade,
    description: img.caption || img.filename,
    rotation: img.rotation || 0,
  }));

  const pendingCount = Object.keys(pendingChanges).length;

  return (
    <div className="min-h-screen bg-rasala-dark text-white pt-20 pb-24 px-4 sm:px-6 flex flex-col relative">
      
      {/* ── Kelluva Tallennuspainike ── */}
      <AnimatePresence>
        {pendingCount > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 sm:bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-amber-600 border-2 border-amber-400 p-4 rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.3)] backdrop-blur-md"
          >
            <span className="font-bold whitespace-nowrap">
              {pendingCount} muutosta odottaa
            </span>
            <button 
              onClick={saveAllChangesToDB}
              disabled={isSaving}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-5 py-2 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Tallennetaan...' : <><Save size={18} /> Tallenna tietokantaan</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto w-full">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold gold-shimmer text-center sm:text-left drop-shadow-md">
            Valokuvat
          </h1>
          
          <div className="flex items-center gap-3">
            {isAdminUser && (
              <>
                <ImageUploader onUploadComplete={fetchImages} />
                <button 
                  onClick={() => setIsAdminMode(!isAdminMode)} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all shadow-lg backdrop-blur-md ${isAdminMode ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-black/60 border-white/10 text-white/50 hover:text-white/90'}`}
                >
                  {isAdminMode ? <Unlock size={18} /> : <Lock size={18} />}
                  <span className="text-sm font-bold">{isAdminMode ? 'Ylläpitotila' : 'Luku-tila'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Vuosikymmen-valikko (Pillerit) ── */}
        <div className="flex flex-wrap gap-3 mb-10 pb-4 border-b border-white/10">
          {decades.map(dec => (
            <button
              key={dec}
              onClick={() => setSelectedDecade(dec)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-md border ${
                selectedDecade === dec 
                  ? 'bg-rasala-gold text-black border-rasala-gold scale-105' 
                  : 'bg-black/40 text-white/70 border-white/10 hover:border-white/30 hover:bg-white/10 backdrop-blur-sm'
              }`}
            >
              {dec === 'Kaikki' ? 'Kaikki kuvat' : dec === 'Kotitalo' ? 'Kotitalo' : `${dec}-luku`}
            </button>
          ))}
        </div>

        {/* ── Kuvagalleria ── */}
        {loading ? (
          <div className="text-center py-20 text-white/40 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p>Ladataan kuvia tietokannasta...</p>
          </div>
        ) : displayImages.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <p className="text-xl">Ei kuvia valitulta vuosikymmeneltä. Aja kuvien migraatio Hallintapaneelista, jos kuvat puuttuvat!</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {displayImages.map((img, index) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className={`relative group rounded-2xl overflow-hidden bg-black/50 border shadow-cinema aspect-[4/3] ${img.hidden ? 'border-red-500/50 opacity-60' : 'border-white/10'}`}
                >
                  <img 
                    src={img.path} 
                    alt={img.filename} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                    style={{ transform: `scale(1.05) rotate(${img.rotation}deg)` }}
                    onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}
                    loading="lazy"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none opacity-80" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <ZoomIn size={48} className="text-white drop-shadow-lg opacity-80" />
                  </div>

                  <div className="absolute top-3 left-3 flex gap-2">
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-rasala-gold border border-rasala-gold/20">
                      {img.decade}
                    </div>
                    {img.hidden && (
                      <div className="bg-red-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-red-200 border border-red-500/50 flex items-center gap-1">
                        <Trash2 size={12} /> Piilotettu
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none z-10">
                    <p className="text-white font-medium text-sm line-clamp-3 leading-snug drop-shadow-md">
                      {img.caption || <span className="text-white/30 italic">Ei kuvatekstiä...</span>}
                    </p>
                  </div>

                  {isAdminMode && (
                    <div className="absolute top-3 right-3 flex flex-col gap-2 z-50">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditCaptionText(img.caption || ''); 
                          setEditingImage(img); 
                        }}
                        className="p-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white shadow-xl border-2 border-amber-400 transition-all"
                        title="Muokkaa kuvatekstiä"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRotate(img.id); }}
                        className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl border-2 border-blue-400 transition-all"
                        title="Käännä kuvaa"
                      >
                        <RotateCw size={18} />
                      </button>
                      {!img.hidden && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleHide(img.id); }}
                          className="p-2.5 rounded-full bg-gray-700 hover:bg-gray-600 text-white shadow-xl border-2 border-gray-500 transition-all"
                          title="Piilota kuva (Poista näkyvistä)"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Admin Kuvatekstin muokkaus Modal ── */}
      <AnimatePresence>
        {editingImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 50, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.9 }}
              className="bg-rasala-dark border border-white/20 rounded-2xl p-6 w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] relative"
            >
              <button 
                onClick={() => setEditingImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-2xl font-serif text-rasala-gold font-bold mb-4">Muokkaa Kuvatekstiä</h3>
              <p className="text-sm text-white/50 mb-4 font-mono">{editingImage.filename}</p>
              
              <img src={editingImage.path} alt="" className="w-full h-48 object-cover rounded-xl mb-4 border border-white/10" />

              <textarea 
                autoFocus
                value={editCaptionText}
                onChange={(e) => setEditCaptionText(e.target.value)}
                placeholder="Kirjoita tarina tai henkilöiden nimet tähän..."
                className="w-full h-32 bg-black/50 border border-white/20 rounded-xl p-4 text-white placeholder:text-white/30 focus:border-rasala-gold focus:ring-1 focus:ring-rasala-gold outline-none resize-none transition-all"
              />

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setEditingImage(null)} className="px-5 py-2 rounded-xl text-white/60 hover:bg-white/5 font-medium transition-colors">
                  Peruuta
                </button>
                <button onClick={handleSaveCaption} className="btn-gold px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle size={18} /> Valmis
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && lightboxData.length > 0 && (
          <Lightbox
            images={lightboxData}
            startIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
            isAdmin={isAdminMode}
            onRotate={(id) => handleRotate(id)}
            onHide={(id) => {
              handleHide(id);
              setLightboxOpen(false);
            }}
            onSaveCaption={(id, text) => {
              handleUpdate(id, { caption: text });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
