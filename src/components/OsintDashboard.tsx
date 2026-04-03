import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Shield, Activity, Map as MapIcon, Rss, AlertTriangle, Database, Terminal, Globe } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const OsintDashboard = () => {
  // --- DURUM (STATE) YÖNETİMİ ---
  const [logs, setLogs] = useState<{time: string, msg: string, type: string}[]>([]);
  const [rssData, setRssData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  
  // Ücretsiz servislerde de kotaları simüle etmek veya X-RateLimit başlıklarını yakalamak zorunludur.
  const [quota, setQuota] = useState({
    limit: 1000,
    used: 0,
    percentage: 0
  });

  // --- LOGLAMA SİSTEMİ ---
  const addLog = (msg: string, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, msg, type }, ...prev].slice(0, 50));
  };

  // --- KOTA YÖNETİMİ ---
  const updateQuota = (remaining: number) => {
    const used = quota.limit - remaining;
    const percentage = (used / quota.limit) * 100;
    setQuota(prev => ({ ...prev, used, percentage }));
    
    if (percentage >= 80) {
      addLog(`KOTA UYARISI: API kullanım limitinizin %${percentage.toFixed(1)}'ine ulaştınız!`, 'warning');
    }
  };

  const incrementLocalQuota = () => {
    setQuota(prev => {
      const newUsed = prev.used + 1;
      const percentage = (newUsed / prev.limit) * 100;
      if (percentage >= 80 && percentage < 81) {
        addLog(`KOTA UYARISI: API kullanım limitinizin %${percentage.toFixed(1)}'ine ulaştınız!`, 'warning');
      }
      return { ...prev, used: newUsed, percentage };
    });
  };

  // --- DAYANIKLI AĞ İSTEKLERİ (RFC 6585 & EXPONENTIAL BACKOFF) ---
  const fetchWithBackoffAndProxy = async (baseUrl: string, isRss = false) => {
    // CORS Fallback Proxy listesi
    const proxies = [
      '', // Önce doğrudan dene
      'https://corsproxy.io/?',
      'https://api.allorigins.win/raw?url='
    ];

    for (let proxy of proxies) {
      let attemptUrl = isRss ? baseUrl : `${proxy}${encodeURIComponent(baseUrl)}`;
      if (proxy === '') attemptUrl = baseUrl;

      let baseDelay = 1000;
      let maxRetries = 3; 

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          addLog(`İstek atılıyor (Deneme ${attempt + 1}): ${attemptUrl}`, 'info');
          incrementLocalQuota();

          const response = await fetch(attemptUrl);
          
          // X-RateLimit-Remaining kontrolü
          const remaining = response.headers.get('X-RateLimit-Remaining');
          if (remaining) updateQuota(parseInt(remaining, 10));

          if (response.ok) {
            addLog(`İstek Başarılı: HTTP 200`, 'success');
            return await response.json();
          }

          // RFC 6585: 429 Too Many Requests
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            let waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : (baseDelay * Math.pow(2, attempt)) + (Math.random() * 1000);
            addLog(`HTTP 429 (Kota Aşıldı). Retry-After uyumu ile bekleniyor: ${Math.round(waitTime)}ms`, 'warning');
            await new Promise(res => setTimeout(res, waitTime));
            continue;
          }

          throw new Error(`HTTP ${response.status}`);

        } catch (err: any) {
          let waitTime = (baseDelay * Math.pow(2, attempt)) + (Math.random() * 1000);
          addLog(`Bağlantı Hatası: ${err.message}. Üstel Geri Çekilme (Jitter): ${Math.round(waitTime)}ms`, 'error');
          await new Promise(res => setTimeout(res, waitTime));
        }
      }
    }
    
    addLog(`Kritik: Tüm denemeler ve yedek proxyler başarısız oldu.`, 'error');
    throw new Error("Veri mevcut değil");
  };

  // --- VERİ TOPLAMA OPERASYONU (ANAHTARSIZ / FREE) ---
  const executeOsintScan = async () => {
    setLoading(true);
    setErrorMsg(null);
    setRssData(null);
    setEvents([]);
    
    addLog('Açık Kaynak OSINT Taraması Başlatılıyor...', 'info');

    try {
      // 1. Otonom RSS Çekimi (rss2json API - Keyless)
      const targetRss = "https://reliefweb.int/updates/rss.xml"; 
      const rssUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(targetRss)}`;
      
      try {
        const rssResponse = await fetchWithBackoffAndProxy(rssUrl, true);
        if (rssResponse && rssResponse.items) {
          setRssData(rssResponse.items.slice(0, 5));
          addLog('RSS Verileri başarıyla çekildi.', 'success');
        }
      } catch (e) {
        addLog('RSS Çekimi Başarısız.', 'error');
      }

      // 2. NASA EONET API (Termal Anomaliler / Yangınlar - Keyless)
      const eonetUrl = 'https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&status=open';
      const eonetData = await fetchWithBackoffAndProxy(eonetUrl, false);
      
      if (eonetData && eonetData.events && eonetData.events.length > 0) {
        addLog(`NASA EONET'ten ${eonetData.events.length} adet açık termal olay tespit edildi.`, 'success');
        setEvents(eonetData.events);
        addLog('Termal anomali verileri haritaya işleniyor.', 'success');
      } else {
        throw new Error("Veri mevcut değil");
      }

    } catch (error) {
      setErrorMsg("Veri mevcut değil");
      addLog('Operasyon Durduruldu: Veri mevcut değil.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-slate-950 text-slate-300 font-sans p-4 overflow-y-auto">
      
      {/* ÜST BİLGİ VE AYARLAR */}
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-emerald-500" />
          <div>
            <h1 className="text-xl font-bold text-white tracking-wider uppercase">Açık Kaynak İzleme Ağı</h1>
            <p className="text-xs text-slate-500">Keyless Termal Anomali ve OSINT Sistemi</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <button 
            onClick={executeOsintScan}
            disabled={loading}
            className={`px-6 py-2 rounded text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
          >
            {loading ? <Activity className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {loading ? 'Ağ Taranıyor...' : 'Açık Kaynak Taramayı Başlat'}
          </button>
        </div>
      </header>

      {/* ANA IZGARA (GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SOL PANEL - HARİTA */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-xl flex flex-col h-[500px] relative">
            <div className="bg-slate-800/50 p-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-emerald-400" />
                <h2 className="font-semibold text-white text-sm">NASA EONET Termal Katmanı</h2>
              </div>
            </div>
            
            <div className="flex-1 w-full bg-slate-950 z-0">
              <MapContainer
                center={[38.9637, 35.2433]}
                zoom={4}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  subdomains="abcd"
                />
                {events.map((event: any, idx: number) => {
                  if (event.geometry && event.geometry.length > 0) {
                    const geo = event.geometry[0];
                    if (geo.type === 'Point') {
                      const [lng, lat] = geo.coordinates;
                      return (
                        <CircleMarker
                          key={idx}
                          center={[lat, lng]}
                          radius={6}
                          pathOptions={{
                            fillColor: "#ef4444",
                            color: "#991b1b",
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                          }}
                        >
                          <Popup>
                            <div className="text-xs">
                              <b className="block mb-1">{event.title}</b>
                              Kategori: Termal Anomali<br/>
                              Tarih: {new Date(geo.date).toLocaleDateString()}
                            </div>
                          </Popup>
                        </CircleMarker>
                      );
                    }
                  }
                  return null;
                })}
              </MapContainer>
            </div>

            {/* Hata veya Bekleme Arayüzü (Kurgusal veri kullanılmaz) */}
            {errorMsg && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[1000]">
                <div className="bg-slate-900 border border-red-900 p-6 rounded-lg text-center shadow-2xl">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white">{errorMsg}</h3>
                  <p className="text-sm text-slate-400 mt-2">Açık veri ağlarına erişim sağlanamadı. Kurgusal veri gösterilmeyecektir.</p>
                </div>
              </div>
            )}
          </div>

          {/* ALT PANEL - LOGLAR */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-xl flex flex-col h-[300px]">
             <div className="bg-slate-800/50 p-3 border-b border-slate-800 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h2 className="font-semibold text-white text-sm">Ağ Logları & RFC 6585 Denetimi</h2>
             </div>
             <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-400 space-y-1">
               {logs.map((log, i) => (
                 <div key={i} className={`border-b border-slate-800/50 pb-1 ${log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-amber-400' : log.type === 'success' ? 'text-emerald-400' : ''}`}>
                   <span className="text-slate-600 mr-2">[{log.time}]</span>
                   {log.msg}
                 </div>
               ))}
               {logs.length === 0 && <div className="text-slate-600 italic">Sistem beklemede... İstek atıldığında ağ logları burada belirecektir.</div>}
             </div>
          </div>
        </div>

        {/* SAĞ PANEL */}
        <div className="col-span-1 flex flex-col gap-6">
          
          {/* KOTA BİLGİSİ */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-xl p-4">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <h2 className="font-semibold text-white text-sm">API Kota Takibi (Sanal/Lokal)</h2>
                </div>
                <span className="text-xs font-mono bg-slate-950 px-2 py-1 rounded">{quota.used} / {quota.limit}</span>
             </div>
             <div className="w-full bg-slate-950 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ${quota.percentage >= 80 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${Math.min(quota.percentage, 100)}%` }}
                ></div>
             </div>
             {quota.percentage >= 80 && (
               <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                 <AlertTriangle className="w-3 h-3" /> Kritik kota seviyesi!
               </p>
             )}
          </div>

          {/* RSS AKIŞI */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-xl flex flex-col flex-1">
            <div className="bg-slate-800/50 p-3 border-b border-slate-800 flex items-center gap-2">
              <Rss className="w-4 h-4 text-emerald-400" />
              <h2 className="font-semibold text-white text-sm">OSINT Haber Akışı (Orijinal Kaynak)</h2>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {rssData ? (
                <ul className="space-y-4">
                  {rssData.map((item, idx) => (
                    <li key={idx} className="border-b border-slate-800 pb-3 last:border-0">
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-300 hover:text-emerald-400 font-medium leading-snug block mb-1">
                        {item.title}
                      </a>
                      <span className="text-xs text-slate-500">{new Date(item.pubDate).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              ) : errorMsg === "Veri mevcut değil" ? (
                 <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                   <Database className="w-8 h-8 opacity-50" />
                   <p className="text-sm">{errorMsg}</p>
                 </div>
              ) : (
                <div className="text-xs text-slate-500 italic">Sistem beklemede... İstek atıldığında ağ logları burada belirecektir.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OsintDashboard;
