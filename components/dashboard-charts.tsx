"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type TrendPoint = {
  label: string;
  amount: number;
};

export function SavingsTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f766e" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#0f766e" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#d9e4df" strokeDasharray="3 3" />
        <XAxis dataKey="label" stroke="#4a5d56" />
        <YAxis stroke="#4a5d56" />
        <Tooltip />
        <Area type="monotone" dataKey="amount" stroke="#0f766e" fill="url(#savingsFill)" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function NetWorthTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid stroke="#eadfd0" strokeDasharray="3 3" />
        <XAxis dataKey="label" stroke="#665646" />
        <YAxis stroke="#665646" />
        <Tooltip />
        <Bar dataKey="amount" fill="#c26d32" radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SharedUsageChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid stroke="#dfe6dc" strokeDasharray="3 3" />
        <XAxis dataKey="label" stroke="#4a5d56" />
        <YAxis stroke="#4a5d56" />
        <Tooltip />
        <Bar dataKey="amount" fill="#0f766e" radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SharedMonthlyTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="sharedMonthlyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c26d32" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#c26d32" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#eadfd0" strokeDasharray="3 3" />
        <XAxis dataKey="label" stroke="#665646" />
        <YAxis stroke="#665646" />
        <Tooltip />
        <Area type="monotone" dataKey="amount" stroke="#c26d32" fill="url(#sharedMonthlyFill)" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
