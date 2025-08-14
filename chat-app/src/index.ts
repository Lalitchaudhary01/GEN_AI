const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const input = require("prompt-sync")({ sigint: true });

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("❌ GEMINI_API_KEY not found in .env file");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Store chat history
type Message = { role: "user" | "assistant"; text: string };
const context: Message[] = [];

async function run() {
  console.log("💬 Gemini Chat (type 'exit' to quit)\n");

  while (true) {
    const prompt = input("You: ");
    if (!prompt || prompt.toLowerCase() === "exit") {
      console.log("👋 Goodbye!");
      break;
    }

    // Add user's message to context
    context.push({ role: "user", text: prompt });

    try {
      // Build conversation string from context
      const conversation = context
        .map((msg) => `${msg.role === "user" ? "You" : "Gemini"}: ${msg.text}`)
        .join("\n");

      const result = await model.generateContent(conversation);
      const reply = result.response.text();

      // Add Gemini's reply to context
      context.push({ role: "assistant", text: reply });

      console.log("Gemini:", reply, "\n");
    } catch (error) {
      console.error("⚠ Error:");
    }
  }
}

run();
