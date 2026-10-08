import express from 'express';

const router = express.Router();

const SYSTEM_INSTRUCTION =
  "You are ShipBot, a savvy logistics and negotiation expert for the ShipSpace platform. " +
  "Help users with logistics, container space, pricing, route planning, and negotiation. " +
  "Give practical, concise advice. When discussing a quote, explain what is included, " +
  "what fees may be hidden, and what the user can negotiate.";

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    configured: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

router.post('/', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        message: 'ShipBot is not configured. Add GEMINI_API_KEY to the backend environment.',
      });
    }

    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];

    if (!messages.length) {
      return res.status(400).json({ message: 'No chat messages were provided.' });
    }

    const contents = messages
      .slice(-20)
      .map((message) => ({
        role: message.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(message.text || '').trim() }],
      }))
      .filter((message) => message.parts[0].text);

    if (!contents.length) {
      return res.status(400).json({ message: 'No valid chat message was provided.' });
    }

    if (contents[0].role === 'model') {
      contents.shift();
    }

    if (!contents.length || contents[contents.length - 1].role !== 'user') {
      return res.status(400).json({ message: 'The latest chat message must come from the user.' });
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
          contents,
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
    res.status(500).json({
      message: 'Unable to contact ShipBot right now. Please try again.',
    });
  }
});

export default router;
