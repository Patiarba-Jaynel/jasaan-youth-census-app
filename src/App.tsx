
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { pbClient } from "@/lib/pb-client";

import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import CensusPage from "./pages/CensusPage";
import SuccessPage from "./pages/SuccessPage";
import DashboardPage from "./pages/DashboardPage";
import TableViewPage from "./pages/TableViewPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Auth guard component to handle redirects
const AuthRoute = ({ element }: { element: JSX.Element }) => {
  const isAuthenticated = pbClient.auth.isLoggedIn();
  
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const LoginRoute = () => {
  const isAuthenticated = pbClient.auth.isLoggedIn();
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard/census" element={<AuthRoute element={<CensusPage />} />} />
          <Route path="/dashboard/table" element={<AuthRoute element={<TableViewPage />} />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/dashboard" element={<AuthRoute element={<DashboardPage />} />} />
          <Route path="/about" element={<AboutPage />} />
          {/* Redirect census path to login */}
          <Route path="/census" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
