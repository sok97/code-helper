const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('./config');

class CodeGenerator {
    constructor() {
        this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    }

    buildPrompt(prompt, language) {
        return `You are an expert code generator.
    
User Request: ${prompt}
Target Language: ${language}

Please generate the code to fulfill the request.
Rules:
1. Return ONLY the code. No markdown formatting, no explanations, no code blocks (unless it's part of the string inside the code).
2. If the request is unclear, generate the best possible guess with a comment explaining the assumption.
3. Ensure the code is clean, efficient, and follows best practices for ${language}.
4. If imports are needed, include them at the top.

Code:`;
    }

    async generateCode(prompt, language) {
        try {
            const userPrompt = this.buildPrompt(prompt, language);
            const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const result = await model.generateContent(userPrompt);
            const text = await result.response.text();

            // Clean up potential markdown code blocks if the model ignores the instruction
            let cleanCode = text;
            if (cleanCode.startsWith('```')) {
                cleanCode = cleanCode.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
            }

            return {
                success: true,
                code: cleanCode.trim()
            };

        } catch (error) {
            console.error('Gemini API error in generation:', error.message);
            throw {
                status: error.status || 500,
                message: error.message || 'Gemini API error during generation',
                code: error.code
            };
        }
    }
}

module.exports = CodeGenerator;
