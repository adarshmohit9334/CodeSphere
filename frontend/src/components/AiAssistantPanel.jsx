import { useState, useRef, useEffect } from "react";

function AiAssistantPanel({ selectedFile, currentCode, onInsertCode }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: `Hello! I am your **CodeSphere AI Assistant** 🚀 (Powered by Real Gemini LLM). Ask me anything — write code in Java, Python, JavaScript, C++, explain logic, or debug errors!`,
      codeSnippet: null,
      languageTag: null
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Copy helper with feedback badge
  const handleCopyCode = (snippet, msgId) => {
    navigator.clipboard.writeText(snippet);
    setCopiedId(msgId);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Simple Markdown Formatter Helper
  const renderFormattedText = (rawText = "") => {
    if (!rawText) return null;

    // Split by line breaks
    const lines = rawText.split("\n");
    return lines.map((line, idx) => {
      // Headings (### or ## or #)
      if (line.startsWith("### ")) {
        return <h4 key={idx} style={{ color: "#58a6ff", margin: "10px 0 6px 0", fontSize: "14px", fontWeight: "700" }}>{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ") || line.startsWith("# ")) {
        return <h3 key={idx} style={{ color: "#79c0ff", margin: "12px 0 6px 0", fontSize: "15px", fontWeight: "800" }}>{line.replace(/^#+\s*/, "")}</h3>;
      }

      // Bullet items
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const itemText = line.trim().replace(/^[-*]\s*/, "");
        return (
          <li key={idx} style={{ marginLeft: "14px", marginBottom: "4px", fontSize: "13px", lineHeight: "1.5" }}>
            {parseInlineMarkdown(itemText)}
          </li>
        );
      }

      if (!line.trim()) {
        return <div key={idx} style={{ height: "6px" }} />;
      }

      return (
        <p key={idx} style={{ margin: "0 0 6px 0", fontSize: "13px", lineHeight: "1.55" }}>
          {parseInlineMarkdown(line)}
        </p>
      );
    });
  };

  // Helper for inline bold (**text**) and code (`code`)
  const parseInlineMarkdown = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ color: "#f0f6fc", fontWeight: "700" }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} style={{ background: "rgba(110, 118, 129, 0.25)", color: "#79c0ff", padding: "1px 6px", borderRadius: "4px", fontSize: "12px", fontFamily: "monospace" }}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Handle Prompt Submission
  const handleSendMessage = async (promptText) => {
    const textToSend = promptText || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsLoading(true);

    try {
      // Call Backend API Endpoint
      const response = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          fileName: selectedFile,
          codeContext: currentCode
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: data.reply,
            codeSnippet: data.codeSnippet || null,
            languageTag: data.languageTag || "code"
          }
        ]);
      } else {
        throw new Error("Failed backend response");
      }
    } catch {
      // Offline Fallback Generator
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: `### 🤖 CodeSphere AI Response for: "${textToSend}"\nHere is the requested solution:`,
            codeSnippet: `// Solution for: ${textToSend}\nfunction solution() {\n  console.log("Executed successfully!");\n}`,
            languageTag: "javascript"
          }
        ]);
      }, 600);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="sidebar ai-assistant-panel">
      {/* AI HEADER */}
      <div className="sidebar-header ai-header">
        <div className="ai-title-row">
          <span className="ai-sparkle-icon">🤖</span>
          <div>
            <h3>AI ASSISTANT</h3>
            <span className="ai-engine-badge">Gemini AI Engine ⚡</span>
          </div>
        </div>
      </div>

      {/* QUICK PRESET CHIPS */}
      <div className="ai-preset-chips">
        <button
          className="chip"
          onClick={() => handleSendMessage(`Explain the code in ${selectedFile || "App.jsx"}`)}
        >
          💡 Explain Code
        </button>
        <button
          className="chip"
          onClick={() => handleSendMessage(`Debug and fix errors in ${selectedFile || "App.jsx"}`)}
        >
          🐛 Debug &amp; Fix
        </button>
        <button
          className="chip"
          onClick={() => handleSendMessage(`Give me a complete Java program with main class`)}
        >
          ☕ Java Code
        </button>
        <button
          className="chip"
          onClick={() => handleSendMessage(`Add comments to ${selectedFile || "App.jsx"}`)}
        >
          📝 Add Comments
        </button>
      </div>

      {/* CHAT MESSAGES CONTAINER */}
      <div className="ai-chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.sender}`}>
            <div className="message-header">
              <span className="sender-name">
                {msg.sender === "ai" ? "🤖 CodeSphere AI" : "👤 You"}
              </span>
            </div>

            <div className="message-body">
              {msg.sender === "ai" ? (
                renderFormattedText(msg.text)
              ) : (
                <p style={{ margin: 0 }}>{msg.text}</p>
              )}

              {/* CODE SNIPPET BOX WITH BORDER & COPY / INSERT BUTTONS */}
              {msg.codeSnippet && (
                <div className="ai-code-block" style={{ border: "1px solid #30363d", borderRadius: "10px", marginTop: "12px", overflow: "hidden", background: "#0d1117" }}>
                  <div className="code-block-header" style={{ background: "#161b22", padding: "8px 12px", borderBottom: "1px solid #30363d", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#58a6ff", letterSpacing: "0.5px" }}>
                      ⚡ {(msg.languageTag || "code").toUpperCase()} SNIPPET
                    </span>
                    <div className="block-actions" style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="btn-code-action insert"
                        onClick={() => onInsertCode(msg.codeSnippet)}
                        title="Insert Code Into Editor"
                        style={{ padding: "4px 10px", fontSize: "11px", fontWeight: "700", background: "#238636", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                      >
                        📥 Insert
                      </button>
                      <button
                        className="btn-code-action"
                        onClick={() => handleCopyCode(msg.codeSnippet, msg.id)}
                        title="Copy Code to Clipboard"
                        style={{
                          padding: "4px 10px",
                          fontSize: "11px",
                          fontWeight: "700",
                          background: copiedId === msg.id ? "#238636" : "#21262d",
                          color: copiedId === msg.id ? "#ffffff" : "#c9d1d9",
                          border: "1px solid #30363d",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        {copiedId === msg.id ? "✓ Copied!" : "📋 Copy"}
                      </button>
                    </div>
                  </div>
                  <pre className="code-block-content" style={{ padding: "12px", margin: 0, overflowX: "auto", fontFamily: "Consolas, Monaco, monospace", fontSize: "12.5px", color: "#e6edf3", lineHeight: "1.5" }}>
                    {msg.codeSnippet}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat-message ai loading">
            <div className="ai-typing">
              <span>●</span>
              <span>●</span>
              <span>●</span>
              <span className="typing-text">Gemini AI is generating response...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* PROMPT INPUT BAR */}
      <div className="ai-input-form">
        <textarea
          className="ai-prompt-input"
          placeholder={`Ask AI anything (e.g. "Give me Java code", "Explain code", "Create counter")...`}
          rows={2}
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button
          className="ai-send-btn"
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputPrompt.trim()}
        >
          ➔
        </button>
      </div>
    </aside>
  );
}

export default AiAssistantPanel;
