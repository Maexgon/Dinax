
'use client';

import React from 'react';
import { 
  Users, 
  Database, 
  Zap, 
  TrendingUp, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  Server
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getAdminStats, getRecentActivity } from './actions';

export default function AdminDashboard() {
  const [statsData, setStatsData] = React.useState({ tenants: 0, users: 0, dbDocuments: 0, activeSessions: 0 });
  const [recentUsers, setRecentUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      const [stats, activity] = await Promise.all([
        getAdminStats(),
        getRecentActivity()
      ]);
      setStatsData(stats);
      setRecentUsers(activity);
      setLoading(false);
    }
    fetchData();
  }, []);

  const stats = [
    { 
      name: 'Total Tenants', 
      value: statsData.tenants.toString(), 
      change: '+1', 
      trend: 'up', 
      icon: Users,
      color: 'text-blue-500'
    },
    { 
      name: 'DB Documents', 
      value: statsData.dbDocuments.toLocaleString(), 
      change: statsData.dbDocuments > 1000 ? '+0.2k' : '+50', 
      trend: 'up', 
      icon: Database,
      color: 'text-purple-500' 
    },
    { 
      name: 'Total Users', 
      value: statsData.users.toString(), 
      change: '+2', 
      trend: 'up', 
      icon: Zap,
      color: 'text-orange-500' 
    },
    { 
      name: 'Active Sessions', 
      value: statsData.activeSessions.toString(), 
      change: '+5%', 
      trend: 'up', 
      icon: Zap,
      color: 'text-emerald-500' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
          System Overview
        </h1>
        <p className="text-zinc-400 mt-2">
          Monitor your platform's health and tenant activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:border-zinc-700 transition-all duration-300 group overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{stat.name}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color} group-hover:scale-110 transition-transform`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className={stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}>
                  {stat.change}
                </span>
                <span>since last month</span>
              </p>
            </CardContent>
            {/* Subtle gradient glow */}
            <div className={`absolute -right-8 -bottom-8 h-24 w-24 rounded-full blur-[60px] opacity-10 ${stat.color.replace('text', 'bg')}`} />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Recent Tenant Connections</CardTitle>
            <CardDescription>Last active owners in the past 24 hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-12 w-full animate-pulse bg-zinc-800/50 rounded-lg" />
                ))
              ) : recentUsers.length > 0 ? (
                recentUsers.map((user, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-sm font-semibold group-hover:border-orange-500 transition-colors">
                        {user.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{user.name || 'Anonymous'}</div>
                        <div className="text-xs text-zinc-400">{user.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-zinc-300">{user.time}</div>
                      <div className="flex items-center gap-1.5 justify-end mt-0.5">
                        <div className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          user.status === 'Online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 
                          'bg-zinc-600'
                        )} />
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{user.status}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500 py-4 text-center">No recent activity found.</p>
              )}
            </div>
            <Button variant="outline" className="w-full mt-6 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800">
              View All Activity
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <CardHeader>
            <CardTitle>Usage Distribution</CardTitle>
            <CardDescription>Top collections by document count.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {[
                 { label: 'Total Users', count: statsData.users.toString(), percent: 100, color: 'bg-blue-500' },
                 { label: 'Tenants', count: statsData.tenants.toString(), percent: (statsData.tenants / (statsData.users || 1)) * 100, color: 'bg-purple-500' },
                 { label: 'System Profiles', count: statsData.dbDocuments.toString(), percent: 80, color: 'bg-orange-500' },
               ].map((item, i) => (
                 <div key={i} className="space-y-1.5">
                   <div className="flex items-center justify-between text-xs">
                     <span className="text-zinc-400">{item.label}</span>
                     <span className="font-mono text-zinc-200">{item.count}</span>
                   </div>
                   <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                     <div 
                        className={`h-full rounded-full ${item.color} opacity-80 group-hover:opacity-100 transition-all duration-1000`} 
                        style={{ width: `${Math.min(item.percent, 100)}%` }}
                      />
                   </div>
                 </div>
               ))}
             </div>
             
             <div className="mt-8 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 items-center gap-3 hidden sm:flex">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Server className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Cloud Health</div>
                  <div className="text-xs text-zinc-500">All regions operating normally.</div>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
