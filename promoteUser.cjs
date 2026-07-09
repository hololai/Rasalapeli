const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const configPath = path.join(process.env.HOME, '.config/configstore/firebase-tools.json');
const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const refreshToken = configData.tokens.refresh_token;

admin.initializeApp({
  credential: admin.credential.refreshToken(refreshToken),
  projectId: "kuvaohjelma",
});

const db = admin.firestore();

async function promote() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', 'heikki.laivamaa@famula.fi').get();
  
  if (snapshot.empty) {
    console.log("Ei löytynyt käyttäjää famula.fi");
    process.exit(0);
  }
  
  for (const doc of snapshot.docs) {
    await doc.ref.update({ role: 'superadmin' });
    console.log(`Päivitettiin ${doc.data().email} superadminiksi!`);
  }
  process.exit(0);
}

promote().catch(console.error);
