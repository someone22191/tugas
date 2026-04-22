import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

const getGenAI = () => {
  if (!genAI) {
    const apiKey = (window as any).process?.env?.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return null;
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

export async function getAttendanceAnalysis(data: any) {
  const ai = getGenAI();
  if (!ai) return "AI Analysis not available: Missing API Key.";

  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Analisis data absensi sekolah berikut dan berikan 3 poin singkat saran untuk admin atau guru (gunakan Bahasa Indonesia):
  ${JSON.stringify(data)}
  Focus on identifying trends or students needing attention. Be professional and encouraging.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Gagal memuat analisis AI saat ini.";
  }
}
