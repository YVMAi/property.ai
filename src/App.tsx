import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { OwnersProvider } from "@/contexts/OwnersContext";
import { TenantsProvider } from "@/contexts/TenantsContext";
import { VendorsProvider } from "@/contexts/VendorsContext";
import { PropertiesProvider } from "@/contexts/PropertiesContext";
import { PropertyGroupsProvider } from "@/contexts/PropertyGroupsContext";
import { BankAccountsProvider } from "@/contexts/BankAccountsContext";
import { WorkOrdersProvider } from "@/contexts/WorkOrdersContext";
import { SuperAdminProvider } from "@/contexts/SuperAdminContext";
import { SACommsProvider } from "@/contexts/SACommsContext";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Accounting from "./pages/Accounting";
import LeasesDashboard from "./pages/Leases";
import VacantUnits from "./pages/leases/VacantUnits";
import ListingsPage from "./pages/leases/Listings";
import ActiveLeases from "./pages/leases/ActiveLeases";
import RenewalsPage from "./pages/leases/Renewals";
import CreateLease from "./pages/leases/CreateLease";
import LeasingSettings from "./pages/leases/LeasingSettings";
import PostListing from "./pages/leases/PostListing";
import ListingViewPage from "./pages/leases/ListingViewPage";
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
import CreateRFPPage from "./pages/workorders/CreateRFPPage";
import CreateWOPage from "./pages/workorders/CreateWOPage";
import AIChat from "./pages/AIChat";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import PortalLogin from "./pages/portals/PortalLogin";
import PortalDashboard from "./pages/portals/PortalDashboard";
import TenantPortalLayout from "./components/tenant-portal/TenantPortalLayout";
import TenantDashboard from "./pages/tenant-portal/TenantDashboard";
import TenantUnderDevelopment from "./pages/tenant-portal/TenantUnderDevelopment";
import TenantMyLeases from "./pages/tenant-portal/TenantMyLeases";
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
        <CurrencyProvider>
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
              <Route path="/ai-chat" element={<ProtectedPage><AIChat /></ProtectedPage>} />
              <Route path="/reports" element={<ProtectedPage><Reports /></ProtectedPage>} />
              <Route path="/accounting" element={<ProtectedPage><Accounting /></ProtectedPage>} />
              {/* Tasks removed - merged into Dashboard */}
              <Route path="/leases" element={<ProtectedPage><LeasesDashboard /></ProtectedPage>} />
              <Route path="/leases/vacant-units" element={<ProtectedPage><VacantUnits /></ProtectedPage>} />
              <Route path="/leases/listings" element={<ProtectedPage><ListingsPage /></ProtectedPage>} />
              <Route path="/leases/active" element={<ProtectedPage><ActiveLeases /></ProtectedPage>} />
              <Route path="/leases/renewals" element={<ProtectedPage><RenewalsPage /></ProtectedPage>} />
              <Route path="/leases/create" element={<ProtectedPage><CreateLease /></ProtectedPage>} />
              <Route path="/leases/post-listing" element={<ProtectedPage><PostListing /></ProtectedPage>} />
              <Route path="/leases/listings/:id" element={<ProtectedPage><ListingViewPage /></ProtectedPage>} />
              <Route path="/leases/settings" element={<ProtectedPage><LeasingSettings /></ProtectedPage>} />
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
              <Route path="/work-orders/create-rfp" element={<ProtectedPage><CreateRFPPage /></ProtectedPage>} />
              <Route path="/work-orders/create-wo" element={<ProtectedPage><CreateWOPage /></ProtectedPage>} />
              <Route path="/work-orders/requests/:id" element={<ProtectedPage><ServiceRequestViewPage /></ProtectedPage>} />
              <Route path="/work-orders/rfp/:id" element={<ProtectedPage><RFPViewPage /></ProtectedPage>} />
              <Route path="/work-orders/:id" element={<ProtectedPage><WorkOrderViewPage /></ProtectedPage>} />
              <Route path="/vendor-portal" element={<VendorPortal />} />
              <Route path="/communications" element={<ProtectedPage><Communications /></ProtectedPage>} />
              <Route path="/files" element={<ProtectedPage><Files /></ProtectedPage>} />
              <Route path="/settings" element={<ProtectedPage><Settings /></ProtectedPage>} />
              
              {/* Super Admin Portal */}
              <Route path="/super-admin" element={<SuperAdminProvider><SACommsProvider><SuperAdminDashboard /></SACommsProvider></SuperAdminProvider>} />
              
              {/* Portal Login & Dashboard Routes */}
              <Route path="/owner-login" element={<PortalLogin portalType="owner" />} />
              <Route path="/tenant-login" element={<PortalLogin portalType="tenant" />} />
              <Route path="/vendor-login" element={<PortalLogin portalType="vendor" />} />
              <Route path="/owner-dashboard" element={<PortalDashboard portalType="owner" />} />
              <Route path="/vendor-dashboard" element={<PortalDashboard portalType="vendor" />} />
              
              {/* Tenant Portal */}
              <Route path="/tenant-portal" element={<TenantPortalLayout><TenantDashboard /></TenantPortalLayout>} />
              <Route path="/tenant-portal/my-leases" element={<TenantPortalLayout><TenantMyLeases /></TenantPortalLayout>} />
              <Route path="/tenant-portal/communications" element={<TenantPortalLayout><TenantUnderDevelopment title="Communications" /></TenantPortalLayout>} />
              <Route path="/tenant-portal/files" element={<TenantPortalLayout><TenantUnderDevelopment title="Files" /></TenantPortalLayout>} />
              <Route path="/tenant-portal/profile" element={<TenantPortalLayout><TenantUnderDevelopment title="Profile Settings" /></TenantPortalLayout>} />
              <Route path="/tenant-portal/notifications" element={<TenantPortalLayout><TenantUnderDevelopment title="Notifications" /></TenantPortalLayout>} />
              <Route path="/tenant-portal/marketplace" element={<TenantPortalLayout><TenantUnderDevelopment title="Marketplace — Coming Soon" /></TenantPortalLayout>} />
              
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
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
