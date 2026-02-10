import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useVendorsContext } from '@/contexts/VendorsContext';
import VendorsTable from '@/components/vendors/VendorsTable';
import type { VendorStatus } from '@/types/vendor';

export default function Vendors() {
  const {
    activeVendors,
    archivedVendors,
    blacklistedVendors,
    changeStatus,
    softDeleteVendor,
    restoreVendor,
  } = useVendorsContext();

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddNew = () => navigate('/users/vendors/new');
  const handleView = (vendor: { id: string }) => navigate(`/users/vendors/${vendor.id}`);
  const handleEdit = (vendor: { id: string }) => navigate(`/users/vendors/${vendor.id}/edit`);

  const handleChangeStatus = (id: string, status: VendorStatus) => {
    changeStatus(id, status);
    toast({ title: 'Status updated', description: `Vendor status changed to ${status}.` });
  };

  const handleSoftDelete = (id: string) => {
    const result = softDeleteVendor(id);
    if (result) {
      toast({ title: 'Vendor deleted', description: 'Vendor has been soft deleted.' });
    } else {
      toast({ title: 'Cannot delete', description: 'Vendor has active work orders.', variant: 'destructive' });
    }
    return result;
  };

  const handleRestore = (id: string) => {
    restoreVendor(id);
    toast({ title: 'Vendor restored', description: 'Vendor has been restored to active list.' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Vendors</h1>
        <div className="h-1 w-16 bg-secondary rounded-full mt-2" />
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active ({activeVendors.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archivedVendors.length})</TabsTrigger>
          <TabsTrigger value="blacklisted">Blacklisted ({blacklistedVendors.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <VendorsTable
            vendors={activeVendors}
            tab="active"
            onView={handleView}
            onEdit={handleEdit}
            onChangeStatus={handleChangeStatus}
            onSoftDelete={handleSoftDelete}
            onAddNew={handleAddNew}
          />
        </TabsContent>

        <TabsContent value="archived">
          <VendorsTable
            vendors={archivedVendors}
            tab="archived"
            onView={handleView}
            onEdit={handleEdit}
            onChangeStatus={handleChangeStatus}
            onSoftDelete={handleSoftDelete}
            onRestore={handleRestore}
            onAddNew={handleAddNew}
          />
        </TabsContent>

        <TabsContent value="blacklisted">
          <VendorsTable
            vendors={blacklistedVendors}
            tab="blacklisted"
            onView={handleView}
            onEdit={handleEdit}
            onChangeStatus={handleChangeStatus}
            onSoftDelete={handleSoftDelete}
            onAddNew={handleAddNew}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
