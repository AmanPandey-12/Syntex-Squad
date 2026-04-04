import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, X, Activity, ShieldCheck, Leaf, ChevronRight, Terminal, CheckCircle, AlertTriangle, FlaskConical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Diagnosis = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [stage, setStage] = useState('IDLE'); // IDLE, LAYER1, LAYER2, DONE, ERROR
  const [loadingText, setLoadingText] = useState('');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [logs, setLogs] = useState([]); // Terminal tracking state
  const fileInputRef = useRef(null);

  const addLog = (text) => setLogs(prev => [...prev, text]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setStage('IDLE');
      setResult(null);
      setErrorMsg('');
      setLogs([]);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;

    try {
      setStage('LAYER1');
      setLoadingText('Connecting to Local Vision Layer...');
      setLogs([]);
      addLog('--> Sending image request to Local Vision Layer...');

      const formData = new FormData();
      formData.append('file', image);

      // Layer 1: FastAPI predict (Cassava TF Hub + Gemini Vision Fallback)
      const layer1Res = await axios.post('http://localhost:8000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { disease_name, inference_time } = layer1Res.data;
      addLog(`--> Vision Model Responded! (${inference_time.toFixed(2)}s)`);
      addLog(`--> Target Crop Classified: ${disease_name}`);

      // ================================= GEMINI REASONER (LAYER 2) =================================
      setStage('LAYER2');
      setLoadingText(`Consulting Gemini Expert for ${disease_name}...`);

      await new Promise(resolve => setTimeout(resolve, 800));
      addLog(`--> Forwarding specific details to Gemini 1.5 AI...`);

      // Layer 2: Express / Gemini JSON Builder
      const layer2Res = await axios.post('http://localhost:5000/api/expert-advice', {
        disease_name
      });

      addLog(`--> Gemini Prescription Received! Compiling report...`);
      await new Promise(resolve => setTimeout(resolve, 500));

      setResult({
        disease: disease_name,
        advice: layer2Res.data
      });
      setStage('DONE');

    } catch (error) {
      console.error(error);
      setStage('ERROR');
      setErrorMsg(error.response?.data?.error || 'Validation Failed: Ensure backend servers are running.');
      addLog(`--> CRITICAL ERROR: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#06090a] text-slate-100 p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              AgroAI Station V4
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Hybrid Multimodal AI: Vision Recognition + Expert Advice</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/40 border border-emerald-800/50 backdrop-blur-md shadow-lg shadow-emerald-900/20">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
              {stage === 'DONE' ? 'TensorFlow + Gemini Processing Complete' : 'System Ready'}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            <div className="relative group rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 aspect-square flex flex-col items-center justify-center transition-all hover:border-emerald-500/50 shadow-2xl shadow-emerald-900/10">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />

              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full relative"
                  >
                    <img src={preview} alt="Plant Leaf" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setPreview(null); setImage(null); setResult(null); setStage('IDLE'); }}
                      className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full backdrop-blur-sm transition-colors z-20"
                    >
                      <X size={20} className="text-white" />
                    </button>
                    {/* Scanning overlay UI */}
                    {(stage === 'LAYER1' || stage === 'LAYER2') && (
                      <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-[4px] flex flex-col items-center justify-center pointer-events-none z-10">
                        <motion.div
                          animate={{ top: ['0%', '100%', '0%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute w-full h-[2px] shadow-[0_0_15px_3px_#34d399] bg-emerald-400 top-0 left-0"
                        />
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => fileInputRef.current.click()}
                    className="cursor-pointer flex flex-col items-center gap-4 text-slate-400 group-hover:text-emerald-400 transition-colors p-8 text-center w-full h-full justify-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center group-hover:bg-emerald-900/30 transition-colors border border-slate-700/50 group-hover:border-emerald-500/30 shadow-lg">
                      <Upload size={32} />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-200">Upload Crop Leaf Image</p>
                      <p className="text-sm mt-1">Multi-model compatibility supported</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              disabled={!image || stage === 'LAYER1' || stage === 'LAYER2'}
              onClick={handleAnalyze}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex justify-center items-center gap-2 shadow-lg ${!image
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : stage === 'LAYER1' || stage === 'LAYER2'
                    ? 'bg-emerald-600/50 text-emerald-100 cursor-wait'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 hover:shadow-emerald-500/25 cursor-pointer'
                }`}
            >
              {(stage === 'LAYER1' || stage === 'LAYER2') ? (
                <><Activity className="animate-spin" size={24} /> Initiating Hybrid Scanning...</>
              ) : (
                <><ChevronRight size={24} /> Generate Analysis</>
              )}
            </button>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 flex flex-col"
          >
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-10 flex-1 backdrop-blur-xl relative overflow-hidden flex flex-col">

              {/* Background gradient bulb */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

              {stage === 'IDLE' && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 min-h-[350px]">
                  <Leaf size={56} className="mb-4 opacity-20" />
                  <p className="text-xl font-medium">Awaiting biological context...</p>
                  <p className="text-sm mt-2 text-center max-w-sm">Upload a crop leaf. The Python service will identify the crop species and disease, and Gemini will prescribe exact cures.</p>
                </div>
              )}

              {errorMsg && (
                <div className="flex-1 flex flex-col items-center justify-center text-red-400 min-h-[350px] text-center max-w-md mx-auto">
                  <AlertTriangle size={56} className="mb-4 text-red-500/50" />
                  <p className="text-xl font-bold">Analysis Terminated</p>
                  <p className="text-sm mt-2 opacity-80">{errorMsg}</p>
                </div>
              )}

              {(stage === 'LAYER1' || stage === 'LAYER2') && (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[350px] space-y-6 w-full">
                  <div className="relative w-28 h-28">
                    <div className="absolute inset-0 border-t-[3px] border-emerald-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-r-[3px] border-cyan-400 rounded-full animate-spin-reverse delay-150"></div>
                    <div className="absolute inset-4 border-b-[3px] border-teal-300 rounded-full animate-spin delay-300"></div>
                  </div>
                  <motion.p
                    key={loadingText}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl md:text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-cyan-300 px-4"
                  >
                    {loadingText}
                  </motion.p>

                  {/* Live Activity Terminal UI */}
                  <div className="w-full max-w-md bg-[#0a0f12] rounded-xl p-4 border border-slate-800 shadow-inner mt-4 font-mono text-xs md:text-sm">
                    <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2 text-slate-500">
                      <Terminal size={14} />
                      <span className="text-xs font-semibold tracking-wider uppercase flex-1">Live Backend Activity Console</span>
                    </div>
                    <div className="flex flex-col gap-2 min-h-[140px]">
                      {logs.map((log, index) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={index}
                          className={`${log.includes('ERROR') ? 'text-red-400' : log.includes('Vision') ? 'text-emerald-400' : 'text-cyan-400'}`}
                        >
                          {log}
                        </motion.div>
                      ))}
                      <div className="flex items-center">
                        <span className="text-slate-500 mr-2">{'>'}</span>
                        <motion.div
                          animate={{ opacity: [1, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          className="w-2 h-4 bg-emerald-400 inline-block"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {stage === 'DONE' && result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8 relative z-10 flex-1 flex flex-col justify-start text-left"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <h2 className="text-xs font-bold text-emerald-400 tracking-widest uppercase mb-2">Layer 1: Vision Diagnostic Target</h2>
                      <p className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                        {result.disease}
                      </p>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-emerald-950/20 rounded-2xl p-4 border border-emerald-900/50 w-28 shrink-0 shadow-lg">
                      <span className="text-4xl font-black text-emerald-400">{result.advice?.health_score || 0}<span className="text-xl text-emerald-600">/10</span></span>
                      <span className="text-xs text-slate-400 uppercase font-bold mt-1 tracking-widest">Health</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                    {/* Organic Treatment */}
                    <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/30 transition-colors shadow-lg">
                      <div className="flex items-center gap-3 mb-4 text-emerald-400 border-b border-slate-700/50 pb-3">
                        <div className="p-2 bg-emerald-900/30 rounded-lg"><Leaf size={20} /></div>
                        <h3 className="font-bold text-sm uppercase tracking-wider">Organic Remedies</h3>
                      </div>
                      <ul className="space-y-3">
                        {result.advice?.organic_treatment?.map((item, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-3 leading-relaxed">
                            <span className="text-emerald-500 mt-1 flex-shrink-0"><CheckCircle size={14} /></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Chemical Options */}
                    <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-colors shadow-lg">
                      <div className="flex items-center gap-3 mb-4 text-cyan-400 border-b border-slate-700/50 pb-3">
                        <div className="p-2 bg-cyan-900/30 rounded-lg"><FlaskConical size={20} /></div>
                        <h3 className="font-bold text-sm uppercase tracking-wider">Chemical Interventions</h3>
                      </div>
                      <ul className="space-y-3">
                        {result.advice?.chemical_treatment?.map((item, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-3 leading-relaxed">
                            <span className="text-cyan-500 mt-1 flex-shrink-0"><CheckCircle size={14} /></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Immediate Critical Actions */}
                  {result.advice?.immediate_actions && result.advice.immediate_actions.length > 0 && (
                    <div className="bg-red-950/20 rounded-2xl p-6 border border-red-900/30 w-full text-left">
                      <div className="flex items-center gap-3 mb-4 text-red-400">
                        <div className="p-2 bg-red-900/30 rounded-lg animate-pulse"><AlertTriangle size={20} /></div>
                        <h3 className="font-bold text-sm uppercase tracking-wider">Immediate Next Steps</h3>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {result.advice.immediate_actions.map((item, i) => (
                          <span key={i} className="bg-red-900/20 text-red-200 border border-red-800/50 px-4 py-2 rounded-xl text-sm shadow-sm">{item}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prevention */}
                  <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 w-full text-left shadow-lg">
                    <div className="flex items-center gap-3 mb-4 text-cyan-400">
                      <div className="p-2 bg-cyan-900/30 rounded-lg"><ShieldCheck size={20} /></div>
                      <h3 className="font-bold text-sm uppercase tracking-wider">Proactive Prevention Strategies</h3>
                    </div>
                    <p className="text-base text-slate-300 leading-relaxed bg-slate-900/30 p-4 rounded-xl border border-slate-700/50">
                      {result.advice?.prevention_tips}
                    </p>
                  </div>

                </motion.div>
              )}

            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Diagnosis;
