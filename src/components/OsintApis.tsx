import { useState, useEffect } from 'react';
import { Search, ExternalLink, Filter, Server } from 'lucide-react';
import { motion } from 'motion/react';

interface ApiEntry {
  category: string;
  name: string;
  link: string;
  description: string;
  price: string;
}

export default function OsintApis() {
  const [apis, setApis] = useState<ApiEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const fetchApis = async () => {
      try {
        const targetUrl = 'https://raw.githubusercontent.com/cipher387/API-s-for-OSINT/main/README.md';
        const proxies = [
          `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
          `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
          `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
          targetUrl
        ];

        let markdownText = '';

        for (const url of proxies) {
          try {
            const response = await fetch(url);
            if (response.ok) {
              const text = await response.text();
              if (text && text.includes('## IOT/IP Search engines')) {
                markdownText = text;
                break;
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch from ${url}`, err);
          }
        }

        if (!markdownText) {
          throw new Error('Failed to fetch APIs (CORS or network error).');
        }

        const parsedApis: ApiEntry[] = [];
        const lines = markdownText.split('\n');
        let currentCategory = '';

        for (const line of lines) {
          if (line.startsWith('## ')) {
            const cat = line.replace('## ', '').trim();
            // Skip non-API categories like Table of contents, Contributing, etc.
            if (!['Table of contents', 'Contributing', 'Contact', 'License'].includes(cat)) {
              currentCategory = cat;
            } else {
              currentCategory = '';
            }
          } else if (currentCategory && line.trim().startsWith('|') && !line.includes('---')) {
            const parts = line.split('|').slice(1, -1).map(p => p.trim());
            if (parts.length >= 4 && parts[0] !== 'Name') {
              // Handle markdown links in the 'Name' or 'Link' column
              let name = parts[0];
              let link = parts[1];
              
              // Extract URL if it's in markdown format [text](url)
              const linkMatch = link.match(/\[.*?\]\((.*?)\)/);
              if (linkMatch) {
                link = linkMatch[1];
              } else if (link.includes('<a href=')) {
                const hrefMatch = link.match(/href="(.*?)"/);
                if (hrefMatch) link = hrefMatch[1];
              }

              // Clean up name if it contains markdown links
              const nameMatch = name.match(/\[(.*?)\]\(.*?\)/);
              if (nameMatch) {
                name = nameMatch[1];
              }

              parsedApis.push({
                category: currentCategory,
                name: name,
                link: link,
                description: parts[2],
                price: parts[3] || 'Unknown'
              });
            }
          }
        }

        setApis(parsedApis);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchApis();
  }, []);

  const categories = ['All', ...Array.from(new Set(apis.map(a => a.category).filter(Boolean)))].sort();

  const filteredApis = apis.filter(api => {
    const matchesSearch = 
      (api.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (api.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || api.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-gray-50 dark:bg-[#0d0d1a]">
      {/* Sidebar Controls */}
      <div className="w-full md:w-[350px] max-h-[50vh] md:max-h-none bg-white dark:bg-[#1e1e2e] p-6 border-r border-gray-200 dark:border-[#313244] overflow-y-auto flex flex-col gap-6 z-10 shrink-0">
        <div>
          <h2 className="text-blue-600 dark:text-[#89b4fa] text-xs font-bold uppercase tracking-widest mb-4">OSINT APIs</h2>
          <p className="text-[11px] text-gray-600 dark:text-[#a6adc8] mb-4">
            A collection of APIs useful for automating various tasks in OSINT. Curated by cipher387.
          </p>

          <div className="flex flex-col gap-1 mb-4">
            <label className="text-[10px] text-gray-600 dark:text-[#a6adc8] uppercase font-bold flex items-center gap-1">
              <Search size={12} /> Search APIs
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or description..."
              className="bg-gray-200 dark:bg-[#313244] border border-gray-300 dark:border-[#45475a] text-gray-900 dark:text-[#cdd6f4] rounded px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-[#89b4fa]"
            />
          </div>

          <div className="flex flex-col gap-1 mb-4">
            <label className="text-[10px] text-gray-600 dark:text-[#a6adc8] uppercase font-bold flex items-center gap-1">
              <Filter size={12} /> Category Filter
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-200 dark:bg-[#313244] border border-gray-300 dark:border-[#45475a] text-gray-900 dark:text-[#cdd6f4] rounded px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-[#89b4fa] appearance-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-auto bg-gray-200 dark:bg-gray-100 dark:bg-[#313244]/50 border border-gray-200 dark:border-[#313244] p-4 rounded-lg flex flex-col items-center justify-center gap-2 text-center">
          <Server size={24} className="text-purple-600 dark:text-[#cba6f7]" />
          <span className="text-gray-900 dark:text-[#cdd6f4] text-sm font-bold">{apis.length}</span>
          <span className="text-gray-600 dark:text-[#a6adc8] text-xs">Total APIs Loaded</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 dark:bg-[#11111b] p-6 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center text-blue-600 dark:text-[#89b4fa] text-sm font-medium animate-pulse">
            Loading OSINT APIs...
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-600 dark:text-[#f38ba8] text-sm">
            Error loading APIs: {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApis.map((api, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                className="bg-white dark:bg-[#1e1e2e] border border-gray-200 dark:border-[#313244] rounded-xl p-5 hover:border-gray-300 dark:border-[#45475a] transition-all flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-3 gap-2">
                  <span className="inline-block bg-gray-200 dark:bg-[#313244] text-purple-600 dark:text-[#cba6f7] text-[10px] font-bold uppercase px-2 py-1 rounded-full shrink-0">
                    {api.category}
                  </span>
                  {api.price && api.price !== 'Unknown' && (
                    <span className="inline-block bg-gray-100 dark:bg-[#11111b] text-green-600 dark:text-[#a6e3a1] text-[10px] font-bold uppercase px-2 py-1 rounded-full border border-gray-200 dark:border-[#313244] text-right">
                      {api.price}
                    </span>
                  )}
                </div>
                
                <h3 className="text-gray-900 dark:text-[#cdd6f4] text-base font-bold mb-2">{api.name}</h3>
                
                <p 
                  className="text-gray-600 dark:text-[#a6adc8] text-xs mb-4 flex-1 line-clamp-4" 
                  title={api.description}
                  dangerouslySetInnerHTML={{ __html: api.description.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-blue-600 dark:text-[#89b4fa] hover:underline">$1</a>') }}
                />
                
                <a 
                  href={api.link.startsWith('http') ? api.link : `https://${api.link}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-auto bg-purple-100 dark:bg-[#cba6f7]/10 hover:bg-purple-200 dark:hover:bg-[#cba6f7]/20 text-purple-600 dark:text-[#cba6f7] border border-purple-300 dark:border-[#cba6f7]/30 text-xs font-bold py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink size={14} /> Visit API
                </a>
              </motion.div>
            ))}
            
            {filteredApis.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-600 dark:text-[#a6adc8] text-sm">
                No APIs found matching your search criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
