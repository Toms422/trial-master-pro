import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import PageTransition from "./components/PageTransition";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Stations from "./pages/Stations";
import TrialDays from "./pages/TrialDays";
import Participants from "./pages/Participants";
import CheckIn from "./pages/CheckIn";
import Audit from "./pages/Audit";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary level="app">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ErrorBoundary level="page" pageName="Dashboard"><PageTransition><ProtectedRoute><Dashboard /></ProtectedRoute></PageTransition></ErrorBoundary>} />
              <Route path="/stations" element={<ErrorBoundary level="page" pageName="Stations"><PageTransition><ProtectedRoute><Stations /></ProtectedRoute></PageTransition></ErrorBoundary>} />
              <Route path="/trial-days" element={<ErrorBoundary level="page" pageName="Trial Days"><PageTransition><ProtectedRoute><TrialDays /></ProtectedRoute></PageTransition></ErrorBoundary>} />
              <Route path="/participants" element={<ErrorBoundary level="page" pageName="Participants"><PageTransition><ProtectedRoute><Participants /></ProtectedRoute></PageTransition></ErrorBoundary>} />
              <Route path="/check-in/:qrId" element={<ErrorBoundary level="page" pageName="Check-In"><PageTransition><CheckIn /></PageTransition></ErrorBoundary>} />
              <Route path="/audit" element={<ErrorBoundary level="page" pageName="Audit"><PageTransition><ProtectedRoute><Audit /></ProtectedRoute></PageTransition></ErrorBoundary>} />
              <Route path="/admin" element={<ErrorBoundary level="page" pageName="Admin"><PageTransition><ProtectedRoute><Admin /></ProtectedRoute></PageTransition></ErrorBoundary>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
