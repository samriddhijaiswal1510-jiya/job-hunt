import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const API = 'http://localhost:5000/api';

const COLUMNS = [
  { id: 'Saved', label: 'Wishlist', icon: 'bookmark' },
  { id: 'Applied', label: 'Applied', icon: 'send' },
  { id: 'Interview', label: 'Interviewing', icon: 'video_call' },
  { id: 'Offer', label: 'Offer', icon: 'celebration' },
  { id: 'Rejected', label: 'Rejected', icon: 'block' }
];

const EMPTY_JOB = { company: '', role: '', priority: 'Medium', notes: '', date_applied: '', follow_up_date: '' };

export default function JobTracker() {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [showAddForm, setShowAddForm] = useState(null); // column id or null
  const [newJob, setNewJob] = useState({ ...EMPTY_JOB });
  const { addToast } = useToast();

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API}/jobs`);
      setJobs(res.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load jobs', 'error');
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ── Add Job ──
  const handleAddJob = async (columnId) => {
    if (!newJob.company.trim() || !newJob.role.trim()) {
      addToast('Company and Role are required', 'error');
      return;
    }
    try {
      await axios.post(`${API}/jobs`, {
        ...newJob,
        status: columnId,
        date_applied: newJob.date_applied || new Date().toISOString().split('T')[0],
      });
      addToast(`Added ${newJob.role} at ${newJob.company}`);
      setNewJob({ ...EMPTY_JOB });
      setShowAddForm(null);
      fetchJobs();
    } catch (err) {
      addToast('Failed to add job', 'error');
    }
  };

  // ── Delete Job ──
  const handleDeleteJob = async (id) => {
    try {
      await axios.delete(`${API}/jobs/${id}`);
      setJobs(prev => prev.filter(j => j.id !== id));
      addToast('Job deleted');
    } catch (err) {
      addToast('Failed to delete job', 'error');
    }
  };

  // ── Drag & Drop ──
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const jobId = parseInt(draggableId);
    const newStatus = destination.droppableId;
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    // Optimistic update
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));

    try {
      await axios.put(`${API}/jobs/${jobId}`, { ...job, status: newStatus });
      addToast(`Moved "${job.role}" → ${newStatus}`);
    } catch (err) {
      addToast('Failed to update status', 'error');
      fetchJobs(); // revert
    }
  };

  // ── Filtering ──
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const q = debouncedSearch.toLowerCase();
      const matchesSearch = !q || job.role.toLowerCase().includes(q) || job.company.toLowerCase().includes(q);
      const matchesPriority = filterPriority === 'All' || job.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [jobs, debouncedSearch, filterPriority]);

  const isOverdue = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const daysOverdue = (date) => {
    if (!date) return 0;
    const diff = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
      {/* ── Header ── */}
      <header className="bg-surface/80 backdrop-blur-md p-4 md:px-6 border-b border-outline-variant flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center sticky top-0 z-40">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-full px-4 py-2 flex-1 md:w-80 focus-within:border-primary transition-all">
            <span className="material-symbols-outlined text-outline text-[20px]">search</span>
            <input
              className="bg-transparent border-none text-sm focus:ring-0 focus:outline-none text-on-surface w-full ml-2"
              placeholder="Search by role or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['All', 'High', 'Medium', 'Low'].map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={clsx(
                "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                filterPriority === p
                  ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20"
                  : "bg-surface-container-low text-on-surface-variant border-outline-variant hover:border-primary"
              )}
            >
              {p}
            </button>
          ))}
          <span className="text-outline text-xs ml-2">{filteredJobs.length} jobs</span>
        </div>
      </header>

      {/* ── Kanban Board ── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6 flex gap-4 no-scrollbar">
        <DragDropContext onDragEnd={onDragEnd}>
          {COLUMNS.map((column) => {
            const columnJobs = filteredJobs.filter(j => j.status === column.id);
            return (
              <div key={column.id} className="min-w-[280px] w-[300px] flex-shrink-0 flex flex-col h-full bg-surface-container-lowest/50 rounded-2xl border border-outline-variant/30">
                {/* Column Header */}
                <div className="p-4 flex justify-between items-center border-b border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">{column.icon}</span>
                    <h3 className="font-bold text-on-surface text-sm">{column.label}</h3>
                    <span className="bg-surface-container-highest px-2 py-0.5 rounded-full text-[10px] font-bold text-outline">
                      {columnJobs.length}
                    </span>
                  </div>
                  <button
                    onClick={() => { setShowAddForm(showAddForm === column.id ? null : column.id); setNewJob({ ...EMPTY_JOB }); }}
                    className={clsx(
                      "p-1 rounded-lg transition-all",
                      showAddForm === column.id ? "bg-primary text-on-primary" : "hover:bg-surface-container-highest text-outline"
                    )}
                  >
                    <span className="material-symbols-outlined text-[20px]">{showAddForm === column.id ? 'close' : 'add'}</span>
                  </button>
                </div>

                {/* Add Job Form (inline) */}
                <AnimatePresence>
                  {showAddForm === column.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-b border-outline-variant/20"
                    >
                      <div className="p-3 space-y-2">
                        <input
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none transition-all"
                          placeholder="Company name *"
                          value={newJob.company}
                          onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                          autoFocus
                        />
                        <input
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none transition-all"
                          placeholder="Role / Position *"
                          value={newJob.role}
                          onChange={(e) => setNewJob({ ...newJob, role: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <select
                            className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                            value={newJob.priority}
                            onChange={(e) => setNewJob({ ...newJob, priority: e.target.value })}
                          >
                            <option value="High">🔴 High</option>
                            <option value="Medium">🟡 Medium</option>
                            <option value="Low">🟢 Low</option>
                          </select>
                          <input
                            type="date"
                            className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                            value={newJob.follow_up_date}
                            onChange={(e) => setNewJob({ ...newJob, follow_up_date: e.target.value })}
                          />
                        </div>
                        <textarea
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none resize-none"
                          placeholder="Notes (optional)"
                          rows={2}
                          value={newJob.notes}
                          onChange={(e) => setNewJob({ ...newJob, notes: e.target.value })}
                        />
                        <button
                          onClick={() => handleAddJob(column.id)}
                          className="w-full bg-primary text-on-primary py-2 rounded-lg font-bold text-sm hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">add_task</span>
                          Add to {column.label}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Droppable Column */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={clsx(
                        "flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar transition-colors duration-200",
                        snapshot.isDraggingOver ? "bg-primary/5 ring-2 ring-inset ring-primary/20 rounded-b-2xl" : ""
                      )}
                    >
                      {columnJobs.map((job, index) => (
                        <Draggable key={job.id} draggableId={job.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style}
                            >
                              <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={clsx(
                                  "bg-surface-container p-4 rounded-xl border transition-all cursor-grab active:cursor-grabbing group",
                                  snapshot.isDragging
                                    ? "shadow-2xl border-primary scale-[1.03] ring-2 ring-primary/30 rotate-1"
                                    : "border-outline-variant/50 hover:border-primary/50 hover:shadow-md"
                                )}
                              >
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1 min-w-0 mr-2">
                                    <h4 className="font-bold text-on-surface truncate text-sm">{job.role}</h4>
                                    <p className="text-on-surface-variant text-xs truncate">{job.company}</p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className={clsx(
                                      "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border",
                                      job.priority === 'High' ? "bg-error/10 text-error border-error/20" :
                                      job.priority === 'Medium' ? "bg-primary/10 text-primary border-primary/20" :
                                      "bg-surface-container-highest text-outline border-outline-variant"
                                    )}>
                                      {job.priority}
                                    </span>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.id); }}
                                      className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-error/10 hover:text-error text-outline transition-all"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Card Details */}
                                <div className="space-y-1.5">
                                  {job.follow_up_date && isOverdue(job.follow_up_date) && (
                                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-error/10 text-error text-[11px] font-bold animate-pulse">
                                      <span className="material-symbols-outlined text-[16px]">notification_important</span>
                                      <span>OVERDUE by {daysOverdue(job.follow_up_date)}d</span>
                                    </div>
                                  )}
                                  {job.follow_up_date && !isOverdue(job.follow_up_date) && (
                                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold">
                                      <span className="material-symbols-outlined text-[16px]">alarm</span>
                                      <span>Follow-up: {job.follow_up_date}</span>
                                    </div>
                                  )}
                                  {job.date_applied && (
                                    <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant px-1">
                                      <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                                      {job.date_applied}
                                    </div>
                                  )}
                                  {job.notes && (
                                    <p className="text-[11px] text-on-surface-variant px-1 truncate italic">
                                      {job.notes}
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {columnJobs.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center py-8 text-outline/50">
                          <span className="material-symbols-outlined text-[40px] mb-2">inbox</span>
                          <p className="text-xs">Drop jobs here</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </DragDropContext>
      </div>
    </div>
  );
}
