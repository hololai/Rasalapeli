const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy } = require('firebase/firestore');

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

async function run() {
  const snap = await getDocs(collection(db, 'images'));
  let found = 0;
  snap.forEach(d => {
    if (d.id.includes('1970_17')) { // Etsitään uusia (timestamp alkaa 17...)
      console.log('Löytyi uusi kuva:', d.id, d.data().decade);
      found++;
    }
  });
  console.log('Yhteensä uusia 1970-luvun kuvia:', found);
  process.exit(0);
}
run();
