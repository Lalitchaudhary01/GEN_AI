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

const chat = ai.chats.create({
  model: "gemini-2.0-flash",
  history: [],
});

async function main() {
  const userProblem = readlineSync.question("Ask me anything--> ");
  const response = await chat.sendMessage({
    message: userProblem,
  });

  console.log(response.text);
  main();
}

main();
