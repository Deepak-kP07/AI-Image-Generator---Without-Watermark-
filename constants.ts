
import { ModelType, AspectRatio, AppSettings, GenerationMode, VideoResolution } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  mode: GenerationMode.IMAGE,
  model: ModelType.GEMINI_FLASH_IMAGE, // Default set to Nano Banana (Flash)
  aspectRatio: AspectRatio.SQUARE,
  numberOfImages: 1,
  
  videoResolution: VideoResolution.P720,
  includeAudio: false,
  
  activeWatermarkId: 'none',
  savedWatermarks: [], 
};

export const MODEL_OPTIONS = [
  { value: ModelType.GEMINI_FLASH_IMAGE, label: 'Nano Banana (Fast)', mode: GenerationMode.IMAGE },
  { value: ModelType.GEMINI_PRO_IMAGE, label: 'Gemini 3 Pro Image (High Quality)', mode: GenerationMode.IMAGE },
  { value: ModelType.FLUX_SCHNELL, label: 'Flux 1 Schnell (Stability AI)', mode: GenerationMode.IMAGE },
  { value: ModelType.SD_XL, label: 'Stable Diffusion XL (Hugging Face)', mode: GenerationMode.IMAGE },
  
  { value: ModelType.VEO_FAST, label: 'Veo 3.1 Fast (Quick Preview)', mode: GenerationMode.VIDEO },
  { value: ModelType.VEO_HIGH, label: 'Veo 3.1 Pro (High Quality)', mode: GenerationMode.VIDEO },
];

export const ASPECT_RATIOS = [
  { value: AspectRatio.SQUARE, label: 'Square 1:1 🔲' },
  { value: AspectRatio.LANDSCAPE, label: 'Landscape 16:9 ▭' },
  { value: AspectRatio.PORTRAIT, label: 'Portrait 9:16 ▯' },
  { value: AspectRatio.STANDARD_LANDSCAPE, label: 'Standard 4:3 ▬' },
  { value: AspectRatio.STANDARD_PORTRAIT, label: 'Standard 3:4 ▮' },
];

export const VIDEO_ASPECT_RATIOS = [
  { value: AspectRatio.LANDSCAPE, label: 'Landscape 16:9 ▭' },
  { value: AspectRatio.PORTRAIT, label: 'Portrait 9:16 ▯' },
];

export const SYSTEM_PROMPT_ENHANCER = "Rewrite the following image prompt to be highly detailed, sharp focus, photorealistic, with no artifacts and 8k resolution. Describe lighting, texture, and composition. Keep it under 60 words. Prompt: ";
