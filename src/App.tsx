import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<PageTransition><ProtectedRoute><Dashboard /></ProtectedRoute></PageTransition>} />
            <Route path="/stations" element={<PageTransition><ProtectedRoute><Stations /></ProtectedRoute></PageTransition>} />
            <Route path="/trial-days" element={<PageTransition><ProtectedRoute><TrialDays /></ProtectedRoute></PageTransition>} />
            <Route path="/participants" element={<PageTransition><ProtectedRoute><Participants /></ProtectedRoute></PageTransition>} />
            <Route path="/check-in/:qrId" element={<PageTransition><CheckIn /></PageTransition>} />
            <Route path="/audit" element={<PageTransition><ProtectedRoute><Audit /></ProtectedRoute></PageTransition>} />
            <Route path="/admin" element={<PageTransition><ProtectedRoute><Admin /></ProtectedRoute></PageTransition>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
