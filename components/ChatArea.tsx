
import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../types';

interface ChatAreaProps {
  messages: ChatMessage[];
  isGenerating: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, isGenerating }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleDownload = (dataUrl: string, type: 'image' | 'video' = 'image') => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `zopkit-generated-${Date.now()}.${type === 'video' ? 'webm' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openLightbox = (img: string) => {
    setLightboxImage(img);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative">
      
      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          onClick={closeLightbox}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center">
             <img 
               src={lightboxImage} 
               alt="Full view" 
               className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl border border-slate-700/50" 
             />
             <div onClick={(e) => e.stopPropagation()} className="flex gap-4 mt-6 cursor-default">
                <button 
                  onClick={closeLightbox}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-medium transition-colors border border-slate-700"
                >
                  Close
                </button>
                <button 
                  onClick={() => handleDownload(lightboxImage)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download
                </button>
             </div>
          </div>
        </div>
      )}

      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/20">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-200 mb-2">Welcome to Zopkit</h2>
          <p className="max-w-md text-sm">
            Toggle between <b>Image</b> and <b>Video</b> in the sidebar. <br/>
            Create stunning visuals with Gemini 2.5 and Veo 3.1.
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
        >
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-700' : 'bg-blue-600'}`}>
            {msg.role === 'user' ? (
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            )}
          </div>

          {/* Content */}
          <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
            {msg.text && (
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-slate-700 text-slate-100 rounded-tr-none' 
                  : msg.isError 
                    ? 'bg-red-900/50 text-red-200 border border-red-800' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
              }`}>
                {msg.text}
              </div>
            )}
            
            {/* Render Images */}
            {msg.images && msg.images.length > 0 && (
              <div className={`grid gap-4 mt-2 w-full ${msg.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {msg.images.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => openLightbox(img)}
                    className="relative group rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl cursor-zoom-in"
                  >
                    <img src={img} alt={`Generated result ${idx + 1}`} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(img, 'image'); }}
                        className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-blue-600 text-white rounded-lg backdrop-blur-md transition-all duration-200 z-10 shadow-lg border border-white/10"
                        title="Download Image"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Render Videos */}
            {msg.videos && msg.videos.length > 0 && (
              <div className="flex flex-col gap-4 mt-2 w-full">
                {msg.videos.map((vid, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
                    <video controls src={vid} className="w-full h-auto max-h-[60vh] bg-black" />
                    <button
                        onClick={() => handleDownload(vid, 'video')}
                        className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-blue-600 text-white rounded-lg backdrop-blur-md transition-all duration-200 z-10 shadow-lg border border-white/10"
                        title="Download Video"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {isGenerating && (
        <div className="flex gap-4 max-w-4xl mx-auto">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center animate-pulse">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 text-slate-400 text-sm h-8">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200"></span>
                <span className="ml-2">Synthesizing reality... this may take a minute.</span>
             </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};
