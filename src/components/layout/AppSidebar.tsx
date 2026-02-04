import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  BarChart3,
  Calculator,
  ClipboardList,
  FileText,
  Building2,
  Users,
  Mail,
  FolderOpen,
  ChevronDown,
  ChevronRight,
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
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  { title: 'Tasks', url: '/tasks', icon: ClipboardList },
  { title: 'Leases', url: '/leases', icon: FileText },
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

export default function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [openItems, setOpenItems] = useState<string[]>(['Users']);

  const isActive = (url: string) => location.pathname === url;
  const isParentActive = (item: MenuItem) => {
    if (item.subItems) {
      return item.subItems.some((sub) => location.pathname === sub.url);
    }
    return false;
  };

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isOpen = openItems.includes(item.title);
                const active = isActive(item.url) || isParentActive(item);

                if (hasSubItems) {
                  return (
                    <Collapsible
                      key={item.title}
                      open={isOpen}
                      onOpenChange={() => toggleItem(item.title)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={cn(
                              'sidebar-item w-full',
                              active && 'sidebar-item-active'
                            )}
                            aria-label={item.title}
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
                        active && 'sidebar-item-active'
                      )}
                    >
                      <NavLink to={item.url} aria-label={item.title}>
                        <Icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
