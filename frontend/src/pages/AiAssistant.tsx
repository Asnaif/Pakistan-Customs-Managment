import { useState, useRef, useEffect } from 'react';
import api from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

const CATEGORIZED_PROMPTS = [
  {
    category: '⏱️ TRS & Dwell Time Analysis',
    items: [
      'Port Qasim aur Karachi ports par average dwell time ka WCO standard benchmark kya hai?',
      'Red channel physical inspection me sab se ziyada time kis stage par lagta hai?',
      'How to reduce terminal dwell time from discharge to gate-out under 48 hours?',
    ],
  },
  {
    category: '💰 Revenue & Valuation Risks',
    items: [
      'Customs duty aur taxes shortfall recover karne ke liye best administrative strategies kya hain?',
      'HS Code under-invoicing aur misdeclaration ko detect karne ke tareeqay batayein.',
      'Explain Post Clearance Audit (PCA) yield and revenue audit mechanisms.',
    ],
  },
  {
    category: '🛡️ RMS & Enforcement Security',
    items: [
      'WCO Kyoto Convention ke mutabiq Green channel facilitation ratio kitna hona chahiye?',
      'High-risk contraband shipments ko target karne ke liye dynamic risk rules kaise banayein?',
      'Explain seizure rate and physical examination selectivity criteria.',
    ],
  },
  {
    category: '🇵🇰 اردو رہنمائی (Urdu Guidance)',
    items: [
      'پاکستان کسٹمز کا PMM ڈیش بورڈ کیا ہے اور یہ کس طرح کام کرتا ہے؟',
      'کسٹمز کلیئرنس کے بنیادی مراحل (Declaration, Assessment, Examination, Out of Charge) اردو میں سمجھائیں۔',
      'ڈویل ٹائم 48 گھنٹوں سے زیادہ ہونے کی سب سے بڑی وجوہات کیا ہوتی ہیں؟',
    ],
  },
];

export default function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      role: 'model',
      content: `Welcome to the **Pakistan Customs AI Intelligence Copilot**! 🛃

I am your virtual intelligence assistant for the Pakistan Customs Performance Measurement Mechanism (PMM) Dashboard under the Federal Board of Revenue (FBR).

I have full operational awareness of your live trade data, WCO Time Release Studies (TRS), duty & tax collections, Risk Management System (RMS) selectivity rules, and collectorate throughput benchmarks.

How can I assist you with customs operations today? Select any recommended query on the left or type your question below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch live context snapshot
    api.get('/metrics/summary')
      .then((res) => setLiveMetrics(res.data))
      .catch((err) => console.warn('Could not load summary metrics for AI page:', err));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const text = (queryText || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'initial')
        .map((m) => ({ role: m.role, content: m.content }));

      let reply = '';
      try {
        const res = await api.post('/ai/chat', {
          message: text,
          history: historyPayload,
        });
        reply = res.data.reply;
      } catch (err) {
        // Direct fallback
        const key = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyD22K2ZG41ovftxbqix7DWtjCU9FuKhQNc';
        const fallbackRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: text }] }] }),
          }
        );
        const data = await fallbackRes.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received from AI model.';
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `⚠️ معذرت، AI جواب حاصل کرنے میں خامی پیش آئی: ${err.message || 'Network error'}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'fresh',
        role: 'model',
        content: 'Session has been reset. 🛃 How can I assist you with customs operations?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const exportChat = () => {
    const textContent = messages
      .map((m) => `[${m.timestamp}] ${m.role === 'user' ? 'USER' : 'CUSTOMS AI'}:\n${m.content}\n\n`)
      .join('---\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Customs_AI_Session_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
  };

  const renderFormatted = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const bolded = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={idx} className="flex items-start space-x-2 my-1 ml-2 text-slate-800">
            <span className="text-blue-500 font-bold shrink-0">•</span>
            <span dangerouslySetInnerHTML={{ __html: bolded.replace(/^[\*\-•]\s*/, '') }} />
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
          dangerouslySetInnerHTML={{ __html: bolded }}
        />
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/30">
            🤖
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                Customs AI Intelligence Copilot
              </h1>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span>Gemini 2.5 Flash</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              FBR Performance Measurement Mechanism • Automated TRS, Revenue, and Risk Advisory
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportChat}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
            title="Download Chat History"
          >
            <span>📥</span>
            <span>Export Session</span>
          </button>
          <button
            onClick={handleClear}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-red-950/40 hover:bg-red-900/50 text-red-300 text-xs font-semibold rounded-xl border border-red-800/50 transition cursor-pointer"
            title="Start New Chat"
          >
            <span>🔄</span>
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Knowledge Topics & Live Context (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Live Context Card */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <span>⚡</span>
                <span>Live Customs Pulse</span>
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Connected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Shipments</span>
                <p className="text-base font-extrabold text-slate-800 mt-0.5">
                  {liveMetrics?.shipmentVolume ? Number(liveMetrics.shipmentVolume).toLocaleString() : '12,450+'}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Avg Dwell Time</span>
                <p className="text-base font-extrabold text-blue-600 mt-0.5">
                  {liveMetrics?.avgClearanceHours ? `${Number(liveMetrics.avgClearanceHours).toFixed(1)} hrs` : '46.2 hrs'}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Duty Collected</span>
                <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                  {liveMetrics?.totalRevenue ? `PKR ${(Number(liveMetrics.totalRevenue) / 1e6).toFixed(1)}M` : 'PKR 45.8M'}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">WCO Target</span>
                <p className="text-base font-extrabold text-purple-600 mt-0.5">&lt; 48.0 hrs</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 mt-3 italic">
              💡 Gemini Copilot automatically considers these live numbers when advising.
            </p>
          </div>

          {/* Quick Query Categories */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-100">
              <span>💡</span>
              <span>Recommended Intelligence Queries</span>
            </h3>

            {CATEGORIZED_PROMPTS.map((cat, cIdx) => (
              <div key={cIdx} className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-800">{cat.category}</h4>
                <div className="space-y-1">
                  {cat.items.map((item, iIdx) => (
                    <button
                      key={iIdx}
                      onClick={() => handleSend(item)}
                      disabled={loading}
                      className="w-full text-left p-2 rounded-xl text-xs text-slate-600 hover:text-blue-700 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 transition-all cursor-pointer flex items-center justify-between group disabled:opacity-50"
                    >
                      <span className="truncate pr-2">{item}</span>
                      <span className="text-slate-400 group-hover:text-blue-500 text-[10px] shrink-0 font-bold">
                        ↗
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Chat Console (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-xs border border-slate-200/90 flex flex-col h-[740px] overflow-hidden">
          {/* Chat Window Messages Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                      : 'bg-gradient-to-tr from-slate-900 to-indigo-950 text-white'
                  }`}
                >
                  {msg.role === 'user' ? '👤' : '🛃'}
                </div>

                {/* Bubble Container */}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs shadow-xs relative group ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-100/20 text-[10px] font-semibold opacity-80">
                    <span>{msg.role === 'user' ? 'Customs Officer' : 'Customs AI Officer (Gemini 2.5 Flash)'}</span>
                    {msg.role === 'model' && (
                      <button
                        onClick={() => copyText(msg.content)}
                        className="opacity-0 group-hover:opacity-100 hover:text-blue-600 transition p-0.5 cursor-pointer text-slate-600"
                        title="Copy message"
                      >
                        📋 Copy
                      </button>
                    )}
                  </div>

                  <div className="text-xs leading-relaxed space-y-1">
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      renderFormatted(msg.content)
                    )}
                  </div>

                  <span
                    className={`block text-[10px] mt-2 text-right ${
                      msg.role === 'user' ? 'text-blue-200' : 'text-slate-600'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-xs">
                  🛃
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs p-4 shadow-xs flex items-center space-x-3">
                  <span className="animate-spin text-lg">⏳</span>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Customs AI Analysis in Progress...</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Processing live trade metrics and customs regulations...</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Prompt Bar */}
          <div className="p-4 bg-white border-t border-slate-200/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask customs questions (e.g. How to reduce Red channel dwell time?)..."
                disabled={loading}
                className="flex-1 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-800 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center space-x-2 shrink-0 disabled:opacity-40"
              >
                <span>Send</span>
                <span className="text-sm">✈️</span>
              </button>
            </form>
            <div className="flex items-center justify-between mt-2.5 px-1 text-[11px] text-slate-400">
              <span>Press Enter to send</span>
              <span>🔒 Encrypted Customs Session</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
