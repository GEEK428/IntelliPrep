const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

async function testModel() {
    try {
        const modelName = "gemini-3-flash-preview";
        console.log(`Testing model: ${modelName}...`);
        
        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: "user", parts: [{ text: "Please respond with a small JSON: { \"status\": \"ok\" }" }] }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        console.log("✅ AI call successful!");
        console.log("Text response:", response.text);
    } catch (err) {
        console.error("❌ AI call failed:", err.message);
    }
}

testModel();
