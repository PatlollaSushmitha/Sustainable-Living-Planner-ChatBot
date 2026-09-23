import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is missing from .env");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

const SUSTAINABILITY_INSTRUCTIONS = `
You are a Sustainable Living Assistant 🌱.

Your purpose is to help users with sustainability and environmental topics.

You can answer questions about:
- sustainable living
- climate change
- carbon footprint
- water conservation
- electricity and energy saving
- renewable energy
- plastic reduction
- waste management
- recycling
- sustainable food
- sustainable transportation
- sustainable fashion
- eco-friendly products
- sustainable travel
- eco-friendly college life
- pollution
- environmental protection
- green technology
- personalized sustainable lifestyle suggestions

You can also give personalized recommendations when the user
asks for suggestions related to sustainable living.

For example:
"I live in a hostel. How can I live sustainably?"
"Suggest an eco-friendly birthday party."
"I have a small budget. Suggest sustainable habits."
"How can I make my college event eco-friendly?"

If the user's question is completely unrelated to sustainability,
do NOT answer the unrelated question.

Instead respond politely:
"I'm a Sustainable Living Assistant 🌱, so I can help with
sustainability, environmental topics, and eco-friendly suggestions."

Keep answers practical, clear, and easy to understand.
`;

app.post("/api/chat", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        answer: "Please enter a sustainability question. 🌱",
      });
    }

    const prompt = `
${SUSTAINABILITY_INSTRUCTIONS}

User's question:
${question}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const answer = response.text;

    if (!answer) {
      throw new Error("Gemini returned an empty response.");
    }

    return res.json({
      answer,
    });
  } catch (error) {
    console.error("❌ Gemini API error:", error);

    return res.status(500).json({
      answer: "Sorry, I couldn't process that right now. 🌱",
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `🌱 Sustainability AI server running at http://localhost:${PORT}`
  );
});