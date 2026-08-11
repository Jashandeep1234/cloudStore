import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLogin, useRegister } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import Particles from "@/components/ui/Particles";

// ─── Schemas ───────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Tab type ─────────────────────────────────────────────────────────────

type Tab = "login" | "register" | "google";

// ─── Sub-components ────────────────────────────────────────────────────────

const InputField = ({
  id,
  label,
  type = "text",
  placeholder,
  icon: Icon,
  error,
  showToggle,
  ...rest
}: {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  icon: React.ElementType;
  error?: string;
  showToggle?: boolean;
  [key: string]: unknown;
}) => {
  const [show, setShow] = useState(false);
  const inputType = showToggle ? (show ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          className={`w-full h-11 pl-10 pr-${showToggle ? "10" : "4"} rounded-xl border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150 focus:ring-2 focus:ring-primary/20 focus:border-primary ${error ? "border-destructive" : "border-input hover:border-muted-foreground/40"}`}
          {...rest}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

// ─── Login Form ────────────────────────────────────────────────────────────

const LoginForm = () => {
  const { mutate: login, isPending } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  return (
    <form onSubmit={handleSubmit((d) => login(d))} className="space-y-4">
      <InputField
        id="login-email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon={Mail}
        error={errors.email?.message}
        {...register("email")}
      />
      <InputField
        id="login-password"
        label="Password"
        placeholder="Enter your password"
        icon={Lock}
        error={errors.password?.message}
        showToggle
        {...register("password")}
      />
      <button
        id="login-submit-btn"
        type="submit"
        disabled={isPending}
        className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm shadow-primary/30 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 mt-2"
      >
        {isPending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
};

// ─── Register Form ─────────────────────────────────────────────────────────

const RegisterForm = () => {
  const { mutate: register_, isPending } = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  return (
    <form
      onSubmit={handleSubmit((d) => register_({ name: d.name, email: d.email, password: d.password }))}
      className="space-y-4"
    >
      <InputField
        id="register-name"
        label="Full Name"
        placeholder="Jane Doe"
        icon={UserIcon}
        error={errors.name?.message}
        {...register("name")}
      />
      <InputField
        id="register-email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon={Mail}
        error={errors.email?.message}
        {...register("email")}
      />
      <InputField
        id="register-password"
        label="Password"
        placeholder="Min. 8 characters"
        icon={Lock}
        error={errors.password?.message}
        showToggle
        {...register("password")}
      />
      <InputField
        id="register-confirm-password"
        label="Confirm Password"
        placeholder="Repeat your password"
        icon={Lock}
        error={errors.confirmPassword?.message}
        showToggle
        {...register("confirmPassword")}
      />
      <button
        id="register-submit-btn"
        type="submit"
        disabled={isPending}
        className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm shadow-primary/30 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 mt-2"
      >
        {isPending ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
};

// ─── Google Sign-In Panel ──────────────────────────────────────────────────

const GoogleSignInPanel = () => (
  <div className="flex flex-col items-center gap-6 py-4">
    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
      {/* Google logo */}
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    </div>
    <div className="text-center space-y-1">
      <p className="font-semibold text-foreground">Continue with Google</p>
      <p className="text-sm text-muted-foreground">
        Sign in instantly using your Google account.<br />
        No password needed.
      </p>
    </div>
    <button
      id="google-signin-btn"
      type="button"
      onClick={() => authService.googleLogin()}
      className="w-full h-11 rounded-xl border border-input bg-background hover:bg-secondary text-sm font-semibold text-foreground flex items-center justify-center gap-3 transition-all duration-150 shadow-sm hover:shadow"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Sign in with Google
    </button>
    <p className="text-xs text-muted-foreground text-center max-w-xs">
      By continuing, you agree to our terms. Your Google account info is only used for authentication.
    </p>
  </div>
);

// ─── Main AuthPage ─────────────────────────────────────────────────────────

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("login");

  const tabs: { id: Tab; label: string }[] = [
    { id: "login", label: "Sign In" },
    { id: "register", label: "Register" },
    { id: "google", label: "Google" },
  ];

  return (
    <div className="min-h-screen flex bg-background overflow-hidden relative">

      {/* ── Particles background ──────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Particles
          particleColors={["#ffffff", "#ffffff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
        />
      </div>

      {/* ── Right Panel ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative">
        {/* Back to home */}
        <Link
          to="/landing"
          className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>

        <div className="w-full max-w-[420px]">
          {/* Header */}
          <div className="mb-8 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {activeTab === "login" && "Welcome back"}
              {activeTab === "register" && "Create your account"}
              {activeTab === "google" && "Quick sign-in"}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {activeTab === "login" && "Sign in to your CloudStore account"}
              {activeTab === "register" && "Get started with free cloud storage"}
              {activeTab === "google" && "Use your Google account to continue"}
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-card/90 backdrop-blur-md border border-border rounded-2xl shadow-lg shadow-blue-100/40 p-6 sm:p-8">
            {/* Tab selector */}
            <div className="flex rounded-xl bg-secondary p-1 mb-6 gap-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  id={`auth-tab-${t.id}`}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === t.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Form area with animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
              >
                {activeTab === "login" && <LoginForm />}
                {activeTab === "register" && <RegisterForm />}
                {activeTab === "google" && <GoogleSignInPanel />}
              </motion.div>
            </AnimatePresence>

            {/* Divider + switch prompt */}
            {activeTab !== "google" && (
              <div className="mt-6 pt-5 border-t border-border text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {activeTab === "login"
                    ? "Don't have an account? Register"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
