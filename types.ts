
export enum GenerationMode {
  IMAGE = 'image',
  VIDEO = 'video',
}

export enum ModelType {
  // Image Models
  GEMINI_FLASH_IMAGE = 'gemini-2.5-flash-image',
  GEMINI_PRO_IMAGE = 'gemini-3-pro-image-preview',
  FLUX_SCHNELL = 'flux-1-schnell',
  SD_XL = 'stable-diffusion-xl-base-1.0',
  
  // Video Models
  VEO_FAST = 'veo-3.1-fast-generate-preview',
  VEO_HIGH = 'veo-3.1-generate-preview',
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
  STANDARD_LANDSCAPE = '4:3',
  STANDARD_PORTRAIT = '3:4',
}

export enum VideoResolution {
  P720 = '720p',
  P1080 = '1080p',
}

export interface WatermarkConfig {
  id: string;
  name: string;
  imageBase64: string;
  x: number; // percentage 0-100 (center-based)
  y: number; // percentage 0-100 (center-based)
  scale: number; // percentage 0-100 (width relative to image width)
  opacity: number; // 0-1
  rotation: number; // degrees -180 to 180
}

export interface AppSettings {
  mode: GenerationMode;
  model: ModelType;
  aspectRatio: AspectRatio;
  numberOfImages: number;
  
  // Video specific
  videoResolution: VideoResolution;
  includeAudio: boolean; // For native audio prompt
  
  // Watermark Logic
  activeWatermarkId: string | 'none';
  savedWatermarks: WatermarkConfig[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text?: string;
  images?: string[]; // Base64 strings for images
  videos?: string[]; // URLs/Base64 for videos
  isError?: boolean;
  timestamp: number;
}

export interface GenerationRequest {
  prompt: string;
  referenceImage?: string; // Base64 for editing/starting frame
  settings: AppSettings;
}
