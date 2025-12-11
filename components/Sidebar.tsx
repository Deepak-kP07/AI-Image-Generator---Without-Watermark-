
import React, { useState } from 'react';
import { AppSettings, ModelType, AspectRatio, WatermarkConfig, GenerationMode, VideoResolution } from '../types';
import { MODEL_OPTIONS, ASPECT_RATIOS, VIDEO_ASPECT_RATIOS } from '../constants';
import { WatermarkModal } from './WatermarkModal';

interface SidebarProps {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  saveWatermark: (config: WatermarkConfig) => void;
  deleteWatermark: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    settings, 
    updateSettings, 
    isOpen, 
    toggleSidebar,
    saveWatermark,
    deleteWatermark
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWatermark, setEditingWatermark] = useState<WatermarkConfig | undefined>(undefined);

  const openNewWatermarkModal = () => {
      setEditingWatermark(undefined);
      setModalOpen(true);
  };

  const openEditWatermarkModal = (config: WatermarkConfig) => {
      setEditingWatermark(config);
      setModalOpen(true);
  };

  // Filter models based on mode
  const currentModelOptions = MODEL_OPTIONS.filter(m => m.mode === settings.mode);
  
  // Aspect ratios based on mode
  const currentAspectRatios = settings.mode === GenerationMode.VIDEO ? VIDEO_ASPECT_RATIOS : ASPECT_RATIOS;

  return (
    <>
      <WatermarkModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        onSave={saveWatermark}
        initialConfig={editingWatermark}
        defaultAspectRatio={settings.aspectRatio}
      />

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-zopkit-panel border-r border-slate-700 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 overflow-y-auto`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
               <span className="text-white font-bold">Z</span>
             </div>
             <h1 className="text-xl font-bold text-white tracking-tight">Zopkit</h1>
          </div>

          {/* Mode Selector */}
          <div className="mb-6 p-1 bg-slate-900 rounded-lg flex border border-slate-800">
             <button 
               onClick={() => updateSettings({ mode: GenerationMode.IMAGE, model: ModelType.GEMINI_FLASH_IMAGE })}
               className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${settings.mode === GenerationMode.IMAGE ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
             >
               Image
             </button>
             <button 
               onClick={() => updateSettings({ mode: GenerationMode.VIDEO, model: ModelType.VEO_FAST, aspectRatio: AspectRatio.LANDSCAPE })}
               className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${settings.mode === GenerationMode.VIDEO ? 'bg-blue-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
             >
               Video
             </button>
          </div>

          <div className="space-y-6">
            
            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Model</label>
              <div className="relative">
                <select 
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                  value={settings.model}
                  onChange={(e) => updateSettings({ model: e.target.value as ModelType })}
                >
                  {currentModelOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Video Specific Settings */}
            {settings.mode === GenerationMode.VIDEO && (
              <>
                 <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolution</label>
                    <div className="flex gap-2">
                       {[VideoResolution.P720, VideoResolution.P1080].map(res => (
                         <button 
                           key={res}
                           onClick={() => updateSettings({ videoResolution: res })}
                           className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${settings.videoResolution === res ? 'bg-blue-600/20 border-blue-500 text-blue-200' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                         >
                           {res}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                   <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                         type="checkbox" 
                         checked={settings.includeAudio}
                         onChange={(e) => updateSettings({ includeAudio: e.target.checked })}
                         className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-blue-600 focus:ring-blue-500/50"
                      />
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Include Native Audio</span>
                   </label>
                   <p className="text-[10px] text-slate-500 pl-6">
                      Adds sound effects & background ambience.
                   </p>
                 </div>
              </>
            )}

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aspect Ratio</label>
               <div className="relative">
                <select 
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-sans"
                  value={settings.aspectRatio}
                  onChange={(e) => updateSettings({ aspectRatio: e.target.value as AspectRatio })}
                >
                  {currentAspectRatios.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                 <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Image Count - Only for Image Mode */}
            {settings.mode === GenerationMode.IMAGE && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Image Count</label>
                <div className="relative">
                  <select
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    value={settings.numberOfImages}
                    onChange={(e) => updateSettings({ numberOfImages: parseInt(e.target.value) })}
                  >
                    {[1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>{num} Image{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            )}

            {/* Watermark Section */}
            <div className="space-y-3 pt-4 border-t border-slate-700">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Watermark</label>
              
              <div className="relative">
                 <select
                   className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                   value={settings.activeWatermarkId}
                   onChange={(e) => updateSettings({ activeWatermarkId: e.target.value })}
                 >
                    <option value="none">No Watermark</option>
                    {settings.savedWatermarks.map(wm => (
                        <option key={wm.id} value={wm.id}>{wm.name}</option>
                    ))}
                 </select>
                 <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              <div className="mt-4">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Library</span>
                    <button 
                       onClick={openNewWatermarkModal}
                       className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                       Add New
                    </button>
                 </div>

                 <div className="space-y-2">
                    {settings.savedWatermarks.length === 0 && (
                        <div className="text-center py-4 bg-slate-800/50 rounded-lg border border-slate-800 border-dashed">
                            <span className="text-xs text-slate-500">No saved watermarks</span>
                        </div>
                    )}
                    
                    {settings.savedWatermarks.map(wm => (
                        <div key={wm.id} className="group flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                            <div className="w-8 h-8 rounded bg-slate-700 overflow-hidden flex-shrink-0">
                                <img src={wm.imageBase64} className="w-full h-full object-contain" alt="thumb" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs text-slate-200 font-medium truncate">{wm.name}</div>
                                <div className="text-[10px] text-slate-500">
                                    {Math.round(wm.scale)}% size
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                   onClick={() => openEditWatermarkModal(wm)}
                                   className="p-1 text-slate-400 hover:text-blue-400"
                                   title="Edit"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                </button>
                                <button 
                                   onClick={() => deleteWatermark(wm.id)}
                                   className="p-1 text-slate-400 hover:text-red-400"
                                   title="Delete"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-zopkit-panel border-t border-slate-700">
           <div className="text-xs text-slate-500 text-center">
             Zopkit AI Image Generator               <br/>
             Built with 💙 By Deepak  
           </div>
        </div>
      </div>
    </>
  );
};
