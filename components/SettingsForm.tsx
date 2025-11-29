'use client';

import { useState } from 'react';
import { Save, Loader2, User, Image as ImageIcon, Link as LinkIcon, Twitter, Instagram, Globe, Terminal } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { updateProfile } from '@/app/actions/user';
import AdminCommandPalette from '@/components/AdminCommandPalette';
import { equipItem, unequipItem } from '@/app/actions/store';

interface ItemData {
  cssClass?: string;
  animation?: string;
  [key: string]: unknown;
}

export interface UserItem {
  item: {
    id: string;
    name: string;
    description: string;
    type: string;
    rarity: string;
    image: string | null;
    data: ItemData | null;
  };
  equipped: boolean;
}

export interface SocialLinks {
  twitter: string;
  instagram: string;
  website: string;
}

export interface SettingsFormProps {
  user: {
    name: string | null;
    username: string;
    bio: string | null;
    image: string | null;
    banner: string | null;
    socialLinks: string | SocialLinks | null;
    geminiApiKey: string | null;
    items?: UserItem[];
  };
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [showAdminConsole, setShowAdminConsole] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name || '',
    username: user.username || '',
    bio: user.bio || '',
    image: user.image || '',
    banner: user.banner || '',
    socialLinks: typeof user.socialLinks === 'string' 
      ? JSON.parse(user.socialLinks) 
      : (user.socialLinks || { twitter: '', instagram: '', website: '' }),
    geminiApiKey: user.geminiApiKey || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('bio', formData.bio);
      // Only append image if it has changed
      if (formData.image !== user.image) {
        if (formData.image && formData.image.startsWith('data:')) {
          const imageBlob = await fetch(formData.image).then(r => r.blob());
          data.append('image', imageBlob, 'profile-image.jpg');
        } else if (formData.image) {
           data.append('image', formData.image);
        }
      }

      // Only append banner if it has changed
      if (formData.banner !== user.banner) {
        if (formData.banner && formData.banner.startsWith('data:')) {
          const bannerBlob = await fetch(formData.banner).then(r => r.blob());
          data.append('banner', bannerBlob, 'profile-banner.jpg');
        } else if (formData.banner) {
          data.append('banner', formData.banner);
        }
      }

      data.append('socialLinks', JSON.stringify(formData.socialLinks));
      data.append('geminiApiKey', formData.geminiApiKey);

      console.log('Sending profile update...');

      const result = await updateProfile(data);
      
      if (result.error) {
        throw new Error(result.error);
      }

      setNotification({ type: 'success', message: 'Profile updated successfully!' });
      router.refresh();
      
    } catch (error) {
      console.error('Profile update error:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        setNotification({ 
          type: 'error', 
          message: 'Upload timed out. Please try with a smaller image.' 
        });
      } else if (error instanceof Error && error.message.includes('Unexpected end of form')) {
        setNotification({
          type: 'error',
          message: 'Upload failed (Server Error). The image might be too large or the connection was interrupted. Please try a smaller image.'
        });
      } else {
        setNotification({ 
          type: 'error', 
          message: error instanceof Error ? error.message : 'Something went wrong. Please try again.' 
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEquip = async (itemId: string, currentEquipped: boolean) => {
    setSaving(true); // Reuse saving state for loading indicator
    try {
      if (currentEquipped) {
        await unequipItem(itemId);
      } else {
        await equipItem(itemId);
      }
      router.refresh();
      setNotification({ type: 'success', message: currentEquipped ? 'Item unequipped' : 'Item equipped' });
    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', message: 'Failed to update item' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 bg-linear-to-r from-white to-white/50 bg-clip-text text-transparent">
        {t('profileSettings')}
      </h1>

      {notification && (
        <div className={`mb-6 p-4 rounded-xl border backdrop-blur-md ${
          notification.type === 'success' 
            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column: Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          {/* Images Section */}
          <div className="glass-card p-4 md:p-6 rounded-2xl space-y-6 border border-white/10 bg-black/20 backdrop-blur-xl">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white/90">
              <ImageIcon className="w-5 h-5 text-primary" />
              {t('visualIdentity')}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <ImageUpload
                  label={t('profileAvatar')}
                  value={formData.image}
                  onChange={(value) => setFormData({...formData, image: value})}
                  aspectRatio="square"
                />
              </div>
              
              <div className="space-y-2">
                <ImageUpload
                  label={t('profileBanner')}
                  value={formData.banner}
                  onChange={(value) => setFormData({...formData, banner: value})}
                  aspectRatio="video"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Current payload size: {((formData.image?.length || 0) + (formData.banner?.length || 0)) / 1024 > 1024 
                ? `${(((formData.image?.length || 0) + (formData.banner?.length || 0)) / 1024 / 1024).toFixed(2)} MB`
                : `${(((formData.image?.length || 0) + (formData.banner?.length || 0)) / 1024).toFixed(2)} KB`}
            </p>
          </div>

          {/* Mobile Preview (Moved Here) */}
          <div className="lg:hidden space-y-6">
            <div className="glass-card rounded-3xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl">
              {/* Banner Preview */}
              <div className="h-32 w-full bg-linear-to-r from-gray-800 to-gray-900 relative">
                {formData.banner ? (
                  <Image src={formData.banner} alt="Banner" fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/10">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Avatar & Info */}
              <div className="px-6 pb-6 -mt-12 relative">
                <div className="w-24 h-24 rounded-full border-4 border-black bg-gray-800 overflow-hidden shadow-xl mb-4 relative">
                  {formData.image ? (
                    <Image src={formData.image} alt="Avatar" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">
                  {formData.name || t('yourName')}
                </h2>
                <p className="text-primary font-medium mb-4">@username</p>

                <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                  {formData.bio || t('bioPreview')}
                </p>
              </div>
            </div>
          </div>

          {/* Language Section */}
          <div className="glass-card p-4 md:p-6 rounded-2xl space-y-6 border border-white/10 bg-black/20 backdrop-blur-xl">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white/90">
              <Globe className="w-5 h-5 text-primary" />
              {t('languagePreferences')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">{t('interfaceLanguage')}</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'pt' | 'jp')}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all [&>option]:bg-black"
                >
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                  <option value="jp">日本語</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">{t('languageHelp')}</p>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="glass-card p-4 md:p-6 rounded-2xl space-y-6 border border-white/10 bg-black/20 backdrop-blur-xl">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white/90">
              <User className="w-5 h-5 text-primary" />
              {t('personalInfo')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">{t('username')}</label>
                <input
                  type="text"
                  value={formData.username}
                  disabled
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">{t('usernameHelp')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">{t('displayName')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
                  placeholder={t('yourName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">{t('bio')}</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full h-32 bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 resize-none transition-all placeholder:text-white/20"
                  placeholder={t('bioPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="glass-card p-4 md:p-6 rounded-2xl space-y-6 border border-white/10 bg-black/20 backdrop-blur-xl">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white/90">
              <LinkIcon className="w-5 h-5 text-primary" />
              {t('socialConnections')}
            </h2>

            <div className="space-y-4">
              <div className="relative group">
                <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => setFormData({
                    ...formData, 
                    socialLinks: {...formData.socialLinks, twitter: e.target.value}
                  })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="Twitter URL"
                />
              </div>

              <div className="relative group">
                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => setFormData({
                    ...formData, 
                    socialLinks: {...formData.socialLinks, instagram: e.target.value}
                  })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="Instagram URL"
                />
              </div>

              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={formData.socialLinks.website}
                  onChange={(e) => setFormData({
                    ...formData, 
                    socialLinks: {...formData.socialLinks, website: e.target.value}
                  })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="Website URL"
                />
              </div>
            </div>
          </div>

          {/* Inventory Section */}
          <div className="glass-card p-4 md:p-6 rounded-2xl space-y-6 border border-white/10 bg-black/20 backdrop-blur-xl">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white/90">
              <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] font-bold text-black">IV</div>
              Inventory
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {user.items && user.items.length > 0 ? (
                user.items.map((userItem: UserItem) => (
                  <div key={userItem.item.id} className={`bg-black/40 border rounded-xl p-3 flex flex-col items-center text-center gap-2 transition-colors ${
                    userItem.equipped ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-primary/50'
                  }`}>
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-gray-800 ${
                      userItem.item.rarity === 'LEGENDARY' ? 'border-orange-500 shadow-orange-500/50 shadow-lg' :
                      userItem.item.rarity === 'EPIC' ? 'border-purple-500 shadow-purple-500/50 shadow-lg' :
                      userItem.item.rarity === 'RARE' ? 'border-blue-500 shadow-blue-500/50 shadow-lg' :
                      'border-gray-500'
                    }`}>
                      {/* Placeholder for item icon/image if available, otherwise generic icon */}
                      <div className="text-xs font-bold text-white/50">{userItem.item.name.substring(0, 2).toUpperCase()}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{userItem.item.name}</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{userItem.item.rarity}</p>
                    </div>
                    
                    <button
                      onClick={() => handleEquip(userItem.item.id, userItem.equipped)}
                      disabled={saving}
                      className={`text-xs px-3 py-1 rounded-full font-bold transition-all ${
                        userItem.equipped 
                          ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600' 
                          : 'bg-primary text-white hover:bg-primary/90'
                      }`}
                    >
                      {userItem.equipped ? 'Unequip' : 'Equip'}
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <p>Equipped items and collection will appear here.</p>
                  <p className="text-xs mt-2">Use command <code className="bg-white/10 px-1 rounded">@user md code</code> to redeem items.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Settings */}
          <div className="glass-card p-4 md:p-6 rounded-2xl space-y-6 border border-white/10 bg-black/20 backdrop-blur-xl">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white/90">
              <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold">AI</div>
              {t('aiConfiguration')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">{t('geminiApiKey')}</label>
                <input
                  type="password"
                  value={formData.geminiApiKey}
                  onChange={(e) => setFormData({...formData, geminiApiKey: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-white/20"
                  placeholder="AIza..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('apiKeyHelp')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              {saving ? t('saving') : t('saveChanges')}
            </button>
          </div>
        </form>

        {/* Admin Console Button (Only for 'login' user) */}
        {user.username === 'login' && (
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setShowAdminConsole(true)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white p-3 rounded-full shadow-lg border border-white/10 transition-all"
              title="Admin Console"
            >
              <Terminal className="w-5 h-5" />
            </button>
            <AdminCommandPalette 
              username={user.username} 
              isOpen={showAdminConsole} 
              onClose={() => setShowAdminConsole(false)} 
            />
          </div>
        )}

        {/* Right Column: Live Preview (Desktop Only) */}
        <div className="hidden lg:block space-y-6">
          <div className="sticky top-8">
            <h2 className="text-sm font-bold mb-6 text-muted-foreground uppercase tracking-wider">{t('livePreview')}</h2>
            
            {/* Profile Card Preview */}
            <div className="glass-card rounded-3xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl">
              {/* Banner Preview */}
              <div className="h-32 md:h-48 w-full bg-linear-to-r from-gray-800 to-gray-900 relative">
                {formData.banner ? (
                  <Image src={formData.banner} alt="Banner" fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/10">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Avatar & Info */}
              <div className="px-6 md:px-8 pb-8 -mt-12 md:-mt-16 relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-black bg-gray-800 overflow-hidden shadow-xl mb-4 relative">
                  {formData.image ? (
                    <Image src={formData.image} alt="Avatar" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>

                <h2 className="text-3xl font-bold text-white mb-1">
                  {formData.name || t('yourName')}
                </h2>
                <p className="text-primary font-medium mb-4">@username</p>

                <p className="text-gray-300 leading-relaxed mb-6">
                  {formData.bio || t('bioPreview')}
                </p>

                <div className="flex gap-3">
                  {formData.socialLinks.twitter && (
                    <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-primary transition-colors">
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {formData.socialLinks.instagram && (
                    <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-primary transition-colors">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {formData.socialLinks.website && (
                    <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-primary transition-colors">
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
