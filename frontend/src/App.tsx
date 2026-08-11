import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// ── Existing pages (not lazy — they are the core app) ─────────────────────
import { MainLayout } from "./components/layout/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { MyDrive } from "./pages/MyDrive";
import { FolderPage } from "./pages/FolderPage";
import { SearchPage } from "./pages/SearchPage";
import { AIPage } from "./pages/AIPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ErrorPage } from "./pages/ErrorPage";
import { RecentPage } from "./pages/RecentPage";

// ── Route guards ──────────────────────────────────────────────────────────
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PublicRoute } from "./routes/PublicRoute";

// ── New entry pages (lazy loaded — not part of the critical app bundle) ────
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const OAuthCallbackPage = lazy(() => import("./pages/OAuthCallbackPage"));

// ─── QueryClient ──────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
});

// ─── Page loading fallback ────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-200 animate-pulse">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none">
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Public routes (redirect to / if already authenticated) ── */}
            <Route element={<PublicRoute />}>
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
            </Route>

            {/* ── OAuth2 callback — no guard, backend handles the redirect ── */}
            <Route path="/oauth2/redirect" element={<OAuthCallbackPage />} />

            {/* ── Protected app routes ─────────────────────────────────── */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />} errorElement={<ErrorPage />}>
                <Route index element={<Dashboard />} />
                <Route path="drive" element={<MyDrive />} />
                <Route path="folder/:id" element={<FolderPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="ai" element={<AIPage />} />
                {/* Alias routes */}
                <Route path="recent" element={<RecentPage />} />
                <Route path="dashboard" element={<Navigate to="/" replace />} />
                <Route
                  path="profile"
                  element={<ProfilePage />}
                />
                {/* 404 inside app layout */}
                <Route path="*" element={<ErrorPage />} />
              </Route>
            </Route>

            {/* ── Top-level 404 ─────────────────────────────────────────── */}
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster richColors position="bottom-right" />
    </QueryClientProvider>
  );
}

export default App;
