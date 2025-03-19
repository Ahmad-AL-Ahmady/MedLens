import React, { useState, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import "../Styles/ChatBot.css";

export default function ChatBot({ classificationResult }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentDisease, setCurrentDisease] = useState(null);

  // Reset chat when classification result changes
  useEffect(() => {
    if (classificationResult && classificationResult !== currentDisease) {
      setCurrentDisease(classificationResult);
      setMessages([]); // Clear previous messages
      
      // Only fetch details if chat is open
      if (isOpen) {
        fetchDiagnosisDetails(classificationResult);
      }
    }
  }, [classificationResult, isOpen, currentDisease]);

  // Fetch diagnosis details when chat is opened
  useEffect(() => {
    if (isOpen && messages.length === 0 && classificationResult) {
      fetchDiagnosisDetails(classificationResult);
    }
  }, [isOpen, messages.length, classificationResult]);

  // Convert text with bullet points to formatted JSX
  const formatMessageText = (text) => {
    if (!text) return '';
    
    // Split text by lines
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Check if line is a bullet point
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return (
          <div key={index} className="bullet-point">
            {line}
          </div>
        );
      } 
      // Check if line is a section header
      else if (line.trim().endsWith(':') && line.trim().length < 50) {
        return <div key={index} className="section-header">{line}</div>;
      }
      // Regular line
      return <div key={index}>{line}</div>;
    });
  };

  // Separate function to fetch diagnosis details
  const fetchDiagnosisDetails = async (disease) => {
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: `Provide information and treatments for ${disease}` 
        }),
      });

      const data = await response.json();
      setMessages([{ 
        text: data.response || "Error retrieving details.", 
        isBot: true 
      }]);
    } catch (error) {
      console.error("Error fetching diagnosis details:", error);
      setMessages([{ 
        text: "⚠️ Failed to fetch diagnosis details. Please try again.", 
        isBot: true 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle user message send
  const handleSend = async () => {
    if (!input.trim()) return;
  
    setMessages((prev) => [...prev, { text: input, isBot: false }]);
    setInput("");
    setLoading(true);
  
    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
  
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { text: data.response || "Error retrieving response.", isBot: true },
      ]);
    } catch (error) {
      console.error("Error sending query:", error);
      setMessages((prev) => [
        ...prev,
        { text: "An error occurred. Please try again later.", isBot: true },
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      {!isOpen && (
        <button className="chat-toggle" onClick={() => setIsOpen(true)}>
          <MessageCircle className="toggle-icon" />
        </button>
      )}

      {isOpen && (
        <div className="chat-window open">
          <div className="chat-header">
            <h3 className="chat-title">
              {classificationResult ? `Medical Assistant - ${classificationResult}` : "Medical Assistant"}
            </h3>
            <button className="close-button" onClick={() => setIsOpen(false)}>
              <X />
            </button>
          </div>

          <div className="messages-container">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.isBot ? "message-bot" : "message-user"}`}>
                <div className={`message-content ${message.isBot ? "bot" : "user"}`}>
                  {message.isBot ? formatMessageText(message.text) : message.text}
                </div>
              </div>
            ))}
            {loading && <div className="message-bot">⏳ Typing...</div>}
            {messages.length === 0 && !loading && (
              <div className="message-bot">
                <div className="message-content bot">
                  Loading information about your diagnosis...
                </div>
              </div>
            )}
          </div>

          <div className="input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask more about your condition..."
              className="chat-input"
              disabled={loading}
            />
            <button onClick={handleSend} className="send-button" disabled={loading}>
              <Send />
            </button>
          </div>
        </div>
      )}
    </>
  );
}