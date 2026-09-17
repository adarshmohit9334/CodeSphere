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
  const [isListening, setIsListening] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [attachments, setAttachments] = useState([]);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

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
        return <strong key={i} className="ai-md-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="ai-md-code">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Handle Voice Input (Speech-to-Text)
  const handleVoiceInput = () => {
    if (isListening) {
      stopRecording();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; 

    let finalTranscript = inputPrompt;

    recognition.onstart = () => {
      setIsListening(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let tempFinal = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          tempFinal += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      finalTranscript = finalTranscript + tempFinal;
      setInputPrompt(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      cleanupRecording();
    };

    recognition.onend = () => {
      cleanupRecording();
    };

    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    cleanupRecording();
  };

  const cancelRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setInputPrompt(""); // Clear out what they were saying if they cancel
    cleanupRecording();
  };

  const cleanupRecording = () => {
    setIsListening(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStopAndSend = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    cleanupRecording();
    setTimeout(() => {
      handleSendMessage();
      const ta = document.querySelector(".ai-prompt-input-modern");
      if (ta) ta.style.height = "auto";
    }, 150);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Handle File Attachments
  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            isImage,
            dataUrl: e.target.result, // base64 or text string
          }
        ]);
      };
      
      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
    // Reset file input
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Prompt Submission
  const handleSendMessage = async (promptText) => {
    const textToSend = promptText || inputPrompt;
    if (!textToSend.trim() && attachments.length === 0 || isLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: textToSend || (attachments.length > 0 ? "[Sent Attachments]" : ""),
      attachments: attachments.map(a => ({ name: a.name, type: a.type }))
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    const currentAttachments = [...attachments];
    setAttachments([]);
    setIsLoading(true);

    try {
      // Call Backend API Endpoint
      const response = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          fileName: selectedFile,
          codeContext: currentCode,
          chatHistory: messages,
          attachments: currentAttachments
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
            text: `### 🤖 CodeSphere AI Offline Response\n\nThe server is offline. Here is a simulated response:`,
            codeSnippet: `// Simulated CodeSphere response for: ${textToSend}\nfunction solution() {\n  console.log("Executed successfully!");\n}`,
            languageTag: "javascript"
          }
        ]);
      }, 600);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="sidebar ai-assistant-panel modern-ai-panel">
      {/* AI HEADER */}
      <div className="ai-header-minimal">
        <div className="ai-brand-minimal">
          <span className="ai-brand-icon">✧</span>
          <span className="ai-brand-text">CodeSphere AI</span>
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
      </div>

      {/* CHAT MESSAGES CONTAINER */}
      <div className="ai-chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message-row ${msg.sender}`}>
            {msg.sender === "ai" && (
              <div className="ai-avatar">✧</div>
            )}

            <div className={`message-content ${msg.sender}-content`}>
              <div className="message-body">
                {/* Render Attachments in chat history */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="chat-message-attachments">
                    {msg.attachments.map((att, idx) => (
                      <div key={idx} className="chat-attachment-bubble">
                        <span className="att-icon">📎</span> {att.name}
                      </div>
                    ))}
                  </div>
                )}

                {msg.sender === "ai" ? (
                  renderFormattedText(msg.text)
                ) : (
                  <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>{msg.text}</p>
                )}

                {/* CODE SNIPPET BOX */}
                {msg.codeSnippet && (
                  <div className="ai-code-block">
                    <div className="code-block-header">
                      <span className="code-lang">
                        {msg.languageTag || "code"}
                      </span>
                      <div className="block-actions">
                        <button
                          className="btn-code-action insert"
                          onClick={() => onInsertCode(msg.codeSnippet)}
                          title="Insert at cursor"
                        >
                          📥 Insert
                        </button>
                        <button
                          className="btn-code-action"
                          onClick={() => handleCopyCode(msg.codeSnippet, msg.id)}
                          title="Copy Code"
                        >
                          {copiedId === msg.id ? "✓ Copied!" : "📋 Copy"}
                        </button>
                      </div>
                    </div>
                    <pre className="code-block-content">
                      {msg.codeSnippet}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat-message-row ai">
            <div className="ai-avatar">✧</div>
            <div className="message-content ai-content">
              <div className="ai-typing-modern">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* PROMPT INPUT BAR */}
      <div className="ai-input-container">
        <div className={`ai-input-pill ${isListening ? "recording-active" : ""}`}>
          
          {/* RECORDING BANNER */}
          {isListening && (
            <div className="recording-banner">
              <div className="recording-indicator">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="recording-mic-icon">
                  <rect x="9" y="2" width="6" height="11" rx="3" ry="3"></rect>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                <span className="recording-text">Recording...</span>
              </div>
              <div className="recording-actions">
                <span className="recording-time">{formatTime(recordingTime)}</span>
                <button className="recording-stop-btn" onClick={stopRecording} title="Stop Recording">
                  <div className="stop-square"></div>
                </button>
                <button className="recording-cancel-btn" onClick={cancelRecording} title="Cancel">
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* ATTACHMENTS PREVIEW */}
          {attachments.length > 0 && (
            <div className="ai-attachments-preview">
              {attachments.map((att, idx) => (
                <div key={idx} className="ai-attachment-chip">
                  {att.isImage ? (
                    <img src={att.dataUrl} alt="preview" className="att-thumb" />
                  ) : (
                    <span className="att-icon">📄</span>
                  )}
                  <span className="att-name">{att.name}</span>
                  <button className="att-remove-btn" onClick={() => removeAttachment(idx)}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="ai-input-row">
            {!isListening && (
              <>
                <button className="ai-attach-btn" onClick={handleAttachClick} title="Attach context">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                  </svg>
                </button>
                <input 
                  type="file" 
                  multiple 
                  ref={fileInputRef} 
                  style={{ display: "none" }} 
                  onChange={handleFileChange}
                />
              </>
            )}
            <textarea
              className="ai-prompt-input-modern"
              placeholder={isListening ? "Listening..." : "Ask anything, @ to mention, / for actions"}
              rows={1}
            value={inputPrompt}
            onChange={(e) => {
              setInputPrompt(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
                e.target.style.height = "auto";
              }
            }}
          />
          {isListening ? (
            <button 
              className="ai-mic-btn-large"
              onClick={handleStopAndSend}
              title="Stop and Send"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="11" rx="3" ry="3"></rect>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>
          ) : (
            <>
              <button 
                className="ai-mic-btn" 
                onClick={handleVoiceInput}
                title="Voice Typing (Mic)"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </button>
              <button
                className={`ai-send-btn-modern ${inputPrompt.trim() && !isLoading ? "active" : ""}`}
                onClick={() => {
                  handleSendMessage();
                  const ta = document.querySelector(".ai-prompt-input-modern");
                  if (ta) ta.style.height = "auto";
                }}
                disabled={isLoading || !inputPrompt.trim()}
              >
                ↑
              </button>
            </>
          )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default AiAssistantPanel;
