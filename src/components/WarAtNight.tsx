import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Play, Pause, SkipBack, Calendar, Moon, Info, Map as MapIcon, Layers, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import 'leaflet/dist/leaflet.css';

// NASA GIBS VIIRS Nighttime Lights (DNB)
// https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_DayNightBand_ENCC/default/{date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png

const DEFAULT_CENTER: [number, number] = [48.3794, 31.1656]; // Ukraine center
const DEFAULT_ZOOM = 6;

const LOCATIONS = [
  { name: 'Ukraine', center: [48.3794, 31.1656], zoom: 6 },
  { name: 'Gaza', center: [31.3547, 34.3088], zoom: 11 },
  { name: 'Sudan', center: [12.8628, 30.2176], zoom: 6 },
  { name: 'Myanmar', center: [21.9162, 95.9560], zoom: 6 },
];

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function WarAtNight() {
  const [currentDate, setCurrentDate] = useState(new Date('2024-01-01'));
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-01-31');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // ms per frame
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const incrementDate = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 1);
      if (next > new Date(endDate)) {
        setIsPlaying(false);
        return new Date(startDate);
      }
      return next;
    });
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(incrementDate, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current as NodeJS.Timeout);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, endDate, startDate]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentDate(new Date(startDate));
  };

  const tileUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_DayNightBand_ENCC/default/${formatDate(currentDate)}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`;

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0d0d1a] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-[#313244] bg-white dark:bg-[#1e1e2e] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Zap className="text-yellow-500" size={24} />
            <h1 className="text-xl font-bold text-gray-900 dark:text-[#cdd6f4]">War at Night</h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-[#a6adc8]">
            Monitor conflict zones using nighttime lights data (VIIRS DNB).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              onClick={() => {
                setCenter(loc.center as [number, number]);
                setZoom(loc.zoom);
              }}
              className="px-3 py-1.5 bg-gray-100 dark:bg-[#313244] hover:bg-gray-200 dark:hover:bg-[#45475a] text-gray-700 dark:text-[#cdd6f4] text-xs font-bold rounded-lg transition-colors border border-gray-200 dark:border-[#45475a]"
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="w-full lg:w-80 p-6 border-r border-gray-200 dark:border-[#313244] bg-white dark:bg-[#1e1e2e] overflow-y-auto thin-scrollbar flex flex-col gap-8">
          {/* Controls */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#7f849c] mb-4 flex items-center gap-2">
              <Calendar size={14} /> Playback Controls
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 dark:text-[#7f849c] uppercase">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-[#313244] border border-gray-300 dark:border-[#45475a] rounded px-3 py-2 text-xs outline-none focus:border-blue-600 dark:focus:border-[#89b4fa]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 dark:text-[#7f849c] uppercase">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-[#313244] border border-gray-300 dark:border-[#45475a] rounded px-3 py-2 text-xs outline-none focus:border-blue-600 dark:focus:border-[#89b4fa]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="p-2 bg-gray-100 dark:bg-[#313244] hover:bg-gray-200 dark:hover:bg-[#45475a] rounded-lg transition-colors border border-gray-200 dark:border-[#45475a]"
                  title="Reset"
                >
                  <SkipBack size={18} />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="flex-1 bg-blue-600 dark:bg-[#89b4fa] hover:bg-blue-700 dark:hover:bg-[#74c7ec] text-white dark:text-[#1e1e2e] py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 dark:text-[#7f849c] uppercase flex justify-between">
                  <span>Playback Speed</span>
                  <span>{speed}ms</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="100"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 dark:bg-[#313244] rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-[#89b4fa]"
                />
              </div>
            </div>
          </section>

          {/* Info */}
          <section className="bg-blue-50 dark:bg-[#89b4fa]/10 p-4 rounded-xl border border-blue-100 dark:border-[#89b4fa]/20">
            <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-[#89b4fa]">
              <Info size={16} />
              <h3 className="text-xs font-bold uppercase">About VIIRS DNB</h3>
            </div>
            <p className="text-[11px] text-blue-600/80 dark:text-[#89b4fa]/80 leading-relaxed">
              The Day/Night Band (DNB) of the VIIRS instrument provides global daily measurements of nocturnal visible and near-infrared light. 
              <br/><br/>
              Changes in light intensity can indicate power grid status, conflict activity, or humanitarian crises.
            </p>
          </section>

          <div className="mt-auto p-4 bg-gray-100 dark:bg-[#313244]/50 rounded-xl border border-gray-200 dark:border-[#313244]">
            <div className="text-[10px] text-gray-500 dark:text-[#7f849c] uppercase font-bold mb-1">Current Date</div>
            <div className="text-lg font-mono font-bold text-gray-900 dark:text-[#cdd6f4]">
              {formatDate(currentDate)}
            </div>
          </div>
        </div>

        {/* Map View */}
        <div className="flex-1 relative bg-black">
          <MapContainer
            center={center}
            zoom={zoom}
            className="h-full w-full"
            key={`${center[0]}-${center[1]}-${zoom}`}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <TileLayer
              url={tileUrl}
              attribution='NASA GIBS VIIRS DNB'
              opacity={0.8}
            />
            <MapUpdater center={center} zoom={zoom} />
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 dark:bg-[#1e1e2e]/90 backdrop-blur-sm p-3 rounded-lg border border-gray-200 dark:border-[#313244] shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Layers size={14} className="text-blue-600 dark:text-[#89b4fa]" />
              <span className="text-xs font-bold text-gray-900 dark:text-[#cdd6f4]">Legend</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded-sm shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>
              <span className="text-[10px] text-gray-600 dark:text-[#a6adc8]">Artificial Light</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
