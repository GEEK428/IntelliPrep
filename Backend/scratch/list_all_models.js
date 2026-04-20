const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

async function listModels() {
    try {
        console.log("Iterating models...");
        const response = await ai.models.list();
        // Try for-await in case it's an async iterable
        try {
            for await (const model of response) {
                if (model.name.includes("flash") || model.name.includes("gemini-3")) {
                    console.log(`- ${model.name}`);
                }
            }
        } catch (e) {
            console.log("Async iteration failed, trying direct array access in response...");
             // If not async iterable, let's try to just log the whole response to see what's in it.
             console.log(JSON.stringify(response, (key, value) => typeof value === 'function' ? '[Function]' : value, 2));
        }

    } catch (err) {
        console.error("Error:", err.message);
    }
}

listModels();
