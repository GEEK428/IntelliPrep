const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

async function listModels() {
    try {
        console.log("Fetching models...");
        const result = await ai.models.list();
        console.log("Result type:", typeof result);
        console.log("Result keys:", Object.keys(result));
        
        const models = result.models || result;
        if (Array.isArray(models)) {
            models.forEach(model => {
                console.log(`- ${model.name}`);
            });
        } else {
            console.log("Models is not an array:", models);
        }

    } catch (err) {
        console.error("Error:", err.message);
    }
}

listModels();
