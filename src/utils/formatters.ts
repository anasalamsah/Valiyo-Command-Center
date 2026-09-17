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
