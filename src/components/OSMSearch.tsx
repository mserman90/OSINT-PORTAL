import { useState } from 'react';
import { Search, Info } from 'lucide-react';
import Map from './Map';
import { OSMElement } from '../types';
import { buildOSMQuery } from '../lib/osm';

const presets = [
  { label: 'Schools + Hospitals', value: 'amenity=school,amenity=hospital' },
  { label: 'Mosques + Bridges', value: 'building=mosque,highway=bridge' },
  { label: 'Level Crossings', value: 'railway=level_crossing' },
];

export default function OSMSearch() {
  const [lat, setLat] = useState(41.0082);
  const [lon, setLon] = useState(28.9784);
  const [radius, setRadius] = useState(1000);
  const [features, setFeatures] = useState('');
  const [elements, setElements] = useState<OSMElement[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Click on the map to select a center point.');

  const handleSearch = async () => {
    if (!features.trim()) {
      setStatus('Please enter features to search.');
      return;
    }

    setLoading(true);
    setStatus('Searching Overpass API...');
    setElements([]);

    const featureList = features.split(',').map(s => s.trim()).filter(Boolean);
    const query = buildOSMQuery(lat, lon, radius, featureList);

    if (!query) {
      setStatus('No valid features specified.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
      });

      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      const els = data.elements || [];
      setElements(els);
      setStatus(`Found ${els.length} results.`);
    } catch (error) {
      setStatus('Search failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markers = elements.map((el) => ({
    id: el.id,
    position: [
      el.lat || el.center?.lat || 0,
      el.lon || el.center?.lon || 0,
    ] as [number, number],
    popup: (
      <div className="p-1">
        <h3 className="font-bold text-sm">{el.tags?.name || 'Unnamed Feature'}</h3>
        <p className="text-xs text-gray-600">{Object.entries(el.tags || {}).slice(0, 3).map(([k, v]) => `${k}=${v}`).join(', ')}</p>
      </div>
    ),
  }));

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      <div className="w-full md:w-[350px] max-h-[50vh] md:max-h-none bg-white dark:bg-[#1e1e2e] p-6 border-r border-gray-200 dark:border-[#313244] overflow-y-auto flex flex-col gap-6 shrink-0">
        <div>
          <h2 className="text-blue-600 dark:text-[#89b4fa] text-xs font-bold uppercase tracking-widest mb-4">OSM Search</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-600 dark:text-[#a6adc8] uppercase font-bold">Latitude</label>
              <input
                type="number"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value))}
                className="bg-gray-200 dark:bg-[#313244] border border-gray-300 dark:border-[#45475a] text-gray-900 dark:text-[#cdd6f4] rounded px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-[#89b4fa]"
                step="0.0001"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-600 dark:text-[#a6adc8] uppercase font-bold">Longitude</label>
              <input
                type="number"
                value={lon}
                onChange={(e) => setLon(parseFloat(e.target.value))}
                className="bg-gray-200 dark:bg-[#313244] border border-gray-300 dark:border-[#45475a] text-gray-900 dark:text-[#cdd6f4] rounded px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-[#89b4fa]"
                step="0.0001"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 mb-4">
            <label className="text-[10px] text-gray-600 dark:text-[#a6adc8] uppercase font-bold">Radius (meters)</label>
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="bg-gray-200 dark:bg-[#313244] border border-gray-300 dark:border-[#45475a] text-gray-900 dark:text-[#cdd6f4] rounded px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-[#89b4fa]"
            />
          </div>
          <div className="flex flex-col gap-1 mb-4">
            <label className="text-[10px] text-gray-600 dark:text-[#a6adc8] uppercase font-bold">Features (key=value, ...)</label>
            <input
              type="text"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="amenity=school, amenity=hospital"
              className="bg-gray-200 dark:bg-[#313244] border border-gray-300 dark:border-[#45475a] text-gray-900 dark:text-[#cdd6f4] rounded px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-[#89b4fa]"
            />
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => setFeatures(p.value)}
                className="bg-gray-200 dark:bg-[#313244] hover:bg-gray-300 dark:bg-[#45475a] text-cyan-600 dark:text-[#89dceb] text-[10px] font-bold px-2 py-1 rounded transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 dark:bg-[#89b4fa] hover:bg-blue-700 dark:hover:bg-[#74c7ec] text-white dark:text-[#1e1e2e] font-bold py-3 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Search size={18} />
            {loading ? 'Searching...' : 'Search Features'}
          </button>
          <div className="flex items-start gap-2 text-[11px] text-gray-600 dark:text-[#a6adc8]">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>{status}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <Map
          center={[lat, lon]}
          zoom={13}
          onMapClick={(lt, ln) => {
            setLat(lt);
            setLon(ln);
          }}
          markers={markers}
        />
      </div>
    </div>
  );
}
