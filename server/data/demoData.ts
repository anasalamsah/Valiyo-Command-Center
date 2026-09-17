import {
  Product,
  Transaction,
  Customer,
  Goal,
  Task,
  B2BDeal,
  DecisionItem,
  KnowledgeDocument,
  MonthlyHistoryItem
} from '../../src/types.js';

// Bisnis dimulai pada 1 September 2026
export const initialMonthlyHistory: MonthlyHistoryItem[] = [
  { month: 'Sep 2026', revenue: 0, target: 85000000, b2cRevenue: 0, b2bRevenue: 0 }
];

export const initialProducts: Product[] = [
  {
    id: 'kids',
    name: 'Valiyo Kids',
    category: 'Pendidikan Anak Usia Dini & Karakter',
    price: 350000,
    status: 'STABLE',
    description: 'Program pembelajaran interaktif literasi, numerasi dasar, dan pembentukan karakter anak 4-8 tahun.',
    monthlyRevenue: 18200000,
    monthlyTarget: 19000000,
    monthlySales: 52,
    growthRate: 0.03,
    conversionRate: 0.038,
    previousConversionRate: 0.037,
    activeCustomers: 410,
    grossMargin: 0.88,
    funnel: {
      visitors: 18400,
      leads: 1850,
      checkouts: 210,
      purchases: 52
    },
    recentActivities: [
      { id: 'act-k1', date: '11 Sep 2026', action: 'Peluncuran modul Audio Karakter Anak', impact: '+6.2% engagement rate' },
      { id: 'act-k2', date: '04 Sep 2026', action: 'Webinar Parenting Bersama Psikolog', impact: '84 new leads acquired' }
    ],
    createdAt: '2025-01-10',
    updatedAt: '2026-09-12'
  },
  {
    id: 'students',
    name: 'Valiyo Students',
    category: 'Akademik & Persiapan Ujian SMP/SMA',
    price: 450000,
    status: 'GROWING',
    description: 'Bimbingan belajar digital terarah untuk penguasaan konsep sains, matematika, dan tes perguruan tinggi.',
    monthlyRevenue: 21600000,
    monthlyTarget: 20000000,
    monthlySales: 48,
    growthRate: 0.12,
    conversionRate: 0.042,
    previousConversionRate: 0.038,
    activeCustomers: 530,
    grossMargin: 0.84,
    funnel: {
      visitors: 22000,
      leads: 2400,
      checkouts: 290,
      purchases: 48
    },
    recentActivities: [
      { id: 'act-s1', date: '12 Sep 2026', action: 'Rilis Try Out Akbar Mandiri Batch 3', impact: '180 peserta organik bergabung' },
      { id: 'act-s2', date: '06 Sep 2026', action: 'Optimasi landing page persiapan UTBK', impact: 'Konversi naik dari 3.8% ke 4.2%' }
    ],
    createdAt: '2025-01-10',
    updatedAt: '2026-09-13'
  },
  {
    id: 'skill',
    name: 'Valiyo Skill',
    category: 'Karier & Keterampilan Praktis Dewasa',
    price: 650000,
    status: 'AT RISK',
    description: 'Bootcamp intensif dan sertifikasi AI terapan, analisis data, dan keterampilan digital produktif.',
    monthlyRevenue: 14300000,
    monthlyTarget: 25000000,
    monthlySales: 22,
    growthRate: -0.18,
    conversionRate: 0.019, // Anomaly drop from 0.028!
    previousConversionRate: 0.028,
    activeCustomers: 280,
    grossMargin: 0.81,
    funnel: {
      visitors: 14500,
      leads: 1200,
      checkouts: 130, // Big drop at checkout
      purchases: 22
    },
    recentActivities: [
      { id: 'act-sk1', date: '10 Sep 2026', action: 'Perubahan gateway pembayaran dan alur checkout', impact: 'Drop 32% checkout completion' },
      { id: 'act-sk2', date: '02 Sep 2026', action: 'Peluncuran kurikulum AI Generative untuk Manajer', impact: 'Leads tinggi namun konversi lemah' }
    ],
    createdAt: '2025-03-15',
    updatedAt: '2026-09-14'
  },
  {
    id: 'teacher',
    name: 'Valiyo Teacher',
    category: 'Kompetensi Guru & Sertifikasi Pengajar',
    price: 250000,
    status: 'STABLE',
    description: 'Akademi sertifikasi guru abad 21, pembuatan bahan ajar berbasis AI, dan manajemen kelas modern.',
    monthlyRevenue: 6400000,
    monthlyTarget: 7000000,
    monthlySales: 25,
    growthRate: 0.01,
    conversionRate: 0.035,
    previousConversionRate: 0.035,
    activeCustomers: 320,
    grossMargin: 0.89,
    funnel: {
      visitors: 9800,
      leads: 850,
      checkouts: 110,
      purchases: 25
    },
    recentActivities: [
      { id: 'act-t1', date: '08 Sep 2026', action: 'Kemitraan komunitas MGMP Jawa Barat', impact: '40 guru bergabung webinar' },
      { id: 'act-t2', date: '28 Agu 2026', action: 'Free toolkit RPP otomatis AI diluncurkan', impact: '310 guru mendaftar' }
    ],
    createdAt: '2025-02-01',
    updatedAt: '2026-09-10'
  },
  {
    id: 'b2b',
    name: 'Valiyo B2B',
    category: 'Solusi Institusi & Sekolah',
    price: 25000000, // Average enterprise package
    status: 'AT RISK',
    description: 'Integrasi sistem LMS, modul kurikulum digital, dan lisensi institusional untuk sekolah dan yayasan.',
    monthlyRevenue: 24000000,
    monthlyTarget: 35000000,
    monthlySales: 1,
    growthRate: -0.20,
    conversionRate: 0.125,
    previousConversionRate: 0.20,
    activeCustomers: 14,
    grossMargin: 0.74,
    funnel: {
      visitors: 1200,
      leads: 32,
      checkouts: 6,
      purchases: 1
    },
    recentActivities: [
      { id: 'act-b1', date: '13 Sep 2026', action: 'Demo presentation Yayasan Al-Hikmah Nusantara', impact: 'Menunggu keputusan komite yayasan' },
      { id: 'act-b2', date: '05 Sep 2026', action: 'Closing 1 kontrak lisensi tahunan SMA Cendekia', impact: 'Rp24.000.000 cash in' }
    ],
    createdAt: '2025-04-01',
    updatedAt: '2026-09-13'
  }
];

export const initialGoals: Goal[] = [
  {
    id: 'goal-year-2026',
    name: 'Target Revenue 1 Miliar (1 Tahun ke Depan)',
    level: 'YEAR',
    period: 'Sep 2026 - Agu 2027 (1 Tahun)',
    target: 1000000000, // IDR 1,000,000,000
    actual: 0, // Dihitung dinamis dari buku transaksi
    achievementRate: 0,
    status: 'YELLOW',
    owner: 'Anas (Founder)',
    deadline: '31 Agu 2027'
  },
  {
    id: 'goal-q1-2026',
    name: 'Target Pendapatan Q1 2026',
    level: 'QUARTER',
    period: 'Q1 2026',
    target: 100000000,
    actual: 223000000,
    achievementRate: 2.23,
    status: 'GREEN',
    owner: 'Anas (Founder)',
    deadline: '31 Mar 2026'
  },
  {
    id: 'goal-q2-2026',
    name: 'Target Pendapatan Q2 2026',
    level: 'QUARTER',
    period: 'Q2 2026',
    target: 200000000,
    actual: 259000000,
    achievementRate: 1.295,
    status: 'GREEN',
    owner: 'Anas (Founder)',
    deadline: '30 Jun 2026'
  },
  {
    id: 'goal-q3-2026',
    name: 'Target Pendapatan Q3 2026',
    level: 'QUARTER',
    period: 'Q3 2026',
    target: 300000000,
    actual: 243500000, // Aug + Jul + Sep so far = 88 + 83 + 72.5 = 243.5M
    achievementRate: 0.811,
    status: 'YELLOW',
    owner: 'Anas (Founder)',
    deadline: '30 Sep 2026'
  },
  {
    id: 'goal-q4-2026',
    name: 'Target Pendapatan Q4 2026',
    level: 'QUARTER',
    period: 'Q4 2026',
    target: 400000000,
    actual: 0,
    achievementRate: 0.0,
    status: 'YELLOW',
    owner: 'Anas (Founder)',
    deadline: '31 Des 2026'
  },
  {
    id: 'goal-month-sep',
    name: 'Target Revenue September 2026',
    level: 'MONTH',
    period: 'September 2026',
    target: 95000000,
    actual: 72500000,
    achievementRate: 0.763,
    status: 'RED',
    owner: 'Anas (Founder)',
    deadline: '30 Sep 2026'
  },
  {
    id: 'goal-b2b-schools',
    name: 'Penutupan 5 Akun Sekolah Baru Q3',
    level: 'QUARTER',
    period: 'Q3 2026',
    target: 5,
    actual: 2,
    achievementRate: 0.40,
    status: 'RED',
    owner: 'B2B Lead (Rian)',
    deadline: '30 Sep 2026'
  }
];

export const initialB2BDeals: B2BDeal[] = [
  {
    id: 'deal-1',
    institutionName: 'Yayasan Bintang Harapan Nusantara',
    contactPerson: 'Dra. Hj. Nurul Hidayati',
    dealValue: 35000000,
    probability: 0.8,
    stage: 'NEGOTIATION',
    expectedCloseDate: '24 Sep 2026',
    owner: 'Anas / Rian',
    notes: 'Sudah sepakat scope kurikulum AI guru dan siswa, menunggu paraf ketua yayasan.'
  },
  {
    id: 'deal-2',
    institutionName: 'SMA Islam Terpadu Insan Madani',
    contactPerson: 'Ahmad Fauzi, M.Pd.',
    dealValue: 28000000,
    probability: 0.75,
    stage: 'PROPOSAL',
    expectedCloseDate: '28 Sep 2026',
    owner: 'Rian',
    notes: 'Pengajuan proposal final untuk paket 2 semester 450 siswa.'
  },
  {
    id: 'deal-3',
    institutionName: 'SMK Cyber Media Global',
    contactPerson: 'Ir. Hendra Gunawan',
    dealValue: 40000000,
    probability: 0.5,
    stage: 'QUALIFIED',
    expectedCloseDate: '10 Okt 2026',
    owner: 'Rian',
    notes: 'Tertarik modul Valiyo Skill untuk 3 kelas jurusan RPL & Multimedia.'
  },
  {
    id: 'deal-4',
    institutionName: 'Jaringan Sekolah Kreatif An-Nahl',
    contactPerson: 'Bambang S., S.Si.',
    dealValue: 50000000,
    probability: 0.4,
    stage: 'PROSPECT',
    expectedCloseDate: '20 Okt 2026',
    owner: 'Rian',
    notes: 'Baru menyelesaikan meeting pertama dengan tim kurikulum pusat.'
  },
  {
    id: 'deal-5',
    institutionName: 'SD & SMP Pelita Bangsa Sejahtera',
    contactPerson: 'Maria Theresia, M.Ed.',
    dealValue: 22000000,
    probability: 0.85,
    stage: 'NEGOTIATION',
    expectedCloseDate: '22 Sep 2026',
    owner: 'Anas',
    notes: 'Pilot program Valiyo Kids dan Teacher terbukti sukses, tinggal invoice DP.'
  },
  {
    id: 'deal-6',
    institutionName: 'Pondok Pesantren Modern Daarul Ilmi',
    contactPerson: 'Ust. Zulkifli Rahman',
    dealValue: 30000000,
    probability: 0.3,
    stage: 'QUALIFIED',
    expectedCloseDate: '30 Okt 2026',
    owner: 'Rian',
    notes: 'Membutuhkan penyesuaian materi keagamaan dan jam belajar malam.'
  },
  {
    id: 'deal-7',
    institutionName: 'Yayasan Widya Mandiri Bandung',
    contactPerson: 'Prof. Dr. Irwan Setiawan',
    dealValue: 45000000,
    probability: 0.6,
    stage: 'PROPOSAL',
    expectedCloseDate: '15 Okt 2026',
    owner: 'Rian',
    notes: 'Evaluasi proposal lisensi multi-kampus untuk program vokasi.'
  },
  {
    id: 'deal-8',
    institutionName: 'SMA Cendekia Nusantara',
    contactPerson: 'Drs. H. Mulyadi',
    dealValue: 24000000,
    probability: 1.0,
    stage: 'CLOSED_WON',
    expectedCloseDate: '05 Sep 2026',
    owner: 'Anas',
    notes: 'Deal closed dan dana sudah masuk di pendapatan bulan September.'
  },
  {
    id: 'deal-9',
    institutionName: 'SMP Budi Mulia Jakarta Selatan',
    contactPerson: 'Anita Kusuma, S.Pd.',
    dealValue: 18000000,
    probability: 0.2,
    stage: 'PROSPECT',
    expectedCloseDate: '05 Nov 2026',
    owner: 'Rian',
    notes: 'Masih mencari alokasi anggaran BOS semester ganjil.'
  },
  {
    id: 'deal-10',
    institutionName: 'Institusi Diklat Kejuruan Prima',
    contactPerson: 'Kevin Tanudjaja',
    dealValue: 32000000,
    probability: 0.5,
    stage: 'QUALIFIED',
    expectedCloseDate: '25 Okt 2026',
    owner: 'Rian',
    notes: 'Tertarik sertifikasi praktis Valiyo Skill untuk peserta magang.'
  }
];

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Audit & Sederhanakan Checkout Funnel Valiyo Skill',
    description: 'Investigasi drop konversi 32% di tahap checkout setelah migrasi payment gateway baru. Buat flow 1-click checkout.',
    category: 'Product',
    priority: 'CRITICAL',
    impact: 9,
    urgency: 9,
    priorityScore: 81,
    whyThisMatters: 'Drop konversi Skill menyebabkan defisit revenue ~Rp10.7M bulan ini. Perbaikan langsung menaikkan run rate.',
    expectedImpact: 'Memulihkan konversi Skill dari 1.9% ke 2.8%, potensi tambahan Rp8M - Rp11M/bulan.',
    owner: 'Anas & Tim Tech',
    status: 'IN PROGRESS',
    dueDate: '16 Sep 2026',
    relatedProduct: 'skill',
    relatedGoalId: 'goal-month-sep',
    createdBy: 'AI Insight Engine',
    createdAt: '2026-09-12'
  },
  {
    id: 'task-2',
    title: 'Follow Up Intensif 3 Deal B2B Tahap Negosiasi (Nilai Rp85M)',
    description: 'Fasilitasi penandatanganan SPK dengan Bintang Harapan, Pelita Bangsa, dan Insan Madani sebelum tutup bulan.',
    category: 'B2B',
    priority: 'CRITICAL',
    impact: 10,
    urgency: 8,
    priorityScore: 80,
    whyThisMatters: 'Closing deal ini menjamin pencapaian target September sekaligus mengamankan target Q3 Rp300M.',
    expectedImpact: 'Cash flow masuk Rp50M - Rp85M di September/Oktober.',
    owner: 'Anas & Rian',
    status: 'TODO',
    dueDate: '18 Sep 2026',
    relatedProduct: 'b2b',
    relatedGoalId: 'goal-q3-2026',
    createdBy: 'Anas',
    createdAt: '2026-09-13'
  },
  {
    id: 'task-3',
    title: 'Akselerasi Cross-Selling Valiyo Students ke Wali Murid Valiyo Kids',
    description: 'Kirim penawaran paket bundling terarah via WhatsApp automation kepada 180 orang tua yang anaknya memiliki kakak jenjang SMP.',
    category: 'Growth',
    priority: 'HIGH',
    impact: 8,
    urgency: 7,
    priorityScore: 56,
    whyThisMatters: 'Biaya akuisisi pelanggan (CAC) internal mendekati Rp0 dengan LTV lebih tinggi.',
    expectedImpact: '+15-25 konversi paket tahunan (estimasi Rp6.7M - Rp11.2M).',
    owner: 'Tim Marketing',
    status: 'TODO',
    dueDate: '20 Sep 2026',
    relatedProduct: 'students',
    relatedGoalId: 'goal-month-sep',
    createdBy: 'AI Insight Engine',
    createdAt: '2026-09-13'
  },
  {
    id: 'task-4',
    title: 'Rilis Bundling Valiyo Teacher + Lisensi B2B Sekolah',
    description: 'Buat penawaran B2B include akses pelatihan guru bersertifikat untuk mempermudah closing kepala sekolah.',
    category: 'Revenue',
    priority: 'HIGH',
    impact: 8,
    urgency: 6,
    priorityScore: 48,
    whyThisMatters: 'Kepala sekolah lebih mudah mencairkan dana pelatihan guru daripada lisensi konten murni.',
    expectedImpact: 'Meningkatkan win-rate proposal B2B dari 25% ke 40%.',
    owner: 'Rian & Anas',
    status: 'BACKLOG',
    dueDate: '25 Sep 2026',
    relatedProduct: 'teacher',
    relatedGoalId: 'goal-b2b-schools',
    createdBy: 'Anas',
    createdAt: '2026-09-10'
  },
  {
    id: 'task-5',
    title: 'Otomasi Onboarding & Reminder Belajar AI Valiyo Kids',
    description: 'Bangun workflow interaktif WhatsApp AI agent untuk menyapa orang tua setiap pagi dengan ringkasan aktivitas anak.',
    category: 'AI',
    priority: 'MEDIUM',
    impact: 7,
    urgency: 5,
    priorityScore: 35,
    whyThisMatters: 'Mengurangi churn rate bulanan dari 6% ke <3.5% menjelang renewal semester.',
    expectedImpact: 'Retensi naik 25%, kepuasan pelanggan (NPS) naik.',
    owner: 'Tim AI & Product',
    status: 'IN PROGRESS',
    dueDate: '28 Sep 2026',
    relatedProduct: 'kids',
    relatedGoalId: 'goal-year-2026',
    createdBy: 'Team',
    createdAt: '2026-09-08'
  },
  {
    id: 'task-6',
    title: 'Evaluasi Penyesuaian Harga Dinamis Bootcamp Valiyo Skill',
    description: 'Uji model cicilan 3x Rp225.000 vs direct payment Rp650.000 untuk mengatasi resistensi daya beli mahasiswa fresh grad.',
    category: 'Product',
    priority: 'HIGH',
    impact: 7,
    urgency: 6,
    priorityScore: 42,
    whyThisMatters: 'Survei membuktikan 42% pengunjung gagal beli karena keterbatasan pembayaran tunai di muka.',
    expectedImpact: 'Peningkatan checkout konversi hingga +35%.',
    owner: 'Anas',
    status: 'TODO',
    dueDate: '22 Sep 2026',
    relatedProduct: 'skill',
    relatedGoalId: 'goal-month-sep',
    createdBy: 'Anas',
    createdAt: '2026-09-11'
  },
  {
    id: 'task-7',
    title: 'Tinjau Efisiensi Server & Cost Margin Konten Interaktif',
    description: 'Audit utilisasi cloud hosting dan streaming video modul belajar anak untuk mempertahankan gross margin >85%.',
    category: 'Operations',
    priority: 'MEDIUM',
    impact: 6,
    urgency: 4,
    priorityScore: 24,
    whyThisMatters: 'Menjaga margin operasional tetap ramping seiring peningkatan 40% trafik pengguna.',
    expectedImpact: 'Penghematan biaya server ~Rp2.5M/bulan.',
    owner: 'Tech Lead',
    status: 'TODO',
    dueDate: '30 Sep 2026',
    relatedProduct: 'kids',
    relatedGoalId: 'goal-year-2026',
    createdBy: 'Team',
    createdAt: '2026-09-05'
  },
  {
    id: 'task-8',
    title: 'Hentikan Redesain Grafis Konten Lama (Low-Impact Work)',
    description: 'Instruksikan tim kreatif untuk menghentikan pembaruan visual modul 2025 dan fokus penuh pada aset sales funnel B2B.',
    category: 'Operations',
    priority: 'MEDIUM',
    impact: 6,
    urgency: 5,
    priorityScore: 30,
    whyThisMatters: 'Waktu tim kreatif terbuang pada tugas kosmetik yang tidak menyumbang revenue.',
    expectedImpact: 'Pengalihan 60 jam kerja ke pembuatan sales collateral penentu closing B2B.',
    owner: 'Anas',
    status: 'DONE',
    dueDate: '14 Sep 2026',
    relatedGoalId: 'goal-month-sep',
    createdBy: 'Anas',
    createdAt: '2026-09-12'
  },
  {
    id: 'task-9',
    title: 'Setup Tracking Segmentasi LTV & Cohort Pelanggan',
    description: 'Integrasikan data transaksi untuk membaca retensi 30-hari dan cross-buying per kategori produk.',
    category: 'Product',
    priority: 'LOW',
    impact: 5,
    urgency: 3,
    priorityScore: 15,
    whyThisMatters: 'Memberikan dasar data akurat untuk penetapan budget marketing kuartal 4.',
    expectedImpact: 'Visibilitas akurat LTV per produk.',
    owner: 'Data Architect',
    status: 'BACKLOG',
    dueDate: '05 Okt 2026',
    relatedGoalId: 'goal-q4-2026',
    createdBy: 'Team',
    createdAt: '2026-09-01'
  },
  {
    id: 'task-10',
    title: 'Siapkan Proposal Kemitraan Dinas Pendidikan Kota Bandung',
    description: 'Susun draf MoU program sertifikasi guru cerdas AI untuk 150 sekolah percontohan.',
    category: 'B2B',
    priority: 'HIGH',
    impact: 9,
    urgency: 5,
    priorityScore: 45,
    whyThisMatters: 'Potensi pipeline skala besar untuk target Q4 Rp400M.',
    expectedImpact: 'Akses ke 150 sekolah (potensi pipeline Rp120M+).',
    owner: 'Rian & Anas',
    status: 'TODO',
    dueDate: '02 Okt 2026',
    relatedProduct: 'b2b',
    relatedGoalId: 'goal-q4-2026',
    createdBy: 'Anas',
    createdAt: '2026-09-09'
  },
  {
    id: 'task-11',
    title: 'Testing Lead Magnet: Tes Diagnostik Gaya Belajar AI Gratis',
    description: 'Luncurkan quiz assessment gaya belajar untuk menarik database orang tua baru via Instagram Ads berbiaya rendah.',
    category: 'Growth',
    priority: 'MEDIUM',
    impact: 6,
    urgency: 4,
    priorityScore: 24,
    whyThisMatters: 'Mendapatkan qualified leads murah untuk disalurkan ke Valiyo Kids & Students.',
    expectedImpact: '+500 kontak orang tua baru per minggu dengan CPL <Rp10.000.',
    owner: 'Tim Growth',
    status: 'TODO',
    dueDate: '25 Sep 2026',
    relatedProduct: 'students',
    relatedGoalId: 'goal-month-sep',
    createdBy: 'Team',
    createdAt: '2026-09-06'
  },
  {
    id: 'task-12',
    title: 'Review Performa Mentor & Guru Tamu Valiyo Skill',
    description: 'Analisis rating feedback peserta angkatan Agustus dan ganti instruktur modul backend yang berating <4.2.',
    category: 'Product',
    priority: 'MEDIUM',
    impact: 6,
    urgency: 4,
    priorityScore: 24,
    whyThisMatters: 'Kualitas pengajar menentukan reputasi word-of-mouth dan referral.',
    expectedImpact: 'Peningkatan rating kepuasan peserta ke >4.7.',
    owner: 'Curriculum Head',
    status: 'IN PROGRESS',
    dueDate: '20 Sep 2026',
    relatedProduct: 'skill',
    relatedGoalId: 'goal-month-sep',
    createdBy: 'Team',
    createdAt: '2026-09-07'
  },
  {
    id: 'task-13',
    title: 'Sinkronisasi Pembukuan Rekonsiliasi Bank Otomatis',
    description: 'Pastikan seluruh pembayaran transfer manual dan e-wallet tercatat instan di dashboard revenue.',
    category: 'Operations',
    priority: 'LOW',
    impact: 5,
    urgency: 3,
    priorityScore: 15,
    whyThisMatters: 'Menghindari selisih pencatatan kas internal vs payment gateway.',
    expectedImpact: 'Akurasi pembukuan 100% tanpa delay manual.',
    owner: 'Finance Officer',
    status: 'DONE',
    dueDate: '10 Sep 2026',
    relatedGoalId: 'goal-year-2026',
    createdBy: 'Anas',
    createdAt: '2026-09-02'
  },
  {
    id: 'task-14',
    title: 'Optimasi SEO Organik & Google Business Profile Valiyo',
    description: 'Perbarui kata kunci pencarian bimbingan belajar digital dan sertifikasi guru di area Jabodetabek dan Jabar.',
    category: 'Growth',
    priority: 'LOW',
    impact: 4,
    urgency: 2,
    priorityScore: 8,
    whyThisMatters: 'Membangun kanal trafik organik gratis jangka panjang.',
    expectedImpact: '+10% trafik pencarian brand dalam 60 hari.',
    owner: 'Content Specialist',
    status: 'BACKLOG',
    dueDate: '15 Okt 2026',
    relatedProduct: 'kids',
    relatedGoalId: 'goal-q4-2026',
    createdBy: 'Team',
    createdAt: '2026-09-01'
  },
  {
    id: 'task-15',
    title: 'Pembaruan Kebijakan Privasi Data & Perlindungan Anak',
    description: 'Pastikan kepatuhan seluruh aplikasi anak dengan regulasi UU Perlindungan Data Pribadi (PDP) Indonesia.',
    category: 'Operations',
    priority: 'MEDIUM',
    impact: 8,
    urgency: 3,
    priorityScore: 24,
    whyThisMatters: 'Prasyarat mutlak untuk dapat menjalin kemitraan institusi sekolah internasional.',
    expectedImpact: 'Kepatuhan hukum 100% dan kelayakan verifikasi B2B institusional.',
    owner: 'Legal / Anas',
    status: 'DONE',
    dueDate: '08 Sep 2026',
    relatedProduct: 'kids',
    relatedGoalId: 'goal-year-2026',
    createdBy: 'Anas',
    createdAt: '2026-09-01'
  }
];

export const initialDecisions: DecisionItem[] = [
  {
    id: 'dec-1',
    decision: 'Fokus B2B Institusi Sekolah Sebagai Mesin Akselerasi Target Rp1 Miliar',
    context: 'Pertumbuhan B2C stabil namun memerlukan biaya akuisisi iklan tinggi. B2B menawarkan nilai kontrak puluhan juta per transaksi dengan retensi tahunan.',
    reason: 'Margin tinggi (74%), ticket size Rp25M-Rp50M, dan siklus perpanjangan tahun ajaran baru menciptakan pendapatan berulang.',
    expectedOutcome: 'Menyumbang minimal Rp350M (35%) dari total target tahunan Rp1.000.000.000.',
    owner: 'Anas (Founder)',
    date: '15 Mei 2026',
    reviewDate: '30 Sep 2026',
    status: 'ACTIVE',
    result: 'Sudah menyumbang Rp191M YTD, 3 deal sedang negosiasi bernilai Rp85M.'
  },
  {
    id: 'dec-2',
    decision: 'Penetapan Standar Gross Margin Minimal 75% di Seluruh Produk',
    context: 'Menghindari jebakan operasional berat seperti bimbingan konvensional yang menyewa gedung dan honor tutor tinggi.',
    reason: 'Valiyo adalah ekosistem digital terukur dengan pengiriman konten dan pendampingan didukung otomasi AI.',
    expectedOutcome: 'Cash flow sehat tanpa ketergantungan modal ventura eksternal (lean self-sustaining).',
    owner: 'Anas (Founder)',
    date: '10 Jan 2026',
    reviewDate: '31 Des 2026',
    status: 'SUCCESS',
    result: 'Rata-rata gross margin terkini mencapai 83.4% di portofolio 5 produk.'
  },
  {
    id: 'dec-3',
    decision: 'Migrasi Gerbang Pembayaran Otomatis & Pengetatan Anti-Fraud',
    context: 'Terdapat upaya transaksi mencurigakan di produk Valiyo Skill pada akhir Agustus.',
    reason: 'Mencegah chargeback dan mengamankan rekonsiliasi instan.',
    expectedOutcome: 'Zero fraud rate dan verifikasi instan akses belajar.',
    owner: 'Tim Tech & Finance',
    date: '28 Agu 2026',
    reviewDate: '15 Sep 2026',
    status: 'REVIEW',
    result: 'Fraud terhenti 100%, namun flow baru mengakibatkan drop konversi checkout dari 2.8% ke 1.9% (sedang ditangani Task-1).'
  },
  {
    id: 'dec-4',
    decision: 'Pemberhentian Program Les Tatap Muka Privat Offline',
    context: 'Unit offline memakan 40% waktu tim operasional namun hanya menyumbang <8% revenue bersih.',
    reason: 'Tidak sejalan dengan visi scale-up lean digital ecosystem.',
    expectedOutcome: 'Fokus 100% sumber daya ke produk digital dan kemitraan B2B sekolah.',
    owner: 'Anas (Founder)',
    date: '01 Mar 2026',
    reviewDate: '01 Jun 2026',
    status: 'SUCCESS',
    result: 'Overhead turun 35%, founder dapat mengalokasikan 80% energi untuk strategic growth & B2B.'
  }
];

export const initialKnowledgeDocs: KnowledgeDocument[] = [
  {
    id: 'kn-1',
    title: 'Prinsip Strategis Ekosistem Valiyo (Vision & Operating Model)',
    category: 'Strategy',
    summary: 'Model bisnis terpadu Valiyo dari edukasi dini anak (Kids), akademik (Students), karier (Skill), profesi guru (Teacher) hingga institusi (B2B).',
    content: `Ekosistem Valiyo beroperasi dengan prinsip 'Lifetime Educational Flywheel':
1. Valiyo Kids membangun kepercayaan orang tua sejak usia dini anak (4-8 thn).
2. Siswa beranjak ke Valiyo Students untuk persiapan ujian dan penguasaan sains.
3. Orang tua dan mahasiswa mengambil Valiyo Skill untuk upskilling karier digital & AI.
4. Guru sekolah menggunakan Valiyo Teacher untuk sertifikasi pengajaran modern.
5. Sekolah dan yayasan mengadopsi Valiyo B2B sebagai infrastruktur terintegrasi.
Prinsip keuangan: Target pendapatan tahunan minimal Rp1.000.000.000 dengan gross margin >80%, struktur tim ramping (<15 orang), dan AI-driven delivery.`,
    lastUpdated: '2026-09-01'
  },
  {
    id: 'kn-2',
    title: 'Struktur Harga & Nilai Produk (Product & Pricing Matrix)',
    category: 'Pricing',
    summary: 'Daftar harga resmi, skema berlangganan, margin kotor, dan segmentasi pasar.',
    content: `- Valiyo Kids: Rp350.000 / paket semester (Margin: 88%). Target: Orang tua usia 26-40.
- Valiyo Students: Rp450.000 / paket tahunan (Margin: 84%). Target: Siswa SMP-SMA & Wali murid.
- Valiyo Skill: Rp650.000 / bootcamp mandiri (Margin: 81%). Target: Mahasiswa & profesional muda.
- Valiyo Teacher: Rp250.000 / sertifikasi kompetensi (Margin: 89%). Target: Guru madrasah/sekolah negeri/swasta.
- Valiyo B2B: Rp25.000.000 - Rp50.000.000 / lisensi institusional per tahun (Margin: 74%). Target: Yayasan pendidikan & sekolah formal.`,
    lastUpdated: '2026-09-05'
  },
  {
    id: 'kn-3',
    title: 'B2B Sales Playbook & Kualifikasi Sekolah',
    category: 'Sales',
    summary: 'Kriteria institusi sasaran, alur penawaran, dan strategi penanganan komite sekolah.',
    content: `Institusi sasaran B2B:
- Sekolah swasta bernilai SPP >Rp500.000/bulan dengan minimal 300 siswa aktif.
- Yayasan yang menaungi 2 atau lebih unit jenjang pendidikan.
Alur closing:
1. Demo langsung kepada Kepala Sekolah & Waka Kurikulum.
2. Sediakan uji coba modul Valiyo Teacher untuk 3 guru kunci secara gratis.
3. Presentasi penawaran gabungan kurikulum siswa + pelatihan guru ber-SK sertifikat.
4. Pendampingan administrasi pencairan dana anggaran sekolah (BOS/Yayasan).`,
    lastUpdated: '2026-08-20'
  },
  {
    id: 'kn-4',
    title: 'Standard Operating Procedure (SOP) Manajemen Krisis Revenue',
    category: 'SOP',
    summary: 'Protokol tindakan cepat saat pencapaian bulanan turun lebih dari 10% di bawah target.',
    content: `Jika pacing revenue bulanan <90% dari target proporsional:
1. Cek rasio konversi per produk vs 30 hari sebelumnya.
2. Jika masalah pada konversi checkout B2C: lakukan audit teknis flow pembayaran dalam 24 jam.
3. Jika masalah pada pipeline B2B: founder langsung turun tangan intervensi 3 deal terbesar di tahap negosiasi.
4. Bekukan seluruh inisiatif dekoratif/redesain konten non-esensial dan alihkan tenaga ke aktivitas closing.`,
    lastUpdated: '2026-09-02'
  }
];

// Helper to generate 60 realistic customers
export function generateDemoCustomers(): Customer[] {
  const segments: Customer['segment'][] = ['Parent', 'Student', 'Professional', 'Teacher', 'School'];
  const sources: Transaction['source'][] = ['Organic', 'Referral', 'Freelancer', 'Social Media', 'B2B', 'Partnership', 'Direct', 'Other'];
  const names = [
    'Budi Santoso', 'Siti Rahmawati', 'Rizky Pratama', 'Dewi Lestari', 'Agus Setiawan',
    'Tri Wahyuni', 'Eko Prasetyo', 'Nurul Annisa', 'Hendra Wijaya', 'Sri Handayani',
    'Dimas Aditya', 'Rina Anggraini', 'Fajar Ramadhan', 'Maya Indah', 'Bayu Saputra',
    'Indah Permatasari', 'Doni Kusuma', 'Lia Safitri', 'Yoga Pratama', 'Fitri Handayani',
    'SMA Islam Insan Cendekia', 'Yayasan Pendidikan Al-Hikmah', 'SMP Taruna Harapan',
    'Anjar Gunawan', 'Melati Putri', 'Cahyo Utomo', 'Vina Meliana', 'Taufik Hidayat',
    'Dina Mariana', 'Lukman Hakim', 'Wulan Sari', 'Rahmat Hidayat', 'Yuni Kartika',
    'Farhan Maulana', 'Gita Gutawa', 'Irfan Bachdim', 'Nadia Syahira', 'Kurniawan Dwi',
    'Retno Wulandari', 'Aris Munandar', 'Tias Anggraini', 'Bambang Soetjipto', 'Zahra Amelia',
    'Wildan Firdaus', 'Tiara Andini', 'Danang Prasetya', 'Ika Novita', 'Galih Permana',
    'Ratna Dewi', 'Satria Pamungkas', 'Devi Kurnia', 'Panji Gumilang', 'Yulia Safitri',
    'Roni Kurniawan', 'Ayu Lestari', 'Surya Saputra', 'Hesti Purwanti', 'Ilham Akbar',
    'Siska Puspita', 'Alamsyah Putra'
  ];

  return names.map((name, idx) => {
    const isSchool = name.includes('SMA') || name.includes('Yayasan') || name.includes('SMP');
    const segment: Customer['segment'] = isSchool ? 'School' : segments[idx % (segments.length - 1)];
    const source = sources[idx % sources.length];
    const products: Product['id'][] = isSchool
      ? ['b2b']
      : segment === 'Parent'
      ? ['kids']
      : segment === 'Student'
      ? ['students']
      : segment === 'Professional'
      ? ['skill']
      : ['teacher'];

    const spend = isSchool ? (idx % 2 === 0 ? 25000000 : 35000000) : (idx % 3 + 1) * (segment === 'Professional' ? 650000 : 350000);

    return {
      id: `cust-${idx + 1}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
      phone: `0812${String(idx + 1000).padStart(4, '0')}${String(idx).padStart(2, '0')}`,
      segment,
      source,
      productsPurchased: products,
      totalSpend: spend,
      status: idx % 10 === 0 ? 'CHURNED' : 'ACTIVE',
      createdAt: `2025-${String((idx % 12) + 1).padStart(2, '0')}-15`
    };
  });
}

// Helper to generate 110 realistic transactions
export function generateDemoTransactions(customers: Customer[]): Transaction[] {
  const sources: Transaction['source'][] = [
    'Organic', 'Referral', 'Freelancer', 'Social Media', 'B2B', 'Partnership', 'Direct', 'Other'
  ];
  const items: Transaction[] = [];

  // Add 10 transactions in September 2026
  const sepProducts: { p: Product['id']; name: string; amount: number }[] = [
    { p: 'kids', name: 'Valiyo Kids', amount: 350000 },
    { p: 'students', name: 'Valiyo Students', amount: 450000 },
    { p: 'skill', name: 'Valiyo Skill', amount: 650000 },
    { p: 'teacher', name: 'Valiyo Teacher', amount: 250000 },
    { p: 'b2b', name: 'Valiyo B2B', amount: 24000000 }
  ];

  for (let i = 1; i <= 110; i++) {
    const cust = customers[i % customers.length];
    const prodConfig = cust.segment === 'School'
      ? sepProducts[4]
      : sepProducts[i % 4];

    const day = (i % 28) + 1;
    const month = i > 85 ? '09' : i > 60 ? '08' : i > 35 ? '07' : '06';

    items.push({
      id: `tx-${1000 + i}`,
      customerId: cust.id,
      customerName: cust.name,
      productId: prodConfig.p,
      productName: prodConfig.name,
      amount: prodConfig.amount,
      source: sources[i % sources.length],
      status: i === 72 ? 'REFUNDED' : 'COMPLETED',
      date: `2026-${month}-${String(day).padStart(2, '0')}`
    });
  }

  return items;
}
