import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';

export type UserRole = 'superadmin' | 'admin' | 'user' | 'pending' | 'viewer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  createdAt?: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  resetPassword: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        let signInProvider = '';
        try {
          // Hae käyttäjän profiili Firestoresta
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          // Tarkistetaan MITEN käyttäjä kirjautui sisään tässä sessiossa
          const idTokenResult = await currentUser.getIdTokenResult();
          signInProvider = idTokenResult.signInProvider || '';

          if (userSnap.exists()) {
            let dbProfile = userSnap.data() as UserProfile;
            
            // Jos kirjautuminen tapahtui salasanalla (mobiili), pakotetaan rooli "vieweriksi"
            if (signInProvider === 'password') {
              dbProfile.role = 'viewer';
            }
            
            setProfile(dbProfile);
          } else {
            // Uusi käyttäjä, tallennetaan tietokantaan
            const PREDEFINED_ADMINS = [
              'hannulaivamaa@gmail.com',
              'helenalaivalahti@gmail.com',
              'juhaville.laivamaa@gmail.com',
              'markkulaivamaa7@gmail.com',
              'outi.myllarinen@gmail.com',
              'perttu.laivamaa@gmail.com',
              'tiina.ilmanen@gmail.com',
              'katariina.laivamaa@gmail.com'
            ];
            
            let assignedRole: UserRole = 'pending';
            const userEmail = currentUser.email?.toLowerCase() || '';
            
            if (userEmail === 'heikki.laivamaa@gmail.com' || userEmail === 'heikki.laivamaa@famula.fi') {
              assignedRole = 'superadmin';
            } else if (PREDEFINED_ADMINS.includes(userEmail)) {
              assignedRole = 'admin';
            }
            
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Tuntematon',
              photoURL: currentUser.photoURL || '',
              role: assignedRole,
              createdAt: serverTimestamp(),
            };
            // Ei jäädä odottamaan setDocin valmistumista (jos verkko yskii), tallennetaan taustalla
            setDoc(userRef, newProfile).catch(e => console.error("setDoc taustavirhe:", e));
            
            if (signInProvider === 'password') {
              newProfile.role = 'viewer';
            }
            setProfile(newProfile);
          }
        } catch (error) {
          console.error("Firestore virhe (Tarkista tietokannan säännöt!):", error);
          // Hätävara-fallback, jotta UI toimii vaikka Firestore estäisi lukemisen
          const PREDEFINED_ADMINS = [
            'hannulaivamaa@gmail.com',
            'helenalaivalahti@gmail.com',
            'juhaville.laivamaa@gmail.com',
            'markkulaivamaa7@gmail.com',
            'outi.myllarinen@gmail.com',
            'perttu.laivamaa@gmail.com',
            'tiina.ilmanen@gmail.com',
            'katariina.laivamaa@gmail.com'
          ];
          
          let fallbackRole: UserRole = 'pending';
          const userEmail = currentUser.email?.toLowerCase() || '';
          
          if (userEmail === 'heikki.laivamaa@gmail.com' || userEmail === 'heikki.laivamaa@famula.fi') {
            fallbackRole = 'superadmin';
          } else if (PREDEFINED_ADMINS.includes(userEmail)) {
            fallbackRole = 'admin';
          }
          
          // Jos kirjautuminen tapahtui salasanalla, pakotetaan katselija-rooli fallbackissakin
          if (signInProvider === 'password') {
            fallbackRole = 'viewer';
          }

          setProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Tuntematon',
            photoURL: currentUser.photoURL || '',
            role: fallbackRole,
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Käsitellään redirectin tulos (mobiililla palataan tänne)
  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      console.error("Virhe redirect-kirjautumisen paluussa:", error);
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      // --- PALAUTUSMERKINTÄ (ROLLBACK ANCHOR) ---
      // Jos haluat palauttaa takaisin pelkkään Popup-malliin,
      // poista if (isMobile) -rakenne ja jätä vain: await signInWithPopup(auth, googleProvider);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        // Puhelimet (kuten iPhone Chrome/Safari) ohjataan Googlen sivulle ja takaisin,
        // jotta vältytään popup-estoilta. Toimii nyt, kun auth.sukukuvat.fi on käytössä.
        await signInWithRedirect(auth, googleProvider);
      } else {
        // Tietokoneet käyttävät aina ponnahdusikkunaa. (TÄMÄ PYSYY EHDOTTOMAN RIKKOUTUMATTOMANA)
        await signInWithPopup(auth, googleProvider);
      }
      // --- PALAUTUSMERKINTÄ LOPPU ---
    } catch (error) {
      console.error("Virhe kirjautumisessa:", error);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Virhe uloskirjautumisessa:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
