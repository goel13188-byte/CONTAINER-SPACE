import React, { useState } from 'react';
import api from '../services/api';

// System instruction is now kept on the backend.
// The Gemini API key is never exposed in the frontend.

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hi! I am ShipBot. Ask me about logistics or how to get the best price for your shipment.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => setIsOpen((v) => !v);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { sender: 'user', text: trimmed };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = newMessages
        .filter((msg) => msg.text && (msg.sender === 'user' || msg.sender === 'bot'))
        .slice(-8)
        .map((msg) => ({
          role: msg.sender === 'bot' ? 'model' : 'user',
          text: msg.text,
        }));

      const { data } = await api.post('/chat', {
        messages: chatHistory,
      }, { timeout: 30000 });

      const botResponse =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Sorry, I could not generate a response. Please try again.';

      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: botResponse },
      ]);
    } catch (error) {
      console.error('Chatbot request failed:', error);
      const message = error?.response?.data?.message
        || (error?.code === 'ECONNABORTED'
          ? 'ShipBot is taking too long to respond. Please try again.'
          : 'Chatbot is temporarily unavailable. Please try again.');

      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: message },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
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
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading || !input.trim()}>
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
