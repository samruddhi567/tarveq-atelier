import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, RefreshCw, ArrowRight, User as UserIcon, Shirt, ShoppingBag } from 'lucide-react';
import { Product, User } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'stylist';
  text: string;
  timestamp: string;
  recommendedProducts?: Product[];
}

interface StylistChatDrawerProps {
  user: User | null;
  token: string | null;
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  onOpenStyleDnaScanner: () => void;
  onOpenWardrobeVault: () => void;
  onSelectProduct: (product: Product) => void;
}

export const StylistChatDrawer: React.FC<StylistChatDrawerProps> = ({
  user,
  token,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  onOpen: controlledOnOpen,
  onOpenStyleDnaScanner,
  onOpenWardrobeVault,
  onSelectProduct,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isDrawerOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleOpen = controlledOnOpen || (() => setInternalOpen(true));
  const handleClose = controlledOnClose || (() => setInternalOpen(false));

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'stylist',
      text: 'Namaste! I am your TARVEQ Atelier Personal Stylist. How may I assist you with modest silhouettes, flattering Indian undertone palettes, or custom lengths today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDrawerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isDrawerOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/stylist-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text.trim(),
          userId: user?.id || 'user-customer-demo',
        }),
      });

      const data = await res.json();
      if (data.success) {
        const stylistMsg: ChatMessage = {
          id: `stylist-${Date.now()}`,
          sender: 'stylist',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendedProducts: data.recommendedProducts || [],
        };
        setMessages((prev) => [...prev, stylistMsg]);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'stylist',
          text: 'Our atelier styling line is experiencing high volume. You can also explore our curated catalog or WhatsApp our founders directly!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const starterChips = [
    'What colors glow on my skin tone?',
    'Pair something with my Wardrobe Vault',
    'Which outfit is best for hot campus weather?',
    'How do custom lengths & returns work?',
  ];

  const hasStyleDna = user?.style_dna?.is_scanned === 1;
  const userUndertone = user?.style_dna?.undertone || 'Uncalibrated';
  const userBuild = user?.style_dna?.build_proportion || 'Modest Fit';

  return (
    <>
      {/* Floating Stylist Trigger Button */}
      {!isDrawerOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-[80] bg-[#7A2E2E] hover:bg-[#5E2222] text-white px-4 py-3 rounded-full shadow-[0_10px_35px_rgba(122,46,46,0.5)] border-2 border-[#B8925A] flex items-center space-x-2 transition hover:scale-105 active:scale-95 group font-sans cursor-pointer"
          aria-label="Open TARVEQ AI Stylist Chatbot"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-[#B8925A] animate-pulse" />
          </div>
          <span className="text-xs sm:text-sm font-semibold tracking-wide">
            Ask Atelier Stylist ✨
          </span>
        </button>
      )}

      {/* Slide-in Stylist Chat Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[90] w-full sm:w-[380px] h-[100dvh] sm:h-[600px] bg-[#FBF8F3] rounded-none sm:rounded-3xl shadow-2xl border border-[#B8925A]/40 flex flex-col overflow-hidden font-sans animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#7A2E2E] to-[#4A1616] text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#B8925A]/20 flex items-center justify-center text-[#B8925A] border border-[#B8925A]/40">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold tracking-wide text-white flex items-center space-x-1.5">
                  <span>TARVEQ Personal Stylist</span>
                  <span className="text-[9px] bg-[#B8925A]/30 text-[#F3ECE1] px-1.5 py-0.2 rounded-full font-mono uppercase">
                    AI Agent
                  </span>
                </h3>
                <p className="text-[10px] text-[#F3ECE1]/80">
                  LangChain • Qwen 2.5 • Padmora Atelier Intelligence
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Smart Context Pill */}
          <div className="px-4 py-2 bg-[#F3ECE1]/50 border-b border-[#F3ECE1] flex items-center justify-between text-[11px]">
            {hasStyleDna ? (
              <span className="text-[#3F5945] font-semibold flex items-center space-x-1">
                <span>Tailoring advice for:</span>
                <strong className="text-[#261B18]">{userUndertone} • {userBuild}</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onOpenStyleDnaScanner();
                }}
                className="text-[#7A2E2E] font-bold hover:underline flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3 text-[#B8925A]" />
                <span>⚡ Calibrate Style DNA for Custom Sizing</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                handleClose();
                onOpenWardrobeVault();
              }}
              className="text-[#B8925A] hover:text-[#7A2E2E] font-semibold text-[10px] flex items-center space-x-0.5"
            >
              <Shirt className="w-3 h-3" />
              <span>Vault</span>
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FBF8F3]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#7A2E2E] text-white rounded-br-none'
                      : 'bg-white text-[#261B18] border border-[#F3ECE1] rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* In-Chat Interactive Product Recommendation Cards */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="w-full max-w-[90%] space-y-2 pt-1">
                    <span className="text-[10px] font-bold text-[#B8925A] uppercase tracking-wider block">
                      Recommended Atelier Piece:
                    </span>
                    {msg.recommendedProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white p-2.5 rounded-xl border border-[#B8925A]/40 shadow-sm flex items-center space-x-2.5 hover:border-[#7A2E2E] transition"
                      >
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-11 h-11 object-cover rounded-lg border border-black/5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-[11px] font-bold text-[#261B18] truncate">
                            {prod.name}
                          </h5>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-[#7A2E2E]">
                              ₹{prod.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[9px] bg-[#3F5945]/10 text-[#3F5945] font-bold px-1.5 py-0.2 rounded">
                              {prod.default_match_score || 96}% Match
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            handleClose();
                            onSelectProduct(prod);
                          }}
                          className="p-1.5 bg-[#FBF8F3] hover:bg-[#7A2E2E] hover:text-white text-[#7A2E2E] rounded-lg border border-[#F3ECE1] transition shrink-0"
                          title="View & Customize"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <span className="text-[9px] text-[#261B18]/40 px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-xs text-[#261B18]/60 bg-white p-3 rounded-2xl w-fit border border-[#F3ECE1]">
                <RefreshCw className="w-3.5 h-3.5 text-[#B8925A] animate-spin" />
                <span className="italic">Atelier Stylist is considering your palette & proportions...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Chips */}
          <div className="px-3 py-2 bg-[#F3ECE1]/30 border-t border-[#F3ECE1] overflow-x-auto flex space-x-1.5 no-scrollbar">
            {starterChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-[#F3ECE1] text-[#261B18] text-[10px] font-medium rounded-full border border-[#F3ECE1] transition shadow-2xs shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-[#F3ECE1] flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about drape, undertones, custom lengths..."
              className="flex-1 px-3 py-2 bg-[#FBF8F3] border border-[#F3ECE1] rounded-full text-xs text-[#261B18] focus:outline-none focus:border-[#B8925A]"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="w-8 h-8 rounded-full bg-[#7A2E2E] hover:bg-[#5E2222] text-white flex items-center justify-center transition disabled:opacity-40 shrink-0 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
