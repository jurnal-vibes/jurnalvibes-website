'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Check,
  Edit3,
  Trash2,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Power,
  HelpCircle,
  X,
  Vote,
  Sparkles,
} from 'lucide-react'
import { Poll } from '@/types'

export default function AdminPollingPage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPollId, setEditingPollId] = useState<string | null>(null)

  // Form State
  const [formQuestion, setFormQuestion] = useState('')
  const [formCategory, setFormCategory] = useState('Sport & E-Sport')
  const [formOptions, setFormOptions] = useState<string[]>(['', '', ''])
  const [formIsActive, setFormIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // AI Assist State
  const [aiTopicInput, setAiTopicInput] = useState('')
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)

  // Tampilkan toast selama 3.5 detik
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Load seluruh polling dari server
  const loadPolls = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/polls?all=true', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          setPolls(json.data)
        }
      }
    } catch (err) {
      console.error('Failed to load polls:', err)
      showToast('Gagal memuat data polling dari server.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPolls()
  }, [])

  // Buka modal untuk Tambah Polling Baru
  const handleOpenCreateModal = () => {
    setEditingPollId(null)
    setFormQuestion('')
    setFormCategory('Sport & E-Sport')
    setFormOptions(['', '', ''])
    setFormIsActive(true)
    setAiTopicInput('')
    setIsModalOpen(true)
  }

  // Buka modal untuk Edit Polling yang sudah ada
  const handleOpenEditModal = (poll: Poll) => {
    setEditingPollId(poll.id)
    setFormQuestion(poll.question)
    setFormCategory(poll.category || 'Umum')
    setFormOptions(poll.options.map((o) => o.text))
    setFormIsActive(Boolean(poll.isActive))
    setAiTopicInput('')
    setIsModalOpen(true)
  }

  // Tambah baris opsi baru di modal
  const handleAddOptionField = () => {
    if (formOptions.length >= 6) {
      showToast('Maksimal 6 pilihan jawaban.')
      return
    }
    setFormOptions([...formOptions, ''])
  }

  // Hapus baris opsi di modal
  const handleRemoveOptionField = (idx: number) => {
    if (formOptions.length <= 2) {
      showToast('Minimal harus ada 2 pilihan jawaban.')
      return
    }
    setFormOptions(formOptions.filter((_, i) => i !== idx))
  }

  // Update isi opsi jawaban tertentu
  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...formOptions]
    updated[idx] = val
    setFormOptions(updated)
  }

  // Panggil AI Generator untuk membuat draft polling otomatis
  const handleGenerateAi = async () => {
    try {
      setIsGeneratingAi(true)
      const res = await fetch('/api/polls/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopicInput }),
      })

      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          setFormQuestion(json.data.question || '')
          if (json.data.category) {
            setFormCategory(json.data.category)
          }
          if (Array.isArray(json.data.options) && json.data.options.length >= 2) {
            setFormOptions(json.data.options)
          }
          showToast('✨ Draf polling otomatis berhasil disusun oleh AI!')
        }
      } else {
        showToast('Gagal menghasilkan polling otomatis. Silakan coba lagi.')
      }
    } catch (err) {
      console.error('Error generating AI poll:', err)
      showToast('Terjadi kesalahan saat memanggil asisten AI.')
    } finally {
      setIsGeneratingAi(false)
    }
  }

  // Simpan Polling (Tambah atau Edit)
  const handleSavePoll = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formQuestion.trim()) {
      showToast('Pertanyaan polling tidak boleh kosong!')
      return
    }

    const validOptions = formOptions.map((o) => o.trim()).filter((o) => o.length > 0)
    if (validOptions.length < 2) {
      showToast('Minimal harus ada 2 pilihan jawaban yang valid.')
      return
    }

    try {
      setIsSaving(true)

      if (editingPollId) {
        // Edit Polling
        const currentPoll = polls.find((p) => p.id === editingPollId)
        const updatedOptions = validOptions.map((text) => {
          const matched = currentPoll?.options.find((o) => o.text.trim().toLowerCase() === text.toLowerCase())
          return {
            text,
            votes: matched ? matched.votes : 0,
          }
        })

        const res = await fetch('/api/polls', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingPollId,
            question: formQuestion.trim(),
            category: formCategory.trim(),
            isActive: formIsActive,
            options: updatedOptions,
          }),
        })

        if (res.ok) {
          showToast('✅ Polling berhasil diperbarui.')
          setIsModalOpen(false)
          loadPolls()
        } else {
          showToast('Gagal memperbarui polling.')
        }
      } else {
        // Tambah Polling Baru
        const res = await fetch('/api/polls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: formQuestion.trim(),
            category: formCategory.trim(),
            isActive: formIsActive,
            options: validOptions,
          }),
        })

        if (res.ok) {
          showToast('🎉 Polling baru berhasil diterbitkan!')
          setIsModalOpen(false)
          loadPolls()
        } else {
          showToast('Gagal menerbitkan polling baru.')
        }
      }
    } catch (err) {
      console.error('Error saving poll:', err)
      showToast('Terjadi kesalahan sistem saat menyimpan polling.')
    } finally {
      setIsSaving(false)
    }
  }

  // Toggle status aktif/nonaktif polling di beranda
  const handleToggleActive = async (pollId: string, currentActive: boolean) => {
    const nextState = !currentActive
    try {
      const res = await fetch('/api/polls', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pollId, isActive: nextState }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.success) {
        showToast(
          nextState
            ? '✅ Polling berhasil ditayangkan di Beranda.'
            : '⏸️ Polling berhasil dinonaktifkan dari Beranda.'
        )
        loadPolls()
      } else {
        showToast(json.message || 'Gagal mengubah status polling.')
      }
    } catch {
      showToast('Terjadi kesalahan jaringan saat mengubah status polling.')
    }
  }

  // Hapus polling
  const handleDelete = async (pollId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus polling ini secara permanen?')) return

    try {
      const res = await fetch(`/api/polls?id=${encodeURIComponent(pollId)}`, {
        method: 'DELETE',
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.success) {
        showToast('🗑️ Polling berhasil dihapus.')
        loadPolls()
      } else {
        showToast(json.message || 'Gagal menghapus polling.')
      }
    } catch {
      showToast('Terjadi kesalahan jaringan saat menghapus polling.')
    }
  }

  // Polling aktif saat ini di beranda (hanya jika isActive bernilai true)
  const activePoll = polls.find((p) => Boolean(p.isActive)) || null

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Halaman Standar Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Vote className="w-5 h-5 text-[#c00015]" />
            <span>Kelola Polling Pembaca</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur pertanyaan interaktif, kelola opsi pilihan, serta pantau hasil suara pembaca di beranda website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadPolls}
            disabled={isLoading}
            className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-2xs cursor-pointer hover:border-[#c00015]/40 hover:text-[#c00015]"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-semibold transition shadow-2xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Polling Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Section: Live Preview Beranda (Proporsional, Selaras, & Responsif) */}
      {activePoll ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3.5">
          {/* Top Bar Preview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#c00015] rounded-full shrink-0" />
              <h2 className="font-heading font-extrabold text-xs sm:text-sm text-slate-900 tracking-wider uppercase">
                POLLING PEMBACA
              </h2>
              <span className="text-[9px] sm:text-[10px] font-bold bg-[#c00015] text-white px-2 py-0.5 rounded uppercase tracking-wider">
                Live di Beranda
              </span>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => handleToggleActive(activePoll.id, true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 text-[11px] sm:text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer select-none active:scale-95"
                title="Hentikan penayangan polling ini di Beranda"
              >
                <Power className="w-3 h-3 text-slate-400" />
                <span>Nonaktifkan</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenEditModal(activePoll)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 text-[11px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#c00015] hover:border-[#c00015]/30 transition-colors cursor-pointer select-none active:scale-95"
              >
                <Edit3 className="w-3 h-3" />
                <span>Ubah Polling</span>
              </button>
            </div>
          </div>

          {/* Grid 2-Kolom Compact & Rapi untuk Desktop, Tablet, & Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-start w-full">
            {/* Kolom Kiri: Konteks & Pertanyaan */}
            <div className="flex flex-col justify-between h-full">
              <div>
                {activePoll.category && (
                  <span className="inline-block text-[#c00015] font-bold text-[10px] uppercase tracking-wider mb-1">
                    {activePoll.category}
                  </span>
                )}
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 leading-snug mb-1.5">
                  {activePoll.question}
                </h3>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
                <span>✓ Pratinjau tampilan beranda portal</span>
                <span className="font-semibold text-slate-700">
                  {(activePoll.totalVotes || 0).toLocaleString('id-ID')} suara masuk
                </span>
              </div>
            </div>

            {/* Kolom Kanan: Rekapitulasi Data Analitik Suara Pembaca (Selaras 100%) */}
            <div className="flex flex-col gap-2">
              {activePoll.options.map((opt) => {
                const total = activePoll.totalVotes || 0
                const percentage = total > 0 ? Math.round((opt.votes / total) * 100) : 0

                return (
                  <div
                    key={opt.id}
                    className="py-2 px-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2.5 text-xs">
                      <span className="font-semibold text-slate-800 truncate">
                        {opt.text}
                      </span>
                      <div className="flex items-center gap-2 shrink-0 text-xs">
                        <span className="text-slate-500 text-[10px] sm:text-[11px]">
                          {opt.votes.toLocaleString('id-ID')} suara
                        </span>
                        <span className="font-bold text-[#c00015] min-w-8 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Selaras Bersih */}
                    <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#c00015] transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center bg-white rounded-xl border border-dashed border-slate-300">
          <Vote className="w-8 h-8 text-slate-400 mx-auto mb-1.5 opacity-60" />
          <p className="text-sm font-semibold text-slate-800">
            Saat ini tidak ada polling yang tayang di Beranda
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Klik tombol &quot;Nonaktif&quot; pada salah satu topik polling di tabel bawah untuk menayangkannya, atau klik &quot;Buat Polling Baru&quot;.
          </p>
        </div>
      )}

      {/* 3. Section: Tabel Arsip Seluruh Polling */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-800">
            Semua Daftar Polling ({polls.length})
          </span>
          <span className="text-[11px]">Daftar riwayat seluruh topik polling pembaca</span>
        </div>

        <div className="w-full overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full min-w-[750px] table-fixed text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 min-w-[280px]">Pertanyaan & Kategori</th>
                <th className="py-3 px-4 min-w-[220px]">Opsi Jawaban</th>
                <th className="py-3 px-4 whitespace-nowrap w-[110px] text-center">Total Suara</th>
                <th className="py-3 px-4 whitespace-nowrap w-[120px] text-center">Status Tayang</th>
                <th className="py-3 px-4 whitespace-nowrap w-[100px] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {polls.map((p) => {
                const isActive = Boolean(p.isActive)
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isActive ? 'bg-slate-50/50' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 min-w-[280px] align-top">
                      <p className="font-semibold text-slate-900 leading-snug">
                        {p.question}
                      </p>
                      <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80">
                        {p.category || 'Umum'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 min-w-[220px] align-top">
                      <ul className="space-y-1 text-xs text-slate-600">
                        {p.options.map((opt) => (
                          <li key={opt.id} className="flex items-center justify-between gap-2">
                            <span className="truncate max-w-[170px]">• {opt.text}</span>
                            <span className="font-medium text-[11px] text-slate-500">
                              {opt.votes}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 whitespace-nowrap align-middle">
                      {(p.totalVotes || 0).toLocaleString('id-ID')}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p.id, isActive)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer select-none active:scale-95 ${
                          isActive
                            ? 'bg-[#c00015] hover:bg-[#a00012] text-white shadow-2xs'
                            : 'text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200'
                        }`}
                        title={
                          isActive
                            ? 'Sedang tayang di Beranda. Klik untuk menonaktifkan.'
                            : 'Nonaktif. Klik untuk menayangkan di Beranda.'
                        }
                      >
                        <Power className="w-3 h-3" />
                        <span>{isActive ? 'Aktif' : 'Nonaktif'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#c00015] hover:border-[#c00015]/40 hover:bg-red-50/40 transition cursor-pointer"
                          title="Edit Polling"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition cursor-pointer"
                          title="Hapus Polling"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {polls.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    Tidak ada data polling ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Polling (Bisa Manual & Rekomendasi AI) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-heading font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <Vote className="w-5 h-5 text-[#c00015]" />
                <span>{editingPollId ? 'Ubah Polling Pembaca' : 'Buat Polling Pembaca Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Kotak Rekomendasi Draf Cepat AI (Opsional) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Rekomendasi Draf Cepat (Opsional)</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  Bantu susun pertanyaan & opsi otomatis
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Ketik kata kunci topik (misal: <em>sepak bola, jalan rusak, kuliner lokal</em>) atau kosongkan untuk merujuk berita terkini:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiTopicInput}
                  onChange={(e) => setAiTopicInput(e.target.value)}
                  placeholder="Contoh: pertandingan bola / transportasi umum..."
                  className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#c00015]"
                />
                <button
                  type="button"
                  onClick={handleGenerateAi}
                  disabled={isGeneratingAi}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyusun...</span>
                    </>
                  ) : (
                    <span>Buat Draf</span>
                  )}
                </button>
              </div>
            </div>

            {/* Form Input Utama */}
            <form onSubmit={handleSavePoll} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pertanyaan Polling *
                </label>
                <textarea
                  rows={3}
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="Contoh: Siapakah pemain terbaik yang layak menerima penghargaan musim ini?"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#c00015]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori / Topik
                </label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="Misal: Sport & E-Sport, Hiburan, Politik..."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#c00015]"
                />
              </div>

              {/* Opsi-opsi Jawaban */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Pilihan Jawaban (Minimal 2, Maksimal 6) *
                  </label>
                  {formOptions.length < 6 && (
                    <button
                      type="button"
                      onClick={handleAddOptionField}
                      className="text-xs font-semibold text-[#c00015] hover:underline cursor-pointer"
                    >
                      + Tambah Opsi
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {formOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 text-center text-xs font-semibold text-slate-400">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Pilihan Jawaban ${idx + 1}`}
                        className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#c00015]"
                        required
                      />
                      {formOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionField(idx)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Hapus Opsi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#c00015] border-slate-300 focus:ring-[#c00015]"
                  />
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">
                    Jadikan sebagai Polling Aktif di Beranda sekarang
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingPollId ? 'Simpan Perubahan' : 'Terbitkan Polling'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
