import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "@/context/PlayerContext";
import Index from "./pages/Index";
import CoachPanel from "./pages/CoachPanel";
import PlayerPanel from "./pages/PlayerPanel";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import ComparisonPage from "./pages/ComparisonPage";
import SimulationPage from "./pages/SimulationPage";
import PredictionsPage from "./pages/PredictionsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PlayerProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/coach" element={<CoachPanel />} />
            <Route path="/player" element={<PlayerPanel />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="/simulation" element={<SimulationPage />} />
            <Route path="/predictions" element={<PredictionsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PlayerProvider>
  </QueryClientProvider>
);

export default App;
