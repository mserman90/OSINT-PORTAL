import { useState, useEffect } from 'react';
import { AlertTriangle, Radio, Globe, ExternalLink, RefreshCw, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface Alert {
  id: string;
  title: string;
  description: string;
  link: string;
  date: string;
  severity?: string;
  urgency?: string;
  certainty?: string;
  event?: string;
}

const PREDEFINED_FEEDS = [
  {
    name: 'US National Weather Service (All)',
    url: 'https://alerts.weather.gov/cap/us.php?x=1',
    type: 'cap'
  },
  {
    name: 'GDACS Global Disasters',
    url: 'https://www.gdacs.org/xml/rss.xml',
    type: 'rss'
  },
  {
    name: 'USGS Earthquakes (M2.5+)',
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.atom',
    type: 'atom'
  }
];

export default function CAPAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeed, setSelectedFeed] = useState<string>(PREDEFINED_FEEDS[0].url);
  const [customFeed, setCustomFeed] = useState<string>('');

  const fetchFeed = async (urlToFetch: string) => {
    setLoading(true);
    setError(null);
    try {
      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(urlToFetch)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(urlToFetch)}`,
        `https://corsproxy.io/?${encodeURIComponent(urlToFetch)}`
      ];

      let xmlText = '';
      for (const proxy of proxies) {
        try {
          const response = await fetch(proxy);
          if (response.ok) {
            xmlText = await response.text();
            if (xmlText.includes('<?xml') || xmlText.includes('<rss') || xmlText.includes('<feed')) {
              break;
            }
          }
        } catch (e) {
          console.warn(`Proxy ${proxy} failed`);
        }
      }

      if (!xmlText) {
        throw new Error('Failed to fetch feed. It might be unreachable or blocking proxies.');
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      // Check for parsing errors
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error('Failed to parse XML feed.');
      }

      const parsedAlerts: Alert[] = [];

      // Parse RSS/CAP items
      const items = xmlDoc.querySelectorAll('item');
      items.forEach((item, index) => {
        const title = item.querySelector('title')?.textContent || 'No Title';
        const description = item.querySelector('description')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const date = item.querySelector('pubDate')?.textContent || '';
        
        // CAP specific fields (often namespaced)
        const severity = item.getElementsByTagName('cap:severity')[0]?.textContent || item.getElementsByTagName('severity')[0]?.textContent;
        const urgency = item.getElementsByTagName('cap:urgency')[0]?.textContent || item.getElementsByTagName('urgency')[0]?.textContent;
        const certainty = item.getElementsByTagName('cap:certainty')[0]?.textContent || item.getElementsByTagName('certainty')[0]?.textContent;
        const event = item.getElementsByTagName('cap:event')[0]?.textContent || item.getElementsByTagName('event')[0]?.textContent;

        parsedAlerts.push({
          id: `rss-${index}-${Date.now()}`,
          title,
          description: description.replace(/<[^>]*>?/gm, '').substring(0, 300) + (description.length > 300 ? '...' : ''),
          link,
          date,
          severity,
          urgency,
          certainty,
          event
        });
      });

      // Parse Atom entries
      const entries = xmlDoc.querySelectorAll('entry');
      entries.forEach((entry, index) => {
        const title = entry.querySelector('title')?.textContent || 'No Title';
        const summary = entry.querySelector('summary')?.textContent || entry.querySelector('content')?.textContent || '';
        const linkNode = entry.querySelector('link');
        const link = linkNode ? linkNode.getAttribute('href') || '' : '';
        const date = entry.querySelector('updated')?.textContent || entry.querySelector('published')?.textContent || '';

        const severity = entry.getElementsByTagName('cap:severity')[0]?.textContent || entry.getElementsByTagName('severity')[0]?.textContent;
        const urgency = entry.getElementsByTagName('cap:urgency')[0]?.textContent || entry.getElementsByTagName('urgency')[0]?.textContent;
        const certainty = entry.getElementsByTagName('cap:certainty')[0]?.textContent || entry.getElementsByTagName('certainty')[0]?.textContent;
        const event = entry.getElementsByTagName('cap:event')[0]?.textContent || entry.getElementsByTagName('event')[0]?.textContent;

        parsedAlerts.push({
          id: `atom-${index}-${Date.now()}`,
          title,
          description: summary.replace(/<[^>]*>?/gm, '').substring(0, 300) + (summary.length > 300 ? '...' : ''),
          link,
          date,
          severity,
          urgency,
          certainty,
          event
        });
      });

      setAlerts(parsedAlerts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(selectedFeed);
  }, [selectedFeed]);

  const handleCustomFeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFeed) {
      setSelectedFeed(customFeed);
    }
  };

  const getSeverityColor = (severity?: string) => {
    if (!severity) return 'bg-gray-100 text-gray-800 dark:bg-[#313244] dark:text-[#cdd6f4]';
    const s = severity.toLowerCase();
    if (s === 'extreme') return 'bg-red-100 text-red-800 dark:bg-[#f38ba8]/20 dark:text-[#f38ba8] border border-red-200 dark:border-[#f38ba8]/50';
    if (s === 'severe') return 'bg-orange-100 text-orange-800 dark:bg-[#fab387]/20 dark:text-[#fab387] border border-orange-200 dark:border-[#fab387]/50';
    if (s === 'moderate') return 'bg-yellow-100 text-yellow-800 dark:bg-[#f9e2af]/20 dark:text-[#f9e2af] border border-yellow-200 dark:border-[#f9e2af]/50';
    if (s === 'minor') return 'bg-blue-100 text-blue-800 dark:bg-[#89b4fa]/20 dark:text-[#89b4fa] border border-blue-200 dark:border-[#89b4fa]/50';
    return 'bg-gray-100 text-gray-800 dark:bg-[#313244] dark:text-[#cdd6f4]';
  };

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-gray-50 dark:bg-[#0d0d1a]">
      {/* Sidebar */}
      <div className="w-full md:w-[350px] max-h-[50vh] md:max-h-none bg-white dark:bg-[#1e1e2e] p-6 border-r border-gray-200 dark:border-[#313244] overflow-y-auto flex flex-col gap-6 z-10 shrink-0">
        <div>
          <h2 className="text-blue-600 dark:text-[#89b4fa] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <Radio size={16} /> CAP Feeds Monitor
          </h2>
          <p className="text-[11px] text-gray-600 dark:text-[#a6adc8] mb-6">
            Monitor Common Alerting Protocol (CAP) feeds, RSS, and Atom streams for global emergency alerts, weather warnings, and disaster notifications.
          </p>

          <div className="flex flex-col gap-3 mb-6">
            <label className="text-[10px] text-gray-600 dark:text-[#a6adc8] uppercase font-bold flex items-center gap-1">
              <Globe size={12} /> Predefined Feeds
            </label>
            <div className="flex flex-col gap-2">
              {PREDEFINED_FEEDS.map((feed) => (
                <button
                  key={feed.url}
                  onClick={() => {
                    setCustomFeed('');
                    setSelectedFeed(feed.url);
                  }}
                  className={`text-left px-3 py-2 rounded text-xs font-medium transition-colors ${
                    selectedFeed === feed.url 
                      ? 'bg-blue-100 dark:bg-[#89b4fa]/20 text-blue-700 dark:text-[#89b4fa] border border-blue-200 dark:border-[#89b4fa]/50' 
                      : 'bg-gray-100 dark:bg-[#313244] text-gray-700 dark:text-[#cdd6f4] hover:bg-gray-200 dark:hover:bg-[#45475a]'
                  }`}
                >
                  {feed.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCustomFeedSubmit} className="flex flex-col gap-2 mb-4">
            <label className="text-[10px] text-gray-600 dark:text-[#a6adc8] uppercase font-bold flex items-center gap-1">
              <AlertTriangle size={12} /> Custom CAP/RSS URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customFeed}
                onChange={(e) => setCustomFeed(e.target.value)}
                placeholder="https://..."
                className="flex-1 bg-gray-100 dark:bg-[#313244] border border-gray-300 dark:border-[#45475a] text-gray-900 dark:text-[#cdd6f4] rounded px-3 py-2 text-xs outline-none focus:border-blue-600 dark:focus:border-[#89b4fa]"
              />
              <button 
                type="submit"
                className="bg-blue-600 dark:bg-[#89b4fa] hover:bg-blue-700 dark:hover:bg-[#74c7ec] text-white dark:text-[#1e1e2e] px-3 py-2 rounded flex items-center justify-center transition-colors"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </form>
        </div>

        <div className="mt-auto bg-gray-100 dark:bg-[#313244]/50 border border-gray-200 dark:border-[#313244] p-4 rounded-lg flex flex-col items-center justify-center gap-2 text-center">
          <Info size={24} className="text-blue-600 dark:text-[#89b4fa]" />
          <span className="text-gray-900 dark:text-[#cdd6f4] text-sm font-bold">{alerts.length}</span>
          <span className="text-gray-600 dark:text-[#a6adc8] text-xs">Active Alerts Found</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 dark:bg-[#11111b] p-6 overflow-y-auto">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-blue-600 dark:text-[#89b4fa] gap-4">
            <RefreshCw size={32} className="animate-spin" />
            <span className="text-sm font-medium">Fetching alerts...</span>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-600 dark:text-[#f38ba8] text-sm bg-red-50 dark:bg-[#f38ba8]/10 p-6 rounded-xl border border-red-200 dark:border-[#f38ba8]/30 m-4">
            <AlertTriangle size={20} className="mr-2" />
            {error}
          </div>
        ) : alerts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-600 dark:text-[#a6adc8] text-sm">
            No alerts found in this feed.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {alerts.map((alert, idx) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                className="bg-white dark:bg-[#1e1e2e] border border-gray-200 dark:border-[#313244] rounded-xl p-5 hover:border-gray-300 dark:hover:border-[#45475a] transition-all flex flex-col h-full shadow-sm"
              >
                <div className="flex flex-wrap gap-2 mb-3">
                  {alert.severity && (
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                      Severity: {alert.severity}
                    </span>
                  )}
                  {alert.urgency && (
                    <span className="bg-gray-100 dark:bg-[#313244] text-gray-700 dark:text-[#cdd6f4] text-[10px] font-bold uppercase px-2 py-1 rounded-full border border-gray-200 dark:border-[#45475a]">
                      Urgency: {alert.urgency}
                    </span>
                  )}
                  {alert.certainty && (
                    <span className="bg-gray-100 dark:bg-[#313244] text-gray-700 dark:text-[#cdd6f4] text-[10px] font-bold uppercase px-2 py-1 rounded-full border border-gray-200 dark:border-[#45475a]">
                      Certainty: {alert.certainty}
                    </span>
                  )}
                  {alert.event && (
                    <span className="bg-purple-100 dark:bg-[#cba6f7]/20 text-purple-800 dark:text-[#cba6f7] text-[10px] font-bold uppercase px-2 py-1 rounded-full border border-purple-200 dark:border-[#cba6f7]/50">
                      {alert.event}
                    </span>
                  )}
                </div>
                
                <h3 className="text-gray-900 dark:text-[#cdd6f4] text-base font-bold mb-2 leading-tight">
                  {alert.title}
                </h3>
                
                <div className="text-xs text-gray-500 dark:text-[#7f849c] mb-3">
                  {new Date(alert.date).toLocaleString()}
                </div>
                
                <p className="text-gray-600 dark:text-[#a6adc8] text-sm mb-4 flex-1">
                  {alert.description}
                </p>
                
                {alert.link && (
                  <a 
                    href={alert.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-auto bg-gray-50 dark:bg-[#11111b] hover:bg-gray-100 dark:hover:bg-[#313244] text-blue-600 dark:text-[#89b4fa] border border-gray-200 dark:border-[#313244] text-xs font-bold py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                  >
                    <ExternalLink size={14} /> View Full Alert
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
