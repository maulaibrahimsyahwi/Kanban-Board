// lib/account-storage.ts

export interface StoredAccount {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  provider?: string; // Tambahkan ini
}

const STORAGE_KEY = "kanban_known_accounts";

export const getStoredAccounts = (): StoredAccount[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addStoredAccount = (account: StoredAccount) => {
  if (typeof window === "undefined") return;
  const accounts = getStoredAccounts();

  // Update jika sudah ada, atau tambah baru
  const existingIndex = accounts.findIndex((a) => a.email === account.email);
  if (existingIndex > -1) {
    // Pertahankan provider jika yang baru tidak ada
    const existingProvider = accounts[existingIndex].provider;
    accounts[existingIndex] = {
      ...account,
      provider: account.provider || existingProvider || "credentials",
    };
  } else {
    accounts.push({ ...account, provider: account.provider || "credentials" });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
};

export const removeStoredAccount = (email: string) => {
  if (typeof window === "undefined") return;
  const accounts = getStoredAccounts().filter((a) => a.email !== email);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
};
