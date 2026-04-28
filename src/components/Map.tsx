import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Church } from '../types';
import { db, handleFirestoreError } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { OperationType } from '../types';
import { Church as ChurchIcon, Phone, Mail, MapPin, User, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Fix for default marker icons in Leaflet + Vite
const customIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background-color: #2563eb; color: white; padding: 8px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-church"><path d="m18 7 4 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9l4-2"/><path d="M14 2 8 8"/><path d="m16 2-6 6"/><path d="M12 22v-4"/><path d="M9 22v-4a3 3 0 0 1 6 0v4"/><path d="M18 10V7"/><path d="M6 10V7"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const tempIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background-color: #f59e0b; color: white; padding: 8px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapViewProps {
  onSelectChurch: (church: Church | null) => void;
  onMapClick?: (lat: number, lng: number) => void;
  tempPoint?: { lat: number, lng: number } | null;
  provinceFilter?: string | null;
}

export default function CubaMap({ onSelectChurch, onMapClick, tempPoint, provinceFilter }: MapViewProps) {
  const [churches, setChurches] = useState<Church[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'churches'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Church));
      setChurches(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'churches');
    });

    return () => unsub();
  }, []);

  const filteredChurches = provinceFilter 
    ? churches.filter(c => c.province === provinceFilter)
    : churches;

  return (
    <div className="w-full h-full relative" id="map-container">
      <MapContainer 
        center={[21.5218, -77.7812]} 
        zoom={7} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onMapClick && <MapEvents onMapClick={onMapClick} />}
        
        {filteredChurches.map((church) => (
          <Marker 
            key={church.id} 
            position={[church.lat, church.lng]} 
            icon={customIcon}
            eventHandlers={{
              click: () => onSelectChurch(church),
            }}
          />
        ))}

        {tempPoint && (
          <Marker 
            position={[tempPoint.lat, tempPoint.lng]} 
            icon={tempIcon}
          />
        )}
      </MapContainer>
    </div>
  );
}

