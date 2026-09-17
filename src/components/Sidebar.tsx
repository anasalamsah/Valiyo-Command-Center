import React from 'react';
import {
  LayoutDashboard,
  Target,
  DollarSign,
  Package,
  Filter,
  Users,
  Briefcase,
  Bot,
  CheckSquare,
  FileText,
  FlaskConical,
  BarChart3,
  Bell,
  BookOpen,
  Scale,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Wallet,
  UserCheck
} from 'lucide-react';

export type NavTab =
  | 'command'
  | 'revenue'
  | 'transactions'
  | 'spending'
  | 'products'
  | 'customers'
  | 'team'
  | 'goals'
  | 'b2b'
  | 'tasks'
  | 'intelligence'
  | 'ai_workforce'
  | 'decisions'
  | 'knowledge'
  | 'funnel'
  | 'content'
  | 'experiments'
  | 'analytics'
  | 'alerts'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeAlertsCount: number;
  agentsCount?: number;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isV1Core?: boolean;
  badge?: number | string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  activeAlertsCount,
  agentsCount
}) => {
  const navItems: NavItem[] = [
    { id: 'command', label: 'Command Center', icon: LayoutDashboard, isV1Core: true },
    { id: 'revenue', label: 'Revenue (Kas)', icon: DollarSign, isV1Core: true },
    { id: 'transactions', label: 'Buku Transaksi', icon: CreditCard, isV1Core: true },
    { id: 'spending', label: 'Pengeluaran (Spending)', icon: Wallet, isV1Core: true },
    { id: 'products', label: 'Produk Ekosistem', icon: Package, isV1Core: true },
    { id: 'customers', label: 'Pelanggan', icon: Users, isV1Core: true },
    { id: 'team', label: 'Tim & Freelancer', icon: UserCheck, isV1Core: true },
    { id: 'goals', label: 'Target Bisnis', icon: Target, isV1Core: true },
    { id: 'b2b', label: 'Pipeline B2B', icon: Briefcase, isV1Core: true },
    { id: 'tasks', label: 'Tugas Eksekusi', icon: CheckSquare, isV1Core: true },
    { id: 'intelligence', label: 'AI Intelligence', icon: Sparkles, isV1Core: true, badge: 'V2' },
    { id: 'ai_workforce', label: 'Board (CEO dll)', icon: Bot, badge: agentsCount ?? 8 },
    { id: 'decisions', label: 'Keputusan', icon: Scale, isV1Core: true },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, isV1Core: true },
    {
      id: 'alerts',
      label: 'Peringatan',
      icon: Bell,
      isV1Core: true,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined
    }
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800 bg-slate-950 text-slate-300 transition-all duration-300 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        {!collapsed && (
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-base tracking-wider">
              V
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-slate-100 tracking-tight text-sm">VALIYO OS</span>
                <span className="rounded bg-emerald-950/80 px-1 py-0.5 text-[9px] font-mono text-emerald-400 border border-emerald-800/40">
                  V1.0
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-tight">
                Command & Control
              </div>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm">
            V
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {!collapsed && (
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
            Modul Utama
          </div>
        )}
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`group flex w-full items-center rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              />
              {!collapsed && (
                <span className="ml-3 truncate tracking-normal flex-1 text-left">
                  {item.label}
                </span>
              )}
              {!collapsed && item.badge !== undefined && (
                <span className="ml-auto rounded-full bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.2 text-[10px] font-mono text-rose-300">
                  {item.badge}
                </span>
              )}
              {!collapsed && item.isV1Core && !item.badge && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500/50" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Operating Principle */}
      {!collapsed && (
        <div className="border-t border-slate-800/80 p-3.5 bg-slate-950/60">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Founder Control Mode</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-300 font-mono leading-relaxed">
            DATA → INSIGHT → PRIORITY → DECISION → ACTION
          </div>
        </div>
      )}
    </aside>
  );
};
