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
      text: 'Halo! Sampurasun! 👋 Selamat datang di Jurnal Wave AI. Ada berita terkini, rekomendasi kuliner Cikole, tempat wisata Sukabumi, info loker, atau panduan Halo Jurnal yang ingin kamu tanyakan?'
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

  // Listen for open-jurnal-wave-ai event from mobile menu or elsewhere
  useEffect(() => {
    const handleOpenAi = () => setIsChatOpen(true);
    window.addEventListener('open-jurnal-wave-ai', handleOpenAi);
    return () => window.removeEventListener('open-jurnal-wave-ai', handleOpenAi);
  }, []);

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
        'Terima kasih! Ada hal lain seputar Sukabumi atau Jurnal Wave yang ingin kamu tanyakan?';

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
        text: 'Halo! Sampurasun! 👋 Selamat datang di Jurnal Wave AI. Ada berita terkini, rekomendasi kuliner Cikole, tempat wisata Sukabumi, info loker, atau panduan Halo Jurnal yang ingin kamu tanyakan?'
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
              <div key={lineIdx} className="flex items-start gap-2 my-1 pl-0.5">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary/75 dark:bg-blue-400 mt-2 select-none" />
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
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] md:w-[430px] h-[100dvh] max-h-[100dvh] bg-surface dark:bg-slate-900 shadow-2xl border-l border-outline-variant/60 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* 1. Header Chat (Elegan, Sejuk di Mata, & Modern di Mobile & Desktop) */}
            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 shadow-xs shrink-0 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center shrink-0">
                  <img
                    src="/chatbot-full-logo.webp"
                    alt="Jurnal Wave AI"
                    className="h-9 sm:h-10 w-auto object-contain drop-shadow-sm"
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-button text-sm font-bold leading-tight flex items-center gap-1.5 text-slate-900 dark:text-white">
                    Jurnal Wave AI
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse shrink-0" />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Online &amp; Siap Membantu
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Reset Percakapan"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Tutup Chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2. Area Percakapan (Body Chat) */}
            <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto bg-slate-50/90 dark:bg-slate-950/60 flex flex-col gap-3 text-sm">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[88%] ${
                    msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <div
                    className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xs text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-br-none font-medium'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/80 dark:border-slate-700 shadow-2xs'
                    }`}
                  >
                    {renderFormattedText(msg.text)}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isAiTyping && (
                <div className="self-start flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl rounded-bl-none bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick Action Chips (Berjejer ke Samping di Bawah) */}
            <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
              <Link
                href="/halo-jurnal"
                onClick={() => setIsChatOpen(false)}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-colors shrink-0 whitespace-nowrap cursor-pointer"
              >
                <span>Hallo Jurnal</span>
              </Link>

              <button
                onClick={() => handleSendMessage('Rekomendasi kuliner Cikole Sukabumi')}
                disabled={isAiTyping}
                className="bg-slate-100 dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 whitespace-nowrap border border-slate-200/80 dark:border-slate-700 cursor-pointer disabled:opacity-50"
              >
                Kuliner Cikole
              </button>
              <button
                onClick={() => handleSendMessage('Berita terbaru Sukabumi hari ini')}
                disabled={isAiTyping}
                className="bg-slate-100 dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 whitespace-nowrap border border-slate-200/80 dark:border-slate-700 cursor-pointer disabled:opacity-50"
              >
                Berita Terbaru
              </button>
              <button
                onClick={() => handleSendMessage('Info lowongan kerja Sukabumi terbaru')}
                disabled={isAiTyping}
                className="bg-slate-100 dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 whitespace-nowrap border border-slate-200/80 dark:border-slate-700 cursor-pointer disabled:opacity-50"
              >
                Info Loker
              </button>
              <button
                onClick={() => handleSendMessage('Bagaimana cara membuat laporan di Halo Jurnal?')}
                disabled={isAiTyping}
                className="bg-slate-100 dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 whitespace-nowrap border border-slate-200/80 dark:border-slate-700 cursor-pointer disabled:opacity-50"
              >
                Cara Lapor Aduan
              </button>
            </div>

            {/* 3. Footer Chat (Input Area) */}
            <div className="p-3 sm:p-4 pb-safe pb-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shrink-0">
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
                  className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 sm:py-2.5 border border-slate-200/90 dark:border-slate-700 focus:border-slate-400 outline-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isAiTyping}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                    inputText.trim() && !isAiTyping
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100 hover:scale-105 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                  }`}
                  title="Kirim pesan"
                >
                  {isAiTyping ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Main Floating Action Button (Sama Persis Web & HP) */}
      {!isChatOpen && (
        <div
          className={`fixed right-4 sm:right-8 z-40 flex flex-col items-end transition-all duration-300 ${
            hasActiveAudio ? 'bottom-28 sm:bottom-24' : 'bottom-5 sm:bottom-8'
          }`}
        >
          <button
            aria-label="Tanya Jurnal Wave AI"
            onClick={() => setIsChatOpen(true)}
            className="relative transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer focus:outline-none"
            title="Tanya Jurnal Wave AI"
          >
            <img
              src="/chatbot-full-logo.webp"
              alt="Jurnal Wave AI"
              className="h-12 sm:h-14 w-auto object-contain drop-shadow-xl"
            />
          </button>
        </div>
      )}
    </div>
  );
};
