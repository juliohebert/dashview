
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a title and description for a new signage item based on its category.
 */
export async function generateContentSuggestion(category: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a catchy advertisement title and a short caption for a digital signage display. Category: ${category}. Language: Portuguese.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            caption: { type: Type.STRING },
          },
          required: ["title", "caption"]
        }
      }
    });
    
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini suggestion failed:", error);
    return null;
  }
}
