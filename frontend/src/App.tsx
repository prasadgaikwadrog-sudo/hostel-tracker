import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { getToken } from "@/lib/auth";

import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import ComplaintsPage from "@/pages/complaints/index";
import NewComplaintPage from "@/pages/complaints/new";
import ComplaintDetailPage from "@/pages/complaints/detail";
import TrackComplaintPage from "@/pages/track";
import AdminDashboardPage from "@/pages/admin/index";
import AdminComplaintsPage from "@/pages/admin/complaints";
import AdminComplaintDetailPage from "@/pages/admin/complaint-detail";
import WeeklyReportPage from "@/pages/admin/weekly-report";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to={getToken() ? "/dashboard" : "/login"} />} />
      <Route path="/login" component={LoginPage} />
      <Route path="/track/:id" component={TrackComplaintPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/complaints" component={ComplaintsPage} />
      <Route path="/complaints/new" component={NewComplaintPage} />
      <Route path="/complaints/:id" component={ComplaintDetailPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/admin/complaints" component={AdminComplaintsPage} />
      <Route path="/admin/complaints/:id" component={AdminComplaintDetailPage} />
      <Route path="/admin/weekly-report" component={WeeklyReportPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
