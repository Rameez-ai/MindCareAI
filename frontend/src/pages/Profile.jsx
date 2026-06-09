import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import { 
  User, 
  Settings, 
  Check, 
  Sparkles,
  Heart,
  Save,
  CheckSquare,
  Square
} from 'lucide-react';

const WELLNESS_INTERESTS = [
  'Mindfulness & Meditation',
  'Cognitive Behavioral Therapy (CBT)',
  'Anxiety Management',
  'Sleep Improvement',
  'Stress Relief & PMR',
  'Somatic Grounding'
];

const Profile = () => {
  const { user, updatePreferences } = useAuth();
  
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [theme, setTheme] = useState(user?.preferences?.theme || 'light');
  const [notifications, setNotifications] = useState(user?.preferences?.notifications_enabled ?? true);
  const [selectedInterests, setSelectedInterests] = useState(user?.preferences?.wellness_interests || []);
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const payload = {
      display_name: displayName,
      preferences: {
        theme: theme,
        notifications_enabled: notifications,
        language: 'en',
        wellness_interests: selectedInterests
      }
    };

    try {
      const response = await profileAPI.updateProfile(payload);
      updatePreferences(response.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Profile Settings</h2>
        <p className="text-slate-500 dark:text-slate-400">Manage your safe space account preferences and focus fields.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Side: Summary Card */}
        <div className="md:col-span-1 p-6 glass-panel rounded-3xl text-center space-y-4 h-fit">
          <div className="h-20 w-20 mx-auto rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-3xl shadow-lg uppercase">
            {displayName.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{displayName}</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{user?.email}</span>
          </div>
          <div className="pt-4 border-t border-slate-200/40 text-left space-y-3">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wide">Wellness Goals</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedInterests.map((interest, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold">
                  {interest}
                </span>
              ))}
              {selectedInterests.length === 0 && (
                <span className="text-xs text-slate-400 italic">No focus goals added.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Edit Form */}
        <div className="md:col-span-2 p-6 md:p-8 glass-panel rounded-3xl space-y-6">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-brand-500" /> Account Preferences
          </h3>

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Input Details */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 glass-input text-slate-800 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">App Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-4 py-3 glass-input text-slate-800 dark:text-white bg-transparent"
                >
                  <option value="light" className="text-slate-800">Light Mode</option>
                  <option value="dark" className="text-slate-800">Dark Mode</option>
                </select>
              </div>
            </div>

            {/* Checkbox for notifications */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNotifications(!notifications)}
                className="text-brand-500 rounded focus:outline-none"
              >
                {notifications ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-slate-400" />}
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Enable daily wellness notification updates</span>
            </div>

            {/* Selecting wellness focus fields */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Wellness Focus Fields</label>
              <div className="grid sm:grid-cols-2 gap-3">
                {WELLNESS_INTERESTS.map((interest) => {
                  const isChecked = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left text-xs transition-all ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>{interest}</span>
                      {isChecked && <Check className="h-4 w-4 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Block */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200/40">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2"
              >
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Settings'}
              </button>

              {success && (
                <span className="text-sm font-bold text-emerald-500 animate-pulse">Changes saved successfully!</span>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
