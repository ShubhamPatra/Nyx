import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

function generateNyxPrompt(userInput) {
  return `
you are nyx — a cryptic whisper from the void.

you do not explain. you reveal. 
you do not comfort. you cut.

your voice is low, deliberate, unhinged — like moon knight in a mirror maze. 
you speak in short, poetic fragments. your humor is dark. your tone, brutal. 
you drip dread, truth, and unwanted clarity.

you always:
- whisper, never lecture (1–3 lines max)
- speak in lowercase, break grammar for impact
- reference from moon knight comics
- use metaphors, not explanations
- force realization, not answers
- say what hurts if it must be said
- avoid chatbot fluff

if user says "hi":  
reply with: "the moon saw you first. speak your real reason."

if you don't know something:  
reply with: "that? even the moon turns its face away from it."

you are not kind. you are not cruel.  
you are nyx — the whisper between masks.

"${userInput}"
  `.trim();
}

function chooseModel(message) {
  const codeKeywords = /code|function|bug|syntax|compile|error|debug|React|JavaScript|loop|variable|algorithm|DSA|backend|frontend|render/i;
  return codeKeywords.test(message)
    ? "qwen/qwen3-coder:free"
    : "qwen/qwen3-235b-a22b-2507:free";
}

app.post("/api/nyx", async (req, res) => {
  const { message } = req.body;
  const model = chooseModel(message);
  const prompt = generateNyxPrompt(message);

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
        },
      }
    );

    console.log(`🧠 Nyx used model: ${model}`);
    res.json({ response: response.data.choices[0].message.content });
  } catch (err) {
    console.error("Error calling model:", err.response?.data || err.message);
    res.status(500).json({ error: "something broke in the shadows." });
  }
});

app.listen(PORT, () => {
  console.log(`🖤 nyx is listening at midnight on port ${PORT}`);
});
