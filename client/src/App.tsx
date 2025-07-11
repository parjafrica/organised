import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IntelligentAssistantUI, AssistantFloatingButton } from './shared/IntelligentAssistantUI';
import { intelligentAssistant } from './services/intelligentAssistant';
import Header from './shared/Header';
import Sidebar from './shared/Sidebar';
import Dashboard from './Dashboard';
import PersonalizedDashboard from './PersonalizedDashboard';
import DonorDashboard from './DonorDashboard';
import DonorDiscovery from './DonorDiscovery';
import ProposalManager from './ProposalManager';
import ProposalGenerator from './ProposalGenerator';
import ProjectManager from './ProjectManager';
import AIAssistant from './AIAssistant';
import Settings from './Settings';
import Funding from './Funding';
import Documents from './Documents';
import Analytics from './Analytics';
import CreditsPurchase from './CreditsPurchase';
import NGOPipeline from './NGOPipeline';

import MobileNavigation from './shared/MobileNavigation';
import StudentNavigation from './StudentNavigation';


import LandingPage from './LandingPage';
import StudentDashboard from './StudentDashboard';
import StandaloneBusinessDashboard from './pages/StandaloneBusinessDashboard';
import HumanHelpPage from './HumanHelpPage';
import CreditsPage from './CreditsPage';
import PurchasePage from './PurchasePage';
import OnboardPageFixed from './OnboardPageFixed';
import IntelligentOnboardingSystem from './IntelligentOnboardingSystem';
import ChatOnboardingNew from './ChatOnboardingNew';
import NotFoundPage from './NotFoundPage';
import L1Page from './L1Page';
import GenesisEngine from './GenesisEngine';
import CareerSuite from './CareerSuite';
import AcademicSuite from './AcademicSuite';
import HumanHelpButton from './shared/HumanHelpButton';
import OpportunitiesPage from './OpportunitiesPage';
import AnalyticsPage from './AnalyticsPage';
import MatchingPage from './MatchingPage';
import AcademicWritingPage from './pages/AcademicWritingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TestPage from './pages/TestPage';
import HelpDemoPage from './pages/HelpDemoPage';

import AddictionProvider from './contexts/AddictionContext';
import { HelpProvider } from './contexts/HelpContext';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MoodThemeProvider } from './components/MoodThemeProvider';
import { useAuth } from './hooks/useAuth';

// Create a client outside of component to avoid recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  
  // Initialize intelligent assistant
  useEffect(() => {
    // Activate the intelligent assistant after component mounts
    intelligentAssistant.setActive(true);
    return () => {
      intelligentAssistant.setActive(false);
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <MoodThemeProvider>
        <AddictionProvider>
          <HelpProvider>
            <Router />
          </HelpProvider>
        </AddictionProvider>
      </MoodThemeProvider>
    </QueryClientProvider>
  );
}

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Initialize intelligent assistant
  useEffect(() => {
    intelligentAssistant.setActive(true);
    return () => {
      intelligentAssistant.setActive(false);
    };
  }, []);

  // Check if user is a student - properly typed with User interface
  const isStudent = user?.userType === 'student';

  // Show loading while authentication state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication pages for unauthenticated users
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen safari-fix" style={{ background: 'var(--theme-background)' }}>
      {/* Only show header for NGO users, not students */}
      {!isStudent && <Header />}
              
              <div className="flex">
                {/* Only show sidebar for NGO users, not students */}
                {!isStudent && (
                  <Sidebar 
                    collapsed={sidebarCollapsed} 
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
                  />
                )}
                
                <main className={`flex-1 transition-all duration-300 ${
                  isStudent ? 'pt-0 pb-16 ml-0' : 'pt-16 pb-16 md:pb-0 ' + (sidebarCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-72')
                }`}>
                  <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <Routes>
                    <Route path="/" element={isStudent ? <StudentDashboard /> : <PersonalizedDashboard />} />
                    <Route path="/dashboard" element={<PersonalizedDashboard />} />
                    <Route path="/donor-dashboard" element={<DonorDashboard />} />
                    <Route path="/student" element={<StudentDashboard />} />
                    <Route path="/donor-discovery" element={<DonorDiscovery />} />
                    <Route path="/proposal-generator" element={<ProposalGenerator />} />
                    <Route path="/proposals" element={<ProposalManager />} />
                    <Route path="/projects" element={<ProjectManager />} />
                    <Route path="/ai-assistant" element={<AIAssistant />} />
                    <Route path="/human-help" element={<HumanHelpPage />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/funding" element={<Funding />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/credits" element={<CreditsPage />} />
                    <Route path="/purchase/:packageId" element={<PurchasePage />} />
                    <Route path="/credits-purchase/:packageId" element={<CreditsPurchase />} />
                    <Route path="/ngo-pipeline" element={<NGOPipeline />} />
                    <Route path="/onboard-intelligent" element={<IntelligentOnboardingSystem />} />
                    <Route path="/onboard" element={<ChatOnboardingNew />} />
                    <Route path="/l1" element={<L1Page />} />
                    <Route path="/genesis" element={<GenesisEngine />} />
                    <Route path="/career" element={<CareerSuite />} />
                    <Route path="/academic" element={<AcademicSuite />} />
                    <Route path="/academic-writing" element={<AcademicWritingPage />} />
                    <Route path="/business" element={<StandaloneBusinessDashboard />} />
                    
                    {/* Auth pages for preview */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/test" element={<TestPage />} />
                    <Route path="/help-demo" element={<HelpDemoPage />} />
                    
                    {/* New Dynamic Pages */}
                    <Route path="/opportunities" element={<OpportunitiesPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/matching" element={<MatchingPage />} />
                    <Route path="/opportunity/:id" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Opportunity Details</h1><p>Individual opportunity view coming soon...</p></div>} />
                    
                    {/* FastAPI Engine Routes */}
                    <Route path="/orchestrator" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold mb-4">Master Orchestrator</h1><p>Central AI coordination service coming soon...</p><a href="http://localhost:8000/docs" className="text-blue-600 hover:underline" target="_blank">View API Documentation</a></div>} />
                    <Route path="/bots" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold mb-4">Bot Service</h1><p>Web scraping and automation bots...</p><a href="http://localhost:8001/docs" className="text-blue-600 hover:underline" target="_blank">View API Documentation</a></div>} />
                    <Route path="/health" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold mb-4">Service Health</h1><p>Monitor all FastAPI services...</p><a href="http://localhost:8000/health" className="text-blue-600 hover:underline" target="_blank">Check Service Health</a></div>} />
                    <Route path="/database" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold mb-4">Database</h1><p>Granada OS database management...</p></div>} />
                    
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </div>
                </main>
              </div>
              
              {/* Mobile Navigation - Conditional based on user type */}
              {isStudent ? <StudentNavigation /> : <MobileNavigation />}
              
              {/* Human Help Button */}
              <HumanHelpButton />
              
      {/* Intelligent Assistant System */}
      <IntelligentAssistantUI />
      <AssistantFloatingButton />
    </div>
  );
}

export default App;