import React, { useState, useRef, KeyboardEvent } from 'react';
import { Button } from './Button';
import { enhanceUserPrompt } from '../services/geminiService';

interface InputAreaProps {
  onSend: (prompt: string, image?: string) => void;
  isGenerating: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if ((!prompt.trim() && !previewImage) || isGenerating) return;
    onSend(prompt, previewImage || undefined);
    setPrompt('');
    setPreviewImage(null);
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const betterPrompt = await enhanceUserPrompt(prompt);
      setPrompt(betterPrompt);
      setTimeout(() => {
          if (textareaRef.current) {
              textareaRef.current.style.height = 'auto';
              textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
          }
      }, 0);
    } catch (error) {
        console.error("Enhance failed", error);
    } finally {
        setIsEnhancing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPreviewImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const target = e.target;
      target.style.height = 'auto';
      target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
      setPrompt(target.value);
  };

  return (
    <div className="p-4 bg-zopkit-dark/95 backdrop-blur-md border-t border-slate-800">
      <div className="max-w-4xl mx-auto">
        
        {/* Image Preview Area */}
        {previewImage && (
          <div className="mb-4 relative inline-block animate-in fade-in zoom-in-95 duration-200">
             <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-black/50 group">
                <img src={previewImage} alt="Upload preview" className="h-24 w-auto object-cover" />
                <button 
                    onClick={clearImage}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-red-600/80 text-white rounded-full p-1 transition-colors"
                    title="Remove image"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
             </div>
             <span className="text-xs text-blue-400 block mt-1 font-medium">Editing this image</span>
          </div>
        )}

        <div 
          className="flex items-end gap-3 bg-slate-800 p-2 rounded-xl transition-all"
          style={{ boxShadow: 'none', border: 'none', outline: 'none' }}
        >
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${previewImage ? 'text-blue-400 bg-blue-400/10' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            title="Upload image to edit"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/png,image/jpeg,image/webp" 
            onChange={handleFileChange}
          />

          <textarea
            ref={textareaRef}
            className="flex-1 bg-transparent !border-none !ring-0 !outline-none !shadow-none text-slate-200 placeholder-slate-500 focus:!ring-0 focus:!outline-none focus:!border-none resize-none py-3 max-h-40 min-h-[44px]"
            placeholder={previewImage ? "Describe changes (e.g., 'make it cyberpunk')..." : "Describe an image to generate..."}
            value={prompt}
            onChange={autoResize}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{ boxShadow: 'none', outline: 'none', border: 'none' }} 
          />
          
          <div className="relative group">
            <button 
               onClick={handleEnhance}
               disabled={!prompt.trim() || isEnhancing}
               className={`p-2 rounded-lg mb-0.5 transition-all ${
                 isEnhancing ? 'bg-purple-600/20 text-purple-300 animate-pulse' : 
                 !prompt.trim() ? 'text-slate-600 cursor-not-allowed' : 'text-purple-400 hover:bg-purple-600 hover:text-white'
               }`}
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </button>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={(!prompt.trim() && !previewImage) || isGenerating}
            isLoading={isGenerating}
            className="rounded-lg mb-0.5 shadow-none"
          >
            {previewImage ? 'Edit' : 'Generate'}
          </Button>
        </div>
      </div>
    </div>
  );
};