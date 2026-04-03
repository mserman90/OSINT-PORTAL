import React, { useState } from 'react';
import { Ship, Factory, Bomb, Target, ExternalLink, Info, Map as MapIcon, Layers, Search, Globe, Anchor, Flame, Zap, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

const METHODS = [
  {
    id: 'ships',
    title: 'Ship Tracking (AIS)',
    icon: Ship,
    color: 'text-blue-500',
    description: 'Monitor maritime traffic using Automatic Identification System (AIS) data.',
    sources: [
      { name: 'MarineTraffic', url: 'https://www.marinetraffic.com/', desc: 'Global ship tracking and maritime intelligence.' },
      { name: 'VesselFinder', url: 'https://www.vesselfinder.com/', desc: 'Real-time AIS vessel positions and port calls.' },
      { name: 'Global Fishing Watch', url: 'https://globalfishingwatch.org/map/', desc: 'Monitor commercial fishing activity worldwide.' },
      { name: 'FleetMon', url: 'https://www.fleetmon.com/', desc: 'Vessel tracking and port database.' }
    ],
    guide: 'AIS data is transmitted by ships for safety. OSINT researchers use it to track sanctions evasion, illegal fishing, and military movements.'
  },
  {
    id: 'refineries',
    title: 'Refinery Monitoring',
    icon: Factory,
    color: 'text-orange-500',
    description: 'Detect industrial activity and gas flaring using thermal satellite data.',
    sources: [
      { name: 'VIIRS Nightfire (VNF)', url: 'https://eogdata.mines.edu/products/vnf/', desc: 'Detects combustion sources at night using VIIRS.' },
      { name: 'SkyTruth Flaring Map', url: 'https://skytruth.org/flaring/', desc: 'Interactive map of global gas flaring activity.' },
      { name: 'Sentinel Hub (SWIR)', url: 'https://apps.sentinel-hub.com/eo-browser/', desc: 'Use Band 12 (SWIR) to detect heat signatures from flares.' }
    ],
    guide: 'Gas flaring produces intense heat visible in Short-Wave Infrared (SWIR) bands. Monitoring flares helps estimate production levels and environmental impact.'
  },
  {
    id: 'blast',
    title: 'Blast Assessment',
    icon: Bomb,
    color: 'text-red-500',
    description: 'Analyze damage from explosions using SAR and high-res imagery.',
    sources: [
      { name: 'UNOSAT Damage Maps', url: 'https://www.unitar.org/unosat', desc: 'Satellite-based analysis of conflict damage.' },
      { name: 'Sentinel-1 (SAR)', url: 'https://scihub.copernicus.eu/', desc: 'Synthetic Aperture Radar for change detection regardless of clouds.' },
      { name: 'Bellingcat Damage Guide', url: 'https://bellingcat.github.io/RS4OSINT/C3_Blast.html', desc: 'Methodology for assessing blast damage.' }
    ],
    guide: 'SAR (Synthetic Aperture Radar) can "see" through clouds and smoke. Comparing SAR images from before and after an event reveals structural changes and craters.'
  },
  {
    id: 'objects',
    title: 'Object Detection',
    icon: Target,
    color: 'text-emerald-500',
    description: 'Identify planes, ships, and vehicles in satellite imagery.',
    sources: [
      { name: 'OpenStreetMap (Vectors)', url: 'https://www.openstreetmap.org/', desc: 'Use vector data to verify building footprints and infrastructure.' },
      { name: 'ADS-B Exchange', url: 'https://www.adsbexchange.com/', desc: 'Unfiltered flight tracking data.' },
      { name: 'Satellogic', url: 'https://satellogic.com/', desc: 'High-resolution imagery for object identification.' }
    ],
    guide: 'Object detection involves identifying specific assets (e.g., fighter jets, cargo ships) to verify military presence or supply chain logistics.'
  }
];

export default function AdvancedOsint() {
  const [activeMethod, setActiveMethod] = useState(METHODS[0]);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0d0d1a] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-[#313244] bg-white dark:bg-[#1e1e2e]">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="text-yellow-500" size={24} />
          <h1 className="text-xl font-bold text-gray-900 dark:text-[#cdd6f4]">Advanced OSINT Methods</h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-[#a6adc8]">
          Specialized remote sensing and tracking methodologies inspired by Bellingcat's RS4OSINT.
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar - Method Selection */}
        <div className="w-full lg:w-80 p-6 border-r border-gray-200 dark:border-[#313244] bg-white dark:bg-[#1e1e2e] overflow-y-auto thin-scrollbar">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#7f849c] mb-4">
            Select Methodology
          </h2>
          <div className="space-y-2">
            {METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => setActiveMethod(method)}
                className={`w-full p-4 rounded-xl border transition-all flex items-start gap-4 text-left ${
                  activeMethod.id === method.id
                    ? 'bg-blue-50 dark:bg-[#89b4fa]/10 border-blue-200 dark:border-[#89b4fa]/30 shadow-sm'
                    : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-[#313244]'
                }`}
              >
                <div className={`p-2 rounded-lg bg-white dark:bg-[#1e1e2e] shadow-sm ${method.color}`}>
                  <method.icon size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-[#cdd6f4]">{method.title}</div>
                  <div className="text-[11px] text-gray-500 dark:text-[#a6adc8] line-clamp-1">{method.description}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-yellow-700 dark:text-yellow-500">
              <Info size={16} />
              <span className="text-xs font-bold uppercase">Pro Tip</span>
            </div>
            <p className="text-[11px] text-yellow-600 dark:text-yellow-500/80 leading-relaxed">
              Always cross-reference satellite data with ground-truth information (social media, news reports, or local witnesses) for verification.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto thin-scrollbar bg-gray-50 dark:bg-[#0d0d1a]">
          <motion.div
            key={activeMethod.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            {/* Hero Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl bg-white dark:bg-[#1e1e2e] shadow-lg ${activeMethod.color}`}>
                  <activeMethod.icon size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-[#cdd6f4]">{activeMethod.title}</h2>
                  <p className="text-gray-600 dark:text-[#a6adc8]">{activeMethod.description}</p>
                </div>
              </div>
              
              <div className="p-6 bg-white dark:bg-[#1e1e2e] rounded-2xl border border-gray-200 dark:border-[#313244] shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 dark:text-[#cdd6f4] mb-3 flex items-center gap-2">
                  <Globe size={16} className="text-blue-500" /> Methodology Guide
                </h3>
                <p className="text-sm text-gray-600 dark:text-[#a6adc8] leading-relaxed">
                  {activeMethod.guide}
                </p>
              </div>
            </div>

            {/* Sources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMethod.sources.map((source) => (
                <a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-5 bg-white dark:bg-[#1e1e2e] border border-gray-200 dark:border-[#313244] rounded-2xl hover:border-blue-500 dark:hover:border-[#89b4fa] hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900 dark:text-[#cdd6f4] group-hover:text-blue-600 dark:group-hover:text-[#89b4fa]">
                      {source.name}
                    </span>
                    <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-[#89b4fa]" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-[#a6adc8] leading-relaxed">
                    {source.desc}
                  </p>
                </a>
              ))}
            </div>

            {/* Interactive Element Placeholder */}
            <div className="p-8 bg-gray-900 dark:bg-[#11111b] rounded-2xl border border-gray-800 dark:border-[#313244] flex flex-col items-center justify-center text-center gap-4">
              <div className="p-3 bg-gray-800 dark:bg-[#1e1e2e] rounded-full text-blue-500">
                <MapIcon size={32} />
              </div>
              <div>
                <h4 className="text-white font-bold">Interactive Analysis Tool</h4>
                <p className="text-gray-500 text-xs max-w-sm mx-auto mt-1">
                  Combine these sources with the "Remote Sensing" and "War at Night" tabs for full geospatial analysis.
                </p>
              </div>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-bold transition-colors">
                Launch Integrated Map
              </button>
            </div>
            {/* Deployment Section */}
            <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-3 text-emerald-700 dark:text-emerald-500">
                <Terminal size={18} />
                <h3 className="text-sm font-bold uppercase">GitHub Pages Deployment</h3>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-500/80 leading-relaxed mb-4">
                This toolkit is designed to be fully static and deployable on GitHub Pages. To deploy:
              </p>
              <div className="bg-gray-900 dark:bg-black p-4 rounded-xl font-mono text-[10px] text-emerald-400 space-y-1">
                <div># 1. Build the project</div>
                <div>npm run build</div>
                <div className="mt-2"># 2. Deploy to gh-pages branch</div>
                <div>npx gh-pages -d dist</div>
              </div>
              <p className="text-[10px] text-emerald-600/60 dark:text-emerald-500/40 mt-4 italic">
                Note: Ensure your vite.config.ts has the correct 'base' path if you are not using a custom domain.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
