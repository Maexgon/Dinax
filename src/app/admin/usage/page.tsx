
'use client';

import React from 'react';
import { 
  BarChart3, 
  Activity, 
  Database, 
  Clock, 
  UserCheck, 
  Zap,
  ArrowUpRight,
  TrendingUp,
  History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';
import { getDetailedUsageStats, getAuthEvents } from '../actions';

export default function UsageStats() {
  const [data, setData] = React.useState<any>(null);
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      const [stats, authEvents] = await Promise.all([
        getDetailedUsageStats(),
        getAuthEvents()
      ]);
      setData(stats);
      setEvents(authEvents);
      setLoading(false);
    }
    fetchData();
  }, []);

  const signupData = data?.growthData || [];

  const dbUsageData = [
    { label: 'Tenants', value: data?.tenants || 0 },
    { label: 'Coaches', value: data?.coaches || 0 },
    { label: 'Clients', value: data?.clients || 0 },
    { label: 'Invites', value: data?.invitations || 0 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
           <Activity className="h-8 w-8 text-orange-500" /> Platform Usage
        </h1>
        <p className="text-zinc-400 mt-2">Historical data of database operations and user engagement.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Platform Growth</CardTitle>
                <CardDescription>Recent signups trend.</CardDescription>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Zap className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
            {loading ? (
                <div className="h-full w-full flex items-center justify-center text-zinc-500">Loading charts...</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={signupData}>
                    <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                    <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                    itemStyle={{ color: '#f97316' }}
                    />
                    <Area 
                    type="monotone" 
                    dataKey="signups" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorActive)" 
                    />
                </AreaChart>
                </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Data Distribution</CardTitle>
                <CardDescription>Total documents per collection.</CardDescription>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Database className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dbUsageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="label" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-zinc-400" />
            <div>
              <CardTitle>Recent Authentication Events</CardTitle>
              <CardDescription>Track when and how tenant owners are accessing the system.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
                Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-16 w-full animate-pulse bg-zinc-800/50 rounded-xl" />
                ))
            ) : events.length > 0 ? (
                events.map((ev, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-zinc-800/40 border border-transparent hover:border-zinc-800 transition-all group">
                        <div className="flex items-center gap-4">
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 group-hover:text-orange-500 group-hover:bg-zinc-700 transition-colors">
                            <History className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold">{ev.name} <span className="text-zinc-500 font-normal">({ev.project})</span></div>
                            <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                                <span>{ev.action}</span>
                                <span className="h-1 w-1 rounded-full bg-zinc-700" />
                                <span>{ev.method} Auth</span>
                                <span className="h-1 w-1 rounded-full bg-zinc-700" />
                                <span className="text-zinc-400">{ev.device}</span>
                            </div>
                        </div>
                        </div>
                        <div className="text-right">
                        <div className="text-xs font-medium text-zinc-400">{ev.time}</div>
                        <div className="text-[10px] text-emerald-500/80 font-bold tracking-widest mt-1">SUCCESS</div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-12 text-zinc-500">No events found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
