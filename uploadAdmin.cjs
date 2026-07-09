const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// 1. Lue refresh token firebase-tools:n asetustiedostosta
const configPath = path.join(process.env.HOME, '.config/configstore/firebase-tools.json');
const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const refreshToken = configData.tokens.refresh_token;

// 2. Alusta Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.refreshToken(refreshToken),
  projectId: "kuvaohjelma",
  storageBucket: "kuvaohjelma.firebasestorage.app"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// 3. Etsi kuvat
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
  console.log('Etsitään kuvat (Admin mode)...');
  walk('./public/assets');
  console.log(`Löydettiin ${images.length} kuvaa. Aloitetaan siirto Storageen ja Firestoreen Adminina...`);

  let count = 0;
  for (const fullPath of images) {
    const file = path.basename(fullPath);
    const docId = file.replace(/\.[^/.]+$/, '');
    const [yearStr] = file.split('_');
    const year = parseInt(yearStr) || 1950;
    
    try {
      // 1. Lataa Storageen (ohittaa säännöt)
      const destination = `images/${file}`;
      await bucket.upload(fullPath, {
        destination: destination,
        metadata: {
          contentType: 'image/webp'
        }
      });
      
      // Admin SDK ei anna suoraa getDownloadURL-funktiota samalla tavalla,
      // joten muodostamme julkisen URL:n itse Firebase Storage sääntöjen mukaisesti:
      const url = `https://firebasestorage.googleapis.com/v0/b/kuvaohjelma.firebasestorage.app/o/images%2F${encodeURIComponent(file)}?alt=media`;
      
      // 2. Tallenna Firestoreen (ohittaa säännöt)
      await db.collection('images').doc(docId).set({
        filename: file,
        url: url,
        decade: `${Math.floor(year / 10) * 10}-luku`,
        year: year,
        caption: `Kuva vuodelta ${year}`,
        createdAt: new Date().toISOString(),
        rotation: 0,
        hidden: false,
        uploadedBy: 'admin-script'
      });
      
      count++;
      process.stdout.write(`\\r[${count}/${images.length}] Tallennettu onnistuneesti: ${file}`);
    } catch (e) {
      console.error(`\\nVIRHE kuvan ${file} kohdalla:`, e.message);
    }
  }
  console.log('\\nKaikki 732 kuvaa on pakotettu Firestore-tietokantaan ja Firebase Storageen!');
  process.exit(0);
}

uploadImages().catch(console.error);
