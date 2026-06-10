import { GoogleGenAI } from "@google/genai";
async function run() {
  const ai = new GoogleGenAI({ apiKey: "fake" });
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 100);
  try {
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "hello",
      config: {
        httpOptions: { timeout: 15000 } // wait we can also do Promise.race, or does it take abortSignal? I'll just use Promise.race
      }
    });
  } catch (e) {
    console.log(e);
  }
}
run();
