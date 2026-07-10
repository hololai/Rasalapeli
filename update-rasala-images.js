import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
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
    for (let i = 1; i <= 12; i++) {
        const id = `local_rasala_${i}`;
        await updateDoc(doc(db, 'images', id), {
            path: `/assets/KOTITALO/rasala${i}.jpeg`
        });
        console.log(`Updated ${id}`);
    }
    console.log("Done");
    process.exit(0);
}

run();
