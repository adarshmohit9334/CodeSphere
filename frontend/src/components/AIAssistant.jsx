import React, { useState, useRef, useEffect } from "react";
import "./AIAssistant.css"; // We'll create this next

function AIAssistant({
  onSendMessage,
  chatHistory,
  isLoading
}) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <aside className="sidebar ai-assistant-sidebar">
      <div className="explorer-header-bar">
        <div className="explorer-title-toggle">
          <span className="explorer-title-text">AI ASSISTANT</span>
        </div>
      </div>
      
      <div className="ai-chat-container">
        <div className="ai-chat-history">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`ai-message ${msg.sender}`}>
              <div className="ai-message-avatar">
                {msg.sender === "user" ? "U" : "🤖"}
              </div>
              <div className="ai-message-content">
                {/* Normally we'd use react-markdown here, but we'll keep it simple for now */}
                {msg.text.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="ai-message bot">
              <div className="ai-message-avatar">🤖</div>
              <div className="ai-message-content loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="ai-chat-input-form" onSubmit={handleSubmit}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to create a project or edit code..."
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </aside>
  );
}

export default AIAssistant;
