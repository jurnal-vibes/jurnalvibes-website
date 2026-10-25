'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Building,
  DollarSign,
  GraduationCap,
  Save,
  X,
  CheckCircle2,
  Filter,
} from 'lucide-react'
import { Job } from '@/types'
import { DUMMY_JOBS } from '@/data/dummyJobs'

export default function AdminLokerPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('semua')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)

  // Form State Tambah Loker
  const [newTitle, setNewTitle] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newRegion, setNewRegion] = useState<any>('Kota Sukabumi')
  const [newSalary, setNewSalary] = useState('')
  const [newType, setNewType] = useState<'Full-Time' | 'Part-Time' | 'Freelance' | 'Remote' | 'Magang'>('Full-Time')
  const [newEducation, setNewEducation] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newRequirements, setNewRequirements] = useState('')
  const [newBenefits, setNewBenefits] = useState('')
  const [newApplyEmail, setNewApplyEmail] = useState('')

  // Load from localStorage or seed
  useEffect(() => {
    const loadJobs = () => {
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('jurnal_wave_jobs')
          if (saved) {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setJobs(parsed)
              return
            }
          }
          localStorage.setItem('jurnal_wave_jobs', JSON.stringify(DUMMY_JOBS))
          setJobs(DUMMY_JOBS)
        } catch {
          setJobs(DUMMY_JOBS)
        }
      }
    }
    loadJobs()
  }, [])

  const saveToStorage = (updated: Job[]) => {
    setJobs(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jurnal_wave_jobs', JSON.stringify(updated))
        window.dispatchEvent(new Event('storage'))
      } catch {}
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchType = selectedType === 'semua' || j.type.toLowerCase() === selectedType.toLowerCase()
      const matchQuery =
        !searchQuery.trim() ||
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.location.toLowerCase().includes(searchQuery.toLowerCase())
      return matchType && matchQuery
    })
  }, [jobs, selectedType, searchQuery])

  // Create Job
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newCompany.trim()) {
      alert('Judul posisi dan nama perusahaan wajib diisi!')
      return
    }

    const reqList = newRequirements
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean)
    const benList = newBenefits
      .split('\n')
      .map((b) => b.trim())
      .filter(Boolean)

    const newJob: Job = {
      id: `job-${Date.now()}`,
      title: newTitle.trim(),
      company: newCompany.trim(),
      location: newLocation.trim() || 'Sukabumi',
      region: newRegion,
      salaryRange: newSalary.trim() || 'Kompetitif',
      type: newType,
      education: newEducation.trim() || 'SMA / SMK / D3 / S1',
      description: newDescription.trim() || 'Informasi lengkap terkait lowongan pekerjaan ini.',
      requirements: reqList.length > 0 ? reqList : ['Pendidikan relevan', 'Komunikatif dan bertanggung jawab'],
      benefits: benList.length > 0 ? benList : ['Gaji pokok sesuai kesepakatan', 'BPJS'],
      applyEmail: newApplyEmail.trim() || 'recruitment@sukabumi.com',
      createdAt: new Date().toISOString(),
    }

    const updated = [newJob, ...jobs]
    saveToStorage(updated)
    showToast(`Lowongan "${newJob.title}" berhasil dipublikasikan!`)

    // Reset Form
    setNewTitle('')
    setNewCompany('')
    setNewLocation('')
    setNewSalary('')
    setNewEducation('')
    setNewDescription('')
    setNewRequirements('')
    setNewBenefits('')
    setNewApplyEmail('')
    setIsCreateModalOpen(false)
  }

  // Open Edit
  const handleOpenEdit = (job: Job) => {
    setEditingJob({ ...job })
    setIsEditModalOpen(true)
  }

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingJob) return

    const updated = jobs.map((j) => (j.id === editingJob.id ? editingJob : j))
    saveToStorage(updated)
    showToast(`Lowongan "${editingJob.title}" berhasil diperbarui!`)
    setIsEditModalOpen(false)
    setEditingJob(null)
  }

  // Delete Job
  const handleDeleteJob = (id: string, title: string) => {
    if (confirm(`Yakin ingin menghapus lowongan "${title}"?`)) {
      const updated = jobs.filter((j) => j.id !== id)
      saveToStorage(updated)
      showToast(`Lowongan "${title}" telah dihapus.`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#c00015]" />
            <span>Manajemen Lowongan Kerja (Loker)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola lowongan pekerjaan yang tayang langsung pada halaman bursa karir portal Jurnal Wave.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/loker"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Lihat di Web</span>
          </Link>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-semibold transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pasang Loker Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Kartu Metrik Ringkas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Loker Aktif</span>
          <p className="text-2xl font-bold font-heading text-slate-900">{jobs.length}</p>
          <p className="text-[11px] text-slate-500">Tayang di bursa kerja Jurnal Wave</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Full-Time</span>
          <p className="text-2xl font-bold font-heading text-slate-900">
            {jobs.filter((j) => j.type === 'Full-Time').length}
          </p>
          <p className="text-[11px] text-slate-500">Pekerjaan penuh waktu</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Part-Time &amp; Magang</span>
          <p className="text-2xl font-bold font-heading text-slate-900">
            {jobs.filter((j) => j.type === 'Part-Time' || j.type === 'Magang').length}
          </p>
          <p className="text-[11px] text-slate-500">Paruh waktu &amp; mahasiswa</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Remote &amp; Freelance</span>
          <p className="text-2xl font-bold font-heading text-slate-900">
            {jobs.filter((j) => j.type === 'Remote' || j.type === 'Freelance').length}
          </p>
          <p className="text-[11px] text-slate-500">Bekerja fleksibel dari rumah</p>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {['semua', 'Full-Time', 'Part-Time', 'Remote', 'Freelance', 'Magang'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                  selectedType.toLowerCase() === t.toLowerCase()
                    ? 'bg-[#c00015] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari posisi atau perusahaan..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015]"
            />
          </div>
        </div>
      </div>

      {/* 4. Tabel Daftar Lowongan Kerja */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan <strong>{filteredJobs.length}</strong> posisi lowongan kerja
          </span>
          <span className="text-[11px]">Dapat langsung diedit atau dihapus</span>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">Tidak ada lowongan yang sesuai</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Posisi &amp; Perusahaan</th>
                  <th className="py-3 px-4">Lokasi &amp; Wilayah</th>
                  <th className="py-3 px-4">Tipe &amp; Pendidikan</th>
                  <th className="py-3 px-4">Kisaran Gaji</th>
                  <th className="py-3 px-4">Kontak Lamaran</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Posisi & Perusahaan */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div>
                        <h3 className="font-heading font-semibold text-slate-900 text-sm line-clamp-1">
                          {job.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{job.company}</span>
                        </p>
                      </div>
                    </td>

                    {/* Lokasi */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3 h-3 text-[#c00015] shrink-0" />
                        <span>{job.location}</span>
                      </div>
                    </td>

                    {/* Tipe & Pendidikan */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {job.type}
                        </span>
                        {job.education && (
                          <p className="text-[10px] text-slate-500 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{job.education}</span>
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Kisaran Gaji */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
                      {job.salaryRange}
                    </td>

                    {/* Email Lamaran */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                      {job.applyEmail}
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(job)}
                          className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                          title="Edit Lowongan"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/loker/${job.id}`}
                          target="_blank"
                          className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                          title="Lihat Tampilan Pelamar"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteJob(job.id, job.title)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Hapus Lowongan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Modal Tambah Loker Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#c00015]" />
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Pasang Lowongan Kerja Baru
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Judul Posisi / Jabatan: <span className="text-[#c00015]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Staff Administrasi & Keuangan"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Perusahaan / Instansi: <span className="text-[#c00015]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Contoh: PT Sukabumi Indo Prima"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tipe Pekerjaan:
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Remote">Remote</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Magang">Magang</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Wilayah Sukabumi:
                  </label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer"
                  >
                    <option value="Kota Sukabumi">Kota Sukabumi</option>
                    <option value="Cikole">Cikole</option>
                    <option value="Cisaat">Cisaat</option>
                    <option value="Cibadak">Cibadak</option>
                    <option value="Cicurug">Cicurug</option>
                    <option value="Parungkuda">Parungkuda</option>
                    <option value="Sukaraja">Sukaraja</option>
                    <option value="Palabuhanratu">Palabuhanratu</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kisaran Gaji:
                  </label>
                  <input
                    type="text"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="Contoh: Rp 3.200.000 - Rp 4.500.000"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lokasi Kantor / Cabang:
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Contoh: Cikole, Kota Sukabumi"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Minimal Pendidikan:
                  </label>
                  <input
                    type="text"
                    value={newEducation}
                    onChange={(e) => setNewEducation(e.target.value)}
                    placeholder="Contoh: D3 / S1 Akuntansi atau Manajemen"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email / Kontak Kirim Lamaran: <span className="text-[#c00015]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newApplyEmail}
                  onChange={(e) => setNewApplyEmail(e.target.value)}
                  placeholder="Contoh: karir@perusahaan.com"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi Pekerjaan:
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Tuliskan gambaran umum tanggung jawab pekerjaan..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Persyaratan / Kualifikasi (1 baris per poin):
                  </label>
                  <textarea
                    rows={4}
                    value={newRequirements}
                    onChange={(e) => setNewRequirements(e.target.value)}
                    placeholder={'Pria/Wanita maksimal 28 tahun\nPendidikan minimal D3/S1\nTeliti & disiplin'}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Benefit / Fasilitas (1 baris per poin):
                  </label>
                  <textarea
                    rows={4}
                    value={newBenefits}
                    onChange={(e) => setNewBenefits(e.target.value)}
                    placeholder={'Gaji pokok sesuai UMK\nBPJS Kesehatan & Ketenagakerjaan\nTunjangan makan'}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Publikasikan Loker</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal Edit Loker */}
      {isEditModalOpen && editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Edit Lowongan: <span className="text-slate-600 font-normal">{editingJob.title}</span>
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditingJob(null)
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Judul Posisi: <span className="text-[#c00015]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Perusahaan: <span className="text-[#c00015]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingJob.company}
                    onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tipe:
                  </label>
                  <select
                    value={editingJob.type}
                    onChange={(e) => setEditingJob({ ...editingJob, type: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Remote">Remote</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Magang">Magang</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Wilayah:
                  </label>
                  <select
                    value={editingJob.region}
                    onChange={(e) => setEditingJob({ ...editingJob, region: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer"
                  >
                    <option value="Kota Sukabumi">Kota Sukabumi</option>
                    <option value="Cikole">Cikole</option>
                    <option value="Cisaat">Cisaat</option>
                    <option value="Cibadak">Cibadak</option>
                    <option value="Cicurug">Cicurug</option>
                    <option value="Parungkuda">Parungkuda</option>
                    <option value="Sukaraja">Sukaraja</option>
                    <option value="Palabuhanratu">Palabuhanratu</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Gaji:
                  </label>
                  <input
                    type="text"
                    value={editingJob.salaryRange}
                    onChange={(e) => setEditingJob({ ...editingJob, salaryRange: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lokasi Lengkap:
                  </label>
                  <input
                    type="text"
                    value={editingJob.location}
                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pendidikan:
                  </label>
                  <input
                    type="text"
                    value={editingJob.education || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, education: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Lamaran:
                </label>
                <input
                  type="email"
                  required
                  value={editingJob.applyEmail}
                  onChange={(e) => setEditingJob({ ...editingJob, applyEmail: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi Pekerjaan:
                </label>
                <textarea
                  rows={3}
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditingJob(null)
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Loker</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
