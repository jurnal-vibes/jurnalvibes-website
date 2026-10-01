'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { X, Send, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export const ChatbotButton: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Halo! Sampurasun! 👋 Selamat datang di Jurnal Vibes AI. Ada berita terkini, rekomendasi kuliner Cikole, tempat wisata Sukabumi, info loker, atau panduan Halo Jurnal yang ingin kamu tanyakan?'
    }
  ]);

  const containerRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [hasActiveAudio, setHasActiveAudio] = useState<boolean>(false);

  // Monitor active audio player to avoid overlapping controls
  useEffect(() => {
    const checkAudio = () => {
      setHasActiveAudio(document.body.getAttribute('data-audio-player') === 'active');
    };
    checkAudio();
    const observer = new MutationObserver(checkAudio);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-audio-player'] });
    return () => observer.disconnect();
  }, []);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Keep open unless user explicitly closes or clicks outside
      }
    };
    if (isChatOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChatOpen]);

  // Auto scroll chat to bottom when messages update or AI is typing
  useEffect(() => {
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen, isAiTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isAiTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsAiTyping(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: query,
          history: messages
        })
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi asisten AI');
      }

      const data = await response.json();
      const aiReply =
        data.reply ||
        'Terima kasih! Ada hal lain seputar Sukabumi atau Jurnal Vibes yang ingin kamu tanyakan?';

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiReply
        }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Maaf, sedang ada kendala jaringan saat menghubungkan ke asisten cerdas. Silakan coba kembali sesaat lagi.'
        }
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: 'Halo! Sampurasun! 👋 Selamat datang di Jurnal Vibes AI. Ada berita terkini, rekomendasi kuliner Cikole, tempat wisata Sukabumi, info loker, atau panduan Halo Jurnal yang ingin kamu tanyakan?'
      }
    ]);
    setInputText('');
  };

  // Helper untuk merender teks dengan indentasi gantung rapi, bullet terstruktur, dan penekanan judul
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');

    const renderLineContent = (content: string) => {
      // Cek apakah ada format "Nama Tempat: Keterangan" atau "Nama Tempat. Keterangan"
      const headingMatch = content.match(/^([^.:]{2,45})([.:])\s+(.+)/);
      if (!content.includes('*') && headingMatch) {
        const title = headingMatch[1];
        const separator = headingMatch[2];
        const desc = headingMatch[3];
        return (
          <>
            <strong className="font-bold text-on-surface dark:text-slate-100">
              {title}{separator}
            </strong>{' '}
            <span className="text-on-surface/90 dark:text-slate-200">{desc}</span>
          </>
        );
      }

      // Pisahkan teks jika ada sisa tanda bintang (*teks* atau **teks**)
      const parts = content.split(/(\*{1,2}.*?\*{1,2})/g);
      return parts.map((part, pIdx) => {
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          const innerText = part.replace(/^\*+|\*+$/g, '');
          return (
            <strong key={pIdx} className="font-bold text-on-surface dark:text-slate-100">
              {innerText}
            </strong>
          );
        }
        return part.replace(/\*/g, '');
      });
    };

    return (
      <div className="flex flex-col gap-1 w-full">
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim();

          // Baris kosong
          if (!trimmed) {
            return <div key={lineIdx} className="h-1" />;
          }

          // Cek list bernomor (contoh: "1. ", "2. ")
          const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)/);
          // Cek bullet point (contoh: "• ", "- ", "* ")
          const bulletMatch = trimmed.match(/^([•\-\*])\s+(.+)/);

          if (numberedMatch) {
            const num = numberedMatch[1];
            const content = numberedMatch[2];
            return (
              <div key={lineIdx} className="flex items-start gap-2.5 my-1 pl-0.5">
                <span className="shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary/10 dark:bg-primary/25 text-primary dark:text-blue-300 font-bold text-[11px] mt-0.5 select-none shadow-2xs">
                  {num}
                </span>
                <div className="flex-1 leading-relaxed text-xs sm:text-sm">
                  {renderLineContent(content)}
                </div>
              </div>
            );
          }

          if (bulletMatch) {
            const content = bulletMatch[2];
            return (
              <div key={lineIdx} className="flex items-start gap-2.5 my-1 pl-1">
                <span className="shrink-0 w-2 h-2 rounded-full bg-primary dark:bg-blue-400 mt-2 select-none shadow-2xs" />
                <div className="flex-1 leading-relaxed text-xs sm:text-sm">
                  {renderLineContent(content)}
                </div>
              </div>
            );
          }

          // Paragraf biasa
          return (
            <p key={lineIdx} className="leading-relaxed text-xs sm:text-sm my-0.5">
              {renderLineContent(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={containerRef}>
      {/* ----------------- CHAT BOX SIDEBAR DRAWER (PENUH) ----------------- */}
      {isChatOpen && (
        <>
          {/* Backdrop untuk klik di luar */}
          <div
            className="fixed inset-0 bg-black/20 sm:bg-black/10 z-50 backdrop-blur-[1px] transition-opacity"
            onClick={() => setIsChatOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[400px] md:w-[430px] h-screen bg-surface dark:bg-slate-900 shadow-2xl border-l border-outline-variant/60 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* 1. Header Chat */}
            <div className="bg-primary text-white p-4 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center shrink-0">
                  <img
                    src="/chatbot-full-logo.webp"
                    alt="Jurnal Vibes AI"
                    className="h-10 w-auto object-contain drop-shadow-md"
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-button text-sm font-bold leading-tight flex items-center gap-1.5">
                    Jurnal Vibes AI
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30 animate-pulse shrink-0" />
                    <span className="text-[11px] text-white/90 font-medium">
                      Online &amp; Siap Membantu
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-white/85 hover:text-white px-2.5 py-1 rounded-md hover:bg-white/15 transition-colors cursor-pointer"
                  title="Reset Percakapan"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  title="Tutup Chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2. Area Percakapan (Body Chat) */}
            <div className="flex-1 p-4 overflow-y-auto bg-surface-container-lowest dark:bg-slate-950/60 flex flex-col gap-3 text-sm">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[88%] ${
                    msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl shadow-xs text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-primary text-on-primary rounded-br-none font-medium'
                        : 'bg-surface-container dark:bg-slate-800 text-on-surface rounded-bl-none border border-outline-variant dark:border-slate-700'
                    }`}
                  >
                    {renderFormattedText(msg.text)}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isAiTyping && (
                <div className="self-start flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-none bg-surface-container dark:bg-slate-800 border border-outline-variant dark:border-slate-700 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce" />
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick Action Chips (Berjejer ke Samping di Bawah) */}
            <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0 bg-surface dark:bg-slate-900 border-t border-outline-variant/30 dark:border-slate-800">
              <Link
                href="/halo-jurnal"
                onClick={() => setIsChatOpen(false)}
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-colors shrink-0 whitespace-nowrap cursor-pointer"
              >
                <span>Hallo Jurnal</span>
              </Link>

              <button
                onClick={() => handleSendMessage('Rekomendasi kuliner Cikole Sukabumi')}
                disabled={isAiTyping}
                className="bg-surface-container-high hover:bg-primary hover:text-white text-on-surface px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 whitespace-nowrap border border-outline-variant dark:border-slate-700 cursor-pointer disabled:opacity-50"
              >
                Kuliner Cikole
              </button>
              <button
                onClick={() => handleSendMessage('Berita terbaru Sukabumi hari ini')}
                disabled={isAiTyping}
                className="bg-surface-container-high hover:bg-primary hover:text-white text-on-surface px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 whitespace-nowrap border border-outline-variant dark:border-slate-700 cursor-pointer disabled:opacity-50"
              >
                Berita Terbaru
              </button>
              <button
                onClick={() => handleSendMessage('Info lowongan kerja Sukabumi terbaru')}
                disabled={isAiTyping}
                className="bg-surface-container-high hover:bg-primary hover:text-white text-on-surface px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 whitespace-nowrap border border-outline-variant dark:border-slate-700 cursor-pointer disabled:opacity-50"
              >
                Info Loker
              </button>
              <button
                onClick={() => handleSendMessage('Bagaimana cara membuat laporan di Halo Jurnal?')}
                disabled={isAiTyping}
                className="bg-surface-container-high hover:bg-primary hover:text-white text-on-surface px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 whitespace-nowrap border border-outline-variant dark:border-slate-700 cursor-pointer disabled:opacity-50"
              >
                Cara Lapor Aduan
              </button>
            </div>

            {/* 3. Footer Chat (Input Area) */}
            <div className="p-3 sm:p-4 bg-surface dark:bg-slate-900 border-t border-outline-variant/30 dark:border-slate-800 shrink-0">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={isAiTyping ? 'AI sedang merespons...' : 'Tanya sesuatu...'}
                  disabled={isAiTyping}
                  className="flex-1 bg-surface-container dark:bg-slate-800 rounded-xl px-4 py-2.5 border border-outline-variant dark:border-slate-700 focus:border-primary outline-none text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 transition-colors disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isAiTyping}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                    inputText.trim() && !isAiTyping
                      ? 'bg-primary text-on-primary border-primary hover:scale-105 shadow-xs'
                      : 'bg-surface-container dark:bg-slate-800 text-on-surface-variant/40 border-outline-variant dark:border-slate-700 cursor-not-allowed'
                  }`}
                  title="Kirim pesan"
                >
                  {isAiTyping ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Main Floating Action Button (Full Illustration Image) */}
      {!isChatOpen && (
        <div
          className={`fixed right-4 sm:right-8 z-40 flex flex-col items-end transition-all duration-300 ${
            hasActiveAudio ? 'bottom-36 sm:bottom-24' : 'bottom-20 sm:bottom-8'
          }`}
        >
          <button
            aria-label="Tanya AI"
            onClick={() => setIsChatOpen(true)}
            className="relative transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer focus:outline-none"
            title="Tanya Jurnal Vibes AI"
          >
            <img
              src="/chatbot-full-logo.webp"
              alt="Jurnal Vibes AI"
              className="h-12 sm:h-14 w-auto object-contain drop-shadow-xl"
            />
          </button>
        </div>
      )}
    </div>
  );
};
