// frontend/src/SuperAdminAnalytics.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, Cell, LabelList,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { useToast } from './Toast';
import { API_URL } from './config';

const RANGES = [
  { id: '7d', label: 'Last 7 Days', days: 7 },
  { id: '30d', label: 'Last 30 Days', days: 30 },
  { id: '90d', label: 'Last 90 Days', days: 90 },
];

// Reserved status palette — same colors used app-wide for order-status badges
// (AdminDashboard.js, CustomerOrdersPage.js). The adjacent purple/blue pair is
// not colorblind-safe on hue alone; the y-axis category labels on this chart
// (status names) are the secondary encoding that keeps it legible regardless.
const STATUS_COLORS = {
  Pending: '#eab308',
  Confirmed: '#3b82f6',
  Packed: '#a855f7',
  'Ready to Deliver': '#10b981',
  'Out For Delivery': '#0ea5e9',
  'Ready for Pickup': '#f59e0b',
  Delivered: '#22c55e',
  Cancelled: '#ef4444',
};

// recharts renders inline SVG styles, not Tailwind classes, so these can't be
// token classes — but they still need to track the active theme, unlike a
// static hex. Mirrors the exact light/dark values in index.css's CSS variables.
const CHART_COLORS = {
  light: { axisText: '#5E5644', grid: '#D9D0BC', primary: '#1F6D4C', tooltipBg: '#FFFFFF', tooltipShadow: '0 4px 20px rgba(36,31,22,0.12)' },
  dark:  { axisText: '#C9C2AC', grid: '#48412F', primary: '#3FA377', tooltipBg: '#211D14', tooltipShadow: '0 4px 20px rgba(0,0,0,0.5)' },
};

const dateKey = (d) => d.toISOString().slice(0, 10);

function fillDateSeries(raw, days, valueKey) {
  const map = new Map(raw.map((d) => [d._id, d[valueKey]]));
  const out = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    out.push({
      date: key,
      label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      value: map.get(key) || 0,
    });
  }
  return out;
}

function tooltipStyle(colors) {
  return {
    contentStyle: { background: colors.tooltipBg, border: 'none', borderRadius: '12px', boxShadow: colors.tooltipShadow, fontSize: '12px' },
    labelStyle: { color: colors.axisText, fontWeight: 700 },
    itemStyle: { color: colors.axisText },
  };
}

function EmptyPanel() {
  return (
    <div className="h-64 flex flex-col items-center justify-center text-center">
      <span className="material-symbols-outlined text-4xl text-outline/30 mb-2">bar_chart</span>
      <p className="text-on-surface-variant text-sm">No data for this period.</p>
    </div>
  );
}

function Panel({ title, info, children }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6">
      <div className="flex items-center gap-1.5 mb-4">
        <h3 className="font-headline font-bold text-on-surface">{title}</h3>
        {info && (
          <span className="material-symbols-outlined text-sm text-outline cursor-help" title={info}>info</span>
        )}
      </div>
      {children}
    </div>
  );
}

function SuperAdminAnalytics() {
  const [range, setRange] = useState('7d');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getAuthHeader } = useAuth();
  const { resolvedTheme } = useTheme();
  const toast = useToast();
  const colors = CHART_COLORS[resolvedTheme] || CHART_COLORS.light;

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/analytics?range=${range}`, getAuthHeader());
      setData(res.data);
    } catch (error) {
      toast({ message: 'Failed to load analytics.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [range, getAuthHeader, toast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const rangeMeta = RANGES.find((r) => r.id === range) || RANGES[0];

  const ordersSeries = data ? fillDateSeries(data.ordersOverTime, rangeMeta.days, 'count') : [];
  const revenueSeries = data ? fillDateSeries(data.revenueOverTime, rangeMeta.days, 'revenue') : [];
  const usersSeries = data ? fillDateSeries(data.newUsersOverTime, rangeMeta.days, 'count') : [];

  const isAllZero = (series) => series.every((d) => d.value === 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">Super Admin</span>
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mt-2">Analytics</h1>
        <p className="text-on-surface-variant mt-2">Platform trends and performance.</p>
      </div>

      <div className="flex bg-surface-container-high rounded-xl p-1 self-start mb-8 w-fit">
        {RANGES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRange(r.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap ${
              range === r.id ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading || !data ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-2xl p-6">
              <div className="skeleton h-64 rounded-xl" />
            </div>
          ))
        ) : (
          <>
            <Panel title="Orders Over Time">
              {isAllZero(ordersSeries) ? <EmptyPanel /> : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={ordersSeries}>
                    <CartesianGrid stroke={colors.grid} strokeDasharray="0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: colors.axisText, fontSize: 11 }} axisLine={{ stroke: colors.grid }} tickLine={false} />
                    <YAxis tick={{ fill: colors.axisText, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip {...tooltipStyle(colors)} />
                    <Line type="monotone" dataKey="value" name="Orders" stroke={colors.primary} strokeWidth={2} dot={{ r: 3, fill: colors.primary }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Panel>

            <Panel title="Revenue Over Time">
              {isAllZero(revenueSeries) ? <EmptyPanel /> : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={revenueSeries}>
                    <CartesianGrid stroke={colors.grid} strokeDasharray="0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: colors.axisText, fontSize: 11 }} axisLine={{ stroke: colors.grid }} tickLine={false} />
                    <YAxis tick={{ fill: colors.axisText, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip {...tooltipStyle(colors)} formatter={(v) => [`₹${v.toFixed(2)}`, 'Revenue']} />
                    <Area type="monotone" dataKey="value" name="Revenue" stroke={colors.primary} strokeWidth={2} fill={colors.primary} fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Panel>

            <Panel title="New Users Over Time">
              {isAllZero(usersSeries) ? <EmptyPanel /> : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={usersSeries}>
                    <CartesianGrid stroke={colors.grid} strokeDasharray="0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: colors.axisText, fontSize: 11 }} axisLine={{ stroke: colors.grid }} tickLine={false} />
                    <YAxis tick={{ fill: colors.axisText, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip {...tooltipStyle(colors)} />
                    <Line type="monotone" dataKey="value" name="New Users" stroke={colors.primary} strokeWidth={2} dot={{ r: 3, fill: colors.primary }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Panel>

            <Panel title="Orders by Status">
              {!data.ordersByStatus || data.ordersByStatus.length === 0 ? <EmptyPanel /> : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.ordersByStatus} layout="vertical" margin={{ right: 30 }}>
                    <CartesianGrid stroke={colors.grid} strokeDasharray="0" horizontal={false} />
                    <XAxis type="number" tick={{ fill: colors.axisText, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="_id" tick={{ fill: colors.axisText, fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip {...tooltipStyle(colors)} />
                    <Bar dataKey="count" name="Orders" barSize={20} radius={[0, 4, 4, 0]}>
                      {data.ordersByStatus.map((entry) => (
                        <Cell key={entry._id} fill={STATUS_COLORS[entry._id] || '#94a3b8'} />
                      ))}
                      <LabelList dataKey="count" position="right" fill={colors.axisText} fontSize={11} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Panel>

            <Panel title="Top Shops by Revenue">
              {!data.topShops || data.topShops.length === 0 ? <EmptyPanel /> : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.topShops} layout="vertical" margin={{ right: 40 }}>
                    <CartesianGrid stroke={colors.grid} strokeDasharray="0" horizontal={false} />
                    <XAxis type="number" tick={{ fill: colors.axisText, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                    <YAxis type="category" dataKey="shopName" tick={{ fill: colors.axisText, fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip {...tooltipStyle(colors)} formatter={(v, n) => (n === 'totalSales' ? [`₹${v.toFixed(2)}`, 'Revenue'] : [v, n])} />
                    <Bar dataKey="totalSales" name="totalSales" fill={colors.primary} barSize={20} radius={[0, 4, 4, 0]}>
                      <LabelList dataKey="totalSales" position="right" fill={colors.axisText} fontSize={11} formatter={(v) => `₹${v.toFixed(0)}`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Panel>

            <Panel
              title="Top Products by Quantity"
              info="Grouped by product name text, not a stable product ID — identical names from different shops are merged; near-duplicate names are counted separately."
            >
              {!data.topProducts || data.topProducts.length === 0 ? <EmptyPanel /> : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.topProducts} layout="vertical" margin={{ right: 30 }}>
                    <CartesianGrid stroke={colors.grid} strokeDasharray="0" horizontal={false} />
                    <XAxis type="number" tick={{ fill: colors.axisText, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="_id" tick={{ fill: colors.axisText, fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip {...tooltipStyle(colors)} />
                    <Bar dataKey="totalQuantity" name="Quantity" fill={colors.primary} barSize={20} radius={[0, 4, 4, 0]}>
                      <LabelList dataKey="totalQuantity" position="right" fill={colors.axisText} fontSize={11} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}

export default SuperAdminAnalytics;
