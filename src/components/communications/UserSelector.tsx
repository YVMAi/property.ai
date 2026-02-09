import { Users, Building2, Wrench, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  return (
    <div className="card-elevated p-4 md:p-5 animate-fade-in">
      <h2 className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase">
        Select Recipient
      </h2>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* User Type */}
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">User Type</label>
          <Select
            value={selectedUserType || undefined}
            onValueChange={(val) => onSelectUserType(val as UserType)}
          >
            <SelectTrigger className="bg-background border-input h-10">
              <SelectValue placeholder="Select type…" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(userTypeConfig) as UserType[]).map((type) => {
                const cfg = userTypeConfig[type];
                const Icon = cfg.icon;
                return (
                  <SelectItem key={type} value={type}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      {cfg.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* User Search + Select */}
        <div className="flex-[2] min-w-[240px]">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            User (search by name or email)
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={selectedUserType ? 'Search users…' : 'Select a type first'}
              disabled={!selectedUserType}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-background border-input h-10"
            />
          </div>

          {/* User Dropdown list */}
          {selectedUserType && (
            <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-border bg-background">
              {filteredUsers.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">No users found.</p>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => onSelectUser(user.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent',
                      selectedUserId === user.id && 'bg-primary/10'
                    )}
                  >
                    <span className="font-medium text-foreground truncate">{user.name}</span>
                    <Badge variant="secondary" className="ml-2 text-xs font-normal shrink-0">
                      {user.email}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
