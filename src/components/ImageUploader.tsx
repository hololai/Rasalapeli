import React, { useState } from 'react';
import { db, storage } from '../firebase/config';
import { collection, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ImageUploader = ({ onUploadComplete }: { onUploadComplete?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [year, setYear] = useState('');
  const [decade, setDecade] = useState('1970');
  const [caption, setCaption] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Valitse kuva ensin.");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Määritä vuosikymmen
      let finalDecade = decade;
      if (year && year.length === 4 && !isNaN(Number(year))) {
        // Laske vuosikymmen tarkasta vuodesta (esim 1974 -> 1970)
        finalDecade = `${Math.floor(Number(year) / 10) * 10}`;
      }

      const fileExt = file.name.split('.').pop();
      const filename = `${finalDecade}_${Date.now()}.${fileExt}`;
      const storagePath = `images/${finalDecade}/${filename}`;
      const docId = filename.replace(/\.[^/.]+$/, "");

      // 1. Upload to Storage
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // 2. Save to Firestore
      await setDoc(doc(db, "images", docId), {
        url: downloadURL,
        storagePath: storagePath,
        filename: filename,
        decade: finalDecade,
        year: year,
        caption: caption,
        rotation: 0,
        hidden: false,
        createdAt: new Date()
      });

      // Nollaa tila
      setIsOpen(false);
      setFile(null);
      setPreviewUrl(null);
      setYear('');
      setCaption('');
      
      if (onUploadComplete) onUploadComplete();
      alert("Kuva ladattu onnistuneesti!");

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
        <ImagePlus size={18} /> Lisää Kuva
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.9 }}
              className="bg-rasala-dark border border-amber-900/30 rounded-2xl p-6 w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-serif text-rasala-gold font-bold mb-6 flex items-center gap-2">
                <Upload size={24} /> Lataa Uusi Kuva
              </h2>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4">
                {/* Tiedoston valinta */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Valitse Kuva</label>
                  <div className="relative border-2 border-dashed border-white/20 rounded-xl p-8 hover:border-rasala-gold transition-colors text-center cursor-pointer bg-black/20">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {previewUrl ? (
                      <div className="flex flex-col items-center">
                        <img src={previewUrl} alt="Preview" className="h-40 object-contain rounded-lg mb-4" />
                        <span className="text-sm text-rasala-gold font-medium">Vaihda kuva klikkaamalla tästä</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-white/50">
                        <Upload size={32} className="mb-2 opacity-50" />
                        <span className="font-medium">Klikkaa tästä ja valitse kuva laitteeltasi</span>
                        <span className="text-xs mt-1">(JPG, PNG, WEBP)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Aikakausi */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Tarkka Vuosi</label>
                    <input 
                      type="number" 
                      value={year} 
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="esim. 1974"
                      className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-rasala-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Tai Vuosikymmen</label>
                    <select 
                      value={decade} 
                      onChange={(e) => setDecade(e.target.value)}
                      disabled={year.length === 4}
                      className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-rasala-gold outline-none disabled:opacity-50"
                    >
                      <option value="Kotitalo">Kotitalo (Kansio)</option>
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

                {/* Kuvateksti */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Kuvateksti</label>
                  <textarea 
                    value={caption} 
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Ketä kuvassa on? Mitä siinä tapahtuu?"
                    className="w-full h-24 bg-black/50 border border-white/20 rounded-lg p-4 text-white placeholder:text-white/30 focus:border-rasala-gold outline-none resize-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 rounded-xl text-white/60 hover:bg-white/5 font-medium transition-colors"
                >
                  Peruuta
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={isUploading || !file}
                  className="btn-gold px-6 py-2 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <><Loader2 size={18} className="animate-spin" /> Ladataan...</>
                  ) : (
                    <><Upload size={18} /> Vie Tietokantaan</>
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
