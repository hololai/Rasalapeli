const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyArSViLuagzKbiJTO5uBv85eAIQRRAgOtM",
  projectId: "kuvaohjelma",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, "kuvaohjelma");

async function test() {
  try {
    try {
      await createUserWithEmailAndPassword(auth, "test2@test.com", "password123");
    } catch (e) {
      await signInWithEmailAndPassword(auth, "test2@test.com", "password123");
    }
    const snap = await getDocs(query(collection(db, 'images'), limit(1)));
    if (snap.empty) {
      console.log("No images");
    } else {
      const data = snap.docs[0].data();
      console.log("URL on:", data.url);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

test();
