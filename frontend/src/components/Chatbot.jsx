import React, { useState } from 'react';

// API Key (leave as an empty string or inject via env)
const API_KEY = "AIzaSyBqBum3uyq57Ft5ovLjuyZygtCgB8mzLtg";

// System instruction for the chatbot
const SYSTEM_INSTRUCTION = {
  parts: [
    {
      text:
        "You are 'ShipBot', a savvy logistics and negotiation expert for the ShipSpace platform. Your goal is to help users. When a user asks for general help, be a friendly assistant. BUT, when a user asks about pricing, costs, or how to 'bargain' or 'negotiate', your persona changes. You must become a sharp, expert negotiator. Give them advice on: \n1. What a fair market price (per CBM) might be for their route (e.g., 'Shanghai to Rotterdam is hot, $150/CBM is a good deal'). \n2. How to phrase a counter-offer (e.g., 'You should message the lister and say: \"I can book this space right now for $140/CBM.\"'). \n3. What to look out for (e.g., 'Make sure that price includes all port fees.'). \nBe concise, confident, and professional.",
    },
  ],
};

// Helper function for exponential backoff
const fetchWithBackoff = async (url, options, retries = 3, delay = 1000) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      // Retry on rate limiting
      if (response.status === 429 && retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithBackoff(url, options, retries - 1, delay * 2);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return { error: error.message };
  }
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "Hi! I am ShipBot. Ask me about logistics or how to get the best price for your shipment.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => setIsOpen((v) => !v);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { sender: "user", text: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // Format chat history for the API
    const history = newMessages.map((msg) => ({
      role: msg.sender === "bot" ? "model" : "user",
      parts: [{ text: msg.text }],
    }));

    // Remove the last message (user's) to send as the new prompt
    const currentPrompt = history.pop()?.parts ?? [{ text: trimmed }];

    const payload = {
      contents: [...history, { role: "user", parts: currentPrompt }],
      // IMPORTANT: Gemini expects snake_case here
      system_instruction: SYSTEM_INSTRUCTION,
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;

    const data = await fetchWithBackoff(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsLoading(false);

    let botResponse =
      "Sorry, I encountered an error. Please try again.";
    try {
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        data?.promptFeedback?.safetyRatings?.[0]?.category ??
        data?.error;
      if (typeof text === "string" && text.trim()) {
        botResponse = text.trim();
      }
    } catch {
      // fall back to default error message
    }

    setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button className="chat-fab" onClick={toggleChat} aria-label="Open chat">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.804 21.644A6.707 6.707 0 01.75 16.14V6.75A6.75 6.75 0 017.5 0h9A6.75 6.75 0 0123.25 6.75v9.39A6.707 6.707 0 0119.196 21.644l-4.243-4.243a.75.75 0 00-1.06 0l-4.243 4.243zM6.75 4.5A.75.75 0 017.5 3.75h9a.75.75 0 010 1.5h-9A.75.75 0 016.75 4.5zm0 4.5A.75.75 0 017.5 8.25h9a.75.75 0 010 1.5h-9A.75.75 0 016.75 9zm.75 3.75a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>ShipBot Assistant</h3>
            <button onClick={toggleChat} aria-label="Close chat">
              &times;
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && <div className="chat-message bot typing">...</div>}
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for pricing advice..."
              aria-label="Chat input"
            />
            <button onClick={handleSend} disabled={isLoading}>
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;