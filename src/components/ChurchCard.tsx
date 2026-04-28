import React from 'react';
import { Church } from '../types';
import { X, Phone, Mail, MapPin, User, Info, MessageSquare, Map as MapIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface ChurchDetailsProps {
  church: Church;
  onClose: () => void;
}

export default function ChurchDetails({ church, onClose }: ChurchDetailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[420px] p-4 md:p-0 pointer-events-none"
      id="church-details-container"
    >
      <div className="bg-[#1A1A1A]/95 backdrop-blur-md border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-white/10 pointer-events-auto">
        {/* Header with gradient */}
        <div className="h-28 bg-gradient-to-br from-blue-600/20 to-purple-600/20 relative flex items-center justify-center border-b border-white/5">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors text-white"
          >
            <X size={18} />
          </button>
          <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/10 shadow-lg">
             <MessageSquare size={32} className="text-blue-500" />
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white tracking-tight leading-tight">{church.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-blue-500 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                {church.denomination || 'Sin denominación'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-dark-muted/60 uppercase tracking-widest font-bold">Pastor</p>
              <div className="flex items-center gap-2">
                <User size={14} className="text-blue-400" />
                <p className="text-sm text-dark-text font-medium">{church.pastor}</p>
              </div>
            </div>
            {church.phone && (
              <div className="space-y-1 text-right">
                <p className="text-[10px] text-dark-muted/60 uppercase tracking-widest font-bold">Teléfono</p>
                <a href={`tel:${church.phone}`} className="text-sm text-dark-text font-semibold hover:text-blue-400 transition-colors">
                  {church.phone}
                </a>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 transition-colors hover:bg-white/[0.07]">
              <MapPin size={16} className="text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-dark-muted leading-relaxed italic">{church.address}</p>
            </div>
            
            {church.email && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 transition-colors hover:bg-white/[0.07]">
                <Mail size={16} className="text-blue-400 shrink-0" />
                <p className="text-xs text-dark-muted truncate">{church.email}</p>
              </div>
            )}
          </div>

          {church.details && (
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
              <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Info size={12} /> Detalles
              </p>
              <p className="text-xs text-dark-muted line-clamp-3">{church.details}</p>
            </div>
          )}

          <button 
            className="w-full py-4 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${church.lat},${church.lng}`)}
          >
            <MapIcon size={18} className="group-hover:translate-x-1 transition-transform" />
            Cómo llegar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
