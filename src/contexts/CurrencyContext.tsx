import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  flag: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'United States Dollar', symbol: '$', locale: 'en-US', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE', flag: '🇪🇺' },
  { code: 'GBP', name: 'Sterling Pound', symbol: '£', locale: 'en-GB', flag: '🇬🇧' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', locale: 'de-CH', flag: '🇨🇭' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN', flag: '🇮🇳' },
  { code: 'AED', name: 'United Arab Emirates Dirham', symbol: 'AED', locale: 'ar-AE', flag: '🇦🇪' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU', flag: '🇦🇺' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG', flag: '🇸🇬' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', locale: 'en-CA', flag: '🇨🇦' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', locale: 'en-NZ', flag: '🇳🇿' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', locale: 'en-HK', flag: '🇭🇰' },
  { code: 'TWD', name: 'Taiwan New Dollar', symbol: 'NT$', locale: 'zh-TW', flag: '🇹🇼' },
  { code: 'BSD', name: 'Bahamian Dollar', symbol: 'B$', locale: 'en-BS', flag: '🇧🇸' },
  { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$', locale: 'en-BZ', flag: '🇧🇿' },
  { code: 'FJD', name: 'Fiji Dollar', symbol: 'FJ$', locale: 'en-FJ', flag: '🇫🇯' },
  { code: 'KYD', name: 'Cayman Islands Dollar', symbol: 'CI$', locale: 'en-KY', flag: '🇰🇾' },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$', locale: 'en-AG', flag: '🌎' },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', locale: 'en-JM', flag: '🇯🇲' },
  { code: 'TTD', name: 'Trinidad & Tobago Dollar', symbol: 'TT$', locale: 'en-TT', flag: '🇹🇹' },
  { code: 'SRD', name: 'Surinamese Dollar', symbol: 'SR$', locale: 'nl-SR', flag: '🇸🇷' },
  { code: 'BMD', name: 'Bermudian Dollar', symbol: 'BD$', locale: 'en-BM', flag: '🇧🇲' },
  { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$', locale: 'en-BB', flag: '🇧🇧' },
  { code: 'GYD', name: 'Guyanese Dollar', symbol: 'G$', locale: 'en-GY', flag: '🇬🇾' },
  { code: 'LRD', name: 'Liberian Dollar', symbol: 'L$', locale: 'en-LR', flag: '🇱🇷' },
  { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', locale: 'en-NA', flag: '🇳🇦' },
  { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$', locale: 'en-SB', flag: '🇸🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP', flag: '🇯🇵' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', locale: 'zh-CN', flag: '🇨🇳' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', locale: 'ko-KR', flag: '🇰🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', locale: 'es-MX', flag: '🇲🇽' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', locale: 'pt-BR', flag: '🇧🇷' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', locale: 'en-ZA', flag: '🇿🇦' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', locale: 'sv-SE', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', locale: 'nb-NO', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', locale: 'da-DK', flag: '🇩🇰' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', locale: 'pl-PL', flag: '🇵🇱' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', locale: 'th-TH', flag: '🇹🇭' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', locale: 'ms-MY', flag: '🇲🇾' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', locale: 'en-PH', flag: '🇵🇭' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', locale: 'id-ID', flag: '🇮🇩' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', locale: 'tr-TR', flag: '🇹🇷' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', locale: 'ar-SA', flag: '🇸🇦' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QAR', locale: 'ar-QA', flag: '🇶🇦' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', locale: 'ar-KW', flag: '🇰🇼' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', locale: 'ar-BH', flag: '🇧🇭' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'OMR', locale: 'ar-OM', flag: '🇴🇲' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', locale: 'ar-EG', flag: '🇪🇬' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', locale: 'en-NG', flag: '🇳🇬' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', locale: 'en-KE', flag: '🇰🇪' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', locale: 'en-GH', flag: '🇬🇭' },
];

interface CurrencyContextType {
  currency: CurrencyInfo;
  setCurrency: (code: string) => void;
  formatAmount: (amount: number) => string;
  formatCompact: (amount: number) => string;
  currencySymbol: string;
  changeLog: CurrencyChangeLogEntry[];
  addChangeLog: (from: string, to: string, user: string) => void;
}

export interface CurrencyChangeLogEntry {
  id: string;
  fromCode: string;
  toCode: string;
  changedBy: string;
  changedAt: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'truproperty_currency';
const LOG_KEY = 'truproperty_currency_log';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || 'USD';
  });

  const [changeLog, setChangeLog] = useState<CurrencyChangeLogEntry[]>(() => {
    const stored = localStorage.getItem(LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  const setCurrency = useCallback((code: string) => {
    setCurrencyCode(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const addChangeLog = useCallback((fromCode: string, toCode: string, user: string) => {
    const entry: CurrencyChangeLogEntry = {
      id: crypto.randomUUID(),
      fromCode,
      toCode,
      changedBy: user,
      changedAt: new Date().toISOString(),
    };
    setChangeLog(prev => {
      const updated = [entry, ...prev].slice(0, 50);
      localStorage.setItem(LOG_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const formatAmount = useCallback((amount: number) => {
    try {
      return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency.symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
  }, [currency]);

  const formatCompact = useCallback((amount: number) => {
    try {
      return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code,
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(amount);
    } catch {
      return `${currency.symbol}${(amount / 1000).toFixed(0)}K`;
    }
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      formatAmount,
      formatCompact,
      currencySymbol: currency.symbol,
      changeLog,
      addChangeLog,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
}
