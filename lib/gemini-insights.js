// lib/gemini-insights.ts
// PRD v1.3, Section 7: Wrapper for Pro API call + complex insight prompt
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_PRO_API_KEY);
export async function generateInsights(calls) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const transcripts = calls.map(c => c.transcript).join('\n---\n');
    const prompt = `Analyze the attached transcripts and call logs. Identify the top 3 common objections (e.g., 'Pricing'), 1 unexpected positive insight (e.g., 'Mention of Competitor X fails 90% of the time'), and recommend one specific script tweak (e.g., 'Move Value Prop to node 2'). Output strict JSON: {objections: [], positive_insights: [], recommendation: {summary: '...', change: '...'}}. Transcripts: ${transcripts}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    try {
        return JSON.parse(text);
    }
    catch (e) {
        return { objections: [], positive_insights: [], recommendation: { summary: 'Could not generate insights due to low data volume.', change: '' } };
    }
}
