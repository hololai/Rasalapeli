import React, { useState, useEffect, useMemo } from 'react';
import { Lock, Unlock, ZoomIn, Edit3, X, Save, RotateCw, Trash2, CheckCircle, Download, GripHorizontal, Filter, Heart, MapPin, ArrowUp, MonitorPlay } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbox } from '../components/Lightbox';
import { ImageUploader } from '../components/ImageUploader';
import { InfoButton } from '../components/InfoButton';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, writeBatch, doc, updateDoc, increment, getDoc } from 'firebase/firestore';

interface GalleryImage {
  id: string;         // Firestore doc ID (tiedostonimi ilman päätettä)
  path: string;       // URL from Firebase Storage
  decade: string;     
  filename: string;   
  caption: string;    
  rotation: number;
  hidden: boolean;
  orderIndex?: number;
  inPresentation?: boolean;
  presentationOrder?: number;
  createdAt?: any;
  uploaderName?: string;
  uploaderEmail?: string;
  tags?: string;
  views?: number;
  rawDriveUrl?: string;
  locationId?: string;
  locationText?: string;
  year?: string;
}

const DRIVE_LINKS: Record<string, string> = {
  '1910': 'https://drive.google.com/drive/folders/1ZW2_x1sAC-LqaNGrNYpYhBRYjTTNROzy?usp=sharing',
  '1920': 'https://drive.google.com/drive/folders/1iQR5SFksDo_4PNGdrN1E_FrZBHibxR_P?usp=sharing',
  '1930': 'https://drive.google.com/drive/folders/1c49y4PjgRteh_XsL4Re2Biy0AhjWCpRo?usp=sharing',
  '1940': 'https://drive.google.com/drive/folders/1yKIrNmn-jDgQupH0Xo8rbFWhfW-0rkAg?usp=sharing',
  '1950': 'https://drive.google.com/drive/folders/1jsX1LMsezlu8S9hsWdSJSwotCKb-urzq?usp=sharing',
  '1960': 'https://drive.google.com/drive/folders/1wtWPKfdPMSgWCVYho8FOnn8iEjgrZHdD?usp=sharing',
  '1970': 'https://drive.google.com/drive/folders/1W9jn-tuAR1BVfzaSbnT3mY23KUNePGm-?usp=sharing',
  '1980': 'https://drive.google.com/drive/folders/1pcKMOiSyOiNXoW86A2umO9SCJkXzfjcX?usp=sharing',
  '1990': 'https://drive.google.com/drive/folders/1Of_Ru5wzE1vUUWiAzlSYqnbzfIBInd_w?usp=sharing',
  '2000': 'https://drive.google.com/drive/folders/1bM7m6pH9ndtNzPwuZuWziv99TiGc_ZVa?usp=sharing',
  'Järjestämätön': 'https://drive.google.com/drive/folders/1KSs4GwrCunigEx95oHBCwVHB4vilCkvs?usp=sharing',
  'Rasala': 'https://drive.google.com/drive/folders/1NUhKc8Ofwtc0eIJYtEJ6Z2MWcsXkoWJy?usp=sharing',
};

export const Gallery = () => {
  const { profile, toggleFavorite } = useAuth();
  const isAdminUser = profile?.role === 'superadmin' || profile?.role === 'admin';
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Pending changes for bulk save
  const [pendingChanges, setPendingChanges] = useState<Record<string, Partial<GalleryImage>>>({});

  const [selectedDecade, setSelectedDecade] = useState<string>('Etusivu');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'views' | 'favorites'>('default');
  
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    setVisibleCount(24);
  }, [selectedDecade]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [editCaptionText, setEditCaptionText] = useState('');
  const [editLocationId, setEditLocationId] = useState('');
  const [editLocationText, setEditLocationText] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editDecade, setEditDecade] = useState('1970');
  const [editFilename, setEditFilename] = useState('');
  const [editInPresentation, setEditInPresentation] = useState(false);
  const [locations, setLocations] = useState<{id: string, title: string}[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Hae kuvat Firestoresta
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'images'));
      const fetched: GalleryImage[] = [];
      snap.forEach(d => {
        const data = d.data();
        fetched.push({
          id: d.id,
          path: data.url,
          decade: (data.decade || 'Tuntematon').replace('-luku', ''),
          filename: data.filename || d.id,
          caption: data.caption || '',
          rotation: data.rotation || 0,
          hidden: data.hidden || false,
          orderIndex: data.orderIndex || 0,
          tags: data.tags,
          views: data.views,
          rawDriveUrl: data.rawDriveUrl,
          locationId: data.locationId,
          locationText: data.locationText,
          year: data.year,
          inPresentation: data.inPresentation || false,
          presentationOrder: data.presentationOrder,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(0)
        });
      });

      // Fetch Locations for edit modal and metadata
      try {
        const villDoc = await getDoc(doc(db, 'map_locations', 'village'));
        if (villDoc.exists()) setLocations(villDoc.data().locations || []);
      } catch (e) {
        console.error("Lokaatioiden haku epäonnistui", e);
      }

      // Lisätään lokaalit rasala- ja kotitalo-kuvat, jos niitä ei löydy kannasta
      const localKotitaloImages = [
        ...Array.from({length: 16}, (_, i) => ({
          id: `local_kotitalo_${i+1}`,
          path: `/assets/KOTITALO/1973_RASALA_${(i+1).toString().padStart(4, '0')}_a.webp`,
          decade: 'Kotitalo',
          filename: `1973_RASALA_${(i+1).toString().padStart(4, '0')}_a.webp`,
          caption: '',
          rotation: 0,
          hidden: false,
          orderIndex: i,
          createdAt: new Date('1973-01-01')
        })),
        ...Array.from({length: 12}, (_, i) => ({
          id: `local_rasala_${i+1}`,
          path: `/assets/KOTITALO/rasala${i+1}.jpeg`,
          decade: 'Kotitalo',
          filename: `rasala${i+1}.jpeg`,
          caption: '',
          rotation: 0,
          hidden: false,
          orderIndex: 16 + i,
          createdAt: new Date('2024-01-01')
        }))
      ];

      // Varmistetaan, ettei lisätä kahteen kertaan
      localKotitaloImages.forEach(img => {
        if (!fetched.find(f => f.id === img.id)) {
          fetched.push(img);
        }
      });

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

  const handleSaveEdit = () => {
    if (!editingImage) return;

    let finalLocationId = editLocationId;
    if (!finalLocationId && editLocationText) {
      const match = locations.find(loc => loc.title.toLowerCase() === editLocationText.toLowerCase().trim());
      if (match) finalLocationId = match.id;
    }

    const updates = { 
      caption: editCaptionText,
      locationId: finalLocationId || undefined,
      locationText: editLocationText || undefined,
      year: editYear || undefined,
      decade: editDecade,
      filename: editFilename,
      inPresentation: editInPresentation
    };
    
    // Päivitetään tila ja välitön tallennus erikseen
    handleUpdate(editingImage.id, updates);
    setEditingImage(null);
    
    // Välitön tallennus muokkausikkunasta poistuttaessa (käyttäjä olettaa napin tallentavan lopullisesti)
    setTimeout(() => {
      // simulate clicking the save button to flush pending changes
      const btn = document.getElementById('floating-save-btn');
      if (btn) btn.click();
    }, 100);
  };

  const autoLinkLocations = () => {
    if (!window.confirm("Yhdistetäänkö kaikki kuvat vapaiden paikkakuntatekstien perusteella olemassa oleviin nastoihin?")) return;
    
    let linkedCount = 0;
    images.forEach(img => {
      if (img.locationText && !img.locationId) {
        const match = locations.find(loc => loc.title.toLowerCase() === img.locationText!.toLowerCase().trim());
        if (match) {
          handleUpdate(img.id, { locationId: match.id });
          linkedCount++;
        }
      }
    });
    alert(`Löydettiin ${linkedCount} yhdistettävää kuvaa. Muista painaa "Tallenna tietokantaan" kun olet valmis!`);
  };

  const handleRotate = (id: string) => {
    const img = getEffectiveImage(images.find(i => i.id === id)!);
    handleUpdate(id, { rotation: ((img.rotation || 0) + 90) % 360 });
  };

  const handleHide = (id: string) => {
    handleUpdate(id, { hidden: true });
  };

  const togglePresentation = (img: GalleryImage) => {
    handleUpdate(img.id, { inPresentation: !img.inPresentation });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    // Kopioidaan näkyvä lista
    const newItems = Array.from(displayImages);
    const [reorderedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, reorderedItem);

    if (selectedDecade === 'Kuvaesitys') {
      newItems.forEach((item, index) => {
        if (item.presentationOrder !== index) {
          handleUpdate(item.id, { presentationOrder: index });
        }
      });
    } else {
      newItems.forEach((item, index) => {
        if (item.orderIndex !== index) {
          handleUpdate(item.id, { orderIndex: index });
        }
      });
    }
  };

  const saveAllChangesToDB = async () => {
    const changesCount = Object.keys(pendingChanges).length;
    if (changesCount === 0) return;

    try {
      setIsSaving(true);
      const batch = writeBatch(db);
      
      Object.keys(pendingChanges).forEach(id => {
        const ref = doc(db, 'images', id);
        const originalImg = images.find(i => i.id === id);
        
        // Kopioidaan päivitykset ja siivotaan undefined-arvot pois
        const updates: any = { ...pendingChanges[id] };
        Object.keys(updates).forEach(key => {
          if (updates[key] === undefined) {
            updates[key] = null;
          }
        });

        // Varmistetaan, että ainakin perustiedot menevät perille jos dokumenttia ei vielä ollut olemassa
        const finalData = originalImg ? {
          decade: originalImg.decade,
          filename: originalImg.filename,
          url: originalImg.path, // Huom: Firestore tallentaa pathin url-kenttään
          ...updates
        } : updates;

        // Käytetään set({merge: true}) update:n sijaan. Tämä luo dokumentin jos se puuttuu!
        batch.set(ref, finalData, { merge: true });
      });

      await batch.commit();
      
      // Update local state directly to avoid re-fetch if possible
      setImages(prev => prev.map(img => {
        if (pendingChanges[img.id]) return { ...img, ...pendingChanges[img.id] };
        return img;
      }));
      setPendingChanges({});
    } catch (e) {
      console.error(e);
      alert("Virhe tallennuksessa!");
    } finally {
      setIsSaving(false);
    }
  };

  const displayImages = useMemo(() => {
    let list = images.map(getEffectiveImage);
    
    if (!isAdminMode) {
      list = list.filter(img => !img.hidden);
    }

    if (selectedDecade === 'Kuvaesitys') {
      list = list.filter(img => img.inPresentation);
    } else if (selectedDecade === 'Etusivu') {
      const newest10 = [...list].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)).slice(0, 10);
      const newestIds = new Set(newest10.map(img => img.id));
      
      const presentationImgs = list
        .filter(img => img.inPresentation && !newestIds.has(img.id))
        .sort((a, b) => {
           const aOrder = a.presentationOrder ?? 9999;
           const bOrder = b.presentationOrder ?? 9999;
           if (aOrder !== bOrder) return aOrder - bOrder;
           return a.decade.localeCompare(b.decade) || a.id.localeCompare(b.id);
        });
      
      list = [...newest10, ...presentationImgs];
    } else if (selectedDecade !== 'Kaikki') {
      list = list.filter(img => img.decade === selectedDecade);
    }
    
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      list = list.filter(img => 
        (img.caption && img.caption.toLowerCase().includes(q)) ||
        (img.filename && img.filename.toLowerCase().includes(q)) ||
        (img.tags && img.tags.toLowerCase().includes(q)) ||
        (img.uploaderName && img.uploaderName.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'favorites' && profile?.favorites) {
      list = list.filter(img => profile.favorites?.includes(img.id));
    }

    if (selectedDecade === 'Etusivu' && sortBy === 'default') {
      return list;
    }

    return list.sort((a, b) => {
      if (selectedDecade === 'Kuvaesitys' && sortBy === 'default') {
        const aOrder = a.presentationOrder ?? 9999;
        const bOrder = b.presentationOrder ?? 9999;
        if (aOrder !== bOrder) return aOrder - bOrder;
      }

      if (sortBy === 'views') {
        const aViews = a.views || 0;
        const bViews = b.views || 0;
        if (bViews !== aViews) return bViews - aViews; // Eniten katsotut ensin
      }
      
      const aOrder = a.orderIndex !== undefined ? a.orderIndex : 0;
      const bOrder = b.orderIndex !== undefined ? b.orderIndex : 0;
      if (aOrder !== bOrder) {
        return aOrder - bOrder; // Pienin (negatiivisin = uusin lataus) ensin
      }

      const decadeDiff = a.decade.localeCompare(b.decade);
      if (decadeDiff !== 0) return decadeDiff;
      
      return a.id.localeCompare(b.id);
    });
  }, [images, pendingChanges, selectedDecade, isAdminMode, searchQuery, sortBy]);

  const decades = useMemo(() => {
    const allVisible = images.map(getEffectiveImage).filter(img => isAdminMode || !img.hidden);
    const decs = Array.from(new Set(allVisible.map(img => img.decade))).sort();
    return ['Etusivu', 'Kuvaesitys', 'Kaikki', ...decs];
  }, [images, pendingChanges, isAdminMode]);

  useEffect(() => {
    if (selectedDecade !== 'Etusivu' && selectedDecade !== 'Kuvaesitys' && selectedDecade !== 'Kaikki' && !decades.includes(selectedDecade)) {
      setSelectedDecade('Etusivu');
    }
  }, [decades, selectedDecade]);

  const lightboxData = displayImages.map((img) => ({
    id: img.id,
    src: img.path,
    title: img.decade,
    year: img.year,
    description: img.caption || (isAdminMode ? img.filename : ''),
    rotation: img.rotation || 0,
    uploaderName: img.uploaderName,
    uploaderEmail: img.uploaderEmail,
    views: img.views || 0,
    // img-objektissa pitää olla rawDriveUrl jos se tallennettiin kannasta!
    // Lisätään se myös GalleryImage-interfaceen.
  }));

  const visibleImages = displayImages.slice(0, visibleCount);

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
            className="fixed bottom-24 sm:bottom-10 left-1/2 -translate-x-1/2 z-[150] flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 w-[90vw] sm:w-auto max-w-[400px] sm:max-w-none text-center bg-amber-600 border-2 border-amber-400 p-3 sm:p-4 rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.3)] backdrop-blur-md"
          >
            <span className="font-bold text-sm sm:text-base leading-tight">
              {pendingCount} {pendingCount === 1 ? 'muutos odottaa' : 'muutosta odottaa'}
            </span>
            <button 
              id="floating-save-btn"
              onClick={saveAllChangesToDB}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 px-4 sm:px-5 py-2 rounded-xl text-sm sm:text-base font-bold transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isSaving ? 'Tallennetaan...' : <><Save size={18} /> Tallenna <span className="hidden sm:inline">tietokantaan</span></>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto w-full">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold gold-shimmer text-center sm:text-left drop-shadow-md">
              Valokuvat
            </h1>
            <InfoButton 
              title="Gallerian ohjeet"
              instructions={[
                "Täällä voit selata sukumme ja kotikylämme valokuvia.",
                "Käytä yläreunan painikkeita suodattaaksesi kuvia vuosikymmenen mukaan, tai hae vapaalla tekstillä (esim. henkilön nimellä).",
                "Voit muuttaa järjestystä katsotuimpiin valitsemalla lajittelun oikealta.",
                "Klikkaa mitä tahansa kuvaa nähdäksesi sen suurempana. Suurennetussa näkymässä voit lukea kuvan tarinan, nähdä kuka sen on lisännyt, ja osallistua keskusteluun jättämällä kommentin!"
              ]}
            />
          </div>
          
          <div className="flex items-center gap-3">
            {isAdminUser && (
              <>
                {isAdminMode && locations.length > 0 && (
                   <button onClick={autoLinkLocations} className="flex items-center gap-2 px-4 py-2 bg-blue-600/50 hover:bg-blue-500 rounded-xl transition-all shadow-lg text-sm font-bold border border-blue-400">
                     <MapPin size={18} /> Yhdistä Sijainnit
                   </button>
                )}
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

        {/* ── Ylätyökalut ── */}
        <div className="mb-10">
          {/* ── Vuosikymmen-valikko (Pillerit) ── */}
          <div className="flex overflow-x-auto sm:flex-wrap gap-3 mb-6 pb-4 border-b border-white/10 py-1 px-1 -mx-4 sm:mx-0 sm:px-0 snap-x">
          {decades.map(dec => (
            <button
              key={dec}
              onClick={() => setSelectedDecade(dec)}
              className={`whitespace-nowrap snap-center px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-md border ${
                selectedDecade === dec 
                  ? 'bg-rasala-gold text-black border-rasala-gold scale-105' 
                  : 'bg-black/40 text-white/70 border-white/10 hover:border-white/30 hover:bg-white/10 backdrop-blur-sm'
              }`}
            >
              {dec === 'Kaikki' ? 'Kaikki kuvat' : dec === 'Kotitalo' ? 'Kotitalo' : dec === 'Etusivu' ? 'Etusivu' : dec === 'Kuvaesitys' ? 'Kuvaesitys' : `${dec}-luku`}
            </button>
          ))}
          </div>

          {/* ── Haku ja Lajittelu ── */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between bg-black/30 p-4 rounded-2xl border border-white/5">
          <input
            type="text"
            placeholder="Hae kuvista, esim. 'Juhannus 1974' tai 'Anna'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/20 rounded-xl pl-10 pr-10 py-2.5 text-base text-white focus:outline-none focus:border-rasala-gold transition-colors"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-white/50 whitespace-nowrap">Lajittele:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'default' | 'views' | 'favorites')}
              className="bg-black/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-rasala-gold transition-colors w-full sm:w-auto"
            >
              <option value="default">Viimeksi ladatut</option>
              <option value="views">Katsotuimmat ensin</option>
              {profile && <option value="favorites">Omat suosikit</option>}
            </select>
          </div>
        </div>

        {/* ── Alkuperäisten kuvien latauslinkki (Google Drive) ── */}
        {selectedDecade !== 'Kaikki' && DRIVE_LINKS[selectedDecade] && (
          <div className="mb-10 flex justify-center sm:justify-start">
            <a 
              href={DRIVE_LINKS[selectedDecade]} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600 transition-colors shadow-lg group"
            >
              <Download className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
              <span className="text-stone-200 font-medium text-sm sm:text-base">
                Lataa {selectedDecade}n alkuperäiset kuvat (Google Drive)
              </span>
            </a>
          </div>
        )}
        </div>

        {/* ── Palaa ylös -kelluva nappi ── */}
        <AnimatePresence>
          {showScrollTop && !editingImage && !lightboxOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-[90px] sm:bottom-10 left-1/2 -translate-x-1/2 sm:left-auto sm:right-10 z-40"
            >
              <button 
                onClick={scrollToTop}
                className="bg-rasala-gold text-amber-950 p-3 sm:p-4 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-yellow-200"
                title="Palaa ylös"
              >
                <ArrowUp size={24} className="sm:w-8 sm:h-8" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
        ) : isAdminMode ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="gallery">
              {(provided) => (
                <div 
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {visibleImages.map((img, index) => (
                    <Draggable key={img.id} draggableId={img.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`relative group rounded-2xl overflow-hidden bg-black/50 border shadow-cinema aspect-[4/3] ${img.hidden ? 'border-red-500/50 opacity-60' : 'border-white/10'} ${snapshot.isDragging ? 'z-50 shadow-2xl scale-105 opacity-100 border-amber-500' : ''}`}
                        >
                          <img 
                            src={img.path} 
                            alt={img.filename} 
                            className="w-full h-full object-cover transition-transform duration-700 cursor-zoom-in"
                            style={{ transform: `scale(1.05) rotate(${img.rotation}deg)` }}
                            onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}
                            loading="lazy"
                          />
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none opacity-80" />

                          {/* Tarttumakahva raahaamista varten */}
                          {isAdminMode && (
                            <div 
                              {...provided.dragHandleProps} 
                              className="absolute top-2 left-2 p-2 bg-black/60 hover:bg-amber-600 text-white rounded-lg cursor-grab active:cursor-grabbing backdrop-blur-md transition-colors touch-none select-none z-10"
                              title="Raahaa kuvaa muuttaaksesi järjestystä"
                            >
                              <GripHorizontal size={20} />
                            </div>
                          )}

                          {profile && (
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(img.id); }}
                              className={`absolute top-2 ${isAdminMode ? 'left-12' : 'left-2'} p-2 rounded-full backdrop-blur-md transition-colors z-10 ${profile.favorites?.includes(img.id) ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-black/60 text-white/70 hover:text-white hover:bg-black/80'}`}
                              title={profile.favorites?.includes(img.id) ? "Poista suosikeista" : "Lisää suosikkeihin"}
                            >
                              <Heart size={20} fill={profile.favorites?.includes(img.id) ? "currentColor" : "none"} className={profile.favorites?.includes(img.id) ? "scale-110 transition-transform" : "transition-transform hover:scale-110"} />
                            </button>
                          )}

                          <div className="absolute top-2 right-2 flex gap-1 pointer-events-auto">
                            {isAdminMode && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); togglePresentation(img); }} 
                                className={`p-3.5 rounded-full backdrop-blur-sm transition-colors ${img.inPresentation ? 'bg-rasala-gold/90 text-amber-900 hover:bg-rasala-gold' : 'bg-black/50 text-white hover:bg-rasala-gold/50'}`}
                                title={img.inPresentation ? "Poista esityksestä" : "Lisää esitykseen"}
                              >
                                <MonitorPlay size={16} />
                              </button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); handleRotate(img.id); }} className="p-3.5 bg-black/50 hover:bg-amber-600/80 rounded-full text-white backdrop-blur-sm transition-colors" title="Käännä">
                              <RotateCw size={16} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setEditingImage(img); setEditCaptionText(img.caption || ''); setEditLocationId(img.locationId || ''); setEditLocationText(img.locationText || ''); setEditYear(img.year || ''); setEditDecade(img.decade || '1970'); setEditFilename(img.filename || ''); setEditInPresentation(img.inPresentation || false); }} className="p-3.5 bg-black/50 hover:bg-amber-600/80 rounded-full text-white backdrop-blur-sm transition-colors" title="Muokkaa kuvatekstiä">
                              <Edit3 size={16} />
                            </button>
                            {img.hidden ? (
                              <div className="p-3.5 bg-red-500/80 rounded-full text-white backdrop-blur-sm" title="Piilotettu vieraiden näkyviltä">
                                <Lock size={16} />
                              </div>
                            ) : (
                              <button onClick={(e) => { e.stopPropagation(); handleHide(img.id); }} className="p-3.5 bg-black/50 hover:bg-red-500/80 rounded-full text-white backdrop-blur-sm transition-colors" title="Piilota vierailta">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                            <p className="text-white/90 text-sm font-medium drop-shadow-md mb-1">{img.caption || "Ei kuvatekstiä"}</p>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-rasala-gold font-bold bg-black/50 px-2 py-0.5 rounded-full">{img.decade}</span>
                              {isAdminMode && <span className="text-white/50">{img.filename}</span>}
                            </div>
                          </div>

                          {pendingChanges[img.id] && (
                            <div className="absolute inset-0 border-2 border-amber-500 rounded-2xl pointer-events-none animate-pulse"></div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {visibleImages.map((img, index) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className={`relative group rounded-2xl overflow-hidden bg-black/50 border shadow-cinema aspect-[4/3] ${
                    img.hidden ? 'border-red-500/50 opacity-60' : 
                    (img.createdAt && (Date.now() - img.createdAt.getTime() < 15 * 60 * 1000)) ? 'border-rasala-gold border-2 shadow-[0_0_15px_rgba(212,175,55,0.6)]' : 'border-white/10'
                  }`}
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
                    {(img.locationText || img.locationId) && (
                      <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-rasala-gold border border-rasala-gold/20 flex items-center gap-1">
                        <MapPin size={12} /> {img.locationText || locations.find(l => l.id === img.locationId)?.title || "Kartalla"}
                      </div>
                    )}
                    {img.hidden && (
                      <div className="bg-red-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-red-200 border border-red-500/50 flex items-center gap-1">
                        <Trash2 size={12} /> Piilotettu
                      </div>
                    )}
                    {img.createdAt && (Date.now() - img.createdAt.getTime() < 15 * 60 * 1000) && (
                      <div className="bg-rasala-gold backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-amber-900 shadow-lg border border-yellow-200 animate-pulse">
                        UUSI
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none z-10">
                    <p className="text-white font-medium text-sm line-clamp-3 leading-snug drop-shadow-md">
                      {img.caption || <span className="text-white/30 italic">Ei kuvatekstiä...</span>}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Näytä lisää -painike ── */}
        {!loading && displayImages.length > visibleCount && (
          <div className="flex justify-center mt-12 mb-8">
            <button 
              onClick={() => setVisibleCount(c => c + 24)} 
              className="px-8 py-3 bg-amber-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:bg-amber-500 active:scale-95 transition-all"
            >
              Lataa lisää kuvia ({displayImages.length - visibleCount} jäljellä)
            </button>
          </div>
        )}
      </div>

      {/* ── Admin Kuvatekstin muokkaus Modal ── */}
      <AnimatePresence>
        {editingImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 50, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.9 }}
              className="bg-rasala-dark border border-white/20 rounded-2xl p-4 sm:p-6 w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] relative max-h-[75dvh] sm:max-h-[90vh] overflow-y-auto mb-16 sm:mb-0"
            >
              <button 
                onClick={() => setEditingImage(null)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10"
              >
                <X size={20} />
              </button>
              
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-4 gap-3 pr-8 sm:pr-12">
                <h3 className="text-xl sm:text-2xl font-serif text-rasala-gold font-bold">Muokkaa Tietoja</h3>
                <button 
                  onClick={() => setEditInPresentation(!editInPresentation)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${editInPresentation ? 'bg-rasala-gold/90 text-amber-900 border-rasala-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-black/50 text-white/50 border-white/20 hover:text-white hover:border-white/40'}`}
                  title="Lisää tai poista yhteisestä esityksestä"
                >
                  <MonitorPlay size={14} />
                  {editInPresentation ? 'Esityksessä' : 'Esitykseen'}
                </button>
              </div>
              
              <div className="mb-3 sm:mb-4">
                <label className="block text-[10px] sm:text-xs uppercase tracking-widest text-white/50 mb-1">Tiedostonimi / Kuvan nimi</label>
                <input 
                  type="text"
                  value={editFilename}
                  onChange={(e) => setEditFilename(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-3 sm:px-4 py-2 text-sm text-white focus:border-rasala-gold outline-none font-mono"
                />
              </div>
              
              <img src={editingImage.path} alt="" className="w-full h-32 sm:h-48 object-cover rounded-xl mb-3 sm:mb-4 border border-white/10" />

              <textarea 
                autoFocus
                value={editCaptionText}
                onChange={(e) => setEditCaptionText(e.target.value)}
                placeholder="Kirjoita tarina tai henkilöiden nimet tähän..."
                className="w-full h-24 sm:h-32 bg-black/50 border border-white/20 rounded-xl p-3 sm:p-4 text-sm sm:text-base text-white placeholder:text-white/30 focus:border-rasala-gold focus:ring-1 focus:ring-rasala-gold outline-none resize-none transition-all"
              />

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] sm:text-xs uppercase tracking-widest text-white/50 mb-1">Vuosi (Valinnainen)</label>
                  <input 
                    type="number" 
                    value={editYear} 
                    onChange={(e) => setEditYear(e.target.value)}
                    placeholder="Esim. 1974"
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:border-rasala-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs uppercase tracking-widest text-white/50 mb-1">Vuosikymmen</label>
                  <select 
                    value={editDecade} 
                    onChange={(e) => setEditDecade(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:border-rasala-gold outline-none"
                  >
                    <option value="Kotitalo">Kotitalo</option>
                    <option value="1920">1920-luku</option>
                    <option value="1930">1930-luku</option>
                    <option value="1940">1940-luku</option>
                    <option value="1950">1950-luku</option>
                    <option value="1960">1960-luku</option>
                    <option value="1970">1970-luku</option>
                    <option value="1980">1980-luku</option>
                    <option value="1990">1990-luku</option>
                    <option value="2000">2000-luku</option>
                    <option value="2010">2010-luku</option>
                    <option value="2020">2020-luku</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs uppercase tracking-widest text-white/50 mb-1">Sijainti kartalla</label>
                  <select 
                    value={editLocationId} 
                    onChange={(e) => setEditLocationId(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:border-rasala-gold outline-none"
                  >
                    <option value="">-- Ei nastaa --</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs uppercase tracking-widest text-white/50 mb-1">Vapaa paikkakunta</label>
                  <input 
                    type="text"
                    value={editLocationText}
                    onChange={(e) => setEditLocationText(e.target.value)}
                    placeholder="Esim. Ranua"
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:border-rasala-gold outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex justify-end gap-3 pb-2 sm:pb-0">
                <button onClick={() => setEditingImage(null)} className="px-5 py-2 rounded-xl text-white/60 hover:bg-white/5 font-medium transition-colors">
                  Peruuta
                </button>
                <button onClick={handleSaveEdit} className="btn-gold px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle size={18} /> Tallenna
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
            isAdmin={isAdminMode}
            onRotate={handleRotate}
            onHide={handleHide}
            onSaveCaption={(id, text) => handleUpdate(id, { caption: text })}
            onView={(id) => {
              // Yritetään päivittää katselukerta taustalla suoraan Firestoreen (jos säännöt sallivat)
              updateDoc(doc(db, 'images', id), { views: increment(1) }).catch(() => {});
              
              // Päivitetään myös paikallinen tila, jotta lajittelu yms. toimii heti, 
              // mutta EI lisätä pendingChangesiin, jotta käyttäjää ei vaivata "Tallenna" -napilla.
              setImages(prev => prev.map(img => img.id === id ? { ...img, views: (img.views || 0) + 1 } : img));
            }}
            onIndexChange={(index) => {
              if (index >= visibleCount - 4) {
                setVisibleCount(prev => Math.min(displayImages.length, prev + 24));
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
