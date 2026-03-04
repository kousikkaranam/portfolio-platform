"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MAX_DAILY = 50;

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.09 6.26L21 10l-6.91 1.74L12 18l-2.09-6.26L3 10l6.91-1.74L12 2z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-1 items-center h-4">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current opacity-60"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function ChatWidget({
  username,
  name,
  accentColor,
}: {
  username: string;
  name: string;
  accentColor: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hey! I'm an AI assistant with knowledge of ${name}'s portfolio. Ask me about projects, skills, experience, or anything else!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load daily count from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`chat_${username}_daily`);
      if (raw) {
        const { count, date } = JSON.parse(raw);
        if (date === new Date().toDateString()) setDailyCount(count);
        else localStorage.removeItem(`chat_${username}_daily`);
      }
    } catch {
      // ignore
    }
  }, [username]);

  // Auto-scroll and focus on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading || dailyCount >= MAX_DAILY) return;

    setInput("");
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);

    const newCount = dailyCount + 1;
    setDailyCount(newCount);
    try {
      localStorage.setItem(
        `chat_${username}_daily`,
        JSON.stringify({ count: newCount, date: new Date().toDateString() })
      );
    } catch {
      // ignore
    }

    try {
      const res = await fetch(`/api/chat/${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed");
      setMessages([...next, { role: "assistant", content: json.content }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setMessages([...next, { role: "assistant", content: `Sorry, I ran into a problem: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const limitReached = dailyCount >= MAX_DAILY;
  const remaining = MAX_DAILY - dailyCount;

  // Derived accent values
  const accentBg = `${accentColor}15`;
  const accentBorder = `${accentColor}35`;
  const accentBorderStrong = `${accentColor}60`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* ── Chat panel ─────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="flex flex-col rounded-2xl shadow-2xl overflow-hidden"
            style={{
              width: 360,
              height: 500,
              background: "var(--bg-card)",
              border: `1px solid ${accentBorder}`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{
                background: accentBg,
                borderBottom: `1px solid ${accentBorder}`,
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: accentColor }}
              >
                <SparkleIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                  {name}&apos;s AI Assistant
                </p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {limitReached ? "Daily limit reached" : `${remaining} message${remaining !== 1 ? "s" : ""} left today`}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-60"
                style={{ color: "var(--text-secondary)" }}
                aria-label="Close chat"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scroll-smooth">
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div
                      className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center"
                      style={{ background: accentColor }}
                    >
                      <SparkleIcon className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div
                    className="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                    style={
                      msg.role === "user"
                        ? {
                            background: accentColor,
                            color: "#fff",
                            borderBottomRightRadius: 4,
                          }
                        : {
                            background: accentBg,
                            color: "var(--text)",
                            border: `1px solid ${accentBorder}`,
                            borderBottomLeftRadius: 4,
                          }
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-end gap-2 justify-start">
                  <div
                    className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{ background: accentColor }}
                  >
                    <SparkleIcon className="w-3 h-3 text-white" />
                  </div>
                  <div
                    className="rounded-2xl px-4 py-3"
                    style={{
                      background: accentBg,
                      border: `1px solid ${accentBorder}`,
                      borderBottomLeftRadius: 4,
                      color: accentColor,
                    }}
                  >
                    <ThinkingDots />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="flex items-center gap-2 p-3 flex-shrink-0"
              style={{ borderTop: `1px solid ${accentBorder}` }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={limitReached ? "Daily limit reached" : "Ask me anything…"}
                disabled={limitReached || loading}
                className="flex-1 text-sm rounded-xl px-3 py-2 outline-none bg-transparent border transition-colors"
                style={{
                  borderColor: input ? accentBorderStrong : accentBorder,
                  color: "var(--text)",
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading || limitReached}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-30 flex-shrink-0"
                style={{ background: accentColor }}
                aria-label="Send message"
              >
                <SendIcon className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trigger: icon fused with bar ───────────────── */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-stretch rounded-2xl overflow-hidden shadow-xl focus:outline-none"
        style={{ border: `1px solid ${accentBorderStrong}` }}
        aria-label={open ? "Close chat" : "Open AI chat"}
      >
        {/* Icon segment */}
        <div
          className="flex items-center justify-center w-12 flex-shrink-0"
          style={{ background: accentColor }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="down"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <ChevronDownIcon className="w-5 h-5 text-white" />
              </motion.span>
            ) : (
              <motion.span
                key="spark"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <SparkleIcon className="w-5 h-5 text-white" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Bar segment */}
        <div
          className="flex items-center px-4 py-3"
          style={{ background: "var(--bg-card)" }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "open"}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-medium whitespace-nowrap"
              style={{ color: "var(--text)" }}
            >
              {open ? "Close Chat" : `Chat with ${name}'s AI`}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.button>
    </div>
  );
}
