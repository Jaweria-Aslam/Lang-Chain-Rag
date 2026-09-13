
import { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  Trash2,
  Plus,
  Menu,
  X,
  MessageSquare,
  ExternalLink,
  Globe,
  LoaderCircle,
  CheckCircle,
} from "lucide-react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestMessage, setIngestMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  // =========================
  // INGEST WEBSITE
  // =========================
  const ingestWebsite = async () => {
    const url = websiteUrl.trim();

    if (!url || isIngesting) return;

    setIsIngesting(true);
    setIngestMessage("");

    try {
      const response = await fetch(`${API_URL}/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Website ingestion failed."
        );
      }

      setIngestMessage(
        `Website added successfully! ${data.chunks || 0} chunks stored in your knowledge base.`
      );

      // Show ingestion result inside chat
      const systemMessage = {
        id: Date.now(),
        role: "assistant",
        content: `I've successfully added ${url} to your knowledge base. You can now ask questions about this website.`,
        sources: [
          {
            title: url,
            url: url,
          },
        ],
      };

      setMessages((prev) => [...prev, systemMessage]);

      setWebsiteUrl("");
    } catch (error) {
      console.error("Ingestion error:", error);

      setIngestMessage(
        error.message ||
          "I couldn't ingest this website. Please check the URL and backend."
      );
    } finally {
      setIsIngesting(false);
    }
  };

  // =========================
  // ASK QUESTION
  // =========================
  const askQuestion = async () => {
    const question = input.trim();

    if (!question || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "AI request failed."
        );
      }

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          data.answer ||
          data.response ||
          data.message ||
          "I couldn't generate an answer.",
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "I couldn't connect to the backend. Please make sure the FastAPI server is running.",
          sources: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // ENTER KEY
  // =========================
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askQuestion();
    }
  };

  // =========================
  // CLEAR CHAT
  // =========================
  const clearChat = () => {
    setMessages([]);
    setIngestMessage("");
  };

  // =========================
  // NEW CHAT
  // =========================
  const newChat = () => {
    setMessages([]);
    setInput("");
    setWebsiteUrl("");
    setIngestMessage("");
    setSidebarOpen(false);
  };

  return (
    <div className="app">
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-icon">
              <Bot size={23} />
            </div>

            <div>
              <h2>RAG Assistant</h2>
              <span>Knowledge AI</span>
            </div>
          </div>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <button
          className="new-chat-button"
          onClick={newChat}
        >
          <Plus size={18} />
          <span>New Conversation</span>
        </button>

        <div className="sidebar-section">
          <div className="sidebar-label">
            <MessageSquare size={14} />
            <span>Conversation</span>
          </div>

          <div className="conversation-item active">
            <MessageSquare size={16} />
            <span>Current Chat</span>
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="tech-card">
            <div className="tech-icon">
              <Sparkles size={17} />
            </div>

            <div>
              <strong>Powered by RAG</strong>
              <span>LangChain + Gemini</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="main">

        {/* Header */}
        <header className="header">
          <div className="header-left">
            <button
              className="menu-button"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={21} />
            </button>

            <div className="header-title">
              <div className="status-dot"></div>

              <div>
                <h1>AI Knowledge Assistant</h1>
                <p>
                  Ask questions from your knowledge base
                </p>
              </div>
            </div>
          </div>

          <div className="header-badge">
            <span className="badge-dot"></span>
            AI Online
          </div>
        </header>

        {/* ================= CHAT AREA ================= */}
        <section className="chat-area">
          {messages.length === 0 ? (
            <div className="welcome">

              <div className="welcome-icon">
                <Bot size={38} />

                <div className="welcome-sparkle">
                  <Sparkles size={16} />
                </div>
              </div>

              <span className="welcome-label">
                <Sparkles size={14} />
                Intelligent Knowledge Retrieval
              </span>

              <h2>
                Ask anything from
                <span> your knowledge base</span>
              </h2>

              <p>
                Get accurate, context-aware answers powered by
                LangChain, Gemini and Pinecone.
              </p>

              {/* ================= WEBSITE INGEST ================= */}
              <div className="ingest-card">
                <div className="ingest-header">
                  <div className="ingest-icon">
                    <Globe size={20} />
                  </div>

                  <div>
                    <h3>Add a website</h3>
                    <p>
                      Import website content into your
                      knowledge base.
                    </p>
                  </div>
                </div>

                <div className="ingest-input-row">
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(event) =>
                      setWebsiteUrl(event.target.value)
                    }
                    placeholder="https://example.com"
                    disabled={isIngesting}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        ingestWebsite();
                      }
                    }}
                  />

                  <button
                    className="ingest-button"
                    onClick={ingestWebsite}
                    disabled={
                      !websiteUrl.trim() || isIngesting
                    }
                  >
                    {isIngesting ? (
                      <>
                        <LoaderCircle
                          size={17}
                          className="spin"
                        />
                        Adding...
                      </>
                    ) : (
                      <>
                        <BookOpen size={17} />
                        Add Website
                      </>
                    )}
                  </button>
                </div>

                {ingestMessage && (
                  <div
                    className={`ingest-status ${
                      ingestMessage.includes(
                        "successfully"
                      )
                        ? "success"
                        : "error"
                    }`}
                  >
                    {ingestMessage.includes(
                      "successfully"
                    ) ? (
                      <CheckCircle size={15} />
                    ) : (
                      <X size={15} />
                    )}

                    <span>{ingestMessage}</span>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              <div className="suggestions">
                <button
                  onClick={() =>
                    setInput(
                      "What information is available in the knowledge base?"
                    )
                  }
                >
                  <BookOpen size={16} />
                  Explore knowledge
                </button>

                <button
                  onClick={() =>
                    setInput(
                      "Summarize the main information available."
                    )
                  }
                >
                  <Sparkles size={16} />
                  Summarize content
                </button>

                <button
                  onClick={() =>
                    setInput(
                      "What are the most important topics?"
                    )
                  }
                >
                  <MessageSquare size={16} />
                  Key topics
                </button>
              </div>
            </div>
          ) : (
            <div className="messages-container">

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-row ${message.role}`}
                >
                  <div className="message-avatar">
                    {message.role === "assistant" ? (
                      <Bot size={18} />
                    ) : (
                      <span>J</span>
                    )}
                  </div>

                  <div className="message-content">
                    <div className="message-name">
                      {message.role === "assistant"
                        ? "AI Assistant"
                        : "You"}
                    </div>

                    <div className="message-bubble">
                      {message.content}
                    </div>

                    {/* Sources */}
                    {message.sources &&
                      message.sources.length > 0 && (
                        <div className="sources">
                          <div className="sources-heading">
                            <BookOpen size={15} />
                            <span>Sources</span>
                          </div>

                          <div className="source-list">
                            {message.sources.map(
                              (source, index) => (
                                <div
                                  className="source-card"
                                  key={index}
                                >
                                  <div className="source-number">
                                    {index + 1}
                                  </div>

                                  <div className="source-info">
                                    <strong>
                                      {source.title ||
                                        source.source ||
                                        `Source ${
                                          index + 1
                                        }`}
                                    </strong>

                                    {source.url && (
                                      <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        Open source
                                        <ExternalLink
                                          size={12}
                                        />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              ))}

              {/* Loading */}
              {isLoading && (
                <div className="message-row assistant">
                  <div className="message-avatar">
                    <Bot size={18} />
                  </div>

                  <div className="message-content">
                    <div className="message-name">
                      AI Assistant
                    </div>

                    <div className="message-bubble loading-bubble">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ================= BOTTOM INPUT ================= */}
        <div className="input-wrapper">
          <div className="input-area">
            <textarea
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask something about your knowledge base..."
              rows="1"
            />

            <button
              className="send-button"
              onClick={askQuestion}
              disabled={
                !input.trim() || isLoading
              }
            >
              <Send size={19} />
            </button>
          </div>

          <div className="input-footer">
            <span>
              <Sparkles size={13} />
              AI-generated responses may need verification
            </span>

            {messages.length > 0 && (
              <button onClick={clearChat}>
                <Trash2 size={13} />
                Clear chat
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
