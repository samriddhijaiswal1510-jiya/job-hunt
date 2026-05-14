import { useState, useEffect } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

export default function Settings() {
  const [settings, setSettings] = useState({
    smtp_email: '',
    smtp_password: '',
  });
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  useEffect(() => {
    axios.get('http://localhost:5000/api/settings')
      .then(res => {
        setSettings(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        addToast('Failed to load settings', 'error');
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:5000/api/settings', settings);
      addToast('Settings saved successfully');
    } catch (err) {
      addToast('Failed to save settings', 'error');
    }
  };

  if (loading) return <div className="p-margin animate-pulse">Loading...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto"
    >
      <header className="bg-surface/80 backdrop-blur-md flex justify-between items-center h-16 px-margin w-full sticky top-0 z-40 border-b border-outline-variant">
        <h2 className="font-headline-md text-on-surface">Settings</h2>
      </header>

      <div className="p-margin max-w-4xl mx-auto w-full space-y-lg pb-32">
        <div className="bg-surface-container border border-outline-variant p-lg rounded-2xl shadow-sm">
          <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">palette</span> Appearance
          </h3>
          <div className="flex items-center justify-between p-lg bg-surface-container-low rounded-2xl border border-outline-variant hover:border-primary transition-all group cursor-pointer" onClick={toggleTheme}>
            <div>
              <p className="text-on-surface font-bold text-body-lg">Theme Preference</p>
              <p className="text-on-surface-variant text-body-md">Currently using {theme} mode</p>
            </div>
            <div className="flex items-center gap-md">
               <span className={clsx("material-symbols-outlined transition-all", theme === 'light' ? "text-primary scale-125" : "text-outline")}>light_mode</span>
               <div className="w-12 h-6 bg-surface-container-highest rounded-full relative">
                  <motion.div 
                    animate={{ x: theme === 'dark' ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-primary rounded-full"
                  />
               </div>
               <span className={clsx("material-symbols-outlined transition-all", theme === 'dark' ? "text-primary scale-125" : "text-outline")}>dark_mode</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant p-lg rounded-2xl shadow-sm">
          <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">description</span> Default Resume
          </h3>
          <div className="space-y-4">
            <p className="text-on-surface-variant text-sm italic">
              Currently using: {settings.default_resume_path ? settings.default_resume_path.split('\\').pop().split('/').pop() : 'No resume uploaded'}
            </p>
            <div className="flex items-center gap-4">
              <label className="bg-surface-container-highest hover:bg-primary/10 text-primary px-6 py-3 rounded-xl font-bold cursor-pointer transition-all border border-primary/20 flex items-center gap-2">
                <span className="material-symbols-outlined">upload</span>
                Upload New Resume (PDF)
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf" 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('resume', file);
                      try {
                        const res = await axios.post('http://localhost:5000/api/upload-resume', formData);
                        setSettings({...settings, default_resume_path: res.data.path});
                        addToast('Resume uploaded successfully!');
                      } catch (err) {
                        addToast('Failed to upload resume', 'error');
                      }
                    }
                  }} 
                />
              </label>
            </div>
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant p-lg rounded-2xl shadow-sm">
          <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">shield</span> Email SMTP (Gmail)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block">Gmail Address</label>
              <input 
                type="email" 
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:border-primary transition-all outline-none"
                placeholder="your.email@gmail.com"
                value={settings.smtp_email}
                onChange={(e) => setSettings({...settings, smtp_email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block">App Password</label>
              <input 
                type="password" 
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:border-primary transition-all outline-none"
                placeholder="••••••••••••••••"
                value={settings.smtp_password}
                onChange={(e) => setSettings({...settings, smtp_password: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button 
            onClick={async () => {
              try {
                addToast('Testing connection...');
                const res = await axios.post('http://localhost:5000/api/test-smtp');
                addToast(res.data.message);
              } catch (err) {
                addToast(err.response?.data?.error || 'Connection Failed', 'error');
              }
            }}
            className="bg-surface-container-highest text-primary font-bold px-xl py-md rounded-2xl flex items-center gap-3 border border-primary/20 hover:bg-primary/10 transition-all"
          >
            <span className="material-symbols-outlined">key_visualizer</span>
            TEST CONNECTION
          </button>
          <button 
            onClick={handleSave}
            className="bg-primary text-on-primary font-bold px-xl py-md rounded-2xl flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
          >
            <span className="material-symbols-outlined">save</span>
            SAVE ALL CHANGES
          </button>
        </div>
      </div>
    </motion.div>
  );
}
