'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Crosshair, Search, Loader2, Edit3, Map, X } from 'lucide-react'
import { searchSukabumiPOI } from '@/data/sukabumiPOI'

// Batas koordinat absolut Sukabumi (Kota & Kabupaten)
export const SUKABUMI_BOUNDS = {
  southWest: [-7.48, 106.3] as [number, number],
  northEast: [-6.62, 107.2] as [number, number],
}

export function isInsideSukabumi(lat: number, lng: number): boolean {
  return (
    lat >= SUKABUMI_BOUNDS.southWest[0] &&
    lat <= SUKABUMI_BOUNDS.northEast[0] &&
    lng >= SUKABUMI_BOUNDS.southWest[1] &&
    lng <= SUKABUMI_BOUNDS.northEast[1]
  )
}

export interface LocationSearchResult {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  category?: 'sekolah' | 'kesehatan' | 'pemerintahan' | 'pasar' | 'transportasi' | 'publik' | 'osm'
  categoryLabel?: string
  isLocalPOI?: boolean
}

interface LocationPickerProps {
  value: {
    address: string
    lat: number | null
    lng: number | null
  }
  onChange: (location: { address: string; lat: number | null; lng: number | null }) => void
}

const STREET_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerInstanceRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)

  // Mode: 'map' (Peta + Pin) vs 'manual' (Ketik Manual Saja)
  const [inputMode, setInputMode] = useState<'map' | 'manual'>('map')

  // State Lokasi & Patokan
  const [manualAddress, setManualAddress] = useState('')
  const [patokan, setPatokan] = useState('')
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  // Pencarian Lokasi
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Default Sukabumi coordinates (Alun-alun Kota Sukabumi)
  const defaultLat = value.lat || -6.9214
  const defaultLng = value.lng || 106.9278

  // Parse initial address if already formatted with (Patokan: ...)
  useEffect(() => {
    if (value.address) {
      const match = value.address.match(/^(.*?)\s*\(Patokan:\s*(.*?)\)$/i)
      if (match) {
        setManualAddress(match[1].trim())
        setPatokan(match[2].trim())
      } else {
        setManualAddress(value.address)
      }
    }
  }, [])

  // Helper: gabungkan alamat dan patokan untuk dikirim ke parent form
  const updateAddress = (
    newBase: string,
    newPatokan: string,
    lat: number | null,
    lng: number | null
  ) => {
    const cleanBase = newBase.trim()
    const cleanPatokan = newPatokan.trim()
    let combined = cleanBase
    if (cleanPatokan) {
      combined = cleanBase ? `${cleanBase} (Patokan: ${cleanPatokan})` : `Patokan: ${cleanPatokan}`
    }
    onChange({
      address: combined,
      lat,
      lng,
    })
  }

  // Inisialisasi Leaflet Map
  useEffect(() => {
    if (inputMode !== 'map') return

    let isMounted = true

    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return

      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')
      leafletRef.current = L

      if (!isMounted) return

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      // Custom Pin Marker Jurnal Vibes
      const customIcon = L.divIcon({
        className: 'custom-pin-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #c00015 0%, #8b1e2c 100%);
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(192, 0, 21, 0.45);
            border: 2.5px solid white;
          ">
            <svg style="transform: rotate(45deg); width: 18px; height: 18px; color: white;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      })

      // Batasi peta strictly di wilayah Sukabumi
      const sukabumiBounds = L.latLngBounds(
        L.latLng(SUKABUMI_BOUNDS.southWest[0], SUKABUMI_BOUNDS.southWest[1]),
        L.latLng(SUKABUMI_BOUNDS.northEast[0], SUKABUMI_BOUNDS.northEast[1])
      )

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: 'center',
        maxBounds: sukabumiBounds,
        maxBoundsViscosity: 1.0,
        minZoom: 10,
        maxZoom: 19,
      }).setView([defaultLat, defaultLng], 14)

      L.tileLayer(STREET_TILES, {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      const marker = L.marker([defaultLat, defaultLng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map)

      marker.bindPopup('<b>Titik Kejadian</b><br>Geser pin untuk memindahkan posisi tepat.', {
        autoClose: false,
      })

      mapInstanceRef.current = map
      markerInstanceRef.current = marker

      // Drag pin event
      marker.on('dragend', async () => {
        const latLng = marker.getLatLng()
        if (!isInsideSukabumi(latLng.lat, latLng.lng)) {
          setGeoError('Titik pin berada di luar Sukabumi. Mohon posisikan di wilayah Kota atau Kab. Sukabumi.')
          marker.setLatLng([defaultLat, defaultLng])
          return
        }
        await handlePositionChange(latLng.lat, latLng.lng)
      })

      // Klik peta event
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng
        if (!isInsideSukabumi(lat, lng)) {
          setGeoError('Titik yang dipilih berada di luar batas wilayah Sukabumi.')
          return
        }
        marker.setLatLng([lat, lng])
        await handlePositionChange(lat, lng)
      })
    }

    initMap()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [inputMode])

  // Reverse Geocode via OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      setIsGeocoding(true)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept-Language': 'id,en',
          },
        }
      )
      if (!res.ok) throw new Error('Gagal mengambil alamat')
      const data = await res.json()
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } finally {
      setIsGeocoding(false)
    }
  }

  const handlePositionChange = async (lat: number, lng: number) => {
    setGeoError(null)
    const rawAddress = await reverseGeocode(lat, lng)
    setManualAddress(rawAddress)
    updateAddress(rawAddress, patokan, lat, lng)
  }

  // Geolocation (GPS Perangkat) - Dibatasi Khusus Sukabumi
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Browser Anda tidak mendukung deteksi lokasi otomatis.')
      return
    }

    setIsGeocoding(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        if (!isInsideSukabumi(latitude, longitude)) {
          setGeoError(
            'Lokasi GPS Anda terdeteksi di luar Sukabumi. Halo Jurnal dikhususkan untuk pelaporan di wilayah Kota dan Kabupaten Sukabumi.'
          )
          setIsGeocoding(false)
          return
        }

        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16)
          markerInstanceRef.current.setLatLng([latitude, longitude])
        }
        await handlePositionChange(latitude, longitude)
        setIsGeocoding(false)
      },
      (err) => {
        setIsGeocoding(false)
        if (err.code === 1) {
          setGeoError('Izin GPS ditolak. Silakan izinkan akses lokasi di browser atau gunakan pencarian manual.')
        } else {
          setGeoError('Gagal mendeteksi lokasi saat ini.')
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  // Helper pencarian Nominatim strictly bounded Sukabumi
  const searchNominatim = async (query: string): Promise<LocationSearchResult[]> => {
    try {
      const clean = query.trim()
      const lower = clean.toLowerCase()
      const queryString = lower.includes('sukabumi') ? clean : `${clean}, Sukabumi`
      const q = encodeURIComponent(queryString)

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&viewbox=106.30,-6.62,107.20,-7.48&bounded=1&limit=6`,
        {
          headers: {
            'Accept-Language': 'id,en',
          },
        }
      )
      if (!res.ok) return []
      const data = await res.json()
      if (!Array.isArray(data)) return []

      return data
        .filter((item: any) => {
          const lat = parseFloat(item.lat)
          const lon = parseFloat(item.lon)
          return isInsideSukabumi(lat, lon)
        })
        .map((item: any, idx: number) => {
          const parts = (item.display_name || '').split(',')
          const mainName = parts[0] ? parts[0].trim() : item.display_name
          const subAddress = parts.slice(1, 4).join(', ').trim()

          return {
            id: `osm-${item.place_id || idx}`,
            name: mainName,
            address: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            category: 'osm' as const,
            categoryLabel: subAddress || 'Wilayah Sukabumi',
            isLocalPOI: false,
          }
        })
    } catch {
      return []
    }
  }

  // Pencarian Alamat & Fasilitas Publik Sukabumi
  const handleSearchLocation = async (
    e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent,
    overrideQuery?: string
  ) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const query = (overrideQuery ?? searchQuery).trim()
    if (!query) return

    setIsSearching(true)
    setGeoError(null)

    // 1. Cek POI Lokal Sukabumi (Sekolah, RS, Kantor, Pasar, dll.)
    const localMatches = searchSukabumiPOI(query).map((poi, idx) => ({
      id: `local-poi-${idx}`,
      name: poi.name,
      address: poi.address,
      lat: poi.lat,
      lng: poi.lng,
      category: poi.category,
      categoryLabel: poi.categoryLabel,
      isLocalPOI: true,
    }))

    // 2. Cek Geocoder OSM (dibatasi 100% di dalam batas Sukabumi)
    const osmMatches = await searchNominatim(query)

    // 3. Gabungkan hasil
    const combined: LocationSearchResult[] = [...localMatches, ...osmMatches]

    if (combined.length > 0) {
      setSearchResults(combined)
      setShowSearchResults(true)
      if (combined.length === 1) {
        applySearchResult(combined[0])
      }
    } else {
      setGeoError(
        'Lokasi tidak ditemukan di wilayah Sukabumi. Silakan coba nama sekolah, RS, kantor, jalan lokal, atau geser pin di peta.'
      )
      setSearchResults([])
      setShowSearchResults(false)
    }

    setIsSearching(false)
  }

  const applySearchResult = (item: LocationSearchResult) => {
    const lat = item.lat
    const lng = item.lng

    if (!isInsideSukabumi(lat, lng)) {
      setGeoError('Lokasi ini berada di luar batas wilayah Sukabumi.')
      return
    }

    if (mapInstanceRef.current && markerInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16)
      markerInstanceRef.current.setLatLng([lat, lng])
    }
    const finalAddress = item.isLocalPOI ? `${item.name}, ${item.address}` : item.address
    setManualAddress(finalAddress)
    updateAddress(finalAddress, patokan, lat, lng)
    setShowSearchResults(false)
  }



  return (
    <div className="space-y-3.5">
      {/* Tab Opsi: Mode Peta vs Ketik Manual */}
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-outline-variant/60">
        <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl border border-outline-variant/60">
          <button
            type="button"
            onClick={() => setInputMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              inputMode === 'map'
                ? 'bg-surface text-primary shadow-2xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Peta & Titik GPS</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              inputMode === 'manual'
                ? 'bg-surface text-primary shadow-2xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Ketik Manual Saja</span>
          </button>
        </div>
      </div>

      {/* Bagian Peta Interaktif (Jika Mode Peta Aktif) */}
      {inputMode === 'map' && (
        <div className="space-y-3">
          {/* Kontrol Pencarian & GPS */}
          <div className="flex flex-col sm:flex-row gap-2 relative">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-on-surface-variant/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value
                    setSearchQuery(val)
                    if (!val.trim()) {
                      setSearchResults([])
                      setShowSearchResults(false)
                      return
                    }
                    // Instant suggestion bila >= 2 karakter
                    if (val.trim().length >= 2) {
                      const instantMatches = searchSukabumiPOI(val).slice(0, 5).map((poi, idx) => ({
                        id: `local-poi-${idx}`,
                        name: poi.name,
                        address: poi.address,
                        lat: poi.lat,
                        lng: poi.lng,
                        category: poi.category,
                        categoryLabel: poi.categoryLabel,
                        isLocalPOI: true,
                      }))
                      if (instantMatches.length > 0) {
                        setSearchResults(instantMatches)
                        setShowSearchResults(true)
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      e.stopPropagation()
                      handleSearchLocation(e)
                    }
                  }}
                  placeholder="Cari sekolah, RS, kantor, pasar, atau jalan di Sukabumi..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface"
                />
              </div>
              <button
                type="button"
                onClick={handleSearchLocation}
                disabled={isSearching}
                className="px-3.5 py-2 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Cari</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={isGeocoding}
              className="px-3.5 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              title="Gunakan posisi GPS perangkat Anda saat ini di Sukabumi"
            >
              {isGeocoding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Crosshair className="w-3.5 h-3.5" />
              )}
              <span>Lokasi Saya (GPS)</span>
            </button>

            {/* Dropdown Hasil Pencarian Tempat */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-outline-variant rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-outline-variant/60 max-h-64 overflow-y-auto">
                <div className="px-3.5 py-2 bg-surface-container text-[11px] font-bold text-secondary flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span>Lokasi Ditemukan di Sukabumi:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSearchResults(false)}
                    className="text-secondary hover:text-on-surface p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => applySearchResult(item)}
                    className="w-full text-left px-4 py-2.5 hover:bg-primary/5 text-xs text-on-surface transition-colors cursor-pointer block"
                  >
                    <div className="font-bold text-xs text-on-surface truncate">
                      {item.name}
                    </div>
                    <p className="text-[11px] text-secondary truncate mt-0.5">
                      {item.address}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>


          {/* Map Canvas - Ukuran Pas & Bersih */}
          <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden border border-outline-variant shadow-inner">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Loading Indicator */}
            {isGeocoding && (
              <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="bg-surface px-4 py-2 rounded-xl shadow-md flex items-center gap-2 text-xs font-semibold text-on-surface">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Mengambil koordinat & alamat...</span>
                </div>
              </div>
            )}

            {/* Floating Live Coordinates */}
            {value.lat && value.lng && (
              <div className="absolute bottom-2 left-2 bg-surface/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-mono text-secondary border border-outline-variant shadow-xs z-10 pointer-events-none">
                Lat: {value.lat.toFixed(5)}, Lng: {value.lng.toFixed(5)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bagian Input Alamat & Patokan Manual (Selalu Tersedia) */}
      <div className="space-y-3 bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-outline-variant/80">
        {/* Kolom 1: Alamat Lengkap */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Alamat Lengkap Kejadian</span>
              <span className="text-rose-500">*</span>
            </label>
            {inputMode === 'map' && (
              <span className="text-[11px] text-secondary">
                (Otomatis dari pin peta atau ketik manual)
              </span>
            )}
          </div>
          <textarea
            value={manualAddress}
            onChange={(e) => {
              setManualAddress(e.target.value)
              updateAddress(e.target.value, patokan, value.lat, value.lng)
            }}
            rows={2}
            placeholder="Tuliskan nama jalan, nomor, RT/RW, desa/kelurahan, atau kecamatan di Sukabumi..."
            className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary resize-y leading-relaxed"
            required
          />
        </div>

        {/* Kolom 2: Patokan Khusus / Landmark */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-primary" />
              <span>Patokan / Petunjuk Lokasi Tambahan</span>
              <span className="text-[11px] text-primary font-semibold">(Sangat Dianjurkan)</span>
            </label>
          </div>
          <input
            type="text"
            value={patokan}
            onChange={(e) => {
              setPatokan(e.target.value)
              updateAddress(manualAddress, e.target.value, value.lat, value.lng)
            }}
            placeholder="Contoh: Depan warung Madura, samping Masjid Al-Barokah RT 02, pagar cat hijau..."
            className="w-full px-3.5 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
          />
          <p className="text-[11px] text-secondary mt-1 leading-relaxed">
            Menuliskan patokan mempermudah petugas dan tim redaksi menemukan titik laporan secara cepat di lapangan.
          </p>
        </div>
      </div>

      {geoError && <p className="text-xs text-rose-500 font-medium">{geoError}</p>}
    </div>
  )
}
