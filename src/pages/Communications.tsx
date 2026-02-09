import { Mail } from 'lucide-react';
import UserSelector from '@/components/communications/UserSelector';
import ChatTimeline from '@/components/communications/ChatTimeline';
import ComposeEmail from '@/components/communications/ComposeEmail';
import { useCommunications } from '@/hooks/useCommunications';

export default function Communications() {
  const {
    selectedUserType,
    selectedUserId,
    selectedUser,
    searchQuery,
    filteredUsers,
    userMessages,
    selectUserType,
    selectUser,
    setSearchQuery,
    sendEmail,
  } = useCommunications();

  return (
    <div className="flex flex-col gap-5 h-full animate-fade-in">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
          <Mail className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Communications & Notices
          </h1>
          <p className="text-xs text-muted-foreground">
            View and manage all messages with owners, tenants, and vendors
          </p>
        </div>
      </div>

      {/* User selector */}
      <UserSelector
        selectedUserType={selectedUserType}
        selectedUserId={selectedUserId}
        searchQuery={searchQuery}
        filteredUsers={filteredUsers}
        onSelectUserType={selectUserType}
        onSelectUser={selectUser}
        onSearchChange={setSearchQuery}
      />

      {/* Chat timeline */}
      <div className="flex-1 flex flex-col min-h-0" style={{ minHeight: '350px' }}>
        <ChatTimeline messages={userMessages} selectedUser={selectedUser} />
      </div>

      {/* Compose email */}
      <ComposeEmail selectedUser={selectedUser} onSend={sendEmail} />
    </div>
  );
}
