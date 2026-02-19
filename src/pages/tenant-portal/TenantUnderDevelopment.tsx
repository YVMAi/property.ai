import { useNavigate } from 'react-router-dom';
import { Key, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TenantUnderDevelopment({ title }: { title: string }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="h-24 w-24 rounded-2xl bg-primary/15 flex items-center justify-center mb-8">
        <Key className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-2xl font-semibold text-foreground mb-2">{title}</h1>
      <p className="text-lg text-muted-foreground mb-1">Under Development</p>
      <p className="text-sm text-muted-foreground mb-8 max-w-sm text-center">
        This portal is coming soon with powerful features for Tenants.
      </p>
      <Button
        onClick={() => navigate('/tenant-login')}
        className="h-11 px-8 rounded-xl gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        <LogOut className="h-4 w-4" /> Logout
      </Button>
    </div>
  );
}
