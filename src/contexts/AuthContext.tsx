import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';

export type UserRole = 'superadmin' | 'admin' | 'user' | 'pending';

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
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
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
        try {
          // Hae käyttäjän profiili Firestoresta
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setProfile(userSnap.data() as UserProfile);
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
            
            if (userEmail === 'heikki.laivamaa@gmail.com') {
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
          
          if (userEmail === 'heikki.laivamaa@gmail.com') {
            fallbackRole = 'superadmin';
          } else if (PREDEFINED_ADMINS.includes(userEmail)) {
            fallbackRole = 'admin';
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

  const signInWithGoogle = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Virhe kirjautumisessa:", error);
    }
  };

  useEffect(() => {
    getRedirectResult(auth).catch(error => {
      console.error("Virhe redirect-kirjautumisessa:", error);
    });
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Virhe uloskirjautumisessa:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
