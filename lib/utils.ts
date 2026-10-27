import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIndoDateTime(dateInput?: string | Date): string {
  if (!dateInput) return '';

  // Jika sudah memiliki format jam WIB, sesuaikan pemisah jika diperlukan
  if (typeof dateInput === 'string' && dateInput.includes('WIB')) {
    return dateInput.replace(/\s*-\s*(\d{2}:\d{2}\s*WIB)/, ' | $1');
  }

  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (!d || isNaN(d.getTime())) {
    return typeof dateInput === 'string' ? dateInput : '';
  }

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[d.getDay()];
  const day = d.getDate();
  const monthName = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${dayName}, ${day} ${monthName} ${year} | ${hours}:${minutes} WIB`;
}

export function formatIndoDate(dateInput?: string | Date): string {
  if (!dateInput) return '';
  const str = String(dateInput).trim();

  // Jika sudah memuat WIB, kembalikan dengan pemisah pipa |
  if (str.includes('WIB')) {
    return str.replace(/\s*[-|]\s*(\d{2}:\d{2}\s*WIB)/, ' | $1');
  }

  // Jika format relatif (misal "Baru saja", "2 jam lalu")
  if (str.toLowerCase().includes('lalu') || str.toLowerCase().includes('baru')) {
    return str;
  }

  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (!d || isNaN(d.getTime())) {
    return str;
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  // Format Opsi 1: "25 Okt 2026 | 16:13 WIB"
  return `${day} ${month} ${year} | ${hours}:${minutes} WIB`;
}

