import { useState } from 'react';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, Download, AlertCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import { LogSeverity, LogType } from '@/types/superAdmin';

const SEVERITY_CONFIG: Record<LogSeverity, { icon: typeof Info; color: string }> = {
  info: { icon: Info, color: 'bg-primary/15 text-primary-foreground' },
  warning: { icon: AlertTriangle, color: 'bg-warning/15 text-warning-foreground' },
  error: { icon: AlertCircle, color: 'bg-destructive/15 text-destructive-foreground' },
  critical: { icon: XCircle, color: 'bg-destructive/30 text-destructive-foreground' },
};

const TYPE_LABELS: Record<LogType, string> = {
  login: 'Login', data_edit: 'Data Edit', error: 'Error',
  payment: 'Payment', system: 'System', subscription: 'Subscription',
};

export default function SuperAdminLogs() {
  const { getFilteredLogs, pmcs } = useSuperAdmin();
  const [search, setSearch] = useState('');
  const [pmcFilter, setPmcFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const logs = getFilteredLogs({
    pmcId: pmcFilter !== 'all' ? pmcFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter as LogType : undefined,
    severity: severityFilter !== 'all' ? severityFilter as LogSeverity : undefined,
    search: search || undefined,
  });

  return (
    <Card className="border-border/50 mt-4">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-lg">System Logs</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 w-44" />
            </div>
            <Select value={pmcFilter} onValueChange={setPmcFilter}>
              <SelectTrigger className="w-36 h-9"><SelectValue placeholder="PMC" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All PMCs</SelectItem>
                {pmcs.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Export</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>PMC</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map(log => {
                const sev = SEVERITY_CONFIG[log.severity];
                const SevIcon = sev.icon;
                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.date).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{log.pmcName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.userName || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{TYPE_LABELS[log.type]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] gap-1 ${sev.color}`}>
                        <SevIcon className="h-3 w-3" />
                        {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-md truncate">{log.details}</TableCell>
                  </TableRow>
                );
              })}
              {logs.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No logs match your filters</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
