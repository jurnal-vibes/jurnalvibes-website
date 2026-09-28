'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Crosshair, Search, Loader2, Edit3, Map, X, Layers } from 'lucide-react'
import { searchSukabumiPOI } from '@/data/sukabumiPOI'

// Batas koordinat absolut Sukabumi (Kota & 47 Kecamatan Kabupaten Sukabumi Lengkap)
export const SUKABUMI_BOUNDS = {
  southWest: [-7.65, 106.20] as [number, number], // Ujung Genteng, Tegalbuleud, Cisolok/Banten
  northEast: [-6.55, 107.35] as [number, number], // Cicurug, Cidahu, Sukalarang, Curugkembar/Cianjur
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

// Tile Server Google Maps Asli (Jalan & Satelit dengan label lengkap)
const GOOGLE_ROADMAP_TILES = 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
const GOOGLE_SATELLITE_TILES = 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerInstanceRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)
  const tileLayerRef = useRef<any>(null)

  // Mode Tampilan Peta: Google Maps Jalan (Roadmap) vs Google Satelit
  const [mapLayerType, setMapLayerType] = useState<'roadmap' | 'satellite'>('roadmap')

  // Mode: 'map' (Peta + Pin) vs 'manual' (Ketik Manual Saja)
  const [inputMode, setInputMode] = useState<'map' | 'manual'>('map')

  // State Lokasi & Patokan
  const [manualAddress, setManualAddress] = useState('')
  const [patokan, setPatokan] = useState('')
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  // Pencarian Lokasi & Live Suggestion
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isOnlineSearching, setIsOnlineSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

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

      // Custom Pin Marker Jurnal Wave
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
        maxBoundsViscosity: 0.6,
        minZoom: 9,
        maxZoom: 19,
      }).setView([defaultLat, defaultLng], 14)

      // Inisialisasi Tile Layer Google Maps (Default: Peta Jalan dengan nama tempat lengkap)
      const initialTileUrl =
        mapLayerType === 'satellite' ? GOOGLE_SATELLITE_TILES : GOOGLE_ROADMAP_TILES

      const tileLayer = L.tileLayer(initialTileUrl, {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: '&copy; Google Maps',
      }).addTo(map)

      tileLayerRef.current = tileLayer

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

  // Fungsi beralih antara Google Maps Jalan (Roadmap) vs Google Satelit
  const switchMapLayer = (type: 'roadmap' | 'satellite') => {
    setMapLayerType(type)
    if (!mapInstanceRef.current || !leafletRef.current) return
    const L = leafletRef.current

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current)
    }

    const tileUrl =
      type === 'satellite' ? GOOGLE_SATELLITE_TILES : GOOGLE_ROADMAP_TILES

    const newLayer = L.tileLayer(tileUrl, {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: '&copy; Google Maps',
    }).addTo(mapInstanceRef.current)

    tileLayerRef.current = newLayer
  }

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
      
      // Susun alamat rapi berbasis komponen jika tersedia
      if (data.address) {
        const addr = data.address
        const road = addr.road || addr.pedestrian || addr.footway || ''
        const village = addr.village || addr.suburb || addr.hamlet || addr.neighbourhood || ''
        const town = addr.town || addr.city_district || addr.municipality || ''
        const county = addr.county || addr.city || 'Sukabumi'
        
        const parts = [road, village, town, county].filter(Boolean)
        if (parts.length >= 2) {
          return parts.join(', ')
        }
      }

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

  // Geolocation (GPS Perangkat) - Dikalibrasi Presisi Tinggi untuk Kota & Kabupaten
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Browser Anda tidak mendukung deteksi lokasi otomatis.')
      return
    }

    setIsGeocoding(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        if (!isInsideSukabumi(latitude, longitude)) {
          setGeoError(
            `Lokasi GPS terdeteksi di luar batas Sukabumi (${latitude.toFixed(4)}, ${longitude.toFixed(4)}). Halo Jurnal dikhususkan untuk wilayah Kota dan Kabupaten Sukabumi.`
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

        // Jika akurasi sinyal rendah (misal laptop/Wi-Fi di atas 100 meter), ingatkan user dengan ramah
        if (accuracy && accuracy > 100) {
          setGeoError(
            `Sinyal GPS terdeteksi dengan estimasi akurasi ~${Math.round(accuracy)}m. Anda dapat menggeser pin merah di peta untuk menyempurnakan posisi tepatnya.`
          )
        }
      },
      (err) => {
        setIsGeocoding(false)
        if (err.code === 1) {
          setGeoError('Izin akses lokasi/GPS ditolak. Silakan izinkan akses lokasi pada browser Anda.')
        } else if (err.code === 2) {
          setGeoError('Sinyal GPS perangkat tidak dapat diperoleh. Silakan gunakan pencarian manual atau geser pin langsung.')
        } else if (err.code === 3) {
          setGeoError('Pencarian sinyal GPS memakan waktu terlalu lama. Pastikan GPS HP aktif atau gunakan pencarian manual.')
        } else {
          setGeoError('Gagal mendeteksi lokasi otomatis. Silakan geser pin peta langsung.')
        }
      },
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
    )
  }

  // Helper pencarian Nominatim OpenStreetMap (Mencakup seluruh Kabupaten & Kota Sukabumi)
  const searchNominatim = async (query: string): Promise<LocationSearchResult[]> => {
    try {
      let clean = query.trim()
      // Normalisasi singkatan jalan umum agar selalu dikenali OpenStreetMap
      clean = clean.replace(/^(jl\.?|jln\.?)\s+/i, 'Jalan ')
      clean = clean.replace(/^(gg\.?)\s+/i, 'Gang ')
      clean = clean.replace(/^(kp\.?)\s+/i, 'Kampung ')
      clean = clean.replace(/^(ds\.?)\s+/i, 'Desa ')
      clean = clean.replace(/^(kec\.?)\s+/i, 'Kecamatan ')

      const lower = clean.toLowerCase()
      const queryString = lower.includes('sukabumi') ? clean : `${clean}, Sukabumi`
      const q = encodeURIComponent(queryString)

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&viewbox=106.20,-6.55,107.35,-7.65&bounded=1&limit=10&countrycodes=id`,
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
            categoryLabel: subAddress || 'Peta Sukabumi',
            isLocalPOI: false,
          }
        })
    } catch {
      return []
    }
  }

  // Menutup dropdown hasil pencarian saat pengguna mengklik di luar area
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // LIVE SEARCH: Otomatis mencari lokal seketika & debounced online ke OSM
  useEffect(() => {
    const clean = searchQuery.trim()
    if (clean.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      setIsOnlineSearching(false)
      return
    }

    // 1. Tampilkan kecocokan data lokal seketika (0 ms)
    const localMatches: LocationSearchResult[] = searchSukabumiPOI(clean)
      .slice(0, 15)
      .map((poi, idx) => ({
        id: `local-poi-${idx}`,
        name: poi.name,
        address: poi.address,
        lat: poi.lat,
        lng: poi.lng,
        category: poi.category,
        categoryLabel: poi.categoryLabel,
        isLocalPOI: true,
      }))

    setSearchResults(localMatches)
    setShowSearchResults(true)

    // 2. Debounced query online ke OpenStreetMap (380 ms)
    setIsOnlineSearching(true)
    const timer = setTimeout(async () => {
      try {
        const osmMatches = await searchNominatim(clean)
        if (osmMatches.length > 0) {
          setSearchResults((prev) => {
            const existingNames = new Set(
              prev.map((item) => item.name.toLowerCase().trim())
            )
            const newUniqueOsm = osmMatches.filter(
              (o) => !existingNames.has(o.name.toLowerCase().trim())
            )
            return [...prev, ...newUniqueOsm]
          })
        }
      } finally {
        setIsOnlineSearching(false)
      }
    }, 380)

    return () => {
      clearTimeout(timer)
    }
  }, [searchQuery])

  // Pencarian Manual (Tombol Cari atau Tekan Enter)
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

    // 1. Cek POI Lokal Sukabumi
    const localMatches: LocationSearchResult[] = searchSukabumiPOI(query)
      .slice(0, 15)
      .map((poi, idx) => ({
        id: `local-poi-${idx}`,
        name: poi.name,
        address: poi.address,
        lat: poi.lat,
        lng: poi.lng,
        category: poi.category,
        categoryLabel: poi.categoryLabel,
        isLocalPOI: true,
      }))

    // 2. Cek Geocoder OSM
    const osmMatches = await searchNominatim(query)

    // 3. Gabungkan hasil tanpa duplikasi
    const existingNames = new Set(localMatches.map((m) => m.name.toLowerCase().trim()))
    const uniqueOsm = osmMatches.filter(
      (o) => !existingNames.has(o.name.toLowerCase().trim())
    )
    const combined: LocationSearchResult[] = [...localMatches, ...uniqueOsm]

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
      mapInstanceRef.current.flyTo([lat, lng], 17, {
        duration: 0.8,
      })
      markerInstanceRef.current.setLatLng([lat, lng])
      markerInstanceRef.current
        .bindPopup(
          `<div style="font-family: inherit; padding: 2px;">
            <b style="color: #c00015; font-size: 13px;">${item.name}</b>
            <div style="font-size: 11px; color: #475569; margin-top: 3px; line-height: 1.4;">${item.address}</div>
          </div>`,
          { autoClose: false }
        )
        .openPopup()
    }
    const cleanName = item.name.replace(/\s*\(.*?\)/, '').trim().toLowerCase()
    const finalAddress = item.isLocalPOI
      ? item.address.toLowerCase().includes(cleanName)
        ? item.address
        : `${item.name}, ${item.address}`
      : item.address
    setSearchQuery(item.name)
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
          {/* Kontrol Pencarian & GPS (Dengan Live Search Otomatis) */}
          <div ref={searchContainerRef} className="flex flex-col sm:flex-row gap-2 relative">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-on-surface-variant/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2 && searchResults.length > 0) {
                      setShowSearchResults(true)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      e.stopPropagation()
                      handleSearchLocation(e)
                    } else if (e.key === 'Escape') {
                      setShowSearchResults(false)
                    }
                  }}
                  placeholder="Ketik nama sekolah, kampus, RS, jalan di Sukabumi..."
                  className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface placeholder:text-on-surface-variant/60"
                />
                {searchQuery.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setSearchResults([])
                      setShowSearchResults(false)
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface p-1 rounded-full hover:bg-surface-container-highest cursor-pointer"
                    title="Hapus pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleSearchLocation}
                disabled={isSearching}
                className="px-3.5 py-2 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
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

            {/* Dropdown Hasil Pencarian Tempat Pintar */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-outline-variant/80 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-outline-variant/50 max-h-80 overflow-y-auto">
                {/* Header Dropdown */}
                <div className="px-3.5 py-2 bg-surface-container-high text-[11px] font-bold text-secondary flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {searchResults.length > 0
                        ? `${searchResults.length} Lokasi Ditemukan di Sukabumi:`
                        : 'Mencari Lokasi di Sukabumi...'}
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    {isOnlineSearching && (
                      <span className="flex items-center gap-1 text-[10px] text-primary font-normal animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Mencari di peta...</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowSearchResults(false)}
                      className="text-secondary hover:text-on-surface p-1 rounded-md hover:bg-surface-container-highest transition-colors cursor-pointer"
                      title="Tutup saran"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* List Hasil Lokasi */}
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => applySearchResult(item)}
                      className="w-full text-left px-4 py-2.5 hover:bg-primary/5 text-xs text-on-surface transition-colors cursor-pointer block group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-on-surface group-hover:text-primary transition-colors truncate">
                          {item.name}
                        </span>
                        {item.categoryLabel && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-medium shrink-0 bg-surface-container-high text-secondary border border-outline-variant/60 group-hover:border-primary/30 group-hover:text-primary transition-colors">
                            {item.categoryLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-secondary truncate mt-0.5">
                        {item.address}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-secondary">
                    {isOnlineSearching ? (
                      <span className="flex items-center justify-center gap-1.5 text-primary">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sedang mencari lokasi di wilayah Sukabumi...
                      </span>
                    ) : (
                      <p>
                        Lokasi tidak ditemukan di Sukabumi untuk &ldquo;{searchQuery}&rdquo;. Silakan coba nama sekolah, jalan lain, atau geser pin langsung pada peta.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>


          {/* Map Canvas - Ukuran Pas & Bersih */}
          <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden border border-outline-variant shadow-inner">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Floating Layer Switcher (Google Maps Jalan vs Google Satelit) */}
            <div className="absolute top-3 right-3 z-10 bg-surface/90 backdrop-blur-md rounded-xl p-1 shadow-md border border-outline-variant/80 flex items-center gap-1">
              <button
                type="button"
                onClick={() => switchMapLayer('roadmap')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  mapLayerType === 'roadmap'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-secondary hover:text-on-surface hover:bg-surface-container'
                }`}
                title="Tampilkan peta jalan Google Maps dengan nama jalan, gang, dan tempat lengkap"
              >
                <Map className="w-3.5 h-3.5" />
                <span>Peta Jalan</span>
              </button>
              <button
                type="button"
                onClick={() => switchMapLayer('satellite')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  mapLayerType === 'satellite'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-secondary hover:text-on-surface hover:bg-surface-container'
                }`}
                title="Tampilkan citra satelit udara asli dengan label nama jalan"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Satelit</span>
              </button>
            </div>

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
