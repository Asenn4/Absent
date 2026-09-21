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
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-blue-900">Admin Dashboard</h1>
        <p className="text-blue-600/80 mt-1 font-medium">System overview and statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border border-blue-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative rounded-2xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-blue-800">Total Users</CardTitle>
            <div className="p-2.5 bg-blue-50 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm border border-blue-100">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-extrabold text-blue-900 tracking-tight">{data.totalUsers}</div>
            <p className="text-xs font-medium text-blue-500 mt-2">Registered in system</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-blue-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative rounded-2xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl group-hover:bg-yellow-400/20 transition-colors"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-blue-800">Present</CardTitle>
            <div className="p-2.5 bg-blue-50 rounded-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-sm border border-blue-100">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-extrabold text-blue-900 tracking-tight">{data.present}</div>
            <p className="text-xs font-medium text-blue-500 mt-2">Today</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-blue-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative rounded-2xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl group-hover:bg-yellow-400/20 transition-colors"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-blue-800">Late</CardTitle>
            <div className="p-2.5 bg-blue-50 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm border border-blue-100">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-extrabold text-blue-900 tracking-tight">{data.late}</div>
            <p className="text-xs font-medium text-yellow-500 mt-2 animate-pulse">Action required</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-blue-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative rounded-2xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-colors"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-blue-800">Absent</CardTitle>
            <div className="p-2.5 bg-blue-50 rounded-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-sm border border-blue-100">
              <UserX className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-extrabold text-blue-900 tracking-tight">{data.absent}</div>
            <p className="text-xs font-medium text-blue-500 mt-2">Unexcused</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="w-full">
          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] p-2">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Weekly Attendance Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                  <Tooltip
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '5 5' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="present" name="Present" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="late" name="Late" stroke="#facc15" strokeWidth={3} dot={{ r: 4, fill: '#facc15', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="absent" name="Absent" stroke="#94a3b8" strokeWidth={3} dot={{ r: 4, fill: '#94a3b8', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
