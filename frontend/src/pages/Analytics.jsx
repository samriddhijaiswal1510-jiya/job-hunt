import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const DEFAULT_COLORS = ['#c0c1ff', '#ffb783', '#ffb4ab', '#494bd6', '#908fa0'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/stats');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartColors = useMemo(() => {
    return theme === 'dark' ? DEFAULT_COLORS : ['#494bd6', '#d97721', '#93000a', '#0d0096', '#34343d'];
  }, [theme]);

  if (loading) return (
    <div className="p-margin max-w-7xl mx-auto w-full space-y-lg animate-pulse h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-surface-container rounded-xl"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2 h-[400px] bg-surface-container rounded-xl"></div>
        <div className="h-[400px] bg-surface-container rounded-xl"></div>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto"
    >
      <header className="bg-surface/80 backdrop-blur-md flex justify-between items-center h-16 px-margin w-full sticky top-0 z-40 border-b border-outline-variant">
        <div className="flex items-center gap-md">
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Data Insights</h2>
        </div>
        <div className="flex bg-surface-container-low rounded-lg p-xs border border-outline-variant">
          <button className="px-md py-xs rounded-md bg-primary text-on-primary text-[10px] font-bold">MONTHLY</button>
          <button className="px-md py-xs rounded-md text-on-surface-variant hover:text-on-surface text-[10px] font-bold transition-colors">YEARLY</button>
        </div>
      </header>

      <div className="p-margin max-w-7xl mx-auto w-full space-y-lg pb-32">
        {/* Performance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {[
            { label: 'Response Rate', value: '24.8%', icon: 'mail', trend: '+4.2%' },
            { label: 'Interview Conversion', value: '12.5%', icon: 'groups', trend: '+1.8%' },
            { label: 'Application Funnel', value: data.total, icon: 'filter_alt', sub: 'Total apps processed' }
          ].map((card, i) => (
            <div key={i} className="bg-surface-container border border-outline-variant rounded-2xl p-lg relative group overflow-hidden">
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[100px] opacity-5 text-primary group-hover:scale-110 transition-transform">{card.icon}</span>
              <p className="font-label-md text-on-surface-variant uppercase tracking-widest">{card.label}</p>
              <h3 className="text-headline-xl font-headline-xl text-on-surface mt-xs">{card.value}</h3>
              {card.trend && (
                <div className="flex items-center gap-xs mt-md text-primary font-bold text-label-md">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span>{card.trend} vs last month</span>
                </div>
              )}
              {card.sub && <p className="text-on-surface-variant text-body-md mt-md">{card.sub}</p>}
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <div className="lg:col-span-2 bg-surface-container border border-outline-variant rounded-2xl p-lg">
            <h4 className="font-headline-md text-on-surface mb-xl">Applications Volume</h4>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weekly}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c0c1ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#c0c1ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#34343d' : '#e4e1ed'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#908fa0', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#908fa0', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1f1f27' : '#ffffff', 
                      border: '1px solid #464554', 
                      borderRadius: '16px',
                      color: theme === 'dark' ? '#e4e1ed' : '#13131b'
                    }}
                    itemStyle={{ color: '#c0c1ff' }}
                  />
                  <Area type="monotone" dataKey="apps" stroke="#c0c1ff" strokeWidth={4} fill="url(#areaGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface-container border border-outline-variant rounded-2xl p-lg flex flex-col">
            <h4 className="font-headline-md text-on-surface mb-xl">Current Pipeline</h4>
            <div className="flex-1 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.status_breakdown}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {data.status_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1f1f27' : '#ffffff', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-sm mt-lg">
                {data.status_breakdown.map((entry, index) => (
                  <div key={entry.name} className="flex justify-between items-center px-md py-xs rounded-xl hover:bg-surface-container-highest transition-colors">
                    <div className="flex items-center gap-sm">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: chartColors[index % chartColors.length]}}></div>
                      <span className="font-body-md text-on-surface">{entry.name}</span>
                    </div>
                    <span className="font-bold text-on-surface-variant">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
