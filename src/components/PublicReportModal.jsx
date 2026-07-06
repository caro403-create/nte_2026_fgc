import React, { useState } from 'react';
import { X, AlertTriangle, MapPin, ClipboardList, Info } from 'lucide-react';
import { translations } from '../utils/translations';

export default function PublicReportModal({ isOpen, onClose, onSubmitReport, lang }) {
  const [nodeId, setNodeId] = useState('1');
  const [reportType, setReportType] = useState('smoke');
  const [description, setDescription] = useState('');
  const t = translations[lang || 'es'];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    onSubmitReport({
      nodeId: parseInt(nodeId),
      type: reportType,
      desc: description.trim()
    });
    
    // Reset and close
    setDescription('');
    setNodeId('1');
    setReportType('smoke');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-darkgreen/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.2)] border border-[#EEF5E9] p-8 text-left animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-[#E63946] hover:bg-[#F8FAF5] rounded-full transition-all duration-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#E63946]/10 text-[#E63946] p-3 rounded-2xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#E63946] font-serif-editorial">
              {t.reportTitle}
            </h3>
            <span className="text-xs text-slate-400 font-mono tracking-wider uppercase">
              {lang === 'en' ? 'CITIZEN SENSOR GATE' : 'PUERTA DE SENSOR CIUDADANO'}
            </span>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-slate-50 border border-slate-200 text-slate-600 text-[11px] p-3.5 rounded-xl mb-6 flex gap-2.5 items-start">
          <Info className="h-4 w-4 shrink-0 text-[#2D6A4F] mt-0.5" />
          <p className="leading-relaxed">
            {lang === 'en' 
              ? 'This report will be sent instantly to the central monitoring pipeline. No registration needed.'
              : 'Este reporte se enviará de forma anónima al centro de monitoreo de la brigada. No requiere registro.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Zone/Node selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {t.reportZone}
            </label>
            <select
              value={nodeId}
              onChange={(e) => setNodeId(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8FAF5] border border-[#EEF5E9] rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] font-bold text-[#2D3436] transition-all"
            >
              <option value="1">{lang === 'en' ? 'Node 01 — West slope' : 'Nodo 01 — Ladera Oeste'}</option>
              <option value="2">{lang === 'en' ? 'Node 02 — High mountain' : 'Nodo 02 — Alta Montaña'}</option>
              <option value="3">{lang === 'en' ? 'Node 03 — East valley' : 'Nodo 03 — Valle Este'}</option>
              <option value="4">{lang === 'en' ? 'Node 04 — Northern pass' : 'Nodo 04 — Paso Norte'}</option>
              <option value="5">{lang === 'en' ? 'Node 05 — Southern reserve' : 'Nodo 05 — Reserva Sur'}</option>
            </select>
          </div>

          {/* Report Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <ClipboardList className="h-3.5 w-3.5 text-slate-400" />
              {t.reportType}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReportType('fire')}
                className={`py-3 px-2 border rounded-xl text-[11px] font-bold text-center transition-all ${
                  reportType === 'fire'
                    ? 'border-[#E63946] bg-[#E63946]/5 text-[#E63946]'
                    : 'border-slate-200 bg-[#F8FAF5] hover:bg-white text-[#636E72]'
                }`}
              >
                {t.reportTypeFire}
              </button>
              <button
                type="button"
                onClick={() => setReportType('smoke')}
                className={`py-3 px-2 border rounded-xl text-[11px] font-bold text-center transition-all ${
                  reportType === 'smoke'
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-slate-200 bg-[#F8FAF5] hover:bg-white text-[#636E72]'
                }`}
              >
                {t.reportTypeSmoke}
              </button>
              <button
                type="button"
                onClick={() => setReportType('burn')}
                className={`py-3 px-2 border rounded-xl text-[11px] font-bold text-center transition-all ${
                  reportType === 'burn'
                    ? 'border-[#2D6A4F] bg-[#EEF5E9] text-[#2D6A4F]'
                    : 'border-slate-200 bg-[#F8FAF5] hover:bg-white text-[#636E72]'
                }`}
              >
                {t.reportTypeBurn}
              </button>
              <button
                type="button"
                onClick={() => setReportType('other')}
                className={`py-3 px-2 border rounded-xl text-[11px] font-bold text-center transition-all ${
                  reportType === 'other'
                    ? 'border-slate-500 bg-slate-100 text-slate-700'
                    : 'border-slate-200 bg-[#F8FAF5] hover:bg-white text-[#636E72]'
                }`}
              >
                {t.reportTypeOther}
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              {t.reportDesc}
            </label>
            <textarea
              required
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.reportDescPlaceholder}
              className="w-full px-4 py-3 bg-[#F8FAF5] border border-[#EEF5E9] rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] text-[#2D3436] transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#E63946] hover:bg-[#C92A3A] text-white py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg mt-2 uppercase tracking-wider"
          >
            {t.reportSubmit}
          </button>
        </form>

      </div>
    </div>
  );
}
