import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { DashboardSkeleton, LabSkeleton } from "@/components/ui/page-skeleton";
import { LanguageProvider } from "@/contexts/LanguageContext";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ManageUsers = lazy(() => import("./pages/ManageUsers"));
const VirtualLab = lazy(() => import("./pages/VirtualLab"));
const SubjectLab = lazy(() => import("./pages/SubjectLab"));
const Textbooks = lazy(() => import("./pages/Textbooks"));
const TextbookReader = lazy(() => import("./pages/TextbookReader"));
const SuccessGuide = lazy(() => import("./pages/SuccessGuide"));
const Subscribe = lazy(() => import("./pages/Subscribe"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<DashboardSkeleton />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/manage-users" element={<ManageUsers />} />
                <Route path="/lab" element={<VirtualLab />} />
                <Route path="/lab/:subject" element={<SubjectLab />} />
                <Route path="/textbooks" element={<Textbooks />} />
                <Route path="/textbooks/:id" element={<TextbookReader />} />
                <Route path="/success-guide" element={<SuccessGuide />} />
                <Route path="/subscribe" element={<Subscribe />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  </ErrorBoundary>
);

export default App;
