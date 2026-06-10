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
        httpOptions: { abortSignal: controller.signal } 
      }
    });
  } catch (e) {
    console.log("abortSignal:", e.name);
  }

  const controller2 = new AbortController();
  setTimeout(() => controller2.abort(), 100);
  try {
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "hello",
      config: {
        httpOptions: { signal: controller2.signal } 
      }
    });
  } catch (e) {
    console.log("signal:", e.name);
  }
}
run();
