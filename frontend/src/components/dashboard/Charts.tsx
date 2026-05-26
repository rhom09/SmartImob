'use client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

export function SimpleBarChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#00b8ff" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FinancialAreaChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="receita" stroke="#00e88f" fill="#00e88f" fillOpacity={0.3} />
        <Area type="monotone" dataKey="despesa" stroke="#ff4d6d" fill="#ff4d6d" fillOpacity={0.3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
