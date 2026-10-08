import express from 'express';

const router = express.Router();

const SYSTEM_INSTRUCTION =
  "You are ShipBot, a savvy logistics and negotiation expert for the ShipSpace platform. " +
  "Help users with logistics, container space, pricing, and negotiation. " +
  "When discussing pricing, give practical negotiation advice, explain what to check in a quote, " +
  "and be concise, confident, and professional.";

router.post('/', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        message: 'Chatbot is not configured. Add GEMINI_API_KEY to the backend environment.',
      });
    }

    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];

    if (!messages.length) {
      return res.status(400).json({ message: 'No chat messages were provided.' });
    }

    const contents = messages.slice(-20).map((message) => ({
      role: message.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(message.text || '') }],
    })).filter((message) => message.parts[0].text.trim());

    if (!contents.length) {
      return res.status(400).json({ message: 'No valid chat message was provided.' });
    }

    // Gemini conversation history must begin with a user message.
    if (contents[0].role === 'model') {
      contents.shift();
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res.status(response.status).json({
        message: data?.error?.message || 'Gemini API request failed.',
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: 'Unable to contact the chatbot service.' });
  }
});

export default router;
