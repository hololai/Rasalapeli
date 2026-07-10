import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseContent = fs.readFileSync('src/firebase/config.ts', 'utf-8');
const apiKeyMatch = firebaseContent.match(/apiKey:\s*"([^"]+)"/);
const authDomainMatch = firebaseContent.match(/authDomain:\s*"([^"]+)"/);
const projectIdMatch = firebaseContent.match(/projectId:\s*"([^"]+)"/);
const storageBucketMatch = firebaseContent.match(/storageBucket:\s*"([^"]+)"/);
const messagingSenderIdMatch = firebaseContent.match(/messagingSenderId:\s*"([^"]+)"/);
const appIdMatch = firebaseContent.match(/appId:\s*"([^"]+)"/);

const config = {
  apiKey: apiKeyMatch[1],
  authDomain: authDomainMatch[1],
  projectId: projectIdMatch[1],
  storageBucket: storageBucketMatch[1],
  messagingSenderId: messagingSenderIdMatch[1],
  appId: appIdMatch[1]
};

const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
    console.log("Fetching images...");
    const snap = await getDocs(collection(db, 'images'));
    let count = 0;
    for (const d of snap.docs) {
        const data = d.data();
        let needsUpdate = false;
        let updates = {};

        if (d.id.startsWith('local_rasala_') && (!data.url && data.path)) {
            updates.url = data.path; // Frontend näyttää url-kentän pohjalta kuvat galleriassa (Gallery.tsx line 76)
            needsUpdate = true;
        }

        if (needsUpdate) {
            await updateDoc(doc(db, 'images', d.id), updates);
            console.log(`Updated ${d.id} with`, updates);
            count++;
        }
    }
    console.log(`Done! Updated ${count} images.`);
    process.exit(0);
}

run().catch(console.error);
