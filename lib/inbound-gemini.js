// lib/inbound-gemini.ts
// PRD v1.3, Section 6: Gemini API call for Intent/Confidence
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_PRO_API_KEY);
export async function analyzeTranscript(transcript) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Analyze the following transcript and return a JSON object with the user's intent and a confidence score (0-100). Example: { "intent": "billing_question", "confidence_score": 85 }. Transcript: ${transcript}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    try {
        return JSON.parse(text);
    }
    catch (e) {
        return { intent: 'unknown', confidence_score: 0 };
    }
}
