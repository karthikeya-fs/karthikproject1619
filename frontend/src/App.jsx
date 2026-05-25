import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { MessageProvider } from "./context/MessageContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PostItem from "./pages/PostItem";
import Navbar from "./components/Navbar";
import ItemDetails from "./pages/ItemDetails";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOtp";
import ReportLostItem from "./pages/ReportLostItem";
import ItemsList from "./pages/ItemsList";
import FoundItems from "./pages/FoundItems";
import LostReports from "./pages/LostReports";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import ChatLayout from "./layouts/ChatLayout";
import Messages from "./pages/Messages";
import AdminDashboard from "./pages/admin/AdminDashboard";
import HeroDemo from "./pages/HeroDemo";

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Loading…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin()) return <Navigate to="/home" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Loading…</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/home" replace />;
  return children;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/hero-demo" element={<HeroDemo />} />

      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/items" element={<ProtectedRoute><ItemsList /></ProtectedRoute>} />
      <Route path="/found-items" element={<ProtectedRoute><FoundItems /></ProtectedRoute>} />
      <Route path="/lost-reports" element={<ProtectedRoute><LostReports /></ProtectedRoute>} />
      <Route path="/post-item" element={<ProtectedRoute><PostItem /></ProtectedRoute>} />
      <Route path="/item/:id" element={<ProtectedRoute><ItemDetails /></ProtectedRoute>} />
      <Route path="/report-lost" element={<ProtectedRoute><ReportLostItem /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/:userId" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />

      <Route path="/messages" element={<ProtectedRoute><ChatLayout /></ProtectedRoute>}>
        <Route index element={<Messages />} />
        <Route path=":roomId" element={<Messages />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />

      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
            404 | Page Not Found
          </div>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: "14px", padding: "14px", fontSize: "0.875rem" },
        }}
      />
      <AuthProvider>
        <NotificationProvider>
          <MessageProvider>
            <Navbar />
            <main className="min-h-screen overflow-x-hidden">
              <AppRoutes />
            </main>
          </MessageProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
