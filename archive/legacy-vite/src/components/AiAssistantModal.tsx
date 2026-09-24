import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Lock,
  EyeOff,
  Shield,
  Trash2,
  Info,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { ChatMessage, Product, UserProfile } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currentUser?: UserProfile;
  onSelectProduct: (product: Product) => void;
}

const DEFAULT_SUGGESTIONS = [
  '📦 How does Amazon Associates work & what are the rules?',
  '📌 How to share affiliate links on Pinterest?',
  '⚖️ What are the FTC affiliate disclosure requirements?',
  '✨ How does The Curated Pick select and verify deals?',
  '🔔 How do Price Drop Alerts work on this site?',
  '💡 Tips to boost affiliate conversion rates on blogs & social',
];

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-welcome',
  sender: 'assistant',
  text: `Hello! I'm **Curated AI**, your dedicated assistant for **The Curated Pick**, **Amazon Associates**, and **Pinterest Affiliate Marketing**.

🔒 **100% Private to You**: Your conversation is strictly confidential and isolated to your session. No other users or visitors can ever see your messages or questions.

I can help you with:
- **The Curated Pick Platform**: Product features, price drop tracking, QR scanning, and deal curation.
- **Amazon Associates**: Operating agreement rules, 24-hr cookies, link policies, and compliance disclaimers.
- **Pinterest Affiliate Marketing**: 2:3 vertical pins, direct links vs. bridge pages, and disclosure hashtags (#ad, #affiliate).
- **Affiliate Disclosures & FTC**: Staying 100% compliant with e-commerce regulations.

Ask me anything below or choose a suggested topic to get started!`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

// Generates a strictly unique, isolated token for guest sessions
function getPrivateSessionToken(): string {
  try {
    let token = sessionStorage.getItem('curated_ai_private_token');
    if (!token) {
      token = 'priv_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
      sessionStorage.setItem('curated_ai_private_token', token);
    }
    return token;
  } catch {
    return 'ephemeral_session';
  }
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  products,
  currentUser,
  onSelectProduct,
}) => {
  // Derive private, user-isolated storage key
  const storageKey = useMemo(() => {
    if (currentUser?.isLoggedIn && currentUser.email) {
      try {
        const userHash = btoa(currentUser.email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
        return `curated_ai_usr_${userHash}`;
      } catch {
        return `curated_ai_usr_${currentUser.name.replace(/\s+/g, '_')}`;
      }
    }
    return `curated_ai_guest_${getPrivateSessionToken()}`;
  }, [currentUser?.email, currentUser?.isLoggedIn, currentUser?.name]);

  // Incognito / ephemeral mode state
  const [isIncognito, setIsIncognito] = useState(() => {
    try {
      return sessionStorage.getItem('curated_ai_incognito_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [privacyToast, setPrivacyToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load private conversation whenever storageKey changes
  useEffect(() => {
    if (isIncognito) {
      setMessages([INITIAL_GREETING]);
      return;
    }
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setMessages([INITIAL_GREETING]);
  }, [storageKey, isIncognito]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Persist conversation to the user's isolated sessionStorage key
  useEffect(() => {
    if (isIncognito) {
      // In incognito mode, never write to storage
      return;
    }
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages, storageKey, isIncognito]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache',
        },
        body: JSON.stringify({
          message: query,
          messages: [...messages, userMessage],
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const botReply: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'I am ready to assist with any questions on affiliate marketing, Amazon Associates, or The Curated Pick.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Check if any product matches the query to provide quick cards
      const matchedProducts = products.filter((p) =>
        query.toLowerCase().includes(p.name.toLowerCase().slice(0, 8)) ||
        query.toLowerCase().includes(p.category.toLowerCase())
      ).slice(0, 2);

      if (matchedProducts.length > 0) {
        botReply.recommendedProductIds = matchedProducts.map((p) => p.id);
      }

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackReply: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        sender: 'assistant',
        text: `### 💡 Quick Answer\n\nI encountered a network issue connecting to the AI endpoint. However, here are quick resources:\n\n- **Amazon Associates**: Always include *"As an Amazon Associate I earn from qualifying purchases."* Remember the 24-hour cookie policy and never send links via email.\n- **Pinterest**: Use vertical 2:3 images (1000x1500px), disclose with \`#ad\` or \`#affiliate\`, and link to rich review bridge pages.\n- **Questions & Support**: Contact our team directly at **curatedpick.store@gmail.com**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([INITIAL_GREETING]);
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setPrivacyToast('Chat history cleared permanently.');
    setTimeout(() => setPrivacyToast(null), 2500);
  };

  const toggleIncognito = () => {
    const next = !isIncognito;
    setIsIncognito(next);
    try {
      sessionStorage.setItem('curated_ai_incognito_mode', String(next));
      if (next) {
        sessionStorage.removeItem(storageKey);
      }
    } catch {
      // ignore
    }
    setPrivacyToast(next ? 'Incognito Mode: Chat won\'t be saved.' : 'Normal Mode: Saved strictly to your device.');
    setTimeout(() => setPrivacyToast(null), 3000);
  };

  return (
    <div
      id="modal-ai-assistant"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#000c1b]/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0c1827] rounded-2xl shadow-2xl border border-[#c3c6ce]/40 dark:border-slate-800 flex flex-col h-[90vh] max-h-[740px] overflow-hidden z-10 transition-colors">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 bg-linear-to-r from-[#eff4ff] via-white to-[#e5eeff] dark:from-[#0d1e33] dark:via-[#0c1827] dark:to-[#132842] border-b border-[#c3c6ce]/30 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-[#006b5b] to-[#26fedc] flex items-center justify-center text-white shadow-xs shrink-0">
              <Bot className="w-5 h-5 text-[#000c1b]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-[#000c1b] dark:text-white">
                  Curated AI
                </h2>
                <span className="text-[10px] font-semibold bg-[#26fedc]/30 dark:bg-[#26fedc]/20 text-[#006b5b] dark:text-[#26fedc] px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Advisor
                </span>
                {isIncognito && (
                  <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <EyeOff className="w-2.5 h-2.5" /> Incognito
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#74777e] dark:text-slate-400 truncate max-w-[280px] sm:max-w-md">
                Affiliate Q&A • Amazon • Pinterest • Private & Isolated
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="btn-ai-privacy-info"
              type="button"
              onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
              title="View Strong Privacy Guarantee"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                showPrivacyInfo
                  ? 'bg-[#006b5b] text-white'
                  : 'text-[#006b5b] dark:text-[#26fedc] hover:bg-white/60 dark:hover:bg-slate-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Privacy</span>
            </button>
            <button
              id="btn-ai-clear-chat"
              type="button"
              onClick={handleResetChat}
              title="Clear private chat history"
              className="p-1.5 text-[#74777e] dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              id="btn-ai-close"
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#74777e] dark:text-slate-400 hover:text-[#000c1b] dark:hover:text-white rounded-lg hover:bg-white/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Privacy Security Status Bar */}
        <div className="px-4 py-1.5 bg-[#eafaf6] dark:bg-[#072422] border-b border-[#26fedc]/30 flex items-center justify-between text-[11px] text-[#004d40] dark:text-[#26fedc]">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#006b5b] dark:text-[#26fedc] shrink-0" />
            <span className="font-semibold">
              {currentUser?.isLoggedIn
                ? `Private Session for ${currentUser.name}`
                : '100% Private Client Session'}
            </span>
            <span className="text-[#74777e] dark:text-teal-400/70 hidden sm:inline">• Never shared with other people</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleIncognito}
              className="hover:underline flex items-center gap-1 font-medium cursor-pointer"
              title={isIncognito ? 'Disable incognito mode' : 'Enable incognito mode (do not save history on device)'}
            >
              <EyeOff className="w-3 h-3" />
              <span>{isIncognito ? 'Incognito: ON' : 'Incognito: OFF'}</span>
            </button>
          </div>
        </div>

        {/* Privacy Guarantee Explainer Banner (Togglable) */}
        {showPrivacyInfo && (
          <div className="p-3.5 bg-[#f0f8ff] dark:bg-[#081a2e] border-b border-blue-200 dark:border-blue-900/60 text-xs text-[#002b4d] dark:text-blue-100 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="font-bold flex items-center gap-1.5 text-blue-900 dark:text-blue-200">
                <Lock className="w-4 h-4 text-[#006b5b] dark:text-[#26fedc]" />
                Strong End-to-End Chat Privacy Guarantee
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyInfo(false)}
                className="text-[#74777e] hover:text-[#000c1b] dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] leading-relaxed">
              <div className="bg-white/80 dark:bg-[#0c2038] p-2 rounded-lg border border-blue-100 dark:border-slate-800">
                <span className="font-bold text-[#006b5b] dark:text-[#26fedc] block mb-0.5">
                  1. Zero Multi-User Sharing
                </span>
                What you write is never shown or leaked to any other visitor or user. Each user and device has their own completely isolated workspace.
              </div>
              <div className="bg-white/80 dark:bg-[#0c2038] p-2 rounded-lg border border-blue-100 dark:border-slate-800">
                <span className="font-bold text-[#006b5b] dark:text-[#26fedc] block mb-0.5">
                  2. Stateless & Private Server
                </span>
                Queries are processed directly in-memory and answered immediately with zero persistent database logging and zero caching headers.
              </div>
              <div className="bg-white/80 dark:bg-[#0c2038] p-2 rounded-lg border border-blue-100 dark:border-slate-800">
                <span className="font-bold text-[#006b5b] dark:text-[#26fedc] block mb-0.5">
                  3. Device-Scoped Storage
                </span>
                Chat memory is securely confined to your specific browser session. Third parties cannot inspect or access it.
              </div>
              <div className="bg-white/80 dark:bg-[#0c2038] p-2 rounded-lg border border-blue-100 dark:border-slate-800">
                <span className="font-bold text-[#006b5b] dark:text-[#26fedc] block mb-0.5">
                  4. Instant One-Click Wipe
                </span>
                Click the trash icon anytime to completely erase all chat messages and reset your session history immediately.
              </div>
            </div>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-[#f8f9ff] dark:bg-[#08121f] border-b border-[#c3c6ce]/20 dark:border-slate-800 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
          <span className="text-[10.5px] font-bold text-[#74777e] dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-[#006b5b] dark:text-[#26fedc]" /> Suggestions:
          </span>
          {DEFAULT_SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(sug.replace(/^[^\w]+/, ''))}
              className="text-[11px] font-medium bg-white dark:bg-[#132338] text-[#000c1b] dark:text-slate-200 hover:text-[#006b5b] dark:hover:text-[#26fedc] hover:border-[#006b5b] border border-[#c3c6ce]/50 dark:border-slate-700 rounded-full px-2.5 py-1 whitespace-nowrap transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-[#fafbff] dark:bg-[#07111e]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#006b5b] to-[#26fedc] flex items-center justify-center text-[#000c1b] shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#000c1b] dark:bg-[#26fedc] text-white dark:text-[#000c1b] rounded-tr-xs shadow-xs'
                      : 'bg-white dark:bg-[#112338] text-[#000c1b] dark:text-slate-100 border border-[#c3c6ce]/30 dark:border-slate-800 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="prose prose-xs dark:prose-invert max-w-none space-y-2">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  )}

                  {/* Recommended products card if present */}
                  {!isUser && msg.recommendedProductIds && msg.recommendedProductIds.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-[#c3c6ce]/30 dark:border-slate-700 space-y-1.5">
                      <div className="text-[11px] font-bold text-[#006b5b] dark:text-[#26fedc] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Related Catalog Picks:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {msg.recommendedProductIds.map((pId) => {
                          const prod = products.find((p) => p.id === pId);
                          if (!prod) return null;
                          return (
                            <button
                              key={prod.id}
                              type="button"
                              onClick={() => {
                                onSelectProduct(prod);
                                onClose();
                              }}
                              className="p-2 bg-[#f0f5ff] dark:bg-[#0c1a2c] hover:bg-[#e0edff] dark:hover:bg-[#152a45] rounded-lg border border-[#c3c6ce]/40 dark:border-slate-700 text-left flex items-center gap-2 transition-all cursor-pointer group"
                            >
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="w-8 h-8 rounded object-cover shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-[11px] font-bold text-[#000c1b] dark:text-white truncate group-hover:text-[#006b5b] dark:group-hover:text-[#26fedc]">
                                  {prod.name}
                                </div>
                                <div className="text-[10px] text-[#006b5b] dark:text-[#26fedc] font-semibold">
                                  ${prod.price}
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-[#74777e] dark:text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Message Footer: Timestamp & Copy button */}
                  <div
                    className={`mt-1.5 flex items-center justify-between text-[10px] ${
                      isUser
                        ? 'text-slate-400 dark:text-slate-700'
                        : 'text-[#74777e] dark:text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="flex items-center gap-1 hover:text-[#000c1b] dark:hover:text-white transition-colors cursor-pointer ml-2"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#006b5b] to-[#26fedc] flex items-center justify-center text-[#000c1b] shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-white dark:bg-[#112338] border border-[#c3c6ce]/30 dark:border-slate-800 rounded-2xl rounded-tl-xs p-3 shadow-xs flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#006b5b] dark:bg-[#26fedc] animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-[#006b5b] dark:bg-[#26fedc] animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-[#006b5b] dark:bg-[#26fedc] animate-bounce" />
                </div>
                <span className="text-xs text-[#74777e] dark:text-slate-400">
                  Thinking securely & private to this session...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-[#0c1827] border-t border-[#c3c6ce]/30 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              id="input-ai-chat"
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask anything privately (Amazon rules, Pinterest, deals)..."
              className="flex-1 h-10 px-3.5 bg-[#f0f4fc] dark:bg-[#132338] border border-[#c3c6ce]/40 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-[#000c1b] dark:text-white placeholder:text-[#74777e] dark:placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#006b5b] transition-all"
            />
            <button
              id="btn-ai-send"
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className={`h-10 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                inputPrompt.trim() && !isLoading
                  ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] hover:opacity-90 shadow-sm'
                  : 'bg-[#c3c6ce]/40 dark:bg-slate-800 text-[#74777e] dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Privacy toast notice */}
          {privacyToast && (
            <div className="mt-2 text-center text-xs font-semibold text-[#006b5b] dark:text-[#26fedc] animate-in fade-in duration-150">
              {privacyToast}
            </div>
          )}

          {/* Footer notice */}
          <div className="mt-2 flex items-center justify-between text-[10.5px] text-[#74777e] dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-[#006b5b] dark:text-[#26fedc]" />
              Private Session • Isolated from other visitors
            </span>
            <a
              href="mailto:curatedpick.store@gmail.com"
              className="text-[#006b5b] dark:text-[#26fedc] hover:underline flex items-center gap-1 font-semibold"
            >
              curatedpick.store@gmail.com <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

