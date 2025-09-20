// lib/gemini-script-gen.ts
// PRD v1.3, Section 5: Gemini API call wrapper + strict JSON prompt
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_PRO_API_KEY);
export async function generateScript(industry, goal) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `You are an expert script writer for AI calling agents. Create a script for the ${industry} industry with the goal of ${goal}. The output must be a valid JSON object that can be parsed by React Flow. The structure should be an array of nodes and an array of edges. Example node: { id: '1', type: 'input', data: { label: 'Greet' }, position: { x: 250, y: 5 } }.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    try {
        return JSON.parse(text);
    }
    catch (e) {
        console.error("Gemini did not return valid JSON", text);
        // Return a fallback script
        return { nodes: [], edges: [] };
    }
}
