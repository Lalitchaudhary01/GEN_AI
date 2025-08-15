import { GoogleGenAI } from "@google/genai";
import readlineSync from "readline-sync";
import dotenv from "dotenv";
dotenv.config();

// Ensure the environment variable is set
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GOOGLE_API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const History = [];

async function Chatting(userProblem) {
  History.push({
    role: "user",
    parts: [{ text: userProblem }],
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: History,
  });

  History.push({
    role: "model",
    parts: [{ text: response.text }],
  });

  console.log("\n");
  console.log(response.text);
}

async function main() {
  const userProblem = readlineSync.question("Ask me anything--> ");
  await Chatting(userProblem);
  main();
}

main();
