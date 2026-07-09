import React from 'react';
import { MapPin as MapPinIcon } from 'lucide-react';

interface MapPinProps {
  x: number;
  y: number;
  title: string;
  isHome?: boolean;
  onClick: () => void;
}

export const MapPin: React.FC<MapPinProps> = ({ x, y, title, isHome, onClick }) => {
  return (
    <div 
      className="absolute flex flex-col items-center cursor-pointer group transform -translate-x-1/2 -translate-y-full"
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={onClick}
    >
      <div className="relative">
        <MapPinIcon 
          size={isHome ? 48 : 32} 
          className={isHome ? "text-rasala-gold animate-pin" : "text-rasala-dark group-hover:scale-110 transition-transform"} 
          fill={isHome ? "#d4af37" : "#1c2b1e"}
        />
      </div>
      <span className="mt-1 px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-rasala-dark">
        {title}
      </span>
    </div>
  );
};
