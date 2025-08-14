import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("❌ GEMINI_API_KEY not found in .env file");
}

const genAI = new GoogleGenerativeAI(apiKey);

async function run(): Promise<void> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt: string =
    "Hello Gemini, can you introduce yourself like a friendly AI?";

  const result = await model.generateContent(prompt);

  console.log(result.response.text());
}

run();
