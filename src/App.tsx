/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import CubaMap from './components/Map';
import ChurchDetails from './components/ChurchCard';
import AdminPanel from './components/AdminPanel';
import { Church, OperationType } from './types';
import { auth, loginWithGoogle, handleFirestoreError } from './lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { LogIn, LogOut, Plus, Map as MapIcon, Search, Menu, User as UserIcon, X, Navigation, Radar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';

const ADMIN_EMAIL = 'norieltextusa@gmail.com';

// Haversine formula to calculate distance between two points in km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function App() {
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tempCoords, setTempCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [isFindingNearest, setIsFindingNearest] = useState(false);
  const [churches, setChurches] = useState<Church[]>([]);

  const [filteredProvince, setFilteredProvince] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    const unsubChurches = onSnapshot(collection(db, 'churches'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Church));
      setChurches(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'churches');
    });

    return () => {
      unsubAuth();
      unsubChurches();
    };
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const totalChurches = churches.length;
  const totalMissions = churches.filter(c => 
    c.name.toLowerCase().includes('misión') || 
    c.denomination?.toLowerCase().includes('misión')
  ).length;

  const handleMapClick = (lat: number, lng: number) => {
    if (isAdmin) {
      setTempCoords({ lat, lng });
      setIsAdminPanelOpen(true);
    }
  };

  const findNearestChurch = () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no es compatible con tu navegador.");
      return;
    }

    setIsFindingNearest(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
        const querySnapshot = await getDocs(collection(db, 'churches'));
        const churches = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Church));
        
        if (churches.length === 0) {
          alert("No hay iglesias registradas en el mapa.");
          return;
        }

        let nearest = churches[0];
        let minDistance = getDistance(latitude, longitude, nearest.lat, nearest.lng);

        churches.forEach(church => {
          const d = getDistance(latitude, longitude, church.lat, church.lng);
          if (d < minDistance) {
            minDistance = d;
            nearest = church;
          }
        });

        setSelectedChurch(nearest);
      } catch (err) {
        console.error("Error finding churches:", err);
      } finally {
        setIsFindingNearest(false);
      }
    }, (error) => {
      console.error(error);
      alert("No se pudo obtener tu ubicación.");
      setIsFindingNearest(false);
    });
  };

  const provinces = ['Pinar del Río', 'Artemisa', 'La Habana', 'Mayabeque', 'Matanzas', 'Villa Clara', 'Cienfuegos', 'Sancti Spíritus', 'Ciego de Ávila', 'Camagüey', 'Las Tunas', 'Holguín', 'Granma', 'Santiago de Cuba', 'Guantánamo', 'Isla de la Juventud'];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-dark-bg text-dark-text flex">
      {/* Sidebar - Province Filter */}
      <aside className="hidden lg:flex w-80 bg-dark-surface border-r border-dark-border flex-col relative z-40">
        <div className="p-6 border-b border-dark-border">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <MapIcon className="text-primary" size={24} />
            Directorio de Iglesias
          </h1>
          <p className="text-[10px] text-dark-muted uppercase tracking-widest mt-1">Mapa de Cuba</p>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-2">
          <div className="text-[10px] text-dark-muted/40 uppercase font-bold tracking-widest pb-2 ml-2">Explorar Provincias</div>
          <button 
            onClick={() => setFilteredProvince(null)}
            className={`w-full text-left p-3 rounded-lg text-sm transition-colors flex justify-between items-center group ${!filteredProvince ? 'bg-primary/20 text-primary border border-primary/30 font-bold' : 'hover:bg-white/5 text-dark-muted hover:text-white'}`}
          >
            Todas las Iglesias
          </button>
          {provinces.map((prov) => (
            <button 
              key={prov}
              onClick={() => setFilteredProvince(prov)}
              className={`w-full text-left p-3 rounded-lg text-sm transition-colors flex justify-between items-center group ${filteredProvince === prov ? 'bg-primary/20 text-primary border border-primary/30 font-bold' : 'hover:bg-white/5 text-dark-muted hover:text-white'}`}
            >
              {prov}
              <span className={`transition-opacity text-[10px] bg-dark-border px-2 py-0.5 rounded-full text-dark-muted ${filteredProvince === prov ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>Ver</span>
            </button>
          ))}
        </div>

        <div className="p-4 bg-black border-t border-dark-border">
          {!user ? (
            <button 
              onClick={() => loginWithGoogle()}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
            >
              <div className="w-8 h-8 rounded-full bg-dark-border flex items-center justify-center">
                <LogIn size={16} />
              </div>
              <div>
                <p className="text-xs font-medium text-white">Acceso Admin</p>
                <p className="text-[10px] text-dark-muted italic">Clic para conectar</p>
              </div>
            </button>
          ) : (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-white truncate">{user.email}</p>
                  <p className="text-[10px] text-dark-muted">Modo Admin</p>
                </div>
              </div>
              <button 
                onClick={() => signOut(auth)}
                className="p-2 hover:bg-red-500/10 rounded-lg text-dark-muted hover:text-red-400 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col h-full bg-[#0F0F0F]">
        {/* Quick Filter */}
        <div className="absolute top-8 right-8 z-30 flex items-center gap-4">
          <button 
            onClick={findNearestChurch}
            disabled={isFindingNearest}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-2xl shadow-2xl font-bold transition-all disabled:opacity-50"
          >
            {isFindingNearest ? <Radar className="animate-pulse" size={20} /> : <Navigation size={20} />}
            <span className="hidden sm:inline">Más cercana</span>
          </button>

          <div className="hidden md:flex bg-dark-card/90 backdrop-blur-md border border-dark-border rounded-full px-4 py-2 items-center gap-3 shadow-2xl">
            <Search className="w-4 h-4 text-dark-muted" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o pastor..." 
              className="bg-transparent text-xs text-dark-text focus:outline-none w-48"
            />
          </div>

          <div className="flex gap-2">
            <AnimatePresence>
              {isAdmin && !isAdminPanelOpen && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="bg-primary hover:bg-primary-hover text-white p-4 rounded-2xl shadow-xl flex items-center gap-2 group transition-all"
                >
                  <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                  <span className="hidden md:inline font-bold">Agregar Iglesia</span>
                </motion.button>
              )}
            </AnimatePresence>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden bg-dark-card/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-dark-border text-dark-muted hover:text-primary transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Global Stats Overlay (Bottom Left) */}
        <div className="absolute bottom-8 left-8 z-20 hidden md:block">
           <div className="bg-dark-card/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-dark-border shadow-2xl flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-dark-muted uppercase tracking-widest">Iglesias</span>
                <span className="text-xl font-bold text-white leading-none">{totalChurches}</span>
              </div>
              <div className="w-px h-8 bg-dark-border"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-dark-muted uppercase tracking-widest">Misiones</span>
                <span className="text-xl font-bold text-white leading-none">{totalMissions}</span>
              </div>
           </div>
        </div>

        {/* Static Header for Mobile */}
        <div className="lg:hidden absolute top-4 left-4 z-30 p-2 pointer-events-none">
           <div className="bg-dark-card/90 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-dark-border flex items-center gap-2 pointer-events-auto">
              <MapIcon size={20} className="text-primary" />
              <span className="text-xs font-black tracking-tight text-white uppercase">Iglesias Cuba</span>
           </div>
        </div>

        {/* The Map */}
        <div className="flex-1 w-full h-full">
          <CubaMap 
            churches={churches}
            onSelectChurch={setSelectedChurch} 
            onMapClick={isAdmin ? handleMapClick : undefined}
            tempPoint={tempCoords}
            provinceFilter={filteredProvince}
          />
        </div>

        {/* Legend */}
        <div className="hidden md:flex absolute bottom-8 right-8 items-center gap-6 bg-dark-card/95 backdrop-blur-md p-4 rounded-xl border border-dark-border shadow-2xl z-20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-[11px] text-dark-muted">Iglesia Local</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-[11px] text-dark-muted">Misión Activa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-[11px] text-dark-muted">En Construcción</span>
          </div>
        </div>
      </main>

      {/* Details Card Overlay */}
      <AnimatePresence>
        {selectedChurch && (
          <ChurchDetails 
            church={selectedChurch} 
            onClose={() => setSelectedChurch(null)} 
            isAdmin={isAdmin}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Backdrop & Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="h-full w-4/5 bg-dark-bg flex flex-col p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
               <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-2">
                    <MapIcon className="text-primary" size={24} />
                    <h2 className="text-lg font-black text-white">MENU</h2>
                  </div>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-dark-surface rounded-full text-white">
                    <X size={20} />
                  </button>
               </div>
               
               <div className="flex-1 space-y-6 overflow-y-auto">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-dark-muted uppercase tracking-widest ml-1">Filtros rápidos</p>
                    {['La Habana', 'Santiago de Cuba', 'Holguín', 'Camagüey'].map(prov => (
                      <button key={prov} className="w-full text-left p-4 rounded-2xl bg-dark-surface border border-dark-border text-white font-medium">
                        {prov}
                      </button>
                    ))}
                  </div>

                  <div className="h-px bg-dark-border mx-2"></div>

                  <div className="space-y-4">
                    {!user ? (
                      <button 
                        onClick={() => { loginWithGoogle(); setIsMenuOpen(false); }}
                        className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20"
                      >
                        <LogIn size={20} /> Iniciar Sesión
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border">
                          <p className="text-xs text-dark-muted mb-1">Conectado como</p>
                          <p className="font-bold text-white mb-4 overflow-hidden text-ellipsis">{user.email}</p>
                          <button 
                            onClick={() => { signOut(auth); setIsMenuOpen(false); }}
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-500/10 text-red-500 font-bold"
                          >
                            <LogOut size={18} /> Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {isAdminPanelOpen && (
          <AdminPanel 
            onClose={() => {
              setIsAdminPanelOpen(false);
              setTempCoords(null);
            }} 
            initialCoords={tempCoords}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

