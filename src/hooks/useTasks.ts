import { useState, useCallback, useMemo } from 'react';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskCategory = 'maintenance' | 'leasing' | 'accounting' | 'compliance' | 'general';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeType: 'user' | 'vendor';
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  propertyId?: string;
  propertyName?: string;
  unitId?: string;
  completedAt?: string;
  createdAt: string;
  reminders: string[];
}

const d = (daysFromNow: number) => new Date(Date.now() + daysFromNow * 86400000).toISOString().split('T')[0];

const initialTasks: Task[] = [
  { id: 'T-001', title: 'Inspect Unit 101 HVAC', description: 'Annual HVAC inspection due', assignee: 'John Admin', assigneeType: 'user', dueDate: d(2), priority: 'high', status: 'todo', category: 'maintenance', propertyId: 'p1', propertyName: 'Sunrise Apartments', unitId: 'u1', createdAt: d(-3), reminders: [d(1)] },
  { id: 'T-002', title: 'Follow up on late rent — Unit 205', description: 'Tenant Mike Davis — 15 days overdue', assignee: 'Admin', assigneeType: 'user', dueDate: d(-1), priority: 'urgent', status: 'in_progress', category: 'accounting', propertyId: 'p1', propertyName: 'Sunrise Apartments', createdAt: d(-5), reminders: [] },
  { id: 'T-003', title: 'Prepare lease renewal offer', description: 'Lease for Unit 302 expires in 45 days', assignee: 'Admin', assigneeType: 'user', dueDate: d(10), priority: 'medium', status: 'todo', category: 'leasing', propertyId: 'p1', propertyName: 'Sunrise Apartments', createdAt: d(-2), reminders: [d(7)] },
  { id: 'T-004', title: 'Schedule pest control', description: 'Quarterly pest control for all units', assignee: 'Fix-It Plumbing', assigneeType: 'vendor', dueDate: d(5), priority: 'low', status: 'todo', category: 'maintenance', propertyId: 'p2', propertyName: 'Oak View Homes', createdAt: d(-1), reminders: [] },
  { id: 'T-005', title: 'Review insurance policy', description: 'Annual insurance renewal deadline', assignee: 'Admin', assigneeType: 'user', dueDate: d(15), priority: 'medium', status: 'done', category: 'compliance', completedAt: d(-1), createdAt: d(-10), reminders: [] },
];

let counter = 6;

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const createTask = useCallback((data: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const task: Task = { ...data, id: `T-${String(counter++).padStart(3, '0')}`, status: 'todo', createdAt: new Date().toISOString() };
    setTasks(prev => [task, ...prev]);
    return task;
  }, []);

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status, completedAt: status === 'done' ? new Date().toISOString() : undefined } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const pendingTasks = useMemo(() => tasks.filter(t => t.status !== 'done'), [tasks]);
  const overdueTasks = useMemo(() => tasks.filter(t => t.status !== 'done' && new Date(t.dueDate) < new Date()), [tasks]);

  return { tasks, pendingTasks, overdueTasks, createTask, updateTaskStatus, deleteTask };
}
