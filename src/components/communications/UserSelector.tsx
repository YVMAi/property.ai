import { useState } from 'react';
import { Users, Building2, Wrench, Search, ChevronDown } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { CommunicationUser, UserType } from '@/types/communication';
import { cn } from '@/lib/utils';

interface UserSelectorProps {
  selectedUserType: UserType | '';
  selectedUserId: string;
  searchQuery: string;
  filteredUsers: CommunicationUser[];
  onSelectUserType: (type: UserType | '') => void;
  onSelectUser: (userId: string) => void;
  onSearchChange: (query: string) => void;
}

const userTypeConfig: Record<UserType, { label: string; icon: typeof Users }> = {
  owner: { label: 'Owners', icon: Users },
  tenant: { label: 'Tenants', icon: Building2 },
  vendor: { label: 'Vendors', icon: Wrench },
};

export default function UserSelector({
  selectedUserType,
  selectedUserId,
  searchQuery,
  filteredUsers,
  onSelectUserType,
  onSelectUser,
  onSearchChange,
}: UserSelectorProps) {
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);

  const selectedUserDisplay = filteredUsers.find((u) => u.id === selectedUserId);

  const handleSelectUser = (userId: string) => {
    onSelectUser(userId);
    setUserPopoverOpen(false);
  };

  return (
    <div className="card-elevated p-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        {/* User Type */}
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">User Type</label>
          <SearchableSelect
            options={(Object.keys(userTypeConfig) as UserType[]).map((type) => ({
              value: type,
              label: userTypeConfig[type].label,
            }))}
            value={selectedUserType || ''}
            onValueChange={(val) => onSelectUserType(val as UserType)}
            placeholder="Select type…"
            triggerClassName="bg-background border-input h-9"
          />
        </div>

        {/* User Selector Popover */}
        <div className="flex-[2] min-w-[220px]">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">User</label>
          <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={!selectedUserType}
                className="w-full justify-between h-9 font-normal bg-background border-input"
              >
                {selectedUserDisplay ? (
                  <span className="flex items-center gap-2 truncate">
                    <span className="truncate">{selectedUserDisplay.name}</span>
                    <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                      {selectedUserDisplay.email}
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {selectedUserType ? 'Select a user…' : 'Select a type first'}
                  </span>
                )}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start">
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email…"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-8 h-8 text-xs bg-background border-input"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-muted-foreground text-center">No users found.</p>
                ) : (
                  filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                        selectedUserId === user.id && 'bg-primary/10'
                      )}
                    >
                      <span className="font-medium text-foreground truncate">{user.name}</span>
                      <Badge variant="secondary" className="ml-2 text-[10px] font-normal shrink-0">
                        {user.email}
                      </Badge>
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
