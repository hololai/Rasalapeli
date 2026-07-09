const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const firebaseConfig = {
  apiKey: "AIzaSyArSViLuagzKbiJTO5uBv85eAIQRRAgOtM",
  projectId: "kuvaohjelma",
  storageBucket: "kuvaohjelma.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function testUpload() {
  const buffer = Buffer.from('test', 'utf8');
  const storageRef = ref(storage, 'test.txt');
  
  try {
    await uploadBytes(storageRef, buffer, { contentType: 'text/plain' });
    const url = await getDownloadURL(storageRef);
    console.log("URL:", url);
    process.exit(0);
  } catch (e) {
    console.error("Virhe:", e.message);
    process.exit(1);
  }
}

testUpload();
