
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { InputArea } from './components/InputArea';
import { LandingPage } from './components/LandingPage';
import { AppSettings, ChatMessage, WatermarkConfig, GenerationMode, ModelType } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { generateOrEditImage, generateVideo, generateTextResponse } from './services/geminiService';
import { applyWatermark, applyVideoWatermark } from './utils/watermark';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('zopkit_watermarks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
           setSettings(prev => ({ ...prev, savedWatermarks: parsed }));
        }
      } catch (e) { console.error("Failed to load watermarks", e); }
    }
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const saveWatermark = (config: WatermarkConfig) => {
    setSettings(prev => {
        const exists = prev.savedWatermarks.find(w => w.id === config.id);
        let newWatermarks;
        if (exists) {
            newWatermarks = prev.savedWatermarks.map(w => w.id === config.id ? config : w);
        } else {
            newWatermarks = [...prev.savedWatermarks, config];
        }
        localStorage.setItem('zopkit_watermarks', JSON.stringify(newWatermarks));
        return {
            ...prev,
            savedWatermarks: newWatermarks,
            activeWatermarkId: config.id
        };
    });
  };

  const deleteWatermark = (id: string) => {
      setSettings(prev => {
          const newWatermarks = prev.savedWatermarks.filter(w => w.id !== id);
          localStorage.setItem('zopkit_watermarks', JSON.stringify(newWatermarks));
          return {
              ...prev,
              savedWatermarks: newWatermarks,
              activeWatermarkId: prev.activeWatermarkId === id ? 'none' : prev.activeWatermarkId
          };
      });
  };

  const checkApiKeyRequirement = async (model: ModelType) => {
    // These models require a user-selected paid API key
    const requiresPaidKey = 
      model === ModelType.VEO_FAST || 
      model === ModelType.VEO_HIGH || 
      model === ModelType.GEMINI_PRO_IMAGE;

    if (requiresPaidKey) {
      // @ts-ignore
      if (window.aistudio && window.aistudio.hasSelectedApiKey && window.aistudio.openSelectKey) {
         // @ts-ignore
         const hasKey = await window.aistudio.hasSelectedApiKey();
         if (!hasKey) {
             // @ts-ignore
             await window.aistudio.openSelectKey();
             // Assume success after dialog interaction to handle race conditions
         }
      }
    }
  };

  const handleSend = async (prompt: string, referenceImage?: string) => {
    await checkApiKeyRequirement(settings.model);

    const userMsgId = Date.now().toString();
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        text: prompt,
        images: referenceImage ? [referenceImage] : undefined,
        timestamp: Date.now()
      }
    ];
    setMessages(newMessages);
    setIsGenerating(true);

    try {
      // --- VIDEO MODE ---
      if (settings.mode === GenerationMode.VIDEO) {
        let videoUrl = await generateVideo({ prompt, referenceImage, settings });
        
        // Apply Video Watermark
        const activeWatermark = settings.savedWatermarks.find(w => w.id === settings.activeWatermarkId);
        if (settings.activeWatermarkId !== 'none' && activeWatermark) {
          try {
             videoUrl = await applyVideoWatermark(videoUrl, activeWatermark);
          } catch (wmError) {
             console.error("Video watermark failed, using original", wmError);
          }
        }

        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            videos: [videoUrl],
            timestamp: Date.now()
          }
        ]);
      } 
      // --- IMAGE MODE ---
      else {
        let result = await generateOrEditImage({ prompt, referenceImage, settings });
        
        if (result.images.length > 0) {
            let generatedImages = result.images;
            // Apply Image Watermark
            const activeWatermark = settings.savedWatermarks.find(w => w.id === settings.activeWatermarkId);
            if (settings.activeWatermarkId !== 'none' && activeWatermark) {
              try {
                const watermarkedImages = await Promise.all(
                  generatedImages.map(img => applyWatermark(img, activeWatermark))
                );
                generatedImages = watermarkedImages;
              } catch (wmError) {
                console.error("Watermark failed", wmError);
              }
            }

            setMessages(prev => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                images: generatedImages,
                timestamp: Date.now()
              }
            ]);
        } else if (result.text) {
             // The model returned text (conversational response) instead of images
             setMessages(prev => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: result.text,
                    timestamp: Date.now()
                }
             ]);
        }
      }

    } catch (error: any) {
      console.warn("Media generation failed, attempting text fallback...", error);
      
      // FALLBACK STRATEGY
      // If image/video generation fails (e.g. prompt was "Hello" or safety filter blocked image),
      // we try to generate a helpful text response using Gemini Flash.
      try {
          const fallbackText = await generateTextResponse(prompt);
          setMessages(prev => [
            ...prev,
            {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: fallbackText,
                timestamp: Date.now()
            }
          ]);
      } catch (fallbackError) {
          // If even the text fallback fails, then we show the error
          setMessages(prev => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              text: `Error: ${error.message || "Something went wrong."}`,
              isError: true,
              timestamp: Date.now()
            }
          ]);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (showLanding) {
    return <LandingPage onLaunch={() => setShowLanding(false)} />;
  }

  return (
    <div className="flex h-screen bg-zopkit-dark font-sans text-slate-200 overflow-hidden">
      <Sidebar 
        settings={settings} 
        updateSettings={updateSettings} 
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        saveWatermark={saveWatermark}
        deleteWatermark={deleteWatermark}
      />
      <div className="flex-1 flex flex-col md:ml-72 transition-all duration-300 relative h-full">
        <div className="md:hidden flex items-center justify-between p-4 bg-zopkit-panel border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">Z</div>
            <span className="font-bold text-lg">Zopkit</span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-300">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
        <ChatArea messages={messages} isGenerating={isGenerating} />
        <InputArea onSend={handleSend} isGenerating={isGenerating} />
      </div>
    </div>
  );
};

export default App;
