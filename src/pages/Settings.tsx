import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { User, Users, CreditCard, Plug, HelpCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

import ProfileSection from '@/components/settings/ProfileSection';
import PeopleSection from '@/components/settings/PeopleSection';
import BillingSection from '@/components/settings/BillingSection';
import ConnectorsSection from '@/components/settings/ConnectorsSection';
import HelpSupportSection from '@/components/settings/HelpSupportSection';

type SettingsTab = 'profile' | 'people' | 'billing' | 'connectors' | 'help';

const TABS: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'people', label: 'People', icon: Users },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'connectors', label: 'Connectors', icon: Plug },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
];

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Admin guard
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({ title: 'Access denied', description: 'Admin access only.', variant: 'destructive' });
      navigate('/dashboard');
    }
  }, [user, navigate, toast]);

  if (!user || user.role !== 'admin') return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileSection />;
      case 'people': return <PeopleSection />;
      case 'billing': return <BillingSection />;
      case 'connectors': return <ConnectorsSection />;
      case 'help': return <HelpSupportSection />;
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <div className="h-1 w-16 bg-secondary rounded-full mt-2" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sub-navigation */}
        {isMobile ? (
          <div className="flex overflow-x-auto gap-1 pb-2 border-b border-border -mx-2 px-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                    activeTab === tab.id
                      ? 'bg-primary/20 text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        ) : (
          <nav className="w-56 shrink-0">
            <div className="sticky top-6 space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left',
                      activeTab === tab.id
                        ? 'bg-primary/20 text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
