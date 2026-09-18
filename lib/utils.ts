import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIndoDateTime(dateInput?: string | Date): string {
  if (!dateInput) return 'Selasa, 15 September 2026 - 13:36 WIB';

  // If already formatted like 'Selasa, 15 September 2026 - 13:36 WIB', return as-is
  if (typeof dateInput === 'string' && dateInput.includes('WIB')) {
    return dateInput;
  }

  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) {
    return 'Selasa, 15 September 2026 - 13:36 WIB';
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

  return `${dayName}, ${day} ${monthName} ${year} - ${hours}:${minutes} WIB`;
}

