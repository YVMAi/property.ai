import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search,
  DollarSign,
  Wrench,
  UserPlus,
  Building2,
  FileText,
  ClipboardList,
  BarChart3,
  Mail,
  FolderPlus,
  Layers,
  CreditCard,
  Handshake,
  FileSearch,
  Megaphone,
  Receipt,
  Star,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route?: string;
  action?: string;
  adminOnly?: boolean;
  subItems?: { title: string; route: string }[];
}

const createActions: CreateAction[] = [
  {
    id: 'journal-entry',
    title: 'Create Journal Entry',
    description: 'Log financial transactions',
    icon: DollarSign,
    route: '/accounting',
  },
  {
    id: 'work-order',
    title: 'Create Work Order',
    description: 'Initiate maintenance or repair',
    icon: Wrench,
    route: '/work-orders',
    adminOnly: true,
  },
  {
    id: 'new-user',
    title: 'Create New User',
    description: 'Add an owner, tenant, or vendor',
    icon: UserPlus,
    adminOnly: true,
    subItems: [
      { title: 'Owner', route: '/users/owners/new' },
      { title: 'Tenant', route: '/users/tenants/new' },
      { title: 'Vendor', route: '/users/vendors/new' },
    ],
  },
  {
    id: 'property',
    title: 'Add New Property',
    description: 'Register a property in the system',
    icon: Building2,
    route: '/properties/new',
    adminOnly: true,
  },
  {
    id: 'lease',
    title: 'Add New Lease',
    description: 'Create a lease agreement',
    icon: FileText,
    route: '/leases/create',
  },
  {
    id: 'task',
    title: 'Create Task',
    description: 'Quick reminder or assignment',
    icon: ClipboardList,
    route: '/dashboard',
  },
  {
    id: 'report',
    title: 'Create Report',
    description: 'Generate financial or occupancy insights',
    icon: BarChart3,
    route: '/reports',
  },
  {
    id: 'communication',
    title: 'Create Communication',
    description: 'Send email or text to tenants/owners',
    icon: Mail,
    route: '/communications',
  },
  {
    id: 'file-folder',
    title: 'Create File / Folder',
    description: 'Organize documents',
    icon: FolderPlus,
    route: '/files',
  },
  {
    id: 'property-group',
    title: 'Create Property Group',
    description: 'Group portfolios together',
    icon: Layers,
    route: '/properties',
    adminOnly: true,
  },
  {
    id: 'bank-account',
    title: 'Create Bank Account',
    description: 'Add account for rent or deposits',
    icon: CreditCard,
    route: '/properties',
    adminOnly: true,
  },
  {
    id: 'agreement',
    title: 'Create Agreement',
    description: 'New management contract',
    icon: Handshake,
    route: '/users/owners',
    adminOnly: true,
  },
  {
    id: 'rfp',
    title: 'Create RFP',
    description: 'Request vendor quotes',
    icon: FileSearch,
    route: '/work-orders',
    adminOnly: true,
  },
  {
    id: 'listing',
    title: 'Create Listing',
    description: 'Post to listing sites for vacant units',
    icon: Megaphone,
    route: '/leases/listings',
  },
  {
    id: 'invoice',
    title: 'Create Invoice',
    description: 'Bill tenants or vendors',
    icon: Receipt,
    route: '/accounting',
  },
  {
    id: 'vendor-quote-review',
    title: 'Create Vendor Quote Review',
    description: 'Evaluate RFP responses',
    icon: Star,
    route: '/work-orders',
    adminOnly: true,
  },
];

interface CreateActionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateActionsModal({ open, onOpenChange }: CreateActionsModalProps) {
  const [search, setSearch] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const filteredActions = useMemo(() => {
    const isAdmin = user?.role === 'admin';
    let actions = createActions.filter((a) => !a.adminOnly || isAdmin);

    if (search.trim()) {
      const q = search.toLowerCase();
      actions = actions.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.subItems?.some((s) => s.title.toLowerCase().includes(q))
      );
    }
    return actions;
  }, [search, user?.role]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelect = (route: string) => {
    onOpenChange(false);
    setSearch('');
    setExpandedItems([]);
    navigate(route);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Create New
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search create actions..."
              className="pl-9 h-10 border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Actions list */}
        <ScrollArea className="flex-1 min-h-0 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          <div className="px-3 pb-4 space-y-1">
            {filteredActions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No actions found — try different keywords
              </div>
            ) : (
              filteredActions.map((action) => {
                const Icon = action.icon;
                const hasSubItems = action.subItems && action.subItems.length > 0;
                const isExpanded = expandedItems.includes(action.id);

                return (
                  <div key={action.id}>
                    <button
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left',
                        'hover:bg-accent/60 transition-colors duration-150 group'
                      )}
                      onClick={() => {
                        if (hasSubItems) {
                          toggleExpand(action.id);
                        } else if (action.route) {
                          handleSelect(action.route);
                        }
                      }}
                    >
                      <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                        <Icon className="h-4.5 w-4.5 text-primary-foreground/80" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {action.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {action.description}
                        </p>
                      </div>
                      {hasSubItems && (
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 text-muted-foreground transition-transform duration-200',
                            isExpanded && 'rotate-90'
                          )}
                        />
                      )}
                    </button>

                    {/* Sub-items */}
                    {hasSubItems && isExpanded && (
                      <div className="ml-12 mt-0.5 space-y-0.5">
                        {action.subItems!.map((sub) => (
                          <button
                            key={sub.route}
                            className="w-full text-left px-3 py-2 rounded-md text-sm text-foreground hover:bg-accent/60 transition-colors"
                            onClick={() => handleSelect(sub.route)}
                          >
                            {sub.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
