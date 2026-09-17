import fs from 'fs';
import path from 'path';
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
} from '../src/types.js';

export interface ValiyoDatabase {
  version: number;
  lastUpdated: string;
  isDemoMode: boolean;
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

// Select suitable storage path:
// On Vercel serverless / AWS Lambda, /tmp is the only writable directory.
// On regular Node / Cloud Run, we check /tmp or ./data.
function getStoragePath(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join('/tmp', 'valiyo_db.json');
  }

  const localDataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(localDataDir)) {
    try {
      fs.mkdirSync(localDataDir, { recursive: true });
    } catch {
      return path.join('/tmp', 'valiyo_db.json');
    }
  }
  return path.join(localDataDir, 'valiyo_db.json');
}

const DB_FILE = getStoragePath();

export function saveDatabaseToDisk(data: Partial<ValiyoDatabase>): boolean {
  try {
    const existing = loadDatabaseFromDisk();
    const payload: ValiyoDatabase = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      isDemoMode: data.isDemoMode !== undefined ? data.isDemoMode : (existing?.isDemoMode ?? false),
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

    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('[Valiyo Storage] Warning: Could not write database to disk:', err);
    return false;
  }
}

export function loadDatabaseFromDisk(): ValiyoDatabase | null {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      if (raw && raw.trim().length > 0) {
        return JSON.parse(raw) as ValiyoDatabase;
      }
    }
  } catch (err) {
    console.warn('[Valiyo Storage] Warning: Could not read database from disk:', err);
  }
  return null;
}
