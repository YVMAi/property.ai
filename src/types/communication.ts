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
}

export interface ComposeEmailData {
  subject: string;
  body: string;
  attachments: string[];
}
