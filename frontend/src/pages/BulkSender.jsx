import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';

export default function BulkSender() {
  const [template, setTemplate] = useState('Hello {{name}},\n\nI am interested in the {{role}} position at {{company}}.\n\nBest regards,\nJobHunter');
  const [recipients, setRecipients] = useState([
    { name: 'John Smith', company: 'Google', role: 'Frontend Developer', email: 'john@google.com', status: 'Ready' },
    { name: 'Alice Wong', company: 'Meta', role: 'Product Designer', email: 'alice@meta.com', status: 'Ready' },
    { name: 'Bob Lee', company: 'Amazon', role: 'Software Engineer', email: 'bob@amazon.com', status: 'Ready' },
  ]);
  const [selectedRecipientIdx, setSelectedRecipientIdx] = useState(0);
  const [sending, setSending] = useState(false);
  const { addToast } = useToast();

  // Dynamic Variable Replacement logic
  const personalizedEmail = useMemo(() => {
    const person = recipients[selectedRecipientIdx];
    if (!person) return template;
    
    let text = template;
    text = text.replace(/{{name}}/g, person.name);
    text = text.replace(/{{company}}/g, person.company);
    text = text.replace(/{{role}}/g, person.role);
    return text;
  }, [template, recipients, selectedRecipientIdx]);

  const handleSendAll = async () => {
    setSending(true);
    addToast('Starting bulk send process...');
    
    try {
      // Simulate backend delay and personalized sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update statuses locally
      setRecipients(prev => prev.map(r => ({ ...r, status: 'Sent' })));
      addToast('Bulk send completed successfully!');
    } catch (err) {
      console.error(err);
      addToast('Critical SMTP Failure: Check settings', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      addToast('CSV parsing started...');
      // Placeholder for CSV parsing logic
    } else {
      addToast('Invalid file format. Please upload a CSV.', 'error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col h-screen overflow-hidden"
    >
      <header className="bg-surface/80 backdrop-blur-md p-margin border-b border-outline-variant flex justify-between items-center sticky top-0 z-40">
        <div>
          <h2 className="font-headline-md text-on-surface">Bulk Email Sender</h2>
          <p className="text-on-surface-variant font-label-md">Personalize and send outreach at scale</p>
        </div>
        <div className="flex gap-sm">
          <label className="bg-surface-container hover:bg-surface-container-highest text-on-surface px-lg py-sm rounded-xl font-bold cursor-pointer transition-all border border-outline-variant flex items-center gap-sm">
            <span className="material-symbols-outlined text-[20px]">upload_file</span>
            Upload CSV
            <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
          </label>
          <button 
            disabled={sending}
            onClick={handleSendAll}
            className={clsx(
              "bg-primary text-on-primary px-xl py-sm rounded-xl font-bold transition-all shadow-lg flex items-center gap-sm",
              sending ? "opacity-50 cursor-wait" : "hover:scale-[1.02] active:scale-95"
            )}
          >
            {sending ? <span className="animate-spin material-symbols-outlined">sync</span> : <span className="material-symbols-outlined text-[20px]">send</span>}
            {sending ? 'Sending...' : 'Send Bulk'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Template Editor */}
        <section className="flex-1 flex flex-col p-margin overflow-y-auto no-scrollbar border-b lg:border-b-0 lg:border-r border-outline-variant">
          <div className="mb-lg flex justify-between items-end">
            <h3 className="font-headline-md text-on-surface">Email Template</h3>
            <div className="flex gap-xs">
              {['{{name}}', '{{company}}', '{{role}}'].map(v => (
                <button 
                  key={v}
                  onClick={() => setTemplate(t => t + v)}
                  className="px-sm py-xs bg-surface-container-highest text-primary rounded-md text-[10px] font-bold border border-primary/20 hover:bg-primary/10 transition-all"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <textarea 
            className="flex-1 w-full bg-surface-container-low border border-outline-variant rounded-2xl p-lg text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none min-h-[300px]"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            placeholder="Draft your message here..."
          />
        </section>

        {/* Right: Live Preview & Recipients */}
        <section className="w-full lg:w-[450px] flex flex-col bg-surface-container-lowest/30 overflow-hidden">
          <div className="p-margin flex-1 flex flex-col overflow-hidden">
            <h3 className="font-headline-md text-on-surface mb-lg">Live Preview</h3>
            <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-lg flex-1 overflow-y-auto font-body-md text-on-surface relative shadow-inner">
              <div className="absolute top-0 right-0 p-sm opacity-20 pointer-events-none">
                <span className="material-symbols-outlined text-[60px]">mark_email_read</span>
              </div>
              <div className="border-b border-outline-variant pb-md mb-md">
                <p className="text-on-surface-variant text-xs font-bold uppercase mb-1">To:</p>
                <p className="font-bold text-primary">{recipients[selectedRecipientIdx]?.email || 'N/A'}</p>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed italic text-on-surface/90">
                {personalizedEmail}
              </div>
            </div>

            <div className="mt-xl h-[250px] flex flex-col">
              <h3 className="font-headline-md text-on-surface mb-md">Recipient List ({recipients.length})</h3>
              <div className="flex-1 overflow-y-auto pr-sm space-y-sm no-scrollbar">
                <AnimatePresence>
                  {recipients.map((person, i) => (
                    <motion.div 
                      key={person.email}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => setSelectedRecipientIdx(i)}
                      className={clsx(
                        "p-md rounded-xl border transition-all cursor-pointer group flex items-center gap-md",
                        selectedRecipientIdx === i 
                          ? "bg-primary/10 border-primary shadow-sm" 
                          : "bg-surface-container border-outline-variant/30 hover:border-primary/50"
                      )}
                    >
                      <div className={clsx(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                        selectedRecipientIdx === i ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"
                      )}>
                        {person.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-on-surface truncate">{person.name}</h4>
                        <p className="text-[10px] text-on-surface-variant truncate">{person.company} • {person.role}</p>
                      </div>
                      <span className={clsx(
                        "text-[9px] font-bold uppercase px-sm py-1 rounded-full",
                        person.status === 'Sent' ? "bg-green-500/10 text-green-400" : "bg-surface-container-highest text-on-surface-variant"
                      )}>
                        {person.status}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
      </main>
    </motion.div>
  );
}
