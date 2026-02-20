import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Users,
  CheckCircle,
  Clock,
  QrCode,
  Search,
  BarChart3,
  TrendingUp,
  Shield
} from 'lucide-react';
import { PageTransition } from '../../components/layout/PageTransition';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../store/useStore';

// Mock data for admin dashboard
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
  const { registeredStudents } = useStore();

  const allStudents = [...mockStudents, ...registeredStudents];

  const stats = useMemo(() => ({
    total: allStudents.length,
    verified: allStudents.filter(s => s.paymentVerified).length,
    pending: allStudents.filter(s => !s.paymentVerified).length,
    qrGenerated: allStudents.filter(s => s.qrGenerated).length,
  }), [allStudents]);

  const filteredStudents = useMemo(() => {
    return allStudents.filter(student => {
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
  }, [allStudents, searchTerm, filterStatus]);

  const statCards = [
    { label: 'Total Students', value: stats.total, icon: Users, color: 'text-terracotta', bg: 'bg-terracotta/10' },
    { label: 'Payment Verified', value: stats.verified, icon: CheckCircle, color: 'text-sage', bg: 'bg-sage/10' },
    { label: 'Pending Payment', value: stats.pending, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'QR Generated', value: stats.qrGenerated, icon: QrCode, color: 'text-anthracite', bg: 'bg-stone/20' },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-parchment py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 border-b border-sand pb-6"
          >
            <h1 className="text-3xl font-heading font-bold text-anthracite mb-2">
              Admin Dashboard
            </h1>
            <p className="text-stone font-body">
              Overview of student registrations and verifications
            </p>
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

          {/* Charts Placeholder */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="card">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-terracotta" />
                  <h3 className="font-heading font-semibold text-anthracite">Registration Trend</h3>
                </div>
                <div className="h-48 flex items-center justify-center bg-sand/10 rounded-lg border border-sand border-dashed">
                  <div className="text-center">
                    <TrendingUp className="w-10 h-10 text-stone/50 mx-auto mb-2" />
                    <p className="text-sm text-stone font-body">Chart visualization placeholder</p>
                    <p className="text-xs text-stone/60 font-heading mt-1">Registrations over time</p>
                  </div>
                </div>
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
                <div className="h-48 flex items-center justify-center">
                  <div className="space-y-6 w-full">
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
                    <div>
                      <div className="flex justify-between text-sm mb-2 font-heading">
                        <span className="text-stone">Pending</span>
                        <span className="font-medium text-anthracite">
                          {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-sand/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                          transition={{ delay: 1, duration: 1 }}
                          className="h-full bg-warning rounded-full"
                        />
                      </div>
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
                    Registered Students
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
