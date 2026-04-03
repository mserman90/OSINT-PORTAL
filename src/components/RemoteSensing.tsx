import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Globe, Layers, Info, ExternalLink, Search, Crosshair, Map as MapIcon } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const SATELLITE_SOURCES = [
  {
    name: 'Sentinel Hub / EO Browser',
    description: 'Access Sentinel-1, Sentinel-2, Sentinel-3, Sentinel-5P, Landsat 5, 7, 8, 9, Envisat, MODIS, GIBS, Proba-V.',
    url: 'https://apps.sentinel-hub.com/eo-browser/',
    icon: '🛰️'
  },
  {
    name: 'Google Earth Engine',
    description: 'A planetary-scale platform for Earth science data & analysis.',
    url: 'https://earthengine.google.com/',
    icon: '🌍'
  },
  {
    name: 'Planet Explorer',
    description: 'High-resolution daily satellite imagery.',
    url: 'https://www.planet.com/explorer/',
    icon: '🪐'
  },
  {
    name: 'NASA Worldview',
    description: 'Interactive interface for browsing full-resolution, global satellite imagery.',
    url: 'https://worldview.earthdata.nasa.gov/',
    icon: '🚀'
  },
  {
    name: 'SkyWatch',
    description: 'Commercial satellite data marketplace.',
    url: 'https://skywatch.com/',
    icon: '🔭'
  }
];

const BAND_COMBINATIONS = [
  { name: 'True Color (RGB)', bands: '4, 3, 2', use: 'Natural appearance, vegetation, urban areas.' },
  { name: 'False Color (Infrared)', bands: '8, 4, 3', use: 'Vegetation health, water bodies, urban areas.' },
  { name: 'Short-wave Infrared', bands: '12, 8A, 4', use: 'Geology, soil moisture, vegetation.' },
  { name: 'Atmospheric Penetration', bands: '12, 11, 8A', use: 'Penetrates haze and smoke, useful for fires.' },
  { name: 'NDVI (Vegetation Index)', bands: '(8-4)/(8+4)', use: 'Quantifying vegetation greenness.' }
];

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function RemoteSensing() {
  const [lat, setLat] = useState('38.9637');
  const [lng, setLng] = useState('35.2433');
  const [mapCenter, setMapCenter] = useState<[number, number]>([38.9637, 35.2433]);
  const [mapZoom, setMapZoom] = useState(10);
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newLat = parseFloat(lat);
    const newLng = parseFloat(lng);
    if (!isNaN(newLat) && !isNaN(newLng)) {
      setMapCenter([newLat, newLng]);
      setMapZoom(15);
      setMarkerPos([newLat, newLng]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0d0d1a] overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-[#313244] bg-white dark:bg-[#1e1e2e]">
        <div className="flex items-center gap-3 mb-2">
          <Globe className="text-blue-600 dark:text-[#89b4fa]" size={24} />
          <h1 className="text-xl font-bold text-gray-900 dark:text-[#cdd6f4]">RS4OSINT: Remote Sensing for OSINT</h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-[#a6adc8]">
          Satellite imagery analysis and remote sensing resources inspired by Bellingcat's guide.
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="w-full lg:w-96 p-6 border-r border-gray-200 dark:border-[#313244] bg-white dark:bg-[#1e1e2e] overflow-y-auto thin-scrollbar">
          <div className="space-y-8">
            {/* Search */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#7f849c] mb-4 flex items-center gap-2">
                <Search size={14} /> Coordinate Search
              </h2>
              <form onSubmit={handleSearch} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 dark:text-[#7f849c] uppercase">Latitude</label>
                    <input
                      type="text"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full bg-gray-100 dark:bg-[#313244] border border-gray-300 dark:border-[#45475a] rounded px-3 py-2 text-xs outline-none focus:border-blue-600 dark:focus:border-[#89b4fa]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 dark:text-[#7f849c] uppercase">Longitude</label>
                    <input
                      type="text"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="w-full bg-gray-100 dark:bg-[#313244] border border-gray-300 dark:border-[#45475a] rounded px-3 py-2 text-xs outline-none focus:border-blue-600 dark:focus:border-[#89b4fa]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 dark:bg-[#89b4fa] hover:bg-blue-700 dark:hover:bg-[#74c7ec] text-white dark:text-[#1e1e2e] py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Crosshair size={14} /> Go to Coordinates
                </button>
              </form>
            </section>

            {/* Sources */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#7f849c] mb-4 flex items-center gap-2">
                <Layers size={14} /> Satellite Sources
              </h2>
              <div className="space-y-3">
                {SATELLITE_SOURCES.map((source) => (
                  <a
                    key={source.name}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-50 dark:bg-[#313244] border border-gray-200 dark:border-[#45475a] rounded-lg hover:border-blue-600 dark:hover:border-[#89b4fa] transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-900 dark:text-[#cdd6f4] flex items-center gap-2">
                        <span>{source.icon}</span> {source.name}
                      </span>
                      <ExternalLink size={12} className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-[#89b4fa]" />
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-[#a6adc8] leading-relaxed">
                      {source.description}
                    </p>
                  </a>
                ))}
              </div>
            </section>

            {/* Band Combinations */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#7f849c] mb-4 flex items-center gap-2">
                <Info size={14} /> Band Combinations (Sentinel-2)
              </h2>
              <div className="space-y-2">
                {BAND_COMBINATIONS.map((band) => (
                  <div key={band.name} className="p-2 bg-gray-100 dark:bg-[#11111b] rounded border border-gray-200 dark:border-[#313244]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-blue-600 dark:text-[#89b4fa]">{band.name}</span>
                      <span className="text-[10px] font-mono text-gray-500 dark:text-[#7f849c]">{band.bands}</span>
                    </div>
                    <p className="text-[10px] text-gray-600 dark:text-[#a6adc8]">{band.use}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Map View */}
        <div className="flex-1 relative bg-gray-200 dark:bg-[#11111b]">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full"
          >
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <TileLayer
              attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              opacity={0.7}
            />
            <MapUpdater center={mapCenter} zoom={mapZoom} />
            {markerPos && <Marker position={markerPos} />}
          </MapContainer>
          
          <div className="absolute top-4 right-4 z-[1000] space-y-2">
            <div className="bg-white dark:bg-[#1e1e2e] p-3 rounded-lg shadow-xl border border-gray-200 dark:border-[#313244] max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <MapIcon size={14} className="text-blue-600 dark:text-[#89b4fa]" />
                <span className="text-xs font-bold text-gray-900 dark:text-[#cdd6f4]">Satellite View</span>
              </div>
              <p className="text-[10px] text-gray-600 dark:text-[#a6adc8]">
                Current view: Esri World Imagery. Use the sidebar to search for specific coordinates or explore other providers.
              </p>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 z-[1000]">
            <div className="bg-white/80 dark:bg-[#1e1e2e]/80 backdrop-blur-sm p-2 rounded border border-gray-200 dark:border-[#313244] text-[10px] text-gray-500 dark:text-[#7f849c]">
              Coordinates: {lat}, {lng}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
