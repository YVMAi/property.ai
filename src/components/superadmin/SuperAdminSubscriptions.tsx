import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SUBSCRIPTION_PLANS, PLAN_BADGE_COLORS } from '@/types/superAdmin';
import { MoreHorizontal, ArrowUpCircle, ArrowDownCircle, CreditCard, Check } from 'lucide-react';

export default function SuperAdminSubscriptions() {
  const { pmcs } = useSuperAdmin();

  // Plan summary
  const planCounts = {
    basic: pmcs.filter(p => p.subscriptionPlan === 'basic').length,
    pro: pmcs.filter(p => p.subscriptionPlan === 'pro').length,
    pro_max: pmcs.filter(p => p.subscriptionPlan === 'pro_max').length,
    custom: pmcs.filter(p => p.subscriptionPlan === 'custom').length,
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SUBSCRIPTION_PLANS.map(plan => (
          <Card key={plan.id} className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`${PLAN_BADGE_COLORS[plan.type]}`}>
                  {plan.name}
                </Badge>
                <span className="text-xs text-muted-foreground">{planCounts[plan.type]} PMCs</span>
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold text-foreground">${plan.priceMonthly}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <p className="text-xs text-muted-foreground">${plan.priceAnnual}/yr (save {Math.round((1 - plan.priceAnnual / (plan.priceMonthly * 12)) * 100)}%)</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Users: {plan.userLimit === -1 ? 'Unlimited' : plan.userLimit} | Storage: {plan.storageGB} GB</p>
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-1.5 text-xs text-foreground">
                    <Check className="h-3 w-3 text-secondary-foreground" />
                    {f}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* PMC Subscription Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">PMC Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PMC</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead className="text-right">Revenue YTD</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pmcs.map(pmc => {
                  const plan = SUBSCRIPTION_PLANS.find(p => p.type === pmc.subscriptionPlan);
                  return (
                    <TableRow key={pmc.id}>
                      <TableCell className="font-medium">{pmc.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${PLAN_BADGE_COLORS[pmc.subscriptionPlan]}`}>
                          {pmc.subscriptionPlan.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">${plan?.priceMonthly || '—'}/mo</TableCell>
                      <TableCell className="text-sm">{pmc.usersUsed}{pmc.userLimit > 0 ? `/${pmc.userLimit}` : '/∞'}</TableCell>
                      <TableCell className="text-sm">{pmc.storageUsedGB}/{pmc.storageQuotaGB} GB</TableCell>
                      <TableCell className="text-right font-medium">${pmc.revenueYTD.toLocaleString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2"><ArrowUpCircle className="h-3.5 w-3.5" /> Upgrade</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2"><ArrowDownCircle className="h-3.5 w-3.5" /> Downgrade</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2"><CreditCard className="h-3.5 w-3.5" /> Payment History</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
