import { useState, useEffect } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch real-time stats', 'error');
      setStats({ total: 0, interviews: 0, applied: 0, offers: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll for updates every 30 seconds to keep stats real-time
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-margin space-y-lg animate-pulse h-screen">
        <div className="h-16 bg-surface-container rounded-xl w-full mb-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-surface-container rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Total Applications', value: stats.total, trend: '+12%', icon: 'mail', color: 'primary' },
    { label: 'Interviews', value: stats.interviews, sub: 'Next: Tomorrow', icon: 'calendar_today', color: 'primary' },
    { label: 'Pending Follow-ups', value: 15, sub: 'Action Required', icon: 'warning', color: 'tertiary' },
    { label: 'Offers Received', value: stats.offers, sub: 'Best: $145k', icon: 'celebration', color: 'primary', fill: true },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col min-w-0"
    >
      {/* TopAppBar */}
      <header className="bg-surface/80 backdrop-blur-md flex justify-between items-center h-16 px-margin w-full sticky top-0 z-40 border-b border-outline-variant">
        <div className="flex items-center gap-md">
          <span className="lg:hidden material-symbols-outlined text-on-surface cursor-pointer">menu</span>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Overview</h2>
        </div>
        <div className="flex items-center gap-md sm:gap-lg">
          <div className="hidden sm:flex items-center bg-surface-container-low border border-outline-variant rounded-full px-md py-xs w-64 focus-within:border-primary transition-all">
            <span className="material-symbols-outlined text-outline text-[20px]">search</span>
            <input className="bg-transparent border-none text-body-md focus:ring-0 text-on-surface w-full" placeholder="Quick search..." type="text"/>
          </div>
          <div className="flex items-center gap-md">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">notifications</span>
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
              <span className="material-symbols-outlined text-primary text-[20px]">account_circle</span>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-margin space-y-lg max-w-[1400px] mx-auto w-full pb-32 lg:pb-lg">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {cards.map((card, idx) => (
            <motion.div 
              key={card.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-surface-container border border-outline-variant p-lg rounded-2xl transition-all hover:border-primary hover:shadow-xl group cursor-default"
            >
              <div className="flex justify-between items-start mb-md">
                <span className="text-on-surface-variant font-label-md uppercase tracking-wider">{card.label}</span>
                <span className={clsx(
                  "material-symbols-outlined",
                  `text-${card.color}`
                )} style={{ fontVariationSettings: card.fill ? "'FILL' 1" : "" }}>
                  {card.icon}
                </span>
              </div>
              <div className="flex items-baseline gap-sm">
                <h3 className="text-headline-xl font-headline-xl text-on-surface">{card.value}</h3>
                {card.trend && (
                  <span className="text-primary font-bold text-label-md flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span>
                    {card.trend}
                  </span>
                )}
              </div>
              {card.sub && <p className="text-on-surface-variant text-body-md mt-xs">{card.sub}</p>}
              <div className="mt-md h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "70%" }}
                  className={clsx("h-full", `bg-${card.color}`)}
                ></motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          <div className="lg:col-span-2 bg-surface-container border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
            <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50">
              <h3 className="font-headline-md text-on-surface flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">history</span>
                Recent Activity
              </h3>
              <button className="text-primary font-bold text-label-md hover:underline transition-all">View Analytics</button>
            </div>
            <div className="divide-y divide-outline-variant">
              {[
                { company: 'Microsoft', role: 'Senior Designer', status: 'Interview', date: '2h ago', color: 'primary' },
                { company: 'Stripe', role: 'UX Lead', status: 'Applied', date: '5h ago', color: 'secondary' },
                { company: 'Google', role: 'Product Architect', status: 'Offer', date: '1d ago', color: 'primary' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ backgroundColor: "rgba(var(--primary), 0.05)" }}
                  className="p-lg flex items-center gap-md transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center font-bold text-primary text-headline-md">
                    {item.company[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-on-surface font-bold truncate text-body-lg">{item.role}</h4>
                    <p className="text-on-surface-variant text-body-md truncate">{item.company} • Verified</p>
                  </div>
                  <div className="flex flex-col items-end gap-sm">
                    <span className={clsx(
                      "px-sm py-xs rounded-full text-[10px] font-bold uppercase tracking-wider",
                      item.status === 'Offer' ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"
                    )}>
                      {item.status}
                    </span>
                    <span className="text-on-surface-variant text-[11px] font-medium">{item.date}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Productivity Widget */}
          <div className="space-y-gutter">
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-lg relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="font-headline-md text-on-surface mb-md">Daily Goal</h3>
                <div className="flex items-center gap-lg mb-lg">
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface-container-highest" />
                      <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary" strokeDasharray="220" strokeDashoffset="66" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-bold text-on-surface">70%</span>
                  </div>
                  <div>
                    <p className="text-headline-md text-on-surface font-bold">7 / 10</p>
                    <p className="text-on-surface-variant text-body-md">Applications today</p>
                  </div>
                </div>
                <button className="w-full bg-primary text-on-primary py-sm rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg">
                  Add New Entry
                </button>
              </div>
              <span className="absolute -right-4 -bottom-4 material-symbols-outlined text-[120px] opacity-10 rotate-12 text-primary group-hover:rotate-0 transition-all duration-500">task_alt</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
