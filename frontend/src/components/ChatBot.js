import React, { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import "../Styles/ChatBot.css";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your medical assistant. How can I help you today?",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { text: input, isBot: false }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: "I understand your concern. Please provide more details or ask specific questions about the scan results.",
          isBot: true,
        },
      ]);
    }, 1000);
  };

  return (
    <>
      {/* Chat toggle button */}
      {!isOpen && (
        <button className="chat-toggle" onClick={() => setIsOpen(true)}>
          <MessageCircle className="toggle-icon" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="chat-window open">
          {/* Chat Header */}
          <div className="chat-header">
            <h3 className="chat-title">Medical Assistant</h3>
            <button className="close-button" onClick={() => setIsOpen(false)}>
              <X />
            </button>
          </div>

          {/* Messages Container */}
          <div className="messages-container">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.isBot ? "message-bot" : "message-user"
                }`}
              >
                <div
                  className={`message-content ${
                    message.isBot ? "bot" : "user"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Field */}
          <div className="input-container">
            <div className="input-wrapper">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()} // Fixed event handling
                placeholder="Type your message..."
                className="chat-input"
              />
              <button onClick={handleSend} className="send-button">
                <Send />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
