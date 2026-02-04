import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export default function Header() {
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <header className="h-14 bg-card border-b border-border/50 shadow-soft px-4 flex items-center sticky top-0 z-40">
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="mr-2"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </header>
  );
}
