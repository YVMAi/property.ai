import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Trash2, KeyRound } from 'lucide-react';

export default function ProfileSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      toast({ title: 'Photo uploaded', description: 'Profile picture updated.' });
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    toast({ title: 'Photo removed' });
  };

  const handleSaveProfile = () => {
    toast({ title: 'Profile updated', description: 'Your profile has been saved successfully.' });
  };

  const handleResetPassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: 'Missing fields', description: 'Please fill all password fields.', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: 'Weak password', description: 'Password must be at least 8 characters.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Mismatch', description: 'New passwords do not match.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Password updated', description: 'Your password has been changed.' });
    setResetOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Avatar Card */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg">Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="h-20 w-20">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Profile" />
              ) : null}
              <AvatarFallback className="bg-primary/20 text-primary text-xl">
                {user?.name ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <label className="absolute inset-0 flex items-center justify-center bg-foreground/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="h-5 w-5 text-background" />
              <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div className="space-y-2">
            <label className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Camera className="h-4 w-4 mr-1.5" />
                  Upload Photo
                  <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} />
                </span>
              </Button>
            </label>
            {avatarUrl && (
              <Button variant="ghost" size="sm" onClick={handleRemoveAvatar} className="text-destructive-foreground">
                <Trash2 className="h-4 w-4 mr-1.5" />
                Remove
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Card */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={user?.email || ''} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Contact support to change your email.</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Input value={user?.role === 'admin' ? 'Administrator' : 'User'} disabled className="opacity-60 max-w-xs" />
          </div>
        </CardContent>
      </Card>

      {/* Password Card */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg">Security</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={resetOpen} onOpenChange={setResetOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <KeyRound className="h-4 w-4 mr-1.5" />
                Reset Password
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="curPwd">Current Password</Label>
                  <Input id="curPwd" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPwd">New Password</Label>
                  <Input id="newPwd" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPwd">Confirm New Password</Label>
                  <Input id="confirmPwd" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <Button onClick={handleResetPassword} className="w-full">Update Password</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveProfile} size="lg">
          Update Profile
        </Button>
      </div>
    </div>
  );
}
