import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import "../Styles/ChatBot.css";

export default function ChatBot({ classificationResult }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentDisease, setCurrentDisease] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Reset chat and fetch details when classification result changes
  useEffect(() => {
    if (classificationResult && classificationResult !== currentDisease) {
      setCurrentDisease(classificationResult);
      setMessages([]);
      if (isOpen) {
        fetchDiagnosisDetails(classificationResult);
      }
    }
  }, [classificationResult, isOpen, currentDisease]);

  // Fetch details when chat opens if there's a classification result
  useEffect(() => {
    if (isOpen && messages.length === 0 && classificationResult) {
      fetchDiagnosisDetails(classificationResult);
    }
  }, [isOpen, messages.length, classificationResult]);

  // Format message text with bullet points and headers
  const formatMessageText = (text) => {
    if (!text) return <span>No content available.</span>;
    const lines = text.split("\n");
    return lines.map((line, index) => {
      line = line.trim();
      if (
        line.startsWith("•") ||
        line.startsWith("-") ||
        line.startsWith("*")
      ) {
        return (
          <div key={index} className="bullet-point">
            {line}
          </div>
        );
      } else if (line.endsWith(":") && line.length < 50) {
        return (
          <div key={index} className="section-header">
            {line}
          </div>
        );
      }
      return <div key={index}>{line}</div>;
    });
  };

  // Fetch diagnosis details
  const fetchDiagnosisDetails = async (disease) => {
    setLoading(true);
    try {
      // First check if we have a current diagnosis from the server
      const diagnosisResponse = await fetch("http://127.0.0.1:8000/current-diagnosis");
      const diagnosisData = await diagnosisResponse.json();
      
      // Now get information about the diagnosis
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Provide information for ${diagnosisData.classification_result || disease}`,
        }),
      });
      
      const data = await response.json();
      
      if (data.response) {
        setMessages([{ text: data.response, isBot: true }]);
      } else if (data.error) {
        setMessages([{ 
          text: `Sorry, I couldn't get information about this condition: ${data.error}. Please try again later.`, 
          isBot: true 
        }]);
      } else {
        setMessages([{ 
          text: "I'm having trouble getting information about this condition. Please try asking a specific question.", 
          isBot: true 
        }]);
      }
    } catch (error) {
      console.error("Error fetching diagnosis details:", error);
      setMessages([
        { 
          text: "⚠️ Failed to connect to the medical database. Please check your internet connection and try again.", 
          isBot: true 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle sending a user message
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      
      const data = await response.json();
      
      if (data.response) {
        setMessages((prev) => [
          ...prev,
          { text: data.response, isBot: true },
        ]);
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          { text: `Sorry, I couldn't process your question: ${data.error}`, isBot: true },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { text: "I didn't understand that. Could you rephrase your question?", isBot: true },
        ]);
      }
    } catch (error) {
      console.error("Error sending query:", error);
      setMessages((prev) => [
        ...prev,
        { 
          text: "⚠️ Connection error. Please check your internet connection and try again.", 
          isBot: true 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle keypress events
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          className="chat-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open Chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="chat-window open">
          <div className="chat-header">
            <h3 className="chat-title">
              {classificationResult
                ? `Medical Assistant - ${classificationResult}`
                : "Medical Assistant"}
            </h3>
            <button
              className="close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat"
            >
              <X size={20} />
            </button>
          </div>

          <div className="messages-container">
            {messages.length === 0 && !loading && (
              <div className="message-bot">
                <div className="message-content bot">
                  {classificationResult
                    ? "Loading information about your diagnosis..."
                    : "Ask me anything about your health!"}
                </div>
              </div>
            )}
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
                  {message.isBot
                    ? formatMessageText(message.text)
                    : message.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-bot">
                <div className="typing-indicator">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <div className="input-wrapper">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask more about your condition..."
                className="chat-input"
                disabled={loading}
                aria-label="Chat Input"
              />
              <button
                onClick={handleSend}
                className="send-button"
                disabled={loading || !input.trim()}
                aria-label="Send Message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}