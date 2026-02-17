import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Key, Wrench, LogOut } from "lucide-react";

type PortalType = "owner" | "tenant" | "vendor";

const CONFIG: Record<PortalType, { title: string; icon: typeof Home; subtitle: string; accent: string }> = {
  owner: { title: "Owner Portal", icon: Home, subtitle: "This portal is coming soon with powerful features for Owners.", accent: "hsl(120,30%,77%)" },
  tenant: { title: "Tenant Portal", icon: Key, subtitle: "This portal is coming soon with powerful features for Tenants.", accent: "hsl(210,50%,78%)" },
  vendor: { title: "Vendor Portal", icon: Wrench, subtitle: "This portal is coming soon with powerful features for Vendors.", accent: "hsl(30,60%,78%)" },
};

export default function PortalDashboard({ portalType }: { portalType: PortalType }) {
  const navigate = useNavigate();
  const { title, icon: Icon, subtitle, accent } = CONFIG[portalType];

  const loginRoute = `/${portalType}-login`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 animate-fade-in">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="h-24 w-24 rounded-2xl flex items-center justify-center mb-8" style={{ backgroundColor: accent }}>
          <Icon className="h-12 w-12 text-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">{title}</h1>
        <p className="text-xl font-semibold text-muted-foreground mb-2">Under Development</p>
        <p className="text-base text-muted-foreground mb-10">{subtitle}</p>
        <Button
          onClick={() => navigate(loginRoute)}
          className="h-12 px-8 rounded-xl text-base font-semibold gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
