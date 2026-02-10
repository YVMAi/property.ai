import { useState } from 'react';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Search, UserPlus, MoreHorizontal, Shield, ShieldOff, Trash2, Mail, UserX, UserCheck, KeyRound, CalendarIcon, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type UserStatus = 'active' | 'inactive' | 'invitation_accepted';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: UserStatus;
  lastLogin: string;
  lastPasswordReset: string | null;
  isRemoved: boolean;
}

type AuditAction = 'login' | 'invite' | 'role_change' | 'password_reset' | 'status_change' | 'other';

interface AuditLog {
  id: string;
  user: string;
  action: string;
  actionType: AuditAction;
  timestamp: string;
}

const DEMO_USERS: SystemUser[] = [
  { id: '1', name: 'Admin User', email: 'admin@propertyai.com', role: 'admin', status: 'active', lastLogin: '2026-02-09 10:30', lastPasswordReset: '2026-01-15 08:00', isRemoved: false },
  { id: '2', name: 'Property Manager', email: 'manager@propertyai.com', role: 'user', status: 'active', lastLogin: '2026-02-08 15:12', lastPasswordReset: null, isRemoved: false },
  { id: '3', name: 'Sarah Wilson', email: 'sarah@propertyai.com', role: 'user', status: 'invitation_accepted', lastLogin: '2026-02-07 09:45', lastPasswordReset: '2026-02-01 12:00', isRemoved: false },
  { id: '4', name: 'James Brown', email: 'james@propertyai.com', role: 'user', status: 'inactive', lastLogin: '2026-01-20 14:22', lastPasswordReset: null, isRemoved: false },
];

const DEMO_LOGS: AuditLog[] = [
  { id: '1', user: 'Admin User', action: 'Logged in', actionType: 'login', timestamp: '2026-02-09 10:30' },
  { id: '2', user: 'Admin User', action: 'Changed role: Sarah Wilson → User', actionType: 'role_change', timestamp: '2026-02-09 09:15' },
  { id: '3', user: 'Property Manager', action: 'Logged in', actionType: 'login', timestamp: '2026-02-08 15:12' },
  { id: '4', user: 'Admin User', action: 'Invited james@propertyai.com', actionType: 'invite', timestamp: '2026-02-06 11:00' },
  { id: '5', user: 'Sarah Wilson', action: 'Logged in', actionType: 'login', timestamp: '2026-02-07 09:45' },
  { id: '6', user: 'Admin User', action: 'Reset password for Sarah Wilson', actionType: 'password_reset', timestamp: '2026-02-01 12:00' },
  { id: '7', user: 'Admin User', action: 'Deactivated James Brown', actionType: 'status_change', timestamp: '2026-01-25 16:30' },
];

const STATUS_CONFIG: Record<UserStatus, { label: string; variant: 'default' | 'outline' | 'secondary' }> = {
  active: { label: 'Active', variant: 'default' },
  inactive: { label: 'Inactive', variant: 'outline' },
  invitation_accepted: { label: 'Invitation Accepted', variant: 'secondary' },
};

const ACTION_TYPE_LABELS: Record<AuditAction, string> = {
  login: 'Login',
  invite: 'Invite',
  role_change: 'Role Change',
  password_reset: 'Password Reset',
  status_change: 'Status Change',
  other: 'Other',
};

export default function PeopleSection() {
  const { toast } = useToast();
  const [users, setUsers] = useState<SystemUser[]>(DEMO_USERS);
  const [auditLogs] = useState<AuditLog[]>(DEMO_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'user'>('user');
  const [inviteMessage, setInviteMessage] = useState('');

  // Audit log filters
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logActionFilter, setLogActionFilter] = useState<AuditAction | 'all'>('all');
  const [logUserFilter, setLogUserFilter] = useState<string>('all');
  const [logDateFrom, setLogDateFrom] = useState<Date | undefined>(undefined);
  const [logDateTo, setLogDateTo] = useState<Date | undefined>(undefined);

  // Only show non-removed users
  const visibleUsers = users.filter((u) => !u.isRemoved);

  const filteredUsers = visibleUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearchQuery.toLowerCase());
    const matchesAction = logActionFilter === 'all' || log.actionType === logActionFilter;
    const matchesUser = logUserFilter === 'all' || log.user === logUserFilter;

    let matchesDate = true;
    if (logDateFrom || logDateTo) {
      const logDate = parseISO(log.timestamp.replace(' ', 'T'));
      if (logDateFrom && logDateTo) {
        matchesDate = isWithinInterval(logDate, {
          start: startOfDay(logDateFrom),
          end: endOfDay(logDateTo),
        });
      } else if (logDateFrom) {
        matchesDate = logDate >= startOfDay(logDateFrom);
      } else if (logDateTo) {
        matchesDate = logDate <= endOfDay(logDateTo);
      }
    }

    return matchesSearch && matchesAction && matchesUser && matchesDate;
  });

  const hasActiveFilters = logSearchQuery || logActionFilter !== 'all' || logUserFilter !== 'all' || logDateFrom || logDateTo;

  const clearAllFilters = () => {
    setLogSearchQuery('');
    setLogActionFilter('all');
    setLogUserFilter('all');
    setLogDateFrom(undefined);
    setLogDateTo(undefined);
  };

  const exportLogsToCSV = () => {
    if (filteredLogs.length === 0) {
      toast({ title: 'No data to export', description: 'No audit logs match the current filters.', variant: 'destructive' });
      return;
    }

    const headers = ['User', 'Action', 'Type', 'Timestamp'];
    const rows = filteredLogs.map((log) => [
      log.user,
      log.action,
      ACTION_TYPE_LABELS[log.actionType],
      log.timestamp,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const dateRange = logDateFrom && logDateTo
      ? `_${format(logDateFrom, 'yyyy-MM-dd')}_to_${format(logDateTo, 'yyyy-MM-dd')}`
      : '';
    link.download = `audit_logs${dateRange}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: 'Export complete', description: `${filteredLogs.length} audit log(s) exported.` });
  };

  const uniqueLogUsers = [...new Set(auditLogs.map((l) => l.user))];

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast({ title: 'Email required', variant: 'destructive' });
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === inviteEmail.toLowerCase() && !u.isRemoved)) {
      toast({ title: 'Duplicate email', description: 'This email is already in the system.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Invite sent', description: `Invitation sent to ${inviteEmail}` });
    setInviteOpen(false);
    setInviteEmail('');
    setInviteRole('user');
    setInviteMessage('');
  };

  const deactivateUser = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: 'inactive' as UserStatus } : u
      )
    );
    toast({ title: 'User deactivated', description: 'The user has been deactivated.' });
  };

  const activateUser = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: 'active' as UserStatus } : u
      )
    );
    toast({ title: 'User activated', description: 'The user has been activated.' });
  };

  const removeUser = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, isRemoved: true, status: 'inactive' as UserStatus } : u
      )
    );
    toast({ title: 'User removed', description: 'The user has been soft-deleted.' });
  };

  const changeRole = (id: string, role: 'admin' | 'user') => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    toast({ title: 'Role updated' });
  };

  const resetPassword = (user: SystemUser) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, lastPasswordReset: new Date().toISOString().slice(0, 16).replace('T', ' ') }
          : u
      )
    );
    toast({
      title: 'Password reset link sent',
      description: `A reset password link has been sent to ${user.email}.`,
    });
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
                    <SearchableSelect
                      options={[
                        { value: 'admin', label: 'Admin' },
                        { value: 'user', label: 'User' },
                      ]}
                      value={inviteRole}
                      onValueChange={(v) => setInviteRole(v as 'admin' | 'user')}
                    />
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
                  <TableHead>Last Password Reset</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => {
                  const statusConfig = STATUS_CONFIG[u.status];
                  return (
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
                        <Badge variant={statusConfig.variant} className="capitalize whitespace-nowrap">
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {u.lastPasswordReset ?? '—'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* Role toggle */}
                            <DropdownMenuItem onClick={() => changeRole(u.id, u.role === 'admin' ? 'user' : 'admin')}>
                              {u.role === 'admin' ? <ShieldOff className="h-4 w-4 mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                              {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                            </DropdownMenuItem>

                            {/* Reset Password */}
                            <DropdownMenuItem onClick={() => resetPassword(u)}>
                              <KeyRound className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Deactivate / Activate */}
                            {u.status !== 'inactive' ? (
                              <DropdownMenuItem onClick={() => deactivateUser(u.id)}>
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => activateUser(u.id)}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}

                            {/* Remove (soft delete) */}
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
                                    Are you sure you want to remove {u.name}? The user will be soft-deleted and hidden from the list.
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
                  );
                })}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="mt-4 space-y-4">
          {/* Audit Filters Row 1: Search + Dropdowns */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs…"
                className="pl-9"
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
              />
            </div>
            <SearchableSelect
              options={[{ value: 'all', label: 'All Actions' }, ...Object.entries(ACTION_TYPE_LABELS).map(([key, label]) => ({ value: key, label }))]}
              value={logActionFilter}
              onValueChange={(v) => setLogActionFilter(v as AuditAction | 'all')}
              placeholder="Filter by action"
              triggerClassName="w-full sm:w-48"
            />
            <SearchableSelect
              options={[{ value: 'all', label: 'All Users' }, ...uniqueLogUsers.map((name) => ({ value: name, label: name }))]}
              value={logUserFilter}
              onValueChange={setLogUserFilter}
              placeholder="Filter by user"
              triggerClassName="w-full sm:w-48"
            />
          </div>

          {/* Audit Filters Row 2: Date Range + Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full sm:w-48 justify-start text-left font-normal',
                    !logDateFrom && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {logDateFrom ? format(logDateFrom, 'PPP') : 'From date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={logDateFrom}
                  onSelect={setLogDateFrom}
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full sm:w-48 justify-start text-left font-normal',
                    !logDateTo && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {logDateTo ? format(logDateTo, 'PPP') : 'To date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={logDateTo}
                  onSelect={setLogDateTo}
                  disabled={(date) => logDateFrom ? date < logDateFrom : false}
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2 ml-auto">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground"
                >
                  Clear filters
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={exportLogsToCSV}>
                <Download className="h-4 w-4 mr-1.5" />
                Export CSV
              </Button>
            </div>
          </div>

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
                    <TableHead>Type</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell className="text-muted-foreground">{log.action}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs">
                          {ACTION_TYPE_LABELS[log.actionType]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{log.timestamp}</TableCell>
                    </TableRow>
                  ))}
                  {filteredLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No audit logs match the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
