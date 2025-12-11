
import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import { WatermarkConfig, AspectRatio } from '../types';
import { ASPECT_RATIOS } from '../constants';
import { Button } from './Button';

interface WatermarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: WatermarkConfig) => void;
  initialConfig?: WatermarkConfig;
  defaultAspectRatio?: AspectRatio;
}

export const WatermarkModal: React.FC<WatermarkModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialConfig,
    defaultAspectRatio = AspectRatio.SQUARE 
}) => {
  const [name, setName] = useState('My Watermark');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [previewRatio, setPreviewRatio] = useState<string>(defaultAspectRatio || AspectRatio.SQUARE);

  const [config, setConfig] = useState<{
    x: number; y: number; scale: number; opacity: number; rotation: number;
  }>({
    x: 90, y: 90, scale: 15, opacity: 0.9, rotation: 0
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const resizeStartValues = useRef({ scale: 0, dist: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync aspect ratio when modal opens or prop changes
  useEffect(() => {
    if (isOpen && !initialConfig) {
       setPreviewRatio(defaultAspectRatio);
    }
  }, [isOpen, defaultAspectRatio, initialConfig]);

  // Load initial config
  useEffect(() => {
    if (initialConfig) {
      setName(initialConfig.name);
      setImageBase64(initialConfig.imageBase64);
      setConfig({
        x: initialConfig.x,
        y: initialConfig.y,
        scale: initialConfig.scale,
        opacity: initialConfig.opacity,
        rotation: initialConfig.rotation
      });
    } else {
        // Only reset if opening fresh (no initialConfig) and isOpen became true
        if (isOpen && !initialConfig) {
            setName('My Watermark');
            setImageBase64(null);
            setConfig({ x: 90, y: 90, scale: 15, opacity: 0.9, rotation: 0 });
        }
    }
  }, [initialConfig, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImageBase64(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!imageBase64) return;
    e.preventDefault(); 
    isDragging.current = true;
  };

  const handleResizeMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + (config.x / 100) * rect.width;
    const cy = rect.top + (config.y / 100) * rect.height;
    
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    resizeStartValues.current = { scale: config.scale, dist };
    isResizing.current = true;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();

    if (isResizing.current) {
        const cx = rect.left + (config.x / 100) * rect.width;
        const cy = rect.top + (config.y / 100) * rect.height;
        
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const newDist = Math.sqrt(dx * dx + dy * dy);
        
        if (resizeStartValues.current.dist > 0) {
            const ratio = newDist / resizeStartValues.current.dist;
            let newScale = resizeStartValues.current.scale * ratio;
            newScale = Math.max(5, Math.min(100, newScale));
            setConfig(prev => ({ ...prev, scale: newScale }));
        }
        return;
    }

    if (isDragging.current) {
        let x = ((e.clientX - rect.left) / rect.width) * 100;
        let y = ((e.clientY - rect.top) / rect.height) * 100;
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));
        setConfig(prev => ({ ...prev, x, y }));
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    isResizing.current = false;
  };

  const handleSave = () => {
    if (!imageBase64) return;
    onSave({
      id: initialConfig?.id || Date.now().toString(),
      name,
      imageBase64,
      ...config
    });
    onClose();
  };

  // Safe styling function
  const getPreviewStyle = (ratioVal: string) => {
      // Default to square if invalid
      let w = 1, h = 1;
      if (ratioVal && ratioVal.includes(':')) {
          [w, h] = ratioVal.split(':').map(Number);
      }
      
      const ratio = w / h;
      
      // We calculate a style that ensures the box is visible and maintains aspect ratio
      // aspect-ratio property is supported in all modern browsers (Chrome 88+, Firefox 89+, Safari 15+)
      // Fallback: we could use padding-top, but let's stick to aspect-ratio + max-dims
      
      const style: React.CSSProperties = {
          aspectRatio: `${w}/${h}`,
      };

      if (ratio > 1) {
          // Landscape: Width fills, Height adapts
          style.width = '100%';
          style.height = 'auto';
          style.maxWidth = '100%';
          style.maxHeight = '100%';
      } else {
          // Portrait/Square: Height fills, Width adapts
          style.height = '100%';
          style.width = 'auto';
          style.maxWidth = '100%';
          style.maxHeight = '100%';
      }
      return style;
  };

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
        onMouseUp={handleMouseUp}
    >
      <div className="bg-zopkit-panel border border-slate-700 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        
        {/* Left: Controls */}
        <div className="w-full md:w-80 p-6 border-b md:border-b-0 md:border-r border-slate-700 overflow-y-auto bg-slate-900/50 flex-shrink-0">
          <h2 className="text-xl font-bold text-white mb-6">Watermark Editor</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase text-slate-400 font-semibold">Watermark Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Logo Bottom Right"
              />
            </div>

            <div className="space-y-2">
                <label className="text-xs uppercase text-slate-400 font-semibold">Preview Shape</label>
                <div className="relative">
                    <select
                        value={previewRatio}
                        onChange={(e) => setPreviewRatio(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    >
                        {ASPECT_RATIOS.map(ratio => (
                            <option key={ratio.value} value={ratio.value}>{ratio.label}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-2.5 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase text-slate-400 font-semibold">Image Source</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 rounded-lg p-4 hover:bg-slate-800 hover:border-blue-500 cursor-pointer transition-colors text-center relative overflow-hidden"
              >
                {imageBase64 ? (
                   <img src={imageBase64} className="h-16 mx-auto object-contain" alt="Preview" />
                ) : (
                   <div className="text-slate-500 text-sm">Click to upload PNG/SVG</div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </div>
            </div>

            {imageBase64 && (
                <>
                <div className="space-y-4 pt-4 border-t border-slate-700">
                    <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Size (Relative Width)</span>
                            <span>{Math.round(config.scale)}%</span>
                        </div>
                        <input 
                            type="range" min="5" max="80" 
                            value={config.scale} 
                            onChange={(e) => setConfig({...config, scale: Number(e.target.value)})}
                            className="w-full accent-blue-500"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Opacity</span>
                            <span>{Math.round(config.opacity * 100)}%</span>
                        </div>
                        <input 
                            type="range" min="0.1" max="1" step="0.1"
                            value={config.opacity} 
                            onChange={(e) => setConfig({...config, opacity: Number(e.target.value)})}
                            className="w-full accent-blue-500"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Rotation</span>
                            <span>{config.rotation}°</span>
                        </div>
                        <input 
                            type="range" min="-180" max="180" 
                            value={config.rotation} 
                            onChange={(e) => setConfig({...config, rotation: Number(e.target.value)})}
                            className="w-full accent-blue-500"
                        />
                    </div>
                </div>

                <div className="pt-4 grid grid-cols-3 gap-2">
                    {[
                        { l: '↖', x: 10, y: 10 }, { l: '↑', x: 50, y: 10 }, { l: '↗', x: 90, y: 10 },
                        { l: '←', x: 10, y: 50 }, { l: '●', x: 50, y: 50 }, { l: '→', x: 90, y: 50 },
                        { l: '↙', x: 10, y: 90 }, { l: '↓', x: 50, y: 90 }, { l: '↘', x: 90, y: 90 },
                    ].map(pos => (
                        <button 
                            key={pos.l}
                            onClick={() => setConfig({ ...config, x: pos.x, y: pos.y })}
                            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded py-2 text-slate-300 transition-colors"
                        >
                            {pos.l}
                        </button>
                    ))}
                </div>
                </>
            )}
          </div>
          
          <div className="mt-8 flex gap-3">
             <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
             <Button onClick={handleSave} disabled={!imageBase64} className="flex-1">Save</Button>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="flex-1 bg-[#111] relative flex flex-col p-4 md:p-8 select-none">
           
           <div className="flex-1 relative flex items-center justify-center min-h-0 w-full h-full overflow-hidden">
               {/* Grid Background */}
               <div className="absolute inset-0 opacity-20 pointer-events-none" 
                    style={{backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
               </div>

               {/* Canvas Proxy */}
               <div 
                 ref={containerRef}
                 onMouseMove={handleMouseMove}
                 onMouseUp={handleMouseUp}
                 onMouseLeave={handleMouseUp}
                 className="relative bg-gradient-to-br from-slate-700 to-slate-800 shadow-2xl overflow-hidden cursor-crosshair border border-slate-600 transition-all duration-300 ease-in-out"
                 style={getPreviewStyle(previewRatio)}
               >
                  {/* Dummy Image Content */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                     <span className="text-4xl font-bold text-black/50 rotate-45 whitespace-nowrap">PREVIEW</span>
                  </div>

                  {/* The Watermark */}
                  {imageBase64 && (
                      <div 
                        onMouseDown={handleMouseDown}
                        className="absolute origin-center cursor-move hover:ring-2 ring-blue-500/50 hover:ring-offset-2 ring-offset-transparent z-10"
                        style={{
                            left: `${config.x}%`,
                            top: `${config.y}%`,
                            width: `${config.scale}%`,
                            opacity: config.opacity,
                            transform: `translate(-50%, -50%) rotate(${config.rotation}deg)`
                        }}
                      >
                         <img 
                            src={imageBase64} 
                            alt="watermark" 
                            className="w-full h-auto pointer-events-none drop-shadow-xl select-none"
                            draggable={false}
                         />
                         
                         {/* Interactive Resize Handle */}
                         <div 
                            onMouseDown={handleResizeMouseDown}
                            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize z-20 shadow-md hover:scale-125 transition-transform"
                            style={{ transform: 'translate(50%, 50%)' }}
                            title="Drag to resize"
                         />
                      </div>
                  )}

                  {/* Guidelines */}
                  {(isDragging.current || isResizing.current) && (
                     <>
                       <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-500/30 pointer-events-none"></div>
                       <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-500/30 pointer-events-none"></div>
                       <div className="absolute top-2 right-2 text-[10px] font-mono text-blue-400 bg-black/50 px-1 rounded pointer-events-none z-10">
                           x:{Math.round(config.x)}% y:{Math.round(config.y)}% w:{Math.round(config.scale)}%
                       </div>
                     </>
                  )}
               </div>
           </div>
           
           <div className="mt-4 text-center text-xs text-slate-500 pointer-events-none">
              Drag image to position • Drag blue dot to resize • Switch aspect ratios to check placement
           </div>
        </div>
      </div>
    </div>
  );
};
