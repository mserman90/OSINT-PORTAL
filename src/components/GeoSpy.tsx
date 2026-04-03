import { useState, useRef, ChangeEvent } from 'react';
import { MapPin, Upload, ExternalLink, Info } from 'lucide-react';
import Map from './Map';
import { analyzeGeolocation } from '../lib/gemini';
import { GeoSpyResult } from '../types';

export default function GeoSpy() {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [result, setResult] = useState<GeoSpyResult | null>(null);
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
    setStatus('Gemini AI is analyzing...');
    setResult(null);

    try {
      const base64Data = image.split(',')[1];
      const data = await analyzeGeolocation(base64Data, mimeType);
      
      if (!data.lat || !data.lon || data.confidence < 0.1) {
        throw new Error('No reliable location found.');
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

  const markers = result ? [{
    id: 'result',
    position: [result.lat, result.lon] as [number, number],
    popup: (
      <div className="p-1">
        <h3 className="font-bold text-sm">Prediction</h3>
        <p className="text-xs text-gray-600">{result.description}</p>
      </div>
    ),
  }] : [];

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      <div className="w-full md:w-[350px] max-h-[50vh] md:max-h-none bg-white dark:bg-[#1e1e2e] p-6 border-r border-gray-200 dark:border-[#313244] overflow-y-auto flex flex-col gap-6 shrink-0">
        <div>
          <h2 className="text-blue-600 dark:text-[#89b4fa] text-xs font-bold uppercase tracking-widest mb-4">GeoSpy AI</h2>
          <p className="text-[11px] text-gray-600 dark:text-[#a6adc8] mb-4">
            Precise (Lat/Lon) coordinate prediction. Keyless and free. Based on original data, no hallucinations.
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

        {result && (
          <div className="bg-gray-200 dark:bg-[#313244] p-4 rounded-lg flex flex-col gap-3">
            <h3 className="text-green-600 dark:text-[#a6e3a1] text-xs font-bold uppercase">AI Prediction Results</h3>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-600 dark:text-[#a6adc8] uppercase font-bold">Coordinates</span>
              <span className="text-sm text-gray-900 dark:text-[#cdd6f4]">{result.lat.toFixed(6)}, {result.lon.toFixed(6)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-600 dark:text-[#a6adc8] uppercase font-bold">Region</span>
              <span className="text-sm text-gray-900 dark:text-[#cdd6f4]">{result.description}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-600 dark:text-[#a6adc8] uppercase font-bold">Confidence Score</span>
              <span className="text-sm text-gray-900 dark:text-[#cdd6f4] font-bold">%{Math.round(result.confidence * 100)}</span>
            </div>
            <a 
              href={`https://www.openstreetmap.org/?mlat=${result.lat}&mlon=${result.lon}#map=13/${result.lat}/${result.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-[#89b4fa] text-xs font-bold flex items-center gap-1 hover:underline mt-2"
            >
              <ExternalLink size={14} />
              View on OpenStreetMap
            </a>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={handleAnalyze}
            disabled={loading || !image}
            className="bg-blue-600 dark:bg-[#89b4fa] hover:bg-blue-700 dark:hover:bg-[#74c7ec] text-white dark:text-[#1e1e2e] font-bold py-3 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <MapPin size={18} />
            {loading ? 'Analyzing...' : 'Find Coordinates'}
          </button>
          <div className="flex items-start gap-2 text-[11px] text-gray-600 dark:text-[#a6adc8]">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>{status}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <Map
          center={result ? [result.lat, result.lon] : [20, 0]}
          zoom={result ? Math.round(result.confidence * 10) + 4 : 2}
          markers={markers}
        />
      </div>
    </div>
  );
}
