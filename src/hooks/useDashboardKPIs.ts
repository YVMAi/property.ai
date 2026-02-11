import { useState, useCallback } from 'react';
import { DashboardWidget, MetricId } from '@/types/dashboard';

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

const DEFAULT_KPI_WIDGETS: DashboardWidget[] = [
  { id: 'default-1', type: 'number', title: 'Total Properties', icon: 'Building2', color: 'hsl(140, 30%, 75%)', metricId: 'total_properties', displayFormat: 'number', showTrend: true, trendDirection: 'up', trendLabel: '+2 this month', period: 'this_month', refresh: 'realtime', value: '24', order: 0, isDefault: true },
  { id: 'default-2', type: 'number', title: 'Active Tenants', icon: 'Users', color: 'hsl(200, 40%, 75%)', metricId: 'active_tenants', displayFormat: 'number', showTrend: true, trendDirection: 'up', trendLabel: '+12 this month', period: 'this_month', refresh: 'realtime', value: '156', order: 1, isDefault: true },
  { id: 'default-3', type: 'number', title: 'Active Leases', icon: 'FileText', color: 'hsl(260, 30%, 80%)', metricId: 'active_leases', displayFormat: 'number', showTrend: true, trendDirection: 'up', trendLabel: '98% occupancy', period: 'this_month', refresh: 'realtime', value: '142', order: 2, isDefault: true },
  { id: 'default-4', type: 'number', title: 'Pending Tasks', icon: 'ClipboardList', color: 'hsl(20, 50%, 80%)', metricId: 'pending_tasks', displayFormat: 'number', showTrend: true, trendDirection: 'down', trendLabel: '1 overdue', period: 'this_month', refresh: 'realtime', value: '4', order: 3, isDefault: true },
  { id: 'default-5', type: 'number', title: 'Monthly Revenue', icon: 'DollarSign', color: 'hsl(40, 40%, 80%)', metricId: 'monthly_revenue', displayFormat: 'dollar', showTrend: true, trendDirection: 'up', trendLabel: '+5.2% vs last month', period: 'this_month', refresh: 'realtime', value: '$48,250', order: 4, isDefault: true },
  { id: 'default-6', type: 'number', title: 'Collection Rate', icon: 'Percent', color: 'hsl(340, 30%, 80%)', metricId: 'collection_rate', displayFormat: 'percent', showTrend: true, trendDirection: 'neutral', trendLabel: '$3,200 outstanding', period: 'this_month', refresh: 'realtime', value: '93.4%', order: 5, isDefault: true },
];

const DEFAULT_CHART_WIDGETS: DashboardWidget[] = [
  { id: 'default-chart-1', type: 'line', title: 'Revenue Trend', icon: 'DollarSign', color: 'hsl(140, 30%, 75%)', metricId: 'monthly_revenue', displayFormat: 'dollar', showTrend: false, period: 'this_year', refresh: 'daily', chartData: revenueTrend, order: 6, isDefault: true },
  { id: 'default-chart-2', type: 'pie', title: 'Occupancy', icon: 'Building2', color: 'hsl(200, 40%, 75%)', metricId: 'occupancy_pct', displayFormat: 'percent', showTrend: false, period: 'this_month', refresh: 'daily', chartData: occupancyData, order: 7, isDefault: true },
  { id: 'default-chart-3', type: 'bar', title: 'Vacancies by Property', icon: 'Calendar', color: 'hsl(40, 40%, 80%)', metricId: 'avg_days_vacant', displayFormat: 'number', showTrend: false, period: 'this_month', refresh: 'daily', chartData: vacancyData, order: 8, isDefault: true },
];

// Mock metric resolver
function resolveMetricValue(metricId: MetricId): { value: string; trend: string; direction: 'up' | 'down' | 'neutral' } {
  const metrics: Record<string, { value: string; trend: string; direction: 'up' | 'down' | 'neutral' }> = {
    total_properties: { value: '24', trend: '+2 this month', direction: 'up' },
    active_tenants: { value: '156', trend: '+12 this month', direction: 'up' },
    active_leases: { value: '142', trend: '98% occupancy', direction: 'up' },
    pending_tasks: { value: '4', trend: '1 overdue', direction: 'down' },
    monthly_revenue: { value: '$48,250', trend: '+5.2% vs last month', direction: 'up' },
    collection_rate: { value: '93.4%', trend: '$3,200 outstanding', direction: 'neutral' },
    occupancy_pct: { value: '97.9%', trend: '+0.5% this month', direction: 'up' },
    overdue_rent: { value: '$3,200', trend: '2 tenants', direction: 'down' },
    avg_days_vacant: { value: '12', trend: '-3 vs last month', direction: 'up' },
    renewal_rate: { value: '88%', trend: '+2% this quarter', direction: 'up' },
    zillow_inquiries: { value: '47', trend: '+8 this week', direction: 'up' },
  };
  return metrics[metricId] || { value: '—', trend: '', direction: 'neutral' as const };
}

function generateSampleChartData(type: 'line' | 'bar' | 'pie') {
  if (type === 'line') return revenueTrend;
  if (type === 'pie') return occupancyData;
  return vacancyData;
}

export function useDashboardKPIs() {
  const [kpiWidgets, setKpiWidgets] = useState<DashboardWidget[]>(DEFAULT_KPI_WIDGETS);
  const [chartWidgets, setChartWidgets] = useState<DashboardWidget[]>(DEFAULT_CHART_WIDGETS);
  const [editMode, setEditMode] = useState(false);

  const addWidget = useCallback((widget: Omit<DashboardWidget, 'id' | 'order'>) => {
    const id = `custom-${Date.now()}`;
    const isChart = ['line', 'bar', 'pie', 'gauge', 'table'].includes(widget.type);
    const resolved = resolveMetricValue(widget.metricId);
    const newWidget: DashboardWidget = {
      ...widget,
      id,
      order: isChart ? chartWidgets.length : kpiWidgets.length,
      value: widget.type === 'number' ? resolved.value : widget.value,
      trendLabel: widget.showTrend ? resolved.trend : undefined,
      trendDirection: widget.showTrend ? resolved.direction : undefined,
      chartData: isChart ? generateSampleChartData(widget.type as 'line' | 'bar' | 'pie') : undefined,
    };
    if (isChart) {
      setChartWidgets(prev => [...prev, newWidget]);
    } else {
      setKpiWidgets(prev => [...prev, newWidget]);
    }
  }, [kpiWidgets.length, chartWidgets.length]);

  const updateWidget = useCallback((id: string, updates: Partial<DashboardWidget>) => {
    setKpiWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    setChartWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  const deleteWidget = useCallback((id: string) => {
    setKpiWidgets(prev => prev.filter(w => w.id !== id));
    setChartWidgets(prev => prev.filter(w => w.id !== id));
  }, []);

  const duplicateWidget = useCallback((id: string) => {
    const widget = [...kpiWidgets, ...chartWidgets].find(w => w.id === id);
    if (!widget) return;
    const { id: _, order: __, isDefault: ___, ...rest } = widget;
    addWidget({ ...rest, title: `${rest.title} (Copy)` });
  }, [kpiWidgets, chartWidgets, addWidget]);

  const resetToDefaults = useCallback(() => {
    setKpiWidgets(DEFAULT_KPI_WIDGETS);
    setChartWidgets(DEFAULT_CHART_WIDGETS);
  }, []);

  return {
    kpiWidgets,
    chartWidgets,
    editMode,
    setEditMode,
    addWidget,
    updateWidget,
    deleteWidget,
    duplicateWidget,
    resetToDefaults,
    resolveMetricValue,
  };
}
