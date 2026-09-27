'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  Check,
  Edit,
  Trash2,
  X,
  Mail,
  Phone,
  CheckCircle2,
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'Pemimpin Redaksi' | 'Redaktur Pelaksana' | 'Reporter / Jurnalis' | 'Admin Verifikasi'
  status: 'aktif' | 'cuti'
  joinedAt: string
}

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: 'usr-1',
    name: 'Rahmat Sukabumi',
    email: 'rahmat@jurnalwave.id',
    role: 'Pemimpin Redaksi',
    status: 'aktif',
    joinedAt: 'Jan 2024',
  },
  {
    id: 'usr-2',
    name: 'Dewi Lestari',
    email: 'dewi.redaktur@jurnalwave.id',
    role: 'Redaktur Pelaksana',
    status: 'aktif',
    joinedAt: 'Mar 2024',
  },
  {
    id: 'usr-3',
    name: 'Rian Hidayat',
    email: 'rian.jurnalis@jurnalwave.id',
    role: 'Reporter / Jurnalis',
    status: 'aktif',
    joinedAt: 'Jun 2024',
  },
  {
    id: 'usr-4',
    name: 'Admin Halo Jurnal',
    email: 'admin@halojurnal.id',
    role: 'Admin Verifikasi',
    status: 'aktif',
    joinedAt: 'Agu 2024',
  },
  {
    id: 'usr-5',
    name: 'Budi Kurniawan',
    email: 'budi.foto@jurnalwave.id',
    role: 'Reporter / Jurnalis',
    status: 'cuti',
    joinedAt: 'Okt 2024',
  },
]

export default function AdminTimRedaksiPage() {
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_TEAM)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form State
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formRole, setFormRole] = useState<TeamMember['role']>('Reporter / Jurnalis')

  // Muat data dari localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jurnal_wave_team_members')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMembers(parsed)
            return
          }
        }
        localStorage.setItem('jurnal_wave_team_members', JSON.stringify(DEFAULT_TEAM))
      } catch (err) {
        console.error('Error loading team members:', err)
      }
    }
  }, [])

  const persistMembers = (updated: TeamMember[]) => {
    setMembers(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jurnal_wave_team_members', JSON.stringify(updated))
        window.dispatchEvent(new Event('storage'))
      } catch (err) {
        console.error('Error saving team members:', err)
      }
    }
  }

  // Tambah Anggota
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formEmail.trim()) return

    const newMember: TeamMember = {
      id: `usr-${Date.now()}`,
      name: formName.trim(),
      email: formEmail.trim(),
      role: formRole,
      status: 'aktif',
      joinedAt: 'Baru saja',
    }

    const updated = [newMember, ...members]
    persistMembers(updated)
    setIsModalOpen(false)

    setFormName('')
    setFormEmail('')
    setFormRole('Reporter / Jurnalis')

    setToastMessage(`Anggota redaksi "${newMember.name}" berhasil ditambahkan!`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Toggle Status Cuti / Aktif
  const handleToggleStatus = (id: string) => {
    const updated = members.map((m) =>
      m.id === id ? { ...m, status: m.status === 'aktif' ? ('cuti' as const) : ('aktif' as const) } : m
    )
    persistMembers(updated)
    setToastMessage('Status operasional anggota diperbarui.')
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Hapus Anggota
  const handleDeleteMember = (id: string, name: string) => {
    if (confirm(`Hapus anggota tim: "${name}"?`)) {
      const updated = members.filter((m) => m.id !== id)
      persistMembers(updated)
      setToastMessage('Anggota tim redaksi dihapus.')
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  // Filter
  const filteredMembers = members.filter((m) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = m.name.toLowerCase().includes(q)
      const matchEmail = m.email.toLowerCase().includes(q)
      const matchRole = m.role.toLowerCase().includes(q)
      if (!matchName && !matchEmail && !matchRole) return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900 tracking-tight">
            Manajemen Tim Redaksi &amp; Penulis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar jurnalis, editor, dan staf verifikator Halo Jurnal yang memiliki akses sistem.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-semibold transition shadow-2xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Anggota</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:underline font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 2. Kartu Metrik */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Total Anggota</p>
          <p className="text-2xl font-heading font-bold text-slate-900 mt-1">{members.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Reporter / Jurnalis</p>
          <p className="text-2xl font-heading font-bold text-blue-700 mt-1">
            {members.filter((m) => m.role.includes('Reporter')).length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Dewan Redaksi</p>
          <p className="text-2xl font-heading font-bold text-[#c00015] mt-1">
            {members.filter((m) => m.role.includes('Redaksi') || m.role.includes('Redaktur')).length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Status Aktif</p>
          <p className="text-2xl font-heading font-bold text-emerald-600 mt-1">
            {members.filter((m) => m.status === 'aktif').length}
          </p>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama anggota, email, atau jabatan..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015]"
          />
        </div>
      </div>

      {/* 4. Tabel Tim Redaksi */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Anggota</th>
                <th className="py-3 px-4">Email Kantor</th>
                <th className="py-3 px-4">Peran / Jabatan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Bergabung</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{member.name}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{member.email}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-medium text-slate-700">
                      {member.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {member.status === 'aktif' ? (
                      <span className="text-xs font-semibold text-emerald-700">
                        Aktif
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-700">
                        Cuti
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">{member.joinedAt}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(member.id)}
                        className="px-2 py-1 rounded text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                      >
                        {member.status === 'aktif' ? 'Set Cuti' : 'Set Aktif'}
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id, member.name)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Hapus Anggota"
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
      </div>

      {/* Modal Tambah Anggota */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#c00015]" />
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Tambah Anggota Tim Redaksi
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap: <span className="text-[#c00015]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Muhammad Ilham"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-[#c00015]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Kantor / Login: <span className="text-[#c00015]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ilham@jurnalwave.id"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#c00015]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jabatan / Peran:
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as TeamMember['role'])}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer"
                >
                  <option value="Reporter / Jurnalis">Reporter / Jurnalis</option>
                  <option value="Redaktur Pelaksana">Redaktur Pelaksana</option>
                  <option value="Admin Verifikasi">Admin Verifikasi Halo Jurnal</option>
                  <option value="Pemimpin Redaksi">Pemimpin Redaksi</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white font-bold transition shadow-xs cursor-pointer"
                >
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
