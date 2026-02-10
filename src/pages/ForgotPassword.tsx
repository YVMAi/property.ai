import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Mail, CheckCircle2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ResetStep = 'request' | 'sent' | 'reset' | 'complete';

export default function ForgotPassword() {
  const [step, setStep] = useState<ResetStep>('request');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Property<span className="text-primary">AI</span>
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 glass-heavy">
          {step === 'request' && (
            <div className="space-y-6 animate-slide-up">
              <div className="text-center">
                <Mail className="h-12 w-12 mx-auto text-primary mb-3" />
                <h2 className="text-xl font-semibold text-foreground">Forgot Password?</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    aria-label="Email Address"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading || !email.trim()}>
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </div>
          )}

          {step === 'sent' && (
            <div className="space-y-6 animate-slide-up text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto text-success" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">Check Your Email</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
              </div>

              <Button onClick={() => setStep('reset')} className="w-full" size="lg">
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

          {step === 'reset' && (
            <div className="space-y-6 animate-slide-up">
              <div className="text-center">
                <Lock className="h-12 w-12 mx-auto text-primary mb-3" />
                <h2 className="text-xl font-semibold text-foreground">Create New Password</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter your new password below
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus
                    aria-label="New Password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-label="Confirm Password"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading || !newPassword || !confirmPassword}>
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-6 animate-slide-up text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto text-success" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">Password Reset!</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Your password has been successfully updated
                </p>
              </div>

              <Link to="/login">
                <Button className="w-full" size="lg">
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
