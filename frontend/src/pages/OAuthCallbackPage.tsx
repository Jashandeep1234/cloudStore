import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/authService";

/**
 * OAuth2 Callback Page — /oauth2/redirect
 *
 * The backend redirects here after Google authentication with:
 *   ?accessToken=<jwt>&refreshToken=<token>&expiresIn=<ms>
 *
 * We read the params, store everything, fetch the user, then navigate to /.
 */
const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { login, logout } = useAuthStore();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const expiresIn = Number(params.get("expiresIn") ?? 3600);

    if (!accessToken || !refreshToken) {
      toast.error("Google login failed. Please try again.");
      navigate("/auth", { replace: true });
      return;
    }

    const tokens = { accessToken, refreshToken, expiresIn, tokenType: "Bearer" };

    // Clear any cached data from a previous session before the new user enters.
    queryClient.clear();

    // Temporarily set tokens so gatewayApi interceptor can attach them
    useAuthStore.setState({ accessToken, refreshToken });

    authService
      .getCurrentUser(tokens.accessToken)
      .then((user) => {
        login(tokens, user);
        toast.success(`Welcome, ${user.name}!`);
        navigate("/", { replace: true });
      })
      .catch(() => {
        // Could not fetch user but tokens are valid — still enter the app
        login(tokens, { id: 0, email: "", name: "User" });
        navigate("/", { replace: true });
      });
  }, [login, logout, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="text-center space-y-1">
          <p className="text-base font-semibold text-foreground">Signing you in…</p>
          <p className="text-sm text-muted-foreground">Just a moment while we verify your account.</p>
        </div>
        {/* Animated dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
