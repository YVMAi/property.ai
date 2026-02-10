import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Menu, Bell } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export default function Header() {
  const { toggleSidebar, isMobile } = useSidebar();
  const { user } = useAuth();

  // Mock notifications
  const notifications = [
    { id: 1, title: 'New lease application', time: '5 min ago' },
    { id: 2, title: 'Maintenance request completed', time: '1 hour ago' },
    { id: 3, title: 'Rent payment received', time: '2 hours ago' },
  ];

  return (
    <header className="h-16 glass-heavy border-b border-border px-4 flex items-center justify-between gap-4 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here's an overview of your property portfolio
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-1 justify-end">
        <div className="w-full max-w-md">
          <GlobalSearch />
        </div>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative shrink-0">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground">
                {notifications.length}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 glass-heavy rounded-2xl">
            <div className="px-3 py-2 border-b border-border">
              <h4 className="font-semibold text-sm">Notifications</h4>
            </div>
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="cursor-pointer flex flex-col items-start py-3 rounded-xl">
                <span className="text-sm font-medium">{notification.title}</span>
                <span className="text-xs text-muted-foreground">{notification.time}</span>
              </DropdownMenuItem>
            ))}
            <div className="px-3 py-2 border-t border-border">
              <Button variant="ghost" size="sm" className="w-full text-primary">
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
