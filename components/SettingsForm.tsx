'use client';

import { useState } from 'react';
import { Save, Loader2, User, Image as ImageIcon, Link as LinkIcon, Twitter, Instagram, Globe, Terminal, Shield, Bell, Box, Sparkles } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/app/actions/user';
import AdminCommandPalette from '@/components/AdminCommandPalette';
import { equipItem, unequipItem } from '@/app/actions/store';
import PushNotificationToggle from '@/components/PushNotificationToggle';

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

export interface NotificationSettings {
  newFollowers: boolean;
  bookComments: boolean;
  systemUpdates: boolean;
  emailDigest: boolean;
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
    notificationSettings?: string | null;
    items?: UserItem[];
  };
}

type TabType = 'profile' | 'inventory' | 'preferences' | 'security' | 'notifications';

export default function SettingsForm({ user }: SettingsFormProps) {
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
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
    geminiApiKey: user.geminiApiKey || '',
    notificationSettings: user.notificationSettings 
      ? JSON.parse(user.notificationSettings) 
      : { newFollowers: true, bookComments: true, systemUpdates: true, emailDigest: false }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('bio', formData.bio);
      
      if (formData.image !== user.image) {
        if (formData.image && formData.image.startsWith('data:')) {
          const imageBlob = await fetch(formData.image).then(r => r.blob());
          data.append('image', imageBlob, 'profile-image.jpg');
        } else if (formData.image) {
           data.append('image', formData.image);
        }
      }

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
      data.append('notificationSettings', JSON.stringify(formData.notificationSettings));

      const result = await updateProfile(data);
      
      if (result.error) {
        throw new Error(result.error);
      }

      setNotification({ type: 'success', message: 'Profile updated successfully!' });
      router.refresh();
      
    } catch (error) {
      console.error('Profile update error:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        setNotification({ type: 'error', message: 'Upload timed out. Try a smaller image.' });
      } else {
        setNotification({ type: 'error', message: 'Something went wrong. Please try again.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEquip = async (itemId: string, currentEquipped: boolean) => {
    setSaving(true);
    try {
      if (currentEquipped) {
        await unequipItem(itemId);
      } else {
        await equipItem(itemId);
      }
      router.refresh();
      setNotification({ type: 'success', message: currentEquipped ? 'Item unequipped' : 'Item equipped' });
    } catch {
      setNotification({ type: 'error', message: 'Failed to update item' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'inventory', label: 'Inventory', icon: Box },
    { id: 'preferences', label: 'Preferences', icon: Sparkles },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 py-3 sm:p-4 md:p-8 overflow-x-hidden w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-linear-to-r from-white via-blue-100 to-white/50 bg-clip-text text-transparent">
            {t('profileSettings') || 'Settings'}
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">Manage your account preferences and profile.</p>
        </div>
        
        {/* Mobile Action Button */}
        <button
          onClick={handleSubmit} // Using the same submit handler
          disabled={saving}
          className="md:hidden w-full flex items-center justify-center px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 text-sm"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {notification && (
        <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border backdrop-blur-md flex items-center gap-2 sm:gap-3 animate-in fade-in slide-in-from-top-2 text-sm ${
          notification.type === 'success' 
            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {notification.type === 'success' ? <Shield className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
          {notification.message}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-3 sm:gap-4 md:gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-2 w-full">
          {/* Mobile: Grid de ícones */}
          <div className="glass-card p-1.5 rounded-xl bg-black/20 backdrop-blur-xl border border-white/10 grid grid-cols-5 gap-1 sm:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-lg transition-all
                  ${activeTab === tab.id 
                    ? 'bg-primary/20 text-primary' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : 'opacity-70'}`} />
                <span className="text-[8px] font-medium truncate w-full text-center">{tab.label.slice(0, 4)}</span>
              </button>
            ))}
          </div>
          
          {/* Desktop: Lista vertical */}
          <div className="glass-card p-1.5 rounded-xl bg-black/20 backdrop-blur-xl border border-white/10 hidden sm:flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all w-full text-left text-xs
                  ${activeTab === tab.id 
                    ? 'bg-primary/20 text-primary border border-primary/20' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent'}`}
              >
                <tab.icon className={`w-4 h-4 shrink-0 ${activeTab === tab.id ? 'text-primary' : 'opacity-70'}`} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
          
          {/* Desktop Save Button */}
          <button
            onClick={handleSubmit} // Trigger form submit via button for consistency
            disabled={saving}
            className="hidden lg:flex w-full items-center justify-center px-6 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] mt-6"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {saving ? t('saving') || 'Saving...' : t('saveChanges') || 'Save Changes'}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-4 sm:space-y-6 overflow-hidden">
          <div className="min-h-[400px] sm:min-h-[600px]">
            {activeTab === 'profile' && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Images Section */}
                <div className="glass-card p-2.5 sm:p-3 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl space-y-3 sm:space-y-4 md:space-y-6 border border-white/10 bg-black/20 backdrop-blur-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  
                  <div>
                    <h2 className="text-sm sm:text-lg md:text-xl font-bold flex items-center gap-2 text-white/90 mb-3 sm:mb-4 md:mb-6">
                      <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                      {t('visualIdentity')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-8">
                      <ImageUpload
                        label={t('profileAvatar')}
                        value={formData.image}
                        onChange={(value) => setFormData({...formData, image: value})}
                        aspectRatio="square"
                      />
                      <ImageUpload
                        label={t('profileBanner')}
                        value={formData.banner}
                        onChange={(value) => setFormData({...formData, banner: value})}
                        aspectRatio="video"
                      />
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="glass-card p-2.5 sm:p-3 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl space-y-3 sm:space-y-4 md:space-y-6 border border-white/10 bg-black/20 backdrop-blur-xl">
                  <h2 className="text-sm sm:text-lg md:text-xl font-bold flex items-center gap-2 text-white/90 mb-2 sm:mb-3 md:mb-4">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                    {t('personalInfo')}
                  </h2>

                  <div className="grid md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">{t('displayName')}</label>
                      <input
                        type="text"
                        style={{ minWidth: 0 }}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:border-primary/50 transition-all text-sm"
                        placeholder="Your Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">{t('username')}</label>
                      <input
                        type="text"
                        style={{ minWidth: 0 }}
                        value={formData.username}
                        disabled
                        className="w-full bg-black/20 border border-white/5 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-muted-foreground cursor-not-allowed text-sm"
                      />
                    </div>
                    <div className="col-span-full">
                      <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">{t('bio')}</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="w-full h-24 sm:h-32 bg-black/40 border border-white/10 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:border-primary/50 resize-none transition-all text-sm"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="glass-card p-2.5 sm:p-3 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl space-y-3 sm:space-y-4 md:space-y-6 border border-white/10 bg-black/20 backdrop-blur-xl">
                  <h2 className="text-sm sm:text-lg md:text-xl font-bold flex items-center gap-2 text-white/90">
                    <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                    {t('socialConnections')}
                  </h2>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-3 md:gap-4">
                    {[
                      { icon: Twitter, key: 'twitter', placeholder: 'Twitter URL' },
                      { icon: Instagram, key: 'instagram', placeholder: 'Instagram URL' },
                      { icon: Globe, key: 'website', placeholder: 'Website URL' }
                    ].map(({ icon: Icon, key, placeholder }) => (
                      <div key={key} className="relative group">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                          type="text"
                          value={(formData.socialLinks as unknown as SocialLinks)[key as keyof SocialLinks]}
                          onChange={(e) => setFormData({
                            ...formData, 
                            socialLinks: {...formData.socialLinks, [key]: e.target.value}
                          })}
                          className="w-full bg-black/40 border border-white/10 rounded-lg sm:rounded-xl pl-9 sm:pl-10 pr-2 sm:pr-3 py-2 sm:py-2.5 focus:outline-none focus:border-primary/50 transition-all text-xs sm:text-sm"
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="glass-card p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl space-y-4 sm:space-y-6 border border-white/10 bg-linear-to-br from-zinc-900/80 to-black/60 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 sm:gap-3 text-white">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-linear-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                      </div>
                      Seu Inventário
                    </h2>
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-linear-to-r from-primary/20 to-purple-600/20 rounded-full border border-primary/30">
                      <Box className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                      <span className="text-xs sm:text-sm font-bold text-white">{user.items?.length || 0} itens</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {(() => {
                        const itemsByType = (user.items || []).reduce((acc, item) => {
                            const type = item.item.type || 'OTHER';
                            if (!acc[type]) acc[type] = [];
                            acc[type].push(item);
                            return acc;
                        }, {} as Record<string, UserItem[]>);
                        
                        const types = Object.keys(itemsByType);
                        
                        if (types.length === 0) {
                            return (
                                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-linear-to-br from-zinc-800/50 to-zinc-900/50 flex items-center justify-center mb-6 border border-white/5">
                                        <Box className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-600" />
                                    </div>
                                    <p className="font-bold text-lg sm:text-xl text-white/80 mb-2">Inventário Vazio</p>
                                    <p className="text-sm text-zinc-500 max-w-xs">Colecione itens de conquistas e da loja para personalizar seu perfil!</p>
                                </div>
                            );
                        }

                        return types.map(type => (
                            <div key={type} className="space-y-4">
                                <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-linear-to-r from-zinc-800/50 to-zinc-900/50 border border-white/5">
                                    <span className="text-xl sm:text-2xl">
                                        {type === 'FRAME' && '🖼️'}
                                        {type === 'BUBBLE' && '💬'}
                                        {type === 'BACKGROUND' && '🌄'}
                                    </span>
                                    <h3 className="text-base sm:text-lg font-bold text-white">
                                        {type === 'FRAME' && 'Molduras'}
                                        {type === 'BUBBLE' && 'Balões de Chat'}
                                        {type === 'BACKGROUND' && 'Fundos'}
                                        {type !== 'FRAME' && type !== 'BUBBLE' && type !== 'BACKGROUND' && type}
                                    </h3>
                                    <span className="ml-auto text-xs sm:text-sm text-white/50 bg-black/30 px-2 py-1 rounded-full">
                                        {itemsByType[type].length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                    {itemsByType[type].map((userItem) => (
                                        <div key={userItem.item.id} className={`group bg-black/40 border rounded-xl p-2 sm:p-3 flex flex-col items-center text-center gap-1.5 sm:gap-2 transition-all hover:scale-[1.02] ${
                                            userItem.equipped ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                                        }`}>
                                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 flex items-center justify-center bg-gray-900/50 relative overflow-hidden shrink-0 ${
                                                userItem.item.rarity === 'LEGENDARY' ? 'border-orange-500 shadow-orange-500/20' :
                                                userItem.item.rarity === 'EPIC' ? 'border-purple-500 shadow-purple-500/20' :
                                                userItem.item.rarity === 'RARE' ? 'border-blue-500 shadow-blue-500/20' :
                                                'border-gray-600'
                                            }`}>
                                                
                                                {/* Visual Preview based on Type */}
                                                {type === 'FRAME' && (
                                                     <span className="text-xs sm:text-sm font-bold text-white/30 group-hover:text-white/50 transition-colors">
                                                        {userItem.item.name.substring(0, 2).toUpperCase()}
                                                     </span>
                                                )}

                                                {type === 'BUBBLE' && (
                                                     <div className={`w-3/4 h-3/4 bg-white/20 rounded-lg ${userItem.item.data?.cssClass as string || ''}`}></div>
                                                )}

                                                {type === 'BACKGROUND' && (
                                                     <div className="w-full h-full bg-cover bg-center opacity-50" style={{ backgroundImage: `url(${userItem.item.image})` }}></div>
                                                )}
                                                
                                                {/* Glow effect based on rarity */}
                                                <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity ${
                                                    userItem.item.rarity === 'LEGENDARY' ? 'bg-orange-500' :
                                                    userItem.item.rarity === 'EPIC' ? 'bg-purple-500' :
                                                    userItem.item.rarity === 'RARE' ? 'bg-blue-500' :
                                                    'bg-transparent'
                                                }`} />
                                            </div>
                                            
                                            <div className="w-full min-w-0 overflow-hidden">
                                                <h3 className="text-[10px] sm:text-xs font-bold text-white truncate">{userItem.item.name}</h3>
                                                <p className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wider ${
                                                    userItem.item.rarity === 'LEGENDARY' ? 'text-orange-400' :
                                                    userItem.item.rarity === 'EPIC' ? 'text-purple-400' :
                                                    userItem.item.rarity === 'RARE' ? 'text-blue-400' :
                                                    'text-gray-400'
                                                }`}>{userItem.item.rarity}</p>
                                            </div>
                                            
                                            <button
                                                onClick={() => handleEquip(userItem.item.id, userItem.equipped)}
                                                disabled={saving}
                                                className={`w-full text-xs sm:text-sm py-2 sm:py-2.5 rounded-xl font-bold transition-all mt-auto ${
                                                userItem.equipped 
                                                    ? 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 border border-zinc-700' 
                                                    : 'bg-linear-to-r from-primary to-purple-600 text-white hover:from-primary/90 hover:to-purple-500 shadow-lg shadow-primary/20'
                                                } disabled:opacity-50`}
                                            >
                                                {saving ? '...' : userItem.equipped ? 'Desequipar' : 'Equipar'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ));
                    })()}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="glass-card p-2.5 sm:p-3 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl space-y-3 sm:space-y-4 md:space-y-6 border border-white/10 bg-black/20 backdrop-blur-xl">
                  <h2 className="text-sm sm:text-lg md:text-xl font-bold flex items-center gap-2 text-white/90">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                    {t('languagePreferences')}
                  </h2>

                  <div className="grid md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <div className="p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-black/40 border border-white/5">
                      <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3 md:mb-4">{t('interfaceLanguage')}</label>
                      <div className="space-y-2">
                        {[
                          { code: 'en', label: 'English', flag: '🇺🇸' },
                          { code: 'pt', label: 'Português', flag: '🇧🇷' },
                          { code: 'jp', label: '日本語', flag: '🇯🇵' }
                        ].map((lang) => (
                           <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code as 'en' | 'pt' | 'jp')}
                            className={`w-full flex items-center justify-between p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl transition-all border ${
                              language === lang.code 
                                ? 'bg-primary/20 border-primary/50 text-white' 
                                : 'bg-transparent border-transparent hover:bg-white/5 text-muted-foreground'
                            }`}
                          >
                            <span className="flex items-center gap-2 sm:gap-3">
                              <span className="text-base sm:text-lg md:text-xl">{lang.flag}</span>
                              <span className="font-medium text-xs sm:text-sm md:text-base">{lang.label}</span>
                            </span>
                            {language === lang.code && <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />}
                           </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-2.5 sm:p-3 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl space-y-3 sm:space-y-4 md:space-y-6 border border-white/10 bg-black/20 backdrop-blur-xl">
                  <h2 className="text-sm sm:text-lg md:text-xl font-bold flex items-center gap-2 text-white/90">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 shrink-0" />
                    {t('aiConfiguration')}
                  </h2>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">{t('geminiApiKey')}</label>
                    <input
                      type="password"
                      value={formData.geminiApiKey}
                      onChange={(e) => setFormData({...formData, geminiApiKey: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:border-purple-500/50 transition-all font-mono text-xs sm:text-sm"
                      placeholder="Enter your API Key..."
                    />
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2 opacity-70">
                      Required for AI writing assistance and character chat features. Your key is stored securely (encrypted).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="glass-card p-2.5 sm:p-3 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl space-y-3 sm:space-y-4 md:space-y-6 border border-white/10 bg-black/20 backdrop-blur-xl">
                  <h2 className="text-sm sm:text-lg md:text-xl font-bold flex items-center gap-2 text-white/90">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                    Notification Settings
                  </h2>
                  
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    {[
                      { key: 'newFollowers', title: t('newFollowers'), desc: t('newFollowersDesc') },
                      { key: 'bookComments', title: t('bookComments'), desc: t('bookCommentsDesc') },
                      { key: 'systemUpdates', title: t('systemUpdates'), desc: t('systemUpdatesDesc') },
                      { key: 'emailDigest', title: t('emailDigest'), desc: t('emailDigestDesc') },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-black/40 border border-white/5 gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <h3 className="font-medium text-white text-xs sm:text-sm md:text-base truncate">{item.title}</h3>
                          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{item.desc}</p>
                        </div>
                        <button
                          type="button"
                              onClick={() => setFormData({
                                ...formData,
                                notificationSettings: {
                                  ...formData.notificationSettings as unknown as NotificationSettings,
                                  [item.key as string]: !(formData.notificationSettings as unknown as NotificationSettings)[item.key as keyof NotificationSettings]
                                }
                              })}
                              className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full relative transition-colors duration-300 focus:outline-none shrink-0 ${
                                (formData.notificationSettings as unknown as NotificationSettings)[item.key as keyof NotificationSettings] ? 'bg-primary' : 'bg-white/10'
                              }`}
                            >
                              <div className={`absolute top-0.5 sm:top-1 left-0.5 sm:left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${
                                (formData.notificationSettings as unknown as NotificationSettings)[item.key as keyof NotificationSettings] ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
                              }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="glass-card p-2.5 sm:p-3 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl space-y-3 sm:space-y-4 md:space-y-6 border border-white/10 bg-black/20 backdrop-blur-xl">
                  <h2 className="text-sm sm:text-lg md:text-xl font-bold flex items-center gap-2 text-white/90">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 shrink-0" />
                    {t('pushNotifications')}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('pushDisabledDesc')}
                  </p>
                  <PushNotificationToggle />
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="glass-card p-2.5 sm:p-3 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl space-y-3 sm:space-y-4 md:space-y-6 border border-white/10 bg-black/20 backdrop-blur-xl">
                  <h2 className="text-sm sm:text-lg md:text-xl font-bold flex items-center gap-2 text-white/90">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                    Security
                  </h2>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="font-medium text-white text-sm sm:text-base mb-2 sm:mb-3 md:mb-4">Password</h3>
                      <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors">
                        Change Password
                      </button>
                    </div>

                    <div className="p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-red-500/10 border border-red-500/20">
                      <h3 className="font-bold text-red-400 text-xs sm:text-sm md:text-base mb-0.5 sm:mb-1">Danger Zone</h3>
                      <p className="text-[10px] sm:text-xs text-red-300/70 mb-2 sm:mb-3 md:mb-4">Irreversible actions regarding your account.</p>
                      <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
}
