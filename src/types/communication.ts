export type UserType = 'owner' | 'tenant' | 'vendor';
export type MessageType = 'email' | 'text';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageDirection = 'sent' | 'received';

export interface CommunicationUser {
  id: string;
  name: string;
  email: string;
  type: UserType;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  direction: MessageDirection;
  type: MessageType;
  subject?: string;
  content: string;
  timestamp: string;
  status: MessageStatus;
  attachments?: string[];
  /** Display name of the sender – e.g. "System", "Admin", or user name */
  senderName?: string;
  /** If this message is a reply, the id of the original message */
  replyToId?: string;
  /** If this is a broadcast, list of recipient ids */
  broadcastRecipients?: string[];
}

export interface ComposeEmailData {
  subject: string;
  body: string;
  attachments: string[];
}
