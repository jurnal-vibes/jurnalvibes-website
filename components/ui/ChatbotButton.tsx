'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, ExternalLink } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export const ChatbotButton: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Halo! 👋 Selamat datang di Jurnal Vibes AI. Ada berita, rekomendasi kuliner Cikole, atau informasi seputar Sukabumi yang ingin kamu tanyakan?'
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

  // Auto scroll chat to bottom when messages update
  useEffect(() => {
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Simulate smart AI response
    setTimeout(() => {
      let replyText = '';
      const lower = query.toLowerCase();

      if (lower.includes('kopi') || lower.includes('cikole') || lower.includes('kuliner')) {
        replyText =
          '☕ Kedai Kopi Cikole Sukabumi sedang viral dengan konsep industrial-minimalis! Menu andalannya Signature Cold Brew 18 jam & Gourmet Latte. Kamu bisa cek ulasan lengkapnya di kategori Lifestyle & Kuliner.';
      } else if (lower.includes('berita') || lower.includes('terkini') || lower.includes('update')) {
        replyText =
          '📰 Berita terbaru Sukabumi hari ini: Festival Kuliner 2024 dibanjiri pengunjung, Siswa SMAN 1 meraih Medali Emas OSN, dan Riset IoT Mahasiswa UMMI Sukabumi!';
      } else if (lower.includes('loker') || lower.includes('kerja')) {
        replyText =
          '💼 Info Loker Sukabumi: Tersedia lowongan kerja Barista Cikole, Staff Admin Digital, dan Graphic Designer. Cek halaman /loker untuk detail selengkapnya!';
      } else if (lower.includes('wisata') || lower.includes('gede') || lower.includes('cikaso')) {
        replyText =
          '🏔️ Rekomendasi Wisata Sukabumi: Pendakian Gunung Gede jalur Selabintana & keindahan 3 air terjun Curug Cikaso di Sukabumi Selatan!';
      } else {
        replyText =
          '✨ Terima kasih pertanyaannya! Jurnal Vibes AI selalu siap memberikan berita & informasi terpercaya seputar Kota dan Kabupaten Sukabumi.';
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: replyText
      };

      setMessages(prev => [...prev, aiMsg]);
    }, 600);
  };

  const handleReset = () => {
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: 'Halo! 👋 Selamat datang di Jurnal Vibes AI. Ada berita, rekomendasi kuliner Cikole, atau informasi seputar Sukabumi yang ingin kamu tanyakan?'
      }
    ]);
    setInputText('');
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
                  className={`flex flex-col max-w-[85%] ${
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
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Action Chips (Berjejer ke Samping di Bawah) */}
            <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0 bg-surface dark:bg-slate-900 border-t border-outline-variant/30 dark:border-slate-800">
              <a
                href="https://halo-jurnal-app.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-colors shrink-0 whitespace-nowrap cursor-pointer"
                onMouseEnter={() => {
                  if (typeof window !== 'undefined' && !document.head.querySelector('link[data-halo-prefetch="true"]')) {
                    const link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.href = 'https://halo-jurnal-app.vercel.app/';
                    link.setAttribute('data-halo-prefetch', 'true');
                    document.head.appendChild(link);
                  }
                }}
              >
                <span>Hallo Jurnal</span>
                <ExternalLink className="w-3 h-3 opacity-70 ml-0.5" />
              </a>

              <button
                onClick={() => handleSendMessage('Rekomendasi kuliner Cikole')}
                className="bg-surface-container-high hover:bg-primary hover:text-white text-on-surface px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 whitespace-nowrap border border-outline-variant dark:border-slate-700 cursor-pointer"
              >
                Kuliner Cikole
              </button>
              <button
                onClick={() => handleSendMessage('Berita terbaru Sukabumi')}
                className="bg-surface-container-high hover:bg-primary hover:text-white text-on-surface px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 whitespace-nowrap border border-outline-variant dark:border-slate-700 cursor-pointer"
              >
                Berita Terbaru
              </button>
              <button
                onClick={() => handleSendMessage('Info lowongan kerja')}
                className="bg-surface-container-high hover:bg-primary hover:text-white text-on-surface px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 whitespace-nowrap border border-outline-variant dark:border-slate-700 cursor-pointer"
              >
                Info Loker
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
                  placeholder="Tanya sesuatu..."
                  className="flex-1 bg-surface-container dark:bg-slate-800 rounded-xl px-4 py-2.5 border border-outline-variant dark:border-slate-700 focus:border-primary outline-none text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                    inputText.trim()
                      ? 'bg-primary text-on-primary border-primary hover:scale-105 shadow-xs'
                      : 'bg-surface-container dark:bg-slate-800 text-on-surface-variant/40 border-outline-variant dark:border-slate-700 cursor-not-allowed'
                  }`}
                  title="Kirim pesan"
                >
                  <Send className="w-4 h-4" />
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
