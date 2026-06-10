import { GoogleGenAI } from "@google/genai";
async function run() {
  const ai = new GoogleGenAI({ apiKey: "fake" });
  try {
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "hello",
      config: {
        httpOptions: { timeout: 100 }
      }
    });
  } catch (e) {
    console.log(e);
  }
}
run();
