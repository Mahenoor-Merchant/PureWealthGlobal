import { GoogleGenAI } from "@google/genai";

async function test() {
  const modelsToTest = ["models/gemini-pro-latest", "gemini-pro-latest", "gemini-2.0-flash-exp", "gemini-1.5-flash-test"];
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } }
  });

  for (const model of modelsToTest) {
    try {
      console.log(`Testing model: ${model}`);
      const res = await ai.models.generateContent({
        model: model,
        contents: "Hello",
      });
      console.log(`[SUCCESS] ${model}: ${res.text}`);
    } catch (err: any) {
      console.error(`[FAILED] ${model}: ${err.message || String(err)}`);
    }
  }
}

test();
