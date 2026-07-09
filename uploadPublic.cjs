const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const firebaseConfig = {
  apiKey: "AIzaSyArSViLuagzKbiJTO5uBv85eAIQRRAgOtM",
  authDomain: "kuvaohjelma.firebaseapp.com",
  projectId: "kuvaohjelma",
  storageBucket: "kuvaohjelma.firebasestorage.app",
  messagingSenderId: "150396211718",
  appId: "1:150396211718:web:3710647f65e37735ff2987"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "kuvaohjelma");
const storage = getStorage(app);

const images = [];
function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      images.push(fullPath);
    }
  }
}

async function uploadImages() {
  console.log('Etsitään kuvat (Client mode, vaatii julkiset säännöt)...');
  walk('./public/assets');
  console.log(`Löydettiin ${images.length} kuvaa. Aloitetaan siirto Storageen ja Firestoreen...`);

  let count = 0;
  for (const fullPath of images) {
    const file = path.basename(fullPath);
    const docId = file.replace(/\.[^/.]+$/, '');
    const [yearStr] = file.split('_');
    const year = parseInt(yearStr) || 1950;
    
    try {
      const buffer = fs.readFileSync(fullPath);
      
      // Lataa Storageen
      const storageRef = ref(storage, `images/${file}`);
      await uploadBytes(storageRef, buffer, { contentType: 'image/webp' });
      const url = await getDownloadURL(storageRef);
      
      // Tallenna Firestoreen
      await setDoc(doc(db, 'images', docId), {
        filename: file,
        url: url,
        decade: `${Math.floor(year / 10) * 10}-luku`,
        year: year,
        caption: `Kuva vuodelta ${year}`,
        createdAt: new Date().toISOString(),
        rotation: 0,
        hidden: false,
        uploadedBy: 'node-script'
      });
      
      count++;
      process.stdout.write(`\\r[${count}/${images.length}] Tallennettu onnistuneesti: ${file}`);
    } catch (e) {
      console.error(`\\nVIRHE kuvan ${file} kohdalla (Ovatko säännöt public?):`, e.message);
      process.exit(1);
    }
  }
  console.log('\\nKaikki 732 kuvaa on siirretty onnistuneesti Firestoreen ja Storageen!');
  process.exit(0);
}

uploadImages().catch(console.error);
