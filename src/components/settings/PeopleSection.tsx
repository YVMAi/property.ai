import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, UserPlus, MoreHorizontal, Shield, ShieldOff, Trash2, Mail } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  lastLogin: string;
}

interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

const DEMO_USERS: SystemUser[] = [
  { id: '1', name: 'Admin User', email: 'admin@propertyai.com', role: 'admin', status: 'active', lastLogin: '2026-02-09 10:30' },
  { id: '2', name: 'Property Manager', email: 'manager@propertyai.com', role: 'user', status: 'active', lastLogin: '2026-02-08 15:12' },
  { id: '3', name: 'Sarah Wilson', email: 'sarah@propertyai.com', role: 'user', status: 'active', lastLogin: '2026-02-07 09:45' },
  { id: '4', name: 'James Brown', email: 'james@propertyai.com', role: 'user', status: 'inactive', lastLogin: '2026-01-20 14:22' },
];

const DEMO_LOGS: AuditLog[] = [
  { id: '1', user: 'Admin User', action: 'Logged in', timestamp: '2026-02-09 10:30' },
  { id: '2', user: 'Admin User', action: 'Changed role: Sarah Wilson → User', timestamp: '2026-02-09 09:15' },
  { id: '3', user: 'Property Manager', action: 'Logged in', timestamp: '2026-02-08 15:12' },
  { id: '4', user: 'Admin User', action: 'Invited james@propertyai.com', timestamp: '2026-02-06 11:00' },
  { id: '5', user: 'Sarah Wilson', action: 'Logged in', timestamp: '2026-02-07 09:45' },
];

export default function PeopleSection() {
  const { toast } = useToast();
  const [users, setUsers] = useState<SystemUser[]>(DEMO_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'user'>('user');
  const [inviteMessage, setInviteMessage] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast({ title: 'Email required', variant: 'destructive' });
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === inviteEmail.toLowerCase())) {
      toast({ title: 'Duplicate email', description: 'This email is already in the system.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Invite sent', description: `Invitation sent to ${inviteEmail}` });
    setInviteOpen(false);
    setInviteEmail('');
    setInviteRole('user');
    setInviteMessage('');
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
      )
    );
    toast({ title: 'Status updated' });
  };

  const removeUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast({ title: 'User removed' });
  };

  const changeRole = (id: string, role: 'admin' | 'user') => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    toast({ title: 'Role updated' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users…"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Invite New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="invEmail">Email Address</Label>
                    <Input id="invEmail" type="email" placeholder="user@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'admin' | 'user')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="invMsg">Message (optional)</Label>
                    <Textarea id="invMsg" placeholder="Personal note…" value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)} className="resize-none" rows={3} />
                  </div>
                  <Button onClick={handleInvite} className="w-full">
                    <Mail className="h-4 w-4 mr-1.5" />
                    Send Invite
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="card-elevated overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{u.lastLogin}</TableCell>
                    <TableCell>
                      <Badge variant={u.status === 'active' ? 'default' : 'outline'} className="capitalize">
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => changeRole(u.id, u.role === 'admin' ? 'user' : 'admin')}>
                            {u.role === 'admin' ? <ShieldOff className="h-4 w-4 mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                            {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(u.id)}>
                            {u.status === 'active' ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive-foreground">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {u.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => removeUser(u.id)}>Remove</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="mt-4">
          <Card className="card-elevated overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_LOGS.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell className="text-muted-foreground">{log.action}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{log.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
