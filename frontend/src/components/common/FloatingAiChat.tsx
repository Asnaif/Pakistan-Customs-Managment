import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  { emoji: '⏱️', label: 'Dwell Time Trends', prompt: 'What is the current average dwell time across ports and how does it compare to the WCO 48-hour benchmark?' },
  { emoji: '💰', label: 'Revenue Optimization', prompt: 'What actionable strategies can improve customs duty collection and resolve revenue shortfalls?' },
  { emoji: '🛡️', label: 'Green vs Red Channels', prompt: 'Explain the WCO guidelines for Green channel trade facilitation and Red channel physical examination selectivity.' },
  { emoji: '🏢', label: 'Collectorate Performance', prompt: 'How can we analyze collectorate scorecards to identify operational clearance bottlenecks?' },
  { emoji: '🇵🇰', label: 'اردو رہنمائی', prompt: 'Customs PMM dashboard ka bunyadi maqsad aur iske main features aasan Urdu me samjhayein.' },
];

export default function FloatingAiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Welcome to **Customs AI Intelligence Copilot**! 🛃

I am your virtual intelligence assistant for the Pakistan Customs & FBR Performance Measurement Mechanism (PMM) Dashboard.

I can assist you with:
• ⏱️ **TRS & Dwell Time Analysis** (Port dwell time, clearance phases & WCO benchmarks)
• 💰 **Revenue Intelligence** (Customs duty collection, shortfall diagnosis & PCA yield)
• 🛡️ **Risk & RMS Selectivity** (Green vs Red channel physical inspection ratios)
• 🏢 **Collectorate Scorecards & Alerts** (Port Qasim, Karachi Appraisement, Dry Ports)

Select a quick prompt above or type your question below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // Build conversation history for API
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      let replyText = '';

      try {
        // Try backend AI route first
        const res = await api.post('/ai/chat', {
          message: query,
          history: historyPayload,
        });
        replyText = res.data.reply;
      } catch (backendErr) {
        console.warn('Backend AI failed, trying direct Gemini fallback:', backendErr);
        // Fallback to direct Gemini API call
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyD22K2ZG41ovftxbqix7DWtjCU9FuKhQNc';
        const directRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: query }] }],
            }),
          }
        );
        const data = await directRes.json();
        replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received from AI model.';
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `⚠️ معذرت، AI رسپانس حاصل کرنے میں مسئلہ پیش آیا: ${err.message || 'Network error'}. براہ کرم دوبارہ کوشش کریں۔`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-fresh',
        role: 'model',
        content: 'Conversation has been reset. 🛃 How can I assist you with customs analytics?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Simple formatter for bold text and list bullets
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Bold syntax **text**
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={idx} className="flex items-start space-x-1.5 my-1 ml-1 text-slate-800">
            <span className="text-blue-500 font-bold shrink-0">•</span>
            <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[\*\-•]\s*/, '') }} />
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p
          key={idx}
          className="my-1 leading-relaxed text-slate-800"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold shadow-2xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-blue-500/20 cursor-pointer group"
          title="Open Customs AI Intelligence Copilot"
        >
          <div className="relative flex items-center justify-center">
            <span className="text-xl group-hover:rotate-12 transition-transform">🤖</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-wide uppercase flex items-center space-x-1 text-blue-200">
              <span>✨ AI Copilot</span>
            </span>
            <span className="text-sm font-bold text-white leading-tight">Customs Assistant</span>
          </div>
        </button>
      )}

      {/* Floating Chat Drawer / Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-32px)] h-[620px] max-h-[calc(100vh-48px)] flex flex-col bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-lg shadow-md shadow-blue-500/40">
                🛃
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-sm font-bold text-white tracking-tight">Customs AI Copilot</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold border border-emerald-500/30">
                    🟢 Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">Gemini 2.5 Flash • FBR Intelligence</p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-slate-300">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/ai-copilot');
                }}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Expand to Fullscreen Workspace"
              >
                ↗️
              </button>
              <button
                onClick={handleClearChat}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Clear Chat"
              >
                🧹
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-base"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Prompt Pills Bar */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/70 overflow-x-auto flex space-x-1.5 scrollbar-thin shrink-0">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.prompt)}
                disabled={loading}
                className="shrink-0 text-[11px] font-medium bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-2.5 py-1 rounded-full shadow-2xs transition-all flex items-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                <span>{qp.emoji}</span>
                <span>{qp.label}</span>
              </button>
            ))}
          </div>

          {/* Message List Canvas */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-xs shadow-xs relative group ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {msg.role === 'model' && (
                    <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-100 text-[10px] text-slate-600 font-semibold">
                      <span className="flex items-center space-x-1">
                        <span>🤖 Customs Copilot</span>
                      </span>
                      <button
                        onClick={() => copyToClipboard(msg.content)}
                        className="opacity-0 group-hover:opacity-100 hover:text-blue-600 transition-opacity p-0.5 cursor-pointer"
                        title="Copy text"
                      >
                        📋 Copy
                      </button>
                    </div>
                  )}

                  <div className="text-xs leading-relaxed">
                    {msg.role === 'user' ? msg.content : renderFormattedContent(msg.content)}
                  </div>

                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.role === 'user' ? 'text-blue-200' : 'text-slate-600'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-500 bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs p-3 max-w-[80%] shadow-xs">
                <span className="animate-spin text-base">⏳</span>
                <span className="text-xs font-medium text-slate-600 animate-pulse">
                  Analyzing Customs PMM data...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200/80 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a customs question (e.g. Why is Red Channel dwell time high?)..."
                disabled={loading}
                className="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="Send query"
              >
                <span className="text-sm">✈️</span>
              </button>
            </form>
            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 px-1">
              <span>Press Enter to send</span>
              <span>Customs Intelligence Copilot</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
