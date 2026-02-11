import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, FileText, ClipboardList, TrendingUp, DollarSign, Percent, Calendar } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
  { title: 'Total Properties', value: '24', icon: Building2, change: '+2 this month', trend: 'up' },
  { title: 'Active Tenants', value: '156', icon: Users, change: '+12 this month', trend: 'up' },
  { title: 'Active Leases', value: '142', icon: FileText, change: '98% occupancy', trend: 'up' },
  { title: 'Pending Tasks', value: '4', icon: ClipboardList, change: '1 overdue', trend: 'down' },
  { title: 'Monthly Revenue', value: '$48,250', icon: DollarSign, change: '+5.2% vs last month', trend: 'up' },
  { title: 'Collection Rate', value: '93.4%', icon: Percent, change: '$3,200 outstanding', trend: 'neutral' },
];

const revenueTrend = [
  { month: 'Aug', revenue: 42000 },
  { month: 'Sep', revenue: 44500 },
  { month: 'Oct', revenue: 43800 },
  { month: 'Nov', revenue: 46200 },
  { month: 'Dec', revenue: 45900 },
  { month: 'Jan', revenue: 48250 },
];

const occupancyData = [
  { name: 'Occupied', value: 142, fill: 'hsl(var(--secondary))' },
  { name: 'Vacant', value: 3, fill: 'hsl(var(--muted))' },
];

const vacancyData = [
  { property: 'Sunrise', vacant: 1 },
  { property: 'Oak View', vacant: 1 },
  { property: 'Maple', vacant: 0 },
  { property: 'Elm St', vacant: 1 },
];

const trendColors: Record<string, string> = {
  up: 'text-success-foreground',
  down: 'text-destructive-foreground',
  neutral: 'text-muted-foreground',
};

export default function DashboardKPIs() {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Charts & KPIs</h2>

      {/* KPI Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-border/40 shadow-soft">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{stat.title}</span>
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                <p className={`text-[10px] mt-0.5 flex items-center gap-0.5 ${trendColors[stat.trend]}`}>
                  <TrendingUp className="h-2.5 w-2.5" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/40 shadow-soft lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={revenueTrend}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={occupancyData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                  {occupancyData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Vacancies by Property
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={vacancyData}>
                <XAxis dataKey="property" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="vacant" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
