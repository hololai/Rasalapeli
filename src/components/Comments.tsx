import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Trash2, Send, Loader2 } from 'lucide-react';

interface Comment {
  id: string;
  text: string;
  authorName: string;
  authorEmail: string;
  createdAt: any;
}

interface CommentsProps {
  imageId: string;
  isAdmin: boolean;
}

export const Comments: React.FC<CommentsProps> = ({ imageId, isAdmin }) => {
  const { profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!imageId) return;
    setLoading(true);
    const q = query(
      collection(db, `images/${imageId}/comments`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Comment[] = [];
      snapshot.forEach(doc => {
        fetched.push({ id: doc.id, ...doc.data() } as Comment);
      });
      setComments(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [imageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !profile?.displayName) return;

    try {
      setIsSubmitting(true);
      await addDoc(collection(db, `images/${imageId}/comments`), {
        text: newComment.trim(),
        authorName: profile.displayName,
        authorEmail: profile.email || '',
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (err) {
      console.error("Virhe kommentin lisäyksessä", err);
      alert("Kommentin lisäys epäonnistui.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm("Haluatko varmasti poistaa tämän kommentin?")) return;
    try {
      await deleteDoc(doc(db, `images/${imageId}/comments`, commentId));
    } catch (err) {
      console.error("Virhe poistossa", err);
      alert("Poisto epäonnistui.");
    }
  };

  return (
    <div className="mt-8 w-full border-t border-white/10 pt-6 text-left max-w-2xl mx-auto" onClick={e => e.stopPropagation()}>
      <h3 className="text-lg font-serif text-rasala-gold mb-4 flex items-center gap-2">
        <MessageSquare size={18} /> Kommentit ({comments.length})
      </h3>

      <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
        {loading ? (
          <div className="text-white/50 text-sm animate-pulse">Ladataan kommentteja...</div>
        ) : comments.length === 0 ? (
          <div className="text-white/50 text-sm italic">Ei vielä kommentteja. Kerro, jos tiedät kuvasta enemmän!</div>
        ) : (
          comments.map(c => (
            <div key={c.id} className="bg-black/40 border border-white/5 rounded-xl p-4 relative group">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-amber-500 text-sm">{c.authorName}</span>
                {isAdmin && (
                  <button 
                    onClick={() => handleDelete(c.id)}
                    className="text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Poista kommentti"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="text-white/90 text-sm leading-relaxed">{c.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 w-full">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={profile?.displayName ? "Lisää kommentti..." : "Kirjaudu sisään kommentoidaksesi"}
          disabled={!profile?.displayName || isSubmitting}
          className="flex-1 bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-base text-white focus:outline-none focus:border-rasala-gold transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || !profile?.displayName || isSubmitting}
          className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center min-w-[3rem]"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
};
