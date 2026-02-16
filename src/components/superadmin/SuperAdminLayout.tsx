import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, LogOut, Shield, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { useAuth } from '@/contexts/AuthContext';

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const { superAdmin } = useSuperAdmin();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border/50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">Super Admin Portal</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">System Management</p>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search PMCs, logs, users..." className="pl-9 h-9 rounded-lg" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center font-bold">3</span>
            </Button>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary-foreground">{superAdmin?.name?.[0] || 'S'}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground leading-tight">{superAdmin?.name}</p>
                <p className="text-[10px] text-muted-foreground">{superAdmin?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive-foreground">
              <LogOut className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
}
