import { GoogleGenAI, Content } from "@google/genai";

declare var process: {
  env: {
    GEMINI_API_KEY: string;
  };
};

export async function getChatResponse(message: string, history: Content[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      { role: "user", parts: [{ text: "Sizning ismingiz Najot AI. Siz juda aqlli, yordam berishni yaxshi ko'radigan va o'zbek tilida mukammal gapiradigan yordamchisiz." }] },
      { role: "model", parts: [{ text: "Tushunarlu, men Najot AI yordamchisiman. Qanday yordam bera olaman?" }] },
      ...history,
      { role: "user", parts: [{ text: message }] }
    ],
  });

  return response.text;
}
