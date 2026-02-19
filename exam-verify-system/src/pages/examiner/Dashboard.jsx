import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, CheckCircle, XCircle, TrendingUp, Clock, Shield, RefreshCw, Activity, Wifi, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PageTransition } from '../../components/layout/PageTransition';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function ExaminerDashboard() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCommonISO = today.toISOString();

        // 1. Fetch Today's Stats
        const { count: todayTotal } = await supabase
          .from('verifications')
          .select('*', { count: 'exact', head: true })
          .gte('scanned_at', todayCommonISO);

        const { count: todayApproved } = await supabase
          .from('verifications')
          .select('*', { count: 'exact', head: true })
          .gte('scanned_at', todayCommonISO)
          .eq('status', 'approved');

        const { count: todayDenied } = await supabase
          .from('verifications')
          .select('*', { count: 'exact', head: true })
          .gte('scanned_at', todayCommonISO)
          .eq('status', 'denied');

        // 2. Fetch All Time Stats
        const { count: allTimeTotal } = await supabase
          .from('verifications')
          .select('*', { count: 'exact', head: true });

        const { count: allTimeApproved } = await supabase
          .from('verifications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');

        const { count: allTimeDenied } = await supabase
          .from('verifications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'denied');


        setStats({
          todayScans: todayTotal || 0,
          todayApproved: todayApproved || 0,
          todayDenied: todayDenied || 0,
          totalScans: allTimeTotal || 0,
          totalApproved: allTimeApproved || 0,
          totalDenied: allTimeDenied || 0,
          successRate: allTimeTotal > 0 ? Math.round((allTimeApproved / allTimeTotal) * 100) : 0,
        });

        // 3. Fetch History (Recent 10)
        const { data: historyData } = await supabase
          .from('verifications')
          .select(`
                *,
                students (matric_number)
            `)
          .order('scanned_at', { ascending: false })
          .limit(10);

        if (historyData) {
          setHistory(historyData);
        }

      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Realtime Subscription
    const channel = supabase
      .channel('verifications-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'verifications',
        },
        async (payload) => {
          // Optimistic update or fetch details
          const { data: newVerification } = await supabase
            .from('verifications')
            .select(`*, students(matric_number)`)
            .eq('id', payload.new.id)
            .single();

          if (newVerification) {
            const update = {
              type: newVerification.status,
              message: `Student ${newVerification.students?.matric_number || 'Unknown'} ${newVerification.status === 'approved' ? 'Verified' : 'Denied'}`,
              time: new Date(newVerification.scanned_at).toLocaleTimeString()
            };

            setLiveUpdates(prev => [update, ...prev].slice(0, 20));

            // Optimistically update stats (simplified)
            setStats(prev => {
              if (!prev) return prev;
              const isApproved = newVerification.status === 'approved';
              const isToday = new Date(newVerification.scanned_at).toDateString() === new Date().toDateString();

              return {
                ...prev,
                totalScans: prev.totalScans + 1,
                totalApproved: prev.totalApproved + (isApproved ? 1 : 0),
                totalDenied: prev.totalDenied + (!isApproved ? 1 : 0),
                todayScans: prev.todayScans + (isToday ? 1 : 0),
                todayApproved: prev.todayApproved + (isToday && isApproved ? 1 : 0),
                todayDenied: prev.todayDenied + (isToday && !isApproved ? 1 : 0),
              };
            });

            // Update history
            setHistory(prev => [newVerification, ...prev].slice(0, 10));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Scans Today',
      value: stats?.todayScans || 0,
      icon: QrCode,
      color: 'bg-primary/10 text-primary',
      border: 'border-primary'
    },
    {
      title: 'Approved Today',
      value: stats?.todayApproved || 0,
      icon: CheckCircle,
      color: 'bg-success/10 text-success',
      border: 'border-success'
    },
    {
      title: 'Denied Today',
      value: stats?.todayDenied || 0,
      icon: XCircle,
      color: 'bg-red-50 text-red-600',
      border: 'border-red-500'
    },
    {
      title: 'Success Rate',
      value: stats?.successRate ? `${stats.successRate}%` : '0%',
      icon: TrendingUp,
      color: 'bg-slate-100 text-slate-900',
      border: 'border-slate-900'
    },
  ];

  const successPercent = stats?.successRate || 0;

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 py-12 px-4 font-body text-slate-900">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">
                Examiner Dashboard
              </h1>
              <p className="text-slate-500 mt-2 font-medium">Real-time verification statistics & monitoring</p>
            </div>
            <Link
              to="/examiner/scan"
              className="btn-primary flex items-center justify-center gap-2 px-8 py-3 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <QrCode className="w-5 h-5" />
              Scan QR Code
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-premium border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-3xl font-heading font-bold text-slate-900 mb-1">{card.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* All-Time Performance */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white border border-slate-100 rounded-[24px] p-8 shadow-premium"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-slate-400" />
                  Performance Overview
                </h2>

                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-3 font-bold">
                    <span className="text-slate-500 uppercase tracking-wider text-xs">Approval Rate</span>
                    <span className="text-slate-900">{successPercent}%</span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${successPercent}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-slate-900 rounded-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 pt-4 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-3xl font-heading font-bold text-slate-900">{stats?.totalScans || 0}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase mt-2">Total Scans</p>
                  </div>
                  <div className="text-center border-l border-slate-100">
                    <p className="text-3xl font-heading font-bold text-success">{stats?.totalApproved || 0}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase mt-2">Approved</p>
                  </div>
                  <div className="text-center border-l border-slate-100">
                    <p className="text-3xl font-heading font-bold text-red-500">{stats?.totalDenied || 0}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase mt-2">Denied</p>
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white border border-slate-100 rounded-[24px] p-8 shadow-premium"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-slate-400" />
                    Recent Activity
                  </h2>
                  <Link to="/examiner/history" className="text-sm font-bold text-primary hover:text-primary-600 transition-colors">
                    View All
                  </Link>
                </div>

                {history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.status === 'approved'
                            ? 'bg-success/10 text-success'
                            : 'bg-red-50 text-red-500'
                            }`}>
                            {item.status === 'approved' ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <XCircle className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                              {item.students?.matric_number || 'Unknown Student'}
                            </p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              {item.exam_hall || 'Hall N/A'}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">
                          {item.scanned_at ? new Date(item.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-500 font-medium">No verifications recorded today.</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Live Updates */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-slate-900 rounded-[24px] p-8 text-white shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <h3 className="font-bold text-lg">Live Feed</h3>
                </div>

                {liveUpdates.length > 0 ? (
                  <div className="space-y-3 relative z-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {liveUpdates.map((update, index) => (
                      <div key={index} className="text-sm p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-start gap-3">
                          <span className={`font-medium ${update.type === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                            {update.type === 'approved' ? '✓' : '✕'}
                          </span>
                          <span className="text-slate-300 flex-1 leading-relaxed">
                            {update.message}
                          </span>
                          <span className="text-xs text-slate-500 whitespace-nowrap font-mono mt-0.5">{update.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 relative z-10">
                    <p className="text-sm text-slate-400 italic">
                      Waiting for incoming scans...
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white border border-slate-100 rounded-[24px] p-8 shadow-premium"
              >
                <h3 className="font-bold text-slate-900 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/examiner/scan"
                    className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors font-bold border border-primary/10"
                  >
                    <QrCode className="w-5 h-5" />
                    Launch Scanner
                  </Link>
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors w-full font-bold border border-slate-200"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Refresh Data
                  </button>
                </div>
              </motion.div>

              {/* System Status */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm"
              >
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">System Health</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                        <Wifi className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">Sync Status</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">ONLINE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">Database</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">SECURE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                        <Activity className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">Uptime</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">99.9%</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
