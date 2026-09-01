const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.OPENAI_API || process.env.GEMINI_API;
const genAI = new GoogleGenerativeAI(apiKey);

console.log("Gemini AI API Model Configured & Connected Successfully!!");

module.exports = genAI;