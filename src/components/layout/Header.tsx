import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Menu, Bell } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export default function Header() {
  const { toggleSidebar, isMobile } = useSidebar();

  // Mock notifications
  const notifications = [
    { id: 1, title: 'New lease application', time: '5 min ago' },
    { id: 2, title: 'Maintenance request completed', time: '1 hour ago' },
    { id: 3, title: 'Rent payment received', time: '2 hours ago' },
  ];

  return (
    <header className="h-14 bg-card border-b border-border/50 shadow-soft px-4 flex items-center justify-between gap-4 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
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
        
        <div className="flex-1 max-w-md">
          <GlobalSearch />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground">
                {notifications.length}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 border-b border-border">
              <h4 className="font-semibold text-sm">Notifications</h4>
            </div>
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="cursor-pointer flex flex-col items-start py-3">
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
