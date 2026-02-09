import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { SettingsTab } from '@/components/layout/AppSidebar';

import ProfileSection from '@/components/settings/ProfileSection';
import PeopleSection from '@/components/settings/PeopleSection';
import BillingSection from '@/components/settings/BillingSection';
import ConnectorsSection from '@/components/settings/ConnectorsSection';
import HelpSupportSection from '@/components/settings/HelpSupportSection';

const TAB_TITLES: Record<SettingsTab, string> = {
  profile: 'Profile',
  people: 'People',
  billing: 'Billing',
  connectors: 'Connectors',
  help: 'Help & Support',
};

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as SettingsTab) || 'profile';

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
        <h1 className="text-2xl font-semibold text-foreground">
          Settings — {TAB_TITLES[activeTab]}
        </h1>
        <div className="h-1 w-16 bg-secondary rounded-full mt-2" />
      </div>

      {/* Content Area */}
      <div className="min-w-0">
        {renderContent()}
      </div>
    </div>
  );
}
