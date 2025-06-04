
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner"

import Index from './pages/Index';
import AboutPage from './pages/AboutPage';
import CensusPage from './pages/CensusPage';
import SuccessPage from './pages/SuccessPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TableViewPage from './pages/TableViewPage';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';
import ConsolidatedDashboardPage from './pages/ConsolidatedDashboardPage';
import ConsolidatedActivityPage from "@/pages/ConsolidatedActivityPage";
import YouthActivityPage from './pages/YouthActivityPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/census" element={<CensusPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/table" element={<TableViewPage />} />
          <Route path="/dashboard/youth/activity" element={<YouthActivityPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="/dashboard/consolidated" element={<ConsolidatedDashboardPage />} />
          <Route path="/dashboard/consolidated/activity" element={<ConsolidatedActivityPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
