import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useTenantsContext } from '@/contexts/TenantsContext';
import TenantsTable from '@/components/tenants/TenantsTable';
import type { Tenant } from '@/types/tenant';

export default function Tenants() {
  const {
    activeTenants,
    archivedTenants,
    deletedTenants,
    toggleTenantStatus,
    softDeleteTenant,
    restoreTenant,
  } = useTenantsContext();

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddNew = () => navigate('/users/tenants/new');
  const handleEdit = (tenant: Tenant) => navigate(`/users/tenants/${tenant.id}/edit`);
  const handleView = (tenant: Tenant) => navigate(`/users/tenants/${tenant.id}`);

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
          <TabsTrigger value="deleted">Deleted ({deletedTenants.length})</TabsTrigger>
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
            onView={handleView}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
            onSoftDelete={handleSoftDelete}
            onAddNew={handleAddNew}
          />
        </TabsContent>

        <TabsContent value="deleted">
          <TenantsTable
            tenants={deletedTenants}
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
    </div>
  );
}
