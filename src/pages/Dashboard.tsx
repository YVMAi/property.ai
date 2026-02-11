import { useState } from 'react';
import DashboardPromptBar from '@/components/dashboard/DashboardPromptBar';
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions';
import DashboardFeed from '@/components/dashboard/DashboardFeed';
import DashboardKPIs from '@/components/dashboard/DashboardKPIs';
import CreateTaskDialog from '@/components/dashboard/CreateTaskDialog';
import { useTasks } from '@/hooks/useTasks';
import { toast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { tasks, createTask, updateTaskStatus } = useTasks();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const handleCreateTask = (data: Parameters<typeof createTask>[0]) => {
    createTask(data);
    toast({ title: 'Task created', description: `"${data.title}" has been added.` });
  };

  const handleToggleTask = (id: string) => {
    updateTaskStatus(id, 'done');
    toast({ title: 'Task completed', description: 'Task marked as done.' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* AI Prompt Bar */}
      <DashboardPromptBar />

      {/* Quick Actions */}
      <DashboardQuickActions onCreateTask={() => setTaskDialogOpen(true)} />

      {/* Tasks & Updates Feed */}
      <DashboardFeed
        tasks={tasks}
        onToggleTask={handleToggleTask}
        onCreateTask={() => setTaskDialogOpen(true)}
      />

      {/* Charts & KPIs */}
      <DashboardKPIs />

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
