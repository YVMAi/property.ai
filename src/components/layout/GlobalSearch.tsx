import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Users, FileText, FolderOpen, X } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';

interface SearchResult {
  id: string;
  title: string;
  type: 'property' | 'tenant' | 'owner' | 'vendor' | 'lease' | 'document';
  subtitle?: string;
  url: string;
}

// Mock data for demonstration
const mockResults: SearchResult[] = [
  { id: '1', title: '123 Oak Street', type: 'property', subtitle: 'Residential', url: '/properties' },
  { id: '2', title: '456 Maple Avenue', type: 'property', subtitle: 'Commercial', url: '/properties' },
  { id: '3', title: 'Sunset Apartments', type: 'property', subtitle: 'Multi-family', url: '/properties' },
  { id: '4', title: 'John Smith', type: 'tenant', subtitle: 'Unit 204, Oak Street', url: '/users/tenants' },
  { id: '5', title: 'Jane Doe', type: 'tenant', subtitle: 'Unit 101, Maple Ave', url: '/users/tenants' },
  { id: '6', title: 'Robert Johnson', type: 'owner', subtitle: '3 properties', url: '/users/owners' },
  { id: '7', title: 'Sarah Williams', type: 'owner', subtitle: '5 properties', url: '/users/owners' },
  { id: '8', title: 'ABC Maintenance', type: 'vendor', subtitle: 'Plumbing', url: '/users/vendors' },
  { id: '9', title: 'XYZ Cleaning', type: 'vendor', subtitle: 'Cleaning Services', url: '/users/vendors' },
  { id: '10', title: 'Lease #2024-001', type: 'lease', subtitle: 'John Smith - 123 Oak St', url: '/leases' },
  { id: '11', title: 'Lease #2024-002', type: 'lease', subtitle: 'Jane Doe - 456 Maple Ave', url: '/leases' },
  { id: '12', title: 'Insurance Policy', type: 'document', subtitle: 'PDF - Updated Jan 2024', url: '/files' },
  { id: '13', title: 'Maintenance Report', type: 'document', subtitle: 'PDF - Dec 2023', url: '/files' },
];

const typeIcons = {
  property: Building2,
  tenant: Users,
  owner: Users,
  vendor: Users,
  lease: FileText,
  document: FolderOpen,
};

const typeLabels = {
  property: 'Property',
  tenant: 'Tenant',
  owner: 'Owner',
  vendor: 'Vendor',
  lease: 'Lease',
  document: 'Document',
};

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const filteredResults = query.length > 0
    ? mockResults.filter(
        (result) =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
          result.type.toLowerCase().includes(query.toLowerCase())
      )
    : mockResults;

  const groupedResults = filteredResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery('');
    navigate(result.url);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full max-w-sm justify-start bg-background text-sm text-muted-foreground hover:bg-background/80 sm:pr-12"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline-flex">Search properties, tenants...</span>
        <span className="inline-flex sm:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search properties, tenants, owners, vendors, leases, documents..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groupedResults).map(([type, results]) => {
            const Icon = typeIcons[type as keyof typeof typeIcons];
            return (
              <CommandGroup key={type} heading={typeLabels[type as keyof typeof typeLabels] + 's'}>
                {results.slice(0, 3).map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      <span>{result.title}</span>
                      {result.subtitle && (
                        <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}