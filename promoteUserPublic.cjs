const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyArSViLuagzKbiJTO5uBv85eAIQRRAgOtM",
  projectId: "kuvaohjelma"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "kuvaohjelma");

async function promote() {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', 'heikki.laivamaa@famula.fi'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log("Ei löytynyt käyttäjää famula.fi");
      process.exit(0);
    }
    
    for (const docSnap of snapshot.docs) {
      await updateDoc(docSnap.ref, { role: 'superadmin' });
      console.log(`Päivitettiin ${docSnap.data().email} superadminiksi!`);
    }
    process.exit(0);
  } catch (e) {
    console.error("Virhe:", e);
    process.exit(1);
  }
}

promote();
