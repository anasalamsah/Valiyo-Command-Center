import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { CommandCenter } from './components/CommandCenter.js';
import { GoalsView } from './components/GoalsView.js';
import { RevenueView } from './components/RevenueView.js';
import { ProductsView } from './components/ProductsView.js';
import { TasksView } from './components/TasksView.js';
import { B2BView } from './components/B2BView.js';
import { DecisionsView } from './components/DecisionsView.js';
import { KnowledgeView } from './components/KnowledgeView.js';
import { PlaceholderView } from './components/PlaceholderView.js';
import { CustomersView } from './components/CustomersView.js';
import { TransactionsView } from './components/TransactionsView.js';
import { SpendingsView } from './components/SpendingsView.js';
import { TeamTalentView } from './components/TeamTalentView.js';
import { SettingsView } from './components/SettingsView.js';
import { QuickAddModal } from './components/QuickAddModal.js';
import { AskValiyoModal } from './components/AskValiyoModal.js';
import { HealthFormulaModal } from './components/HealthFormulaModal.js';
import { AlertsModal } from './components/AlertsModal.js';
import { CreateTaskModal } from './components/CreateTaskModal.js';
import { IntelligenceView } from './components/IntelligenceView.js';
import { AIWorkforceView } from './components/AIWorkforceView.js';
import { DataQualityModal } from './components/DataQualityModal.js';
import {
  saveStateToLocalStorage,
  loadStateFromLocalStorage
} from './utils/localStorageStore.js';
import {
  HealthScoreBreakdown,
  RevenueForecast,
  ExecutiveInsight,
  Alert,
  DailyBrief,
  Product,
  Task,
  B2BDeal,
  Goal,
  DecisionItem,
  KnowledgeDoc,
  MonthlyHistoryItem,
  AIInsight,
  DataQualityReport,
  AIAgent,
  ConversationTurn,
  InsightStatus,
  DecisionFeedbackResult,
  Customer,
  Transaction,
  Expense,
  Employee,
  Freelancer,
  MonthlyReferralRecap
} from './types.js';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('command');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Core business state
  const [health, setHealth] = useState<HealthScoreBreakdown | null>(null);
  const [forecast, setForecast] = useState<RevenueForecast | null>(null);
  const [insights, setInsights] = useState<ExecutiveInsight[]>([]);
  const [v2Insights, setV2Insights] = useState<AIInsight[]>([]);
  const [dataQuality, setDataQuality] = useState<DataQualityReport | null>(null);
  const [agentTeam, setAgentTeam] = useState<AIAgent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dailyBrief, setDailyBrief] = useState<DailyBrief | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [b2bDeals, setB2BDeals] = useState<B2BDeal[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>([]);
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyHistoryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [monthlyReferralRecaps, setMonthlyReferralRecaps] = useState<MonthlyReferralRecap[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [customersCount, setCustomersCount] = useState(60);
  const [transactionsCount, setTransactionsCount] = useState(110);

  // Selected product for Cockpit
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modals
  const [isAskValiyoOpen, setIsAskValiyoOpen] = useState(false);
  const [askValiyoPreset, setAskValiyoPreset] = useState<string | undefined>(undefined);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isDataQualityModalOpen, setIsDataQualityModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [taskInitialData, setTaskInitialData] = useState<Partial<Task> | undefined>(undefined);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddDefaultTab, setQuickAddDefaultTab] = useState('tx');

  // Fetch full system state
  const fetchState = useCallback(async () => {
    const targetEndpoint = '/api/state';
    try {
      setRefreshing(true);
      console.log(`[Valiyo OS] Memuat data sistem awal dari endpoint: ${targetEndpoint}`);
      const res = await fetch(targetEndpoint);
      if (!res.ok) {
        console.error(
          `[Valiyo OS] Gagal memuat data sistem. Endpoint: "${targetEndpoint}", HTTP Status: ${res.status} (${res.statusText})`
        );
        throw new Error(`Gagal memuat data sistem (${res.status})`);
      }
      const data = await res.json();
      console.log(
        `[Valiyo OS] Sukses memuat data sistem dari ${targetEndpoint}:`,
        {
          productsCount: (data.products || []).length,
          customersCount: data.customersCount ?? (data.customers ? data.customers.length : 0),
          transactionsCount: data.transactionsCount ?? (data.transactions ? data.transactions.length : 0),
          expensesCount: (data.expenses || []).length,
          employeesCount: (data.employees || []).length,
          freelancersCount: (data.freelancers || []).length
        }
      );
      setHealth(data.health);
      setForecast(data.forecast);
      setInsights(data.insights);
      if (data.v2Insights) setV2Insights(data.v2Insights);
      if (data.dataQuality) setDataQuality(data.dataQuality);
      if (data.agentTeam) setAgentTeam(data.agentTeam);
      setAlerts(data.alerts);
      setDailyBrief(data.dailyBrief);
      setProducts(data.products || []);
      setTasks(data.tasks || []);
      setB2BDeals(data.b2bDeals || []);
      setGoals(data.goals || []);
      setDecisions(data.decisions || []);
      setKnowledgeDocs(data.knowledgeDocs || []);
      setMonthlyHistory(data.monthlyHistory || []);
      if (data.customers) setCustomers(data.customers);
      if (data.transactions) setTransactions(data.transactions);
      if (data.expenses) setExpenses(data.expenses);
      if (data.employees) setEmployees(data.employees);
      if (data.freelancers) setFreelancers(data.freelancers);
      if (data.monthlyReferralRecaps) setMonthlyReferralRecaps(data.monthlyReferralRecaps);
      if (data.isDemoMode !== undefined) setIsDemoMode(data.isDemoMode);
      setCustomersCount(data.customersCount || (data.customers ? data.customers.length : 0));
      setTransactionsCount(data.transactionsCount || (data.transactions ? data.transactions.length : 0));
      setError(null);

      // Simpan snapshot ke local storage browser untuk perlindungan ganda (offline & cold-start recovery)
      saveStateToLocalStorage({
        transactions: data.transactions,
        customers: data.customers,
        products: data.products,
        expenses: data.expenses,
        employees: data.employees,
        freelancers: data.freelancers,
        tasks: data.tasks,
        b2bDeals: data.b2bDeals,
        goals: data.goals,
        decisions: data.decisions
      });

      // Deteksi jika server baru reboot kosong di hosting serverless tetapi browser memiliki data riil sebelumnya
      const localData = loadStateFromLocalStorage();
      const serverEmpty = (!data.transactions || data.transactions.length === 0) && (!data.expenses || data.expenses.length === 0);
      const localHasRealData = localData && ((localData.transactions && localData.transactions.length > 0) || (localData.expenses && localData.expenses.length > 0));

      if (serverEmpty && localHasRealData) {
        console.log('[Valiyo OS] Rehidrasi otomatis data riil dari browser ke instance serverless Vercel...');
        fetch('/api/sync/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localData)
        }).catch(e => console.warn('[Valiyo OS] Rehidrasi otomatis tertunda:', e));
      }
    } catch (err: any) {
      console.error(`[Valiyo OS] Error saat fetch state (${targetEndpoint}):`, err);
      setError(err.message || 'Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Handler: Update Task Status
  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
        // Refresh calculations in background
        fetchState();
      }
    } catch (e) {
      console.error('Failed to update task:', e);
    }
  };

  // Handler: Delete Task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        fetchState();
      }
    } catch (e) {
      console.error('Failed to delete task:', e);
    }
  };

  // Handler: Save / Create Task
  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [newTask, ...prev]);
        fetchState();
      }
    } catch (e) {
      console.error('Failed to create task:', e);
    }
  };

  // Handler: Update Goal
  const handleUpdateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        setGoals(prev => prev.map(g => (g.id === goalId ? updated : g)));
        fetchState();
      }
    } catch (e) {
      console.error('Failed to update goal:', e);
    }
  };

  // Handler: Update B2B Deal
  const handleUpdateDealStage = async (dealId: string, newStage: B2BDeal['stage'], probability?: number) => {
    try {
      const res = await fetch(`/api/b2b/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage, ...(probability !== undefined ? { probability } : {}) })
      });
      if (res.ok) {
        const updated = await res.json();
        setB2BDeals(prev => prev.map(d => (d.id === dealId ? updated : d)));
        fetchState();
      }
    } catch (e) {
      console.error('Failed to update deal:', e);
    }
  };

  // Handler: Add B2B Deal
  const handleAddNewDeal = async (dealData: Partial<B2BDeal>) => {
    try {
      const res = await fetch('/api/b2b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealData)
      });
      if (res.ok) {
        const created = await res.json();
        setB2BDeals(prev => [...prev, created]);
        fetchState();
      }
    } catch (e) {
      console.error('Failed to add deal:', e);
    }
  };

  // Handler: Open Quick Add modal with specific tab
  const handleOpenQuickAdd = (defaultTab: string = 'tx') => {
    setQuickAddDefaultTab(defaultTab);
    setIsQuickAddOpen(true);
  };

  // Handler: Reset to full Valiyo demo data
  const handleResetDemo = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        await fetchState();
      }
    } catch (e) {
      console.error('Failed to reset demo:', e);
    } finally {
      setRefreshing(false);
    }
  };

  // Handler: Clear data to start clean / real data input
  const handleClearDemo = async () => {
    if (!window.confirm('Kosongkan semua data untuk mulai mencatat data riil Valiyo dari awal?')) return;
    try {
      setRefreshing(true);
      const res = await fetch('/api/demo/clear', { method: 'POST' });
      if (res.ok) {
        await fetchState();
      }
    } catch (e) {
      console.error('Failed to clear demo:', e);
    } finally {
      setRefreshing(false);
    }
  };

  // Handler: Expenses CRUD
  const handleAddExpense = async (expenseData: Partial<Expense>) => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (e) {
      console.error('Failed to add expense:', e);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (e) {
      console.error('Failed to delete expense:', e);
    }
  };

  const handleClearExpenses = async () => {
    try {
      const res = await fetch('/api/expenses/clear', {
        method: 'POST'
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (e) {
      console.error('Failed to clear expenses:', e);
    }
  };

  // Handler: Add Decision
  const handleAddDecision = async (decData: Partial<DecisionItem>) => {
    try {
      const res = await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decData)
      });
      if (res.ok) {
        const created = await res.json();
        setDecisions(prev => [created, ...prev]);
      }
    } catch (e) {
      console.error('Failed to add decision:', e);
    }
  };

  // Handler: Run Product Diagnosis AI
  const handleRunProductDiagnosis = async (productId: string) => {
    const res = await fetch(`/api/products/${productId}/diagnose`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Diagnosis gagal diproses');
    return await res.json();
  };

  // Handler: Ask Valiyo AI (Supports Multi-turn & Grounded Business Context)
  const handleAskValiyo = async (question: string, history?: ConversationTurn[]) => {
    const res = await fetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history })
    });
    if (!res.ok) throw new Error('Gagal memproses pertanyaan ke Valiyo AI');
    return await res.json();
  };

  // Handler: Update V2 Insight Status
  const handleUpdateInsightStatus = async (
    insightId: string,
    status: InsightStatus,
    userDecision?: string
  ) => {
    try {
      const res = await fetch(`/api/intelligence/insights/${insightId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, userDecision })
      });
      if (res.ok) {
        const updated = await res.json();
        setV2Insights(prev => prev.map(i => (i.id === insightId ? updated : i)));
        fetchState();
      }
    } catch (e) {
      console.error('Failed to update insight status:', e);
    }
  };

  // Handler: Record Decision Feedback for Intelligence Loop Learning
  const handleRecordFeedback = async (
    insightId: string,
    feedbackResult: DecisionFeedbackResult,
    note?: string
  ) => {
    try {
      const res = await fetch(`/api/intelligence/insights/${insightId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackResult, note })
      });
      if (res.ok) {
        const updated = await res.json();
        setV2Insights(prev => prev.map(i => (i.id === insightId ? updated : i)));
        fetchState();
      }
    } catch (e) {
      console.error('Failed to record feedback:', e);
    }
  };

  // Open Ask Valiyo Modal with preset
  const openAskValiyoWithPreset = (preset?: string) => {
    setAskValiyoPreset(preset);
    setIsAskValiyoOpen(true);
  };

  // Open Create Task Modal with preset
  const openCreateTaskWithData = (data?: Partial<Task>) => {
    setTaskInitialData(data);
    setIsCreateTaskModalOpen(true);
  };

  // Handle switching to Products and opening cockpit directly
  const handleSelectProduct = (product: Product | null) => {
    setSelectedProduct(product);
    if (product && currentTab !== 'products') {
      setCurrentTab('products');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xl">
            V
          </div>
          <span className="text-sm font-semibold tracking-wide text-slate-100">
            MEMUAT VALIYO OS MISSION CONTROL...
          </span>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            <span>Mengkalkulasi skor kesehatan & proyeksi Rp1 Miliar</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !health || !forecast || !dailyBrief) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 p-4 text-slate-200">
        <div className="max-w-md rounded-xl border border-rose-500/30 bg-rose-950/20 p-6 text-center space-y-3">
          <AlertTriangle className="h-8 w-8 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Gagal Memuat Valiyo OS</h3>
          <p className="text-xs text-rose-300 font-mono">{error || 'Data state tidak lengkap'}</p>
          <button
            onClick={() => fetchState()}
            className="rounded-lg bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-medium text-white shadow-sm"
          >
            Coba Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={tab => {
          setCurrentTab(tab);
          if (tab !== 'products') setSelectedProduct(null);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeAlertsCount={alerts.filter(a => !a.resolved).length}
        agentsCount={agentTeam.length}
      />

      {/* Main Mission Control Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          health={health}
          dataTrustScore={dataQuality?.overallTrustScore}
          isDemoMode={isDemoMode}
          onResetDemo={handleResetDemo}
          onClearDemo={handleClearDemo}
          onOpenQuickAdd={() => handleOpenQuickAdd('tx')}
          onOpenAskValiyo={openAskValiyoWithPreset}
          onOpenHealthModal={() => setIsHealthModalOpen(true)}
          onOpenAlerts={() => setIsAlertsModalOpen(true)}
          onOpenDataQuality={() => setIsDataQualityModalOpen(true)}
          onRefresh={fetchState}
          isRefreshing={refreshing}
          activeAlertsCount={alerts.filter(a => !a.resolved).length}
        />

        {/* Dynamic Route Content Canvas */}
        <main className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl w-full mx-auto">
          {currentTab === 'command' && (
            <CommandCenter
              health={health!}
              forecast={forecast!}
              insights={insights}
              v2Insights={v2Insights}
              tasks={tasks}
              products={products}
              dailyBrief={dailyBrief!}
              monthlyHistory={monthlyHistory}
              transactions={transactions}
              expenses={expenses}
              onNavigateTab={setCurrentTab}
              onSelectProduct={handleSelectProduct}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onOpenCreateTaskModal={openCreateTaskWithData}
              onOpenAskValiyo={openAskValiyoWithPreset}
              onOpenHealthModal={() => setIsHealthModalOpen(true)}
              onOpenQuickAdd={handleOpenQuickAdd}
              onResetDemo={handleResetDemo}
            />
          )}

          {currentTab === 'intelligence' && (
            <IntelligenceView
              insights={v2Insights}
              dataQuality={dataQuality}
              onUpdateInsightStatus={handleUpdateInsightStatus}
              onRecordFeedback={handleRecordFeedback}
              onOpenCreateTaskModal={openCreateTaskWithData}
              onOpenDataQualityModal={() => setIsDataQualityModalOpen(true)}
              onOpenAskValiyo={openAskValiyoWithPreset}
              onRefresh={fetchState}
              isRefreshing={refreshing}
            />
          )}

          {currentTab === 'ai_workforce' && (
            <AIWorkforceView
              agents={agentTeam}
              onOpenAskValiyo={openAskValiyoWithPreset}
              onRefresh={fetchState}
            />
          )}

          {currentTab === 'goals' && (
            <GoalsView goals={goals} onUpdateGoal={handleUpdateGoal} onRefresh={fetchState} />
          )}

          {currentTab === 'revenue' && (
            <RevenueView
              forecast={forecast}
              history={monthlyHistory}
              products={products}
              b2bDeals={b2bDeals}
              transactions={transactions}
              expenses={expenses}
            />
          )}

          {currentTab === 'products' && (
            <ProductsView
              products={products}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              onRunProductDiagnosis={handleRunProductDiagnosis}
              onRefreshProducts={fetchState}
            />
          )}

          {currentTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onDeleteTask={handleDeleteTask}
              onOpenCreateTaskModal={openCreateTaskWithData}
              onOpenAskValiyo={openAskValiyoWithPreset}
            />
          )}

          {currentTab === 'b2b' && (
            <B2BView
              deals={b2bDeals}
              onUpdateDealStage={handleUpdateDealStage}
              onAddNewDeal={handleAddNewDeal}
              onRefreshDeals={fetchState}
            />
          )}

          {currentTab === 'decisions' && (
            <DecisionsView decisions={decisions} onAddDecision={handleAddDecision} />
          )}

          {currentTab === 'knowledge' && (
            <KnowledgeView docs={knowledgeDocs} />
          )}

          {currentTab === 'alerts' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-base font-semibold text-slate-100">
                  PERINGATAN SISTEM & DEVIASI OPERASIONAL
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Daftar peringatan deterministik aktif yang memerlukan intervensi founder
                </p>
              </div>
              <div className="space-y-3">
                {alerts.map(a => (
                  <div
                    key={a.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-sm">{a.title}</span>
                      <span className="rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 text-[10px] font-mono">
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-slate-300">{a.whatHappened}</p>
                    <p className="text-amber-400">
                      <strong>Mengapa penting:</strong> {a.whyItMatters}
                    </p>
                    <p className="text-emerald-400">
                      <strong>Tindakan:</strong> {a.recommendedAction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === 'spending' && (
            <SpendingsView
              expenses={expenses}
              totalRevenue={forecast?.currentMonthRevenue || 0}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              onClearExpenses={handleClearExpenses}
              onRefresh={fetchState}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              customers={customers}
              products={products}
              freelancers={freelancers}
              onRefresh={fetchState}
              onOpenQuickAdd={handleOpenQuickAdd}
            />
          )}

          {currentTab === 'team' && (
            <TeamTalentView
              employees={employees}
              freelancers={freelancers}
              transactions={transactions}
              monthlyReferralRecaps={monthlyReferralRecaps}
              onRefresh={fetchState}
              onOpenQuickAdd={handleOpenQuickAdd}
              onRecordSpending={async (spendingData) => {
                await handleAddExpense(spendingData);
                setCurrentTab('spending');
              }}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersView
              customers={customers}
              products={products}
              onRefresh={fetchState}
              onOpenQuickAdd={handleOpenQuickAdd}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              transactions={transactions}
              customers={customers}
              products={products}
              expenses={expenses}
              employees={employees}
              freelancers={freelancers}
              tasks={tasks}
              b2bDeals={b2bDeals}
              goals={goals}
              decisions={decisions}
              isDemoMode={isDemoMode}
              onRefresh={fetchState}
            />
          )}

          {(currentTab === 'funnel' ||
            currentTab === 'content' ||
            currentTab === 'experiments' ||
            currentTab === 'analytics') && (
            <PlaceholderView
              tab={currentTab}
              onNavigateTab={setCurrentTab}
              customersCount={customersCount}
              transactionsCount={transactionsCount}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        defaultTab={quickAddDefaultTab}
        products={products}
        customers={customers}
        freelancers={freelancers}
        onSuccess={fetchState}
      />

      <AskValiyoModal
        isOpen={isAskValiyoOpen}
        onClose={() => setIsAskValiyoOpen(false)}
        initialQuestion={askValiyoPreset}
        onAsk={handleAskValiyo}
        onCreateTaskDraft={openCreateTaskWithData}
      />

      <HealthFormulaModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        health={health}
      />

      <AlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        alerts={alerts}
        onNavigateTab={setCurrentTab}
      />

      <DataQualityModal
        isOpen={isDataQualityModalOpen}
        onClose={() => setIsDataQualityModalOpen(false)}
        report={dataQuality}
      />

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSaveTask={handleSaveTask}
        initialData={taskInitialData}
      />
    </div>
  );
}
