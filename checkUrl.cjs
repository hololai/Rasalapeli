const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const configPath = path.join(process.env.HOME, '.config/configstore/firebase-tools.json');
const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const refreshToken = configData.tokens.refresh_token;

const tokenPath = '/tmp/refresh_token.json';
fs.writeFileSync(tokenPath, JSON.stringify({ refresh_token: refreshToken }));

admin.initializeApp({
  credential: admin.credential.refreshToken(tokenPath),
  projectId: "kuvaohjelma",
});

const db = admin.firestore();

async function checkUrl() {
  const usersRef = db.collection('images');
  const snapshot = await usersRef.limit(1).get();
  
  if (snapshot.empty) {
    console.log("Ei kuvia!");
    process.exit(0);
  }
  
  for (const doc of snapshot.docs) {
    console.log("ID:", doc.id);
    console.log("URL:", doc.data().url);
  }
  process.exit(0);
}

checkUrl().catch(console.error);
