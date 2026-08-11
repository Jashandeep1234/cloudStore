import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";

// ─── Current User ─────────────────────────────────────────────────────────

export const useCurrentUser = () => {
  const { isAuthenticated, setUser } = useAuthStore();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const user = await authService.getCurrentUser(
        useAuthStore.getState().accessToken ?? undefined
      );
      setUser(user);
      return user;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};

// ─── Login ────────────────────────────────────────────────────────────────

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: authService.login,
    onSuccess: async (tokens) => {
      // Drop any cached data from a previous session so the new user
      // starts fresh (no files/folders leaking between accounts).
      queryClient.clear();
      try {
        const user = await authService.getCurrentUser(tokens.accessToken);
        login(tokens, user);
        toast.success("Welcome back!");
        navigate("/", { replace: true });
      } catch {
        // Tokens valid but user fetch failed — still log in with minimal info
        login(tokens, { id: 0, email: "", name: "User" });
        navigate("/", { replace: true });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg = error?.response?.data?.message ?? "Login failed. Please check your credentials.";
      toast.error(msg);
    },
  });
};

// ─── Register ─────────────────────────────────────────────────────────────

export const useRegister = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: authService.register,
    onSuccess: async (tokens) => {
      // New account — make sure no previous user's cached data shows up.
      queryClient.clear();
      try {
        const user = await authService.getCurrentUser(tokens.accessToken);
        login(tokens, user);
        toast.success("Account created! Welcome aboard.");
        navigate("/", { replace: true });
      } catch {
        login(tokens, { id: 0, email: "", name: "User" });
        navigate("/", { replace: true });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg = error?.response?.data?.message ?? "Registration failed. Please try again.";
      toast.error(msg);
    },
  });
};

// ─── Logout ───────────────────────────────────────────────────────────────

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout, refreshToken } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await authService.logout(refreshToken).catch(() => {
          // Silently ignore server-side logout errors
        });
      }
    },
    onSettled: () => {
      logout();
      // Wipe all cached queries so the next user never sees this user's data.
      queryClient.clear();
      navigate("/auth", { replace: true });
    },
  });
};
