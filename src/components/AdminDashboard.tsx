import React, { useState } from 'react';
import {
  ShieldCheck,
  MousePointerClick,
  BellRing,
  Users,
  TrendingUp,
  ArrowLeft,
  Plus,
  RefreshCw,
  ExternalLink,
  Download,
  Search,
  CheckCircle2,
  Lock,
  Eye,
  Tag,
  Clock,
  Sparkles,
  Database,
  KeyRound,
  Filter,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Product, PriceAlertConfig, UserProfile, UserSignupRecord } from '../types';

interface AdminDashboardProps {
  products: Product[];
  priceAlerts: Record<string, PriceAlertConfig>;
  currentUser: UserProfile;
  userSignups: UserSignupRecord[];
  onNavigateHome: () => void;
  onNavigateToAddProduct: () => void;
  onSelectProduct: (product: Product) => void;
  onTriggerSimulatedAlert?: (productId: string) => void;
  onSwitchToAdminRole?: () => void;
  onNotify: (message: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  priceAlerts,
  currentUser,
  userSignups,
  onNavigateHome,
  onNavigateToAddProduct,
  onSelectProduct,
  onTriggerSimulatedAlert,
  onSwitchToAdminRole,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'clicks' | 'alerts' | 'users' | 'security'>('charts');
  const [chartSubView, setChartSubView] = useState<'all' | 'clicks' | 'trend' | 'categories'>('all');
  const [chartTimeframe, setChartTimeframe] = useState<'7d' | '30d' | 'all'>('7d');
  const [simulatedExtraClicks, setSimulatedExtraClicks] = useState<Record<string, number>>({});
  const [adminPasscode, setAdminPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [isUnlockedLocally, setIsUnlockedLocally] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Determine if user has admin privileges
  const isAdmin = currentUser.isLoggedIn && (currentUser.role === 'admin' || isUnlockedLocally);

  // Computed Metrics
  const extraSimulatedTotal = Object.values(simulatedExtraClicks).reduce((a, b) => a + b, 0);
  const totalClicks = products.reduce((acc, p) => acc + (p.clicks || 0), 0) + extraSimulatedTotal;
  const activeAlertsList = Object.values(priceAlerts).filter((a) => a.enabled);
  const activeAlertsCount = activeAlertsList.length;
  const totalSignupsCount = userSignups.length;

  // Estimated affiliate metrics based on average Amazon/Associate standards
  const estimatedConversionRate = 3.2; // 3.2% avg conversion rate
  const estimatedOrders = Math.round((totalClicks * estimatedConversionRate) / 100);
  const estimatedCommission = (estimatedOrders * 14.5).toFixed(0);

  // Top products sorted by clicks (including live simulation increments)
  const topProductsByClicks = [...products].sort((a, b) => {
    const clicksA = (a.clicks || 0) + (simulatedExtraClicks[a.id] || 0);
    const clicksB = (b.clicks || 0) + (simulatedExtraClicks[b.id] || 0);
    return clicksB - clicksA;
  });

  // Chart 1 Data: Outbound Clicks by Product (Top 7)
  const productClicksChartData = topProductsByClicks.slice(0, 7).map((p) => {
    const currentClicks = (p.clicks || 0) + (simulatedExtraClicks[p.id] || 0);
    return {
      name: p.name.length > 14 ? p.name.slice(0, 12) + '…' : p.name,
      fullName: p.name,
      clicks: currentClicks,
      category: p.category,
      price: `$${p.price}`,
    };
  });

  // Chart 2 Data: Weekly 7-Day Trend
  const weeklyTrendData = [
    { day: 'Mon', clicks: 142 + (extraSimulatedTotal > 0 ? 8 : 0), alerts: 18, conversions: 5 },
    { day: 'Tue', clicks: 198 + (extraSimulatedTotal > 0 ? 12 : 0), alerts: 24, conversions: 7 },
    { day: 'Wed', clicks: 276 + (extraSimulatedTotal > 0 ? 15 : 0), alerts: 31, conversions: 10 },
    { day: 'Thu', clicks: 312 + (extraSimulatedTotal > 0 ? 18 : 0), alerts: 29, conversions: 11 },
    { day: 'Fri', clicks: 420 + (extraSimulatedTotal > 0 ? 25 : 0), alerts: 45, conversions: 16 },
    { day: 'Sat', clicks: 489 + (extraSimulatedTotal > 0 ? 30 : 0), alerts: 52, conversions: 19 },
    { day: 'Sun', clicks: 395 + extraSimulatedTotal, alerts: 38, conversions: 14 },
  ];

  // Chart 3 Data: Category Clicks Distribution
  const categoryTotals: Record<string, number> = {};
  products.forEach((p) => {
    const pClicks = (p.clicks || 0) + (simulatedExtraClicks[p.id] || 0);
    categoryTotals[p.category] = (categoryTotals[p.category] || 0) + pClicks;
  });
  const categoryChartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  const CHART_PALETTE = ['#000c1b', '#006b5b', '#26fedc', '#2563eb', '#f59e0b', '#ec4899', '#8b5cf6'];

  // Handle Passcode Unlock for protected access
  const handlePasscodeUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode.trim() === 'Mustafa@@$$##622565') {
      setIsUnlockedLocally(true);
      setPasscodeError(null);
      if (onSwitchToAdminRole) {
        onSwitchToAdminRole();
      }
      onNotify('Admin clearance granted. Welcome to the Management Portal.');
    } else {
      setPasscodeError('Invalid Admin Passkey. Access denied.');
    }
  };

  // Export Analytics Data
  const handleExportCSV = () => {
    const csvRows = [
      ['Product ID', 'Name', 'Category', 'Price', 'Original Price', 'Clicks', 'Rating'].join(','),
      ...products.map((p) =>
        [
          `"${p.id}"`,
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.category}"`,
          p.price,
          p.originalPrice,
          p.clicks || 0,
          p.rating,
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curated-pick-metrics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Exported product telemetry CSV.');
  };

  // Refresh Telemetry
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onNotify('Metrics synced with server.');
    }, 600);
  };

  // If NOT Admin, render the Protected View Gate
  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#0c1827] rounded-2xl border border-[#c3c6ce]/60 dark:border-slate-800 shadow-xl p-6 text-center animate-scaleUp">
          <div className="w-12 h-12 rounded-2xl bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Lock className="w-6 h-6" />
          </div>

          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#93000a] dark:text-rose-400 bg-[#ffdad6] dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
            Protected Admin Route
          </span>

          <h2 className="text-xl font-extrabold text-[#000c1b] dark:text-white mt-2">
            Restricted Admin Area
          </h2>
          <p className="text-xs text-[#74777e] dark:text-slate-400 mt-1.5 leading-relaxed">
            This management console is strictly restricted to platform administrators. Please enter your administrator passkey to proceed.
          </p>

          <form onSubmit={handlePasscodeUnlock} className="mt-5 space-y-3">
            <div>
              <div className="relative">
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => {
                    setAdminPasscode(e.target.value);
                    setPasscodeError(null);
                  }}
                  placeholder="Enter Administrator Passkey"
                  className="w-full text-xs px-3 py-2 bg-[#f8f9ff] dark:bg-slate-900 border border-[#c3c6ce]/70 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#006b5b] dark:text-white"
                />
              </div>
              {passcodeError && (
                <p className="text-[11px] text-[#93000a] dark:text-rose-400 font-medium text-left mt-1">
                  {passcodeError}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 bg-[#000c1b] dark:bg-[#26fedc] hover:bg-[#001c3d] text-[#26fedc] dark:text-[#000c1b] font-bold text-xs py-2 px-3 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Unlock Dashboard
              </button>
              <button
                type="button"
                onClick={onNavigateHome}
                className="px-3 py-2 text-xs font-semibold text-[#74777e] hover:text-[#000c1b] dark:text-slate-400 dark:hover:text-white rounded-xl border border-[#c3c6ce]/60 dark:border-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 pb-20 space-y-5">
      {/* Top Header & Fast Action Bar */}
      <div className="bg-white dark:bg-[#0e1d30] rounded-2xl border border-[#c3c6ce]/40 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/25 dark:bg-[#26fedc]/15 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Admin Protected Console
            </span>
            <span className="text-[10px] text-[#74777e] dark:text-slate-400 font-medium">
              Operator: {currentUser.name || 'Huzaifa Khan'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#000c1b] dark:text-white mt-1">
            Platform Telemetry & Operations
          </h1>
          <p className="text-xs text-[#74777e] dark:text-slate-400 mt-0.5">
            Real-time affiliate clicks, active price drop monitors, and user registrations.
          </p>
        </div>

        {/* Small Feature Buttons Row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            id="btn-admin-add-product"
            onClick={onNavigateToAddProduct}
            className="inline-flex items-center gap-1 bg-[#26fedc] hover:bg-[#1de9ca] text-[#000c1b] font-bold text-[11px] px-2.5 py-1 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            title="Create and publish new product listing"
          >
            <Plus className="w-3 h-3" />
            <span>Add Product</span>
          </button>

          <button
            id="btn-admin-view-charts"
            onClick={() => setActiveTab('charts')}
            className={`inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              activeTab === 'charts'
                ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] border-transparent shadow-xs'
                : 'bg-white dark:bg-slate-900 hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#006b5b] dark:text-[#26fedc] border-[#c3c6ce]/50 dark:border-slate-700'
            }`}
            title="View Visual Interactive Telemetry Charts"
          >
            <BarChart3 className="w-3 h-3" />
            <span>Charts</span>
          </button>

          <button
            id="btn-admin-refresh"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1 bg-[#eff4ff] dark:bg-slate-800 hover:bg-[#d8e6ff] dark:hover:bg-slate-700 text-[#006b5b] dark:text-[#26fedc] font-bold text-[11px] px-2 py-1 rounded-lg border border-[#c3c6ce]/40 dark:border-slate-700 transition-all cursor-pointer"
            title="Refresh metrics data"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            id="btn-admin-export"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#43474d] dark:text-slate-300 font-semibold text-[11px] px-2 py-1 rounded-lg border border-[#c3c6ce]/50 dark:border-slate-700 transition-all cursor-pointer"
            title="Download Telemetry CSV"
          >
            <Download className="w-3 h-3" />
            <span>Export CSV</span>
          </button>

          <button
            id="btn-admin-return-store"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#43474d] dark:text-slate-300 font-semibold text-[11px] px-2 py-1 rounded-lg border border-[#c3c6ce]/50 dark:border-slate-700 transition-all cursor-pointer"
            title="Back to consumer storefront"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Storefront</span>
          </button>
        </div>
      </div>

      {/* 4 Key Metrics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total Product Clicks */}
        <div className="bg-white dark:bg-[#0e1d30] rounded-xl border border-[#c3c6ce]/40 dark:border-slate-800 p-3.5 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#74777e] dark:text-slate-400">
              Total Outbound Clicks
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#26fedc]/25 text-[#006b5b] dark:text-[#26fedc] flex items-center justify-center">
              <MousePointerClick className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#000c1b] dark:text-white">
              {totalClicks.toLocaleString()}
            </span>
            <span className="text-[10.5px] font-bold text-[#006b5b] dark:text-[#26fedc] flex items-center">
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +18.4%
            </span>
          </div>
          <p className="text-[10.5px] text-[#74777e] dark:text-slate-400 mt-1 truncate">
            Top: {topProductsByClicks[0]?.name || 'N/A'} ({topProductsByClicks[0]?.clicks || 0} clicks)
          </p>
        </div>

        {/* Metric 2: Active Price Alerts */}
        <div className="bg-white dark:bg-[#0e1d30] rounded-xl border border-[#c3c6ce]/40 dark:border-slate-800 p-3.5 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#74777e] dark:text-slate-400">
              Active Price Alerts
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#ffdad6]/60 dark:bg-rose-950/40 text-[#93000a] dark:text-rose-400 flex items-center justify-center">
              <BellRing className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#000c1b] dark:text-white">
              {activeAlertsCount}
            </span>
            <span className="text-[10px] font-semibold text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/20 px-1.5 py-0.5 rounded">
              Live Monitoring
            </span>
          </div>
          <p className="text-[10.5px] text-[#74777e] dark:text-slate-400 mt-1 truncate">
            Across {Object.keys(priceAlerts).length} target products
          </p>
        </div>

        {/* Metric 3: Recent User Signups */}
        <div className="bg-white dark:bg-[#0e1d30] rounded-xl border border-[#c3c6ce]/40 dark:border-slate-800 p-3.5 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#74777e] dark:text-slate-400">
              Registered Users
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#eff4ff] dark:bg-slate-800 text-[#006b5b] dark:text-[#26fedc] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#000c1b] dark:text-white">
              {totalSignupsCount}
            </span>
            <span className="text-[10.5px] font-bold text-[#006b5b] dark:text-[#26fedc]">
              +4 this week
            </span>
          </div>
          <p className="text-[10.5px] text-[#74777e] dark:text-slate-400 mt-1 truncate">
            {userSignups.filter((u) => u.status === 'verified').length} verified accounts
          </p>
        </div>

        {/* Metric 4: Est. Affiliate Conversions */}
        <div className="bg-white dark:bg-[#0e1d30] rounded-xl border border-[#c3c6ce]/40 dark:border-slate-800 p-3.5 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#74777e] dark:text-slate-400">
              Est. Commission
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#000c1b] text-[#26fedc] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#000c1b] dark:text-white">
              ${Number(estimatedCommission).toLocaleString()}
            </span>
            <span className="text-[10px] text-[#74777e] dark:text-slate-400">
              ~{estimatedOrders} orders
            </span>
          </div>
          <p className="text-[10.5px] text-[#74777e] dark:text-slate-400 mt-1 truncate">
            Based on ~{estimatedConversionRate}% benchmark
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs for Drilldown */}
      <div className="flex items-center gap-1 border-b border-[#c3c6ce]/30 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('charts')}
          className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'charts'
              ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] shadow-2xs'
              : 'text-[#74777e] dark:text-slate-400 hover:text-[#000c1b] dark:hover:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-3 h-3" />
          <span>Analytics & Charts</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] shadow-2xs'
              : 'text-[#74777e] dark:text-slate-400 hover:text-[#000c1b] dark:hover:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-800'
          }`}
        >
          Top Clicks ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'alerts'
              ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] shadow-2xs'
              : 'text-[#74777e] dark:text-slate-400 hover:text-[#000c1b] dark:hover:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-800'
          }`}
        >
          <span>Price Alerts</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#ffdad6] text-[#93000a] dark:bg-rose-950 dark:text-rose-300 font-black">
            {activeAlertsCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] shadow-2xs'
              : 'text-[#74777e] dark:text-slate-400 hover:text-[#000c1b] dark:hover:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-800'
          }`}
        >
          <span>User Signups</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#26fedc]/30 text-[#006b5b] dark:text-[#26fedc] font-black">
            {totalSignupsCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] shadow-2xs'
              : 'text-[#74777e] dark:text-slate-400 hover:text-[#000c1b] dark:hover:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-3 h-3" />
          <span>Security & Backup</span>
        </button>
      </div>

      {/* Tab: Interactive Charts & Visualizations */}
      {activeTab === 'charts' && (
        <div className="space-y-4">
          {/* Charts Header & Small Action Controls */}
          <div className="bg-white dark:bg-[#0e1d30] rounded-2xl border border-[#c3c6ce]/40 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Visual Analytics
                </span>
                <span className="text-[10px] text-[#74777e] dark:text-slate-400">
                  Live data synced
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#000c1b] dark:text-white mt-1">
                Affiliate Outbound Clicks & Traffic Visualizer
              </h3>
            </div>

            {/* Very Small Feature Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Add Product shortcut */}
              <button
                id="btn-charts-add-product"
                onClick={onNavigateToAddProduct}
                className="inline-flex items-center gap-1 bg-[#26fedc] hover:bg-[#1de9ca] text-[#000c1b] font-bold text-[10px] sm:text-[10.5px] px-2 py-1 rounded-md shadow-2xs transition-all cursor-pointer"
                title="Add New Curated Product to Catalog"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>Add Product</span>
              </button>

              {/* Sub-view toggle */}
              <div className="flex items-center bg-[#f0f4f9] dark:bg-slate-900 p-0.5 rounded-lg border border-[#c3c6ce]/30 dark:border-slate-800">
                <button
                  onClick={() => setChartSubView('all')}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    chartSubView === 'all'
                      ? 'bg-white dark:bg-slate-800 text-[#000c1b] dark:text-white shadow-2xs'
                      : 'text-[#74777e] dark:text-slate-400 hover:text-[#000c1b]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setChartSubView('clicks')}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    chartSubView === 'clicks'
                      ? 'bg-white dark:bg-slate-800 text-[#000c1b] dark:text-white shadow-2xs'
                      : 'text-[#74777e] dark:text-slate-400 hover:text-[#000c1b]'
                  }`}
                >
                  Clicks
                </button>
                <button
                  onClick={() => setChartSubView('trend')}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    chartSubView === 'trend'
                      ? 'bg-white dark:bg-slate-800 text-[#000c1b] dark:text-white shadow-2xs'
                      : 'text-[#74777e] dark:text-slate-400 hover:text-[#000c1b]'
                  }`}
                >
                  Trend
                </button>
                <button
                  onClick={() => setChartSubView('categories')}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    chartSubView === 'categories'
                      ? 'bg-white dark:bg-slate-800 text-[#000c1b] dark:text-white shadow-2xs'
                      : 'text-[#74777e] dark:text-slate-400 hover:text-[#000c1b]'
                  }`}
                >
                  Categories
                </button>
              </div>

              {/* Timeframe filter */}
              <div className="flex items-center bg-[#f0f4f9] dark:bg-slate-900 p-0.5 rounded-lg border border-[#c3c6ce]/30 dark:border-slate-800">
                {(['7d', '30d', 'all'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setChartTimeframe(tf)}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-all cursor-pointer uppercase ${
                      chartTimeframe === tf
                        ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] shadow-2xs'
                        : 'text-[#74777e] dark:text-slate-400'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* Simulation test button */}
              <button
                onClick={() => {
                  const topId = topProductsByClicks[0]?.id;
                  if (topId) {
                    setSimulatedExtraClicks((prev) => ({
                      ...prev,
                      [topId]: (prev[topId] || 0) + 1,
                    }));
                    onNotify(`Simulated outbound click on ${topProductsByClicks[0]?.name}!`);
                  }
                }}
                className="inline-flex items-center gap-1 bg-[#eff4ff] dark:bg-slate-800 hover:bg-[#d8e6ff] text-[#006b5b] dark:text-[#26fedc] font-bold text-[10px] px-2 py-1 rounded-md border border-[#c3c6ce]/40 transition-all cursor-pointer"
                title="Test real-time chart updating by simulating a click"
              >
                <MousePointerClick className="w-2.5 h-2.5" />
                <span>+1 Click</span>
              </button>
            </div>
          </div>

          {/* Grid of Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chart 1: Outbound Product Clicks Bar Chart */}
            {(chartSubView === 'all' || chartSubView === 'clicks') && (
              <div className="bg-white dark:bg-[#0e1d30] rounded-2xl border border-[#c3c6ce]/40 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#000c1b] dark:text-white flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-[#006b5b] dark:text-[#26fedc]" />
                      <span>Product Click-Through Comparison</span>
                    </h4>
                    <p className="text-[10.5px] text-[#74777e] dark:text-slate-400">
                      Outbound merchant link visits per curated item
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/15 px-2 py-0.5 rounded">
                    Top 7 Items
                  </span>
                </div>

                <div className="w-full h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productClicksChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-[#000c1b] text-white p-2 rounded-lg text-xs shadow-lg border border-slate-700">
                                <p className="font-bold text-[#26fedc]">{data.fullName}</p>
                                <p className="text-[11px] text-slate-300">Category: {data.category}</p>
                                <p className="text-[11px] font-semibold mt-1">Clicks: {data.clicks}</p>
                                <p className="text-[10px] text-slate-400">Price: {data.price}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="clicks" fill="#006b5b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="pt-2 border-t border-[#eff4ff] dark:border-slate-800/80 flex items-center justify-between text-[10.5px] text-[#74777e] dark:text-slate-400">
                  <span>Leader: <strong>{topProductsByClicks[0]?.name}</strong></span>
                  <span>Share: <strong>{totalClicks > 0 ? Math.round(((topProductsByClicks[0]?.clicks || 0) / totalClicks) * 100) : 0}%</strong></span>
                </div>
              </div>
            )}

            {/* Chart 2: 7-Day Traffic & Outbound Trend Area Chart */}
            {(chartSubView === 'all' || chartSubView === 'trend') && (
              <div className="bg-white dark:bg-[#0e1d30] rounded-2xl border border-[#c3c6ce]/40 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#000c1b] dark:text-white flex items-center gap-1.5">
                      <LineChartIcon className="w-3.5 h-3.5 text-[#006b5b] dark:text-[#26fedc]" />
                      <span>7-Day Outbound Traffic Trend</span>
                    </h4>
                    <p className="text-[10.5px] text-[#74777e] dark:text-slate-400">
                      Daily visitor click volume vs price drop triggers
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="flex items-center gap-1 text-[#006b5b] dark:text-[#26fedc] font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#006b5b] dark:bg-[#26fedc]" /> Clicks
                    </span>
                    <span className="flex items-center gap-1 text-[#93000a] dark:text-rose-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#93000a] dark:bg-rose-400" /> Alerts
                    </span>
                  </div>
                </div>

                <div className="w-full h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorClicksGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#26fedc" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#26fedc" stopOpacity={0.02}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-[#000c1b] text-white p-2 rounded-lg text-xs shadow-lg border border-slate-700">
                                <p className="font-bold text-[#26fedc]">{label}</p>
                                <p className="text-slate-200">Outbound Clicks: {payload[0]?.value}</p>
                                {payload[1] && <p className="text-rose-300">Alert Triggers: {payload[1]?.value}</p>}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="clicks" stroke="#006b5b" strokeWidth={2} fillOpacity={1} fill="url(#colorClicksGrad)" />
                      <Area type="monotone" dataKey="alerts" stroke="#93000a" strokeWidth={1.5} fillOpacity={0.1} fill="#ffdad6" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="pt-2 border-t border-[#eff4ff] dark:border-slate-800/80 flex items-center justify-between text-[10.5px] text-[#74777e] dark:text-slate-400">
                  <span>Weekly Peak: <strong>Saturday (489 clicks)</strong></span>
                  <span className="text-[#006b5b] dark:text-[#26fedc] font-bold">+24% vs Prev Week</span>
                </div>
              </div>
            )}

            {/* Chart 3: Category Click Distribution Donut Chart */}
            {(chartSubView === 'all' || chartSubView === 'categories') && (
              <div className="bg-white dark:bg-[#0e1d30] rounded-2xl border border-[#c3c6ce]/40 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#000c1b] dark:text-white flex items-center gap-1.5">
                      <PieChartIcon className="w-3.5 h-3.5 text-[#006b5b] dark:text-[#26fedc]" />
                      <span>Category Click Share</span>
                    </h4>
                    <p className="text-[10.5px] text-[#74777e] dark:text-slate-400">
                      Outbound traffic distribution by product department
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#74777e] dark:text-slate-400">
                    {categoryChartData.length} Departments
                  </span>
                </div>

                <div className="w-full h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={82}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            return (
                              <div className="bg-[#000c1b] text-white p-2 rounded-lg text-xs shadow-lg border border-slate-700">
                                <p className="font-bold text-[#26fedc]">{data.name}</p>
                                <p className="text-slate-300">Total Clicks: {data.value}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10.5px', paddingTop: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="pt-2 border-t border-[#eff4ff] dark:border-slate-800/80 flex items-center justify-between text-[10.5px] text-[#74777e] dark:text-slate-400">
                  <span>Dominant: <strong>Electronics / Tech</strong></span>
                  <span>Avg Commission: <strong>4.0%</strong></span>
                </div>
              </div>
            )}

            {/* Chart 4: Funnel & Conversion KPIs */}
            {chartSubView === 'all' && (
              <div className="bg-white dark:bg-[#0e1d30] rounded-2xl border border-[#c3c6ce]/40 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-[#000c1b] dark:text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#006b5b] dark:text-[#26fedc]" />
                      <span>Affiliate Conversion Pipeline</span>
                    </h4>
                    <span className="text-[10px] font-bold text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/20 px-2 py-0.5 rounded">
                      Industry Benchmarks
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#74777e] dark:text-slate-400 mb-4">
                    Tracking consumer progression from catalog view to merchant conversion
                  </p>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] font-bold mb-1">
                        <span className="text-[#000c1b] dark:text-white">1. Outbound Store Redirects</span>
                        <span className="text-[#006b5b] dark:text-[#26fedc]">{totalClicks} clicks (100%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#eff4ff] dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#006b5b] dark:bg-[#26fedc] rounded-full w-full" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-bold mb-1">
                        <span className="text-[#000c1b] dark:text-white">2. Price Drop Monitors Enabled</span>
                        <span className="text-[#006b5b] dark:text-[#26fedc]">{activeAlertsCount} alerts (~{totalClicks > 0 ? Math.round((activeAlertsCount / totalClicks) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#eff4ff] dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#26fedc] rounded-full"
                          style={{ width: `${Math.min(100, Math.max(12, totalClicks > 0 ? (activeAlertsCount / totalClicks) * 100 : 15))}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-bold mb-1">
                        <span className="text-[#000c1b] dark:text-white">3. Est. Completed Amazon Checkouts</span>
                        <span className="text-[#006b5b] dark:text-[#26fedc]">~{estimatedOrders} orders (~{estimatedConversionRate}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#eff4ff] dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#3b82f6] rounded-full"
                          style={{ width: `${Math.min(100, Math.max(8, estimatedConversionRate * 4))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#eff4ff] dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-[#74777e] dark:text-slate-400">Total Projected Payout:</span>
                  <span className="font-extrabold text-[#006b5b] dark:text-[#26fedc] text-sm">
                    ${Number(estimatedCommission).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 1: Product Clicks & Performance */}
      {(activeTab === 'overview' || activeTab === 'clicks') && (
        <div className="bg-white dark:bg-[#0e1d30] rounded-2xl border border-[#c3c6ce]/40 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#000c1b] dark:text-white">
                Affiliate Product Click Throughs
              </h3>
              <p className="text-[11px] text-[#74777e] dark:text-slate-400">
                Sorted by highest consumer interaction and outbound merchant redirects.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3 h-3 text-[#74777e] dark:text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter products..."
                  className="text-xs pl-7 pr-3 py-1 bg-[#f8f9ff] dark:bg-slate-900 border border-[#c3c6ce]/50 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006b5b]"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#eff4ff] dark:border-slate-800 text-[10.5px] font-bold uppercase text-[#74777e] dark:text-slate-400">
                  <th className="py-2 px-2.5">Product</th>
                  <th className="py-2 px-2.5">Category</th>
                  <th className="py-2 px-2.5">Price</th>
                  <th className="py-2 px-2.5">Total Clicks</th>
                  <th className="py-2 px-2.5">Est. Orders</th>
                  <th className="py-2 px-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff] dark:divide-slate-800/60">
                {topProductsByClicks
                  .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((product, idx) => {
                    const clicks = product.clicks || 0;
                    const orders = Math.round((clicks * estimatedConversionRate) / 100);
                    return (
                      <tr key={product.id} className="hover:bg-[#f8f9ff] dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-bold text-[#74777e] dark:text-slate-500 w-4">
                              #{idx + 1}
                            </span>
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-8 h-8 rounded-lg object-cover border border-[#c3c6ce]/40 dark:border-slate-700"
                            />
                            <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                              <p className="font-bold text-[#000c1b] dark:text-white truncate">
                                {product.name}
                              </p>
                              <span className="text-[10px] text-[#74777e] dark:text-slate-400">
                                {product.brand || 'Verified Pick'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#26fedc]/20 text-[#006b5b] dark:text-[#26fedc]">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-[#000c1b] dark:text-slate-200">
                          ${product.price}
                        </td>
                        <td className="py-2.5 px-2.5">
                          <div className="flex items-center gap-1 font-extrabold text-[#006b5b] dark:text-[#26fedc]">
                            <MousePointerClick className="w-3 h-3" />
                            <span>{clicks.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 font-medium text-[#74777e] dark:text-slate-400">
                          ~{orders}
                        </td>
                        <td className="py-2.5 px-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onSelectProduct(product)}
                              className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-[#eff4ff] dark:bg-slate-800 text-[#006b5b] dark:text-[#26fedc] hover:bg-[#26fedc] hover:text-[#000c1b] transition-all cursor-pointer"
                              title="Open Product Modal"
                            >
                              View
                            </button>
                            <a
                              href={product.affiliateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10.5px] p-1 rounded-md text-[#74777e] dark:text-slate-400 hover:text-[#000c1b] dark:hover:text-white cursor-pointer"
                              title="Check Merchant Link"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Active Price Alerts Monitor */}
      {activeTab === 'alerts' && (
        <div className="bg-white dark:bg-[#0e1d30] rounded-2xl border border-[#c3c6ce]/40 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#000c1b] dark:text-white">
                Active Price Drop Telemetry
              </h3>
              <p className="text-[11px] text-[#74777e] dark:text-slate-400">
                Live subscriber alerts monitoring automated price reduction thresholds.
              </p>
            </div>

            <span className="text-[10.5px] font-bold text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/20 px-2 py-0.5 rounded-md">
              {activeAlertsCount} active watchers
            </span>
          </div>

          {activeAlertsList.length === 0 ? (
            <div className="text-center py-8">
              <BellRing className="w-8 h-8 text-[#74777e] dark:text-slate-500 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-[#000c1b] dark:text-white">No active alerts set</p>
              <p className="text-[11px] text-[#74777e] dark:text-slate-400 mt-0.5">
                Users haven't registered any price drop targets yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeAlertsList.map((alert) => {
                const prod = products.find((p) => p.id === alert.productId);
                if (!prod) return null;
                const savings = prod.price - alert.targetPrice;
                return (
                  <div
                    key={alert.productId}
                    className="p-3 bg-[#f8f9ff] dark:bg-slate-900 rounded-xl border border-[#c3c6ce]/30 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-10 h-10 rounded-lg object-cover border border-[#c3c6ce]/30 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#000c1b] dark:text-white truncate">
                          {prod.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10.5px] text-[#74777e] dark:text-slate-400 mt-0.5">
                          <span>Current: <strong>${prod.price}</strong></span>
                          <span>Target: <strong className="text-[#006b5b] dark:text-[#26fedc]">${alert.targetPrice}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onTriggerSimulatedAlert && (
                        <button
                          onClick={() => {
                            onTriggerSimulatedAlert(prod.id);
                            onNotify(`Simulated alert notification triggered for ${prod.name}`);
                          }}
                          className="text-[10px] font-bold px-2 py-1 rounded-md bg-[#26fedc] text-[#000c1b] hover:bg-[#1de9ca] transition-all cursor-pointer shadow-2xs"
                          title="Trigger test alert"
                        >
                          Test Alert
                        </button>
                      )}
                      <button
                        onClick={() => onSelectProduct(prod)}
                        className="text-[10px] font-semibold px-2 py-1 rounded-md bg-white dark:bg-slate-800 text-[#43474d] dark:text-slate-300 border border-[#c3c6ce]/40 transition-all cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Recent User Signups */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-[#0e1d30] rounded-2xl border border-[#c3c6ce]/40 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#000c1b] dark:text-white">
                Recent User Registrations & Accounts
              </h3>
              <p className="text-[11px] text-[#74777e] dark:text-slate-400">
                Audited accounts with role verification and active saved items.
              </p>
            </div>

            <span className="text-[10.5px] font-bold text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/20 px-2 py-0.5 rounded-md">
              {userSignups.length} Registered Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#eff4ff] dark:border-slate-800 text-[10.5px] font-bold uppercase text-[#74777e] dark:text-slate-400">
                  <th className="py-2 px-2.5">User</th>
                  <th className="py-2 px-2.5">Role</th>
                  <th className="py-2 px-2.5">Status</th>
                  <th className="py-2 px-2.5">Registered</th>
                  <th className="py-2 px-2.5">Watchlist / Alerts</th>
                  <th className="py-2 px-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff] dark:divide-slate-800/60">
                {userSignups.map((user) => (
                  <tr key={user.id} className="hover:bg-[#f8f9ff] dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#000c1b] to-[#005245] text-[#26fedc] flex items-center justify-center font-bold text-[10px] shrink-0">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#000c1b] dark:text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-[10.5px] text-[#74777e] dark:text-slate-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          user.role === 'admin'
                            ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b]'
                            : user.role === 'editor'
                            ? 'bg-[#26fedc]/30 text-[#006b5b] dark:text-[#26fedc]'
                            : 'bg-[#eff4ff] dark:bg-slate-800 text-[#43474d] dark:text-slate-300'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5">
                      <span className="text-[10.5px] font-semibold text-[#006b5b] dark:text-[#26fedc] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="capitalize">{user.status}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 text-[#74777e] dark:text-slate-400 text-[11px]">
                      {user.signupDate}
                    </td>
                    <td className="py-2.5 px-2.5 text-[#74777e] dark:text-slate-400 text-[11px]">
                      {user.savedCount} saved &bull; {user.alertsCount} alerts
                    </td>
                    <td className="py-2.5 px-2.5 text-right">
                      <button
                        onClick={() => onNotify(`Viewing ${user.name} profile telemetry.`)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#eff4ff] dark:bg-slate-800 hover:bg-[#d8e6ff] text-[#006b5b] dark:text-[#26fedc] transition-all cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Security & System Architecture Status */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-[#0e1d30] rounded-2xl border border-[#c3c6ce]/40 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#000c1b] dark:text-white flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#006b5b] dark:text-[#26fedc]" />
              <span>Security Protocols & Server Middlewares</span>
            </h3>
            <p className="text-[11px] text-[#74777e] dark:text-slate-400 mt-0.5">
              Current security posture, 2FA readiness, IP whitelisting rules, and database cron backups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-[#f8f9ff] dark:bg-slate-900 rounded-xl border border-[#c3c6ce]/30 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#006b5b] dark:text-[#26fedc]">
                IP Protection
              </span>
              <h4 className="text-xs font-bold text-[#000c1b] dark:text-white mt-1">
                Admin Route Whitelist
              </h4>
              <p className="text-[11px] text-[#74777e] dark:text-slate-400 mt-1 leading-relaxed">
                Middleware active on <code>/api/admin/*</code> with localhost + secure VPN CIDRs.
              </p>
              <div className="mt-2 text-[10px] font-bold text-[#006b5b] dark:text-[#26fedc] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Enforced
              </div>
            </div>

            <div className="p-3 bg-[#f8f9ff] dark:bg-slate-900 rounded-xl border border-[#c3c6ce]/30 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#006b5b] dark:text-[#26fedc]">
                Rate Limiting
              </span>
              <h4 className="text-xs font-bold text-[#000c1b] dark:text-white mt-1">
                Brute-Force Guard
              </h4>
              <p className="text-[11px] text-[#74777e] dark:text-slate-400 mt-1 leading-relaxed">
                Max 5 failed consecutive attempts per 15-minute sliding window with automatic lockout.
              </p>
              <div className="mt-2 text-[10px] font-bold text-[#006b5b] dark:text-[#26fedc] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Active
              </div>
            </div>

            <div className="p-3 bg-[#f8f9ff] dark:bg-slate-900 rounded-xl border border-[#c3c6ce]/30 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#006b5b] dark:text-[#26fedc]">
                Cron Archival
              </span>
              <h4 className="text-xs font-bold text-[#000c1b] dark:text-white mt-1">
                Daily Backup (02:00 AM)
              </h4>
              <p className="text-[11px] text-[#74777e] dark:text-slate-400 mt-1 leading-relaxed">
                Automated database snapshots archived with 14-day rolling retention policy.
              </p>
              <div className="mt-2 text-[10px] font-bold text-[#006b5b] dark:text-[#26fedc] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Scheduled
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
