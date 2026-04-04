import React, { useState, useEffect } from 'react';
import {
   LayoutDashboard, Users, Bell, Search, Settings,
   LogOut, Shield, TrendingUp, Activity,
   Filter, Download, Plus, Edit2, Trash2,
   Menu, X, FileText, Award, AlertCircle,
   Eye, UserPlus, UserMinus, ChevronDown,
   Bug, Leaf, DollarSign, Sparkles, Wand2, Globe, List, CheckCircle2, ArrowLeft, Mail, Fingerprint, Trash
} from 'lucide-react';
import { 
   LineChart, Line, BarChart, Bar, XAxis, YAxis, 
   CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebase';
import { collection, onSnapshot, doc, getDoc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { aiTranslateScheme } from '../services/aiService';

/* --- Premium Stat Card --- */
const StatCard = ({ title, value, trend, icon: Icon, color, delay }) => (
   <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      className="relative group h-full"
   >
      <div className={`p-8 bg-white h-full rounded-[2.5rem] border border-slate-100 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl`}>
         <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full -mr-16 -mt-16 bg-${color}-500 group-hover:scale-150 transition-transform duration-700`} />
         <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
               <div className={`w-14 h-14 bg-${color}-50 flex items-center justify-center rounded-2xl text-${color}-600 mb-6 group-hover:rotate-12 transition-transform`}>
                  <Icon size={28} strokeWidth={2.5} />
               </div>
               <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">{title}</p>
            </div>
            <div className="flex items-end gap-3">
               <h3 className="text-4xl font-black text-slate-900 tracking-tight">{value}</h3>
               {trend && (
                  <span className={`text-xs font-black tracking-widest ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'} mb-2`}>
                     {trend > 0 ? '+' : ''}{trend}%
                  </span>
               )}
            </div>
         </div>
      </div>
   </motion.div>
);

const UserModal = ({ user, onClose, onSave }) => {
   const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '', role: user?.role || 'Farmer' });
   return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xl z-[5000] flex items-center justify-center p-6">
         <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="bg-white rounded-[3.5rem] p-12 max-w-xl w-full shadow-2xl relative">
            <button onClick={onClose} className="absolute top-8 right-8 p-4 bg-slate-50 text-slate-400 rounded-3xl hover:bg-rose-50 hover:text-rose-500 transition-all"><X size={24} /></button>
            <div className="mb-10 text-center"><h3 className="text-3xl font-black text-slate-900 tracking-tight">{user ? 'Edit Hub Member' : 'New Member'}</h3><p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Authorization Database Interface</p></div>
            <div className="space-y-8">
               <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.3em] ml-2">Identity Name</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-lg text-slate-900 transition-all" /></div>
               <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.3em] ml-2">Global Email Channel</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-lg text-slate-900 transition-all" /></div>
               <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.3em] ml-2">Assigned Role</label><select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-lg text-slate-900 transition-all appearance-none"><option value="Farmer">Farmer Access</option><option value="Admin">Root Admin</option></select></div>
            </div>
            <div className="flex gap-4 mt-12"><button onClick={onClose} className="flex-1 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest">Discard</button><button onClick={() => onSave(formData)} className="flex-[2] py-6 bg-slate-900 text-white font-black rounded-3xl hover:bg-black transition-all text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20">Commit Changes</button></div>
         </motion.div>
      </motion.div>
   );
};

const AdminPage = () => {
   const [activeTab, setActiveTab] = useState('dashboard');
   const [sidebarOpen, setSidebarOpen] = useState(true);
   const [users, setUsers] = useState([]);
   const [adminProfile, setAdminProfile] = useState(null);
   const [loading, setLoading] = useState(true);
   const [selectedUser, setSelectedUser] = useState(null);
   const [showUserModal, setShowUserModal] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [schemes, setSchemes] = useState([]);
   const [diagnoses, setDiagnoses] = useState([]); 
   const [showSchemeModal, setShowSchemeModal] = useState(false);
   const [selectedScheme, setSelectedScheme] = useState(null);

   const navigate = useNavigate();

   useEffect(() => {
      const unsubAuth = onAuthStateChanged(auth, async (u) => {
         if (!u) return navigate('/login');
         const userDoc = await getDoc(doc(db, 'users', u.uid));
         if (!userDoc.exists() || userDoc.data().role !== 'Admin') return navigate('/dashboard');
         setAdminProfile(userDoc.data());
      });
      const unsubUsers = onSnapshot(collection(db, 'users'), snap => { setUsers(snap.docs.map(d => ({ ...d.data(), uid: d.id }))); setLoading(false); });
      const unsubSchemes = onSnapshot(collection(db, 'schemes'), snap => { setSchemes(snap.docs.map(d => ({ ...d.data(), id: d.id }))); });
      const unsubDiagnoses = onSnapshot(collection(db, 'diagnoses'), snap => { setDiagnoses(snap.docs.map(d => ({ ...d.data(), id: d.id }))); });
      return () => { unsubAuth(); unsubUsers(); unsubSchemes(); unsubDiagnoses(); };
   }, [navigate]);

   const handleSaveUser = async (data) => {
      try { selectedUser ? await updateDoc(doc(db, 'users', selectedUser.uid), data) : null; setShowUserModal(false); } catch (e) { alert('Update failed'); }
   };

   const handleSaveScheme = async (localizedData) => {
      try {
         if (selectedScheme) { await updateDoc(doc(db, 'schemes', selectedScheme.id), localizedData); }
         else { await addDoc(collection(db, 'schemes'), { ...localizedData, createdAt: new Date().toISOString() }); }
         setShowSchemeModal(false); setSelectedScheme(null);
      } catch (e) { alert('Failed'); }
   };

   const handleLogout = async () => { await signOut(auth); navigate('/login'); };

   const DashboardView = () => (
      <div className="space-y-8">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard title="Total Users" value={users.length} icon={Users} color="blue" delay={0.1} />
            <StatCard title="Root Access" value={users.filter(u => u.role === 'Admin').length} icon={Shield} color="emerald" delay={0.2} />
            <StatCard title="Analysed Data" value={diagnoses.length} icon={Activity} color="rose" delay={0.3} />
            <StatCard title="Live Schemes" value={schemes.length} icon={Award} color="amber" delay={0.4} />
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 h-[450px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[{n:'D1',v:users.length-4},{n:'D2',v:users.length-2},{n:'TODAY',v:users.length}]}>
                     <defs><linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#84cc16" stopOpacity={0.3}/><stop offset="95%" stopColor="#84cc16" stopOpacity={0}/></linearGradient></defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="n" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} /><YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} /><Tooltip /><Area type="monotone" dataKey="v" stroke="#84cc16" strokeWidth={5} fill="url(#colorV)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white"><h4 className="text-xl font-black mb-8 opacity-40 uppercase tracking-[0.2em] text-xs">Node Health</h4><div className="space-y-6">{['Core Database', 'Cloud Engine', 'Gateway API'].map(s => (<div key={s} className="bg-white/5 p-6 rounded-[2rem] flex justify-between items-center group cursor-pointer hover:bg-white/10 transition-all"><span className="text-sm font-bold text-slate-400 group-hover:text-white">{s}</span><div className="w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_10px_#a3e635] animate-pulse" /></div>))}</div></div>
         </div>
      </div>
   );

   const UsersView = () => (
      <div className="space-y-10">
         <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 flex gap-8 items-center flex-col md:flex-row">
            <div className="flex-1"><h3 className="text-4xl font-black text-slate-900 tracking-tight">Identity Hub</h3><p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-2">Manage Global Access Authorization</p></div>
            <div className="relative w-full md:w-96 group"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} /><input type="text" placeholder="Search by email..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full pl-16 pr-6 py-5 bg-slate-50 rounded-3xl outline-none font-bold text-slate-900 border-2 border-transparent focus:border-indigo-500 transition-all" /></div>
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {users.filter(u=>(u.email || '').toLowerCase().includes(searchQuery.toLowerCase())).map((u, i) => (
               <motion.div key={u.uid} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-white p-8 rounded-[3rem] shadow-lg border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                  <div className="flex items-center gap-6 relative z-10">
                     <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center font-black text-white text-3xl shadow-xl group-hover:rotate-6 transition-transform">{u.name?.charAt(0) || <Fingerprint size={32} />}</div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1"><h4 className="text-2xl font-black text-slate-900 truncate">{u.name || 'Anonymous'}</h4><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${u.role === 'Admin' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{u.role}</span></div>
                        <div className="flex items-center gap-2 text-slate-400"><Mail size={14} className="flex-shrink-0" /><p className="text-sm font-bold truncate tracking-tight">{u.email || 'No email attached'}</p></div>
                     </div>
                     <button onClick={() => { setSelectedUser(u); setShowUserModal(true); }} className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"><Edit2 size={24} /></button>
                     <button onClick={() => { if(window.confirm('Erase Account?')) deleteDoc(doc(db,'users',u.uid)) }} className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"><Trash size={24} /></button>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>
   );

   const SchemesView = () => (
      <div className="space-y-8">
         <div className="flex justify-between items-center bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100">
            <div><h3 className="text-4xl font-black text-slate-900 tracking-tight">Scheme Engine</h3><p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-2">Active National Distribution Stream</p></div>
            <button onClick={() => { setSelectedScheme(null); setShowSchemeModal(true); }} className="px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl hover:bg-black transition-all flex items-center gap-4 group"><Plus size={24} className="group-hover:rotate-90 transition-transform" /> Create Publication</button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {schemes.map(s => (
               <motion.div key={s.id} layout className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 hover:border-amber-500 transition-all group overflow-hidden relative">
                  <div className="flex justify-between items-start mb-8 relative z-10">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform"><Award size={32} /></div>
                        <div><h4 className="font-black text-slate-900 text-2xl leading-tight">{s.name}</h4><span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">{s.category}</span></div>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
                     <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 text-center"><span className="block text-[9px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Financial Aid</span><p className="text-xl font-black text-slate-900">{s.budget || '—'}</p></div>
                     <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 text-center"><span className="block text-[9px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Target Reach</span><p className="text-xl font-black text-slate-900">{s.beneficiaries || '—'}</p></div>
                  </div>
                  <div className="flex gap-4 relative z-10">
                     <button onClick={() => { setSelectedScheme(s); setShowSchemeModal(true); }} className="flex-1 py-6 bg-slate-50 text-slate-600 font-black rounded-3xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-3"><Edit2 size={24} /> Edit</button>
                     <button onClick={() => { if(window.confirm('Erase Data?')) deleteDoc(doc(db, 'schemes', s.id)); }} className="p-6 bg-rose-50 text-rose-500 rounded-3xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={28} /></button>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>
   );

   if (loading && !adminProfile) return <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center"><div className="w-16 h-16 border-4 border-lime-500/20 border-t-lime-500 rounded-full animate-spin mb-4" /><p className="text-lime-500 font-black text-xs uppercase tracking-widest animate-pulse">Initializing Root Engine...</p></div>;

   return (
      <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
         <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-slate-900 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-500 shadow-2xl`}>
            <div className="p-10 pb-12 flex items-center gap-4"><div className="w-14 h-14 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-[1.5rem] flex items-center justify-center text-slate-900 shadow-2xl shadow-lime-500/20 active:scale-90 transition-transform"><Shield size={32} strokeWidth={3} /></div><h1 className="text-2xl font-black tracking-tighter">Identity<span className="text-lime-400">X</span></h1></div>
            <nav className="p-6 space-y-4">{[{ id: 'dashboard', label: 'Dashboard Monitor', icon: LayoutDashboard }, { id: 'users', label: 'Identity Hub', icon: Users }, { id: 'schemes', label: 'Universal Gateway', icon: Award }].map(item => (<button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-5 px-8 py-6 rounded-[2.2rem] text-sm font-black transition-all group ${activeTab === item.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}><item.icon size={24} className={`${activeTab === item.id ? 'text-lime-500' : 'text-slate-500 group-hover:text-white'} transition-colors`} /> {item.label}</button>))}</nav>
            <div className="absolute bottom-10 left-0 w-full px-8"><button onClick={handleLogout} className="w-full flex items-center justify-center gap-4 py-6 bg-white/5 border border-white/10 rounded-[2.2rem] text-[10px] font-black text-slate-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all uppercase tracking-[0.2em]">Terminate Admin Link</button></div>
         </aside>

         <main className="flex-1 min-w-0 h-screen overflow-y-auto bg-slate-50/20">
            <header className="bg-white/90 backdrop-blur-3xl border-b border-slate-100 sticky top-0 z-40 p-8 flex justify-between items-center h-28">
               <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-4 bg-slate-100 rounded-2xl"><Menu size={24} /></button>
               <div className="flex items-center gap-8 ml-auto">
                  <div className="text-right hidden sm:block"><p className="text-base font-black text-slate-900 -mb-1">{adminProfile?.name}</p><p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">Authenticated Supervisor</p></div>
                  <div className="w-16 h-16 rounded-[1.8rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-500/20 hover:scale-110 transition-transform cursor-pointer"> {adminProfile?.name?.charAt(0) || 'A'} </div>
               </div>
            </header>
            <div className="p-14 max-w-[1700px] mx-auto">
               <AnimatePresence mode="wait"><motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>{activeTab === 'dashboard' && <DashboardView />}{activeTab === 'users' && <UsersView />}{activeTab === 'schemes' && <SchemesView />}</motion.div></AnimatePresence>
            </div>
         </main>

         <AnimatePresence>{showUserModal && <UserModal user={selectedUser} onClose={() => setShowUserModal(false)} onSave={handleSaveUser} />}</AnimatePresence>
         <AnimatePresence>{showSchemeModal && <SchemeModal scheme={selectedScheme} onClose={() => setShowSchemeModal(false)} onSave={handleSaveScheme} />}</AnimatePresence>
      </div>
   );
};

/* --- FULL SCREEN SCHEME MODAL --- */

const SchemeModal = ({ scheme, onClose, onSave }) => {
   const [saving, setSaving] = useState(false);
   const [formData, setFormData] = useState({
      name: scheme?.name || '',
      category: scheme?.category || '',
      budget: scheme?.budget || '',
      beneficiaries: scheme?.beneficiaries || '',
      description: scheme?.description || '',
      status: scheme?.status || 'Active',
      link: scheme?.link || ''
   });

   const handleSave = async () => {
      if (!formData.name || !formData.description) return alert('Input required');
      setSaving(true);
      try {
         const localizations = await aiTranslateScheme(formData);
         await onSave({ ...formData, localizations });
      } catch (e) {
         await onSave(formData);
      } finally {
         setSaving(false);
      }
   };

   return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-white z-[6000] overflow-y-auto">
         <div className="max-w-6xl mx-auto p-16 min-h-screen">
            <div className="flex justify-between items-center mb-16">
               <button onClick={onClose} className="p-5 bg-slate-50 text-slate-400 rounded-3xl hover:bg-slate-900 hover:text-white transition-all flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-sm"><ArrowLeft size={24} /> Exit Editor</button>
               <div className="text-center"><div className="flex items-center justify-center gap-3 text-indigo-500 mb-2 font-black text-[10px] uppercase tracking-[0.4em]"><Sparkles size={20} /> Deep Intelligence Sync Mode</div><h3 className="text-5xl font-black text-slate-900 tracking-tighter capitalize">{scheme ? 'Refine' : 'Add'} National Scheme</h3></div>
               <div className="w-32" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
               <div className="lg:col-span-2 space-y-12">
                  <div className="bg-slate-50/50 p-12 rounded-[5rem] border-2 border-dashed border-slate-200">
                     <div className="space-y-10">
                        <div><label className="block text-[11px] font-black text-slate-400 uppercase mb-5 tracking-[0.4em] ml-6">Primary Identity Title</label><input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full px-12 py-8 bg-white rounded-[2.5rem] outline-none font-black text-3xl text-slate-900 shadow-2xl border-2 border-transparent focus:border-indigo-500 transition-all" placeholder="National Welfare Fund" /></div>
                        <div className="grid grid-cols-2 gap-10">
                           <div><label className="block text-[11px] font-black text-slate-400 uppercase mb-5 tracking-[0.4em] ml-6">Classification</label><input type="text" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full px-10 py-6 bg-white rounded-[1.8rem] outline-none font-bold text-xl text-slate-900 shadow-lg" /></div>
                           <div><label className="block text-[11px] font-black text-slate-400 uppercase mb-5 tracking-[0.4em] ml-6">Application State</label><select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} className="w-full px-10 py-6 bg-white rounded-[1.8rem] outline-none font-bold text-xl text-slate-900 shadow-lg appearance-none"><option value="Active">Operational & Active</option><option value="Closing">Terminating Soon</option></select></div>
                        </div>
                        <div><label className="block text-[11px] font-black text-slate-400 uppercase mb-5 tracking-[0.4em] ml-6">Universal Information Packet</label><textarea value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} rows={10} className="w-full px-12 py-10 bg-white rounded-[3rem] outline-none font-bold text-xl leading-relaxed text-slate-900 shadow-lg resize-none" /></div>
                     </div>
                  </div>
               </div>

               <div className="space-y-12">
                  <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 pointer-events-none" />
                     <h4 className="text-2xl font-black mb-10 flex items-center gap-4"><Globe size={32} className="text-indigo-400" /> Regional Data</h4>
                     <div className="space-y-10">
                        <div><label className="block text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black mb-3 ml-2">Benefit Value Package</label><input type="text" value={formData.budget} onChange={e=>setFormData({...formData, budget: e.target.value})} className="w-full px-8 py-5 bg-white/5 rounded-2xl outline-none text-white border border-white/10 focus:border-indigo-500 font-bold" /></div>
                        <div><label className="block text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black mb-3 ml-2">Verified Reach Target</label><input type="text" value={formData.beneficiaries} onChange={e=>setFormData({...formData, beneficiaries: e.target.value})} className="w-full px-8 py-5 bg-white/5 rounded-2xl outline-none text-white border border-white/10 focus:border-indigo-500 font-bold" /></div>
                        <div><label className="block text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black mb-3 ml-2">Official Discovery Portal</label><input type="url" value={formData.link} onChange={e=>setFormData({...formData, link: e.target.value})} className="w-full px-8 py-5 bg-white/5 rounded-2xl outline-none text-white border border-white/10 focus:border-indigo-500 font-bold" placeholder="https://..." /></div>
                     </div>
                  </div>
                  <div className="flex flex-col gap-6 pt-6">
                     <button onClick={handleSave} disabled={saving} className="py-10 bg-indigo-600 text-white rounded-[3rem] font-black text-sm uppercase tracking-[0.4em] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 disabled:opacity-50 group"> {saving ? <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={32} className="group-hover:rotate-12 transition-transform" />} {saving ? 'Syncing...' : 'Sync & Publish'} </button>
                     <button onClick={onClose} className="py-8 bg-slate-100 text-slate-500 rounded-[3rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-rose-50 hover:text-rose-500 transition-all">Discard Publication</button>
                  </div>
               </div>
            </div>
         </div>
      </motion.div>
   );
};

export default AdminPage;