import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plug, ExternalLink, RefreshCw } from 'lucide-react';

interface Connector {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  lastSync?: string;
  icon: string;
}

const DEMO_CONNECTORS: Connector[] = [
  { id: '1', name: 'QuickBooks', description: 'Sync accounting data with QuickBooks Online.', connected: true, lastSync: '2026-02-09 08:00', icon: '📊' },
  { id: '2', name: 'Stripe', description: 'Process payments and manage subscriptions.', connected: false, icon: '💳' },
  { id: '3', name: 'Twilio', description: 'Send SMS notifications and reminders.', connected: true, lastSync: '2026-02-08 22:30', icon: '📱' },
  { id: '4', name: 'Zapier', description: 'Automate workflows with 5000+ apps.', connected: false, icon: '⚡' },
  { id: '5', name: 'Google Calendar', description: 'Sync property viewings and maintenance schedules.', connected: false, icon: '📅' },
  { id: '6', name: 'Mailchimp', description: 'Email marketing campaigns for tenants and prospects.', connected: false, icon: '✉️' },
];

export default function ConnectorsSection() {
  const { toast } = useToast();
  const [connectors, setConnectors] = useState(DEMO_CONNECTORS);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');

  const handleConnect = (id: string) => {
    if (!apiKey.trim()) {
      toast({ title: 'API key required', variant: 'destructive' });
      return;
    }
    setConnectors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, connected: true, lastSync: 'Just now' } : c))
    );
    toast({ title: 'Connected', description: `Successfully connected.` });
    setConnectingId(null);
    setApiKey('');
  };

  const handleDisconnect = (id: string) => {
    setConnectors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, connected: false, lastSync: undefined } : c))
    );
    toast({ title: 'Disconnected' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {connectors.map((connector) => (
          <Card key={connector.id} className="card-elevated">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{connector.icon}</span>
                  <div>
                    <CardTitle className="text-base">{connector.name}</CardTitle>
                    <Badge
                      variant={connector.connected ? 'default' : 'outline'}
                      className="mt-1 text-[10px]"
                    >
                      {connector.connected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription className="text-sm">{connector.description}</CardDescription>
              {connector.connected && connector.lastSync && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Last sync: {connector.lastSync}
                </p>
              )}
              <div className="flex gap-2">
                {connector.connected ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDisconnect(connector.id)}>
                      Disconnect
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Dialog open={connectingId === connector.id} onOpenChange={(open) => { setConnectingId(open ? connector.id : null); setApiKey(''); }}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex-1">
                        <Plug className="h-4 w-4 mr-1.5" />
                        Connect
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Connect {connector.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                          <Label>API Key</Label>
                          <Input
                            placeholder="Enter your API key…"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                          />
                        </div>
                        <Button onClick={() => handleConnect(connector.id)} className="w-full">
                          Authenticate & Connect
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="card-elevated border-dashed border-2">
        <CardContent className="flex items-center justify-center py-8 text-center">
          <div>
            <Plug className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">More integrations coming soon</p>
            <p className="text-xs text-muted-foreground mt-1">Have a suggestion? Let us know.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
