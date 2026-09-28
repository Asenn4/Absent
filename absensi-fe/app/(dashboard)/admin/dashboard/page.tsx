"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Clock, UserX } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [data, setData] = useState({
    totalUsers: 0,
    present: 0,
    late: 0,
    absent: 0,
    trendData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/admin")
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setData(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "TOTAL USERS", value: data.totalUsers, icon: Users, sub: "Registered" },
    { label: "PRESENT", value: data.present, icon: UserCheck, sub: "Today" },
    { label: "LATE", value: data.late, icon: Clock, sub: "Today", accent: true },
    { label: "ABSENT", value: data.absent, icon: UserX, sub: "Unexcused", danger: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">system overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className={	ext-2xl font-mono font-bold tracking-tight {stat.danger ? 'text-destructive' : stat.accent ? 'text-amber-500' : 'text-foreground'}}>
                {stat.value}
              </div>
              <p className="text-[10px] font-mono text-muted-foreground mt-1">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="border border-border bg-card p-4">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground">Weekly Trend</h2>
          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">attendance over time</p>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'monospace' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'monospace' }} dx={-10} />
              <Tooltip
                cursor={{ stroke: '#3f3f46', strokeWidth: 1 }}
                contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '2px', fontSize: '12px', fontFamily: 'monospace' }}
                labelStyle={{ color: '#a1a1aa' }}
              />
              <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '11px', fontFamily: 'monospace' }} />
              <Line type="monotone" dataKey="present" name="Present" stroke="#22c55e" strokeWidth={2} dot={{ r: 2, fill: '#22c55e', strokeWidth: 0 }} activeDot={{ r: 4, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="late" name="Late" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 4, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="absent" name="Absent" stroke="#71717a" strokeWidth={2} dot={{ r: 2, fill: '#71717a', strokeWidth: 0 }} activeDot={{ r: 4, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
