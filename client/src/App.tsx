import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Welcome from "./pages/Welcome";
import Onboarding from "./pages/Onboarding";
import CreatePlaylist from "./pages/CreatePlaylist";
import GeneratePlaylist from "./pages/GeneratePlaylist";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import AnalyzeHistory from "./pages/AnalyzeHistory";
import Result from "./pages/Result";
import Explore from "./pages/Explore";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Welcome} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/create" component={CreatePlaylist} />
      <Route path="/generating" component={GeneratePlaylist} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/analyze-history" component={AnalyzeHistory} />
      <Route path="/result" component={Result} />
      <Route path="/explore" component={Explore} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
