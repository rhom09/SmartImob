'use client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

export function SimpleBarChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#45464d', fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#45464d', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            borderColor: 'rgba(0,0,0,0.1)',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Bar dataKey="value" fill="#4e49ca" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FinancialAreaChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4edea3" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#4edea3" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ba1a1a" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#ba1a1a" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#45464d', fontSize: 12 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#45464d', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            borderColor: 'rgba(0,0,0,0.1)',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          itemStyle={{ fontSize: '12px' }}
        />
        <Area
          type="monotone"
          dataKey="receita"
          stroke="#4edea3"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorReceita)"
        />
        <Area
          type="monotone"
          dataKey="despesa"
          stroke="#ba1a1a"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorDespesa)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
