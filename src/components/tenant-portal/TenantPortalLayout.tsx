import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import TenantSidebar from './TenantSidebar';
import { Button } from '@/components/ui/button';
import { Bell, Search, Moon, Sun, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TenantPortalLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="h-screen flex w-full p-2 gap-2 overflow-hidden bg-muted/30">
        <TenantSidebar />

        <SidebarInset className="flex-1 flex flex-col rounded-xl border border-border/50 bg-background shadow-soft overflow-hidden">
          {/* Sticky Top Bar */}
          <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6 shrink-0">
            {/* Left: greeting */}
            <div className="flex flex-col justify-center">
              <span className="text-sm font-semibold text-foreground leading-tight">
                Welcome back, Tenant
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                Sunset Apartments — Unit 4B
              </span>
            </div>

            {/* Right: search + theme + notifications + logout */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 h-9 w-56 rounded-xl bg-muted/50 border-border text-sm"
                />
                <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden md:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </div>

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1 right-1 flex items-center justify-center h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      3
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuItem>Rent due in 3 days</DropdownMenuItem>
                  <DropdownMenuItem>Lease renewal reminder</DropdownMenuItem>
                  <DropdownMenuItem>Maintenance update</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Logout */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                onClick={() => navigate('/tenant-login')}
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 p-6 overflow-auto min-h-0">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
