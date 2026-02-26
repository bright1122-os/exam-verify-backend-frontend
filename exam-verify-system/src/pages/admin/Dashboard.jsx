import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfDay } from 'date-fns';
import {
  Users,
  CheckCircle,
  Clock,
  QrCode,
  Search,
  BarChart3,
  TrendingUp,
  Shield,
  Download,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PageTransition } from '../../components/layout/PageTransition';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

// Simple SVG Bar Chart component
const BarChart = ({ data, height = 180 }) => {
  if (!data || data.length === 0) return null;
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.min(40, (100 / data.length) * 0.6);
  const gap = (100 - barWidth * data.length) / (data.length + 1);

  return (
    <svg viewBox={`0 0 400 ${height}`} className="w-full" style={{ height }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <g key={ratio}>
          <line
            x1="40" y1={height - 30 - (height - 50) * ratio}
            x2="395" y2={height - 30 - (height - 50) * ratio}
            stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4,4"
          />
          <text
            x="35" y={height - 26 - (height - 50) * ratio}
            textAnchor="end" fontSize="9" fill="#9ca3af"
          >
            {Math.round(maxValue * ratio)}
          </text>
        </g>
      ))}
      {/* Bars */}
      {data.map((item, index) => {
        const barH = (item.value / maxValue) * (height - 50);
        const x = 45 + index * ((350) / data.length) + ((350 / data.length) - barWidth * 3.5) / 2;
        return (
          <g key={index}>
            <motion.rect
              initial={{ height: 0, y: height - 30 }}
              animate={{ height: barH, y: height - 30 - barH }}
              transition={{ delay: index * 0.05, duration: 0.5, ease: 'easeOut' }}
              x={x}
              width={barWidth * 3.5}
              rx="4"
              fill="url(#barGradient)"
              opacity="0.9"
            />
            <text
              x={x + (barWidth * 3.5) / 2}
              y={height - 15}
              textAnchor="middle"
              fontSize="8"
              fill="#6b7280"
              fontFamily="system-ui"
            >
              {item.label}
            </text>
            {item.value > 0 && (
              <motion.text
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 + 0.5 }}
                x={x + (barWidth * 3.5) / 2}
                y={height - 34 - barH}
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fill="#374151"
              >
                {item.value}
              </motion.text>
            )}
          </g>
        );
      })}
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Donut chart component
const DonutChart = ({ segments, size = 140 }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox="0 0 120 120">
        {segments.map((segment, i) => {
          const ratio = segment.value / total;
          const dashLength = ratio * circumference;
          const currentOffset = offset;
          offset += dashLength;
          return (
            <motion.circle
              key={i}
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="18"
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={-currentOffset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              transform="rotate(-90 60 60)"
            />
          );
        })}
        <text x="60" y="56" textAnchor="middle" fontSize="18" fontWeight="700" fill="#141413">
          {total}
        </text>
        <text x="60" y="70" textAnchor="middle" fontSize="8" fill="#9ca3af">
          Total
        </text>
      </svg>
      <div className="space-y-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-stone font-heading">{s.label}: <strong className="text-anthracite">{s.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mock data fallback
const mockStudents = [
  { id: 'STU-001', name: 'John Doe', matricNumber: 'CSC/2020/001', department: 'Computer Science', level: '400', course: 'CSC 401', paymentVerified: true, qrGenerated: true, registeredAt: '2025-01-15T10:30:00Z' },
  { id: 'STU-002', name: 'Jane Smith', matricNumber: 'CSC/2020/002', department: 'Computer Science', level: '400', course: 'CSC 401', paymentVerified: true, qrGenerated: true, registeredAt: '2025-01-15T11:00:00Z' },
  { id: 'STU-003', name: 'Mike Johnson', matricNumber: 'IT/2021/015', department: 'Information Technology', level: '300', course: 'IT 301', paymentVerified: true, qrGenerated: false, registeredAt: '2025-01-16T09:00:00Z' },
  { id: 'STU-004', name: 'Sarah Williams', matricNumber: 'SE/2020/008', department: 'Software Engineering', level: '400', course: 'SE 402', paymentVerified: false, qrGenerated: false, registeredAt: '2025-01-16T14:30:00Z' },
  { id: 'STU-005', name: 'David Brown', matricNumber: 'CSC/2021/020', department: 'Computer Science', level: '300', course: 'CSC 301', paymentVerified: true, qrGenerated: true, registeredAt: '2025-01-17T08:15:00Z' },
  { id: 'STU-006', name: 'Emily Davis', matricNumber: 'EE/2020/003', department: 'Electrical Engineering', level: '400', course: 'EE 405', paymentVerified: true, qrGenerated: true, registeredAt: '2025-01-17T10:45:00Z' },
  { id: 'STU-007', name: 'Chris Wilson', matricNumber: 'ME/2021/011', department: 'Mechanical Engineering', level: '300', course: 'ME 302', paymentVerified: false, qrGenerated: false, registeredAt: '2025-01-18T13:00:00Z' },
  { id: 'STU-008', name: 'Lisa Anderson', matricNumber: 'BA/2020/005', department: 'Business Administration', level: '400', course: 'BA 401', paymentVerified: true, qrGenerated: true, registeredAt: '2025-01-18T15:30:00Z' },
];

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [students, setStudents] = useState(mockStudents);
  const [loading, setLoading] = useState(true);
  const [registrationTrend, setRegistrationTrend] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students (students.user_id → auth.users, no direct FK to profiles — query separately)
        const { data: supaStudents, error } = await supabase
          .from('students')
          .select('id, user_id, matric_number, department, faculty, level, payment_verified, qr_generated, registration_complete, created_at')
          .order('created_at', { ascending: false });

        if (!error && supaStudents && supaStudents.length > 0) {
          // Fetch matching profiles in one batch (profiles.id = students.user_id = auth.users.id)
          const userIds = supaStudents.map(s => s.user_id);
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

          const profileMap = {};
          profilesData?.forEach(p => { profileMap[p.id] = p; });

          const mapped = supaStudents.map((s) => ({
            id: s.id,
            name: profileMap[s.user_id]?.full_name || 'N/A',
            matricNumber: s.matric_number,
            department: s.department,
            level: s.level,
            course: `${s.department?.substring(0, 3).toUpperCase() || 'GEN'} ${s.level}01`,
            paymentVerified: s.payment_verified,
            qrGenerated: s.qr_generated,
            registeredAt: s.created_at,
          }));
          setStudents(mapped);
        }
        // If Supabase fails or returns empty, keep mock data

        // Build registration trend (last 7 days)
        const trend = [];
        const allData = students.length > 0 ? students : mockStudents;
        for (let i = 6; i >= 0; i--) {
          const day = startOfDay(subDays(new Date(), i));
          const nextDay = startOfDay(subDays(new Date(), i - 1));
          const count = allData.filter(s => {
            if (!s.registeredAt) return false;
            const d = new Date(s.registeredAt);
            return d >= day && d < nextDay;
          }).length;
          trend.push({
            label: format(day, 'EEE'),
            value: count,
          });
        }
        setRegistrationTrend(trend);
      } catch (error) {
        console.error('Admin dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(() => ({
    total: students.length,
    verified: students.filter(s => s.paymentVerified).length,
    pending: students.filter(s => !s.paymentVerified).length,
    qrGenerated: students.filter(s => s.qrGenerated).length,
  }), [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch =
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.matricNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'verified' && student.paymentVerified) ||
        (filterStatus === 'pending' && !student.paymentVerified) ||
        (filterStatus === 'qr' && student.qrGenerated);

      return matchesSearch && matchesFilter;
    });
  }, [students, searchTerm, filterStatus]);

  const handleExportCSV = () => {
    const headers = ['Name', 'Matric Number', 'Department', 'Level', 'Payment', 'QR Code', 'Date'];
    const rows = filteredStudents.map(s => [
      s.name,
      s.matricNumber,
      s.department,
      s.level,
      s.paymentVerified ? 'Verified' : 'Pending',
      s.qrGenerated ? 'Generated' : 'Not Yet',
      s.registeredAt ? format(new Date(s.registeredAt), 'yyyy-MM-dd') : 'N/A',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `examverify-students-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    { label: 'Total Students', value: stats.total, icon: Users, color: 'text-terracotta', bg: 'bg-terracotta/10' },
    { label: 'Payment Verified', value: stats.verified, icon: CheckCircle, color: 'text-sage', bg: 'bg-sage/10' },
    { label: 'Pending Payment', value: stats.pending, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'QR Generated', value: stats.qrGenerated, icon: QrCode, color: 'text-anthracite', bg: 'bg-stone/20' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-parchment pt-28 pb-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 border-b border-sand pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-heading font-bold text-anthracite mb-2">
                Admin Dashboard
              </h1>
              <p className="text-stone font-body">
                Overview of student registrations and verifications
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-anthracite text-parchment text-sm font-bold rounded-xl hover:bg-anthracite/90 transition-all self-start"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="card">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-3xl font-heading font-bold text-anthracite">
                          {stat.value}
                        </p>
                        <p className="text-xs font-heading font-medium text-stone uppercase tracking-wide">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="card">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-terracotta" />
                  <h3 className="font-heading font-semibold text-anthracite">Registration Trend (Last 7 Days)</h3>
                </div>
                <BarChart data={registrationTrend} height={200} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="card">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-terracotta" />
                  <h3 className="font-heading font-semibold text-anthracite">Verification Status</h3>
                </div>
                <div className="flex items-center justify-center py-4">
                  <DonutChart
                    segments={[
                      { label: 'Verified & QR', value: students.filter(s => s.paymentVerified && s.qrGenerated).length, color: '#10B981' },
                      { label: 'Verified Only', value: students.filter(s => s.paymentVerified && !s.qrGenerated).length, color: '#3B82F6' },
                      { label: 'Pending', value: stats.pending, color: '#F59E0B' },
                    ]}
                  />
                </div>
                {/* Progress bars */}
                <div className="space-y-4 mt-4 pt-4 border-t border-sand">
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-heading">
                      <span className="text-stone">Payment Verified</span>
                      <span className="font-medium text-anthracite">
                        {stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-sand/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.total > 0 ? (stats.verified / stats.total) * 100 : 0}%` }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className="h-full bg-sage rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-heading">
                      <span className="text-stone">QR Generated</span>
                      <span className="font-medium text-anthracite">
                        {stats.total > 0 ? Math.round((stats.qrGenerated / stats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-sand/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.total > 0 ? (stats.qrGenerated / stats.total) * 100 : 0}%` }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="h-full bg-anthracite rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Student Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="card overflow-hidden !p-0">
              <div className="p-6 border-b border-sand bg-parchment">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-heading font-semibold text-anthracite">
                    Registered Students ({filteredStudents.length})
                  </h3>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:w-64 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
                      <input
                        className="input-field pl-10 py-2"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      className="input-field w-auto py-2"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="verified">Verified</option>
                      <option value="pending">Pending</option>
                      <option value="qr">QR Generated</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto bg-white">
                <table className="w-full">
                  <thead>
                    <tr className="bg-sand/20 border-b border-sand">
                      <th className="text-left px-6 py-4 text-xs font-heading font-semibold text-stone uppercase tracking-wider">Student</th>
                      <th className="text-left px-6 py-4 text-xs font-heading font-semibold text-stone uppercase tracking-wider">Matric No.</th>
                      <th className="text-left px-6 py-4 text-xs font-heading font-semibold text-stone uppercase tracking-wider hidden md:table-cell">Department</th>
                      <th className="text-left px-6 py-4 text-xs font-heading font-semibold text-stone uppercase tracking-wider">Payment</th>
                      <th className="text-left px-6 py-4 text-xs font-heading font-semibold text-stone uppercase tracking-wider hidden sm:table-cell">QR Code</th>
                      <th className="text-left px-6 py-4 text-xs font-heading font-semibold text-stone uppercase tracking-wider hidden lg:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-sand/10 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-anthracite rounded-full flex items-center justify-center">
                              <span className="text-parchment text-xs font-bold font-heading">
                                {student.name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-heading font-medium text-anthracite text-sm">{student.name}</p>
                              <p className="text-xs text-stone font-body">{student.course}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-stone font-mono">{student.matricNumber}</span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="text-sm text-stone font-body">{student.department}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={student.paymentVerified ? 'success' : 'pending'}>
                            {student.paymentVerified ? 'Verified' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <Badge status={student.qrGenerated ? 'success' : 'pending'}>
                            {student.qrGenerated ? 'Generated' : 'Not Yet'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="text-sm text-stone font-body">
                            {student.registeredAt ? format(new Date(student.registeredAt), 'MMM dd, yyyy') : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredStudents.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-stone/30 mx-auto mb-4" />
                    <p className="text-stone font-body">No students found matching your filters</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
