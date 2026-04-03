import { useState, useRef, ChangeEvent } from 'react';
import { Clock, Upload, Info } from 'lucide-react';
import { analyzeChronolocation } from '../lib/gemini';
import { ChronoResult } from '../types';
import { motion } from 'motion/react';

export default function Chronolocation() {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [result, setResult] = useState<ChronoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Waiting for image...');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setStatus('Ready.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setStatus('Analyzing time & shadows...');
    setResult(null);

    try {
      const base64Data = image.split(',')[1];
      const data = await analyzeChronolocation(base64Data, mimeType);
      
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
          <h2 className="text-blue-600 dark:text-[#89b4fa] text-xs font-bold uppercase tracking-widest mb-4">Chronolocation</h2>
          <p className="text-[11px] text-gray-600 dark:text-[#a6adc8] mb-4">
            Time & Shadow Verification. Based on DW Innovation techniques (SunCalc logic), predicting time of day and season from shadows, sun angle, and vegetation.
          </p>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-100 dark:bg-[#11111b] border-2 border-dashed border-gray-300 dark:border-[#45475a] rounded-lg p-6 text-center flex flex-col items-center gap-3 cursor-pointer hover:border-blue-600 dark:border-[#89b4fa] transition-colors"
          >
            {image ? (
              <img src={image} alt="Preview" className="max-h-40 rounded-md border border-gray-200 dark:border-[#313244]" />
            ) : (
              <>
                <Upload size={24} className="text-gray-600 dark:text-[#a6adc8]" />
                <span className="text-xs text-gray-600 dark:text-[#a6adc8]">Click to upload image</span>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={handleAnalyze}
            disabled={loading || !image}
            className="bg-blue-600 dark:bg-[#89b4fa] hover:bg-blue-700 dark:hover:bg-[#74c7ec] text-white dark:text-[#1e1e2e] font-bold py-3 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Clock size={18} />
            {loading ? 'Analyzing...' : 'Analyze Time & Shadow'}
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
            <h3 className="text-gray-900 dark:text-[#cdd6f4] text-xl font-bold">Chronolocation Intelligence Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1e1e2e] border border-gray-200 dark:border-[#313244] rounded-xl p-5"
              >
                <span className="text-yellow-600 dark:text-[#f9e2af] text-[10px] font-bold uppercase block mb-2">Estimated Time</span>
                <p className="text-gray-900 dark:text-[#cdd6f4] text-sm font-medium">{result.time_of_day}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#1e1e2e] border border-gray-200 dark:border-[#313244] rounded-xl p-5"
              >
                <span className="text-yellow-600 dark:text-[#f9e2af] text-[10px] font-bold uppercase block mb-2">Season & Nature</span>
                <p className="text-gray-900 dark:text-[#cdd6f4] text-sm font-medium">{result.season}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-[#1e1e2e] border border-gray-200 dark:border-[#313244] rounded-xl p-5"
              >
                <span className="text-yellow-600 dark:text-[#f9e2af] text-[10px] font-bold uppercase block mb-2">Weather Conditions</span>
                <p className="text-gray-900 dark:text-[#cdd6f4] text-sm font-medium">{result.weather}</p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#1e1e2e] border border-gray-200 dark:border-[#313244] rounded-xl p-6"
            >
              <span className="text-yellow-600 dark:text-[#f9e2af] text-[10px] font-bold uppercase block mb-3">Shadow & Sun Angle Analysis</span>
              <p className="text-gray-900 dark:text-[#cdd6f4] text-sm leading-relaxed mb-4">
                {result.shadow_analysis}
              </p>
              <div className="pt-4 border-t border-gray-200 dark:border-[#313244] text-green-600 dark:text-[#a6e3a1] text-xs font-semibold">
                🔍 Analysis based on DW Innovation Geolocation Verification Methodology
              </div>
            </motion.div>
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
