import { GoogleGenAI, Type } from "@google/genai";
import { GeoSpyResult, GeoHintsResult, ChronoResult, GHuntResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const analyzeGeolocation = async (base64Image: string, mimeType: string): Promise<GeoSpyResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: "You are an OSINT expert. Predict the geographic location of this image. Return a JSON object with 'lat' (number), 'lon' (number), 'description' (string), and 'confidence' (number between 0 and 1). Use original sources, do not hallucinate. If you can't find anything, set confidence to 0." },
          { inlineData: { data: base64Image, mimeType } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lat: { type: Type.NUMBER },
          lon: { type: Type.NUMBER },
          description: { type: Type.STRING },
          confidence: { type: Type.NUMBER }
        },
        required: ["lat", "lon", "description", "confidence"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const extractGeoHints = async (base64Image: string, mimeType: string): Promise<GeoHintsResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: "You are an OSINT Bellingcat researcher and GeoHints expert. Analyze physical infrastructure hints specific to countries/regions in this image. Focus on: Traffic lights, poles, road markings, license plate formats, architecture, signs. Return a JSON object with 'hints' (array of objects with category, detail, regions) and 'summary' (string)." },
          { inlineData: { data: base64Image, mimeType } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                detail: { type: Type.STRING },
                regions: { type: Type.STRING }
              },
              required: ["category", "detail", "regions"]
            }
          },
          summary: { type: Type.STRING }
        },
        required: ["hints", "summary"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const analyzeChronolocation = async (base64Image: string, mimeType: string): Promise<ChronoResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: "You are an OSINT verification and chronolocation expert. Analyze this image using verification techniques (e.g., shadow analysis, sun angle). Return a JSON object with 'time_of_day', 'season', 'weather', and 'shadow_analysis'. If uncertain, write 'Data not available'. Do not hallucinate." },
          { inlineData: { data: base64Image, mimeType } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          time_of_day: { type: Type.STRING },
          season: { type: Type.STRING },
          weather: { type: Type.STRING },
          shadow_analysis: { type: Type.STRING }
        },
        required: ["time_of_day", "season", "weather", "shadow_analysis"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const analyzeEmail = async (email: string): Promise<GHuntResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: `You are an OSINT expert. Analyze the structure and domain of this email: ${email}. Provide domain intelligence and OSINT advice. Return a JSON object with 'validity', 'domain_intel', 'known_breaches', and 'osint_advice'. If no specific info, write 'Data not available'.` }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          validity: { type: Type.STRING },
          domain_intel: { type: Type.STRING },
          known_breaches: { type: Type.STRING },
          osint_advice: { type: Type.STRING }
        },
        required: ["validity", "domain_intel", "known_breaches", "osint_advice"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
