const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const app = initializeApp({
  projectId: "kuvaohjelma",
});
const db = getFirestore(app);

async function test() {
  try {
    await setDoc(doc(db, 'images', 'test'), { hello: 'world' });
    console.log("SUCCESS!");
    process.exit(0);
  } catch (e) {
    console.log("ERROR:", e);
    process.exit(1);
  }
}
test();
