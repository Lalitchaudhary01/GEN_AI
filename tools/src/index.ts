import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Part } from "@google/generative-ai";
import promptSync from "prompt-sync";
import fs from "fs";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("❌ GEMINI_API_KEY not found in .env file");
}

const input = promptSync({ sigint: true });
const genAI = new GoogleGenerativeAI(apiKey);

// Text model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Image model (same but different config)
const imageModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Chat message type
interface ChatMessage {
  role: "user" | "model";
  parts: Part[];
}

// Chat history
const history: ChatMessage[] = [
  { role: "user", parts: [{ text: "You are a helpful assistant." }] }
];

const chat = model.startChat({ history });

async function generateImage(prompt: string): Promise<void> {
  console.log("🎨 Generating image...");

  const result = await imageModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "image/png" }
  });

  const candidate = result.response?.candidates?.[0];
  const part = candidate?.content?.parts?.[0];
  const base64 = part?.inlineData?.data;
  if (!base64) {
    console.error("❌ Failed to generate image.");
    return;
  }

  const buffer = Buffer.from(base64, "base64");
  const fileName = `image-${Date.now()}.png`;
  fs.writeFileSync(fileName, buffer);

  console.log(`✅ Image saved as ${fileName}\n`);
}

async function run(): Promise<void> {
  console.log("💬 Gemini Chat with Image Support (type 'exit' to quit)\n");

  while (true) {
    const prompt = input("You: ");
    if (prompt.toLowerCase() === "exit") {
      const formattedHistory = history
        .map((msg) => {
          const partText = msg.parts?.[0]?.text ?? "";
          return `${msg.role.toUpperCase()}: ${partText}`;
        })
        .join("\n\n");
      fs.writeFileSync("chat-history.txt", formattedHistory);
      console.log("💾 Chat history saved to chat-history.txt");
      break;
    }

    // Image command
    if (prompt.startsWith("/image ")) {
      const imgPrompt = prompt.replace("/image ", "").trim();
      await generateImage(imgPrompt);
      continue;
    }

    // Normal chat
    history.push({ role: "user", parts: [{ text: prompt }] });
    const result = await chat.sendMessage(prompt);
    const reply = result.response.text();
    console.log("Gemini:", reply, "\n");
    history.push({ role: "model", parts: [{ text: reply }] });
  }
}

run();
