import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartType, MetricId, DisplayFormat, TimePeriod, RefreshInterval,
  PREDEFINED_METRICS, CHART_TYPE_OPTIONS, ICON_OPTIONS, COLOR_PRESETS,
  DashboardWidget, FormulaFunction, FormulaField,
} from '@/types/dashboard';
import {
  Building2, Users, FileText, ClipboardList, DollarSign, Percent,
  TrendingUp, Calendar, Home, BarChart3, PieChart, Activity, Eye,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Switch } from '@/components/ui/switch';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Building2, Users, FileText, ClipboardList, DollarSign, Percent,
  TrendingUp, Calendar, Home, BarChart3, PieChart, Activity,
};

const FORMULA_FUNCTIONS: FormulaFunction[] = ['SUM', 'AVG', 'COUNT', 'MIN', 'MAX', 'PERCENTAGE'];
const FORMULA_FIELDS: { value: FormulaField; label: string }[] = [
  { value: 'rent_amount', label: 'Rent Amount' },
  { value: 'overdue_amount', label: 'Overdue Amount' },
  { value: 'vacant_days', label: 'Vacant Days' },
  { value: 'lease_count', label: 'Lease Count' },
  { value: 'property_count', label: 'Property Count' },
  { value: 'tenant_count', label: 'Tenant Count' },
];

interface KPIBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (widget: Omit<DashboardWidget, 'id' | 'order'>) => void;
  editWidget?: DashboardWidget | null;
  defaultType?: 'chart' | 'kpi' | null;
}

export default function KPIBuilderModal({ open, onOpenChange, onSave, editWidget, defaultType }: KPIBuilderModalProps) {
  const [chartType, setChartType] = useState<ChartType>('number');
  const [metricId, setMetricId] = useState<MetricId>('total_properties');
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('Building2');
  const [color, setColor] = useState(COLOR_PRESETS[0].value);
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>('number');
  const [showTrend, setShowTrend] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>('this_month');
  const [refresh, setRefresh] = useState<RefreshInterval>('realtime');
  const [formulaFn, setFormulaFn] = useState<FormulaFunction>('SUM');
  const [formulaField, setFormulaField] = useState<FormulaField>('rent_amount');
  const [activeTab, setActiveTab] = useState('config');

  useEffect(() => {
    if (editWidget) {
      setChartType(editWidget.type);
      setMetricId(editWidget.metricId);
      setTitle(editWidget.title);
      setIcon(editWidget.icon);
      setColor(editWidget.color);
      setDisplayFormat(editWidget.displayFormat);
      setShowTrend(editWidget.showTrend);
      setPeriod(editWidget.period);
      setRefresh(editWidget.refresh);
    } else {
      const initialType = defaultType === 'chart' ? 'line' : 'number';
      setChartType(initialType as ChartType);
      setMetricId('total_properties');
      setTitle('');
      setIcon('Building2');
      setColor(COLOR_PRESETS[0].value);
      setDisplayFormat('number');
      setShowTrend(true);
      setPeriod('this_month');
      setRefresh('realtime');
      setActiveTab('config');
    }
  }, [editWidget, open, defaultType]);

  // Auto-fill title from metric
  useEffect(() => {
    if (!editWidget && metricId !== 'custom') {
      const metric = PREDEFINED_METRICS.find(m => m.id === metricId);
      if (metric) {
        setTitle(metric.label);
        setDisplayFormat(metric.defaultFormat);
      }
    }
  }, [metricId, editWidget]);

  const handleSave = () => {
    onSave({
      type: chartType,
      title: title || 'Untitled',
      icon,
      color,
      metricId,
      displayFormat,
      showTrend,
      period,
      refresh,
      customFormula: metricId === 'custom' ? { fn: formulaFn, field: formulaField } : undefined,
    });
    onOpenChange(false);
  };

  const IconComponent = ICON_MAP[icon] || Building2;

  const sampleLineData = [
    { x: 'Aug', y: 42 }, { x: 'Sep', y: 44 }, { x: 'Oct', y: 43 },
    { x: 'Nov', y: 46 }, { x: 'Dec', y: 45 }, { x: 'Jan', y: 48 },
  ];
  const samplePieData = [
    { name: 'A', value: 70, fill: color },
    { name: 'B', value: 30, fill: 'hsl(var(--muted))' },
  ];
  const sampleBarData = [
    { x: 'A', y: 3 }, { x: 'B', y: 1 }, { x: 'C', y: 2 }, { x: 'D', y: 4 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {editWidget ? 'Edit KPI / Chart' : 'Add KPI / Chart'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="config">Configure</TabsTrigger>
            <TabsTrigger value="formula">Metric / Formula</TabsTrigger>
            <TabsTrigger value="preview"><Eye className="h-3.5 w-3.5 mr-1" />Preview</TabsTrigger>
          </TabsList>

          {/* Config Tab */}
          <TabsContent value="config" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CHART_TYPE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Widget title" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={icon} onValueChange={setIcon}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map(ic => {
                      const IC = ICON_MAP[ic] || Building2;
                      return (
                        <SelectItem key={ic} value={ic}>
                          <span className="flex items-center gap-2"><IC className="h-3.5 w-3.5" />{ic}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={displayFormat} onValueChange={(v) => setDisplayFormat(v as DisplayFormat)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="dollar">Dollar ($)</SelectItem>
                    <SelectItem value="percent">Percent (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_PRESETS.map(c => (
                  <button
                    key={c.name}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${color === c.value ? 'border-primary scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setColor(c.value)}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Period</Label>
                <Select value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="last_30">Last 30 Days</SelectItem>
                    <SelectItem value="this_year">This Year</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Refresh</Label>
                <Select value={refresh} onValueChange={(v) => setRefresh(v as RefreshInterval)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Show Trend</Label>
                <div className="pt-2">
                  <Switch checked={showTrend} onCheckedChange={setShowTrend} />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Formula Tab */}
          <TabsContent value="formula" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Metric</Label>
              <Select value={metricId} onValueChange={(v) => setMetricId(v as MetricId)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PREDEFINED_METRICS.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {metricId === 'custom' && (
              <Card className="border-dashed">
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Formula Builder</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Function</Label>
                      <Select value={formulaFn} onValueChange={(v) => setFormulaFn(v as FormulaFunction)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FORMULA_FUNCTIONS.map(fn => (
                            <SelectItem key={fn} value={fn}>{fn}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Field</Label>
                      <Select value={formulaField} onValueChange={(v) => setFormulaField(v as FormulaField)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FORMULA_FIELDS.map(f => (
                            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-xs font-mono text-muted-foreground">
                    = {formulaFn}({FORMULA_FIELDS.find(f => f.value === formulaField)?.label})
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="mt-4">
            <div className="flex justify-center">
              {chartType === 'number' && (
                <Card className="w-56 border-border/40 shadow-soft">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{title || 'Title'}</span>
                      <IconComponent className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">42</div>
                    {showTrend && (
                      <p className="text-[10px] mt-0.5 flex items-center gap-0.5 text-muted-foreground">
                        <TrendingUp className="h-2.5 w-2.5" />+3 this month
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
              {chartType === 'gauge' && (
                <Card className="w-56 border-border/40 shadow-soft">
                  <CardContent className="p-4 flex flex-col items-center">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">{title || 'Title'}</span>
                    <div className="relative w-24 h-24">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
                        <circle cx="50" cy="50" r="40" stroke={color} strokeWidth="8" fill="none" strokeDasharray={`${0.75 * 251.3} 251.3`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">75%</span>
                    </div>
                  </CardContent>
                </Card>
              )}
              {chartType === 'line' && (
                <Card className="w-80 border-border/40 shadow-soft">
                  <CardContent className="p-4">
                    <span className="text-xs font-medium flex items-center gap-1.5 mb-2"><IconComponent className="h-3.5 w-3.5 text-primary" />{title || 'Title'}</span>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={sampleLineData}>
                        <XAxis dataKey="x" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                        <Line type="monotone" dataKey="y" stroke={color} strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
              {chartType === 'bar' && (
                <Card className="w-80 border-border/40 shadow-soft">
                  <CardContent className="p-4">
                    <span className="text-xs font-medium flex items-center gap-1.5 mb-2"><IconComponent className="h-3.5 w-3.5 text-primary" />{title || 'Title'}</span>
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart data={sampleBarData}>
                        <XAxis dataKey="x" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                        <Bar dataKey="y" fill={color} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
              {chartType === 'pie' && (
                <Card className="w-56 border-border/40 shadow-soft">
                  <CardContent className="p-4">
                    <span className="text-xs font-medium flex items-center gap-1.5 mb-2"><IconComponent className="h-3.5 w-3.5 text-primary" />{title || 'Title'}</span>
                    <ResponsiveContainer width="100%" height={120}>
                      <RechartsPie>
                        <Pie data={samplePieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value">
                          {samplePieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Pie>
                      </RechartsPie>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
              {chartType === 'table' && (
                <Card className="w-80 border-border/40 shadow-soft">
                  <CardContent className="p-4">
                    <span className="text-xs font-medium flex items-center gap-1.5 mb-2"><IconComponent className="h-3.5 w-3.5 text-primary" />{title || 'Title'}</span>
                    <div className="text-xs space-y-1">
                      {['Row A — $1,200', 'Row B — $950', 'Row C — $1,100'].map((r, i) => (
                        <div key={i} className="flex justify-between py-1 border-b border-border/30 last:border-0">
                          <span className="text-muted-foreground">{r.split('—')[0]}</span>
                          <span className="font-medium">{r.split('—')[1]}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editWidget ? 'Update' : 'Add Widget'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
