import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { BankAccount, PropertyBankLink, BankPurpose } from '@/types/bankAccount';

const generateId = () => Math.random().toString(36).substring(2, 11);

const MOCK_ACCOUNTS: BankAccount[] = [
  {
    id: 'ba1',
    accountHolderName: 'Riverside Properties LLC',
    bankName: 'Chase',
    accountNumber: '4829103756',
    routingNumber: '021000021',
    accountType: 'checking',
    country: 'US',
    currency: 'USD',
    nickname: 'Chase Rent Acct',
    createdAt: '2024-06-01T00:00:00Z',
    createdBy: 'admin',
  },
  {
    id: 'ba2',
    accountHolderName: 'Riverside Properties LLC',
    bankName: 'Bank of America',
    accountNumber: '7381920456',
    routingNumber: '026009593',
    accountType: 'savings',
    country: 'US',
    currency: 'USD',
    nickname: 'BoA Escrow',
    createdAt: '2024-07-15T00:00:00Z',
    createdBy: 'admin',
  },
  {
    id: 'ba3',
    accountHolderName: 'John Smith',
    bankName: 'Wells Fargo',
    accountNumber: '5920184637',
    routingNumber: '121000248',
    accountType: 'checking',
    country: 'US',
    currency: 'USD',
    createdAt: '2024-09-01T00:00:00Z',
    createdBy: 'admin',
  },
];

const MOCK_LINKS: PropertyBankLink[] = [];

interface BankAccountsContextType {
  accounts: BankAccount[];
  links: PropertyBankLink[];
  addAccount: (data: Omit<BankAccount, 'id' | 'createdAt' | 'createdBy'>) => BankAccount;
  getLinksForProperty: (propertyId: string) => PropertyBankLink[];
  getAccountById: (id: string) => BankAccount | undefined;
  linkAccount: (propertyId: string, bankAccountId: string, purpose: BankPurpose, customPurpose?: string, primary?: boolean) => PropertyBankLink;
  unlinkAccount: (linkId: string) => void;
  updateLink: (linkId: string, updates: Partial<Pick<PropertyBankLink, 'purpose' | 'customPurpose' | 'primaryForPurpose'>>) => void;
  setPropertyBankLinks: (propertyId: string, links: PropertyBankLink[]) => void;
}

const BankAccountsContext = createContext<BankAccountsContextType | undefined>(undefined);

export function BankAccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<BankAccount[]>(MOCK_ACCOUNTS);
  const [links, setLinks] = useState<PropertyBankLink[]>(MOCK_LINKS);

  const addAccount = useCallback((data: Omit<BankAccount, 'id' | 'createdAt' | 'createdBy'>) => {
    const newAccount: BankAccount = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
    };
    setAccounts((prev) => [...prev, newAccount]);
    return newAccount;
  }, []);

  const getLinksForProperty = useCallback(
    (propertyId: string) => links.filter((l) => l.propertyId === propertyId),
    [links]
  );

  const getAccountById = useCallback(
    (id: string) => accounts.find((a) => a.id === id),
    [accounts]
  );

  const linkAccount = useCallback(
    (propertyId: string, bankAccountId: string, purpose: BankPurpose, customPurpose?: string, primary?: boolean) => {
      const link: PropertyBankLink = {
        id: generateId(),
        propertyId,
        bankAccountId,
        purpose,
        customPurpose,
        primaryForPurpose: primary || false,
        linkedAt: new Date().toISOString(),
      };
      setLinks((prev) => [...prev, link]);
      return link;
    },
    []
  );

  const unlinkAccount = useCallback((linkId: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
  }, []);

  const updateLink = useCallback(
    (linkId: string, updates: Partial<Pick<PropertyBankLink, 'purpose' | 'customPurpose' | 'primaryForPurpose'>>) => {
      setLinks((prev) =>
        prev.map((l) => (l.id === linkId ? { ...l, ...updates } : l))
      );
    },
    []
  );

  const setPropertyBankLinks = useCallback(
    (propertyId: string, newLinks: PropertyBankLink[]) => {
      setLinks((prev) => [
        ...prev.filter((l) => l.propertyId !== propertyId),
        ...newLinks,
      ]);
    },
    []
  );

  return (
    <BankAccountsContext.Provider
      value={{
        accounts,
        links,
        addAccount,
        getLinksForProperty,
        getAccountById,
        linkAccount,
        unlinkAccount,
        updateLink,
        setPropertyBankLinks,
      }}
    >
      {children}
    </BankAccountsContext.Provider>
  );
}

export function useBankAccountsContext() {
  const ctx = useContext(BankAccountsContext);
  if (!ctx) throw new Error('useBankAccountsContext must be used within BankAccountsProvider');
  return ctx;
}
