export type ChartType = 'number' | 'gauge' | 'line' | 'bar' | 'pie' | 'table';

export type MetricId =
  | 'total_properties'
  | 'active_tenants'
  | 'active_leases'
  | 'pending_tasks'
  | 'monthly_revenue'
  | 'collection_rate'
  | 'occupancy_pct'
  | 'overdue_rent'
  | 'avg_days_vacant'
  | 'renewal_rate'
  | 'zillow_inquiries'
  | 'custom';

export type FormulaFunction = 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX' | 'PERCENTAGE';

export type FormulaField = 'rent_amount' | 'overdue_amount' | 'vacant_days' | 'lease_count' | 'property_count' | 'tenant_count';

export type RefreshInterval = 'realtime' | 'hourly' | 'daily';

export type TimePeriod = 'this_month' | 'last_30' | 'this_year' | 'custom';

export type DisplayFormat = 'dollar' | 'percent' | 'number';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface CustomFormula {
  fn: FormulaFunction;
  field: FormulaField;
  operator?: '+' | '-' | '*' | '/';
  secondField?: FormulaField;
  filter?: string;
}

export interface DashboardWidget {
  id: string;
  type: ChartType;
  title: string;
  icon: string;
  color: string;
  metricId: MetricId;
  customFormula?: CustomFormula;
  displayFormat: DisplayFormat;
  showTrend: boolean;
  trendDirection?: TrendDirection;
  trendLabel?: string;
  period: TimePeriod;
  refresh: RefreshInterval;
  filterGroup?: string;
  value?: string | number;
  chartData?: any[];
  order: number;
  isDefault?: boolean;
}

export const PREDEFINED_METRICS: { id: MetricId; label: string; defaultFormat: DisplayFormat }[] = [
  { id: 'total_properties', label: 'Total Properties', defaultFormat: 'number' },
  { id: 'active_tenants', label: 'Active Tenants', defaultFormat: 'number' },
  { id: 'active_leases', label: 'Active Leases', defaultFormat: 'number' },
  { id: 'pending_tasks', label: 'Pending Tasks', defaultFormat: 'number' },
  { id: 'monthly_revenue', label: 'Monthly Revenue', defaultFormat: 'dollar' },
  { id: 'collection_rate', label: 'Collection Rate', defaultFormat: 'percent' },
  { id: 'occupancy_pct', label: 'Occupancy %', defaultFormat: 'percent' },
  { id: 'overdue_rent', label: 'Overdue Rent', defaultFormat: 'dollar' },
  { id: 'avg_days_vacant', label: 'Avg Days Vacant', defaultFormat: 'number' },
  { id: 'renewal_rate', label: 'Renewal Rate', defaultFormat: 'percent' },
  { id: 'zillow_inquiries', label: 'Zillow Inquiries', defaultFormat: 'number' },
  { id: 'custom', label: 'Custom Formula', defaultFormat: 'number' },
];

export const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: 'number', label: 'Number (Value + Trend)' },
  { value: 'gauge', label: 'Gauge (Progress Circle)' },
  { value: 'line', label: 'Line Chart' },
  { value: 'bar', label: 'Bar Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'table', label: 'Table Snippet' },
];

export const ICON_OPTIONS = [
  'Building2', 'Users', 'FileText', 'ClipboardList', 'DollarSign', 'Percent',
  'TrendingUp', 'Calendar', 'Home', 'BarChart3', 'PieChart', 'Activity',
];

export const COLOR_PRESETS = [
  { name: 'Sage', value: 'hsl(140, 30%, 75%)' },
  { name: 'Sky', value: 'hsl(200, 40%, 75%)' },
  { name: 'Lavender', value: 'hsl(260, 30%, 80%)' },
  { name: 'Peach', value: 'hsl(20, 50%, 80%)' },
  { name: 'Sand', value: 'hsl(40, 40%, 80%)' },
  { name: 'Rose', value: 'hsl(340, 30%, 80%)' },
  { name: 'Mint', value: 'hsl(160, 35%, 75%)' },
  { name: 'Slate', value: 'hsl(210, 15%, 70%)' },
];
