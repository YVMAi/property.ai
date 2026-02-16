import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, Loader2, Mail, Lock, Shield, BarChart3, Users, Zap, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type LoginStep = "email" | "password" | "mfa";
type LoginTarget = "regular" | "super_admin";

export default function Login() {
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginTarget, setLoginTarget] = useState<LoginTarget>("regular");

  const { checkEmail, login, verifyMfa } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    const { exists } = await checkEmail(email);
    setIsLoading(false);

    if (exists) {
      setStep("password");
    } else {
      toast({
        title: "Email not found",
        description: "This email is not registered in our system.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success && result.requiresMfa) {
      if (result.isSuperAdmin) setLoginTarget("super_admin");
      setStep("mfa");
      toast({
        title: "MFA Code Sent",
        description: "A 6-digit code has been sent to your email.",
      });
    } else if (result.error) {
      toast({
        title: "Login Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length !== 6) return;

    setIsLoading(true);
    const result = await verifyMfa(mfaCode);
    setIsLoading(false);

    if (result.success) {
      if (result.isSuperAdmin) {
        toast({ title: "Super Admin Access", description: "Opening admin portal in a new tab." });
        window.open('/super-admin', '_blank');
      } else {
        toast({ title: "Welcome!", description: "You have successfully logged in." });
        navigate("/dashboard");
      }
    } else if (result.error) {
      toast({
        title: "Verification Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleMfaChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setMfaCode(cleaned);
  };

  const goBack = () => {
    if (step === "mfa") {
      setStep("password");
      setMfaCode("");
    } else if (step === "password") {
      setStep("email");
      setPassword("");
    }
  };

  const features = [
    { icon: BarChart3, label: "Real-time ROI Analytics" },
    { icon: Users, label: "Automated Tenant Vetting" },
    { icon: Zap, label: "Predictive Maintenance AI" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Dark branding */}
      <div className="hidden lg:flex lg:w-[48%] relative bg-[hsl(220,20%,12%)] text-white flex-col justify-between p-10 overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(210,45%,20%)] via-[hsl(220,20%,12%)] to-[hsl(220,20%,8%)]" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-20">
            <div className="h-9 w-9 rounded-lg bg-[hsl(210,50%,78%)] flex items-center justify-center">
              <Building2 className="h-5 w-5 text-[hsl(220,30%,15%)]" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              Property<span className="text-[hsl(210,50%,78%)]">AI</span>
            </span>
          </div>

          {/* Headline */}
          <div className="max-w-md">
            <h1 className="text-4xl font-bold leading-tight mb-4">
              The future of intelligent<span className="text-[hsl(120,30%,77%)]"> property management.</span>
            </h1>
            <p className="text-[hsl(220,10%,65%)] text-base leading-relaxed mb-10">
              Automate your portfolio with AI-driven insights, tenant matching, and predictive maintenance.
            </p>

            {/* Feature pills */}
            <div className="space-y-3">
              {features.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm w-fit"
                >
                  <Icon className="h-4.5 w-4.5 text-[hsl(210,50%,78%)]" />
                  <span className="text-sm font-medium text-white/90">{label}</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-[hsl(120,30%,77%)] ml-2" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-[hsl(220,10%,50%)]">Trusted by 2,000+ Property Managers worldwide.</p>
      </div>

      {/* Right Panel — Login form */}
      <div className="flex-1 flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-foreground">
              Property<span className="text-primary">AI</span>
            </span>
          </div>

          {/* Welcome heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Enter your details to access your dashboard.</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {["email", "password", "mfa"].map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s
                    ? "w-8 bg-primary"
                    : ["email", "password", "mfa"].indexOf(step) > i
                      ? "w-2 bg-primary"
                      : "w-2 bg-border"
                }`}
              />
            ))}
          </div>

          {/* Email Step */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-6 animate-slide-up">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Work Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 rounded-xl"
                    autoFocus
                    aria-label="Email Address"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold gap-2 bg-foreground text-background hover:bg-foreground/90"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Password Step */}
          {step === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6 animate-slide-up">
              <div className="text-center mb-2">
                <p className="text-sm text-muted-foreground">Logging in as</p>
                <p className="font-medium text-foreground">{email}</p>
                <button type="button" onClick={goBack} className="text-sm text-primary hover:underline mt-1">
                  Change
                </button>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 rounded-xl"
                    autoFocus
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold bg-foreground text-background hover:bg-foreground/90"
                disabled={isLoading || !password.trim()}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Log In"}
              </Button>
            </form>
          )}

          {/* MFA Step */}
          {step === "mfa" && (
            <form onSubmit={handleMfaSubmit} className="space-y-6 animate-slide-up">
              <div className="text-center mb-4">
                <Shield className="h-12 w-12 mx-auto text-primary mb-3" />
                <h2 className="text-lg font-semibold text-foreground">Two-Factor Authentication</h2>
                <p className="text-sm text-muted-foreground mt-1">Enter the 6-digit code sent to your email</p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="mfaCode"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  MFA Code
                </Label>
                <Input
                  id="mfaCode"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => handleMfaChange(e.target.value)}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14 rounded-xl"
                  maxLength={6}
                  autoFocus
                  aria-label="Enter MFA Code"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold bg-foreground text-background hover:bg-foreground/90"
                disabled={isLoading || mfaCode.length !== 6}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={goBack}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  ← Back to password
                </button>
              </div>
            </form>
          )}

          {/* Demo sandbox credentials */}
          <div className="mt-10 p-4 rounded-xl bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="h-2 w-2 rounded-full bg-secondary" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Environment: Demo Sandbox
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-md bg-background border border-border text-xs font-mono text-foreground/70">
                USR: admin@propertyai.com
              </span>
              <span className="px-2.5 py-1 rounded-md bg-background border border-border text-xs font-mono text-foreground/70">
                PWD: password123
              </span>
              <span className="px-2.5 py-1 rounded-md bg-background border border-border text-xs font-mono text-foreground/70">
                MFA: 123456
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-border/30">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Super Admin:</span>
              <span className="px-2.5 py-1 rounded-md bg-background border border-border text-xs font-mono text-foreground/70">
                USR: super@pmshq.com
              </span>
              <span className="px-2.5 py-1 rounded-md bg-background border border-border text-xs font-mono text-foreground/70">
                PWD: superadmin123
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
