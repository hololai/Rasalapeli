import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
  apiKey: "AIzaSyArSViLuagzKbiJTO5uBv85eAIQRRAgOtM",
  authDomain: "kuvaohjelma.firebaseapp.com",
  projectId: "kuvaohjelma",
  storageBucket: "kuvaohjelma.firebasestorage.app",
  messagingSenderId: "150396211718",
  appId: "1:150396211718:web:3710647f65e37735ff2987"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const assetsDir = path.join(__dirname, '../public/assets');

async function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = await getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
        arrayOfFiles.push(fullPath);
      }
    }
  }

  return arrayOfFiles;
}

async function migrate() {
  console.log("Etsitään kuvat koodista...");
  const files = await getAllFiles(assetsDir);
  console.log(`Löydettiin ${files.length} kuvaa.`);

  for (let i = 0; i < files.length; i++) {
    const fullPath = files[i];
    const relativePath = path.relative(assetsDir, fullPath); // esim. "1970/1970_0001.webp"
    
    // Suodata pois kääntöpuolet jne.
    const pathLower = relativePath.toLowerCase();
    if (pathLower.includes('kääntöpuoli') || pathLower.includes('kaantopuoli') || pathLower.includes('back') || pathLower.includes('jarjestamaton')) {
      console.log(`Ohitetaan: ${relativePath}`);
      continue;
    }

    const filename = path.basename(fullPath);
    let decade = 'Tuntematon';
    
    // Eristä vuosikymmen kansiosta
    const parts = relativePath.split(path.sep);
    if (pathLower.includes('kotitalo')) {
      decade = 'Kotitalo';
    } else if (parts.length > 1) {
      decade = parts[0];
      if (/^\d{4}s?$/.test(decade)) {
        decade = decade.replace('s', '');
      } else {
        decade = 'Tuntematon';
      }
    }

    console.log(`[${i+1}/${files.length}] Ladataan ${filename} (Vuosikymmen: ${decade})...`);

    // 1. Lue tiedosto
    const buffer = fs.readFileSync(fullPath);
    const uint8Array = new Uint8Array(buffer);

    // 2. Tallenna Storageen polulla images/vuosikymmen/tiedostonimi
    const storagePath = `images/${decade}/${filename}`;
    const storageRef = ref(storage, storagePath);
    
    try {
      await uploadBytes(storageRef, uint8Array, { contentType: 'image/webp' });
      const downloadURL = await getDownloadURL(storageRef);

      // 3. Tallenna Firestoreen
      // Käytämme Firestore id:nä tiedostonimeä (ilman päätettä)
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
      console.log(`✓ Valmis: ${filename}`);
    } catch (error) {
      console.error(`X Virhe tiedostossa ${filename}:`, error);
    }
  }

  console.log("Kaikki kuvat migroitu!");
}

migrate();
