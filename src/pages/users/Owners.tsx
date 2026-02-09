import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useOwners } from '@/hooks/useOwners';
import OwnersTable from '@/components/owners/OwnersTable';
import OwnerWizard from '@/components/owners/OwnerWizard';
import type { Owner, OwnerFormData } from '@/types/owner';

export default function Owners() {
  const {
    activeOwners,
    archivedOwners,
    addOwner,
    updateOwner,
    toggleOwnerStatus,
    softDeleteOwner,
    restoreOwner,
  } = useOwners();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const { toast } = useToast();

  const handleAddNew = () => {
    setEditingOwner(null);
    setWizardOpen(true);
  };

  const handleEdit = (owner: Owner) => {
    setEditingOwner(owner);
    setWizardOpen(true);
  };

  const handleSave = (data: OwnerFormData) => {
    if (editingOwner) {
      updateOwner(editingOwner.id, data);
    } else {
      addOwner(data);
    }
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
        <p className="text-muted-foreground mt-1">
          Manage property owners, their details, emails, and linked properties.
        </p>
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

      <OwnerWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSave={handleSave}
        editingOwner={editingOwner}
      />
    </div>
  );
}
