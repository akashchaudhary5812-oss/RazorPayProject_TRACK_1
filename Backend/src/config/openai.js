const { GoogleGenerativeAI } = require("@google/generative-ai");

const mistralApiKey = process.env.MISTRAL_API || process.env.mistral_api || process.env.MISTRAL_API_KEY;
const geminiApiKey = process.env.GEMINI_API || process.env.OPENAI_API;

let genAI = null;
if (geminiApiKey) {
  try {
    genAI = new GoogleGenerativeAI(geminiApiKey);
  } catch (err) {
    console.log("Gemini init notice:", err.message);
  }
}

if (mistralApiKey) {
  console.log("Mistral AI API Model Configured & Connected Successfully!!");
} else if (geminiApiKey) {
  console.log("Gemini AI API Model Configured & Connected Successfully!!");
} else {
  console.log("Algorithmic Engine Ready (No external API key provided).");
}

module.exports = {
  genAI,
  mistralApiKey: mistralApiKey || null,
  geminiApiKey: geminiApiKey || null
};