import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'XAF' | 'USD' | 'EUR' | 'GBP' | 'NGN' | 'GHS' | 'KES';

export interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convert: (amount: number) => string;
  rates: Record<Currency, number>;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  XAF: 'FCFA',
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
  GHS: 'GH₵',
  KES: 'KSh',
};

const CURRENCY_NAMES: Record<Currency, string> = {
  XAF: 'FCFA',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  NGN: 'NGN',
  GHS: 'GHS',
  KES: 'KES',
};

const DEFAULT_RATES: Record<Currency, number> = {
  XAF: 1,
  USD: 0.0016,
  EUR: 0.0015,
  GBP: 0.0013,
  NGN: 2.55,
  GHS: 0.025,
  KES: 0.26,
};

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('camtrust_currency') as Currency | null;
    return saved || 'XAF';
  });
  const [rates, setRates] = useState<Record<Currency, number>>(DEFAULT_RATES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('camtrust_currency', currency);
  }, [currency]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://open.er-api.com/v6/latest/XAF');
        if (!res.ok) throw new Error('Failed to fetch rates');
        const data = await res.json();
        if (data.rates) {
          setRates((prev) => ({
            ...prev,
            USD: data.rates.USD || prev.USD,
            EUR: data.rates.EUR || prev.EUR,
            GBP: data.rates.GBP || prev.GBP,
            NGN: data.rates.NGN || prev.NGN,
            GHS: data.rates.GHS || prev.GHS,
            KES: data.rates.KES || prev.KES,
          }));
        }
      } catch (err) {
        console.error('Currency fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const convert = (amount: number): string => {
    const rate = rates[currency] || 1;
    const converted = amount * rate;
    const symbol = CURRENCY_SYMBOLS[currency];
    const name = CURRENCY_NAMES[currency];
    if (currency === 'XAF') {
      return `${name} ${converted.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}`;
    }
    if (currency === 'USD' || currency === 'EUR' || currency === 'GBP') {
      return `${symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${symbol} ${converted.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, rates, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};
