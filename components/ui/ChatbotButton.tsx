'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, MessageCircle, ExternalLink } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const ChatbotButton: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Halo! 👋 Selamat datang di Jurnal Vibes AI. Ada berita, rekomendasi kuliner Cikole, atau informasi seputar Sukabumi yang ingin kamu tanyakan?',
      time: 'Just now'
    }
  ]);

  const containerRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Keep open unless user explicitly closes or clicks outside on desktop
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

  const getTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: getTimeString()
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
        text: replyText,
        time: getTimeString()
      };

      setMessages(prev => [...prev, aiMsg]);
    }, 600);
  };

  return (
    <div ref={containerRef} className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-50 flex flex-col items-end">
      {/* ----------------- CHAT BOX WINDOW MODAL ----------------- */}
      {isChatOpen && (
        <div className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-50 w-[calc(100vw-2rem)] max-w-[390px] h-[480px] sm:h-[520px] bg-surface dark:bg-slate-900 rounded-2xl shadow-2xl border border-outline-variant dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* 1. Header Chat */}
          <div className="bg-gradient-to-r from-primary-dark to-primary text-white p-4 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-white">
                  <Bot className="w-6 h-6" />
                </div>
                {/* Online Badge */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-primary-dark rounded-full" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-button text-sm font-bold leading-tight">
                  Jurnal Vibes AI
                </h3>
                <span className="text-[11px] text-white/90 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online &amp; Siap Membantu
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Tutup Chat"
            >
              <X className="w-5 h-5" />
            </button>
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
                <span className="text-[10px] text-on-surface-variant/70 mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            ))}
            <div ref={chatBottomRef} />

            {/* Quick Action Buttons (Tombol Aksi Cepat) */}
            <div className="mt-2 pt-2 border-t border-outline-variant/60 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Aksi Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <a
                  href="https://halo-jurnal-app.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => {
                    if (typeof window !== 'undefined' && !document.head.querySelector('link[data-halo-prefetch="true"]')) {
                      const link = document.createElement('link');
                      link.rel = 'prefetch';
                      link.href = 'https://halo-jurnal-app.vercel.app/';
                      link.setAttribute('data-halo-prefetch', 'true');
                      document.head.appendChild(link);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Hallo Jurnal</span>
                  <ExternalLink className="w-3 h-3 opacity-70 ml-0.5" />
                </a>

                <button
                  onClick={() => handleSendMessage('Rekomendasi kuliner Cikole')}
                  className="bg-surface-container-high hover:bg-primary hover:text-white text-on-surface px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border border-outline-variant"
                >
                  ☕ Kuliner Cikole
                </button>
                <button
                  onClick={() => handleSendMessage('Berita terbaru Sukabumi')}
                  className="bg-surface-container-high hover:bg-primary hover:text-white text-on-surface px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border border-outline-variant"
                >
                  📰 Berita Terbaru
                </button>
                <button
                  onClick={() => handleSendMessage('Info lowongan kerja')}
                  className="bg-surface-container-high hover:bg-primary hover:text-white text-on-surface px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border border-outline-variant"
                >
                  💼 Info Loker
                </button>
              </div>
            </div>
          </div>

          {/* 3. Footer Chat (Input Area) */}
          <div className="p-3 bg-surface dark:bg-slate-900 border-t border-outline-variant dark:border-slate-800 shrink-0">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-surface-container dark:bg-slate-800 rounded-full px-4 py-2 border border-outline-variant dark:border-slate-700 focus-within:border-primary transition-colors"
            >
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Ketik pesan Anda..."
                className="flex-1 bg-transparent text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`p-2 rounded-full transition-all cursor-pointer ${
                  inputText.trim()
                    ? 'bg-primary text-on-primary hover:scale-105'
                    : 'text-on-surface-variant/40 cursor-not-allowed'
                }`}
                title="Kirim pesan"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Floating Action Button (Circular Red Button) */}
      {!isChatOpen && (
        <button
          aria-label="Tanya AI"
          onClick={() => setIsChatOpen(true)}
          className="w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer border border-white/20 hover:scale-105 active:scale-95 group"
          title="Tanya Jurnal Vibes AI"
        >
          <Bot className="w-7 h-7 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
};
