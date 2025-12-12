
import { GoogleGenAI } from "@google/genai";
import { GenerationRequest, ModelType, GenerationMode } from "../types";
import { SYSTEM_PROMPT_ENHANCER } from "../constants";

// --- ENVIRONMENT SAFETY ---
// Vite replaces process.env.Key with the string value at build time.
// We access them directly so the replacement works.
const getEnv = (key: string) => {
  // @ts-ignore
  return process.env[key] || "";
};

// --- API KEYS ---
const STABILITY_API_KEY = getEnv("STABILITY_API_KEY"); 
const HF_API_KEY = getEnv("HF_API_KEY");

const getClient = () => {
  // @ts-ignore
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key missing. Please ensure you have selected a project/key.");
  }
  return new GoogleGenAI({ apiKey });
};

export const enhanceUserPrompt = async (originalPrompt: string): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: SYSTEM_PROMPT_ENHANCER + originalPrompt,
    });
    return response.text || originalPrompt;
  } catch (e) {
    console.error("Prompt enhancement failed", e);
    return originalPrompt;
  }
};

export const generateTextResponse = async (prompt: string): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "I understand your prompt, but I couldn't generate an image or a text response for it.";
  } catch (e: any) {
    throw new Error(`Text generation failed: ${e.message}`);
  }
};

const generateFlux = async (prompt: string, aspectRatio: string, referenceImage?: string): Promise<string[]> => {
  if (!STABILITY_API_KEY) throw new Error("Stability API Key is missing.");
  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('output_format', 'png');
  
  if (referenceImage) {
    // Image-to-Image mode
    formData.append('mode', 'image-to-image');
    formData.append('strength', '0.7'); // Default strength for editing
    
    // Fetch blob from data URL
    const res = await fetch(referenceImage);
    const blob = await res.blob();
    formData.append('image', blob);
  } else {
    // Text-to-Image mode
    formData.append('aspect_ratio', aspectRatio);
  }
  
  const response = await fetch(`https://api.stability.ai/v2beta/stable-image/generate/sd3`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${STABILITY_API_KEY}`, Accept: "image/*" },
    body: formData,
  });

  if (!response.ok) {
     const errorText = await response.text();
     throw new Error(`Stability API Error: ${response.status} - ${errorText}`);
  }
  
  const blob = await response.blob();
  const base64 = await blobToBase64(blob);
  return [base64];
};

const generateSDXL = async (prompt: string): Promise<string[]> => {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
    {
      headers: { Authorization: `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  if (!response.ok) throw new Error(`Hugging Face API Error: ${response.statusText}`);
  const blob = await response.blob();
  const base64 = await blobToBase64(blob);
  return [base64];
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

// --- Video Generation ---
export const generateVideo = async (request: GenerationRequest): Promise<string> => {
  const { prompt, referenceImage, settings } = request;
  const ai = getClient();

  // Handle native audio preference in prompt
  let finalPrompt = prompt;
  if (settings.includeAudio) {
    finalPrompt += ". Include realistic native audio, sound effects, and dialogue if applicable.";
  }

  // Config setup
  const videoConfig: any = {
    numberOfVideos: 1,
    resolution: settings.videoResolution,
    aspectRatio: settings.aspectRatio,
  };

  const modelParams: any = {
    model: settings.model,
    prompt: finalPrompt,
    config: videoConfig,
  };

  // Add reference image if present (as starting frame)
  if (referenceImage) {
    const base64Data = referenceImage.split(',')[1] || referenceImage;
    const mimeType = referenceImage.match(/data:([^;]+);/)?.[1] || 'image/png';
    modelParams.image = {
      imageBytes: base64Data,
      mimeType: mimeType
    };
  }

  // 1. Start Operation
  let operation = await ai.models.generateVideos(modelParams);

  // 2. Poll until done
  // Veo can take a minute or more.
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  // 3. Get URI
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Video generation completed but no URI returned.");
  }

  // 4. Fetch the actual video bytes using the key
  // @ts-ignore
  const apiKey = process.env.API_KEY;
  const separator = downloadLink.includes('?') ? '&' : '?';
  const videoRes = await fetch(`${downloadLink}${separator}key=${apiKey}`);
  
  if (!videoRes.ok) {
    throw new Error(`Failed to download generated video content. Status: ${videoRes.status}`);
  }

  const videoBlob = await videoRes.blob();
  return URL.createObjectURL(videoBlob);
};

export const generateOrEditImage = async (request: GenerationRequest): Promise<{ images: string[], text?: string }> => {
  const { prompt, referenceImage, settings } = request;
  const modelName = settings.model;

  // Handle third-party models
  if (modelName === ModelType.FLUX_SCHNELL) {
      const images = await generateFlux(prompt, settings.aspectRatio, referenceImage);
      return { images };
  }
  if (modelName === ModelType.SD_XL) {
      if (referenceImage) {
          throw new Error("Stable Diffusion XL does not support image editing/reference images in this app. Please use Gemini 2.5 Flash Image or Flux.");
      }
      const images = await generateSDXL(prompt);
      return { images };
  }

  // Handle Gemini Models
  const ai = getClient();
  const parts: any[] = [];
  
  if (referenceImage) {
    const base64Data = referenceImage.split(',')[1] || referenceImage;
    const mimeType = referenceImage.match(/data:([^;]+);/)?.[1] || 'image/png';
    parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
  }

  // --- QUALITY & LAYOUT ENFORCEMENT ---
  const QUALITY_SUFFIX = ", ultra-detailed, 8k resolution, razor-sharp focus, professional typography, perfectly legible text, clean edges, high contrast, cinematic lighting, no blur, no artifacts, masterpiece. Ensure any text generated is spelled correctly. Use clear, relevant infographic elements where applicable.";
  
  // Explicitly updated to avoid "white patches". 
  const LAYOUT_SUFFIX = ". Compositional constraint: The bottom-right corner must be free of important details to allow for a watermark. This space must extend the existing background texture/lighting naturally. DO NOT leave a white or blank patch.";
  
  const finalPrompt = prompt + QUALITY_SUFFIX + LAYOUT_SUFFIX;
  
  parts.push({ text: finalPrompt });

  try {
    // Generate multiple images concurrently since generateContent for images usually returns 1 image
    // and ImageConfig doesn't support numberOfImages.
    const count = settings.numberOfImages || 1;
    const promises = Array.from({ length: count }).map(() => 
      ai.models.generateContent({
        model: modelName,
        contents: { parts: parts },
        config: {
          imageConfig: {
            aspectRatio: settings.aspectRatio,
            // Enforce 2K (2048x2048) for Pro model as requested
            ...(modelName === ModelType.GEMINI_PRO_IMAGE ? { imageSize: '2K' } : {}),
          }
        }
      })
    );

    const responses = await Promise.all(promises);

    const generatedImages: string[] = [];
    for (const response of responses) {
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
             const mime = part.inlineData.mimeType || 'image/png';
             generatedImages.push(`data:${mime};base64,${part.inlineData.data}`);
          }
        }
      }
    }

    if (generatedImages.length > 0) {
      return { images: generatedImages };
    }

    // If no images were generated, check if the model returned text (e.g. conversational response or refusal)
    const firstResponseText = responses[0]?.text;
    if (firstResponseText) {
      return { images: [], text: firstResponseText };
    }

    throw new Error("No image generated.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
