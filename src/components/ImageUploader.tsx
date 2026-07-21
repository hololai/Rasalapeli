import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase/config';
import { collection, doc, setDoc, getDocs, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Upload, X, Loader2, ImagePlus, MapPin, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import { useAuth } from '../contexts/AuthContext';
import { InfoButton } from './InfoButton';

export const ImageUploader = ({ onUploadComplete }: { onUploadComplete?: () => void }) => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const [year, setYear] = useState('');
  const [decade, setDecade] = useState('1970');
  const [caption, setCaption] = useState('');
  const [locationId, setLocationId] = useState('');
  const [locationText, setLocationText] = useState('');
  const [rawDriveUrl, setRawDriveUrl] = useState('');
  
  const [locations, setLocations] = useState<{id: string, title: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Hae karttalokaatiot pudotusvalikkoa varten
      const fetchLocs = async () => {
        try {
          const villDoc = await getDoc(doc(db, 'map_locations', 'village'));
          if (villDoc.exists()) {
            setLocations(villDoc.data().locations || []);
          }
        } catch (e) {
          console.error("Lokaatioiden haku epäonnistui", e);
        }
      };
      fetchLocs();
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selected]);
      const urls = selected.map(f => URL.createObjectURL(f));
      setPreviewUrls(prev => [...prev, ...urls]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Valitse ainakin yksi kuva ensin.");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Määritä vuosikymmen
      let finalDecade = decade;
      if (year && year.length === 4 && !isNaN(Number(year))) {
        finalDecade = `${Math.floor(Number(year) / 10) * 10}`;
      }

      const options = {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      // Automaattinen nastan yhdistäminen vapaan tekstin perusteella
      let finalLocationId = locationId;
      if (!finalLocationId && locationText) {
        const match = locations.find(loc => loc.title.toLowerCase() === locationText.toLowerCase().trim());
        if (match) {
          finalLocationId = match.id;
        }
      }

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const filename = `${finalDecade}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`;
        const storagePath = `images/${finalDecade}/${filename}`;
        const docId = filename.replace(/\.[^/.]+$/, "");

        let compressedFile = file;
        
        // Pakataan vain, jos kuva on yli 1.5 Megatavua
        if (file.size > 1.5 * 1024 * 1024) {
          try {
            compressedFile = await imageCompression(file, options) as File;
          } catch (err) {
            console.error("Kuvan pakkaus epäonnistui, käytetään alkuperäistä:", err);
          }
        }

        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, compressedFile);
        const downloadURL = await getDownloadURL(storageRef);

        await setDoc(doc(db, "images", docId), {
          url: downloadURL,
          storagePath: storagePath,
          filename: filename,
          decade: finalDecade,
          year: year,
          caption: caption,
          locationId: finalLocationId || null,
          locationText: locationText || null,
          rawDriveUrl: rawDriveUrl || null,
          uploaderName: profile?.displayName || 'Tuntematon',
          uploaderEmail: profile?.email || '',
          rotation: 0,
          hidden: false,
          createdAt: new Date(),
          orderIndex: -Date.now() // Aina ylimmäksi!
        });
      }

      setIsOpen(false);
      setFiles([]);
      setPreviewUrls([]);
      setYear('');
      setCaption('');
      setRawDriveUrl('');
      setLocationText('');
      
      if (onUploadComplete) onUploadComplete();
      alert(`Lataus onnistui! (${files.length} kuvaa)`);

    } catch (err: any) {
      console.error(err);
      setError("Virhe kuvan latauksessa: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-all shadow-lg"
      >
        <ImagePlus size={18} /> Lisää Kuvia
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.9 }}
              className="bg-rasala-dark border border-amber-900/30 rounded-2xl p-6 w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-serif text-rasala-gold font-bold flex items-center gap-2">
                  <Upload size={24} /> Lataa Uusia Kuvia (Massalataus)
                </h2>
                <InfoButton 
                  title="Ohje massalataukseen"
                  instructions={[
                    "1. Valitse ensin kaikki kuvat, jotka kuuluvat samaan aikaan ja paikkaan (voit valita satojakin tiedostoja kerralla).",
                    "2. Aseta oikealla olevat tiedot (esim. vuosikymmen ja karttanasta). Nämä tiedot kopioituvat automaattisesti KAIKKIIN valitsemiisi kuviin.",
                    "3. Uudet kuvat nousevat aina automaattisesti Gallerian ylimmäksi!"
                  ]}
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Vasen sarake: Tiedostot */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Valitse Kuvat</label>
                  <div className="relative border-2 border-dashed border-white/20 rounded-xl p-8 hover:border-rasala-gold transition-colors text-center cursor-pointer bg-black/20">
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center text-white/50">
                      <Upload size={32} className="mb-2 opacity-50" />
                      <span className="font-medium text-rasala-gold">Klikkaa tästä</span>
                      <span className="text-sm mt-1">Valitse yksi tai useampi kuva</span>
                    </div>
                  </div>

                  {/* Esikatseluruudukko */}
                  {previewUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                      {previewUrls.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img src={url} alt={`Preview ${idx}`} className="w-full h-20 object-cover rounded-lg border border-white/10" />
                          <button 
                            onClick={() => removeFile(idx)}
                            className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Oikea sarake: Yhteiset metatiedot */}
                <div className="flex flex-col gap-4">
                  <div className="p-3 bg-white/5 border border-amber-500/20 rounded-lg mb-2">
                    <p className="text-xs text-amber-200">
                      Kaikki alla olevat tiedot asetetaan automaattisesti <strong>kaikkiin</strong> tässä erässä lataamiisi kuviin kerralla!
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Vuosi (Valinnainen)</label>
                      <input 
                        type="number" 
                        value={year} 
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="esim. 1974"
                        className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-base text-white focus:border-rasala-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Vuosikymmen</label>
                      <select 
                        value={decade} 
                        onChange={(e) => setDecade(e.target.value)}
                        disabled={year.length === 4}
                        className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-base text-white focus:border-rasala-gold outline-none disabled:opacity-50"
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
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1 flex items-center gap-1">
                      <MapPin size={12}/> Sijainti (Karttanasta)
                    </label>
                    <select 
                      value={locationId} 
                      onChange={(e) => setLocationId(e.target.value)}
                      className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-base text-white focus:border-rasala-gold outline-none"
                    >
                      <option value="">-- Ei nastaa --</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1 flex items-center gap-1">
                      <MapPin size={12}/> Tarkempi paikka (Vapaa teksti)
                    </label>
                    <input 
                      type="text" 
                      value={locationText} 
                      onChange={(e) => setLocationText(e.target.value)}
                      placeholder="esim. Ranua tai Mummolan piha"
                      className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-base text-white focus:border-rasala-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1 flex items-center gap-1">
                      <LinkIcon size={12}/> Alkuperäinen kuva (Esim. Drive-linkki)
                    </label>
                    <input 
                      type="url" 
                      value={rawDriveUrl} 
                      onChange={(e) => setRawDriveUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-base text-white focus:border-rasala-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Yhteinen kuvateksti (Valinnainen)</label>
                    <textarea 
                      value={caption} 
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Mitä tässä tapahtuu?"
                      className="w-full h-20 bg-black/50 border border-white/20 rounded-lg p-3 text-base text-white placeholder:text-white/30 focus:border-rasala-gold outline-none resize-none"
                    />
                  </div>
                </div>

              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-white/10 pt-4">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 rounded-xl text-white/60 hover:bg-white/5 font-medium transition-colors"
                >
                  Peruuta
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={isUploading || files.length === 0}
                  className="btn-gold px-6 py-2 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <><Loader2 size={18} className="animate-spin" /> Ladataan {files.length} kuvaa...</>
                  ) : (
                    <><Upload size={18} /> Tallenna {files.length > 0 ? `${files.length} kuvaa` : ''}</>
                  )}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
