import express from "express";
import {
  initialMonthlyHistory,
  initialProducts,
  initialGoals,
  initialB2BDeals,
  initialTasks,
  initialDecisions,
  initialKnowledgeDocs,
  generateDemoCustomers,
  generateDemoTransactions
} from "./data/demoData.js";
import {
  calculateHealthScore,
  calculateRevenueForecast,
  generateExecutiveInsights,
  generateDeterministicAlerts,
  generateDailyBrief
} from "./services/calculations.js";
import { askValiyoAI, diagnoseProductAI } from "./services/gemini.js";
import {
  calculateDataQuality,
  generateV2Insights,
  generateEnhancedDailyBrief,
  diagnoseRevenue,
  calculateCrossSellIntelligence,
  getB2BDealIntelligence,
  getGoalIntelligence,
  getAgentTeam,
  answerFounderQuestionWithFollowUp
} from "./services/intelligence.js";
import { Task, Goal, B2BDeal, DecisionItem, Product, AIInsight, Customer, Transaction, AIAgent, Expense, Employee, Freelancer } from "../src/types.js";

export const app = express();

app.use(express.json());

// Normalization middleware for Vercel and reverse proxy rewrites:
// If a request reaches this app without the /api prefix, restore it so routes match seamlessly
app.use((req, res, next) => {
  if (!req.url.startsWith("/api") && !req.url.startsWith("/assets") && !req.url.startsWith("/favicon")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }
  next();
});
// In-memory persistent database store (Bisnis dimulai pada 1 September 2026)
let monthlyHistory = [...initialMonthlyHistory];
let products: Product[] = []; // Bersihkan produk ekosistem (mulai dari 0 dan diambil dari daftar transaksi)
let goals: Goal[] = [...initialGoals];
let b2bDeals: B2BDeal[] = []; // Bersihkan pipeline B2B (mulai dari 0)
let tasks: Task[] = [...initialTasks];
let decisions: DecisionItem[] = [...initialDecisions];
const knowledgeDocs = [...initialKnowledgeDocs];

let customers: Customer[] = []; // Bersihkan daftar pelanggan (mulai dari 0)
let transactions: Transaction[] = []; // Dimulai dari 0 sesuai permintaan user
let agentTeam: AIAgent[] = [...getAgentTeam()];
let isDemoMode = false;
let v2Insights: AIInsight[] = [];

// Buku Pengeluaran Operasional (Spending: AI, Zoom, Komisi Freelancer)
// Dibersihkan sesuai permintaan user: mulai data spending dari 0
let expenses: Expense[] = [];

// Daftar Karyawan (Employees)
let employees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Anas',
    role: 'Founder & Head of Product',
    joinDate: '2026-09-01',
    division: 'Leadership & Strategy',
    status: 'FULL_TIME',
    email: 'anas@valiyo.id',
    phone: '0812-3456-7890',
    notes: 'Penanggung jawab ekosistem Valiyo dan strategi akselerasi 1 Miliar'
  }
];

// Daftar Freelancer dengan Kode Referral Unik untuk Field Input Penjualan Baru
let freelancers: Freelancer[] = [
  {
    id: 'fr-1',
    name: 'Dimas Setiawan',
    code: 'DIMAS-EDU',
    roleOrSkill: 'Tutor Matematika & Karakter',
    joinDate: '2026-09-02',
    commissionRate: 10,
    commissionType: 'PERCENTAGE',
    phone: '0813-8888-7777',
    status: 'ACTIVE',
    notes: 'Tutor spesialis modul olimpiade dan mentoring privat siswa'
  },
  {
    id: 'fr-2',
    name: 'Rian Pratama',
    code: 'RIAN-VID',
    roleOrSkill: 'Video Editor & Content Creator',
    joinDate: '2026-09-03',
    commissionRate: 10,
    commissionType: 'PERCENTAGE',
    phone: '0857-9999-1234',
    status: 'ACTIVE',
    notes: 'Pembuat video reels edukasi, modul micro-learning, dan materi promosi'
  }
];

// Tarik data revenue dari buku transaksi & sinkronisasi histori keuangan
function recalculateRevenueAndMonthlyHistory() {
  const completedTxs = transactions.filter(t => t.status !== 'REFUNDED');
  let sepTotal = 0;
  let sepB2C = 0;
  let sepB2B = 0;

  for (const tx of completedTxs) {
    const amt = tx.amount || 0;
    sepTotal += amt;
    if (tx.source === 'B2B' || tx.productId === 'b2b') {
      sepB2B += amt;
    } else {
      sepB2C += amt;
    }
  }

  // Bisnis dimulai 1 September 2026 (Bulan pertama operasional)
  monthlyHistory = [
    {
      month: 'Sep 2026',
      revenue: sepTotal,
      target: 85000000,
      b2cRevenue: sepB2C,
      b2bRevenue: sepB2B
    }
  ];

  // Sinkronisasi target revenue dengan realisasi transaksi
  goals.forEach(g => {
    const gName = (g.name || '').toLowerCase();
    if (gName.includes('revenue') || gName.includes('pendapatan') || gName.includes('target') || gName.includes('omzet')) {
      g.actual = sepTotal;
      g.achievementRate = g.target > 0 ? g.actual / g.target : 0;
      if (g.achievementRate >= 0.95) g.status = 'GREEN';
      else if (g.achievementRate < 0.75) g.status = 'RED';
      else g.status = 'YELLOW';
    }
  });

  // Sinkronisasi akumulasi belanja per pelanggan
  const custSpendMap = new Map<string, { total: number; products: Set<string> }>();
  for (const tx of completedTxs) {
    const entry = custSpendMap.get(tx.customerId) || { total: 0, products: new Set() };
    entry.total += tx.amount || 0;
    if (tx.productId) entry.products.add(tx.productId);
    custSpendMap.set(tx.customerId, entry);
  }
  for (const cust of customers) {
    const entry = custSpendMap.get(cust.id);
    cust.totalSpend = entry ? entry.total : 0;
    if (entry) {
      cust.productsPurchased = Array.from(entry.products);
    }
  }

  // Sinkronisasi produk ekosistem
  syncProductsFromTransactions();
}

// Sinkronisasi produk ekosistem langsung dari daftar transaksi
function syncProductsFromTransactions() {
  if (transactions.length === 0) {
    products = [];
    return;
  }

  const prodMap = new Map<string, {
    id: string;
    name: string;
    totalRevenue: number;
    monthlyRevenue: number;
    txCount: number;
    prices: number[];
    buyers: Set<string>;
    recentTx: Transaction[];
  }>();

  const currentMonthPrefix = new Date().toISOString().slice(0, 7);

  for (const tx of transactions) {
    if (tx.status !== 'REFUNDED') {
      const prodName = (tx.productName || 'Produk Valiyo').trim();
      const prodId = tx.productId || prodName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'prod-custom';

      if (!prodMap.has(prodId)) {
        prodMap.set(prodId, {
          id: prodId,
          name: prodName,
          totalRevenue: 0,
          monthlyRevenue: 0,
          txCount: 0,
          prices: [],
          buyers: new Set<string>(),
          recentTx: []
        });
      }

      const item = prodMap.get(prodId)!;
      item.totalRevenue += tx.amount || 0;
      if (tx.date && tx.date.startsWith(currentMonthPrefix)) {
        item.monthlyRevenue += tx.amount || 0;
      } else {
        item.monthlyRevenue += tx.amount || 0;
      }
      item.txCount += 1;
      item.prices.push(tx.amount || 0);

      const buyerId = tx.buyerPhone || tx.buyerEmail || tx.customerName || tx.customerId;
      if (buyerId) item.buyers.add(buyerId);
      item.recentTx.push(tx);
    }
  }

  const categories = ['Digital Education', 'Parenting & Kids', 'Masterclass & Training', 'SaaS Tools', 'Kemitraan'];
  const updatedProducts: Product[] = [];
  let idx = 0;

  for (const [prodId, data] of prodMap.entries()) {
    const existing = products.find(p => p.id === prodId || p.name.toLowerCase() === data.name.toLowerCase());
    const latestPrice = data.prices.length > 0 ? data.prices[data.prices.length - 1] : 150000;
    const target = existing?.monthlyTarget || Math.max(15000000, data.monthlyRevenue * 1.5);
    const growthRate = existing ? existing.growthRate : 0.12;

    let status: Product['status'] = 'STABLE';
    if (data.monthlyRevenue >= target) {
      status = 'GROWING';
    } else if (data.monthlyRevenue > 0) {
      status = 'GROWING';
    } else {
      status = 'AT RISK';
    }

    const recentActivities = data.recentTx.slice(-3).reverse().map((t, i) => ({
      id: `act-${prodId}-${i}`,
      date: t.date || 'Hari ini',
      action: `Pembelian oleh ${t.customerName || 'Pelanggan'} (Rp ${(t.amount || 0).toLocaleString('id-ID')})`,
      impact: 'Pendapatan riil dari transaksi buku kas'
    }));

    if (recentActivities.length === 0) {
      recentActivities.push({
        id: `act-${prodId}-init`,
        date: 'Hari ini',
        action: 'Produk disinkronkan dari buku transaksi',
        impact: 'Data aktif'
      });
    }

    updatedProducts.push({
      id: prodId,
      name: data.name,
      category: existing?.category || categories[idx % categories.length],
      price: existing?.price || latestPrice,
      status: existing?.status || status,
      description: existing?.description || `Produk ekosistem diekstrak dari transaksi: ${data.name}`,
      monthlyRevenue: data.monthlyRevenue,
      monthlyTarget: target,
      monthlySales: data.txCount,
      growthRate,
      conversionRate: 0.035,
      previousConversionRate: 0.03,
      activeCustomers: data.buyers.size,
      grossMargin: existing?.grossMargin || 0.75,
      funnel: {
        visitors: Math.max(100, data.txCount * 25),
        leads: Math.max(20, data.txCount * 5),
        checkouts: Math.max(5, data.txCount * 2),
        purchases: data.txCount
      },
      recentActivities,
      createdAt: existing?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    });
    idx++;
  }

  products = updatedProducts;
}

// Helper to recompute derived system state
function getSystemState() {
  const health = calculateHealthScore(products, monthlyHistory, tasks, b2bDeals, goals);
  const forecast = calculateRevenueForecast(monthlyHistory, b2bDeals);
  const insights = generateExecutiveInsights(products, b2bDeals, forecast);
  const alerts = generateDeterministicAlerts(products, monthlyHistory, tasks, b2bDeals, forecast);
  v2Insights = generateV2Insights(products, monthlyHistory, tasks, b2bDeals, goals, forecast);
  const dailyBrief = generateEnhancedDailyBrief(forecast, v2Insights, tasks);
  const dataQuality = calculateDataQuality(products, tasks, b2bDeals, customers, transactions);
  const revenueDiagnosis = diagnoseRevenue(forecast, monthlyHistory, products, b2bDeals);
  const crossSell = calculateCrossSellIntelligence(products, customers);
  const b2bIntelligence = getB2BDealIntelligence(b2bDeals);
  const goalIntelligence = getGoalIntelligence(goals);

  const totalSpending = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const currentMonthRevenue = monthlyHistory.length > 0 ? (monthlyHistory[monthlyHistory.length - 1].revenue || 0) : 0;
  const netCashFlow = currentMonthRevenue - totalSpending;

  return {
    health,
    forecast,
    insights,
    v2Insights,
    alerts,
    dailyBrief,
    dataQuality,
    revenueDiagnosis,
    crossSell,
    b2bIntelligence,
    goalIntelligence,
    agentTeam,
    expenses,
    totalSpending,
    netCashFlow,
    employees,
    freelancers
  };
}

// ==========================================
// API ROUTES
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /api/state - Full Command Center Business State
app.get('/api/state', (req, res) => {
  try {
    const derived = getSystemState();

    // Sort tasks by priorityScore descending
    const sortedTasks = [...tasks].sort((a, b) => b.priorityScore - a.priorityScore);

    res.json({
      health: derived.health,
      forecast: derived.forecast,
      insights: derived.insights,
      v2Insights: derived.v2Insights,
      alerts: derived.alerts,
      dailyBrief: derived.dailyBrief,
      dataQuality: derived.dataQuality,
      revenueDiagnosis: derived.revenueDiagnosis,
      crossSell: derived.crossSell,
      b2bIntelligence: derived.b2bIntelligence,
      goalIntelligence: derived.goalIntelligence,
      agentTeam: derived.agentTeam,
      expenses,
      totalSpending: derived.totalSpending,
      netCashFlow: derived.netCashFlow,
      employees,
      freelancers,
      products,
      tasks: sortedTasks,
      b2bDeals,
      goals,
      decisions,
      knowledgeDocs,
      monthlyHistory,
      customers,
      transactions,
      customersCount: customers.length,
      transactionsCount: transactions.length,
      recentTransactions: transactions.slice(0, 20),
      isDemoMode
    });
  } catch (err: any) {
    console.error('Error fetching state:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ==========================================
// SPENDING (PENGELUARAN BISNIS) CRUD
// ==========================================
app.get('/api/expenses', (req, res) => {
  const totalSpending = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const completedTxs = transactions.filter(t => t.status !== 'REFUNDED');
  const totalRevenue = completedTxs.reduce((sum, t) => sum + (t.amount || 0), 0);
  const netCashFlow = totalRevenue - totalSpending;

  res.json({
    expenses,
    totalSpending,
    totalRevenue,
    netCashFlow
  });
});

app.post('/api/expenses', (req, res) => {
  const { title, category, amount, date, recipient, paymentMethod, notes } = req.body;
  if (!title || !amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Keterangan dan nominal pengeluaran wajib diisi' });
  }

  const newExpense: Expense = {
    id: `exp-${Date.now()}`,
    title: title.trim(),
    category: category || 'Subscribe AI',
    amount: Number(amount),
    date: date || new Date().toISOString().split('T')[0],
    recipient: (recipient || '').trim(),
    paymentMethod: paymentMethod || 'Transfer Bank',
    notes: (notes || '').trim(),
    createdAt: new Date().toISOString()
  };

  expenses.unshift(newExpense);
  res.status(201).json({
    expense: newExpense,
    systemState: getSystemState(),
    message: 'Catatan pengeluaran berhasil disimpan'
  });
});

app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = expenses.length;
  expenses = expenses.filter(e => e.id !== id);
  if (expenses.length === initialLen) {
    return res.status(404).json({ error: 'Catatan pengeluaran tidak ditemukan' });
  }
  res.json({
    success: true,
    systemState: getSystemState(),
    message: 'Catatan pengeluaran berhasil dihapus'
  });
});

app.post('/api/expenses/clear', (req, res) => {
  expenses = [];
  res.json({
    success: true,
    systemState: getSystemState(),
    message: 'Buku pengeluaran berhasil dikosongkan (mulai dari 0)'
  });
});

// ==========================================
// TEAM & TALENTA (KARYAWAN & FREELANCER) CRUD
// ==========================================
app.get('/api/team', (req, res) => {
  res.json({ employees, freelancers });
});

// Karyawan
app.get('/api/employees', (req, res) => {
  res.json(employees);
});

app.post('/api/employees', (req, res) => {
  const { name, role, joinDate, division, status, email, phone, notes } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nama karyawan wajib diisi' });
  }
  if (!role || !role.trim()) {
    return res.status(400).json({ error: 'Role / Posisi karyawan wajib diisi' });
  }

  const newEmployee: Employee = {
    id: `emp-${Date.now()}`,
    name: name.trim(),
    role: role.trim(),
    joinDate: joinDate || new Date().toISOString().split('T')[0],
    division: (division || 'Operasional').trim(),
    status: status || 'FULL_TIME',
    email: (email || '').trim(),
    phone: (phone || '').trim(),
    notes: (notes || '').trim(),
    createdAt: new Date().toISOString()
  };

  employees.unshift(newEmployee);
  res.status(201).json({
    employee: newEmployee,
    message: 'Karyawan baru berhasil ditambahkan'
  });
});

app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const idx = employees.findIndex(e => e.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Data karyawan tidak ditemukan' });
  }
  employees[idx] = {
    ...employees[idx],
    ...req.body,
    id
  };
  res.json({
    employee: employees[idx],
    message: 'Data karyawan berhasil diperbarui'
  });
});

app.delete('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = employees.length;
  employees = employees.filter(e => e.id !== id);
  if (employees.length === initialLen) {
    return res.status(404).json({ error: 'Data karyawan tidak ditemukan' });
  }
  res.json({
    success: true,
    message: 'Data karyawan berhasil dihapus'
  });
});

// Freelancer dengan kode referral unik
app.get('/api/freelancers', (req, res) => {
  res.json(freelancers);
});

app.post('/api/freelancers', (req, res) => {
  const { name, code, roleOrSkill, joinDate, commissionRate, commissionType, phone, notes } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nama freelancer wajib diisi' });
  }
  if (!code || !code.trim()) {
    return res.status(400).json({ error: 'Kode referral unik wajib diisi' });
  }

  const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '-');
  const existing = freelancers.find(f => f.code.toUpperCase() === cleanCode);
  if (existing) {
    return res.status(400).json({ error: `Kode referral "${cleanCode}" sudah digunakan oleh ${existing.name}` });
  }

  const newFreelancer: Freelancer = {
    id: `fr-${Date.now()}`,
    name: name.trim(),
    code: cleanCode,
    roleOrSkill: (roleOrSkill || 'Freelancer Mitra').trim(),
    joinDate: joinDate || new Date().toISOString().split('T')[0],
    commissionRate: commissionRate !== undefined && commissionRate !== '' ? Number(commissionRate) : 10,
    commissionType: commissionType || 'PERCENTAGE',
    phone: (phone || '').trim(),
    status: 'ACTIVE',
    notes: (notes || '').trim(),
    createdAt: new Date().toISOString()
  };

  freelancers.unshift(newFreelancer);
  res.status(201).json({
    freelancer: newFreelancer,
    message: 'Freelancer baru dengan kode referral berhasil ditambahkan'
  });
});

app.put('/api/freelancers/:id', (req, res) => {
  const { id } = req.params;
  const idx = freelancers.findIndex(f => f.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Freelancer tidak ditemukan' });
  }
  if (req.body.code) {
    const cleanCode = req.body.code.trim().toUpperCase().replace(/\s+/g, '-');
    const conflict = freelancers.find(f => f.code.toUpperCase() === cleanCode && f.id !== id);
    if (conflict) {
      return res.status(400).json({ error: `Kode referral "${cleanCode}" sudah digunakan oleh ${conflict.name}` });
    }
    req.body.code = cleanCode;
  }

  freelancers[idx] = {
    ...freelancers[idx],
    ...req.body,
    id
  };
  res.json({
    freelancer: freelancers[idx],
    message: 'Data freelancer berhasil diperbarui'
  });
});

app.delete('/api/freelancers/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = freelancers.length;
  freelancers = freelancers.filter(f => f.id !== id);
  if (freelancers.length === initialLen) {
    return res.status(404).json({ error: 'Freelancer tidak ditemukan' });
  }
  res.json({
    success: true,
    message: 'Data freelancer berhasil dihapus'
  });
});

// ==========================================
// DEMO MODE & DATABASE CONTROLS
// ==========================================
app.get('/api/demo/status', (req, res) => {
  res.json({
    isDemoMode,
    counts: {
      products: products.length,
      customers: customers.length,
      transactions: transactions.length,
      deals: b2bDeals.length,
      tasks: tasks.length,
      goals: goals.length
    }
  });
});

app.post('/api/demo/reset', (req, res) => {
  monthlyHistory = [...initialMonthlyHistory];
  products = [...initialProducts];
  goals = [...initialGoals];
  b2bDeals = [...initialB2BDeals];
  tasks = [...initialTasks];
  decisions = [...initialDecisions];
  customers = generateDemoCustomers();
  transactions = generateDemoTransactions(customers);
  agentTeam = [...getAgentTeam()];
  expenses = []; // Mulai data spending dari 0 sesuai permintaan user
  isDemoMode = true;
  recalculateRevenueAndMonthlyHistory();

  res.json({ success: true, message: 'Data demo realistis berhasil dimuat ulang' });
});

app.post('/api/demo/clear', (req, res) => {
  monthlyHistory = [
    { month: 'Sep 2026', revenue: 0, target: 85000000, b2cRevenue: 0, b2bRevenue: 0 }
  ];
  products = [];
  goals = [];
  b2bDeals = [];
  tasks = [];
  decisions = [];
  customers = [];
  transactions = [];
  expenses = [];
  agentTeam = [];
  isDemoMode = false;
  recalculateRevenueAndMonthlyHistory();

  res.json({ success: true, message: 'Database telah dibersihkan menjadi mode kosong' });
});

// ==========================================
// PRODUCTS CRUD
// ==========================================
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Produk tidak ditemukan' });
  }
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const { name, category, price, status, description, monthlyTarget } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nama produk wajib diisi' });
  }

  const id = (name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4)) as any;
  const newProduct: Product = {
    id,
    name,
    category: category || 'General',
    price: Number(price) || 0,
    status: status || 'GROWING',
    description: description || '',
    monthlyRevenue: 0,
    monthlyTarget: Number(monthlyTarget) || 20000000,
    monthlySales: 0,
    growthRate: 0,
    conversionRate: 0.03,
    previousConversionRate: 0.03,
    activeCustomers: 0,
    grossMargin: 0.8,
    funnel: {
      visitors: 500,
      leads: 50,
      checkouts: 10,
      purchases: 0
    },
    recentActivities: [
      { id: `act-${Date.now()}`, date: 'Hari ini', action: 'Produk ditambahkan ke sistem', impact: 'Inisialisasi katalog' }
    ],
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.patch('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Produk tidak ditemukan' });
  }
  products[index] = {
    ...products[index],
    ...req.body,
    updatedAt: new Date().toISOString().split('T')[0]
  };
  res.json(products[index]);
});

app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Produk tidak ditemukan' });
  }
  products.splice(index, 1);
  res.json({ success: true, systemState: getSystemState() });
});

app.post('/api/products/clear', (req, res) => {
  products = [];
  res.json({
    success: true,
    message: 'Data produk ekosistem telah dibersihkan (mulai dari 0)',
    systemState: getSystemState()
  });
});

app.post('/api/products/sync', (req, res) => {
  syncProductsFromTransactions();
  res.json({
    success: true,
    products,
    message: 'Data produk ekosistem berhasil disinkronkan dari daftar transaksi',
    systemState: getSystemState()
  });
});

app.post('/api/products/:id/diagnose', async (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Produk tidak ditemukan' });
  }
  try {
    const diagnosis = await diagnoseProductAI(product);
    res.json(diagnosis);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Diagnosis gagal' });
  }
});

// ==========================================
// CUSTOMERS CRUD
// ==========================================
app.get('/api/customers', (req, res) => {
  res.json(customers);
});

app.post('/api/customers', (req, res) => {
  const { name, email, phone, segment, source, status } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nama pelanggan wajib diisi' });
  }

  const newCustomer: Customer = {
    id: `cust-${Date.now()}`,
    name,
    email: email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
    phone: phone || '0812' + Math.floor(10000000 + Math.random() * 90000000),
    segment: segment || 'Parent',
    source: source || 'Organic',
    productsPurchased: [],
    totalSpend: 0,
    status: status || 'ACTIVE',
    createdAt: new Date().toISOString().split('T')[0]
  };

  customers.unshift(newCustomer);
  res.status(201).json(newCustomer);
});

app.patch('/api/customers/:id', (req, res) => {
  const index = customers.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Pelanggan tidak ditemukan' });
  }
  customers[index] = {
    ...customers[index],
    ...req.body
  };
  res.json(customers[index]);
});

app.delete('/api/customers/:id', (req, res) => {
  const index = customers.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Pelanggan tidak ditemukan' });
  }
  customers.splice(index, 1);
  res.json({ success: true });
});

app.post('/api/customers/clear', (req, res) => {
  customers = [];
  res.json({ success: true, message: 'Daftar pelanggan telah dibersihkan (mulai dari 0)', systemState: getSystemState() });
});

// ==========================================
// TRANSACTIONS CRUD (WITH RIPPLE CALCULATIONS)
// ==========================================
function applyTransactionImpact(tx: Transaction, isAddition: boolean) {
  recalculateRevenueAndMonthlyHistory();
}

app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

app.post('/api/transactions/clear', (req, res) => {
  transactions = [];
  recalculateRevenueAndMonthlyHistory();
  res.json({ success: true, message: 'Buku kas transaksi telah dikosongkan (mulai dari 0)', systemState: getSystemState() });
});

app.post('/api/transactions', (req, res) => {
  const {
    buyer,
    customerName,
    hp,
    phone,
    buyerPhone,
    email,
    buyerEmail,
    customerId,
    productId,
    productName,
    amount,
    source,
    referrer,
    status,
    date
  } = req.body;

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Harga produk / nominal transaksi harus lebih dari 0' });
  }

  const resolvedBuyer = (buyer || customerName || '').trim() || 'Pelanggan Umum';
  const resolvedPhone = (hp || phone || buyerPhone || '').trim();
  const resolvedEmail = (email || buyerEmail || '').trim();

  const matchedProduct = products.find(
    p => p.id === productId || p.name.toLowerCase() === (productName || '').toLowerCase()
  );
  const resolvedProdName = productName || (matchedProduct ? matchedProduct.name : 'Produk Valiyo');
  const resolvedProdId = productId || (matchedProduct ? matchedProduct.id : 'kids');

  // Resolve or upsert customer in customers list
  let matchedCustomer = customers.find(
    c =>
      (customerId && c.id === customerId) ||
      (resolvedPhone && c.phone === resolvedPhone) ||
      (resolvedEmail && c.email.toLowerCase() === resolvedEmail.toLowerCase()) ||
      c.name.toLowerCase() === resolvedBuyer.toLowerCase()
  );

  if (!matchedCustomer) {
    matchedCustomer = {
      id: customerId || `cust-${Date.now()}`,
      name: resolvedBuyer,
      email: resolvedEmail,
      phone: resolvedPhone,
      segment: 'Parent',
      source: source || (referrer ? 'Referral' : 'Organic'),
      productsPurchased: [resolvedProdId],
      totalSpend: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    };
    customers.unshift(matchedCustomer);
  } else {
    if (resolvedPhone && !matchedCustomer.phone) matchedCustomer.phone = resolvedPhone;
    if (resolvedEmail && !matchedCustomer.email) matchedCustomer.email = resolvedEmail;
  }

  const newTx: Transaction = {
    id: `tx-${Date.now()}`,
    customerId: matchedCustomer.id,
    customerName: matchedCustomer.name,
    buyerPhone: resolvedPhone || matchedCustomer.phone,
    buyerEmail: resolvedEmail || matchedCustomer.email,
    productId: resolvedProdId,
    productName: resolvedProdName,
    amount: Number(amount),
    source: source || (referrer ? 'Referral' : 'Organic'),
    referrer: referrer ? String(referrer).trim() : undefined,
    status: status || 'COMPLETED',
    date: date || new Date().toISOString().split('T')[0]
  };

  transactions.unshift(newTx);

  if (newTx.status === 'COMPLETED') {
    applyTransactionImpact(newTx, true);
  }

  res.status(201).json({ transaction: newTx, customer: matchedCustomer, systemState: getSystemState() });
});

app.patch('/api/transactions/:id', (req, res) => {
  const index = transactions.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
  }

  const oldTx = transactions[index];
  const buyerName = req.body.buyer || req.body.customerName || oldTx.customerName;
  const phoneVal = req.body.hp || req.body.phone || req.body.buyerPhone || oldTx.buyerPhone;
  const emailVal = req.body.email || req.body.buyerEmail || oldTx.buyerEmail;

  const updatedTx: Transaction = {
    ...oldTx,
    ...req.body,
    customerName: buyerName,
    buyerPhone: phoneVal,
    buyerEmail: emailVal,
    productName: req.body.productName || oldTx.productName,
    amount: req.body.amount !== undefined ? Number(req.body.amount) : oldTx.amount,
    referrer: req.body.referrer !== undefined ? (req.body.referrer ? String(req.body.referrer).trim() : undefined) : oldTx.referrer
  };

  // If amount changed or status changed, adjust impact
  if (oldTx.status === 'COMPLETED') {
    applyTransactionImpact(oldTx, false);
  }
  if (updatedTx.status === 'COMPLETED') {
    applyTransactionImpact(updatedTx, true);
  }

  transactions[index] = updatedTx;
  res.json({ transaction: updatedTx, systemState: getSystemState() });
});

app.delete('/api/transactions/:id', (req, res) => {
  const index = transactions.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
  }

  const tx = transactions[index];
  if (tx.status === 'COMPLETED') {
    applyTransactionImpact(tx, false);
  }

  transactions.splice(index, 1);
  recalculateRevenueAndMonthlyHistory();
  res.json({ success: true, systemState: getSystemState() });
});

// Tasks endpoints
app.get('/api/tasks', (req, res) => {
  const sorted = [...tasks].sort((a, b) => b.priorityScore - a.priorityScore);
  res.json(sorted);
});

app.post('/api/tasks', (req, res) => {
  const { title, description, category, priority, impact, urgency, owner, dueDate, whyThisMatters, expectedImpact, relatedProduct, relatedGoalId } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Judul task wajib diisi' });
  }

  const imp = Number(impact) || 5;
  const urg = Number(urgency) || 5;

  const newTask: Task = {
    id: `task-${Date.now()}`,
    title,
    description: description || '',
    category: category || 'Operations',
    priority: priority || 'MEDIUM',
    impact: imp,
    urgency: urg,
    priorityScore: imp * urg,
    whyThisMatters: whyThisMatters || 'Penting untuk menjaga momentum operasional dan target bisnis.',
    expectedImpact: expectedImpact || 'Mendukung efisiensi dan pencapaian target bulanan.',
    owner: owner || 'Anas',
    status: 'TODO',
    dueDate: dueDate || '2026-09-30',
    relatedProduct,
    relatedGoalId,
    createdBy: 'Anas',
    createdAt: new Date().toISOString().split('T')[0]
  };

  tasks.unshift(newTask);
  res.status(201).json(newTask);
});

app.patch('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task tidak ditemukan' });
  }

  const existing = tasks[taskIndex];
  const updated: Task = {
    ...existing,
    ...req.body
  };

  if (req.body.impact !== undefined || req.body.urgency !== undefined) {
    updated.priorityScore = (updated.impact || 5) * (updated.urgency || 5);
  }

  tasks[taskIndex] = updated;
  res.json(updated);
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task tidak ditemukan' });
  }
  tasks.splice(taskIndex, 1);
  res.json({ success: true });
});

// Goals endpoints
app.get('/api/goals', (req, res) => {
  res.json(goals);
});

app.post('/api/goals', (req, res) => {
  const { name, level, category, target, actual, unit, period, owner, deadline } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nama target wajib diisi' });
  }

  const t = Number(target) || 100;
  const a = Number(actual) || 0;
  const achievementRate = t > 0 ? a / t : 0;

  let status: Goal['status'] = 'YELLOW';
  if (achievementRate >= 0.95) status = 'GREEN';
  else if (achievementRate < 0.75) status = 'RED';

  const newGoal: Goal = {
    id: `goal-${Date.now()}`,
    name,
    level: (level as any) || 'QUARTER',
    period: period || 'Q3 2026',
    target: t,
    actual: a,
    achievementRate,
    status,
    owner: owner || 'Anas',
    deadline: deadline || '2026-12-31'
  };

  goals.push(newGoal);
  res.status(201).json(newGoal);
});

app.patch('/api/goals/:id', (req, res) => {
  const goalIndex = goals.findIndex(g => g.id === req.params.id);
  if (goalIndex === -1) {
    return res.status(404).json({ error: 'Goal tidak ditemukan' });
  }

  const current = goals[goalIndex];
  const updatedTarget = req.body.target !== undefined ? Number(req.body.target) : current.target;
  const updatedActual = req.body.actual !== undefined ? Number(req.body.actual) : current.actual;
  const achievementRate = updatedTarget > 0 ? updatedActual / updatedTarget : 0;

  let status: Goal['status'] = 'YELLOW';
  if (achievementRate >= 0.95) {
    status = 'GREEN';
  } else if (achievementRate < 0.75) {
    status = 'RED';
  }

  goals[goalIndex] = {
    ...current,
    ...req.body,
    target: updatedTarget,
    actual: updatedActual,
    achievementRate,
    status: req.body.status || status
  };

  res.json(goals[goalIndex]);
});

app.delete('/api/goals/:id', (req, res) => {
  const goalIndex = goals.findIndex(g => g.id === req.params.id);
  if (goalIndex === -1) {
    return res.status(404).json({ error: 'Goal tidak ditemukan' });
  }
  goals.splice(goalIndex, 1);
  res.json({ success: true });
});

// B2B deals endpoints
app.get('/api/b2b', (req, res) => {
  res.json(b2bDeals);
});

app.post('/api/b2b', (req, res) => {
  const { institutionName, contactPerson, dealValue, probability, stage, expectedCloseDate, owner, notes } = req.body;

  const newDeal: B2BDeal = {
    id: `deal-${Date.now()}`,
    institutionName: institutionName || 'Sekolah Baru',
    contactPerson: contactPerson || 'Kepala Sekolah',
    dealValue: Number(dealValue) || 25000000,
    probability: Number(probability) || 0.5,
    stage: stage || 'PROSPECT',
    expectedCloseDate: expectedCloseDate || '2026-10-15',
    owner: owner || 'Rian',
    notes: notes || ''
  };

  b2bDeals.push(newDeal);
  res.status(201).json(newDeal);
});

app.patch('/api/b2b/:id', (req, res) => {
  const dealIndex = b2bDeals.findIndex(d => d.id === req.params.id);
  if (dealIndex === -1) {
    return res.status(404).json({ error: 'Deal B2B tidak ditemukan' });
  }

  b2bDeals[dealIndex] = {
    ...b2bDeals[dealIndex],
    ...req.body
  };

  res.json(b2bDeals[dealIndex]);
});

app.delete('/api/b2b/:id', (req, res) => {
  const dealIndex = b2bDeals.findIndex(d => d.id === req.params.id);
  if (dealIndex === -1) {
    return res.status(404).json({ error: 'Deal B2B tidak ditemukan' });
  }
  b2bDeals.splice(dealIndex, 1);
  res.json({ success: true, systemState: getSystemState() });
});

app.post('/api/b2b/clear', (req, res) => {
  b2bDeals = [];
  res.json({
    success: true,
    message: 'Pipeline B2B telah dibersihkan (mulai dari 0)',
    systemState: getSystemState()
  });
});

// Decisions endpoints
app.get('/api/decisions', (req, res) => {
  res.json(decisions);
});

app.post('/api/decisions', (req, res) => {
  const { decision, context, reason, expectedOutcome, owner, reviewDate, status } = req.body;
  if (!decision) {
    return res.status(400).json({ error: 'Keputusan wajib diisi' });
  }

  const newDecision: DecisionItem = {
    id: `dec-${Date.now()}`,
    decision,
    context: context || '',
    reason: reason || '',
    expectedOutcome: expectedOutcome || '',
    owner: owner || 'Anas (Founder)',
    date: new Date().toISOString().split('T')[0],
    reviewDate: reviewDate || '2026-12-31',
    status: status || 'ACTIVE'
  };

  decisions.unshift(newDecision);
  res.status(201).json(newDecision);
});

// ==========================================
// EXECUTIVE BOARD / AI WORKFORCE (AGENTS) CRUD
// ==========================================
app.get('/api/agents', (req, res) => {
  res.json(agentTeam);
});

app.post('/api/agents', (req, res) => {
  const { role, name, department, avatar, mission, status, currentFocus, activeDirectives, recentInsight } = req.body;
  if (!role || !name) {
    return res.status(400).json({ error: 'Role dan nama anggota dewan wajib diisi' });
  }

  const newAgent: AIAgent = {
    id: `agent-${Date.now()}`,
    role: role.trim(),
    name: name.trim(),
    department: department?.trim() || 'Strategic Leadership',
    avatar: avatar?.trim() || '👔',
    mission: mission?.trim() || 'Mendukung pertumbuhan bisnis dan stabilitas ekosistem Valiyo.',
    status: status || 'ACTIVE',
    currentFocus: currentFocus?.trim() || 'Mengawal target operasional kuartal berjalan.',
    activeDirectives: Array.isArray(activeDirectives)
      ? activeDirectives.filter(Boolean)
      : typeof activeDirectives === 'string'
      ? activeDirectives.split('\n').map((s: string) => s.trim()).filter(Boolean)
      : ['Kawal target efisiensi dan pendapatan.'],
    recentInsight: recentInsight?.trim() || 'Siap beroperasi dan mengeksekusi arahan strategis founder.',
    confidence: 'HIGH',
    lastRunTime: 'Baru saja'
  };

  agentTeam.push(newAgent);
  res.status(201).json(newAgent);
});

app.patch('/api/agents/:id', (req, res) => {
  const index = agentTeam.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Anggota dewan / agen tidak ditemukan' });
  }

  const { role, name, department, avatar, mission, status, currentFocus, activeDirectives, recentInsight } = req.body;

  agentTeam[index] = {
    ...agentTeam[index],
    ...(role !== undefined && { role: role.trim() }),
    ...(name !== undefined && { name: name.trim() }),
    ...(department !== undefined && { department: department.trim() }),
    ...(avatar !== undefined && { avatar: avatar.trim() }),
    ...(mission !== undefined && { mission: mission.trim() }),
    ...(status !== undefined && { status }),
    ...(currentFocus !== undefined && { currentFocus: currentFocus.trim() }),
    ...(activeDirectives !== undefined && {
      activeDirectives: Array.isArray(activeDirectives)
        ? activeDirectives.filter(Boolean)
        : typeof activeDirectives === 'string'
        ? activeDirectives.split('\n').map((s: string) => s.trim()).filter(Boolean)
        : agentTeam[index].activeDirectives
    }),
    ...(recentInsight !== undefined && { recentInsight: recentInsight.trim() }),
    lastRunTime: 'Baru saja diperbarui'
  };

  res.json(agentTeam[index]);
});

app.delete('/api/agents/:id', (req, res) => {
  const index = agentTeam.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Anggota dewan / agen tidak ditemukan' });
  }

  const deleted = agentTeam.splice(index, 1);
  res.json({ success: true, deleted: deleted[0] });
});

// ==========================================
// VALIYO OS V2 — INTELLIGENCE LAYER ENDPOINTS
// ==========================================

// GET /api/intelligence - Full intelligence payload
app.get('/api/intelligence', (req, res) => {
  try {
    const derived = getSystemState();
    const actedCount = v2Insights.filter(i => i.status === 'ACTED').length;
    const dismissedCount = v2Insights.filter(i => i.status === 'DISMISSED').length;
    const successCount = v2Insights.filter(i => i.feedbackResult === 'SUCCESS').length;
    const resolvedCount = v2Insights.filter(i => i.status === 'RESOLVED').length;

    res.json({
      insights: v2Insights,
      dataQuality: derived.dataQuality,
      dailyBrief: derived.dailyBrief,
      revenueDiagnosis: derived.revenueDiagnosis,
      crossSell: derived.crossSell,
      b2bIntelligence: derived.b2bIntelligence,
      goalIntelligence: derived.goalIntelligence,
      agentTeam: derived.agentTeam,
      metrics: {
        totalInsights: v2Insights.length,
        actedCount,
        dismissedCount,
        resolvedCount,
        successRate: actedCount > 0 ? Math.round((successCount / actedCount) * 100) : 75
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal memuat intelligence layer' });
  }
});

// PATCH /api/intelligence/insights/:id/status - Update insight status
app.patch('/api/intelligence/insights/:id/status', (req, res) => {
  const { status, userDecision } = req.body;
  const index = v2Insights.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Insight tidak ditemukan' });
  }

  v2Insights[index] = {
    ...v2Insights[index],
    status: status || v2Insights[index].status,
    userDecision: userDecision || v2Insights[index].userDecision
  };

  res.json(v2Insights[index]);
});

// POST /api/intelligence/insights/:id/feedback - Log decision feedback
app.post('/api/intelligence/insights/:id/feedback', (req, res) => {
  const { feedbackResult, feedbackNote } = req.body;
  const index = v2Insights.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Insight tidak ditemukan' });
  }

  v2Insights[index] = {
    ...v2Insights[index],
    status: 'RESOLVED',
    feedbackResult: feedbackResult || 'SUCCESS',
    feedbackNote: feedbackNote || ''
  };

  res.json(v2Insights[index]);
});

// ASK VALIYO AI Endpoint (Multi-turn follow-up aware)
app.post('/api/ai/ask', async (req, res) => {
  const { question, history } = req.body;
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Pertanyaan wajib disertakan' });
  }

  try {
    const derived = getSystemState();
    const answer = await answerFounderQuestionWithFollowUp(
      question,
      history || [],
      {
        products,
        monthlyHistory,
        tasks,
        b2bDeals,
        goals,
        forecast: derived.forecast,
        health: derived.health
      }
    );

    res.json(answer);
  } catch (err: any) {
    console.error('Ask Valiyo API error:', err);
    // Fallback
    const derived = getSystemState();
    const fallbackAnswer = await askValiyoAI(question, {
      health: derived.health,
      forecast: derived.forecast,
      products,
      tasks,
      b2bDeals,
      goals,
      decisions
    });
    res.json(fallbackAnswer);
  }
});
export default app;
