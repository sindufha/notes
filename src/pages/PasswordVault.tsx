import { useState, useEffect, useCallback } from "react";
import {
  Lock,
  Unlock,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  KeyRound,
  Shield,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { encrypt, decrypt } from "../lib/crypto";

type VaultEntry = {
  id: string;
  site: string;
  username: string;
  password: string;
  notes: string;
  createdAt: number;
};

const VAULT_KEY = "bloom-password-vault";
const VAULT_CHECK_KEY = "bloom-vault-check";

export default function PasswordVault() {
  const [masterPassword, setMasterPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newSite, setNewSite] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const check = localStorage.getItem(VAULT_CHECK_KEY);
    setIsFirstTime(!check);
  }, []);

  const saveVault = useCallback(
    async (data: VaultEntry[], mp: string) => {
      const json = JSON.stringify(data);
      const encrypted = await encrypt(json, mp);
      localStorage.setItem(VAULT_KEY, encrypted);
    },
    []
  );

  const unlockVault = async () => {
    setError("");
    if (isFirstTime) {
      if (masterPassword.length < 6) {
        setError("Master password must be at least 6 characters.");
        return;
      }
      if (masterPassword !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      const check = await encrypt("bloom-vault-ok", masterPassword);
      localStorage.setItem(VAULT_CHECK_KEY, check);
      setEntries([]);
      await saveVault([], masterPassword);
      setIsUnlocked(true);
      setIsFirstTime(false);
      return;
    }

    try {
      const check = localStorage.getItem(VAULT_CHECK_KEY);
      if (!check) {
        setIsFirstTime(true);
        return;
      }
      const result = await decrypt(check, masterPassword);
      if (result !== "bloom-vault-ok") {
        setError("Wrong master password.");
        return;
      }
    } catch {
      setError("Wrong master password.");
      return;
    }

    try {
      const raw = localStorage.getItem(VAULT_KEY);
      if (raw) {
        const json = await decrypt(raw, masterPassword);
        setEntries(JSON.parse(json));
      }
      setIsUnlocked(true);
    } catch {
      setError("Failed to decrypt vault.");
    }
  };

  const lockVault = () => {
    setIsUnlocked(false);
    setMasterPassword("");
    setConfirmPassword("");
    setEntries([]);
    setVisiblePasswords(new Set());
    setShowNew(false);
  };

  const addEntry = async () => {
    if (!newSite.trim() || !newPassword.trim()) return;
    const entry: VaultEntry = {
      id: uuidv4(),
      site: newSite.trim(),
      username: newUsername.trim(),
      password: newPassword.trim(),
      notes: newNotes.trim(),
      createdAt: Date.now(),
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    await saveVault(updated, masterPassword);
    setNewSite("");
    setNewUsername("");
    setNewPassword("");
    setNewNotes("");
    setShowNew(false);
  };

  const deleteEntry = async (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    await saveVault(updated, masterPassword);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const generatePassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const array = new Uint32Array(20);
    crypto.getRandomValues(array);
    setNewPassword(Array.from(array, (v) => chars[v % chars.length]).join(""));
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="bg-white border-3 border-ink rounded-blob p-8 shadow-cartoon-lg text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-lavender border-3 border-ink rounded-full shadow-cartoon-sm mb-6">
            <Lock className="h-7 w-7 text-ink" />
          </div>
          <h1 className="font-display font-bold text-3xl mb-2">Password Vault</h1>
          <p className="font-body text-ink/60 mb-6">
            {isFirstTime
              ? "Create a master password to protect your vault."
              : "Enter your master password to unlock."}
          </p>

          {error && (
            <div className="bg-bubblegum/20 border-2 border-bubblegum rounded-xl p-3 mb-4 font-body text-sm text-ink">
              {error}
            </div>
          )}

          <input
            type="password"
            placeholder="Master password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && unlockVault()}
            className="w-full px-4 py-3 font-body bg-cream border-3 border-ink rounded-2xl outline-none focus:shadow-cartoon-sm transition-shadow mb-3"
          />

          {isFirstTime && (
            <input
              type="password"
              placeholder="Confirm master password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && unlockVault()}
              className="w-full px-4 py-3 font-body bg-cream border-3 border-ink rounded-2xl outline-none focus:shadow-cartoon-sm transition-shadow mb-3"
            />
          )}

          <button
            onClick={unlockVault}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 font-display font-semibold bg-lavender border-3 border-ink rounded-full shadow-cartoon-sm hover:-translate-y-0.5 hover:shadow-cartoon transition-all mt-2"
          >
            <Unlock className="h-5 w-5" />
            {isFirstTime ? "Create vault" : "Unlock"}
          </button>

          <div className="mt-6 flex items-center gap-2 justify-center text-ink/40">
            <Shield className="h-4 w-4" />
            <span className="font-body text-xs">
              Encrypted locally with AES-256-GCM. Your data never leaves this device.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-4xl">Password Vault</h1>
          <p className="font-body text-ink/70 mt-1">
            {entries.length} saved credential{entries.length !== 1 && "s"} — encrypted locally.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNew(!showNew)}
            className="inline-flex items-center gap-2 px-5 py-3 font-display font-semibold bg-lavender border-3 border-ink rounded-full shadow-cartoon-sm hover:-translate-y-0.5 hover:shadow-cartoon transition-all"
          >
            {showNew ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {showNew ? "Cancel" : "Add"}
          </button>
          <button
            onClick={lockVault}
            className="inline-flex items-center gap-2 px-5 py-3 font-display font-semibold bg-bubblegum/30 border-3 border-ink rounded-full shadow-cartoon-sm hover:-translate-y-0.5 hover:shadow-cartoon transition-all"
          >
            <Lock className="h-5 w-5" /> Lock
          </button>
        </div>
      </div>

      {showNew && (
        <div className="bg-white border-3 border-ink rounded-blob p-6 shadow-cartoon-lg mb-8 max-w-lg">
          <h3 className="font-display font-bold text-xl mb-4">New credential</h3>
          <input
            type="text"
            placeholder="Site / service name"
            value={newSite}
            onChange={(e) => setNewSite(e.target.value)}
            className="w-full px-4 py-2.5 font-body bg-cream border-3 border-ink rounded-2xl outline-none focus:shadow-cartoon-sm transition-shadow mb-3"
          />
          <input
            type="text"
            placeholder="Username / email"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="w-full px-4 py-2.5 font-body bg-cream border-3 border-ink rounded-2xl outline-none focus:shadow-cartoon-sm transition-shadow mb-3"
          />
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1 px-4 py-2.5 font-body bg-cream border-3 border-ink rounded-2xl outline-none focus:shadow-cartoon-sm transition-shadow font-mono"
            />
            <button
              onClick={generatePassword}
              className="px-4 py-2.5 font-display font-semibold text-sm bg-mint border-3 border-ink rounded-2xl shadow-cartoon-sm hover:-translate-y-0.5 hover:shadow-cartoon transition-all"
            >
              Generate
            </button>
          </div>
          <textarea
            placeholder="Notes (optional)"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 font-body bg-cream border-3 border-ink rounded-2xl outline-none focus:shadow-cartoon-sm transition-shadow resize-none mb-4"
          />
          <button
            onClick={addEntry}
            className="inline-flex items-center gap-2 px-5 py-2.5 font-display font-semibold bg-mint border-3 border-ink rounded-full shadow-cartoon-sm hover:-translate-y-0.5 hover:shadow-cartoon transition-all"
          >
            <Check className="h-4 w-4" /> Save credential
          </button>
        </div>
      )}

      {entries.length === 0 && !showNew && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-lavender border-3 border-ink rounded-full shadow-cartoon-sm mb-4">
            <KeyRound className="h-8 w-8 text-ink" />
          </div>
          <p className="font-display text-xl font-semibold text-ink/60">
            Your vault is empty. Add your first credential!
          </p>
        </div>
      )}

      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white border-3 border-ink rounded-blob p-5 shadow-cartoon hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-lg">{entry.site}</h3>
                {entry.username && (
                  <p className="font-body text-sm text-ink/60 mt-0.5">{entry.username}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-mono text-sm bg-cream border-2 border-ink/20 rounded-lg px-3 py-1">
                    {visiblePasswords.has(entry.id)
                      ? entry.password
                      : "\u2022".repeat(Math.min(entry.password.length, 16))}
                  </span>
                  <button
                    onClick={() => togglePasswordVisibility(entry.id)}
                    className="p-1.5 rounded-full hover:bg-cream transition-colors"
                  >
                    {visiblePasswords.has(entry.id) ? (
                      <EyeOff className="h-4 w-4 text-ink/60" />
                    ) : (
                      <Eye className="h-4 w-4 text-ink/60" />
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(entry.password, entry.id)}
                    className="p-1.5 rounded-full hover:bg-cream transition-colors"
                  >
                    {copiedId === entry.id ? (
                      <Check className="h-4 w-4 text-mint" />
                    ) : (
                      <Copy className="h-4 w-4 text-ink/60" />
                    )}
                  </button>
                </div>
                {entry.notes && (
                  <p className="font-body text-sm text-ink/50 mt-2">{entry.notes}</p>
                )}
              </div>
              <button
                onClick={() => deleteEntry(entry.id)}
                className="p-2 rounded-full hover:bg-bubblegum/20 transition-colors ml-4"
              >
                <Trash2 className="h-5 w-5 text-ink/40 hover:text-bubblegum" />
              </button>
            </div>
            <div className="mt-3 pt-2 border-t border-ink/10">
              <span className="font-body text-xs text-ink/30">
                Added {new Date(entry.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
