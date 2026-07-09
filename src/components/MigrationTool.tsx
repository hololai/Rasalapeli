import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { UploadCloud, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { mapLocationsCollection } from '../data/mockData';

// Haetaan kuvat lokaalisti
const rawImages = import.meta.glob('/public/assets/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, query: '?url', import: 'default' });

export const MigrationTool = () => {
  const { profile } = useAuth();
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState<string[]>([]);

  const runMigration = async () => {
    if (!window.confirm("VAROITUS: Tämä lataa kaikki koodissa olevat satoja kuvia Firebase Storageen ja tietokantaan. Haluatko varmasti suorittaa?")) return;
    
    setIsMigrating(true);
    const urls = Object.keys(rawImages);
    setProgress({ current: 0, total: urls.length });
    setLogs(prev => [...prev, `Löydettiin ${urls.length} kuvaa.`]);

    for (let i = 0; i < urls.length; i++) {
      const fullPath = urls[i];
      const url = rawImages[fullPath] as string;
      const pathLower = fullPath.toLowerCase();

      // Suodata kääntöpuolet ja järjestämättömät
      if (
        pathLower.includes('kääntöpuoli') || 
        pathLower.includes('kaantopuoli') || 
        pathLower.includes('back') ||
        pathLower.includes('jarjestamaton') || 
        pathLower.includes('järjestämätön')
      ) {
        setLogs(prev => [...prev, `Ohitetaan (kääntöpuoli): ${fullPath}`]);
        setProgress(p => ({ ...p, current: i + 1 }));
        continue;
      }

      // Etsi vuosikymmen tiedostonimestä tai kansiosta
      const parts = fullPath.split('/');
      const filename = parts[parts.length - 1];
      let decade = 'Tuntematon';
      
      const fileMatch = filename.match(/^(\d{4})s?_/);
      const dirMatch = fullPath.match(/\/(\d{4})s?\//);

      if (pathLower.includes('/kotitalo/')) {
        decade = 'Kotitalo';
      } else if (fileMatch) {
        const year = parseInt(fileMatch[1]);
        decade = `${Math.floor(year / 10) * 10}`;
      } else if (dirMatch) {
        const year = parseInt(dirMatch[1]);
        decade = `${Math.floor(year / 10) * 10}`;
      } else {
        setLogs(prev => [...prev, `Ohitetaan (ei vuosikymmentä): ${fullPath}`]);
        setProgress(p => ({ ...p, current: i + 1 }));
        continue;
      }

      try {
        // 1. Fetch image from local dist
        setLogs(prev => [...prev, `[${i+1}] Ladataan lokaalisti: ${filename}`]);
        const response = await fetch(url);
        const blob = await response.blob();

        // 2. Upload to Firebase Storage
        setLogs(prev => [...prev, `[${i+1}] Tallennetaan pilveen: ${filename}`]);
        const storagePath = `images/${decade}/${filename}`;
        const storageRef = ref(storage, storagePath);
        
        await uploadBytes(storageRef, blob, { contentType: blob.type });
        const downloadURL = await getDownloadURL(storageRef);

        // 3. Save to Firestore
        setLogs(prev => [...prev, `[${i+1}] Tallennetaan tietokantaan: ${filename}`]);
        const docId = filename.replace(/\.[^/.]+$/, "");
        await setDoc(doc(db, "images", docId), {
          url: downloadURL,
          storagePath: storagePath,
          filename: filename,
          decade: decade,
          year: "",
          caption: "",
          rotation: 0,
          hidden: false,
          createdAt: new Date()
        });

        setLogs(prev => [...prev, `[${i+1}/${urls.length}] Ladattu: ${filename}`]);
      } catch (err: any) {
        setLogs(prev => [...prev, `[${i+1}/${urls.length}] VIRHE: ${filename} - ${err.message}`]);
      }
      
      setProgress(p => ({ ...p, current: i + 1 }));
    }

    setLogs(prev => [...prev, `Kuvat siirretty. Siirretään karttapinnit...`]);

    try {
      // Siirrä karttapinnit
      await setDoc(doc(db, "map_locations", "village"), { locations: mapLocationsCollection.village });
      await setDoc(doc(db, "map_locations", "yard"), { locations: mapLocationsCollection.yard });
      setLogs(prev => [...prev, `Karttapinnit siirretty onnistuneesti.`]);
    } catch (err: any) {
      setLogs(prev => [...prev, `VIRHE karttapinnejä siirrettäessä: ${err.message}`]);
    }

    setLogs(prev => [...prev, `Valmis!`]);
    setIsMigrating(false);
  };

  if (profile?.role !== 'superadmin') return null;

  return (
    <div className="bg-stone-800 p-6 rounded-2xl border border-red-500/30 mt-8 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-red-500" />
        <h2 className="text-xl font-bold text-white">Vaaravyöhyke: Tietokannan Migraatio</h2>
      </div>
      
      <p className="text-stone-400 mb-6 text-sm">
        Tämä työkalu lukee kaikki ohjelman lähdekoodin mukana tulleet kuvat (/public/assets) ja 
        lataa ne Firebase Storageen, sekä luo niille Firestore-dokumentit. Tätä painiketta tulee 
        painaa <strong>vain kerran</strong>, jotta kuvat siirtyvät pilveen pysyvästi.
      </p>

      {isMigrating ? (
        <div className="flex items-center gap-3 text-amber-500 font-bold mb-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Siirretään kuvia: {progress.current} / {progress.total}</span>
        </div>
      ) : (
        <button
          onClick={runMigration}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
        >
          <UploadCloud className="w-5 h-5" />
          Aloita Kuvien Migraatio Pilveen
        </button>
      )}

      {logs.length > 0 && (
        <div className="mt-6 bg-black/60 p-4 rounded-xl max-h-64 overflow-y-auto font-mono text-xs text-stone-400 border border-white/10 flex flex-col gap-1">
          {logs.map((log, i) => (
            <div key={i} className={log.includes('VIRHE') ? 'text-red-400' : log.includes('Ohitetaan') ? 'text-stone-500' : 'text-green-400'}>
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
