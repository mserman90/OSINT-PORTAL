import { useEffect } from 'react';
import { Binoculars } from 'lucide-react';

export default function OSINTSearch() {
  useEffect(() => {
    // Load the Google CSE script
    const scriptId = 'google-cse-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cse.google.com/cse.js?cx=006368593537057042503:efxu7xprihg';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="h-full w-full bg-gray-50 dark:bg-[#0d0d1a] p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 dark:bg-[#89b4fa]/10 rounded-lg text-blue-600 dark:text-[#89b4fa]">
            <Binoculars size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-[#cdd6f4]">Custom OSINT Search</h2>
        </div>
        <p className="text-gray-600 dark:text-[#a6adc8] mb-8 ml-12">
          A specialized Google Custom Search Engine (CSE) configured to search across hundreds of curated OSINT resources, databases, tools, and investigative journalism sites.
        </p>
        
        <div className="bg-white dark:bg-[#1e1e2e] p-6 rounded-xl border border-gray-200 dark:border-[#313244] shadow-sm min-h-[500px]">
          {/* Google Custom Search Element */}
          <div className="gcse-search"></div>
        </div>
      </div>
    </div>
  );
}
