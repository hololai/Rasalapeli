import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import type { UserProfile, UserRole } from '../contexts/AuthContext';
import { Shield, ShieldAlert, Trash2, User as UserIcon } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export function AdminPanel() {
  const { profile, loading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vain ylläpitäjät saavat ladata käyttäjälistan (Firestore-säännöt varmistavat tämän myös)
    if (profile?.role === 'superadmin' || profile?.role === 'admin') {
      fetchUsers();
    }
  }, [profile]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const querySnapshot = await getDocs(collection(db, 'users'));
      const fetchedUsers: UserProfile[] = [];
      querySnapshot.forEach((docSnap) => {
        const u = docSnap.data() as UserProfile;
        
        // Automaattinen korjaus Miljalle
        if (u.email === 'milja.laivamaa93@gmail.com' && (u.displayName === 'Tuntematon' || !u.displayName)) {
          u.displayName = 'Milja Saarnio';
          updateDoc(doc(db, 'users', u.uid), { displayName: 'Milja Saarnio' }).catch(console.error);
        }
        
        fetchedUsers.push(u);
      });
      // Järjestetään niin että superadmin on ensimmäisenä, sitten adminit
      fetchedUsers.sort((a, b) => {
        if (a.role === 'superadmin') return -1;
        if (b.role === 'superadmin') return 1;
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (b.role === 'admin' && a.role !== 'admin') return 1;
        return 0;
      });
      setUsers(fetchedUsers);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Käyttäjien hakeminen epäonnistui. Varmista tietokannan säännöt.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    if (!window.confirm(`Haluatko varmasti muuttaa käyttäjän rooliksi: ${newRole}?`)) return;
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { role: newRole });
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
      alert('Roolin vaihto epäonnistui. Vain Superadmin voi vaihtaa rooleja.');
    }
  };

  const handleDeleteUser = async (uid: string, email: string) => {
    if (!window.confirm(`VAROITUS: Haluatko varmasti poistaa käyttäjän ${email}? Tämä poistaa käyttäjän profiilin tietokannasta.`)) return;
    try {
      const userRef = doc(db, 'users', uid);
      await deleteDoc(userRef);
      setUsers(users.filter(u => u.uid !== uid));
    } catch (err) {
      console.error(err);
      alert('Käyttäjän poisto epäonnistui.');
    }
  };

  if (loading) return <div className="p-8 text-center">Ladataan...</div>;
  if (profile?.role !== 'superadmin' && profile?.role !== 'admin') return <Navigate to="/" />;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-8 h-8 text-red-500" />
        <h1 className="text-3xl font-bold font-serif text-amber-900 dark:text-amber-100">Hallintapaneeli</h1>
      </div>
      
      <p className="text-stone-600 dark:text-stone-300 mb-8">
        Tervetuloa {profile?.role === 'superadmin' ? 'Superadmin' : 'Ylläpitäjä'}. Täällä voit hallita sovelluksen käyttäjiä ja heidän oikeuksiaan.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-stone-800 shadow-xl rounded-2xl overflow-hidden border border-amber-900/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-100 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700">
                <th className="p-4 font-semibold text-stone-700 dark:text-stone-300">Käyttäjä</th>
                <th className="p-4 font-semibold text-stone-700 dark:text-stone-300">Sähköposti</th>
                <th className="p-4 font-semibold text-stone-700 dark:text-stone-300">Rooli</th>
                <th className="p-4 font-semibold text-stone-700 dark:text-stone-300 text-right">Toiminnot</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-stone-500">Haetaan käyttäjiä...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-stone-500">Ei käyttäjiä löytynyt.</td>
                </tr>
              ) : (
                users.map(u => {
                  const isSuperAdmin = profile?.role === 'superadmin';
                  const isAdmin = profile?.role === 'admin';
                  const canEdit = isSuperAdmin ? (u.uid !== profile?.uid) : (isAdmin && (u.role === 'pending' || u.role === 'user'));
                  
                  return (
                  <tr key={u.uid} className="border-b border-stone-100 dark:border-stone-700/50 hover:bg-stone-50 dark:hover:bg-stone-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt={u.displayName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-stone-400" />
                          </div>
                        )}
                        <span className="font-medium text-stone-800 dark:text-stone-100">{u.displayName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-stone-600 dark:text-stone-400">
                      {u.email}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.role === 'superadmin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        u.role === 'admin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                        u.role === 'pending' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-300'
                      }`}>
                        {u.role === 'superadmin' && <ShieldAlert className="w-3.5 h-3.5" />}
                        {u.role === 'admin' && <Shield className="w-3.5 h-3.5" />}
                        {u.role === 'pending' && <span className="text-lg leading-none">⏳</span>}
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && (
                          <>
                            <select
                              className="text-sm bg-stone-50 border border-stone-200 text-stone-800 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2 dark:bg-stone-700 dark:border-stone-600 dark:placeholder-stone-400 dark:text-white"
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                            >
                              <option value="pending">PENDING</option>
                              <option value="user">USER</option>
                              {isSuperAdmin && <option value="admin">ADMIN</option>}
                            </select>
                            
                            <button
                              onClick={() => handleDeleteUser(u.uid, u.email)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-2"
                              title="Poista käyttäjä"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
