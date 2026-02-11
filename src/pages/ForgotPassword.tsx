import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Mail, CheckCircle2, Lock, Building2, BarChart3, Users, Zap, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ResetStep = 'request' | 'sent' | 'reset' | 'complete';

export default function ForgotPassword() {
  const [step, setStep] = useState<ResetStep>('request');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { requestPasswordReset, resetPassword } = useAuth();
  const { toast } = useToast();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    const result = await requestPasswordReset(email);
    setIsLoading(false);

    if (result.success) {
      setStep('sent');
    } else {
      toast({
        title: 'Request Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please ensure both passwords are the same.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const result = await resetPassword('demo-token', newPassword);
    setIsLoading(false);

    if (result.success) {
      setStep('complete');
    } else {
      toast({
        title: 'Reset Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const features = [
    { icon: BarChart3, label: 'Real-time ROI Analytics' },
    { icon: Users, label: 'Automated Tenant Vetting' },
    { icon: Zap, label: 'Predictive Maintenance AI' },
  ];

  const steps: ResetStep[] = ['request', 'sent', 'reset', 'complete'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Dark branding */}
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
              The future of intelligent<span className="text-[hsl(120,30%,77%)]"> property management.</span>
            </h1>
            <p className="text-[hsl(220,10%,65%)] text-base leading-relaxed mb-10">
              Automate your portfolio with AI-driven insights, tenant matching, and predictive maintenance.
            </p>

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

      {/* Right Panel — Reset form */}
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

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {step === 'request' && 'Reset your password'}
              {step === 'sent' && 'Check your email'}
              {step === 'reset' && 'Create new password'}
              {step === 'complete' && 'Password updated'}
            </h2>
            <p className="text-muted-foreground mt-1">
              {step === 'request' && "Enter your email and we'll send you a reset link."}
              {step === 'sent' && `We've sent a password reset link to ${email}.`}
              {step === 'reset' && 'Enter your new password below.'}
              {step === 'complete' && 'Your password has been successfully reset.'}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStepIndex
                    ? 'w-8 bg-primary'
                    : i < currentStepIndex
                      ? 'w-2 bg-primary'
                      : 'w-2 bg-border'
                }`}
              />
            ))}
          </div>

          {/* Request Step */}
          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-6 animate-slide-up">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Address
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
                className="w-full h-12 rounded-xl text-base font-semibold bg-foreground text-background hover:bg-foreground/90"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Reset Link'}
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* Sent Step */}
          {step === 'sent' && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-primary" />
              </div>

              <Button
                onClick={() => setStep('reset')}
                className="w-full h-12 rounded-xl text-base font-semibold bg-foreground text-background hover:bg-foreground/90"
              >
                I Have the Link (Demo)
              </Button>

              <div className="text-center">
                <button
                  onClick={() => setStep('request')}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Didn't receive email? Try again
                </button>
              </div>
            </div>
          )}

          {/* Reset Step */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6 animate-slide-up">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 rounded-xl"
                    autoFocus
                    aria-label="New Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 rounded-xl"
                    aria-label="Confirm Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold bg-foreground text-background hover:bg-foreground/90"
                disabled={isLoading || !newPassword || !confirmPassword}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reset Password'}
              </Button>
            </form>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-primary" />
              </div>

              <Link to="/login">
                <Button className="w-full h-12 rounded-xl text-base font-semibold bg-foreground text-background hover:bg-foreground/90">
                  Go to Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
