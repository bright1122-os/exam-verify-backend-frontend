import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/layout/Navbar';
import { useStore } from './store/useStore';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Pages
import Home from './pages/Home';
import AuthCallback from './pages/auth/AuthCallback';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentRegister from './pages/student/Register';
import PrintQR from './pages/student/PrintQR';

// Examiner Pages
import ExaminerDashboard from './pages/examiner/Dashboard';
import ScanPortal from './pages/examiner/ScanPortal';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, userType, loading } = useStore();

  if (loading) return <div className="min-h-screen bg-parchment flex items-center justify-center"><LoadingSpinner /></div>;

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userType)) {
    return <Navigate to="/" replace />; // Or unauthorized page
  }

  return children;
};

function App() {
  const { initializeAuth, loading } = useStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (loading) {
    return <div className="min-h-screen bg-parchment flex items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 transition-colors">
        <Navbar />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Student Routes */}
          <Route path="/student/register" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentRegister />
            </ProtectedRoute>
          } />
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/qr-code" element={
            <ProtectedRoute allowedRoles={['student']}>
              <PrintQR />
            </ProtectedRoute>
          } />

          {/* Examiner Routes */}
          <Route path="/examiner/dashboard" element={
            <ProtectedRoute allowedRoles={['examiner', 'admin']}>
              <ExaminerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/examiner/scan" element={
            <ProtectedRoute allowedRoles={['examiner', 'admin']}>
              <ScanPortal />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#141413',
              color: '#faf9f5',
              fontFamily: 'font-heading',
              borderRadius: '12px',
              border: '1px solid #e8e6dc',
            },
            success: {
              iconTheme: { primary: '#788c5d', secondary: '#faf9f5' },
            },
            error: {
              iconTheme: { primary: '#d97757', secondary: '#faf9f5' },
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
