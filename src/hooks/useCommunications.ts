import { useState, useCallback, useMemo } from 'react';
import type { CommunicationUser, Message, UserType, ComposeEmailData } from '@/types/communication';

const generateId = () => Math.random().toString(36).substring(2, 11);

const MOCK_USERS: CommunicationUser[] = [
  // Owners
  { id: 'o1', name: 'John Anderson', email: 'john.anderson@email.com', type: 'owner' },
  { id: 'o2', name: 'Mitchell Properties LLC', email: 'sarah.mitchell@email.com', type: 'owner' },
  { id: 'o3', name: 'Chen Holdings Corp', email: 'mchen@company.com', type: 'owner' },
  { id: 'o4', name: 'Emily Rodriguez', email: 'emily.r@trust.com', type: 'owner' },
  // Tenants
  { id: 't1', name: 'Alice Walker', email: 'alice.walker@gmail.com', type: 'tenant' },
  { id: 't2', name: 'Robert Kim', email: 'r.kim@outlook.com', type: 'tenant' },
  { id: 't3', name: 'Maria Santos', email: 'maria.santos@yahoo.com', type: 'tenant' },
  // Vendors
  { id: 'v1', name: 'QuickFix Plumbing', email: 'dispatch@quickfix.com', type: 'vendor' },
  { id: 'v2', name: 'GreenScape Landscaping', email: 'info@greenscape.com', type: 'vendor' },
  { id: 'v3', name: 'SecureHome Alarms', email: 'support@securehome.com', type: 'vendor' },
];

const MOCK_MESSAGES: Message[] = [
  // John Anderson - text messages
  {
    id: 'm3', senderId: 'admin', receiverId: 'o1', direction: 'sent', type: 'text',
    content: 'Hi John, the plumber has been dispatched to Sunset Apartments unit 3B. ETA 2pm today.',
    timestamp: '2026-02-03T09:15:00Z', status: 'delivered',
  },
  {
    id: 'm4', senderId: 'o1', receiverId: 'admin', direction: 'received', type: 'text',
    content: 'Great, thank you for the quick response!',
    timestamp: '2026-02-03T09:30:00Z', status: 'read',
  },
  {
    id: 'm15', senderId: 'admin', receiverId: 'o1', direction: 'sent', type: 'text',
    content: 'Rent collected for February. Your payout will be processed on the 5th.',
    timestamp: '2026-02-04T10:00:00Z', status: 'read',
  },
  {
    id: 'm16', senderId: 'o1', receiverId: 'admin', direction: 'received', type: 'text',
    content: 'Perfect. Also, can you check if tenant in unit 5A renewed?',
    timestamp: '2026-02-04T10:15:00Z', status: 'read',
  },
  {
    id: 'm17', senderId: 'admin', receiverId: 'o1', direction: 'sent', type: 'text',
    content: 'Yes, unit 5A renewed for another 12 months with a 3% increase. Signed yesterday.',
    timestamp: '2026-02-04T10:30:00Z', status: 'delivered',
    attachments: ['Lease_Renewal_5A.pdf'],
  },
  // John Anderson - emails
  {
    id: 'm1', senderId: 'admin', receiverId: 'o1', direction: 'sent', type: 'email',
    subject: 'Monthly Statement – January 2026',
    content: 'Hi John, please find your January 2026 owner statement attached. Your net disbursement of $1,840 has been processed via ACH. Let us know if you have any questions.',
    timestamp: '2026-02-01T10:00:00Z', status: 'read',
    attachments: ['Statement_Jan2026.pdf'],
  },
  {
    id: 'm2', senderId: 'o1', receiverId: 'admin', direction: 'received', type: 'email',
    subject: 'Re: Monthly Statement – January 2026',
    content: 'Thanks for the statement. Everything looks good. Could you also send me the maintenance invoice for unit 3B?',
    timestamp: '2026-02-01T14:22:00Z', status: 'read',
  },
  {
    id: 'm5', senderId: 'admin', receiverId: 'o1', direction: 'sent', type: 'email',
    subject: 'Lease Renewal – Downtown Lofts Unit 4A',
    content: 'Hi John, the lease for Downtown Lofts Unit 4A is up for renewal on March 31st. The tenant has expressed interest in renewing at a 3% increase. Please confirm if you\'d like to proceed.',
    timestamp: '2026-02-05T11:00:00Z', status: 'read',
  },
  {
    id: 'm6', senderId: 'o1', receiverId: 'admin', direction: 'received', type: 'email',
    subject: 'Re: Lease Renewal – Downtown Lofts Unit 4A',
    content: 'Yes, a 3% increase sounds fair. Please go ahead with the renewal. Can you send me the updated lease for review before signing?',
    timestamp: '2026-02-05T16:45:00Z', status: 'read',
  },
  {
    id: 'm14', senderId: 'admin', receiverId: 'o1', direction: 'sent', type: 'email',
    subject: 'Updated Lease Draft – Downtown Lofts 4A',
    content: 'Hi John, attached is the updated lease draft for your review. Please let me know if everything looks good or if you need any changes.',
    timestamp: '2026-02-07T09:00:00Z', status: 'delivered',
    attachments: ['Lease_Draft_4A.pdf'],
  },
  // Alice Walker (tenant) - texts
  {
    id: 'm8', senderId: 't1', receiverId: 'admin', direction: 'received', type: 'text',
    content: 'Thank you! Quick question – is there assigned parking or first-come-first-served?',
    timestamp: '2026-02-04T12:10:00Z', status: 'read',
  },
  {
    id: 'm9', senderId: 'admin', receiverId: 't1', direction: 'sent', type: 'text',
    content: 'Parking is assigned. You\'ll have spot #14 in the covered garage. The access card will be included with your keys.',
    timestamp: '2026-02-04T12:25:00Z', status: 'delivered',
  },
  // Alice Walker - emails
  {
    id: 'm7', senderId: 'admin', receiverId: 't1', direction: 'sent', type: 'email',
    subject: 'Welcome to Sunset Apartments!',
    content: 'Dear Alice, welcome to Sunset Apartments! Your move-in date is confirmed for February 15th. Please find the move-in checklist and building guidelines attached.',
    timestamp: '2026-02-04T08:00:00Z', status: 'read',
    attachments: ['MoveIn_Checklist.pdf', 'Building_Guidelines.pdf'],
  },
  // QuickFix Plumbing (vendor) - texts
  {
    id: 'm12', senderId: 'admin', receiverId: 'v1', direction: 'sent', type: 'text',
    content: 'Monday at 2pm works perfectly. Please proceed. Access code for the building is #4521.',
    timestamp: '2026-02-02T17:15:00Z', status: 'delivered',
  },
  {
    id: 'm13', senderId: 'v1', receiverId: 'admin', direction: 'received', type: 'text',
    content: 'Confirmed. Technician Mike will be there Monday 2pm. Thanks!',
    timestamp: '2026-02-02T17:30:00Z', status: 'read',
  },
  // QuickFix - emails
  {
    id: 'm10', senderId: 'admin', receiverId: 'v1', direction: 'sent', type: 'email',
    subject: 'Service Request – Sunset Apartments 3B',
    content: 'Hi QuickFix team, we have a leaking faucet in unit 3B at Sunset Apartments. Please schedule a repair at your earliest convenience. Tenant is available Mon-Fri after 10am.',
    timestamp: '2026-02-02T15:30:00Z', status: 'read',
  },
  {
    id: 'm11', senderId: 'v1', receiverId: 'admin', direction: 'received', type: 'email',
    subject: 'Re: Service Request – Sunset Apartments 3B',
    content: 'We can send a technician on Monday Feb 3rd at 2pm. Will that work? Estimated cost: $150-$200 depending on parts needed.',
    timestamp: '2026-02-02T17:00:00Z', status: 'read',
  },
];

export function useCommunications() {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [selectedUserType, setSelectedUserType] = useState<UserType | ''>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    if (!selectedUserType) return [];
    let users = MOCK_USERS.filter((u) => u.type === selectedUserType);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      users = users.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    return users;
  }, [selectedUserType, searchQuery]);

  const selectedUser = useMemo(
    () => MOCK_USERS.find((u) => u.id === selectedUserId),
    [selectedUserId]
  );

  const userTextMessages = useMemo(() => {
    if (!selectedUserId) return [];
    return messages
      .filter(
        (m) =>
          m.type === 'text' &&
          ((m.senderId === selectedUserId && m.receiverId === 'admin') ||
            (m.senderId === 'admin' && m.receiverId === selectedUserId))
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [selectedUserId, messages]);

  const userEmailMessages = useMemo(() => {
    if (!selectedUserId) return [];
    return messages
      .filter(
        (m) =>
          m.type === 'email' &&
          ((m.senderId === selectedUserId && m.receiverId === 'admin') ||
            (m.senderId === 'admin' && m.receiverId === selectedUserId))
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selectedUserId, messages]);

  const sendTextMessage = useCallback(
    (content: string, attachments: string[]) => {
      if (!selectedUserId) return;
      const newMessage: Message = {
        id: generateId(),
        senderId: 'admin',
        receiverId: selectedUserId,
        direction: 'sent',
        type: 'text',
        content,
        timestamp: new Date().toISOString(),
        status: 'sent',
        attachments: attachments.length > 0 ? attachments : undefined,
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    [selectedUserId]
  );

  const sendEmail = useCallback(
    (data: ComposeEmailData) => {
      if (!selectedUserId) return;
      const newMessage: Message = {
        id: generateId(),
        senderId: 'admin',
        receiverId: selectedUserId,
        direction: 'sent',
        type: 'email',
        subject: data.subject,
        content: data.body,
        timestamp: new Date().toISOString(),
        status: 'sent',
        attachments: data.attachments.length > 0 ? data.attachments : undefined,
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    [selectedUserId]
  );

  const selectUserType = useCallback((type: UserType | '') => {
    setSelectedUserType(type);
    setSelectedUserId('');
    setSearchQuery('');
  }, []);

  const selectUser = useCallback((userId: string) => {
    setSelectedUserId(userId);
  }, []);

  return {
    selectedUserType,
    selectedUserId,
    selectedUser,
    searchQuery,
    filteredUsers,
    userTextMessages,
    userEmailMessages,
    selectUserType,
    selectUser,
    setSearchQuery,
    sendTextMessage,
    sendEmail,
  };
}
