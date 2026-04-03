import { useState, useEffect } from 'react';
import { Search, ExternalLink, Filter, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

interface OperatorEntry {
  category: string;
  name: string;
  link: string;
}

export default function AdvancedSearchOperators() {
  const [operators, setOperators] = useState<OperatorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const targetUrl = 'https://raw.githubusercontent.com/cipher387/Advanced-search-operators-list/main/README.md';
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
              if (text && text.includes('Mailboxes and Messengers')) {
                markdownText = text;
                break;
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch from ${url}`, err);
          }
        }

        if (!markdownText) {
          throw new Error('Failed to fetch Search Operators (CORS or network error).');
        }

        const parsedOperators: OperatorEntry[] = [];
        const lines = markdownText.split('\n');
        let currentCategory = '';

        for (const line of lines) {
          const headingMatch = line.match(/<h[1-6]>(.*?)<\/h[1-6]>/);
          if (headingMatch) {
            const cat = headingMatch[1].trim();
            if (!['Advanced search operators list', 'Table of contents'].includes(cat)) {
              currentCategory = cat;
            } else {
              currentCategory = '';
            }
          } else if (currentCategory && line.trim().startsWith('|') && !line.includes('---')) {
            const parts = line.split('|').slice(1, -1).map(p => p.trim());
            if (parts.length >= 2 && parts[0] !== 'Website/application' && parts[0] !== 'OS') {
              let name = parts[0];
              let link = parts[1];
              
              // Clean up name if it contains markdown links
              const nameMatch = name.match(/\[(.*?)\]\(.*?\)/);
              if (nameMatch) {
                name = nameMatch[1];
              }

              parsedOperators.push({
                category: currentCategory,
                name: name,
                link: link
              });
            }
          }
        }

        setOperators(parsedOperators);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOperators();
  }, []);

  const categories = ['All', ...Array.from(new Set(operators.map(o => o.category).filter(Boolean)))].sort();

  const filteredOperators = operators.filter(operator => {
    const matchesSearch = 
      (operator.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (operator.link?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || operator.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-gray-50 dark:bg-[#0d0d1a]">
      {/* Sidebar Controls */}
      <div className="w-full md:w-[350px] max-h-[50vh] md:max-h-none bg-white dark:bg-[#1e1e2e] p-6 border-r border-gray-200 dark:border-[#313244] overflow-y-auto flex flex-col gap-6 z-10 shrink-0">
        <div>
          <h2 className="text-blue-600 dark:text-[#89b4fa] text-xs font-bold uppercase tracking-widest mb-4">Search Operators</h2>
          <p className="text-[11px] text-gray-600 dark:text-[#a6adc8] mb-4">
            A comprehensive list of advanced search operators for various platforms. Curated by cipher387.
          </p>

          <div className="flex flex-col gap-1 mb-4">
            <label className="text-[10px] text-gray-600 dark:text-[#a6adc8] uppercase font-bold flex items-center gap-1">
              <Search size={12} /> Search Platforms
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by platform name..."
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
          <Terminal size={24} className="text-red-600 dark:text-[#f38ba8]" />
          <span className="text-gray-900 dark:text-[#cdd6f4] text-sm font-bold">{operators.length}</span>
          <span className="text-gray-600 dark:text-[#a6adc8] text-xs">Total Platforms Loaded</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 dark:bg-[#11111b] p-6 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center text-blue-600 dark:text-[#89b4fa] text-sm font-medium animate-pulse">
            Loading Search Operators...
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-600 dark:text-[#f38ba8] text-sm">
            Error loading operators: {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOperators.map((operator, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                className="bg-white dark:bg-[#1e1e2e] border border-gray-200 dark:border-[#313244] rounded-xl p-5 hover:border-gray-300 dark:border-[#45475a] transition-all flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-3 gap-2">
                  <span className="inline-block bg-gray-200 dark:bg-[#313244] text-red-600 dark:text-[#f38ba8] text-[10px] font-bold uppercase px-2 py-1 rounded-full shrink-0">
                    {operator.category}
                  </span>
                </div>
                
                <h3 className="text-gray-900 dark:text-[#cdd6f4] text-base font-bold mb-4" dangerouslySetInnerHTML={{ __html: operator.name }} />
                
                <div className="mt-auto flex flex-col gap-2">
                  {operator.link.split('</br>').map((l, i) => {
                    const cleanLink = l.replace(/<[^>]*>?/gm, '').trim();
                    const urlMatch = cleanLink.match(/(https?:\/\/[^\s]+)/);
                    const url = urlMatch ? urlMatch[1] : '';
                    const text = cleanLink.replace(url, '').trim();
                    
                    if (!url) return null;
                    
                    return (
                      <div key={i} className="flex flex-col gap-1">
                        {text && <span className="text-gray-600 dark:text-[#a6adc8] text-xs">{text}</span>}
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-[#f38ba8]/10 hover:bg-red-100 dark:bg-[#f38ba8]/20 text-red-600 dark:text-[#f38ba8] border border-[#f38ba8]/30 text-xs font-bold py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                        >
                          <ExternalLink size={14} /> View Operators
                        </a>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
            
            {filteredOperators.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-600 dark:text-[#a6adc8] text-sm">
                No operators found matching your search criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
