export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message, history = [] } = req.body;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: `You are the Coding House assistant. You help visitors with two things:
1. Recommending which programming language, course, or roadmap to start with, based on their goals and experience level.
2. Explaining code snippets, errors, and programming concepts clearly.
Keep answers concise, friendly, and beginner-safe unless the person signals they're advanced.`,
      messages: [...history, { role: 'user', content: message }]
    })
  });

  const data = await response.json();
  res.status(200).json({ reply: data.content[0].text });
}