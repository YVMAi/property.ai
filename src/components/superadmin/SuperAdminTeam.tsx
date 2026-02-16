import { useState } from 'react';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Shield } from 'lucide-react';
import { SuperAdminRole } from '@/types/superAdmin';
import { useToast } from '@/hooks/use-toast';

const ROLE_LABELS: Record<SuperAdminRole, string> = {
  full_access: 'Full Access',
  editor: 'Editor',
  viewer: 'Viewer',
  log_only: 'Log Only',
};

const ROLE_COLORS: Record<SuperAdminRole, string> = {
  full_access: 'bg-destructive/15 text-destructive-foreground',
  editor: 'bg-primary/15 text-primary-foreground',
  viewer: 'bg-secondary/15 text-secondary-foreground',
  log_only: 'bg-muted text-muted-foreground',
};

export default function SuperAdminTeam() {
  const { superAdmins, addSuperAdmin, removeSuperAdmin } = useSuperAdmin();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<SuperAdminRole>('viewer');

  const handleAdd = () => {
    if (!newName.trim() || !newEmail.trim()) return;
    addSuperAdmin({ email: newEmail, name: newName, role: newRole });
    toast({ title: 'Super Admin Added', description: `Invite sent to ${newEmail}` });
    setShowAdd(false);
    setNewName('');
    setNewEmail('');
    setNewRole('viewer');
  };

  return (
    <Card className="border-border/50 mt-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Super Admin Team</CardTitle>
          <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5 btn-primary">
            <Plus className="h-3.5 w-3.5" /> Add Super Admin
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {superAdmins.map(admin => (
              <TableRow key={admin.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-medium">{admin.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{admin.email}</TableCell>
                <TableCell>
                  <Badge className={`text-[10px] ${ROLE_COLORS[admin.role]}`}>
                    {ROLE_LABELS[admin.role]}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : '—'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive-foreground"
                    onClick={() => { removeSuperAdmin(admin.id); toast({ title: 'Removed', description: `${admin.name} has been removed.` }); }}
                    disabled={superAdmins.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Super Admin</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Jane Smith" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="admin@pmshq.com" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newRole} onValueChange={v => setNewRole(v as SuperAdminRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!newName.trim() || !newEmail.trim()}>Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
