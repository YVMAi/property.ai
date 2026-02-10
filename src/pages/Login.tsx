import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ArrowRight, Loader2, Mail, Lock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type LoginStep = 'email' | 'password' | 'mfa';

export default function Login() {
  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
      setStep('password');
    } else {
      toast({
        title: 'Email not found',
        description: 'This email is not registered in our system.',
        variant: 'destructive',
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
      setStep('mfa');
      toast({
        title: 'MFA Code Sent',
        description: 'A 6-digit code has been sent to your email.',
      });
    } else if (result.error) {
      toast({
        title: 'Login Failed',
        description: result.error,
        variant: 'destructive',
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
      toast({
        title: 'Welcome!',
        description: 'You have successfully logged in.',
      });
      navigate('/dashboard');
    } else if (result.error) {
      toast({
        title: 'Verification Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleMfaChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setMfaCode(cleaned);
  };

  const goBack = () => {
    if (step === 'mfa') {
      setStep('password');
      setMfaCode('');
    } else if (step === 'password') {
      setStep('email');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Property<span className="text-primary">AI</span>
          </h1>
          <p className="text-muted-foreground mt-2">Property Management System</p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl p-8 glass-heavy">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {['email', 'password', 'mfa'].map((s, i) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === s ? 'w-8 bg-primary shadow-glow' : 
                  ['email', 'password', 'mfa'].indexOf(step) > i ? 'w-2 bg-primary' : 'w-2 bg-border'
                }`}
              />
            ))}
          </div>

          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6 animate-slide-up">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    autoFocus
                    aria-label="Email Address"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading || !email.trim()}>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6 animate-slide-up">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">Logging in as</p>
                <p className="font-medium text-foreground">{email}</p>
                <button
                  type="button"
                  onClick={goBack}
                  className="text-sm text-primary hover:underline mt-1"
                >
                  Change
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    autoFocus
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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

              <Button type="submit" className="w-full" size="lg" disabled={isLoading || !password.trim()}>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Log In'
                )}
              </Button>
            </form>
          )}

          {step === 'mfa' && (
            <form onSubmit={handleMfaSubmit} className="space-y-6 animate-slide-up">
              <div className="text-center mb-4">
                <Shield className="h-12 w-12 mx-auto text-primary mb-3" />
                <h2 className="text-lg font-semibold text-foreground">Two-Factor Authentication</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mfaCode" className="text-sm font-medium text-foreground">
                  MFA Code
                </Label>
                <Input
                  id="mfaCode"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => handleMfaChange(e.target.value)}
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                  autoFocus
                  aria-label="Enter MFA Code"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading || mfaCode.length !== 6}>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Verify'
                )}
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
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-4 rounded-2xl glass border border-border">
          <p className="text-xs text-muted-foreground text-center mb-2">Demo Credentials</p>
          <p className="text-xs text-center text-foreground/80">
            Email: <span className="font-mono">admin@propertyai.com</span>
          </p>
          <p className="text-xs text-center text-foreground/80">
            Password: <span className="font-mono">password123</span>
          </p>
          <p className="text-xs text-center text-foreground/80">
            MFA: <span className="font-mono">123456</span>
          </p>
        </div>
      </div>
    </div>
  );
}
