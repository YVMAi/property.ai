import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useTenants } from '@/hooks/useTenants';
import TenantsTable from '@/components/tenants/TenantsTable';
import TenantFormDialog from '@/components/tenants/TenantFormDialog';
import TenantDashboard from '@/components/tenants/TenantDashboard';
import type { Tenant, TenantFormData } from '@/types/tenant';

export default function Tenants() {
  const {
    activeTenants,
    archivedTenants,
    getAllEmails,
    addTenant,
    updateTenant,
    toggleTenantStatus,
    softDeleteTenant,
    restoreTenant,
    runBGV,
    resendInvite,
    updateNotes,
  } = useTenants();

  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);

  const handleAddNew = () => {
    setEditingTenant(null);
    setFormOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormOpen(true);
  };

  const handleView = (tenant: Tenant) => {
    setViewingTenant(tenant);
  };

  const handleSave = (data: TenantFormData) => {
    if (editingTenant) {
      updateTenant(editingTenant.id, data);
    } else {
      const newTenant = addTenant(data);
      if (data.bgvEnabled) {
        runBGV(newTenant.id);
      }
    }
  };

  const handleToggleStatus = (id: string) => {
    toggleTenantStatus(id);
    toast({ title: 'Status updated', description: 'Tenant status has been changed.' });
  };

  const handleSoftDelete = (id: string) => {
    softDeleteTenant(id);
    toast({ title: 'Tenant archived', description: 'Tenant has been moved to the archive.' });
  };

  const handleRestore = (id: string) => {
    restoreTenant(id);
    toast({ title: 'Tenant restored', description: 'Tenant has been restored to the active list.' });
  };

  const handleRunBGV = (id: string) => {
    runBGV(id);
    toast({ title: 'BGV initiated', description: 'Background verification is running. Results will appear shortly.' });
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    updateNotes(id, notes);
    toast({ title: 'Notes saved', description: 'Tenant notes have been updated.' });
  };

  // Keep viewing tenant in sync with latest data
  const currentViewingTenant = viewingTenant
    ? [...activeTenants, ...archivedTenants].find((t) => t.id === viewingTenant.id) || viewingTenant
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Tenants</h1>
        <div className="h-1 w-16 bg-secondary rounded-full mt-2" />
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active ({activeTenants.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archivedTenants.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <TenantsTable
            tenants={activeTenants}
            onView={handleView}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
            onSoftDelete={handleSoftDelete}
            onAddNew={handleAddNew}
          />
        </TabsContent>

        <TabsContent value="archived">
          <TenantsTable
            tenants={archivedTenants}
            isArchived
            onView={handleView}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
            onSoftDelete={handleSoftDelete}
            onRestore={handleRestore}
            onAddNew={handleAddNew}
          />
        </TabsContent>
      </Tabs>

      <TenantFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingTenant(null); }}
        onSave={handleSave}
        existingEmails={getAllEmails(editingTenant?.id)}
        editingTenant={editingTenant}
        onResendInvite={resendInvite}
      />

      {currentViewingTenant && (
        <TenantDashboard
          open={!!currentViewingTenant}
          onClose={() => setViewingTenant(null)}
          tenant={currentViewingTenant}
          onRunBGV={handleRunBGV}
          onUpdateNotes={handleUpdateNotes}
        />
      )}
    </div>
  );
}
