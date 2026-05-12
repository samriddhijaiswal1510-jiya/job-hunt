export default function StatsCard({ title, value, icon: Icon, colorClass }) {
  return (
    <div className="glass p-6 rounded-2xl card-hover transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 font-medium text-sm">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
    </div>
  );
}
