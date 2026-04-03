import { useState } from 'react';
import { Mail, Info } from 'lucide-react';
import { analyzeEmail } from '../lib/gemini';
import { GHuntResult } from '../types';
import { motion } from 'motion/react';

export default function GHunt() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<GHuntResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Enter a target email...');

  const handleAnalyze = async () => {
    if (!email || !email.includes('@')) {
      setStatus('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setStatus('GHunt Agent is analyzing domain...');
    setResult(null);

    try {
      const data = await analyzeEmail(email);
      setResult(data);
      setStatus('Analysis complete.');
    } catch (error) {
      setStatus('Analysis failed. No data found.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      <div className="w-full md:w-[350px] max-h-[50vh] md:max-h-none bg-white dark:bg-[#1e1e2e] p-6 border-r border-gray-200 dark:border-[#313244] overflow-y-auto flex flex-col gap-6 shrink-0">
        <div>
          <h2 className="text-blue-600 dark:text-[#89b4fa] text-xs font-bold uppercase tracking-widest mb-4">GHunt</h2>
          <p className="text-[11px] text-gray-600 dark:text-[#a6adc8] mb-4">
            Email OSINT analysis. Domain intelligence and email structure verification for investigative purposes.
          </p>

          <div className="flex flex-col gap-1 mb-4">
            <label className="text-[10px] text-gray-600 dark:text-[#a6adc8] uppercase font-bold">Target Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              className="bg-gray-200 dark:bg-[#313244] border border-gray-300 dark:border-[#45475a] text-gray-900 dark:text-[#cdd6f4] rounded px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-[#89b4fa]"
            />
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={handleAnalyze}
            disabled={loading || !email}
            className="bg-blue-600 dark:bg-[#89b4fa] hover:bg-blue-700 dark:hover:bg-[#74c7ec] text-white dark:text-[#1e1e2e] font-bold py-3 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Mail size={18} />
            {loading ? 'Analyzing...' : 'Run OSINT Analysis'}
          </button>
          <div className="flex items-start gap-2 text-[11px] text-gray-600 dark:text-[#a6adc8]">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>{status}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-100 dark:bg-[#11111b] p-8 overflow-y-auto">
        {result ? (
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
            <h3 className="text-gray-900 dark:text-[#cdd6f4] text-xl font-bold">GHunt OSINT Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-[#1e1e2e] border border-gray-200 dark:border-[#313244] rounded-xl p-5"
              >
                <span className="text-yellow-600 dark:text-[#f9e2af] text-[10px] font-bold uppercase block mb-2">Email Structure</span>
                <p className="text-gray-900 dark:text-[#cdd6f4] text-sm leading-relaxed">{result.validity}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#1e1e2e] border border-gray-200 dark:border-[#313244] rounded-xl p-5"
              >
                <span className="text-yellow-600 dark:text-[#f9e2af] text-[10px] font-bold uppercase block mb-2">Domain Intelligence</span>
                <p className="text-gray-900 dark:text-[#cdd6f4] text-sm leading-relaxed">{result.domain_intel}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-[#1e1e2e] border border-gray-200 dark:border-[#313244] rounded-xl p-5"
              >
                <span className="text-yellow-600 dark:text-[#f9e2af] text-[10px] font-bold uppercase block mb-2">Security Assessment</span>
                <p className="text-gray-900 dark:text-[#cdd6f4] text-sm leading-relaxed">{result.known_breaches}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-[#1e1e2e] border border-gray-200 dark:border-[#313244] rounded-xl p-5"
              >
                <span className="text-yellow-600 dark:text-[#f9e2af] text-[10px] font-bold uppercase block mb-2">OSINT Guidance</span>
                <p className="text-gray-900 dark:text-[#cdd6f4] text-sm leading-relaxed mb-3">{result.osint_advice}</p>
                <div className="pt-3 border-t border-gray-200 dark:border-[#313244] text-green-600 dark:text-[#a6e3a1] text-[10px] font-bold uppercase">
                  🔍 Possible Research Pivot
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-600 dark:text-[#a6adc8] text-sm">
            Analysis not started or no data available.
          </div>
        )}
      </div>
    </div>
  );
}
