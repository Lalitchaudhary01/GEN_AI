import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import promptSync from "prompt-sync";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("❌ GEMINI_API_KEY not found in .env file");
}

const input = promptSync({ sigint: true });

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Tool: Get current time in New York
function getTimeInNewYork() {
  return new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
}

// Start chat with initial context
const chat = model.startChat({
  history: [
    {
      role: "user",
      parts: [
        {
          text: "You are a helpful assistant. You can also tell the time in New York if asked.",
        },
      ],
    },
  ],
});

async function run() {
  console.log("💬 Gemini Chat (type 'exit' to quit)\n");

  while (true) {
    const prompt = input("You: ");
    if (prompt.toLowerCase() === "exit") break;

    // Tool trigger
    if (/time.*new\s*york/i.test(prompt)) {
      const time = getTimeInNewYork();
      console.log("🕒 Tool Response:", time, "\n");

      // Optionally, feed this into chat so Gemini remembers
      await chat.sendMessage(`The current time in New York is ${time}.`);
      continue;
    }

    // Normal Gemini response
    const result = await chat.sendMessage(prompt);
    const reply = result.response.text();
    console.log("Gemini:", reply, "\n");
  }
}

run();
