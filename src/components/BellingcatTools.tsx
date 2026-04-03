import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Search, ExternalLink, Filter, Database } from 'lucide-react';
import { motion } from 'motion/react';

interface Tool {
  Category: string;
  Name: string;
  URL: string;
  Description: string;
  Cost: string;
  Details: string;
}

export default function BellingcatTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const targetUrl = 'https://github.com/bellingcat/toolkit/releases/download/csv/all-tools.csv';
        const proxies = [
          `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
          `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
          `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
          targetUrl
        ];

        let csvText = '';

        for (const url of proxies) {
          try {
            const response = await fetch(url);
            if (response.ok) {
              const text = await response.text();
              // Basic validation to ensure it's a CSV and not an HTML error page
              if (text && text.includes('Category,Name,URL')) {
                csvText = text;
                break;
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch from ${url}`, err);
          }
        }

        if (!csvText) {
          throw new Error('Failed to fetch tools (CORS or network error).');
        }
        
        Papa.parse<Tool>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setTools(results.data);
            setLoading(false);
          },
          error: (err: any) => {
            setError(err.message);
            setLoading(false);
          }
        });
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  const categories = ['All', ...Array.from(new Set(tools.map(t => t.Category).filter(Boolean)))].sort();

  const filteredTools = tools.filter(tool => {
    const matchesSearch = 
      (tool.Name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (tool.Description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || tool.Category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-gray-50 dark:bg-[#0d0d1a]">
      {/* Sidebar Controls */}
      <div className="w-full md:w-[350px] max-h-[50vh] md:max-h-none bg-white dark:bg-[#1e1e2e] p-6 border-r border-gray-200 dark:border-[#313244] overflow-y-auto flex flex-col gap-6 z-10 shrink-0">
        <div>
          <h2 className="text-blue-600 dark:text-[#89b4fa] text-xs font-bold uppercase tracking-widest mb-4">Bellingcat Toolkit</h2>
          <p className="text-[11px] text-gray-600 dark:text-[#a6adc8] mb-4">
            A comprehensive list of OSINT tools curated by Bellingcat. Updated nightly from their GitHub repository.
          </p>

          <div className="flex flex-col gap-1 mb-4">
            <label className="text-[10px] text-gray-600 dark:text-[#a6adc8] uppercase font-bold flex items-center gap-1">
              <Search size={12} /> Search Tools
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
          <Database size={24} className="text-green-600 dark:text-[#a6e3a1]" />
          <span className="text-gray-900 dark:text-[#cdd6f4] text-sm font-bold">{tools.length}</span>
          <span className="text-gray-600 dark:text-[#a6adc8] text-xs">Total Tools Loaded</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 dark:bg-[#11111b] p-6 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center text-blue-600 dark:text-[#89b4fa] text-sm font-medium animate-pulse">
            Loading Bellingcat Toolkit...
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-600 dark:text-[#f38ba8] text-sm">
            Error loading tools: {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                className="bg-white dark:bg-[#1e1e2e] border border-gray-200 dark:border-[#313244] rounded-xl p-5 hover:border-gray-300 dark:border-[#45475a] transition-all flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="inline-block bg-gray-200 dark:bg-[#313244] text-yellow-600 dark:text-[#f9e2af] text-[10px] font-bold uppercase px-2 py-1 rounded-full">
                    {tool.Category}
                  </span>
                  {tool.Cost && (
                    <span className="inline-block bg-gray-100 dark:bg-[#11111b] text-green-600 dark:text-[#a6e3a1] text-[10px] font-bold uppercase px-2 py-1 rounded-full border border-gray-200 dark:border-[#313244]">
                      {tool.Cost}
                    </span>
                  )}
                </div>
                
                <h3 className="text-gray-900 dark:text-[#cdd6f4] text-base font-bold mb-2">{tool.Name}</h3>
                
                <p className="text-gray-600 dark:text-[#a6adc8] text-xs mb-4 flex-1 line-clamp-3" title={tool.Description}>
                  {tool.Description}
                </p>
                
                <a 
                  href={tool.URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-auto bg-blue-600 dark:bg-blue-50 dark:bg-[#89b4fa]/10 hover:bg-blue-600 dark:bg-[#89b4fa]/20 text-blue-600 dark:text-[#89b4fa] border border-blue-600 dark:border-blue-200 dark:border-[#89b4fa]/30 text-xs font-bold py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink size={14} /> Visit Tool
                </a>
              </motion.div>
            ))}
            
            {filteredTools.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-600 dark:text-[#a6adc8] text-sm">
                No tools found matching your search criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
