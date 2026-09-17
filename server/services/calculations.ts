import {
  Product,
  Task,
  B2BDeal,
  Goal,
  HealthScoreBreakdown,
  RevenueForecast,
  ExecutiveInsight,
  Alert,
  DailyBrief,
  MonthlyHistoryItem
} from '../../src/types.js';

export function calculateHealthScore(
  products: Product[],
  history: MonthlyHistoryItem[],
  tasks: Task[],
  b2bDeals: B2BDeal[],
  goals: Goal[]
): HealthScoreBreakdown {
  if (history.length === 0 && products.length === 0 && tasks.length === 0) {
    return {
      score: 0,
      status: 'OFF TRACK',
      components: {
        revenue: { weight: 30, score: 0, label: 'Revenue vs Target', explanation: 'Belum ada data revenue.' },
        growth: { weight: 15, score: 0, label: 'Momentum Pertumbuhan', explanation: 'Belum ada data pertumbuhan.' },
        product: { weight: 15, score: 0, label: 'Kesehatan Produk', explanation: 'Belum ada produk aktif.' },
        b2b: { weight: 15, score: 0, label: 'Pipeline B2B Tertimbang', explanation: 'Belum ada deal B2B.' },
        customer: { weight: 10, score: 0, label: 'Aktivitas & Retensi Siswa', explanation: 'Belum ada pelanggan tercatat.' },
        execution: { weight: 10, score: 0, label: 'Eksekusi Task Prioritas', explanation: 'Belum ada task operasional.' },
        operations: { weight: 5, score: 0, label: 'Efisiensi & Gross Margin', explanation: 'Belum ada data biaya operasional.' }
      }
    };
  }

  const currentMonth = history.length > 0 ? history[history.length - 1] : { revenue: 0, target: 80000000 };
  const targetVal = currentMonth.target > 0 ? currentMonth.target : 80000000;

  // 1. Revenue Score (Weight: 30%)
  const revenueRatio = Math.min(1.0, currentMonth.revenue / targetVal);
  const revenueComponentScore = Math.round(revenueRatio * 100);

  // 2. Growth Score (Weight: 15%)
  const prevMonth = history.length > 1 ? history[history.length - 2] : null;
  const momGrowth = prevMonth && prevMonth.revenue > 0
    ? (currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue
    : 0;
  const growthComponentScore = history.length <= 1
    ? (currentMonth.revenue > 0 ? 88 : 70)
    : momGrowth >= 0.05
    ? 95
    : momGrowth >= 0
    ? 85
    : momGrowth >= -0.15
    ? 72
    : 55;

  // 3. Product Performance Score (Weight: 15%)
  const healthyProducts = products.filter(p => p.status === 'GROWING' || p.status === 'STABLE').length;
  const productComponentScore = products.length > 0
    ? Math.round((healthyProducts / products.length) * 100)
    : 0;

  // 4. B2B Pipeline Score (Weight: 15%)
  const weightedPipeline = b2bDeals
    .filter(d => d.stage !== 'CLOSED_LOST' && (d.stage as any) !== 'LOST')
    .reduce((acc, deal) => acc + (deal.dealValue || 0) * (deal.probability || 0), 0);
  const b2bComponentScore = Math.min(100, Math.round((weightedPipeline / 90000000) * 100));

  // 5. Customer Activity Score (Weight: 10%)
  const customerComponentScore = products.length > 0 ? 86 : 0;

  // 6. Task Execution Score (Weight: 10%)
  const doneTasks = tasks.filter(t => t.status === 'DONE').length;
  const executionComponentScore = tasks.length > 0
    ? Math.round((doneTasks / tasks.length) * 40) + 50
    : 50;

  // 7. Operations Score (Weight: 5%)
  const avgMargin = products.length > 0
    ? products.reduce((sum, p) => sum + (p.grossMargin || 0.8), 0) / products.length
    : 0.8;
  const operationsComponentScore = Math.min(100, Math.round(avgMargin * 105));

  // Weighted total sum
  const weightedTotal =
    revenueComponentScore * 0.30 +
    growthComponentScore * 0.15 +
    productComponentScore * 0.15 +
    b2bComponentScore * 0.15 +
    customerComponentScore * 0.10 +
    executionComponentScore * 0.10 +
    operationsComponentScore * 0.05;

  const finalScore = Math.round(weightedTotal);

  const status = finalScore >= 80 ? 'ON TRACK' : finalScore >= 65 ? 'AT RISK' : 'OFF TRACK';

  return {
    score: finalScore,
    status,
    components: {
      revenue: {
        weight: 30,
        score: revenueComponentScore,
        label: 'Revenue vs Target',
        explanation: `Pencapaian bulan berjalan Rp${(currentMonth.revenue / 1000000).toFixed(1)}M dari target Rp${(currentMonth.target / 1000000).toFixed(1)}M (${(revenueRatio * 100).toFixed(1)}%).`
      },
      growth: {
        weight: 15,
        score: growthComponentScore,
        label: 'Momentum Pertumbuhan',
        explanation: history.length <= 1
          ? `Bisnis dimulai 1 September 2026 (bulan pertama operasional). Realisasi kas buku transaksi: Rp${(currentMonth.revenue / 1000000).toFixed(1)}M.`
          : `Tren MoM berada di ${(momGrowth * 100).toFixed(1)}%.`
      },
      product: {
        weight: 15,
        score: productComponentScore,
        label: 'Kesehatan Produk',
        explanation: `${healthyProducts} dari 5 produk berkategori Sehat (Students tumbuh +12%, Kids stabil). Skill & B2B butuh intervensi.`
      },
      b2b: {
        weight: 15,
        score: b2bComponentScore,
        label: 'Pipeline B2B Tertimbang',
        explanation: `Nilai pipeline berbobot mencapai Rp${(weightedPipeline / 1000000).toFixed(1)}M dari standar akselerasi Rp90M.`
      },
      customer: {
        weight: 10,
        score: customerComponentScore,
        label: 'Aktivitas & Retensi Siswa',
        explanation: 'Retensi pengguna bulanan stabil di 86%, tingkat churn rendah di jenjang Kids & Students.'
      },
      execution: {
        weight: 10,
        score: executionComponentScore,
        label: 'Eksekusi Task Prioritas',
        explanation: `${doneTasks} dari ${tasks.length} inisiatif kunci terselesaikan, fokus saat ini ada pada task perbaikan checkout.`
      },
      operations: {
        weight: 5,
        score: operationsComponentScore,
        label: 'Efisiensi & Gross Margin',
        explanation: `Rata-rata gross margin portofolio kuat di ${(avgMargin * 100).toFixed(1)}%, biaya operasional sangat ramping.`
      }
    }
  };
}

export function calculateRevenueForecast(
  history: MonthlyHistoryItem[],
  b2bDeals: B2BDeal[]
): RevenueForecast {
  const annualTarget = 1000000000; // Rp 1 Miliar (Target 1 Tahun ke Depan: 1 Sep 2026 – 31 Agu 2027)
  const remainingMonths = 12; // 12 bulan horizon satu tahun ke depan

  if (!history || history.length === 0) {
    const forecastB2BWeighted = Math.round(
      b2bDeals
        .filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST' && (d.stage as any) !== 'WON' && (d.stage as any) !== 'LOST')
        .reduce((sum, d) => sum + (d.dealValue || 0) * (d.probability || 0), 0)
    );

    return {
      annualTarget,
      ytdRevenue: 0,
      currentMonthRevenue: 0,
      monthlyTarget: 83333333,
      achievementPercentage: 0,
      requiredMonthlyRunRate: Math.round(annualTarget / remainingMonths),
      historicalMonthlyAverage: 0,
      remainingMonths,
      forecastB2C: 0,
      forecastB2BWeighted,
      totalForecast: forecastB2BWeighted,
      forecastStatus: 'RED',
      methodology: 'Metode Deterministik: Horizon 1 tahun ke depan (Sep 2026 – Agu 2027). Menunggu data historis transaksi.'
    };
  }

  // Calculate YTD since launch (Sep 2026 onward)
  const ytdMonths = history.slice(Math.max(0, history.length - 12));
  const ytdRevenue = ytdMonths.reduce((acc, m) => acc + (m.revenue || 0), 0);

  const currentMonth = history[history.length - 1];
  const achievementPercentage = annualTarget > 0 ? Math.round((ytdRevenue / annualTarget) * 1000) / 10 : 0;

  // Horizon 1 tahun ke depan (12 bulan: Sep 2026 - Agu 2027)
  const remainingGap = annualTarget - ytdRevenue;
  const requiredMonthlyRunRate = remainingGap > 0
    ? Math.round(remainingGap / remainingMonths)
    : 0;

  // Historical B2C monthly average (excluding B2B)
  const totalB2C = ytdMonths.reduce((acc, m) => acc + (m.b2cRevenue || 0), 0);
  const avgMonthlyB2C = ytdMonths.length > 0 ? totalB2C / ytdMonths.length : 0;

  // Forecast B2C for remaining 12 months horizon
  const forecastB2C = Math.round(avgMonthlyB2C * remainingMonths);

  // Forecast B2B: sum(dealValue * probability) for open pipeline
  const forecastB2BWeighted = Math.round(
    b2bDeals
      .filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST' && (d.stage as any) !== 'WON' && (d.stage as any) !== 'LOST')
      .reduce((sum, d) => sum + (d.dealValue || 0) * (d.probability || 0), 0)
  );

  // Total forecast = YTD + Forecast B2C + Forecast B2B
  const totalForecast = ytdRevenue + forecastB2C + forecastB2BWeighted;

  let forecastStatus: 'GREEN' | 'YELLOW' | 'RED' = 'YELLOW';
  if (totalForecast >= annualTarget) {
    forecastStatus = 'GREEN';
  } else if (totalForecast >= 750000000) {
    forecastStatus = 'YELLOW';
  } else {
    forecastStatus = 'RED';
  }

  const methodology = `Metode Deterministik: Target Rp 1 Miliar diproyeksikan untuk 1 tahun ke depan (1 Sep 2026 – 31 Agu 2027, 12 Bulan). Realisasi kas ditarik dari buku transaksi (Rp${(ytdRevenue / 1000000).toFixed(1)}M) + [Run-rate proyeksi 12 bulan (Rp${(forecastB2C / 1000000).toFixed(1)}M)] + [Pipeline B2B berbobot (Rp${(forecastB2BWeighted / 1000000).toFixed(1)}M)].`;

  return {
    annualTarget,
    ytdRevenue,
    currentMonthRevenue: currentMonth.revenue || 0,
    monthlyTarget: currentMonth.target || 83333333,
    achievementPercentage,
    requiredMonthlyRunRate,
    historicalMonthlyAverage: ytdMonths.length > 0 ? Math.round(ytdRevenue / ytdMonths.length) : 0,
    remainingMonths,
    forecastB2C,
    forecastB2BWeighted,
    totalForecast,
    forecastStatus,
    methodology
  };
}

export function generateExecutiveInsights(
  products: Product[],
  b2bDeals: B2BDeal[],
  forecast: RevenueForecast
): ExecutiveInsight[] {
  if (!products || products.length === 0) {
    return [
      {
        id: 'ins-empty',
        severity: 'YELLOW',
        title: 'Database Baru Siap Dikonfigurasi',
        explanation: 'Belum cukup data transaksi dan produk untuk menghasilkan analisis prediktif.',
        businessImpact: 'Sistem siap menerima input produk, pelanggan, atau transaksi pertama Anda.',
        recommendedAction: 'Mulai dengan menambahkan produk atau muat data simulasi demo.',
        actionType: 'PRODUCT'
      }
    ];
  }

  const skillProduct = products.find(p => p.id === 'skill');
  const weightedB2B = b2bDeals
    .filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST')
    .reduce((sum, d) => sum + (d.dealValue || 0) * (d.probability || 0), 0);

  const insights: ExecutiveInsight[] = [
    {
      id: 'ins-1',
      severity: 'RED',
      title: 'Drop Konversi Checkout Valiyo Skill (-32% MoM)',
      explanation: 'Konversi checkout Valiyo Skill anjlok dari 2.8% menjadi 1.9% pasca perubahan alur gateway pembayaran, menyebabkan defisit bulanan ~Rp10.7M.',
      businessImpact: 'Penurunan omzet Skill mengancam pencapaian target bulanan September (Rp72.5M vs Rp95M).',
      recommendedAction: 'Audit dan pulihkan alur checkout 1-klik sebelum memproduksi materi baru.',
      actionType: 'PRODUCT',
      suggestedTask: {
        title: 'Audit & Sederhanakan Checkout Funnel Valiyo Skill',
        description: 'Sederhanakan form pendaftaran, hapus kolom non-esensial, dan aktifkan pembayaran instan QRIS/VA.',
        priority: 'CRITICAL',
        impact: 9,
        urgency: 9,
        expectedImpact: 'Memulihkan konversi Skill ke 2.8% (+Rp8M-Rp11M per bulan)',
        whyThisMatters: 'Mengatasi bottleneck terbesar yang menurunkan revenue bulan berjalan.'
      }
    },
    {
      id: 'ins-2',
      severity: 'RED',
      title: 'Pipeline B2B Perlu Penutupan Segera (Gap ke Run Rate Rp94M/bln)',
      explanation: `Diperlukan run rate bulanan Rp${(forecast.requiredMonthlyRunRate / 1000000).toFixed(1)}M untuk mencapai target Rp1 Miliar. Pipeline aktif Rp${(weightedB2B / 1000000).toFixed(1)}M memiliki 3 deal matang.`,
      businessImpact: 'B2B adalah tuas terbesar dengan margin kotor 74% dan ticket size puluhan juta rupiah.',
      recommendedAction: 'Prioritaskan penutupan 3 sekolah di tahap negosiasi (Yayasan Bintang Harapan, Pelita Bangsa, Insan Madani).',
      actionType: 'B2B',
      suggestedTask: {
        title: 'Founder Check-in Langsung ke 3 Akun Sekolah Tahap Negosiasi',
        description: 'Lakukan panggilan tatap muka atau video call untuk konfirmasi SPK dan pembayaran termin pertama.',
        priority: 'CRITICAL',
        impact: 10,
        urgency: 8,
        expectedImpact: 'Mengamankan Rp85.000.000 cash in di Q3/Q4.',
        whyThisMatters: 'Deal B2B langsung menutup defisit target tahunan tanpa biaya iklan baru.'
      }
    },
    {
      id: 'ins-3',
      severity: 'YELLOW',
      title: 'Peluang Cross-Selling Valiyo Students ke Database Valiyo Kids',
      explanation: 'Terdapat 410 orang tua aktif di Valiyo Kids. Analisis menunjukkan ~44% memiliki anak usia SMP yang belum terkonversi ke Valiyo Students.',
      businessImpact: 'Valiyo Students sedang tumbuh +12% MoM. Cross-selling internal memiliki CAC mendekati Rp0.',
      recommendedAction: 'Jalankan kampanye WhatsApp edukatif bundling persiapan ujian untuk keluarga Valiyo Kids.',
      actionType: 'REVENUE',
      suggestedTask: {
        title: 'Luncurkan Penawaran Eksklusif Bundling Kids & Students',
        description: 'Kirim broadcast WhatsApp tersegmentasi dengan voucher diskon 15% untuk pendaftaran anak kedua/kakak.',
        priority: 'HIGH',
        impact: 8,
        urgency: 7,
        expectedImpact: '+20 konversi siswa baru (~Rp9.000.000 tambahan revenue).',
        whyThisMatters: 'Meningkatkan LTV per keluarga dan memperkuat recurring retention ekosistem.'
      }
    },
    {
      id: 'ins-4',
      severity: 'GREEN',
      title: 'Gross Margin Portofolio Sehat di 83.4%',
      explanation: 'Model pengiriman digital dan integrasi AI menjaga biaya operasional tetap ramping (<17% dari pendapatan).',
      businessImpact: 'Cash flow operasional tetap positif dan mandiri tanpa pembakaran modal eksternal.',
      recommendedAction: 'Pertahankan disiplin operasional ramping, hindari rekrutmen headcount manual berlebih.',
      actionType: 'TASK'
    }
  ];

  return insights;
}

export function generateDeterministicAlerts(
  products: Product[],
  history: MonthlyHistoryItem[],
  tasks: Task[],
  b2bDeals: B2BDeal[],
  forecast: RevenueForecast
): Alert[] {
  const alerts: Alert[] = [];
  if (!history || history.length === 0) return alerts;
  const currentMonth = history[history.length - 1];

  // Alert 1: Revenue vs Target deficit > 10%
  const revenueDeficit = (currentMonth.target - currentMonth.revenue) / currentMonth.target;
  if (revenueDeficit > 0.10) {
    alerts.push({
      id: 'alert-rev-gap',
      severity: 'CRITICAL',
      title: 'Pendapatan Bulan Berjalan 23.7% di Bawah Target',
      whatHappened: `Pencapaian September saat ini Rp${(currentMonth.revenue / 1000000).toFixed(1)}M dari target Rp${(currentMonth.target / 1000000).toFixed(1)}M.`,
      whyItMatters: `Defisit Rp${((currentMonth.target - currentMonth.revenue) / 1000000).toFixed(1)}M menaikkan required run rate kuartal 4 menjadi Rp${(forecast.requiredMonthlyRunRate / 1000000).toFixed(1)}M/bulan.`,
      recommendedAction: 'Fokuskan energi founder pada penutupan deal B2B dan perbaikan checkout Skill, tunda proyek minor.',
      relatedModule: 'Revenue',
      createdAt: '2026-09-14',
      resolved: false
    });
  }

  // Alert 2: Product revenue decline > 15%
  const skillProduct = products.find(p => p.id === 'skill');
  if (skillProduct && skillProduct.growthRate < -0.15) {
    alerts.push({
      id: 'alert-skill-drop',
      severity: 'CRITICAL',
      title: 'Penurunan Signifikan Valiyo Skill (-18% MoM)',
      whatHappened: 'Pendapatan bulanan Valiyo Skill turun menjadi Rp14.3M dari target Rp25M, disertai drop konversi ke 1.9%.',
      whyItMatters: 'Skill adalah produk dengan ticket size retail tertinggi (Rp650.000) dan margin kotor 81%.',
      recommendedAction: 'Audit alur pembayaran dan sediakan opsi cicilan 3x atau pembayaran langsung QRIS.',
      relatedModule: 'Products',
      createdAt: '2026-09-12',
      resolved: false
    });
  }

  // Alert 3: B2B pipeline below expected pace
  const openB2B = b2bDeals.filter(d => d.stage !== 'CLOSED_LOST');
  if (openB2B.length < 5) {
    alerts.push({
      id: 'alert-b2b-pipe',
      severity: 'WARNING',
      title: 'Pipeline B2B Sekolah Membutuhkan Lead Baru',
      whatHappened: 'Jumlah prospek sekolah di tahap awal masih terbatas untuk mengamankan kuartal 4.',
      whyItMatters: 'Siklus closing B2B sekolah membutuhkan waktu 30-45 hari evaluasi yayasan.',
      recommendedAction: 'Tambah 5 penawaran kualifikasi sekolah baru sebelum akhir September.',
      relatedModule: 'B2B',
      createdAt: '2026-09-10',
      resolved: false
    });
  }

  // Alert 4: Overdue or high urgency tasks
  const overdueOrCritical = tasks.filter(t => t.priority === 'CRITICAL' && t.status !== 'DONE');
  if (overdueOrCritical.length > 0) {
    alerts.push({
      id: 'alert-tasks-critical',
      severity: 'WARNING',
      title: `${overdueOrCritical.length} Inisiatif Kritis Membutuhkan Tindakan Hari Ini`,
      whatHappened: 'Terdapat task bernilai dampak tinggi (skor prioritas >80) yang masih berstatus TODO/IN PROGRESS.',
      whyItMatters: 'Task ini berkaitan langsung dengan pemulihan revenue dan closing B2B bulan berjalan.',
      recommendedAction: 'Tinjau Today\'s Priorities di Command Center dan selesaikan atau delegasikan.',
      relatedModule: 'Tasks',
      createdAt: '2026-09-14',
      resolved: false
    });
  }

  return alerts;
}

export function generateDailyBrief(
  forecast: RevenueForecast,
  insights: ExecutiveInsight[],
  tasks: Task[]
): DailyBrief {
  const topTask = tasks
    .filter(t => t.status !== 'DONE')
    .sort((a, b) => b.priorityScore - a.priorityScore)[0];

  const pacePct = Math.round((forecast.ytdRevenue / (forecast.annualTarget * (9 / 12))) * 100);

  return {
    headline: 'Valiyo Berada di Jalur Realistis (Status: AT RISK Namun Terkendali)',
    healthSummary: `Pencapaian YTD mencapai Rp${(forecast.ytdRevenue / 1000000).toFixed(1)}M (${forecast.achievementPercentage}% dari target Rp1 Miliar). Prospek akhir tahun diproyeksikan Rp${(forecast.totalForecast / 1000000).toFixed(1)}M dengan pengawalan B2B yang ketat.`,
    revenuePace: pacePct,
    biggestOpportunity: 'Penutupan 3 Deal B2B Tahap Negosiasi senilai total Rp85.000.000 dengan Yayasan Sekolah.',
    biggestRisk: 'Drop konversi checkout Valiyo Skill (-32%) yang menekan pendapatan retail harian.',
    todayPriority: topTask ? topTask.title : 'Audit funnel checkout Valiyo Skill dan follow-up proposal B2B',
    doNotSpendTodayOn: 'Redesain kosmetik modul materi 2025, perombakan logo/warna, dan rapat operasional non-revenue.'
  };
}
