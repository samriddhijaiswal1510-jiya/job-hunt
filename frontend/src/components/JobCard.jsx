import { Calendar, Building2, MapPin, Clock } from 'lucide-react';
import { clsx } from 'clsx';

export default function JobCard({ job }) {
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'hot': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="glass p-5 rounded-2xl border border-navy-700 hover:border-electric-blue/30 transition-all duration-300 card-hover">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center border border-navy-600">
            <Building2 className="text-slate-400 w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-lg leading-tight">{job.role}</h4>
            <p className="text-slate-400 text-sm">{job.company}</p>
          </div>
        </div>
        <span className={clsx(
          "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
          getPriorityColor(job.priority)
        )}>
          {job.priority}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>Applied: {job.date_applied || 'N/A'}</span>
        </div>
        {job.follow_up_date && (
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Follow up: {job.follow_up_date}</span>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-navy-700 flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">{job.status}</span>
        <div className="flex gap-2">
          <button className="text-xs font-semibold text-electric-blue hover:underline">Edit</button>
        </div>
      </div>
    </div>
  );
}
