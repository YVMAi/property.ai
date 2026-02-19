import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, Mail, FolderOpen, User, Bell, ShoppingBag,
  ChevronLeft, ChevronRight, Search, Building2,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const menuItems = [
  { title: 'Dashboard', url: '/tenant-portal', icon: Home },
  { title: 'Communications', url: '/tenant-portal/communications', icon: Mail },
  { title: 'Files', url: '/tenant-portal/files', icon: FolderOpen },
  { title: 'Profile Settings', url: '/tenant-portal/profile', icon: User },
  { title: 'Notifications', url: '/tenant-portal/notifications', icon: Bell },
  { title: 'Marketplace', url: '/tenant-portal/marketplace', icon: ShoppingBag },
];

export default function TenantSidebar() {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';
  const [sidebarSearch, setSidebarSearch] = useState('');

  const filteredItems = sidebarSearch.trim()
    ? menuItems.filter((item) => item.title.toLowerCase().includes(sidebarSearch.toLowerCase()))
    : menuItems;

  return (
    <Sidebar className="border-r-0 bg-sidebar" collapsible="icon" variant="floating">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center w-full')}>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold text-foreground tracking-tight">
                Tenant<span className="text-primary">Portal</span>
              </span>
            )}
          </div>
          {!collapsed && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Collapse sidebar">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        {collapsed && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 mt-2 text-muted-foreground hover:text-foreground mx-auto" aria-label="Expand sidebar">
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </SidebarHeader>

      {!collapsed && (
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 h-9 bg-background border-border" value={sidebarSearch} onChange={(e) => setSidebarSearch(e.target.value)} />
          </div>
        </div>
      )}

      {collapsed && (
        <div className="flex flex-col items-center py-3">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      )}

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn('sidebar-item', active && 'sidebar-item-active', collapsed && 'justify-center px-2')}
                      tooltip={collapsed ? item.title : undefined}
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

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className={cn('flex items-center gap-3 px-2', collapsed && 'justify-center')}>
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground truncate">Demo Tenant</p>
              <p className="text-xs text-muted-foreground truncate">tenant@demo.com</p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
