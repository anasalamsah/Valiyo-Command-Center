export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount).replace('IDR', 'Rp').trim();
}

export function formatRupiahCompact(amount: number): string {
  if (amount >= 1000000000) {
    const val = (amount / 1000000000).toFixed(2);
    return `Rp${val.replace(/\.00$/, '')} Miliar`;
  }
  if (amount >= 1000000) {
    const val = (amount / 1000000).toFixed(1);
    return `Rp${val.replace(/\.0$/, '')} Juta`;
  }
  return formatRupiah(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const INDONESIAN_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Menghitung periode bulan penjualan dan jadwal pembayaran komisi referral.
 * Aturan: Komisi penjualan bulan X dibayarkan tanggal 1 di bulan X+1.
 * Contoh: Penjualan September 2026 -> Dibayarkan 1 Oktober 2026.
 */
export function getReferralPayoutSchedule(dateStr?: string): {
  period: string;
  periodShort: string;
  scheduledDateLabel: string;
  scheduledDateIso: string;
} {
  let date: Date;
  if (!dateStr) {
    date = new Date();
  } else {
    // Normalisasi input string tanggal
    const trimmed = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const [y, m, d] = trimmed.split('T')[0].split('-').map(Number);
      date = new Date(y, m - 1, d || 1);
    } else {
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        date = parsed;
      } else {
        // Coba deteksi format "17 Sep 2026"
        const parts = trimmed.split(/[\s-]+/);
        if (parts.length >= 3) {
          const mIdx = INDONESIAN_MONTHS_SHORT.findIndex(m => m.toLowerCase() === parts[1].toLowerCase());
          if (mIdx >= 0) {
            date = new Date(Number(parts[2]), mIdx, Number(parts[0]) || 1);
          } else {
            date = new Date();
          }
        } else {
          date = new Date();
        }
      }
    }
  }

  const year = date.getFullYear();
  const month = date.getMonth(); // 0 to 11

  const period = `${INDONESIAN_MONTHS[month]} ${year}`;
  const periodShort = `${INDONESIAN_MONTHS_SHORT[month]} ${year}`;

  // Jadwal bayar: Tanggal 1 di bulan berikutnya (month + 1)
  const nextMonthDate = new Date(year, month + 1, 1);
  const nextYear = nextMonthDate.getFullYear();
  const nextMonth = nextMonthDate.getMonth();

  const nextMonthPad = String(nextMonth + 1).padStart(2, '0');
  const scheduledDateIso = `${nextYear}-${nextMonthPad}-01`;
  const scheduledDateLabel = `1 ${INDONESIAN_MONTHS[nextMonth]} ${nextYear}`;

  return {
    period,
    periodShort,
    scheduledDateLabel,
    scheduledDateIso
  };
}

export function getGreeting(name: string = 'Anas'): string {
  const hour = new Date().getHours();
  let timeStr = 'Pagi';
  if (hour >= 11 && hour < 15) {
    timeStr = 'Siang';
  } else if (hour >= 15 && hour < 18) {
    timeStr = 'Sore';
  } else if (hour >= 18 || hour < 4) {
    timeStr = 'Malam';
  }
  return `Selamat ${timeStr}, ${name}`;
}

