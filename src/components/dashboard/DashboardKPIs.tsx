import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  Building2, Users, FileText, ClipboardList, TrendingUp, DollarSign, Percent,
  Calendar, Home, BarChart3, PieChart as PieChartIcon, Activity,
  Plus, Pencil, Trash2, Copy, Settings2, RotateCcw,
} from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useDashboardKPIs } from '@/hooks/useDashboardKPIs';
import KPIBuilderModal from './KPIBuilderModal';
import { DashboardWidget } from '@/types/dashboard';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Building2, Users, FileText, ClipboardList, DollarSign, Percent,
  TrendingUp, Calendar, Home, BarChart3, PieChart: PieChartIcon, Activity,
};

const trendColors: Record<string, string> = {
  up: 'text-success-foreground',
  down: 'text-destructive-foreground',
  neutral: 'text-muted-foreground',
};

export default function DashboardKPIs() {
  const { formatAmount, formatCompact, currencySymbol } = useCurrency();
  const {
    kpiWidgets, chartWidgets, editMode, setEditMode,
    addWidget, updateWidget, deleteWidget, duplicateWidget, resetToDefaults,
  } = useDashboardKPIs();

  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);

  const handleSave = (widget: Omit<DashboardWidget, 'id' | 'order'>) => {
    if (editingWidget) {
      updateWidget(editingWidget.id, widget);
      toast({ title: 'Widget updated', description: `"${widget.title}" has been updated.` });
    } else {
      addWidget(widget);
      toast({ title: 'Widget added', description: `"${widget.title}" has been created.` });
    }
    setEditingWidget(null);
  };

  const handleEdit = (widget: DashboardWidget) => {
    setEditingWidget(widget);
    setBuilderOpen(true);
  };

  const handleDelete = (widget: DashboardWidget) => {
    deleteWidget(widget.id);
    toast({ title: 'Widget removed', description: `"${widget.title}" has been deleted.` });
  };

  const handleDuplicate = (widget: DashboardWidget) => {
    duplicateWidget(widget.id);
    toast({ title: 'Widget duplicated', description: `Copy of "${widget.title}" created.` });
  };

  const handleAdd = (defaultType?: 'chart' | 'kpi') => {
    setEditingWidget(null);
    setBuilderOpen(true);
    setBuilderDefaultType(defaultType || null);
  };

  const [builderDefaultType, setBuilderDefaultType] = useState<'chart' | 'kpi' | null>(null);

  const WidgetHoverMenu = ({ widget }: { widget: DashboardWidget }) => {
    if (!editMode) return null;
    return (
      <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 bg-background/80 backdrop-blur-sm shadow-sm">
              <Settings2 className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem onClick={() => handleEdit(widget)}>
              <Pencil className="h-3 w-3 mr-2" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDuplicate(widget)}>
              <Copy className="h-3 w-3 mr-2" />Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(widget)} className="text-destructive">
              <Trash2 className="h-3 w-3 mr-2" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const renderKPICard = (widget: DashboardWidget) => {
    const Icon = ICON_MAP[widget.icon] || Building2;
    return (
      <Card key={widget.id} className={`group relative border-border/40 shadow-soft transition-all ${editMode ? 'ring-1 ring-dashed ring-primary/20 hover:ring-primary/50' : ''}`}>
        <WidgetHoverMenu widget={widget} />
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{widget.title}</span>
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="text-xl font-bold text-foreground">
            {widget.displayFormat === 'dollar' ? formatCompact(parseFloat(String(widget.value).replace(/[^0-9.]/g, '')) || 0) : widget.value}
          </div>
          {widget.showTrend && widget.trendLabel && (
            <p className={`text-[10px] mt-0.5 flex items-center gap-0.5 ${trendColors[widget.trendDirection || 'neutral']}`}>
              <TrendingUp className="h-2.5 w-2.5" />
              {widget.trendLabel}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderChartWidget = (widget: DashboardWidget) => {
    const Icon = ICON_MAP[widget.icon] || Building2;
    return (
      <Card key={widget.id} className={`group relative border-border/40 shadow-soft transition-all ${editMode ? 'ring-1 ring-dashed ring-primary/20 hover:ring-primary/50' : ''}`}>
        <WidgetHoverMenu widget={widget} />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            {widget.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {widget.type === 'line' && (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={widget.chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} label={{ value: 'Month', position: 'insideBottom', offset: -2, fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} tickFormatter={(v) => formatCompact(v)} label={{ value: 'Revenue', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip formatter={(v: number) => [formatAmount(v), 'Revenue']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
          {widget.type === 'pie' && (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={widget.chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                  {widget.chartData?.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {widget.type === 'bar' && (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={widget.chartData}>
                <XAxis dataKey="property" tick={{ fontSize: 10 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} label={{ value: 'Property', position: 'insideBottom', offset: -2, fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} allowDecimals={false} label={{ value: 'Vacancies', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="vacant" name="Vacant Units" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {widget.type === 'gauge' && (
            <div className="flex justify-center py-4">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
                  <circle cx="50" cy="50" r="40" stroke={widget.color} strokeWidth="8" fill="none" strokeDasharray={`${0.75 * 251.3} 251.3`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{widget.value || '75%'}</span>
              </div>
            </div>
          )}
          {widget.type === 'table' && (
            <div className="text-xs space-y-1">
              {['Property A — $1,200', 'Property B — $950', 'Property C — $1,100'].map((r, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-border/30 last:border-0">
                  <span className="text-muted-foreground">{r.split('—')[0]}</span>
                  <span className="font-medium">{r.split('—')[1]}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Charts & KPIs</h2>
        <div className="flex items-center gap-2">
          {editMode && (
            <>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { resetToDefaults(); toast({ title: 'Reset', description: 'Dashboard reset to defaults.' }); }}>
                <RotateCcw className="h-3 w-3 mr-1" />Reset
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleAdd()}>
                <Plus className="h-3 w-3 mr-1" />Add Widget
              </Button>
            </>
          )}
          <Button
            variant={editMode ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setEditMode(!editMode)}
          >
            <Settings2 className="h-3 w-3 mr-1" />
            {editMode ? 'Done' : 'Customize'}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {kpiWidgets.map(renderKPICard)}
        {editMode && (
          <Card
            className="border-dashed border-2 border-primary/20 shadow-none cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center min-h-[90px]"
            onClick={() => handleAdd('kpi')}
          >
            <CardContent className="p-3 flex flex-col items-center gap-1">
              <Plus className="h-5 w-5 text-primary/50" />
              <span className="text-[10px] text-muted-foreground">Add KPI</span>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {chartWidgets.map(renderChartWidget)}
        {editMode && (
          <Card
            className="border-dashed border-2 border-primary/20 shadow-none cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center min-h-[200px]"
            onClick={() => handleAdd('chart')}
          >
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <Plus className="h-6 w-6 text-primary/50" />
              <span className="text-xs text-muted-foreground">Add Chart</span>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Builder Modal */}
      <KPIBuilderModal
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        onSave={handleSave}
        editWidget={editingWidget}
        defaultType={builderDefaultType}
      />
    </div>
  );
}
