
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { pbClient } from "@/lib/pb-client";

import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import CensusPage from "./pages/CensusPage";
import SuccessPage from "./pages/SuccessPage";
import DashboardPage from "./pages/DashboardPage";
import TableViewPage from "./pages/TableViewPage";
import SettingsPage from "./pages/SettingsPage";
import AboutPage from "./pages/AboutPage";
import ConsolidatedDashboardPage from "./pages/ConsolidatedDashboardPage";
import NotFound from "./pages/NotFound";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";

const queryClient = new QueryClient();

// Auth guard component
const AuthRoute = ({ element }: { element: JSX.Element }) => {
  const isAuthenticated = pbClient.auth.isLoggedIn();
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const LoginRoute = () => {
  const isAuthenticated = pbClient.auth.isLoggedIn();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />;
};

const AppRoutes = () => {
  const navigate = useNavigate();

  useInactivityLogout(() => {
    if (pbClient.auth.isLoggedIn()) {
      pbClient.auth.logout(); // logout user
      alert("You have been logged out due to 30 minutes of inactivity.");
      navigate("/login", { replace: true });
    }
  });

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/dashboard/census" element={<AuthRoute element={<CensusPage />} />} />
      <Route path="/dashboard/table" element={<AuthRoute element={<TableViewPage />} />} />
      <Route path="/dashboard/consolidated" element={<AuthRoute element={<ConsolidatedDashboardPage />} />} />
      <Route path="/dashboard/settings" element={<AuthRoute element={<SettingsPage />} />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/dashboard" element={<AuthRoute element={<DashboardPage />} />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/census" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
