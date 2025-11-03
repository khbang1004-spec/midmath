import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

export function initializeGemini(apiKey: string) {
  ai = new GoogleGenAI({ apiKey });
}

export async function validateApiKey(apiKey: string): Promise<{valid: boolean; message?: string}> {
  try {
    const testAI = new GoogleGenAI({ apiKey });
    await testAI.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ parts: [{ text: "hello" }] }]
    });
    return { valid: true };
  } catch (error) {
    console.error("API Key validation failed:", error);
    if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('permission denied'))) {
        return { valid: false, message: 'API 키가 유효하지 않습니다. Google AI Studio에서 발급받은 키인지 확인해주세요.' };
    }
    return { valid: false, message: 'API 키를 확인하는 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.' };
  }
}

export async function generateStudentReport(prompt: string): Promise<string> {
  if (!ai) {
    throw new Error("Gemini AI 서비스가 초기화되지 않았습니다. API 키를 먼저 입력해주세요.");
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes('429')) { // Too many requests
            throw new Error("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
        }
        if (error.message.includes('block')) { // Safety settings
            throw new Error("생성 요청이 안전상의 이유로 차단되었습니다. 입력 내용을 확인해주세요.");
        }
    }
    throw new Error("AI 모델과 통신 중 오류가 발생했습니다.");
  }
}
