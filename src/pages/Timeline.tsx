import React, { useState, useEffect, useMemo } from 'react';
import { Lock, Unlock, ZoomIn, Edit3, X, Save, RotateCw, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbox } from '../components/Lightbox';

// Hae kaikki kuvat public/assets -kansiosta ja sen alikansioista (Vite hoitaa tämän build-aikana)
const rawImages = import.meta.glob('/public/assets/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, query: '?url', import: 'default' });

// Tyyppi kuvalle
interface GalleryImage {
  path: string;       // esim. '/assets/1970/kuva.jpg'
  decade: string;     // esim. '1970'
  filename: string;   // esim. 'kuva.jpg'
  caption: string;    // Käyttäjän syöttämä kuvateksti
}

export const Timeline = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedDecade, setSelectedDecade] = useState<string>('Kaikki');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Kuvatekstit (tallennetaan väliaikaisesti localStorageen ennen Firebasea)
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [rotations, setRotations] = useState<Record<string, number>>({});
  const [hiddenImages, setHiddenImages] = useState<string[]>([]);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [editCaptionText, setEditCaptionText] = useState('');

  // Lataa tallennetut asetukset kerran
  useEffect(() => {
    const savedC = localStorage.getItem('rasala_captions');
    if (savedC) try { setCaptions(JSON.parse(savedC)); } catch(e){}
    
    const savedR = localStorage.getItem('rasala_rotations');
    if (savedR) try { setRotations(JSON.parse(savedR)); } catch(e){}

    const savedH = localStorage.getItem('rasala_hidden_images');
    if (savedH) try { setHiddenImages(JSON.parse(savedH)); } catch(e){}
  }, []);

  // Tallenna kuvateksti
  const handleSaveCaption = () => {
    if (!editingImage) return;
    const newCaptions = { ...captions, [editingImage.path]: editCaptionText };
    setCaptions(newCaptions);
    localStorage.setItem('rasala_captions', JSON.stringify(newCaptions));
    setEditingImage(null);
  };

  const handleRotate = (path: string) => {
    const newRotations = { ...rotations, [path]: ((rotations[path] || 0) + 90) % 360 };
    setRotations(newRotations);
    localStorage.setItem('rasala_rotations', JSON.stringify(newRotations));
  };

  const handleHide = (path: string) => {
    const newHidden = [...hiddenImages, path];
    setHiddenImages(newHidden);
    localStorage.setItem('rasala_hidden_images', JSON.stringify(newHidden));
  };

  // Prosessoi kuvat: suodata kääntöpuolet, KOTITALO ja järjestämättömät pois, ja jäsennä kansio (vuosikymmen)
  const processedImages = useMemo(() => {
    const list: GalleryImage[] = [];
    const uniqueUrls = new Set<string>();
    
    Object.keys(rawImages).forEach(fullPath => {
      const url = rawImages[fullPath] as string;
      
      // Estä tuplat ja poistetut
      if (uniqueUrls.has(url) || hiddenImages.includes(url)) return;
      uniqueUrls.add(url);

      const pathLower = fullPath.toLowerCase();
      
      // Suodattimet
      if (
        pathLower.includes('kääntöpuoli') || 
        pathLower.includes('kaantopuoli') || 
        pathLower.includes('back') ||
        pathLower.includes('jarjestamaton') || 
        pathLower.includes('järjestämätön')
      ) {
        return; // Hylkää kuva
      }

      // Etsi vuosikymmen kansiosta
      const parts = fullPath.split('/');
      let decade = 'Tuntematon';

      if (pathLower.includes('/kotitalo/')) {
        decade = 'Kotitalo';
      } else {
        if (parts.length >= 5) {
          decade = parts[3]; // esim '1970'
        }

        if (!/^\d{4}s?$/.test(decade)) {
          return; // Ei ole vuosikymmenkansio
        }

        decade = decade.replace('s', '');
      }

      list.push({
        path: url,
        decade: decade,
        filename: parts[parts.length - 1],
        caption: captions[url] || '',
      });
    });

    // Järjestä vuosikymmenen mukaan
    return list.sort((a, b) => a.decade.localeCompare(b.decade));
  }, [captions, hiddenImages]);

  // Hae uniikit vuosikymmenet
  const decades = useMemo(() => {
    const decs = Array.from(new Set(processedImages.map(img => img.decade))).sort();
    return ['Kaikki', ...decs];
  }, [processedImages]);

  // Varmista että valittu vuosikymmen on validi (jos vaikka data muuttuu)
  useEffect(() => {
    if (selectedDecade !== 'Kaikki' && !decades.includes(selectedDecade)) {
      setSelectedDecade('Kaikki');
    }
  }, [decades, selectedDecade]);

  // Suodata näytettävät kuvat
  const displayImages = useMemo(() => {
    if (selectedDecade === 'Kaikki') return processedImages;
    return processedImages.filter(img => img.decade === selectedDecade);
  }, [processedImages, selectedDecade]);

  // Muodosta Lightbox-formaatti
  const lightboxData = displayImages.map((img) => ({
    src: img.path,
    title: img.decade,
    description: img.caption || img.filename,
    rotation: rotations[img.path] || 0,
  }));

  return (
    <div className="min-h-screen bg-rasala-dark text-white pt-20 pb-24 px-4 sm:px-6 flex flex-col">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold gold-shimmer text-center sm:text-left drop-shadow-md">
            Aikamatka
          </h1>
          
          <button 
            onClick={() => setIsAdmin(!isAdmin)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all shadow-lg backdrop-blur-md ${isAdmin ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-black/60 border-white/10 text-white/50 hover:text-white/90'}`}
          >
            {isAdmin ? <Unlock size={18} /> : <Lock size={18} />}
            <span className="text-sm font-bold">{isAdmin ? 'Admin (Muokkaustila)' : 'Luku-tila'}</span>
          </button>
        </div>

        <p className="text-white/70 max-w-3xl mb-8 text-lg leading-relaxed">
          Tervetuloa suvun kuvagalleriaan. Kuvat on jaoteltu vuosikymmenittäin. 
          Klikkaa kuvaa suurentaaksesi sen. 
        </p>

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

        {/* ── Kuvagalleria (Masonry/Grid) ── */}
        {displayImages.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <p className="text-xl">Ei kuvia valitulta vuosikymmeneltä.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {displayImages.map((img, index) => (
                <motion.div
                  key={img.path}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="relative group rounded-2xl overflow-hidden bg-black/50 border border-white/10 shadow-cinema aspect-[4/3]"
                >
                  {/* Kuva */}
                  <img 
                    src={img.path} 
                    alt={img.filename} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                    style={{ transform: `scale(1.05) rotate(${rotations[img.path] || 0}deg)` }}
                    onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}
                    loading="lazy"
                  />
                  
                  {/* Gradientti pohjalle luettavuutta varten */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none opacity-80" />

                  {/* Hover icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <ZoomIn size={48} className="text-white drop-shadow-lg opacity-80" />
                  </div>

                  {/* Vuosikymmen badge */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-rasala-gold border border-rasala-gold/20">
                    {img.decade}
                  </div>

                  {/* Kuvateksti (jos on) */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none z-10">
                    <p className="text-white font-medium text-sm line-clamp-3 leading-snug drop-shadow-md">
                      {img.caption || <span className="text-white/30 italic">Ei kuvatekstiä...</span>}
                    </p>
                  </div>

                  {/* Admin Toiminnot */}
                  {isAdmin && (
                    <div className="absolute top-3 right-3 flex flex-col gap-2 z-50">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditCaptionText(img.caption || ''); 
                          setEditingImage(img); 
                        }}
                        className="p-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-xl border-2 border-red-400 transition-all"
                        title="Muokkaa kuvatekstiä"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRotate(img.path); }}
                        className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl border-2 border-blue-400 transition-all"
                        title="Käännä kuvaa"
                      >
                        <RotateCw size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleHide(img.path); }}
                        className="p-2.5 rounded-full bg-gray-700 hover:bg-gray-600 text-white shadow-xl border-2 border-gray-500 transition-all"
                        title="Piilota kuva (Poista näkyvistä)"
                      >
                        <Trash2 size={18} />
                      </button>
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
                  <Save size={18} /> Tallenna
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            images={lightboxData}
            startIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
            isAdmin={isAdmin}
            onRotate={handleRotate}
            onHide={(src) => {
              handleHide(src);
              setLightboxOpen(false); // Sulje lightbox jos poistetaan
            }}
            onSaveCaption={(src, text) => {
              const newCaptions = { ...captions, [src]: text };
              setCaptions(newCaptions);
              localStorage.setItem('rasala_captions', JSON.stringify(newCaptions));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
