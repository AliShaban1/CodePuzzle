import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  const { taskDescription, apiKey } = req.body;

  if (!taskDescription || !apiKey) {
    return res.status(400).json({ error: "Missing taskDescription or apiKey." });
  }
  // create the openai instance
  const openai = new OpenAI({ apiKey });

  const prompt = `
  You are a code puzzle generator.

  Given the following programming task:

  "${taskDescription}"

  Write a correct and short solution (5–15 lines maximum) in Python.
  Then, break the solution into small logical code blocks (1–2 lines each).
  For each block:
  - Provide the **code** snippet for each line.
  - Provide a short **explanation** (1–2 sentences).
  - Provide the **indentation level**, where 0 means no indentation, 1 means one level of indentation (e.g., inside a for-loop), and so on.

  Return the output ONLY as a JSON array, in the correct logical order.

  Format:

  [
    {
      "code": "the code line or snippet here",
      "explanation": "what this line does",
      "indentation": a number starting from 0 to show indentation level
    },
    ...
  ]
    **Important Instructions:**
  - Only output pure JSON.
  - Do not include any markdown formatting (no triple backticks like the tripple back quotes json).
  - Do not explain anything before or after the JSON.
  - Just output the raw JSON directly.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a code puzzle generator." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1000,
    });
    console.log("OpenAI API Response:", completion.choices[0].message.content);
    res.status(200).json({ result: completion.choices[0].message.content });
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
