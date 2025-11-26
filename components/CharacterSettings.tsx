'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, X, User } from 'lucide-react';
import { createCharacter, updateCharacter, deleteCharacter, getCharacters } from '@/app/actions/character';
import ImageUpload from './ImageUpload';
import Image from 'next/image';

interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  avatar?: string;
}

interface CharacterSettingsProps {
  bookId: string;
}

export default function CharacterSettings({ bookId }: CharacterSettingsProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [personality, setPersonality] = useState('');
  const [avatar, setAvatar] = useState('');

  const loadCharacters = useCallback(async () => {
    if (!bookId) return;
    const result = await getCharacters(bookId);
    if (result.success && result.data) {
      setCharacters(result.data as Character[]);
    }
    setLoading(false);
  }, [bookId]);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPersonality('');
    setAvatar('');
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (char: Character) => {
    setName(char.name);
    setDescription(char.description);
    setPersonality(char.personality);
    setAvatar(char.avatar || '');
    setEditingId(char.id);
    setIsEditing(true);
  };

  const handleSubmit = async () => {
    if (!name || !description || !personality) return;

    setLoading(true);
    try {
      if (editingId) {
        await updateCharacter(editingId, { name, description, personality, avatar });
      } else {
        await createCharacter(bookId, { name, description, personality, avatar });
      }
      await loadCharacters();
      resetForm();
    } catch (error) {
      console.error('Failed to save character', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this character?')) return;
    setLoading(true);
    await deleteCharacter(id);
    await loadCharacters();
    setLoading(false);
  };

  if (!bookId) {
    return <div className="p-4 text-center text-muted-foreground">Please save the book first to add characters.</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Characters</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Character
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-sm">{editingId ? 'Edit Character' : 'New Character'}</h4>
            <button onClick={resetForm} className="text-muted-foreground hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="w-20 h-20 rounded-full bg-white/5 overflow-hidden border border-white/10 relative group">
                {avatar ? (
                  <Image src={avatar} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="mt-2">
                 <ImageUpload 
                   value={avatar}
                   onChange={setAvatar}
                   label="Avatar"
                   aspectRatio="square"
                 />
              </div>
            </div>
            
            <div className="flex-1 space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
              />
              <textarea
                placeholder="Description (Visible to readers)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Personality & Context (Hidden from readers, used by AI)</label>
            <textarea
              placeholder="e.g. Sarcastic, loyal to the king, hates dragons. Knows the secret of the dungeon."
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              rows={3}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={resetForm}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !name || !description || !personality}
              className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Character'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {characters.map((char) => (
          <div key={char.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden shrink-0 relative">
              {char.avatar ? (
                <Image src={char.avatar} alt={char.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-white truncate">{char.name}</h4>
              <p className="text-xs text-muted-foreground truncate">{char.description}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(char)}
                className="p-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(char.id)}
                className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        {!loading && characters.length === 0 && !isEditing && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No characters yet. Create one to enable AI chat!
          </div>
        )}
      </div>
    </div>
  );
}
