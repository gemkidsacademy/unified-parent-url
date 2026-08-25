import { useState, useRef, useEffect } from "react";
import "./DemoChatbot.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
const API_BASE_URL = "https://krishbackend-production-9603.up.railway.app";
const API_BASE_URL2 = "https://web-production-481a5.up.railway.app";

export default function DemoChatbot({ parentData, onBack }) {
  console.log("🔥🔥🔥 CURRENT DEMO CHATBOT COMPONENT IS RUNNING 🔥🔥🔥");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [conversationUuid, setConversationUuid] = useState(() => crypto.randomUUID());
  const [reasoningLevel, setReasoningLevel] = useState("simple");
  
  
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  
  const [playingAudioId, setPlayingAudioId] = useState(null);

  const audioCache = useRef({});
  const [loadingAudioId, setLoadingAudioId] = useState(null);
  
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showQuickTips, setShowQuickTips] = useState(false);
  const [studentContext, setStudentContext] = useState(null);
  const [studentContextLoading, setStudentContextLoading] = useState(true);
  const [studentContextError, setStudentContextError] = useState("");

  const chatEndRef = useRef(null);
  const cleanMarkdownSpacing = (text) => {
    if (!text) return "";

    return text
      // collapse 3+ newlines into 2
      .replace(/\n{3,}/g, "\n\n")
      // trim extra spaces at start/end
      .trim();
  };

  useEffect(() => {
    const loadStudentContext = async () => {
      if (!parentData?.email) {
        setStudentContextError(
          "Parent email is missing. Please return to the dashboard and log in again."
        );
        setStudentContextLoading(false);
        return;
      }

      try {
        setStudentContextLoading(true);
        setStudentContextError("");

        const response = await fetch(
          `${API_BASE_URL2}/chatbot/parent-context`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: parentData.email,
            }),
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Unable to load student information."
          );
        }

        setStudentContext(data);
      } catch (error) {
        setStudentContextError(
          error.message ||
            "Unable to load student information."
        );
      } finally {
        setStudentContextLoading(false);
      }
    };

    loadStudentContext();
  }, [parentData?.email]);

  // ------------------ Auto-scroll ------------------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  // ------------------ Welcome message ------------------
  useEffect(() => {
  if (!studentContext?.student_name) return;

  const fetchWelcomeQuote = async () => {
    // Show welcome card immediately
    setMessages([
      {
        sender: "bot",
        type: "welcome",
        welcomeText: `Welcome, Dear ${studentContext.student_name}!`,
        quote: null,
        author: "",
        footer: "How can I assist you today?",
      },
    ]);

    setIsLoadingQuote(true);

    try {
      const response = await fetch(`${API_BASE_URL2}/welcome-quote`, {
        method: "POST",
      });

      if (response.ok) {
        const quoteData = await response.json();

        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.type === "welcome"
              ? {
                  ...msg,
                  quote: quoteData.quote,
                  author: quoteData.author,
                }
              : msg
          );

          const alreadyExists = updated.some(
            (msg) =>
              msg.sender === "bot" &&
              msg.text === "How can I assist you today?"
          );

          if (!alreadyExists) {
            updated.push({
              sender: "bot",
              text: "How can I assist you today?",
              name: "Gem AI",
              links: [],
            });
          }

          return updated;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  fetchWelcomeQuote();
}, [studentContext?.student_name]);

  // ------------------ Timer effect ------------------
  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setMessages((prevMsg) => [
            ...prevMsg,
            { sender: "bot", text: "⏰ You should log in again." },
          ]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const isTimeUp = timeLeft === 0;

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (studentContextLoading) {
    return (
      <div className="demo-chatbot-page">
        <p>Loading chatbot...</p>
      </div>
    );
  }

  if (studentContextError) {
    return (
      <div className="demo-chatbot-page">
        <p>{studentContextError}</p>
      </div>
    );
  }

  // ------------------ Helpers ------------------
  const parseBoldText = (text) => {
    const regex = /\*\*(.+?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={lastIndex}>{text.slice(lastIndex, match.index)}</span>);
      }
      parts.push(<strong key={match.index}>{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
    }

    return parts;
  };

  

  // ------------------ Handle submit ------------------
  const handleSubmit = async (e) => {
    console.log("🔥🔥🔥 HANDLE SUBMIT FIRED 🔥🔥🔥");
  e.preventDefault();
  console.log("[CHATBOT DEBUG] input:", input);
  console.log("[CHATBOT DEBUG] isTimeUp:", isTimeUp);
  console.log("[CHATBOT DEBUG] studentContext:", studentContext);
  console.log("[CHATBOT DEBUG] API_BASE_URL:", API_BASE_URL);

  if (!input.trim() || isTimeUp) return;

  const userInput = input.trim();

  setMessages((prev) => [
    ...prev,
    { sender: "user", text: userInput },
  ]);

  setInput("");
  setIsWaiting(true);

  try {
    const url = `${API_BASE_URL}/search?query=${encodeURIComponent(
      userInput
    )}&reasoning=${encodeURIComponent(
      reasoningLevel
    )}&user_id=${encodeURIComponent(
      studentContext?.student_name || ""
    )}&conversation_uuid=${encodeURIComponent(
      conversationUuid
    )}&class_name=${encodeURIComponent(
      studentContext?.class_name || ""
    )}`;

    // ==========================================
    // CHATBOT REQUEST DEBUG
    // ==========================================

    console.log("==========================================");
    console.log("CHATBOT REQUEST DEBUG");
    console.log("==========================================");
    console.log("[CHATBOT] API_BASE_URL:", API_BASE_URL);
    console.log("[CHATBOT] Request URL:", url);
    console.log("[CHATBOT] User input:", userInput);
    console.log("[CHATBOT] reasoningLevel:", reasoningLevel);
    console.log("[CHATBOT] studentContext:", studentContext);
    console.log(
      "[CHATBOT] student_name:",
      studentContext?.student_name
    );
    console.log(
      "[CHATBOT] class_name:",
      studentContext?.class_name
    );
    console.log(
      "[CHATBOT] conversationUuid:",
      conversationUuid
    );
    console.log("==========================================");

    console.log("========== CHATBOT REQUEST ==========");
    console.log("[CHATBOT DEBUG] URL:", url);
    console.log("[CHATBOT DEBUG] userInput:", userInput);
    console.log("[CHATBOT DEBUG] reasoningLevel:", reasoningLevel);
    console.log("[CHATBOT DEBUG] studentContext:", studentContext);
    console.log("[CHATBOT DEBUG] conversationUuid:", conversationUuid);
    console.log("====================================");

    const response = await fetch(url);

    console.log("========== CHATBOT RESPONSE ==========");
    console.log("[CHATBOT DEBUG] status:", response.status);
    console.log("[CHATBOT DEBUG] ok:", response.ok);
    console.log("[CHATBOT DEBUG] url:", response.url);
    console.log("======================================");

    // ==========================================
    // CHATBOT RESPONSE DEBUG
    // ==========================================

    console.log("==========================================");
    console.log("CHATBOT RESPONSE DEBUG");
    console.log("==========================================");
    console.log("[CHATBOT] Response status:", response.status);
    console.log("[CHATBOT] Response OK:", response.ok);
    console.log("[CHATBOT] Response statusText:", response.statusText);
    console.log("[CHATBOT] Response URL:", response.url);
    console.log(
      "[CHATBOT] Content-Type:",
      response.headers.get("content-type")
    );
    console.log("==========================================");

    // Read response as TEXT first so we can see
    // exactly what the backend returned.
    const rawResponse = await response.text();

    console.log("==========================================");
    console.log("CHATBOT RAW BACKEND RESPONSE");
    console.log("==========================================");
    console.log(rawResponse);
    console.log("==========================================");

    if (!response.ok) {
      console.error(
        "[CHATBOT] Backend request failed:",
        response.status,
        rawResponse
      );

      throw new Error(
        `Backend returned status ${response.status}: ${rawResponse}`
      );
    }

    // ==========================================
    // PARSE RESPONSE
    // ==========================================

    let data;

    try {
      data = JSON.parse(rawResponse);

      console.log("==========================================");
      console.log("CHATBOT PARSED RESPONSE");
      console.log("==========================================");
      console.log(data);
      console.log("==========================================");
    } catch (parseError) {
      console.error(
        "[CHATBOT] Failed to parse backend response as JSON:",
        parseError
      );

      throw parseError;
    }

    console.log("========== answer_markdown ==========");
    console.log(data.answer_markdown);

    console.log("========== JSON STRING ==========");
    console.log(JSON.stringify(data.answer_markdown));

    let botMessage;

    if (Array.isArray(data)) {
      const firstItem = data[0] || {};

      botMessage = {
        sender: "bot",
        text: cleanMarkdownSpacing(
          firstItem.snippet ||
            "Sorry, I couldn't generate a response."
        ),
        name: firstItem.name
          ? firstItem.name.replace(/\*\*/g, "")
          : "Gem AI",
        links: Array.isArray(firstItem.links)
          ? firstItem.links
          : [],
      };
    } else {
      botMessage = {
        sender: "bot",
        text: cleanMarkdownSpacing(
          data.answer_markdown ||
            "Sorry, I couldn't generate a response."
        ),
        name: data.source_name || "Gem AI",
        links: Array.isArray(data.links)
          ? data.links
          : [],
        pdfs: Array.isArray(data.pdfs)
          ? data.pdfs
          : [],
        messageId: data.message_id,
      };
    }

    setMessages((prev) => [
      ...prev,
      botMessage,
    ]);

  } catch (error) {
    console.error("==========================================");
    console.error("CHATBOT ERROR DEBUG");
    console.error("==========================================");
    console.error("[CHATBOT] Error:", error);
    console.error("[CHATBOT] Message:", error?.message);
    console.error("[CHATBOT] Stack:", error?.stack);
    console.error("==========================================");

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: "Sorry, something went wrong while fetching results.",
        links: [],
      },
    ]);
  } finally {
    setIsWaiting(false);
  }
};

  const playAudio = async (messageId) => {
  try {
    const cachedAudio = audioCache.current[messageId];

    // ---------------------------------------
    // Audio already exists in cache
    // ---------------------------------------
    if (cachedAudio) {
      if (!cachedAudio.paused) {
        // Pause current audio
        cachedAudio.pause();
        setPlayingAudioId(null);
      } else {
        // Resume current audio
        await cachedAudio.play();
        setPlayingAudioId(messageId);
      }
      return;
    }

    // ---------------------------------------
    // Pause any other audio that is playing
    // ---------------------------------------
    Object.entries(audioCache.current).forEach(([id, audio]) => {
      if (Number(id) !== messageId && !audio.paused) {
        audio.pause();
      }
    });

    setLoadingAudioId(messageId);

    // ---------------------------------------
    // Generate audio from backend
    // ---------------------------------------
    const response = await fetch(`${API_BASE_URL}/chatbot/audio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message_id: messageId,
      }),
    });

    if (!response.ok) {
      throw new Error("Unable to generate audio.");
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = new Audio(audioUrl);

    // Save in cache
    audioCache.current[messageId] = audio;

    setPlayingAudioId(messageId);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      delete audioCache.current[messageId];
      setPlayingAudioId(null);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      delete audioCache.current[messageId];
      setPlayingAudioId(null);
    };

    await audio.play();

  } catch (err) {
    console.error(err);
    alert("Unable to play audio.");
  } finally {
    setLoadingAudioId(null);
  }
};

  return (
    <div className="chat-container">
      <div className="bg-img bg-img-1"></div>
      <div className="bg-img bg-img-2"></div>
      <div className="bg-img bg-img-3"></div>
      <div className="bg-img bg-img-4"></div>

      <div
        className="chat-box"
        style={{
          width: "82%",
          maxWidth: "1500px",
          margin: "20px auto",
        }}
      >
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-logo-wrap">
              <img
                src="https://gemkidsacademy.com.au/wp-content/uploads/2024/11/Frame-1707478212.svg"
                alt="Gem Kids Logo"
                className="chat-logo"
              />
            </div>
            <span className="chat-title">Gem AI Chatbot</span>
          </div>

          <div className="chat-header-right">
            <button
              type="button"
              className="quick-tips-btn"
              onClick={() => setShowQuickTips((prev) => !prev)}
            >
              💡 Quick Tips
            </button>
            <span className="chat-timer">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Quick Tips Overlay */}
        {/* Quick Tips Overlay */}
        {showQuickTips && (
          <div className="quick-tips-overlay">
            <div className="quick-tips-card">

              <div className="quick-tips-header">
                <div className="quick-tips-title">
                  💡 Quick Tips
                </div>

                <button
                  className="quick-tips-close"
                  onClick={() => setShowQuickTips(false)}
                  aria-label="Close Quick Tips"
                >
                  ×
                </button>
              </div>

              <div className="quick-tips-body">

                <div className="quick-tip-item">
                  <div className="quick-tip-icon">
                    💬
                  </div>

                  <div className="quick-tip-text">
                    <div className="quick-tip-heading">
                      1. Chatbot doesn't remember what is discussed above.
                    </div>

                    <div className="quick-tip-subtext">
                      Always provide context in every chat.
                    </div>
                  </div>
                </div>

                <div className="quick-tip-item">
                  <div className="quick-tip-icon">
                    ⚙️
                  </div>

                  <div className="quick-tip-text">
                    <div className="quick-tip-heading">
                      2. If you need elaborate response,
                    </div>

                    <div className="quick-tip-subtext">
                      please use the Reasoning dropdown on the bottom right.
                    </div>
                  </div>
                </div>
                <div className="usage-notice">

                  <div className="usage-notice-title">
                    ⚠️ Usage Notice
                  </div>

                  <div className="usage-notice-text">
                    Use <strong>Gem AI</strong> responsibly. Chats are monitored by
                    Gem Kids Academy administrators. Inappropriate use or abusive
                    language may lead to restricted access and escalation to parents.
                  </div>

                </div>

              </div>

            </div>
          </div>
        )}

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender}`}>
              {msg.sender === "bot" ? (
                  <>
  {msg.type === "welcome" ? (
    <div
      style={{
        background: "#fff",
        borderRadius: "18px",
        padding: "28px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        border: "1px solid #ececec",
        marginBottom: "15px",
      }}
    >
      <div
        style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#222",
          marginBottom: "22px",
        }}
      >
        {msg.welcomeText}
      </div>

      <div
        style={{
          color: "#f97316",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          fontSize: "13px",
          marginBottom: "18px",
        }}
      >
        Quote of the Day
      </div>

      {msg.quote ? (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "18px",
          }}
        >
          <div
            style={{
              width: "5px",
              background: "#f97316",
              borderRadius: "6px",
              alignSelf: "stretch",
            }}
          />

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "22px",
                fontStyle: "italic",
                color: "#374151",
                lineHeight: "1.6",
              }}
            >
              “{msg.quote}”
            </div>

            <div
              style={{
                textAlign: "right",
                marginTop: "16px",
                color: "#6b7280",
                fontWeight: "500",
                fontSize: "18px",
              }}
            >
              — {msg.author}
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "18px 0",
          }}
        >
          <div className="spinner"></div>

          <span
            style={{
              color: "#6b7280",
              fontStyle: "italic",
              fontSize: "18px",
            }}
          >
            Loading today's inspirational quote...
          </span>
        </div>
      )}

      
    </div>
  ) : (
    <>
          {msg.name && <div className="bot-label">{msg.name}</div>}

          <div className="bot-markdown">
            <div
                style={{
                    lineHeight: 1.45,
                    fontSize: "15px",
                }}
            >
                {(() => {
                    console.log("========== RAW msg.text ==========");
                    console.log(msg.text);

                    console.log("========== JSON ==========");
                    console.log(JSON.stringify(msg.text));

                    console.log("========== LINES ==========");
                    console.log(msg.text.length);
                    msg.text.split("\n").forEach((line, index) => {
                        console.log(index + ":", JSON.stringify(line));
                    });

                    return null;
                })()}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                      h1: ({node, ...props}) => (
                          <h1 {...props} style={{ margin: "8px 0 6px", lineHeight: 1.3 }} />
                      ),
                      h2: ({node, ...props}) => (
                          <h2 {...props} style={{ margin: "8px 0 6px", lineHeight: 1.3 }} />
                      ),
                      h3: ({node, ...props}) => (
                          <h3 {...props} style={{ margin: "8px 0 6px", lineHeight: 1.3 }} />
                      ),
                      p: ({node, ...props}) => (
                          <p {...props} style={{ margin: "6px 0" }} />
                      ),
                      ul: ({node, ...props}) => (
                          <ul
                              {...props}
                              style={{
                                  margin: "6px 0",
                                  paddingLeft: "20px",
                              }}
                          />
                      ),
                      ol: ({node, ...props}) => (
                          <ol
                              {...props}
                              style={{
                                  margin: "6px 0",
                                  paddingLeft: "20px",
                              }}
                          />
                      ),
                      li: ({node, ...props}) => (
                          <li
                              {...props}
                              style={{
                                  margin: "2px 0",
                              }}
                          />
                      ),
                  }}
              >
                  {msg.text}
              </ReactMarkdown>
              <div style={{ display: "none" }}>
                  {console.log(msg.text)}
              </div>
            </div>
        </div>
          {msg.messageId && (
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => playAudio(msg.messageId)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                {
                    loadingAudioId === msg.messageId
                        ? "⏳ Generating..."
                        : playingAudioId === msg.messageId
                            ? "⏸ Pause"
                            : "▶ Play Audio"
                }
              </button>
            </div>
          )}

          {msg.pdfs && msg.pdfs.length > 0 ? (
              <div className="pdf-links">
                {msg.pdfs.map((pdf, index) => (
                  <div
                    key={index}
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      background: "#f9fafb",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: "6px",
                        wordBreak: "break-word",
                      }}
                    >
                      📄 {pdf.name}
                    </div>

                    <a
                      href={pdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdf-link"
                    >
                      Open PDF
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              msg.links.length > 0 && (
                <div className="pdf-links">
                  <a
                    href={msg.links[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pdf-link"
                  >
                    Open PDF
                  </a>
                </div>
              )
            )}
        </>
      )}
    </>
                ) : (
                  <div>{msg.text}</div>
                )}
            </div>
          ))}
          {isLoadingQuote && (
            <div className="message bot waiting">
              <div className="spinner"></div>
              <span>Preparing today's quote...</span>
            </div>
          )}

          {isWaiting && (
            <div className="message bot waiting">
              <div className="spinner"></div>
              <span>Waiting for response...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chat-input">
          <input
            type="text"
            placeholder="Type your query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTimeUp}
          />

          <div className="reasoning-container">
            <label htmlFor="reasoning-select" className="reasoning-label">
              Reasoning
            </label>
            <select
              id="reasoning-select"
              value={reasoningLevel}
              onChange={(e) => setReasoningLevel(e.target.value)}
              disabled={isTimeUp}
            >
              <option value="simple">Simple</option>
              <option value="medium">Medium</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <button type="submit" disabled={isWaiting || !input.trim() || isTimeUp}>
            {isWaiting ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}