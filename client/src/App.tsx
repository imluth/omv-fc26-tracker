import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import RecordMatch from "@/pages/record-match";
import Players from "@/pages/players";
import AdminLogin from "@/pages/admin-login";
import NotFound from "@/pages/not-found";
import { useStore } from "@/lib/api-store";
import { useEffect } from "react";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/record" component={RecordMatch} />
        <Route path="/players" component={Players} />
        <Route path="/admin" component={AdminLogin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const { fetchPlayers, fetchMatches, checkAuth } = useStore();

  useEffect(() => {
    // Initialize data on app mount
    checkAuth();
    fetchPlayers();
    fetchMatches();
  }, [checkAuth, fetchPlayers, fetchMatches]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <Router />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
