import React from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import {
  Heart,
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  UserRound,
  Stethoscope,
  Check,
} from "lucide-react";
import type { UserType } from "../data/mockData";

type Mode = "login" | "register";
type RegisterStep = "credentials" | "role";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, user } = useAuth();

  const [mode, setMode] = React.useState<Mode>("login");
  const [registerStep, setRegisterStep] = React.useState<RegisterStep>("credentials");
  const [selectedRole, setSelectedRole] = React.useState<UserType | null>(null);

  // Form fields
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const from = (location.state as any)?.from;
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Route to the correct homepage based on user type
        navigate(user.type === "therapist" ? "/t" : "/c", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setShowPassword(false);
    setRegisterStep("credentials");
    setSelectedRole(null);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    resetForm();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Small delay for perceived loading
    await new Promise((r) => setTimeout(r, 400));

    const result = login(email, password);
    setIsLoading(false);
    if (!result.success) {
      setError(result.error || "Login failed");
    }
  };

  const handleRegisterNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setRegisterStep("role");
  };

  const handleRegisterSubmit = async () => {
    if (!selectedRole) {
      setError("Please select how you'd like to use Therapy Connect");
      return;
    }
    setError("");
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const result = register(name, email, password, selectedRole);
    setIsLoading(false);
    if (!result.success) {
      setError(result.error || "Registration failed");
    }
  };

  // Demo quick-login helpers
  const demoLoginClient = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    login("alex.thompson@email.com", "password");
    setIsLoading(false);
  };

  const demoLoginTherapist = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    login("sarah.johnson@therapy.com", "password");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <Heart className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Therapy Connect
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
            Connect with the right therapist for you
          </p>
        </div>

        {/* Card */}
        <Card className="w-full max-w-[420px] p-0 overflow-hidden shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          {/* Mode tabs */}
          <div className="flex border-b">
            <button
              onClick={() => switchMode("login")}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
                mode === "login"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              Sign In
              {mode === "login" && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
              )}
            </button>
            <button
              onClick={() => switchMode("register")}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
                mode === "register"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              Create Account
              {mode === "register" && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* ---- LOGIN ---- */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="login-email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="login-password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* ---- REGISTER: Credentials step ---- */}
            {mode === "register" && registerStep === "credentials" && (
              <form onSubmit={handleRegisterNext} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="reg-name">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="reg-email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="reg-password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full gap-2">
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            )}

            {/* ---- REGISTER: Role selection step ---- */}
            {mode === "register" && registerStep === "role" && (
              <div className="space-y-5">
                <div>
                  <button
                    onClick={() => setRegisterStep("credentials")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 inline-flex items-center gap-1"
                  >
                    <ArrowRight className="w-3 h-3 rotate-180" />
                    Back
                  </button>
                  <h2 className="text-lg font-semibold text-foreground">
                    How will you use Therapy Connect?
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose the option that best describes you
                  </p>
                </div>

                <div className="grid gap-3">
                  {/* Client option */}
                  <button
                    onClick={() => setSelectedRole("client")}
                    className={`relative flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      selectedRole === "client"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedRole === "client"
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <UserRound className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">I'm looking for therapy</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Find and connect with qualified therapists
                      </p>
                    </div>
                    {selectedRole === "client" && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>

                  {/* Therapist option */}
                  <button
                    onClick={() => setSelectedRole("therapist")}
                    className={`relative flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      selectedRole === "therapist"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedRole === "therapist"
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">I'm a therapist</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Manage your practice and connect with clients
                      </p>
                    </div>
                    {selectedRole === "therapist" && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <Button
                  className="w-full gap-2"
                  disabled={!selectedRole || isLoading}
                  onClick={handleRegisterSubmit}
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">
                  Quick demo access
                </span>
              </div>
            </div>

            {/* Demo login buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs h-10"
                onClick={demoLoginClient}
                disabled={isLoading}
              >
                <UserRound className="w-3.5 h-3.5" />
                Demo Client
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs h-10"
                onClick={demoLoginTherapist}
                disabled={isLoading}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                Demo Therapist
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer text */}
        <p className="mt-6 text-xs text-muted-foreground text-center max-w-xs">
          By continuing, you agree to Therapy Connect's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}