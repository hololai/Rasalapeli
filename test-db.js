import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseContent = fs.readFileSync('src/firebase/config.ts', 'utf-8');
const apiKeyMatch = firebaseContent.match(/apiKey:\s*"([^"]+)"/);
const authDomainMatch = firebaseContent.match(/authDomain:\s*"([^"]+)"/);
const projectIdMatch = firebaseContent.match(/projectId:\s*"([^"]+)"/);
const config = {
  apiKey: apiKeyMatch[1],
  authDomain: authDomainMatch[1],
  projectId: projectIdMatch[1],
};

const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
    console.log("Checking DB...");
    const snap = await getDocs(collection(db, 'images'));
    let kotitaloCount = 0;
    for (const d of snap.docs) {
        if (d.data().decade === 'Kotitalo') {
            kotitaloCount++;
            console.log(d.id, d.data().decade, d.data().url);
        }
    }
    console.log(`Found ${kotitaloCount} Kotitalo images.`);
    process.exit(0);
}

run().catch(console.error);
