import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye, EyeOff, ArrowRight, Loader2, Mail, Lock, Shield,
  Building2, Home, Key, Wrench, UserPlus, ArrowLeft, CheckCircle2,
  BarChart3, DollarSign, FileText, ClipboardList, CreditCard, Send,
  Settings, PieChart, Receipt, Hammer,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type PortalType = "owner" | "tenant" | "vendor";
type LoginStep = "email" | "password" | "mfa";
type ResetStep = "request" | "sent";

interface PortalFeature {
  icon: typeof Home;
  label: string;
}

interface PortalConfig {
  type: PortalType;
  title: string;
  tagline: string;
  accentHsl: string;
  icon: typeof Home;
  dashboardRoute: string;
  placeholderSubtitle: string;
  features: PortalFeature[];
}

const PORTAL_CONFIGS: Record<PortalType, PortalConfig> = {
  owner: {
    type: "owner",
    title: "Owner Portal",
    tagline: "Manage your properties and payments effortlessly.",
    accentHsl: "hsl(120,30%,77%)",
    icon: Home,
    dashboardRoute: "/owner-dashboard",
    placeholderSubtitle: "This portal is coming soon with powerful features for Owners.",
    features: [
      { icon: PieChart, label: "Real-time portfolio overview" },
      { icon: DollarSign, label: "Automated rent collection & reports" },
      { icon: FileText, label: "Secure document access" },
    ],
  },
  tenant: {
    type: "tenant",
    title: "Tenant Portal",
    tagline: "Pay rent and manage your lease in one place.",
    accentHsl: "hsl(210,50%,78%)",
    icon: Key,
    dashboardRoute: "/tenant-dashboard",
    placeholderSubtitle: "This portal is coming soon with powerful features for Tenants.",
    features: [
      { icon: CreditCard, label: "Easy rent payments" },
      { icon: Send, label: "Submit maintenance requests" },
      { icon: FileText, label: "View lease documents & notices" },
    ],
  },
  vendor: {
    type: "vendor",
    title: "Vendor Portal",
    tagline: "View work orders and get paid faster.",
    accentHsl: "hsl(30,60%,78%)",
    icon: Wrench,
    dashboardRoute: "/vendor-dashboard",
    placeholderSubtitle: "This portal is coming soon with powerful features for Vendors.",
    features: [
      { icon: ClipboardList, label: "Assigned work orders" },
      { icon: Receipt, label: "Submit quotes & invoices" },
      { icon: Hammer, label: "Track payments & status" },
    ],
  },
};

// Demo users for portal login
const PORTAL_DEMO_USERS: Record<PortalType, { email: string; password: string; name: string }> = {
  owner: { email: "owner@demo.com", password: "password123", name: "Demo Owner" },
  tenant: { email: "tenant@demo.com", password: "password123", name: "Demo Tenant" },
  vendor: { email: "vendor@demo.com", password: "password123", name: "Demo Vendor" },
};

function SignupForm({ portalType, onClose }: { portalType: PortalType; onClose: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== confirmPw) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (pw.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <CheckCircle2 className="h-16 w-16 text-secondary" />
        <h3 className="text-lg font-semibold text-foreground">Account Created!</h3>
        <p className="text-sm text-muted-foreground text-center">Check your email to verify your account and get started.</p>
        <Button onClick={onClose} className="rounded-xl bg-foreground text-background hover:bg-foreground/90">Close</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="h-11 rounded-xl" required />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="h-11 rounded-xl" required />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</Label>
        <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="h-11 rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
        <div className="relative">
          <Input type={showPw ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Min 8 characters" className="h-11 rounded-xl pr-10" required />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
        <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Re-enter password" className="h-11 rounded-xl" required />
      </div>
      <div className="pt-1 px-3 py-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
        Role: <span className="font-medium text-foreground capitalize">{portalType}</span> (auto-assigned)
      </div>
      <Button type="submit" className="w-full h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
      </Button>
    </form>
  );
}

export default function PortalLogin({ portalType }: { portalType: PortalType }) {
  const config = PORTAL_CONFIGS[portalType];
  const Icon = config.icon;
  const demoUser = PORTAL_DEMO_USERS[portalType];

  const [step, setStep] = useState<LoginStep>("email");
  const [resetMode, setResetMode] = useState<ResetStep | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsLoading(false);
    // Accept demo or any email for the portal
    setStep("password");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);

    if (email.toLowerCase() === demoUser.email && password === demoUser.password) {
      setStep("mfa");
      toast({ title: "MFA Code Sent", description: "A 6-digit code has been sent to your email." });
    } else {
      toast({ title: "Login Failed", description: "Invalid credentials. Please try again.", variant: "destructive" });
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length !== 6) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsLoading(false);

    if (/^\d{6}$/.test(mfaCode)) {
      toast({ title: "Welcome!", description: `Logged in to ${config.title}.` });
      navigate(config.dashboardRoute);
    } else {
      toast({ title: "Invalid Code", description: "Please enter 6 digits.", variant: "destructive" });
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
    setResetMode("sent");
  };

  const goBack = () => {
    if (resetMode) { setResetMode(null); return; }
    if (step === "mfa") { setStep("password"); setMfaCode(""); }
    else if (step === "password") { setStep("email"); setPassword(""); }
  };

  const steps: LoginStep[] = ["email", "password", "mfa"];

  // Forgot password flow
  if (resetMode !== null) {
    return (
      <div className="min-h-screen flex">
        <LeftPanel config={config} />
        <div className="flex-1 flex items-center justify-center bg-background p-6 sm:p-10">
          <div className="w-full max-w-md animate-fade-in">
            <MobileLogo />
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                {resetMode === "request" ? "Reset your password" : "Check your email"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {resetMode === "request" ? "Enter your email and we'll send a reset link." : `We've sent a reset link to ${email}.`}
              </p>
            </div>
            {resetMode === "request" ? (
              <form onSubmit={handleResetRequest} className="space-y-6 animate-slide-up">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="pl-11 h-12 rounded-xl" autoFocus />
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold bg-foreground text-background hover:bg-foreground/90" disabled={isLoading || !email.trim()}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
                </Button>
                <div className="text-center">
                  <button type="button" onClick={() => setResetMode(null)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                    <ArrowLeft className="h-4 w-4" /> Back to Login
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 animate-slide-up">
                <div className="flex justify-center"><CheckCircle2 className="h-16 w-16 text-primary" /></div>
                <Button onClick={() => setResetMode(null)} className="w-full h-12 rounded-xl text-base font-semibold bg-foreground text-background hover:bg-foreground/90">Back to Login</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <LeftPanel config={config} />

      <div className="flex-1 flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-in">
          <MobileLogo />

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Sign in to your {config.title.toLowerCase()}.</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step === s ? "w-8 bg-primary" : steps.indexOf(step) > i ? "w-2 bg-primary" : "w-2 bg-border"}`} />
            ))}
          </div>

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-6 animate-slide-up">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="pl-11 h-12 rounded-xl" autoFocus />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold gap-2 bg-foreground text-background hover:bg-foreground/90" disabled={isLoading || !email.trim()}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <> Continue <ArrowRight className="h-5 w-5" /></>}
              </Button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6 animate-slide-up">
              <div className="text-center mb-2">
                <p className="text-sm text-muted-foreground">Logging in as</p>
                <p className="font-medium text-foreground">{email}</p>
                <button type="button" onClick={goBack} className="text-sm text-primary hover:underline mt-1">Change</button>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="pl-11 pr-11 h-12 rounded-xl" autoFocus />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <button type="button" onClick={() => setResetMode("request")} className="text-sm text-muted-foreground hover:text-primary transition-colors">Forgot Password?</button>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold bg-foreground text-background hover:bg-foreground/90" disabled={isLoading || !password.trim()}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Log In"}
              </Button>
            </form>
          )}

          {step === "mfa" && (
            <form onSubmit={handleMfaSubmit} className="space-y-6 animate-slide-up">
              <div className="text-center mb-4">
                <Shield className="h-12 w-12 mx-auto text-primary mb-3" />
                <h2 className="text-lg font-semibold text-foreground">Two-Factor Authentication</h2>
                <p className="text-sm text-muted-foreground mt-1">Enter the 6-digit code sent to your email</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">MFA Code</Label>
                <Input type="text" inputMode="numeric" placeholder="000000" value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="text-center text-2xl tracking-[0.5em] font-mono h-14 rounded-xl" maxLength={6} autoFocus />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold bg-foreground text-background hover:bg-foreground/90" disabled={isLoading || mfaCode.length !== 6}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify"}
              </Button>
              <div className="text-center">
                <button type="button" onClick={goBack} className="text-sm text-muted-foreground hover:text-primary">← Back to password</button>
              </div>
            </form>
          )}

          {/* Create Account — prominent */}
          <div className="mt-8">
            <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full h-13 rounded-xl text-base font-semibold gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  style={{ backgroundColor: config.accentHsl, color: "hsl(220,30%,15%)" }}
                >
                  <UserPlus className="h-5 w-5" /> Create Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create {config.title} Account</DialogTitle>
                </DialogHeader>
                <SignupForm portalType={portalType} onClose={() => setSignupOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-secondary" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Demo Credentials</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-md bg-background border border-border text-xs font-mono text-foreground/70">USR: {demoUser.email}</span>
              <span className="px-2.5 py-1 rounded-md bg-background border border-border text-xs font-mono text-foreground/70">PWD: {demoUser.password}</span>
              <span className="px-2.5 py-1 rounded-md bg-background border border-border text-xs font-mono text-foreground/70">MFA: 123456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileLogo() {
  return (
    <div className="lg:hidden flex items-center gap-2.5 mb-10">
      <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
        <Building2 className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="text-xl font-semibold tracking-tight text-foreground">
        Property<span className="text-primary">AI</span>
      </span>
    </div>
  );
}

function LeftPanel({ config }: { config: PortalConfig }) {
  const Icon = config.icon;
  return (
    <div className="hidden lg:flex lg:w-[48%] relative bg-[hsl(220,20%,12%)] text-white flex-col justify-between p-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(210,45%,20%)] via-[hsl(220,20%,12%)] to-[hsl(220,20%,8%)]" />
      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-20">
          <div className="h-9 w-9 rounded-lg bg-[hsl(210,50%,78%)] flex items-center justify-center">
            <Building2 className="h-5 w-5 text-[hsl(220,30%,15%)]" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            Property<span className="text-[hsl(210,50%,78%)]">AI</span>
          </span>
        </div>
        <div className="max-w-md">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            {config.title.split(" ")[0]}{" "}
            <span style={{ color: config.accentHsl }}>{config.title.split(" ").slice(1).join(" ")}</span>
          </h1>
          <p className="text-[hsl(220,10%,65%)] text-base leading-relaxed mb-10">
            {config.tagline}
          </p>
          <div className="space-y-3">
            {config.features.map(({ icon: FIcon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm w-fit"
              >
                <FIcon className="h-4.5 w-4.5" style={{ color: config.accentHsl }} />
                <span className="text-sm font-medium text-white/90">{label}</span>
                <div className="h-1.5 w-1.5 rounded-full ml-2" style={{ backgroundColor: config.accentHsl }} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="relative z-10 text-xs text-[hsl(220,10%,50%)]">Powered by PropertyAI</p>
    </div>
  );
}
