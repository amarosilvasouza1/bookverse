'use client';

import { useState } from 'react';
import { Save, Loader2, User, Image as ImageIcon, Link as LinkIcon, Twitter, Instagram, Globe, Terminal, Shield, Bell, Box, Sparkles, ChevronRight, type LucideIcon } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/app/actions/user';
import AdminCommandPalette from '@/components/AdminCommandPalette';
import { equipItem, unequipItem } from '@/app/actions/store';
import PushNotificationToggle from '@/components/PushNotificationToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility

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

      setNotification({ type: 'success', message: t('profileUpdated') || 'Profile updated successfully!' });
      router.refresh();
      
    } catch (error) {
      console.error('Profile update error:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        setNotification({ type: 'error', message: t('uploadTimeout') || 'Upload timed out. Try a smaller image.' });
      } else {
        setNotification({ type: 'error', message: t('genericError') || 'Something went wrong. Please try again.' });
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
      setNotification({ type: 'error', message: t('genericError') });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: t('tabProfile'), icon: User },
    { id: 'inventory', label: t('tabInventory'), icon: Box },
    { id: 'preferences', label: t('tabPreferences'), icon: Sparkles },
    { id: 'notifications', label: t('tabNotifications'), icon: Bell },
    { id: 'security', label: t('tabSecurity'), icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 min-h-screen" suppressHydrationWarning>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent tracking-tight">
            {t('profileSettings') || 'Settings'}
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-md leading-relaxed">
            {t('settingsPageDesc')}
          </p>
        </div>
        
        {/* Mobile Save Button (Sticky/Fixed or Top) */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="md:hidden w-full flex items-center justify-center px-6 py-3 bg-indigo-600/90 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          {saving ? t('saving') : t('saveChanges')}
        </button>
      </div>

      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "mb-8 p-4 rounded-xl border backdrop-blur-xl flex items-center gap-3 shadow-lg",
            notification.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
              : 'bg-red-500/10 text-red-300 border-red-500/20'
          )}
        >
          {notification.type === 'success' ? <Sparkles className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
          <span className="font-medium text-sm">{notification.message}</span>
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Navigation Sidebar */}
        <div className="lg:w-64 shrink-0 space-y-8">
          
          {/* Mobile: Grid / Wrapped Tabs (No Scroll) */}
          <div className="lg:hidden mb-6">
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                 {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl text-xs font-medium transition-all border",
                        activeTab === tab.id 
                          ? "bg-zinc-800 text-white border-zinc-700 shadow-md" 
                          : "bg-zinc-900/50 text-zinc-400 border-white/5 hover:bg-zinc-800/80 hover:text-zinc-200"
                      )}
                    >
                      <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-indigo-400" : "text-zinc-500")} />
                      {tab.label}
                    </button>
                 ))}
             </div>
          </div>

          {/* Desktop: Vertical Navigation */}
          <div className="hidden lg:flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "relative group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                  activeTab === tab.id 
                    ? "text-white bg-zinc-800/50 shadow-inner"
                    : "text-zinc-500 hover:text-white hover:bg-zinc-800/30"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <tab.icon className={cn(
                  "w-5 h-5 transition-colors duration-300",
                  activeTab === tab.id ? "text-indigo-400" : "text-zinc-600 group-hover:text-zinc-400"
                )} />
                {tab.label}
                
                {activeTab === tab.id && (
                   <ChevronRight className="w-4 h-4 ml-auto text-zinc-600" />
                )}
              </button>
            ))}
          </div>

          {/* Desktop Save Button */}
          <div className="hidden lg:block pt-6 border-t border-white/5">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full flex items-center justify-center px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              {saving ? t('saving') || 'Thinking...' : t('saveChanges') || 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-6"
            >
              
              {activeTab === 'profile' && (
                <>
                  <SectionCard title={t('visualIdentity') || 'Visual Identity'} icon={ImageIcon}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  </SectionCard>

                  <SectionCard title={t('personalInfo') || 'Personal Info'} icon={User}>
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <InputGroup 
                           label={t('displayName') || 'Display Name'}
                           value={formData.name}
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                           placeholder={t('displayNamePlaceholder')}
                        />
                        <InputGroup 
                           label={t('username') || 'Username'}
                           value={formData.username}
                           disabled
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">{t('bio')}</label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          className="w-full h-32 bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none transition-all"
                          placeholder={t('bioPlaceholder')}
                        />
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title={t('socialConnections') || 'Social Links'} icon={LinkIcon}>
                    <div className="grid md:grid-cols-3 gap-4">
                      <SocialInput 
                          icon={Twitter} 
                          value={(formData.socialLinks as unknown as SocialLinks).twitter}
                          onChange={(v) => setFormData({
                            ...formData, 
                            socialLinks: {...formData.socialLinks, twitter: v}
                          })}
                          placeholder={t('twitterUrlPlaceholder')}
                      />
                      <SocialInput 
                          icon={Instagram} 
                          value={(formData.socialLinks as unknown as SocialLinks).instagram}
                          onChange={(v) => setFormData({
                            ...formData, 
                            socialLinks: {...formData.socialLinks, instagram: v}
                          })}
                          placeholder={t('instagramUrlPlaceholder')}
                      />
                      <SocialInput 
                          icon={Globe} 
                          value={(formData.socialLinks as unknown as SocialLinks).website}
                          onChange={(v) => setFormData({
                            ...formData, 
                            socialLinks: {...formData.socialLinks, website: v}
                          })}
                          placeholder={t('websiteUrlPlaceholder')}
                      />
                    </div>
                  </SectionCard>
                </>
              )}

              {activeTab === 'inventory' && (
                <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/30 border border-white/5 backdrop-blur-xl space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{t('inventoryTitle')}</h2>
                        <p className="text-zinc-400 text-sm">{t('inventoryDesc')}</p>
                    </div>
                    <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-sm font-medium">
                        {user.items?.length || 0} {t('itemsOwned')}
                    </div>
                  </div>

                  <div className="min-h-[300px]">
                     {/* Simplified Inventory Logic for Cleaner Code */}
                     {(!user.items || user.items.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center">
                                <Box className="w-8 h-8 text-zinc-600" />
                            </div>
                            <div>
                                <h3 className="text-zinc-300 font-medium">{t('emptyInventoryTitle')}</h3>
                                <p className="text-zinc-500 text-sm mt-1">{t('emptyInventoryDesc')}</p>
                            </div>
                        </div>
                     ) : (
                         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {user.items.map((userItem) => (
                                <div key={userItem.item.id} className="group relative bg-zinc-900/50 border border-white/5 hover:border-indigo-500/50 rounded-2xl p-4 transition-all hover:shadow-xl hover:shadow-indigo-500/10">
                                    <div className="aspect-square rounded-xl bg-black/20 mb-3 flex items-center justify-center overflow-hidden relative">
                                        {/* Simplified preview - in real app, use optimized images */}
                                        <div className="w-12 h-12 rounded-full border-2 border-zinc-700 bg-zinc-800" />
                                        <span className="absolute bottom-2 right-2 text-[10px] font-bold text-zinc-500 uppercase">{userItem.item.type}</span>
                                    </div>
                                    <h4 className="font-semibold text-white text-sm truncate mb-1">{userItem.item.name}</h4>
                                    <p className="text-xs text-zinc-500 mb-3">{userItem.item.rarity}</p>
                                    
                                    <button 
                                        onClick={() => handleEquip(userItem.item.id, userItem.equipped)}
                                        className={cn(
                                            "w-full py-2 rounded-lg text-xs font-bold transition-colors",
                                            userItem.equipped 
                                                ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" 
                                                : "bg-indigo-600 text-white hover:bg-indigo-500"
                                        )}
                                    >
                                        {userItem.equipped ? t('unequip') : t('equip')}
                                    </button>
                                </div>
                            ))}
                         </div>
                     )}
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                 <>
                    <SectionCard title={t('languagePreferences') || 'Language'} icon={Globe}>
                       <div className="grid sm:grid-cols-3 gap-4">
                          {[
                             { code: 'en', label: 'English', flag: '🇺🇸' },
                             { code: 'pt', label: 'Português', flag: '🇧🇷' },
                             { code: 'jp', label: '日本語', flag: '🇯🇵' }
                          ].map(lang => (
                             <button
                                key={lang.code}
                                onClick={() => setLanguage(lang.code as 'en' | 'pt' | 'jp')}
                                className={cn(
                                   "p-4 rounded-xl border text-left transition-all",
                                   language === lang.code 
                                      ? "bg-indigo-500/10 border-indigo-500/50 text-white ring-1 ring-indigo-500/50" 
                                      : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                                )}
                             >
                                <div className="text-2xl mb-2">{lang.flag}</div>
                                <div className="font-medium text-sm">{lang.label}</div>
                             </button>
                          ))}
                       </div>
                    </SectionCard>

                    <SectionCard title={t('aiConfigTitle')} icon={Sparkles}>
                       <InputGroup
                          label={t('geminiKeyLabel')}
                          value={formData.geminiApiKey}
                          onChange={(e) => setFormData({...formData, geminiApiKey: e.target.value})}
                          type="password"
                          placeholder="sk-..."
                       />
                       <p className="text-xs text-zinc-500 mt-2">{t('geminiKeyDesc')}</p>
                    </SectionCard>
                 </>
              )}

              {activeTab === 'notifications' && (
                 <>
                    <SectionCard title={t('emailInAppTitle')} icon={Bell}>
                       <div className="space-y-1">
                          {[
                             { key: 'newFollowers', title: t('newFollowers'), desc: t('newFollowersDesc') },
                             { key: 'bookComments', title: t('bookComments'), desc: t('bookCommentsDesc') },
                             { key: 'systemUpdates', title: t('systemUpdates'), desc: t('systemUpdatesDesc') },
                             { key: 'emailDigest', title: t('emailDigest'), desc: t('emailDigestDesc') },
                          ].map((item) => (
                             <div key={item.key} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-colors">
                                <div className="pr-4">
                                   <h4 className="font-medium text-zinc-200 text-sm">{item.title}</h4>
                                   <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                                </div>
                                <Toggle 
                                   checked={(formData.notificationSettings as unknown as NotificationSettings)[item.key as keyof NotificationSettings]} 
                                   onCheckedChange={() => setFormData({
                                      ...formData,
                                      notificationSettings: {
                                         ...(formData.notificationSettings as unknown as NotificationSettings),
                                         [item.key]: !(formData.notificationSettings as unknown as NotificationSettings)[item.key as keyof NotificationSettings]
                                      }
                                   })}
                                />
                             </div>
                          ))}
                       </div>
                    </SectionCard>

                    <SectionCard title={t('pushNotificationsTitle')} icon={Bell}>
                        <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                           <PushNotificationToggle />
                        </div>
                    </SectionCard>
                 </>
              )}

              {activeTab === 'security' && (
                 <SectionCard title={t('securityTitle')} icon={Shield}>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                          <div>
                             <h4 className="font-medium text-zinc-200">{t('passwordLabel')}</h4>
                             <p className="text-xs text-zinc-500">{t('passwordChanged')}</p>
                          </div>
                          <button className="px-4 py-2 bg-zinc-800 text-zinc-300 text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors">{t('change')}</button>
                       </div>

                       <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                          <h4 className="font-bold text-red-400 mb-1 text-sm">{t('dangerZone')}</h4>
                          <p className="text-xs text-red-400/60 mb-4">{t('deleteAccountWarning')}</p>
                          <button className="px-4 py-2 bg-red-500/10 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/20">
                             {t('deleteAccount')}
                          </button>
                       </div>
                    </div>
                 </SectionCard>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {user.username === 'login' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowAdminConsole(true)}
            className="bg-zinc-900 hover:bg-zinc-700 text-zinc-400 hover:text-white p-3 rounded-full shadow-lg border border-white/10 transition-all hover:scale-110 active:scale-95"
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

// Sub-components for cleaner code
function SectionCard({ title, icon: Icon, children }: { title: string, icon: LucideIcon, children: React.ReactNode }) {
   return (
      <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/30 border border-white/5 backdrop-blur-xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700" />
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
               <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-300">
                  <Icon className="w-5 h-5" />
               </div>
               <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">{title}</h2>
            </div>
            {children}
         </div>
      </div>
   );
}

function InputGroup({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
   return (
      <div className="space-y-2">
         <label className="text-sm font-medium text-zinc-400 ml-1">{label}</label>
         <input 
            className={cn(
               "w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600",
               "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50",
               "disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            )}
            {...props} 
         />
      </div>
   );
}

function SocialInput({ icon: Icon, value, onChange, placeholder }: { icon: LucideIcon, value: string, onChange: (v: string) => void, placeholder: string }) {
   return (
      <div className="relative group">
         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
            <Icon className="w-4 h-4" />
         </div>
         <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            placeholder={placeholder}
         />
      </div>
   );
}

function Toggle({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: () => void }) {
   return (
      <button
         type="button"
         onClick={onCheckedChange}
         className={cn(
            "w-11 h-6 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
            checked ? 'bg-indigo-600' : 'bg-zinc-700'
         )}
      >
         <div className={cn(
            "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm",
            checked ? 'translate-x-5' : 'translate-x-0'
         )} />
      </button>
   );
}
