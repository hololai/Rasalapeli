import React, { useState, useEffect } from 'react';
import { mapLocationsCollection } from '../data/mockData';
import { ArrowLeft, X, ZoomIn, ZoomOut, Unlock, Lock, Copy, Check, MousePointer2, PlayCircle, ChevronLeft, ChevronRight, MapPin, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbox } from '../components/Lightbox';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Hae Kotitalon kuvat kansiosta dynaamisesti
const kotitaloImagesRaw = import.meta.glob('/public/assets/KOTITALO/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, query: '?url', import: 'default' });
const kotitaloImages = Array.from(new Set(Object.values(kotitaloImagesRaw).map(url => url as string)));

// Hae KAIKKI kuvat pudotusvalikkoa varten (Nastan luonti)
const allImagesRaw = import.meta.glob('/public/assets/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, query: '?url', import: 'default' });
const allImages = Array.from(new Set(Object.values(allImagesRaw).map(url => url as string))).filter(url => !url.toLowerCase().includes('kääntöpuoli') && !url.toLowerCase().includes('kaantopuoli') && !url.toLowerCase().includes('back'));

// Teräväkärkinen SVG-nasta Leafletille
const createPushPinIcon = (color: string) => L.divIcon({
  html: `<svg width="32" height="48" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 6px 6px rgba(0,0,0,0.5)); transform: translate(-12px, -36px);">
          <path d="M12 36L10.5 22H13.5L12 36Z" fill="#a0a0a0" />
          <circle cx="12" cy="12" r="12" fill="${color}" />
          <circle cx="10" cy="8" r="3" fill="white" fillOpacity="0.4" />
        </svg>`,
  className: '',
  iconSize: [0, 0],
});

const defaultIcon = createPushPinIcon('#1c2b1e');
const homeIcon = createPushPinIcon('#d4af37');

const eraLabel: Record<string, string> = {
  historical: 'Historiallinen',
  postwar: 'Jälleenrakennus',
  growth: 'Kasvukausi',
  modern: 'Nykypäivä',
};

const eraColor: Record<string, string> = {
  historical: 'text-amber-400',
  postwar:    'text-gray-400',
  growth:     'text-orange-400',
  modern:     'text-green-400',
};

const eraBorder: Record<string, string> = {
  historical: 'border-amber-500/30',
  postwar:    'border-gray-500/30',
  growth:     'border-orange-500/30',
  modern:     'border-green-500/30',
};

// Lentokontrolleri Leafletille
function MapFlyTo({ center, zoom, isGuided }: { center: [number, number]; zoom: number; isGuided: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (isGuided) {
      map.flyTo(center, zoom, { duration: 2.5, easeLinearity: 0.25 });
    }
  }, [center, zoom, map, isGuided]);
  return null;
}

// Click-listener Leaflet-kartalle admin-tilassa
function MapClickHandler({ isAdmin, onMapClick }: { isAdmin: boolean, onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (isAdmin) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Yksittäinen nasta Pihakartassa (Image Map)
const ImagePin = ({ loc, onClick, isAdmin, onLocationUpdate }: any) => {
  const [copied, setCopied] = useState(false);
  const handleDragEnd = (event: any, info: any) => {
    const container = document.getElementById('yard-map-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const relativeX = info.point.x - rect.left;
    const relativeY = info.point.y - rect.top;
    const percentX = Math.max(0, Math.min(100, Number(((relativeX / rect.width) * 100).toFixed(2))));
    const percentY = Math.max(0, Math.min(100, Number(((relativeY / rect.height) * 100).toFixed(2))));
    onLocationUpdate(loc.id, percentX, percentY);
  };
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`x: ${loc.x}, y: ${loc.y}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="absolute flex flex-col items-center group z-10"
      style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
      drag={isAdmin}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={{ x: '-50%', y: '-100%' }}
      whileDrag={{ scale: 1.2, zIndex: 50 }}
    >
      <div 
        className={`relative flex items-center justify-center transition-transform duration-200 ${!isAdmin && 'cursor-pointer group-hover:scale-110'}`}
        onClick={!isAdmin ? onClick : undefined}
        dangerouslySetInnerHTML={{ __html: createPushPinIcon('#d4af37').options.html || '' }}
      />
      {!isAdmin && <span className="pin-label group-hover:opacity-100 absolute top-full mt-1 text-white bg-black/80 px-2 py-0.5 rounded">{loc.title}</span>}
      {isAdmin && (
        <div className="absolute bottom-full mb-2 bg-black/80 backdrop-blur-md border border-rasala-gold/30 rounded-lg p-2 text-xs flex flex-col items-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
          <span className="font-bold text-rasala-gold mb-1">{loc.title}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-white/70 bg-black/50 px-1.5 py-0.5 rounded">x: {loc.x}, y: {loc.y}</span>
            <button onClick={handleCopy} className="p-1 hover:text-rasala-gold text-white/50">{copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}</button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const MapView = () => {
  const [view, setView] = useState<'village' | 'yard'>('village');
  const [mode, setMode] = useState<'free' | 'guided'>('free');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPin, setSelectedPin] = useState<any | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mapFocus, setMapFocus] = useState(true);
  
  // Data state
  const initialVillageLocations = mapLocationsCollection.village as any[];
  const initialYardLocations = mapLocationsCollection.yard as any[];
  const [villageLocations, setVillageLocations] = useState(initialVillageLocations);
  const [yardLocations, setYardLocations] = useState(initialYardLocations);

  const [rotations, setRotations] = useState<Record<string, number>>({});
  const [hiddenImages, setHiddenImages] = useState<string[]>([]);
  const [captions, setCaptions] = useState<Record<string, string>>({});

  // Nastojen muokkaus -state
  const [pinEditorOpen, setPinEditorOpen] = useState(false);
  const [editingPin, setEditingPin] = useState<any | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', era: 'growth', image: '' });

  useEffect(() => {
    const savedH = localStorage.getItem('rasala_hidden_images');
    if (savedH) try { const p = JSON.parse(savedH); if (p) setHiddenImages(p); } catch(e){}

    const savedR = localStorage.getItem('rasala_rotations');
    if (savedR) try { const p = JSON.parse(savedR); if (p) setRotations(p); } catch(e){}

    const savedC = localStorage.getItem('rasala_captions');
    if (savedC) try { const p = JSON.parse(savedC); if (p) setCaptions(p); } catch(e){}

    const savedV = localStorage.getItem('rasala_village_locations');
    if (savedV) try { const p = JSON.parse(savedV); if (p) setVillageLocations(p); } catch(e){}

    const savedY = localStorage.getItem('rasala_yard_locations');
    if (savedY) try { const p = JSON.parse(savedY); if (p) setYardLocations(p); } catch(e){}
  }, []);

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

  const handleSaveCaption = (path: string, text: string) => {
    const newCaptions = { ...captions, [path]: text };
    setCaptions(newCaptions);
    localStorage.setItem('rasala_captions', JSON.stringify(newCaptions));
  };

  const activeLocations = view === 'village' ? villageLocations : yardLocations;
  const currentGuidedTarget = activeLocations[currentIndex];
  const era = currentGuidedTarget?.era || 'growth';

  // Tournee-animaation focus-logiikka
  useEffect(() => {
    if (mode === 'guided') {
      setMapFocus(true);
      const timer = setTimeout(() => {
        setMapFocus(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, mode]);

  // Admin updates
  const handleVillageUpdate = (id: string, lat: number, lng: number) => {
    const newLocs = villageLocations.map(loc => loc.id === id ? { ...loc, lat, lng } : loc);
    setVillageLocations(newLocs);
    localStorage.setItem('rasala_village_locations', JSON.stringify(newLocs));
  };
  const handleYardUpdate = (id: string, x: number, y: number) => {
    const newLocs = yardLocations.map(loc => loc.id === id ? { ...loc, x, y } : loc);
    setYardLocations(newLocs);
    localStorage.setItem('rasala_yard_locations', JSON.stringify(newLocs));
  };

  const handlePinClick = (loc: any) => {
    if (isAdmin && mode === 'free') {
      setEditingPin({ ...loc, view: view });
      setFormData({ title: loc.title, description: loc.description || '', era: loc.era || 'growth', image: loc.image || '' });
      setPinEditorOpen(true);
      return;
    }
    if (mode === 'free') {
      setSelectedPin(loc);
    }
  };

  const handleYardMapClick = (e: React.MouseEvent) => {
    if (!isAdmin || mode !== 'free') return;
    const container = document.getElementById('yard-map-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;
    const percentX = Math.max(0, Math.min(100, Number(((relativeX / rect.width) * 100).toFixed(2))));
    const percentY = Math.max(0, Math.min(100, Number(((relativeY / rect.height) * 100).toFixed(2))));
    
    setEditingPin({ id: `yard_custom_${Date.now()}`, x: percentX, y: percentY, isCustom: true, view: 'yard' });
    setFormData({ title: '', description: '', era: 'growth', image: '' });
    setPinEditorOpen(true);
  };

  const savePin = () => {
    if (!editingPin) return;
    const isNew = editingPin.isCustom;
    const pinData = { ...editingPin, ...formData, isCustom: false };

    if (editingPin.view === 'village') {
      let newLocs = [...villageLocations];
      if (isNew) newLocs.push(pinData);
      else newLocs = newLocs.map(loc => loc.id === pinData.id ? pinData : loc);
      setVillageLocations(newLocs);
      localStorage.setItem('rasala_village_locations', JSON.stringify(newLocs));
    } else {
      let newLocs = [...yardLocations];
      if (isNew) newLocs.push(pinData);
      else newLocs = newLocs.map(loc => loc.id === pinData.id ? pinData : loc);
      setYardLocations(newLocs);
      localStorage.setItem('rasala_yard_locations', JSON.stringify(newLocs));
    }
    setPinEditorOpen(false);
    setEditingPin(null);
  };

  const deletePin = () => {
    if (!editingPin || editingPin.isCustom) {
      setPinEditorOpen(false);
      return;
    }
    if (window.confirm(`Haluatko varmasti poistaa nastan "${editingPin.title}"?`)) {
      if (editingPin.view === 'village') {
        const newLocs = villageLocations.filter(loc => loc.id !== editingPin.id);
        setVillageLocations(newLocs);
        localStorage.setItem('rasala_village_locations', JSON.stringify(newLocs));
      } else {
        const newLocs = yardLocations.filter(loc => loc.id !== editingPin.id);
        setYardLocations(newLocs);
        localStorage.setItem('rasala_yard_locations', JSON.stringify(newLocs));
      }
      setPinEditorOpen(false);
      setEditingPin(null);
    }
  };

  const activeTarget = mode === 'guided' ? currentGuidedTarget : selectedPin;

  const isKotitontti = activeTarget?.id === 'kotitontti';
  
  // Suodata pois piilotetut kuvat
  const visibleKotitaloImages = kotitaloImages.filter(src => !hiddenImages.includes(src));
  const hasKotitaloImages = visibleKotitaloImages.length > 0;

  const lightboxImages = isKotitontti && hasKotitaloImages 
    ? visibleKotitaloImages.map((src, idx) => ({
        src,
        title: `${activeTarget.title} (${idx + 1}/${visibleKotitaloImages.length})`,
        description: captions[src] || activeTarget.description,
        rotation: rotations[src] || 0,
      }))
    : activeTarget ? [{
        src: activeTarget.image || `https://placehold.co/1200x800/1c2b1e/d4af37?text=${encodeURIComponent(activeTarget.title)}`,
        title: activeTarget.title,
        description: activeTarget.description,
        rotation: activeTarget.image ? (rotations[activeTarget.image] || 0) : 0,
      }] : [];

  return (
    <div className="relative min-h-screen bg-rasala-dark text-white pb-24 sm:pt-16 flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="relative z-20 flex flex-col sm:flex-row sm:items-center justify-between px-4 pt-5 pb-4 max-w-5xl mx-auto w-full gap-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3">
          {view === 'yard' && (
            <button onClick={() => { setView('village'); setSelectedPin(null); }} className="p-2 rounded-xl bg-black/60 hover:bg-rasala-gold/20 border border-white/10 backdrop-blur-md transition-all shadow-lg">
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="font-serif text-2xl sm:text-3xl font-bold flex items-center gap-3">
            {view === 'village' ? 'Rasala-Tournee' : 'Pihakartta'}
            {isAdmin && <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full uppercase">Admin</span>}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Tilanvaihdin */}
          <div className="flex bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 p-1 shadow-lg">
            <button
              onClick={() => { setMode('free'); setSelectedPin(null); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === 'free' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/80'}`}
            >
              <MousePointer2 size={16} /> Vapaa selailu
            </button>
            <button
              onClick={() => { setMode('guided'); setCurrentIndex(0); setSelectedPin(null); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === 'guided' ? 'bg-rasala-gold/20 text-rasala-gold' : 'text-white/40 hover:text-white/80'}`}
            >
              <PlayCircle size={16} /> Tournee
            </button>
          </div>

          <button onClick={() => setIsAdmin(!isAdmin)} className={`p-2.5 rounded-xl border transition-all backdrop-blur-xl shadow-lg ${isAdmin ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-black/60 border-white/10 text-white/30 hover:text-white/80'}`}>
            {isAdmin ? <Unlock size={18} /> : <Lock size={18} />}
          </button>
        </div>
      </div>

      {/* ── Taustakartta (Vain Tournee-tilassa tai Free-tilassa ilman korttia se on tausta) ── */}
      <div 
        className={`absolute inset-0 z-0 transition-all duration-1000 ${mode === 'guided' && mapFocus ? 'opacity-100' : 'opacity-50'} ${view === 'village' ? `era-${era}` : ''}`}
        style={{ pointerEvents: mode === 'free' && !selectedPin ? 'auto' : 'none' }}
      >
        <AnimatePresence mode="wait">
          
          {/* VILLAGE (Leaflet) */}
          {view === 'village' && (
            <motion.div
              key="village"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`relative w-full h-full ${isAdmin && mode === 'free' ? 'border-2 border-red-500/50' : ''}`}
            >
              <MapContainer 
                center={mode === 'guided' ? [currentGuidedTarget.lat, currentGuidedTarget.lng] : [61.0515, 28.3150]} 
                zoom={14} 
                zoomControl={mode === 'free'}
                dragging={mode === 'free'}
                scrollWheelZoom={mode === 'free'}
                doubleClickZoom={mode === 'free'}
                style={{ height: '100%', width: '100%', backgroundColor: '#0e1a10' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <MapClickHandler isAdmin={isAdmin} onMapClick={(lat, lng) => {
                  if (mode !== 'free') return;
                  setEditingPin({ id: `village_custom_${Date.now()}`, lat, lng, isCustom: true, view: 'village' });
                  setFormData({ title: '', description: '', era: 'growth', image: '' });
                  setPinEditorOpen(true);
                }} />
                <MapFlyTo 
                  center={mode === 'guided' ? [currentGuidedTarget.lat, currentGuidedTarget.lng] : [61.0515, 28.3150]} 
                  zoom={15} 
                  isGuided={mode === 'guided'} 
                />
                
                {villageLocations.map(loc => (
                  <Marker 
                    key={loc.id} 
                    position={[loc.lat, loc.lng]} 
                    icon={loc.isHome ? homeIcon : defaultIcon}
                    draggable={isAdmin && mode === 'free'}
                    eventHandlers={{
                      click: () => handlePinClick(loc),
                      dragend: (e) => {
                        const marker = e.target;
                        const position = marker.getLatLng();
                        handleVillageUpdate(loc.id, position.lat, position.lng);
                      }
                    }}
                  />
                ))}
              </MapContainer>
            </motion.div>
          )}

          {/* YARD (Image Map) */}
          {view === 'yard' && (
            <motion.div
              key="yard"
              id="yard-map-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`relative w-full h-full flex items-center justify-center bg-rasala-dark ${isAdmin && mode === 'free' ? 'border-2 border-red-500/50' : ''}`}
            >
              <div id="yard-map-container" className="relative w-full max-w-6xl mx-auto" style={{ aspectRatio: '16/10' }} onClick={handleYardMapClick}>
                <img src="/assets/pihakartta.png" alt="Pihakartta" className="w-full h-full object-cover pointer-events-none opacity-80" onError={(e) => { e.currentTarget.src = 'https://placehold.co/1200x800/1c2b1e/d4af37?text=Lataa+pihakartta.png+/assets/+kansioon' }} />
                {yardLocations.map(loc => (
                  <ImagePin key={loc.id} loc={loc} onClick={() => handlePinClick(loc)} isAdmin={isAdmin && mode === 'free'} onLocationUpdate={handleYardUpdate} />
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Häivytys reunoille ja alas */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${mode === 'guided' && mapFocus ? 'opacity-30' : 'opacity-100'} bg-gradient-to-t from-rasala-dark via-rasala-dark/60 to-transparent pointer-events-none`} />
        <div className="absolute inset-0 bg-gradient-to-b from-rasala-dark/80 to-transparent h-40 pointer-events-none" />
      </div>

      {/* ── Elokuvamainen Kortti (Tournee tai valittu pinni) ── */}
      <div className="relative z-10 flex-grow w-full max-w-4xl mx-auto px-4 py-4 flex flex-col justify-end sm:justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          {((mode === 'guided' && !mapFocus) || (mode === 'free' && selectedPin)) && activeTarget && (
            <motion.div
              key={activeTarget.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`cinema-card border ${eraBorder[era] || 'border-white/20'} overflow-hidden shadow-cinema backdrop-blur-xl bg-rasala-dark/80 pointer-events-auto`}
            >
              <div className="relative group cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
                <img
                  src={isKotitontti && hasKotitaloImages ? visibleKotitaloImages[0] : (activeTarget.image || `https://placehold.co/1200x600/1c2b1e/d4af37?text=${encodeURIComponent(activeTarget.title)}`)}
                  alt={activeTarget.title}
                  className={`w-full object-cover transition-all duration-700 era-${era}`}
                  style={{ 
                    maxHeight: '40vh', 
                    width: '100%', 
                    objectFit: 'cover',
                    transform: `rotate(${isKotitontti && hasKotitaloImages ? (rotations[visibleKotitaloImages[0]] || 0) : (activeTarget.image ? (rotations[activeTarget.image] || 0) : 0)}deg)`
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rasala-dark/90 to-transparent opacity-80" />
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn size={40} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                </div>

                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm ${eraColor[era]}`}>
                    {eraLabel[era] || 'Muisto'}
                  </span>
                </div>
                {/* X-nappi: Sulkee kortin ja palaa aina vapaaseen selailuun */}
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setMode('free');
                    setSelectedPin(null); 
                  }} 
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-50 shadow-lg"
                  title="Sulje ja siirry vapaaseen selailuun"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <h3 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                  {activeTarget.title}
                </h3>
                <p className="text-white/80 text-base sm:text-lg leading-relaxed">
                  {activeTarget.description}
                </p>
                {activeTarget.people && activeTarget.people.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {activeTarget.people.map((p: string) => (
                      <span key={p} className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                        {p}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Jos tämä on Kotitontti (village view), näytetään siirtymänappi Pihakarttaan */}
                {activeTarget.isHome && view === 'village' && (
                  <button onClick={() => { setView('yard'); setMode('free'); setSelectedPin(null); }} className="mt-6 w-full btn-gold py-4 rounded-xl text-sm font-bold shadow-gold">
                    <span>Avaa Pihakartta →</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Iso teksti lentäessä (vain guided mode) */}
        <AnimatePresence>
          {mode === 'guided' && mapFocus && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              <span className={`font-serif text-5xl sm:text-7xl font-black drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] ${eraColor[era] || 'text-white'}`}>
                {currentGuidedTarget.title}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Opastetun kierroksen tai Kortin Navigaatio ── */}
      {mode === 'guided' && (
        <div className="relative z-20 w-full max-w-4xl mx-auto px-4 flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-white/80 hover:border-rasala-gold/40 hover:text-rasala-gold disabled:opacity-20 transition-all shadow-lg"
          >
            <ChevronLeft size={20} /> <span className="hidden sm:inline">Edellinen</span>
          </button>
          
          {mapFocus ? (
            <button 
              onClick={() => setMapFocus(false)}
              className="text-white/40 text-xs uppercase tracking-widest hover:text-white transition-colors bg-black/40 px-3 py-1.5 rounded-full"
            >
              Lue tarina
            </button>
          ) : (
            <button 
              onClick={() => setMapFocus(true)}
              className="text-white/40 text-xs uppercase tracking-widest hover:text-white transition-colors bg-black/40 px-3 py-1.5 rounded-full"
            >
              Näytä kartta
            </button>
          )}

          <button
            onClick={() => setCurrentIndex(i => Math.min(activeLocations.length - 1, i + 1))}
            disabled={currentIndex === activeLocations.length - 1}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-white/80 hover:border-rasala-gold/40 hover:text-rasala-gold disabled:opacity-20 transition-all shadow-lg"
          >
            <span className="hidden sm:inline">Seuraava</span> <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && activeTarget && (
          <Lightbox 
            images={lightboxImages} 
            onClose={() => setLightboxOpen(false)} 
            isAdmin={isAdmin}
            onRotate={handleRotate}
            onHide={(src) => {
              handleHide(src);
              setLightboxOpen(false);
            }}
            onSaveCaption={handleSaveCaption}
          />
        )}
      </AnimatePresence>
      {/* ── Nastan Muokkaus Modal (Admin) ── */}
      <AnimatePresence>
        {pinEditorOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.9 }}
              className="bg-rasala-dark border border-white/20 rounded-2xl p-6 w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setPinEditorOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
              
              <h3 className="text-2xl font-serif text-rasala-gold font-bold mb-6">
                {editingPin?.isCustom ? 'Lisää Uusi Nasta' : 'Muokkaa Nastaa'}
              </h3>
              
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Otsikko</label>
                  <input 
                    autoFocus type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-rasala-gold outline-none"
                    placeholder="Paikan nimi..."
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Aikakausi (Teemaväri)</label>
                  <select 
                    value={formData.era} onChange={e => setFormData({ ...formData, era: e.target.value })}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-rasala-gold outline-none"
                  >
                    <option value="historical">Historiallinen (Keltainen)</option>
                    <option value="postwar">Jälleenrakennus (Harmaa)</option>
                    <option value="growth">Kasvukausi (Oranssi)</option>
                    <option value="modern">Nykypäivä (Vihreä)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Tarina / Kuvaus</label>
                  <textarea 
                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-32 bg-black/50 border border-white/20 rounded-lg p-4 text-white placeholder:text-white/30 focus:border-rasala-gold outline-none resize-none"
                    placeholder="Kerro muisto tai tarina tähän..."
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Kuva (Valinnainen)</label>
                  <select 
                    value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-rasala-gold outline-none"
                  >
                    <option value="">-- Ei kuvaa --</option>
                    {allImages.map(url => {
                      const filename = url.split('/').pop() || '';
                      return <option key={url} value={url}>{filename}</option>;
                    })}
                  </select>
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="mt-3 w-full h-32 object-cover rounded-lg border border-white/20" />
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center">
                {!editingPin?.isCustom && editingPin?.id !== 'kotitontti' && editingPin?.id !== 'paarakennus' ? (
                  <button onClick={deletePin} className="text-red-500 hover:text-red-400 text-sm font-bold flex items-center gap-1 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10">
                    <Trash2 size={16} /> Poista Nasta
                  </button>
                ) : <div />}
                
                <div className="flex gap-3">
                  <button onClick={() => setPinEditorOpen(false)} className="px-5 py-2 rounded-xl text-white/60 hover:bg-white/5 font-medium transition-colors">
                    Peruuta
                  </button>
                  <button onClick={savePin} className="btn-gold px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                    <Check size={18} /> Tallenna
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
