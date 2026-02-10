import * as React from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select...',
  disabled = false,
  className,
  triggerClassName,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return options;
    const lower = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower) || o.value.toLowerCase().includes(lower));
  }, [options, search]);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  React.useEffect(() => {
    if (open) {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            triggerClassName,
          )}
        >
          <span className={cn('truncate', !selectedLabel && 'text-muted-foreground')}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('p-0 bg-popover border border-border shadow-md z-50', className)}
        style={{ width: 'var(--radix-popover-trigger-width)' }}
        align="start"
      >
        <div className="flex items-center border-b border-border px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No results found</p>
          ) : (
            filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
                  value === option.value && 'bg-accent/50',
                )}
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {value === option.value && <Check className="h-4 w-4" />}
                </span>
                {option.label}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
