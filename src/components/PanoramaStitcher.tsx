import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import { Upload, Download, Trash2, Layers, MoveUp, MoveDown, Image as ImageIcon } from 'lucide-react';

interface MediaItem {
  id: string;
  src: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
}

const URLImage = ({ 
  item, 
  isSelected, 
  onSelect, 
  onChange 
}: { 
  item: MediaItem; 
  isSelected: boolean; 
  onSelect: () => void; 
  onChange: (newAttrs: MediaItem) => void;
}) => {
  const [img] = useImage(item.src);
  const imageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && imageRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        image={img}
        x={item.x}
        y={item.y}
        opacity={item.opacity}
        rotation={item.rotation}
        scaleX={item.scaleX}
        scaleY={item.scaleY}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        ref={imageRef}
        onDragEnd={(e) => {
          onChange({
            ...item,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = imageRef.current;
          if (!node) return;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          onChange({
            ...item,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: scaleX,
            scaleY: scaleY,
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default function PanoramaStitcher() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        const newItem: MediaItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          src,
          x: stageSize.width / 2 - 100,
          y: stageSize.height / 2 - 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
        };
        setItems((prev) => [...prev, newItem]);
        setSelectedId(newItem.id);
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExport = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = 'panorama-stitch.png';
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const updateItem = (id: string, newAttrs: Partial<MediaItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...newAttrs } : item)));
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = items.findIndex(i => i.id === id);
    if (index < 0) return;
    if (direction === 'up' && index === items.length - 1) return;
    if (direction === 'down' && index === 0) return;

    const newItems = [...items];
    const targetIndex = direction === 'up' ? index + 1 : index - 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter(i => i.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selectedItem = items.find(i => i.id === selectedId);

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-gray-50 dark:bg-[#0d0d1a]">
      {/* Sidebar Controls */}
      <div className="w-full md:w-[350px] max-h-[50vh] md:max-h-none bg-white dark:bg-[#1e1e2e] p-6 border-r border-gray-200 dark:border-[#313244] overflow-y-auto flex flex-col gap-6 z-10 shrink-0">
        <div>
          <h2 className="text-blue-600 dark:text-[#89b4fa] text-xs font-bold uppercase tracking-widest mb-4">Panorama Stitcher</h2>
          <p className="text-[11px] text-gray-600 dark:text-[#a6adc8] mb-4">
            Upload multiple images or video frames. Drag, resize, and rotate to manually stitch panoramas or compositions.
          </p>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-100 dark:bg-[#11111b] border-2 border-dashed border-gray-300 dark:border-[#45475a] rounded-lg p-6 text-center flex flex-col items-center gap-3 cursor-pointer hover:border-blue-600 dark:border-[#89b4fa] transition-colors"
          >
            <Upload size={24} className="text-gray-600 dark:text-[#a6adc8]" />
            <span className="text-xs text-gray-600 dark:text-[#a6adc8]">Upload Media (Images)</span>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Media Inspector */}
        {selectedItem ? (
          <div className="bg-gray-200 dark:bg-[#313244] p-4 rounded-lg flex flex-col gap-4">
            <h3 className="text-green-600 dark:text-[#a6e3a1] text-xs font-bold uppercase flex items-center gap-2">
              <Layers size={14} /> Media Inspector
            </h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-600 dark:text-[#a6adc8] uppercase font-bold flex justify-between">
                <span>Opacity</span>
                <span>{Math.round(selectedItem.opacity * 100)}%</span>
              </label>
              <input 
                type="range" 
                min="0" max="1" step="0.05" 
                value={selectedItem.opacity}
                onChange={(e) => updateItem(selectedItem.id, { opacity: parseFloat(e.target.value) })}
                className="w-full accent-[#89b4fa]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-600 dark:text-[#a6adc8] uppercase font-bold flex justify-between">
                <span>Rotation</span>
                <span>{Math.round(selectedItem.rotation)}°</span>
              </label>
              <input 
                type="range" 
                min="-180" max="180" step="1" 
                value={selectedItem.rotation}
                onChange={(e) => updateItem(selectedItem.id, { rotation: parseFloat(e.target.value) })}
                className="w-full accent-[#89b4fa]"
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => moveLayer(selectedItem.id, 'up')}
                className="flex-1 bg-gray-300 dark:bg-[#45475a] hover:bg-gray-400 dark:hover:bg-[#585b70] text-gray-900 dark:text-[#cdd6f4] text-[10px] font-bold py-2 rounded flex items-center justify-center gap-1 transition-colors"
              >
                <MoveUp size={12} /> Bring Forward
              </button>
              <button 
                onClick={() => moveLayer(selectedItem.id, 'down')}
                className="flex-1 bg-gray-300 dark:bg-[#45475a] hover:bg-gray-400 dark:hover:bg-[#585b70] text-gray-900 dark:text-[#cdd6f4] text-[10px] font-bold py-2 rounded flex items-center justify-center gap-1 transition-colors"
              >
                <MoveDown size={12} /> Send Back
              </button>
            </div>

            <button 
              onClick={() => deleteItem(selectedItem.id)}
              className="w-full bg-red-100 dark:bg-[#f38ba8]/20 hover:bg-red-200 dark:hover:bg-[#f38ba8]/30 text-red-600 dark:text-[#f38ba8] border border-red-300 dark:border-[#f38ba8]/50 text-xs font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <Trash2 size={14} /> Remove Item
            </button>
          </div>
        ) : (
          <div className="bg-gray-200 dark:bg-gray-100 dark:bg-[#313244]/50 border border-gray-200 dark:border-[#313244] p-4 rounded-lg flex flex-col items-center justify-center gap-2 text-center h-40">
            <ImageIcon size={24} className="text-[#45475a]" />
            <span className="text-gray-600 dark:text-[#a6adc8] text-xs">Select an item on the canvas to inspect and edit properties.</span>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={handleExport}
            disabled={items.length === 0}
            className="bg-green-600 dark:bg-[#a6e3a1] hover:bg-green-700 dark:hover:bg-[#94e289] text-white dark:text-[#1e1e2e] font-bold py-3 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download size={18} />
            Export Panorama
          </button>
        </div>
      </div>

      {/* Interactive Canvas */}
      <div className="flex-1 relative bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZQAxiP8MDHjgM2waw2gYjIYBf8MGo2EwGgYj2TAAAgB+0g+x1G4W0wAAAABJRU5ErkJggg==')] bg-repeat" ref={containerRef}>
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
          ref={stageRef}
        >
          <Layer>
            {items.map((item) => (
              <URLImage
                key={item.id}
                item={item}
                isSelected={item.id === selectedId}
                onSelect={() => setSelectedId(item.id)}
                onChange={(newAttrs) => updateItem(item.id, newAttrs)}
              />
            ))}
          </Layer>
        </Stage>
        
        {items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white dark:bg-white/80 dark:bg-[#1e1e2e]/80 px-6 py-4 rounded-lg border border-gray-200 dark:border-[#313244] text-gray-600 dark:text-[#a6adc8] text-sm font-medium backdrop-blur-sm">
              Canvas is empty. Upload media to start stitching.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
