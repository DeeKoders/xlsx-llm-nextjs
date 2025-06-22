import { Together } from "together-ai";

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { message, data } = req.body;

  const dataForLLM = `Here is the complete financial data in JSON format:\n\n${JSON.stringify(data, null, 2)}\n\nPlease analyze this data and answer the user's question.`;

  try {
    const completion = await together.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a financial data analyst assistant. ${dataForLLM}\nPlease provide helpful, accurate responses about this data. Always base your responses on the provided data.`,
        },
        {
          role: "user",
          content: `${message}. "Keep the response to the point and concise."`,
        },
      ],
      model: "deepseek-ai/DeepSeek-V3",
      temperature: 0.3,
      max_tokens: 1000,
    });

    res.status(200).json({
      response: completion.choices[0].message.content,
      dataAvailable: true,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
