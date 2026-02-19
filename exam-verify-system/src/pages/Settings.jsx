import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  Monitor,
  Moon,
  Sun,
  Globe,
  Key,
  Camera,
  Save,
  ChevronRight,
  Mail,
  Smartphone,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { PageTransition } from '../components/layout/PageTransition';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, userType } = useStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.user_metadata?.name || user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    scanAlerts: true,
    paymentAlerts: true,
    systemUpdates: false,
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    compactMode: false,
    language: 'en',
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
    toast.success('Settings saved successfully');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 py-12 px-4 font-body text-slate-900">
        <div className="max-w-[1000px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">
              Settings
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Manage your account preferences and configurations
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Tabs */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-64 shrink-0"
            >
              <div className="bg-white rounded-2xl border border-slate-100 shadow-premium overflow-hidden">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-bold transition-all border-b border-slate-50 last:border-b-0 ${
                        isActive
                          ? 'bg-primary/5 text-primary border-l-[3px] border-l-primary'
                          : 'text-slate-600 hover:bg-slate-50 border-l-[3px] border-l-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${isActive ? 'rotate-90' : ''}`} />
                    </button>
                  );
                })}
              </div>

              {/* Role badge */}
              <div className="mt-4 bg-slate-900 rounded-2xl p-5 text-white">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Your Role</p>
                <p className="text-lg font-heading font-bold capitalize">{userType || 'User'}</p>
                <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
              </div>
            </motion.div>

            {/* Content Area */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-premium p-8">
                  <h2 className="text-xl font-heading font-bold text-slate-900 mb-8">Profile Information</h2>

                  {/* Avatar */}
                  <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-primary border-2 border-slate-200 overflow-hidden">
                      {user?.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold">{profile.name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <div>
                      <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors border border-primary/10">
                        <Camera className="w-4 h-4" />
                        Change Photo
                      </button>
                      <p className="text-xs text-slate-400 mt-2">JPG, PNG. Max 5MB.</p>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Email cannot be changed. Contact support if needed.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          placeholder="+234 800 000 0000"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-premium p-8">
                  <h2 className="text-xl font-heading font-bold text-slate-900 mb-8">Notification Preferences</h2>

                  <div className="space-y-6">
                    {[
                      { key: 'emailAlerts', label: 'Email Notifications', desc: 'Receive important updates via email', icon: Mail },
                      { key: 'scanAlerts', label: 'Scan Alerts', desc: 'Get notified when QR codes are scanned', icon: Bell },
                      { key: 'paymentAlerts', label: 'Payment Alerts', desc: 'Notifications for payment confirmations', icon: Shield },
                      { key: 'systemUpdates', label: 'System Updates', desc: 'Updates about system maintenance and features', icon: Globe },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200">
                              <Icon className="w-5 h-5 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{item.label}</p>
                              <p className="text-xs text-slate-500">{item.desc}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                            className={`w-12 h-7 rounded-full transition-all relative ${
                              notifications[item.key] ? 'bg-primary' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
                                notifications[item.key] ? 'left-6' : 'left-1'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-premium p-8">
                  <h2 className="text-xl font-heading font-bold text-slate-900 mb-8">Appearance</h2>

                  {/* Theme */}
                  <div className="mb-8">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Theme</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'light', label: 'Light', icon: Sun, desc: 'Clean, bright interface' },
                        { id: 'dark', label: 'Dark', icon: Moon, desc: 'Easier on the eyes' },
                      ].map((theme) => {
                        const Icon = theme.icon;
                        const isSelected = appearance.theme === theme.id;
                        return (
                          <button
                            key={theme.id}
                            onClick={() => setAppearance({ ...appearance, theme: theme.id })}
                            className={`p-5 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <Icon className={`w-6 h-6 mb-3 ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                            <p className="text-sm font-bold text-slate-900">{theme.label}</p>
                            <p className="text-xs text-slate-500 mt-1">{theme.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="mb-8">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Language</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={appearance.language}
                        onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                      >
                        <option value="en">English</option>
                        <option value="yo">Yoruba</option>
                        <option value="ig">Igbo</option>
                        <option value="ha">Hausa</option>
                      </select>
                    </div>
                  </div>

                  {/* Compact Mode */}
                  <div className="flex items-center justify-between p-5 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Compact Mode</p>
                      <p className="text-xs text-slate-500">Reduce spacing for denser information display</p>
                    </div>
                    <button
                      onClick={() => setAppearance({ ...appearance, compactMode: !appearance.compactMode })}
                      className={`w-12 h-7 rounded-full transition-all relative ${
                        appearance.compactMode ? 'bg-primary' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
                          appearance.compactMode ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Appearance'}
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-premium p-8">
                    <h2 className="text-xl font-heading font-bold text-slate-900 mb-8">Change Password</h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="password"
                            placeholder="Enter current password"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="password"
                            placeholder="Enter new password"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-premium p-8">
                    <h2 className="text-xl font-heading font-bold text-slate-900 mb-6">Active Sessions</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                            <Monitor className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Current Browser</p>
                            <p className="text-xs text-slate-500">Active now</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-white rounded-2xl border border-red-100 shadow-premium p-8">
                    <h2 className="text-xl font-heading font-bold text-red-600 mb-2">Danger Zone</h2>
                    <p className="text-sm text-slate-500 mb-6">Irreversible actions that affect your account</p>
                    <button className="px-6 py-3 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-200">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
