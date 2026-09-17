import {
  Transaction,
  Customer,
  Product,
  Expense,
  Employee,
  Freelancer,
  Task,
  B2BDeal,
  Goal,
  DecisionItem
} from '../types.js';

export interface LocalStorageSnapshot {
  version: number;
  timestamp: string;
  transactions: Transaction[];
  customers: Customer[];
  products: Product[];
  expenses: Expense[];
  employees: Employee[];
  freelancers: Freelancer[];
  tasks: Task[];
  b2bDeals: B2BDeal[];
  goals: Goal[];
  decisions: DecisionItem[];
}

const STORAGE_KEY = 'valiyo_os_db_v1';

export function saveStateToLocalStorage(data: Partial<LocalStorageSnapshot>) {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadStateFromLocalStorage();
    const snapshot: LocalStorageSnapshot = {
      version: 1,
      timestamp: new Date().toISOString(),
      transactions: data.transactions ?? existing?.transactions ?? [],
      customers: data.customers ?? existing?.customers ?? [],
      products: data.products ?? existing?.products ?? [],
      expenses: data.expenses ?? existing?.expenses ?? [],
      employees: data.employees ?? existing?.employees ?? [],
      freelancers: data.freelancers ?? existing?.freelancers ?? [],
      tasks: data.tasks ?? existing?.tasks ?? [],
      b2bDeals: data.b2bDeals ?? existing?.b2bDeals ?? [],
      goals: data.goals ?? existing?.goals ?? [],
      decisions: data.decisions ?? existing?.decisions ?? []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.warn('[Valiyo OS LocalStore] Gagal menyimpan ke localStorage:', err);
  }
}

export function loadStateFromLocalStorage(): LocalStorageSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as LocalStorageSnapshot;
    }
  } catch (err) {
    console.warn('[Valiyo OS LocalStore] Gagal membaca dari localStorage:', err);
  }
  return null;
}

export function clearStateFromLocalStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[Valiyo OS LocalStore] Gagal membersihkan localStorage:', err);
  }
}

export function exportBackupFile(snapshot: LocalStorageSnapshot) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `valiyo-os-cadangan-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
