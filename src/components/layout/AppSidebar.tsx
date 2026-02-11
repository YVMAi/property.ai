import { useState } from 'react';
import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Home,
  BarChart3,
  Calculator,
  ClipboardList,
  Wrench,
  FileText,
  Building2,
  Users,
  Mail,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  LogOut,
  User,
  Settings,
  ArrowLeft,
  CreditCard,
  Plug,
  HelpCircle,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: { title: string; url: string }[];
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Accounting', url: '/accounting', icon: Calculator },
  { title: 'Work Orders', url: '/work-orders', icon: Wrench },
  {
    title: 'Leases',
    url: '/leases',
    icon: FileText,
    subItems: [
      { title: 'Dashboard', url: '/leases' },
      { title: 'Vacant Units', url: '/leases/vacant-units' },
      { title: 'Listings', url: '/leases/listings' },
      { title: 'Active Leases', url: '/leases/active' },
      { title: 'Renewals', url: '/leases/renewals' },
      { title: 'Create a Lease', url: '/leases/create' },
      { title: 'Leasing Settings', url: '/leases/settings' },
    ],
  },
  { title: 'Properties', url: '/properties', icon: Building2 },
  {
    title: 'Users',
    url: '/users',
    icon: Users,
    subItems: [
      { title: 'Owners', url: '/users/owners' },
      { title: 'Tenants', url: '/users/tenants' },
      { title: 'Vendors', url: '/users/vendors' },
    ],
  },
  { title: 'Communications', url: '/communications', icon: Mail },
  { title: 'Files', url: '/files', icon: FolderOpen },
];

export type SettingsTab = 'profile' | 'people' | 'billing' | 'connectors' | 'help';

const settingsMenuItems: { id: SettingsTab; title: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'profile', title: 'Profile', icon: User },
  { id: 'people', title: 'People', icon: Users },
  { id: 'billing', title: 'Billing', icon: CreditCard },
  { id: 'connectors', title: 'Connectors', icon: Plug },
  { id: 'help', title: 'Help & Support', icon: HelpCircle },
];


export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';
  const [openItems, setOpenItems] = useState<string[]>(() => {
    const initial = ['Users'];
    if (location.pathname.startsWith('/leases')) initial.push('Leases');
    return initial;
  });
  const [sidebarSearch, setSidebarSearch] = useState('');
  const { user, logout } = useAuth();
  const isOnSettings = location.pathname === '/settings';
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSettingsTab = (searchParams.get('tab') as SettingsTab) || 'profile';
  const setActiveSettingsTab = (tab: SettingsTab) => {
    setSearchParams({ tab }, { replace: true });
  };

  const isActive = (url: string) => {
    if (url === '/leases') return location.pathname === '/leases';
    return location.pathname === url;
  };
  const isParentActive = (item: MenuItem) => {
    if (item.subItems) {
      return item.subItems.some((sub) => location.pathname === sub.url) ||
        (item.url === '/leases' && location.pathname.startsWith('/leases'));
    }
    return false;
  };

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredMenuItems = sidebarSearch.trim()
    ? menuItems.reduce<MenuItem[]>((acc, item) => {
        const q = sidebarSearch.toLowerCase();
        if (item.subItems) {
          const matchedSubs = item.subItems.filter((sub) => sub.title.toLowerCase().includes(q));
          if (item.title.toLowerCase().includes(q)) {
            acc.push(item); // parent matches → show all children
          } else if (matchedSubs.length > 0) {
            acc.push({ ...item, subItems: matchedSubs });
          }
        } else if (item.title.toLowerCase().includes(q)) {
          acc.push(item);
        }
        return acc;
      }, [])
    : menuItems;

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isOpen = openItems.includes(item.title);
    const active = isActive(item.url) || isParentActive(item);

    if (hasSubItems) {
      return (
        <Collapsible
          key={item.title}
          open={isOpen && !collapsed}
          onOpenChange={() => toggleItem(item.title)}
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                className={cn(
                  'sidebar-item w-full',
                  active && 'sidebar-item-active',
                  collapsed && 'justify-center px-2'
                )}
                aria-label={item.title}
                tooltip={collapsed ? item.title : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.title}</span>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </>
                )}
              </SidebarMenuButton>
            </CollapsibleTrigger>
            {!collapsed && (
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.subItems?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.url}>
                      <SidebarMenuSubButton
                        asChild
                        className={cn(
                          'sidebar-item pl-10',
                          isActive(subItem.url) && 'sidebar-item-active'
                        )}
                      >
                        <NavLink to={subItem.url} aria-label={subItem.title}>
                          {subItem.title}
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            )}
          </SidebarMenuItem>
        </Collapsible>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          className={cn(
            'sidebar-item',
            active && 'sidebar-item-active',
            collapsed && 'justify-center px-2'
          )}
          tooltip={collapsed ? item.title : undefined}
        >
          <NavLink to={item.url} aria-label={item.title}>
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar" collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold text-foreground tracking-tight">
                PropertyAI
              </span>
            )}
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 mt-2 text-muted-foreground hover:text-foreground mx-auto"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </SidebarHeader>

      {!collapsed && (
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 h-9 bg-background border-border"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {collapsed && (
        <div className="flex justify-center py-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      )}

      <SidebarContent className="pt-2">
        {isOnSettings && user?.role === 'admin' ? (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Back to main nav */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className={cn(
                      'sidebar-item w-full',
                      collapsed && 'justify-center px-2'
                    )}
                    onClick={() => navigate('/dashboard')}
                    tooltip={collapsed ? 'Back' : undefined}
                  >
                    <ArrowLeft className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>Back</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {!collapsed && (
                  <li className="px-3 py-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Settings
                    </span>
                  </li>
                )}

                {settingsMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeSettingsTab === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        className={cn(
                          'sidebar-item',
                          active && 'sidebar-item-active',
                          collapsed && 'justify-center px-2'
                        )}
                        onClick={() => setActiveSettingsTab(item.id)}
                        tooltip={collapsed ? item.title : undefined}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredMenuItems.map((item) => renderMenuItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full flex items-center gap-3 px-2 py-2 h-auto",
                collapsed && "justify-center"
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={collapsed ? "center" : "end"} side="top" className="w-48">
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings?tab=profile')}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            {user?.role === 'admin' && (
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings?tab=profile')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
