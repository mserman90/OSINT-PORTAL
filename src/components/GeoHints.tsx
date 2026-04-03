import { useState, useRef, ChangeEvent } from 'react';
import { Lightbulb, Upload, Info } from 'lucide-react';
import { extractGeoHints } from '../lib/gemini';
import { GeoHintsResult } from '../types';
import { motion } from 'motion/react';

export default function GeoHints() {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [result, setResult] = useState<GeoHintsResult | null>(null);
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
    setStatus('Analyzing regional hints...');
    setResult(null);

    try {
      const base64Data = image.split(',')[1];
      const data = await extractGeoHints(base64Data, mimeType);
      
      if (!data.hints || data.hints.length === 0) {
        throw new Error('No hints found.');
      }
      
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
          <h2 className="text-blue-600 dark:text-[#89b4fa] text-xs font-bold uppercase tracking-widest mb-4">GeoHints</h2>
          <p className="text-[11px] text-gray-600 dark:text-[#a6adc8] mb-4">
            Bellingcat principles. Predicts country based on traffic lights, pedestrian crossings, license plate formats, and sign types.
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
            <Lightbulb size={18} />
            {loading ? 'Analyzing...' : 'Find Regional Hints'}
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
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1e1e2e] p-6 border-l-4 border-blue-600 dark:border-[#89b4fa] rounded-r-lg shadow-lg"
            >
              <p className="text-gray-900 dark:text-[#cdd6f4] text-lg leading-relaxed italic">
                "{result.summary}"
              </p>
            </motion.div>

            <div>
              <h3 className="text-gray-900 dark:text-[#cdd6f4] text-xl font-bold mb-6">Detected GeoHints</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.hints.map((hint, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white dark:bg-[#1e1e2e] border border-gray-200 dark:border-[#313244] rounded-xl p-5 hover:border-gray-300 dark:border-[#45475a] transition-all group"
                  >
                    <span className="inline-block bg-gray-200 dark:bg-[#313244] text-yellow-600 dark:text-[#f9e2af] text-[10px] font-bold uppercase px-2 py-1 rounded-full mb-3 group-hover:bg-gray-300 dark:bg-[#45475a] transition-colors">
                      {hint.category}
                    </span>
                    <p className="text-gray-900 dark:text-[#cdd6f4] text-sm mb-4 leading-relaxed">
                      {hint.detail}
                    </p>
                    <div className="pt-4 border-t border-gray-200 dark:border-[#313244] text-green-600 dark:text-[#a6e3a1] text-xs font-semibold flex items-center gap-2">
                      <span className="text-gray-600 dark:text-[#a6adc8]">📍 Possible Region:</span>
                      {hint.regions}
                    </div>
                  </motion.div>
                ))}
              </div>
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
