import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const API = 'http://127.0.0.1:5000/api';

export default function BulkSender() {
  const [template, setTemplate] = useState('Hello {name},\n\nI am interested in the {role} position at {company}.\n\nBest regards,\nJobHunter');
  const [recipients, setRecipients] = useState([
    { name: 'John Smith', company: 'Google', role: 'Frontend Developer', email: 'john@google.com', status: 'Ready' },
    { name: 'Alice Wong', company: 'Meta', role: 'Product Designer', email: 'alice@meta.com', status: 'Ready' },
    { name: 'Bob Lee', company: 'Amazon', role: 'Software Engineer', email: 'bob@amazon.com', status: 'Ready' },
  ]);
  const [selectedRecipientIdx, setSelectedRecipientIdx] = useState(0);
  const [sending, setSending] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { addToast } = useToast();

  // Dynamic Variable Replacement logic
  const personalizedEmail = useMemo(() => {
    const person = recipients[selectedRecipientIdx];
    if (!person) return template;
    
    let text = template;
    text = text.replace(/{name}/g, person.name);
    text = text.replace(/{company}/g, person.company);
    text = text.replace(/{role}/g, person.role);
    return text;
  }, [template, recipients, selectedRecipientIdx]);

  const handleSendAll = async () => {
    if (recipients.length === 0) {
      addToast('No recipients to send to', 'error');
      return;
    }
    setSending(true);
    addToast('Starting bulk send process...');
    
    try {
      const res = await axios.post(`${API}/send-emails`, {
        recipients,
        template,
        subject: "Application for {role} at {company}",
        delay: 2,
        is_test: false
      });
      
      // Update statuses locally based on report
      const reportMap = {};
      res.data.report.forEach(r => reportMap[r.recipient] = r.status);
      
      setRecipients(prev => prev.map(r => ({ 
        ...r, 
        status: reportMap[r.email] || 'Failed' 
      })));
      
      addToast(`Bulk send completed! Sent: ${res.data.sent}, Failed: ${res.data.failed}`);
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.error || 'Critical SMTP Failure', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(v => v.trim());
          const entry = {};
          headers.forEach((h, i) => {
            entry[h] = values[i];
          });
          return {
            name: entry.name || 'Candidate',
            company: entry.company || 'Company',
            role: entry.role || 'Position',
            email: entry.email || '',
            status: 'Ready'
          };
        }).filter(r => r.email);
        
        setRecipients(data);
        setShowUploadModal(true);
        addToast(`Imported ${data.length} contacts from CSV`);
      };
      reader.readAsText(file);
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
              {['{name}', '{company}', '{role}'].map(v => (
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
                        person.status === 'Success' ? "bg-green-500/10 text-green-400" : "bg-surface-container-highest text-on-surface-variant"
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

      {/* Upload Success Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container border border-outline-variant p-xl rounded-3xl max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-lg">
                <span className="material-symbols-outlined text-[40px]">task_alt</span>
              </div>
              <h3 className="font-headline-md text-on-surface mb-sm">CSV Imported!</h3>
              <p className="text-on-surface-variant mb-xl">
                We found <span className="font-bold text-primary">{recipients.length}</span> valid contacts in your file. They are ready for outreach!
              </p>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="w-full bg-primary text-on-primary py-md rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all"
              >
                GOT IT
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
