
import { WatermarkConfig } from "../types";

/**
 * Applies a watermark to a base64 image using advanced configuration.
 * Also applies a slight enhancement filter (contrast/brightness) to the canvas.
 */
export const applyWatermark = (
  sourceBase64: string, 
  config: WatermarkConfig
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const watermark = new Image();

    if (!ctx) {
      reject(new Error("Canvas context not available"));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Apply Enhancement Filter ("Unsharp mask" effect via contrast/brightness)
      // This applies to drawing operations that follow
      ctx.filter = 'contrast(1.1) brightness(1.05)';
      
      ctx.drawImage(img, 0, 0);

      watermark.onload = () => {
        const cx = (config.x / 100) * canvas.width;
        const cy = (config.y / 100) * canvas.height;
        const targetWidth = (config.scale / 100) * canvas.width;
        const aspectRatio = watermark.width / watermark.height;
        const targetHeight = targetWidth / aspectRatio;

        ctx.save();
        ctx.translate(cx, cy);
        const rad = (config.rotation * Math.PI) / 180;
        ctx.rotate(rad);
        ctx.globalAlpha = config.opacity;
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 4;
        
        // Note: ctx.filter is still active, so watermark gets the same pop, 
        // which helps it blend in stylistically.
        ctx.drawImage(watermark, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
        ctx.restore();

        resolve(canvas.toDataURL('image/png'));
      };

      watermark.onerror = reject;
      watermark.src = config.imageBase64;
    };

    img.onerror = reject;
    img.src = sourceBase64;
  });
};

/**
 * Applies a watermark to a video URL (Blob) using Canvas + MediaRecorder.
 * Returns a Promise that resolves to a new Blob URL (webm/mp4).
 */
export const applyVideoWatermark = async (
  videoUrl: string, 
  config: WatermarkConfig
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = "anonymous";
    video.src = videoUrl;
    video.muted = true; // Required to play automatically in background often

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return reject(new Error("No canvas context"));

    const watermark = new Image();
    
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };

    let recorder: MediaRecorder;
    const chunks: BlobPart[] = [];

    // Start processing when video can play
    video.oncanplaythrough = () => {
       // Only start once
       if (recorder) return;
       
       const stream = canvas.captureStream(30); // 30 FPS
       
       // Try to use video/webm;codecs=vp9 or default
       const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") 
         ? "video/webm;codecs=vp9" 
         : "video/webm";

       recorder = new MediaRecorder(stream, { mimeType });
       
       recorder.ondataavailable = (e) => {
         if (e.data.size > 0) chunks.push(e.data);
       };

       recorder.onstop = () => {
         const blob = new Blob(chunks, { type: mimeType });
         resolve(URL.createObjectURL(blob));
         // Clean up
         video.pause();
         video.src = "";
       };

       watermark.onload = () => {
         video.play();
         recorder.start();
         drawFrame();
       };
       // Trigger watermark load
       watermark.src = config.imageBase64;
    };

    const drawFrame = () => {
      if (video.paused || video.ended) {
        if (recorder && recorder.state === 'recording') recorder.stop();
        return;
      }

      // Draw Video
      // We apply the same pop filter to video frames for consistency
      ctx.filter = 'contrast(1.1) brightness(1.05)';
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw Watermark
      const cx = (config.x / 100) * canvas.width;
      const cy = (config.y / 100) * canvas.height;
      const targetWidth = (config.scale / 100) * canvas.width;
      const aspectRatio = watermark.width / watermark.height;
      const targetHeight = targetWidth / aspectRatio;

      ctx.save();
      ctx.translate(cx, cy);
      const rad = (config.rotation * Math.PI) / 180;
      ctx.rotate(rad);
      ctx.globalAlpha = config.opacity;
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 4;
      ctx.drawImage(watermark, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
      ctx.restore();

      requestAnimationFrame(drawFrame);
    };

    video.onerror = (e) => reject(new Error("Video load failed"));
  });
};
