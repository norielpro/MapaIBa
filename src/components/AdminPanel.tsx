import React, { useState } from 'react';
import { db, handleFirestoreError, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { OperationType, Church } from '../types';
import { Plus, X, MapPin, Save, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  onClose: () => void;
  initialCoords?: { lat: number, lng: number } | null;
}

export default function AdminPanel({ onClose, initialCoords }: AdminPanelProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    pastor: '',
    address: '',
    phone: '',
    email: '',
    details: '',
    lat: initialCoords?.lat || 21.5218,
    lng: initialCoords?.lng || -77.7812,
    denomination: '',
    province: 'La Habana',
  });

  const provinces = ['Pinar del Río', 'Artemisa', 'La Habana', 'Mayabeque', 'Matanzas', 'Villa Clara', 'Cienfuegos', 'Sancti Spíritus', 'Ciego de Ávila', 'Camagüey', 'Las Tunas', 'Holguín', 'Granma', 'Santiago de Cuba', 'Guantánamo', 'Isla de la Juventud'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'churches'), {
        ...formData,
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'churches');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-dark-surface border border-dark-border rounded-[2.5rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="px-10 py-8 border-b border-dark-border flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Agregar Iglesia</h2>
            <p className="text-xs text-dark-muted font-medium mt-1">Crea un nuevo punto en el mapa interactivo</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors text-dark-muted hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-dark-muted uppercase tracking-widest ml-1">Nombre de la Iglesia</label>
            <input
              required
              className="w-full bg-black/40 border border-dark-border rounded-2xl px-5 py-4 text-sm text-white placeholder:text-dark-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Primera Iglesia Bautista"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-dark-muted uppercase tracking-widest ml-1">Provincia</label>
              <select
                className="w-full bg-black/40 border border-dark-border rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                value={formData.province}
                onChange={e => setFormData({ ...formData, province: e.target.value })}
              >
                {provinces.map(p => <option key={p} value={p} className="bg-dark-bg">{p}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-dark-muted uppercase tracking-widest ml-1">Denominación</label>
              <input
                className="w-full bg-black/40 border border-dark-border rounded-2xl px-5 py-4 text-sm text-white placeholder:text-dark-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={formData.denomination}
                onChange={e => setFormData({ ...formData, denomination: e.target.value })}
                placeholder="Ej. Metodista"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-dark-muted uppercase tracking-widest ml-1">Pastor Principal</label>
            <input
              required
              className="w-full bg-black/40 border border-dark-border rounded-2xl px-5 py-4 text-sm text-white placeholder:text-dark-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.pastor}
              onChange={e => setFormData({ ...formData, pastor: e.target.value })}
              placeholder="Nombre completo"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-dark-muted uppercase tracking-widest ml-1">Dirección Física</label>
            <textarea
              required
              rows={2}
              className="w-full bg-black/40 border border-dark-border rounded-2xl px-5 py-4 text-sm text-white placeholder:text-dark-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Ubicación detallada"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-dark-muted uppercase tracking-widest ml-1">Teléfono</label>
              <input
                className="w-full bg-black/40 border border-dark-border rounded-2xl px-5 py-4 text-sm text-white placeholder:text-dark-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+53 ..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-dark-muted uppercase tracking-widest ml-1">Email</label>
              <input
                type="email"
                className="w-full bg-black/40 border border-dark-border rounded-2xl px-5 py-4 text-sm text-white placeholder:text-dark-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="contacto@servicios.cu"
              />
            </div>
          </div>

          <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 grid grid-cols-2 gap-6">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Latitud</p>
                <input 
                  type="number" step="any"
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-white"
                  value={formData.lat}
                  onChange={e => setFormData({...formData, lat: parseFloat(e.target.value)})}
                />
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Longitud</p>
                <input 
                   type="number" step="any"
                   className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-white"
                   value={formData.lng}
                   onChange={e => setFormData({...formData, lng: parseFloat(e.target.value)})}
                />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-dark-muted uppercase tracking-widest ml-1">Detalles Adicionales</label>
            <textarea
              rows={3}
              className="w-full bg-black/40 border border-dark-border rounded-2xl px-5 py-4 text-sm text-white placeholder:text-dark-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              value={formData.details}
              onChange={e => setFormData({ ...formData, details: e.target.value })}
              placeholder="Misión, horarios, o notas especiales..."
            />
          </div>

          <div className="pt-4">
            <button
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/30 text-white font-black py-5 rounded-2xl shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? 'Guardando...' : 'Publicar Iglesia'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
