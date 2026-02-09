import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useOwnersContext } from '@/contexts/OwnersContext';
import OwnersTable from '@/components/owners/OwnersTable';

export default function Owners() {
  const {
    activeOwners,
    archivedOwners,
    toggleOwnerStatus,
    softDeleteOwner,
    restoreOwner,
  } = useOwnersContext();

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddNew = () => {
    navigate('/users/owners/new');
  };

  const handleEdit = (owner: { id: string }) => {
    navigate(`/users/owners/${owner.id}/edit`);
  };

  const handleToggleStatus = (id: string) => {
    toggleOwnerStatus(id);
    toast({ title: 'Status updated', description: 'Owner status has been changed.' });
  };

  const handleSoftDelete = (id: string) => {
    softDeleteOwner(id);
    toast({ title: 'Owner archived', description: 'Owner has been moved to the archive.' });
  };

  const handleRestore = (id: string) => {
    restoreOwner(id);
    toast({ title: 'Owner restored', description: 'Owner has been restored to the active list.' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Owners</h1>
        <div className="h-1 w-16 bg-secondary rounded-full mt-2" />
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeOwners.length})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived ({archivedOwners.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <OwnersTable
            owners={activeOwners}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
            onSoftDelete={handleSoftDelete}
            onAddNew={handleAddNew}
          />
        </TabsContent>

        <TabsContent value="archived">
          <OwnersTable
            owners={archivedOwners}
            isArchived
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
