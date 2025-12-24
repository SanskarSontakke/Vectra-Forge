import { GoogleGenAI } from "@google/genai";

// Helper to strip data:image/...;base64, prefix
const stripBase64Header = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

export const checkAndRequestApiKey = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    return await (window as any).aistudio.hasSelectedApiKey();
  }
  return true;
};

export const openApiKeySelector = async (): Promise<void> => {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    await (window as any).aistudio.openSelectKey();
  }
};

/**
 * Generates a mockup by compositing a logo onto a product using Gemini 2.5 Flash Image.
 */
export const generateMockup = async (
  logoBase64: string,
  product: string,
  customPrompt: string,
  color?: string,
  logoScale?: string
): Promise<string> => {
  // Always create a new instance to pick up potentially new API keys (if switched via extension)
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const productDescription = color ? `${color} ${product}` : product;
  const scaleInstruction = logoScale ? `Logo Size/Scale: ${logoScale} relative to the product surface.` : 'Logo Size: Standard/Medium.';

  const prompt = `
    Create a high-quality, photorealistic product mockup.
    Product: ${productDescription}.
    Task: Place the provided logo image onto the product naturally. 
    ${scaleInstruction}
    The logo should be centered and follow the curvature and lighting of the object.
    Style: High contrast, dramatic lighting, professional product photography, dark aesthetic background.
    Additional details: ${customPrompt}
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG for logos mainly
              data: stripBase64Header(logoBase64),
            }
          },
          { text: prompt }
        ]
      },
      config: {
        // We do not set responseMimeType for image models usually unless specific
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Mockup generation failed:", error);
    throw error;
  }
};

/**
 * Edits an existing image using Gemini 2.5 Flash Image.
 */
export const editImage = async (
  imageBase64: string,
  prompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: stripBase64Header(imageBase64),
            }
          },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image returned.");
  } catch (error) {
    console.error("Image editing failed:", error);
    throw error;
  }
};

/**
 * Generates a high-quality image using Gemini 3 Pro Image Preview.
 */
export const generateProImage = async (
  prompt: string,
  size: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          imageSize: size as any,
          aspectRatio: '1:1'
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Pro image generation failed:", error);
    throw error;
  }
};