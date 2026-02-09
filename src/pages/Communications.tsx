import { MessageSquare, Mail } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserSelector from '@/components/communications/UserSelector';
import ChatTimeline from '@/components/communications/ChatTimeline';
import EmailSection from '@/components/communications/EmailSection';
import BroadcastDialog from '@/components/communications/BroadcastDialog';
import { useCommunications } from '@/hooks/useCommunications';

export default function Communications() {
  const {
    selectedUserType,
    selectedUserId,
    selectedUser,
    searchQuery,
    filteredUsers,
    allUsers,
    userTextMessages,
    userEmailMessages,
    selectUserType,
    selectUser,
    setSearchQuery,
    sendTextMessage,
    sendBroadcastMessage,
    sendEmail,
    getMessageById,
  } = useCommunications();

  return (
    <div className="flex flex-col gap-4 h-full animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Communications</h1>
          <div className="h-1 w-16 bg-secondary rounded-full mt-2" />
        </div>
        <BroadcastDialog users={allUsers} onSendBroadcast={sendBroadcastMessage} />
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

      {/* Tabs: Chat & Email */}
      <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
        <TabsList className="self-start mb-2">
          <TabsTrigger value="chat" className="gap-1.5">
            <MessageSquare className="h-4 w-4" />
            Chat Messages
            {selectedUser && userTextMessages.length > 0 && (
              <span className="ml-1 text-[10px] bg-primary/20 text-primary-foreground rounded-full px-1.5 py-0.5">
                {userTextMessages.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5">
            <Mail className="h-4 w-4" />
            Email History
            {selectedUser && userEmailMessages.length > 0 && (
              <span className="ml-1 text-[10px] bg-primary/20 text-primary-foreground rounded-full px-1.5 py-0.5">
                {userEmailMessages.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-0 data-[state=inactive]:hidden">
          <ChatTimeline
            messages={userTextMessages}
            selectedUser={selectedUser}
            onSendMessage={sendTextMessage}
            getMessageById={getMessageById}
          />
        </TabsContent>

        <TabsContent value="email" className="flex-1 flex flex-col min-h-0 mt-0 data-[state=inactive]:hidden">
          <EmailSection
            emails={userEmailMessages}
            selectedUser={selectedUser}
            onSendEmail={sendEmail}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
