import { Together } from "together-ai";
import fs from "fs";
import path from "path";

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

// Load extractedData from ./extractedData.json
let extractedData = null;
try {
  const dataPath = path.join(process.cwd(), "extractedData.json");
  if (fs.existsSync(dataPath)) {
    extractedData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  }
} catch (err) {
  extractedData = null;
}
let dataContext = "";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { message, includeRawData = false } = req.body;

  if (!extractedData) return res.status(400).json({ error: "No data loaded" });
  if (!message) return res.status(400).json({ error: "Message is required" });

  const dataForLLM = includeRawData
    ? `Here is the complete financial data in JSON format:\n\n${JSON.stringify(extractedData, null, 2)}\n\nPlease analyze this data and answer the user's question.`
    : dataContext;

  try {
    const completion = await together.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a financial data analyst assistant. ${dataForLLM}\nPlease provide helpful, accurate responses about this data. Always base your responses on the provided data.`,
        },
        {
          role: "user",
          content: `${message}. Instructions: 1. Take 0 as not paid/missing amount. 2. Keep the response to the point and concise.`,
        },
      ],
      model: "deepseek-ai/DeepSeek-V3",
      temperature: 0.3,
      max_tokens: 1000,
    });

    res.status(200).json({
      response: completion.choices[0].message.content,
      dataAvailable: true,
      usedRawData: includeRawData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
