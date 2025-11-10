"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("gpt-5-nano");
  const chatEnd = useRef(null);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    let id = localStorage.getItem("session_id");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("session_id", id);
    }
    setSessionId(id);
  }, []);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post("/api/chat", {
        message: input,
        model,
        session: sessionId,
      });
      const botMsg = {
        from: "bot",
        text: data.reply || data.error || "Error mendapatkan respon.",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Terjadi kesalahan koneksi." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <header className="flex justify-between items-center px-4 py-3 border-b bg-white dark:bg-[#1a1a1a] sticky top-0 z-10">
        <h1 className="font-semibold text-lg">💬 FMC AI Chat</h1>
        <select
          className="border rounded px-2 py-1 text-sm bg-gray-50 dark:bg-[#2a2a2a]"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="gpt-5-nano">GPT-5 Nano</option>
          <option value="gpt-4o-mini">GPT-4o Mini</option>
          <option value="gemini">Gemini</option>
          <option value="deepseek">DeepSeek</option>
          <option value="claude">Claude</option>
          <option value="meta-ai">Meta AI</option>
          <option value="grok">Grok</option>
          <option value="qwen">Qwen</option>
        </select>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50 dark:bg-[#111]">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                m.from === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-[#222] border dark:border-gray-700"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-gray-500 text-sm animate-pulse">
            AI sedang mengetik...
          </div>
        )}
        <div ref={chatEnd} />
      </main>

      <footer className="p-3 border-t bg-white dark:bg-[#1a1a1a] flex gap-2">
        <textarea
          rows="1"
          onKeyDown={handleKey}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 resize-none rounded-lg border px-3 py-2 focus:outline-none bg-gray-50 dark:bg-[#222]"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          Kirim
        </button>
      </footer>
    </div>
  );
}
