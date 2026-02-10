import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { OwnersProvider } from "@/contexts/OwnersContext";
import { TenantsProvider } from "@/contexts/TenantsContext";
import { VendorsProvider } from "@/contexts/VendorsContext";
import { PropertiesProvider } from "@/contexts/PropertiesContext";
import { PropertyGroupsProvider } from "@/contexts/PropertyGroupsContext";
import { BankAccountsProvider } from "@/contexts/BankAccountsContext";
import { WorkOrdersProvider } from "@/contexts/WorkOrdersContext";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Accounting from "./pages/Accounting";
import Tasks from "./pages/Tasks";
import Leases from "./pages/Leases";
import Properties from "./pages/Properties";
import PropertyFormPage from "./pages/properties/PropertyFormPage";
import PropertyViewPage from "./pages/properties/PropertyViewPage";
import Owners from "./pages/users/Owners";
import OwnerFormPage from "./pages/users/OwnerFormPage";
import OwnerViewPage from "./pages/users/OwnerViewPage";
import Tenants from "./pages/users/Tenants";
import TenantFormPage from "./pages/users/TenantFormPage";
import TenantViewPage from "./pages/users/TenantViewPage";
import Vendors from "./pages/users/Vendors";
import VendorFormPage from "./pages/users/VendorFormPage";
import VendorViewPage from "./pages/users/VendorViewPage";
import Communications from "./pages/Communications";
import Files from "./pages/Files";
import Settings from "./pages/Settings";
import WorkOrdersDashboard from "./pages/WorkOrders";
import WorkOrderViewPage from "./pages/workorders/WorkOrderViewPage";
import RFPViewPage from "./pages/workorders/RFPViewPage";
import VendorPortal from "./pages/workorders/VendorPortal";
import ServiceRequestViewPage from "./pages/workorders/ServiceRequestViewPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedPage = ({ children }: { children: React.ReactNode }) => (
  <DashboardLayout>{children}</DashboardLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <OwnersProvider>
          <PropertiesProvider>
          <PropertyGroupsProvider>
          <BankAccountsProvider>
          <TenantsProvider>
          <VendorsProvider>
          <WorkOrdersProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
              <Route path="/reports" element={<ProtectedPage><Reports /></ProtectedPage>} />
              <Route path="/accounting" element={<ProtectedPage><Accounting /></ProtectedPage>} />
              <Route path="/tasks" element={<ProtectedPage><Tasks /></ProtectedPage>} />
              <Route path="/leases" element={<ProtectedPage><Leases /></ProtectedPage>} />
              <Route path="/properties" element={<ProtectedPage><Properties /></ProtectedPage>} />
              <Route path="/properties/new" element={<ProtectedPage><PropertyFormPage /></ProtectedPage>} />
              <Route path="/properties/:id" element={<ProtectedPage><PropertyViewPage /></ProtectedPage>} />
              <Route path="/properties/:id/edit" element={<ProtectedPage><PropertyFormPage /></ProtectedPage>} />
              <Route path="/users/owners" element={<ProtectedPage><Owners /></ProtectedPage>} />
              <Route path="/users/owners/new" element={<ProtectedPage><OwnerFormPage /></ProtectedPage>} />
              <Route path="/users/owners/:id" element={<ProtectedPage><OwnerViewPage /></ProtectedPage>} />
              <Route path="/users/owners/:id/edit" element={<ProtectedPage><OwnerFormPage /></ProtectedPage>} />
              <Route path="/users/tenants" element={<ProtectedPage><Tenants /></ProtectedPage>} />
              <Route path="/users/tenants/new" element={<ProtectedPage><TenantFormPage /></ProtectedPage>} />
              <Route path="/users/tenants/:id" element={<ProtectedPage><TenantViewPage /></ProtectedPage>} />
              <Route path="/users/tenants/:id/edit" element={<ProtectedPage><TenantFormPage /></ProtectedPage>} />
              <Route path="/users/vendors" element={<ProtectedPage><Vendors /></ProtectedPage>} />
              <Route path="/users/vendors/new" element={<ProtectedPage><VendorFormPage /></ProtectedPage>} />
              <Route path="/users/vendors/:id" element={<ProtectedPage><VendorViewPage /></ProtectedPage>} />
              <Route path="/users/vendors/:id/edit" element={<ProtectedPage><VendorFormPage /></ProtectedPage>} />
              <Route path="/work-orders" element={<ProtectedPage><WorkOrdersDashboard /></ProtectedPage>} />
              <Route path="/work-orders/requests/:id" element={<ProtectedPage><ServiceRequestViewPage /></ProtectedPage>} />
              <Route path="/work-orders/rfp/:id" element={<ProtectedPage><RFPViewPage /></ProtectedPage>} />
              <Route path="/work-orders/:id" element={<ProtectedPage><WorkOrderViewPage /></ProtectedPage>} />
              <Route path="/vendor-portal" element={<VendorPortal />} />
              <Route path="/communications" element={<ProtectedPage><Communications /></ProtectedPage>} />
              <Route path="/files" element={<ProtectedPage><Files /></ProtectedPage>} />
              <Route path="/settings" element={<ProtectedPage><Settings /></ProtectedPage>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
          </WorkOrdersProvider>
          </VendorsProvider>
          </TenantsProvider>
          </BankAccountsProvider>
          </PropertyGroupsProvider>
          </PropertiesProvider>
        </OwnersProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
