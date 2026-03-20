import React, { useEffect, useState } from "react";
import useAuthStore from "../../store/useAuthStore";
import useTransactionStore from "../../store/useTransactionStore";
import { updateProfile } from "../../authentication/authMethods";
import VerifyAccountModal from "./verifyAccountModal";
import { deleteAccount } from "../../authentication/authMethods";
import { useNavigate } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PersonalInfo {
  name: string;
  email: string;
}

interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const getInitials = (name: string | undefined | null): string => {
  if(!name || !name.trim()) return "?"
    
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";

  const firstInitial = parts[0][0];
  const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] : "";

  return (firstInitial + lastInitial).toUpperCase();
};

const formatMemberSince = (date: string | number): string =>
  new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" });

// ─── Sub-components ───────────────────────────────────────────────────────────

// Section wrapper — reuses same pattern as SettingsPage
const Section: React.FC<{
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
  danger?: boolean;
}> = ({ title, subtitle, icon, children, danger }) => (
  <div className={`bg-white border rounded-2xl shadow-sm overflow-hidden ${
    danger ? "border-rose-100" : "border-gray-100"
  }`}>
    <div className={`px-6 py-4 border-b flex items-center gap-3 ${
      danger ? "border-rose-100 bg-rose-50/50" : "border-gray-100 bg-gray-50/50"
    }`}>
      <span className="text-xl">{icon}</span>
      <div>
        <h2 className={`text-sm font-bold ${danger ? "text-rose-700" : "text-gray-700"}`}>
          {title}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

// Text input field
const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}> = ({ label, value, onChange, type = "text", placeholder, disabled, error }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 transition
        focus:outline-none focus:ring-2 focus:ring-teal-200
        ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white"}
        ${error ? "border-rose-300" : "border-gray-200"}
      `}
    />
    {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ProfilePage: React.FC = () => {

  // ── State ──
  const { user } = useAuthStore();
  const { transactions, fetchTransactions } = useTransactionStore();

  const [info, setInfo] = useState<PersonalInfo>({
    name:  user?.name ?? "",
    email: user?.email ?? "",
  });

  const [passwords, setPasswords] = useState<PasswordForm>({
    current: "",
    next:    "",
    confirm: "",
  });

  useEffect(() => {
    fetchTransactions();
  }, [])
  
  const [pwErrors, setPwErrors] = useState<Partial<PasswordForm>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [infoSaved, setInfoSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingInfo, setEditingInfo] = useState(false);
  const [ modalOpen, setModalOpen ] = useState<boolean>(false);
  const navigate = useNavigate();

  const initials = getInitials(user?.name);
//   const { user } = useAuthStore();

  // ── Handlers ──

  const validatePasswords = (): boolean => {
    const errs: Partial<PasswordForm> = {};
    if (!passwords.current) errs.current = "Enter your current password";
    if (passwords.next.length < 8) errs.next = "Password must be at least 8 characters";
    if (passwords.next !== passwords.confirm) errs.confirm = "Passwords do not match";
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) return;
    
    const result = await updateProfile(undefined, undefined, passwords.current, passwords.next)
    
    if(result){
      setPwSaved(true);
      setPasswords({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwSaved(false), 2500);
    }
  };

  const handleSaveInfo = async () => {
  const result = await updateProfile(info.name, info.email);
    if (result.success) {
      setInfoSaved(true);
      setEditingInfo(false);
      setTimeout(() => setInfoSaved(false), 2500);
    } else {
      console.error("Failed to update profile:", result.message);
      // optionally show an error message to the user
    }
  };

  const toggleShowPassword = (field: string) =>
    setShowPasswords(p => ({ ...p, [field]: !p[field] }));

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Page Body ────────────────────────────────────────────────────────── */}
      <div className="px-8 py-6 space-y-6 max-w-4xl">

        {/* ── Profile Card ─────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 shadow-md text-white flex items-center gap-6"
          style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)" }}
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30
                flex items-center justify-center text-white font-bold text-2xl
                shadow-lg select-none"
            >
              {initials}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{user?.name}</h2>
            <p className="text-sm text-white/70 mt-0.5 truncate">{user?.email}</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white/20 border border-white/20 text-xs font-semibold text-white/90">
                Free Plan
              </span>
              {/* <span className="text-xs text-white/60">
                Member since {formatMemberSince(user?.createdAt as any)}
              </span> */}
            </div>
          </div>

          {/* Stats — quick snapshot */}
          <div className="hidden md:flex flex-col gap-3 shrink-0 text-right">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Transactions</p>
              <p className="text-xl font-bold text-white">{transactions.length}</p>
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Since Joined</p>
              <p className="text-xl font-bold text-white">{formatMemberSince(user?.createdAt as any)}</p>
            </div>
          </div>
        </div>

        {/* ── Personal Info ─────────────────────────────────────────────────── */}
        <Section
          icon="👤"
          title="Personal Information"
          subtitle="Update your name, email, and contact details"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label="Full Name"
              value={info.name}
              onChange={(v) => setInfo(p => ({ ...p, name: v }))}
              placeholder="Your full name"
              disabled={!editingInfo}
            />
            <InputField
              label="Email Address"
              value={info.email}
              onChange={(v) => setInfo(p => ({ ...p, email: v }))}
              type="email"
              placeholder="your@email.com"
              disabled={!editingInfo}
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Account Plan
              </label>
              <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50">
                <span className="text-sm text-gray-500">Free</span>
                <span title="(coming soon!)" className="ml-auto text-xs font-semibold text-teal-600 hover:underline cursor-pointer">
                Upgrade →
                </span>
              </div>
            </div>
          </div>

          {/* Edit / Save actions */}
          <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100">
            {!editingInfo ? (
              <button
                onClick={() => setEditingInfo(true)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                ✏️ Edit Info
              </button>
            ) : (
              <>
                <button
                  onClick={(handleSaveInfo)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow transition-all active:scale-95 ${
                    infoSaved ? "bg-emerald-500" : "bg-teal-600 hover:bg-teal-700"
                  }`}
                  style={!infoSaved ? { background: "linear-gradient(135deg, #0f766e, #14b8a6)" } : {}}
                >
                  {infoSaved ? "✓ Saved!" : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditingInfo(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </Section>

        {/* ── Change Password ───────────────────────────────────────────────── */}
        <Section
          icon="🔒"
          title="Change Password"
          subtitle="Keep your account secure with a strong password"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Current password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords["current"] ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-teal-200 transition
                    ${pwErrors.current ? "border-rose-300" : "border-gray-200"}`}
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPasswords["current"] 
                  ? 
                    <svg xmlns="http://www.w3.org/2000/svg" 
                      width="20" height="20" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5
                        c4.477 0 8.268 2.943 9.542 7
                        -1.274 4.057-5.065 7-9.542 7
                        -4.477 0-8.268-2.943-9.542-7z" />
                    </svg> 
                  :
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        width="20" height="20" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19
                          c-4.477 0-8.268-2.943-9.542-7
                          a9.956 9.956 0 012.042-3.368M6.7 6.7
                          A9.956 9.956 0 0112 5
                          c4.477 0 8.268 2.943 9.542 7
                          a9.97 9.97 0 01-4.043 4.568M15 12
                          a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3 3l18 18" />
                    </svg>
              }
                </button>
              </div>
              {pwErrors.current && <p className="mt-1 text-xs text-rose-500">{pwErrors.current}</p>}
            </div>

            {/* New password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords["next"] ? "text" : "password"}
                  value={passwords.next}
                  onChange={(e) => setPasswords(p => ({ ...p, next: e.target.value }))}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-teal-200 transition
                    ${pwErrors.next ? "border-rose-300" : "border-gray-200"}`}
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword("next")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {
                  showPasswords["next"] ? 
                  <svg xmlns="http://www.w3.org/2000/svg" 
                width="20" height="20" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5
                  c4.477 0 8.268 2.943 9.542 7
                  -1.274 4.057-5.065 7-9.542 7
                  -4.477 0-8.268-2.943-9.542-7z" />
              </svg> 
            :
              <svg xmlns="http://www.w3.org/2000/svg" 
                  width="20" height="20" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19
                    c-4.477 0-8.268-2.943-9.542-7
                    a9.956 9.956 0 012.042-3.368M6.7 6.7
                    A9.956 9.956 0 0112 5
                    c4.477 0 8.268 2.943 9.542 7
                    a9.97 9.97 0 01-4.043 4.568M15 12
                    a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 3l18 18" />
              </svg>
                  }
                </button>
              </div>
              {pwErrors.next && <p className="mt-1 text-xs text-rose-500">{pwErrors.next}</p>}
              {/* Strength indicator */}
              {passwords.next.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        passwords.next.length >= i * 3
                          ? passwords.next.length >= 10 ? "bg-teal-500"
                          : passwords.next.length >= 6  ? "bg-yellow-400"
                          : "bg-rose-400"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords["confirm"] ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-teal-200 transition
                    ${pwErrors.confirm ? "border-rose-300" : "border-gray-200"}`}
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {
                  showPasswords["confirm"]
                   ? 
                   <svg xmlns="http://www.w3.org/2000/svg" 
                      width="20" height="20" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5
                        c4.477 0 8.268 2.943 9.542 7
                        -1.274 4.057-5.065 7-9.542 7
                        -4.477 0-8.268-2.943-9.542-7z" />
                    </svg> 
                  :
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        width="20" height="20" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19
                          c-4.477 0-8.268-2.943-9.542-7
                          a9.956 9.956 0 012.042-3.368M6.7 6.7
                          A9.956 9.956 0 0112 5
                          c4.477 0 8.268 2.943 9.542 7
                          a9.97 9.97 0 01-4.043 4.568M15 12
                          a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3 3l18 18" />
                    </svg>
                  }
                </button>
              </div>
              {pwErrors.confirm && <p className="mt-1 text-xs text-rose-500">{pwErrors.confirm}</p>}
              {/* Match indicator */}
              {passwords.confirm.length > 0 && (
                <p className={`text-xs mt-1.5 font-medium ${
                  passwords.next === passwords.confirm ? "text-teal-600" : "text-rose-500"
                }`}>
                  {passwords.next === passwords.confirm ? "✓ Passwords match" : "✗ Passwords don't match"}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100">
            <button
              onClick={handleChangePassword}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow transition-all active:scale-95 ${
                pwSaved ? "bg-emerald-500" : ""
              }`}
              style={!pwSaved ? { background: "linear-gradient(135deg, #0f766e, #14b8a6)" } : {}}
            >
              {pwSaved ? "✓ Password Updated!" : "Update Password"}
            </button>
          </div>
        </Section>

        {/* ── Danger Zone ───────────────────────────────────────────────────── */}
        <Section
          icon="⚠️"
          title="Danger Zone"
          subtitle="Irreversible account actions — proceed with caution"
          danger
        >
          <div className="flex items-center justify-between p-4 rounded-xl border border-rose-100 bg-rose-50/50">
            <div>
              <p className="text-sm font-semibold text-rose-700">Delete Account</p>
              <p className="text-xs text-rose-400 mt-0.5">
                Permanently delete your account and all associated data. Cannot be undone.
              </p>
            </div>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition active:scale-95 shrink-0 ml-4"
              >
                Delete Account
              </button>
            ) : (
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <p className="text-xs text-rose-600 font-semibold">Are you sure?</p>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-3 py-2 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 transition active:scale-95"
                >
                  Yes, delete
                </button>
              </div>
            )}
          </div>
        </Section>

        <VerifyAccountModal
          isOpen={modalOpen}
          title="Delete Account"
          onClose={() => setModalOpen(false)}
          onConfirm={ async (password) => {
            try {
              const result = await deleteAccount(password, navigate);
              if (result) setModalOpen(false);
            } catch (err) {
              console.log(err);
            }
          }}
        />

      </div>
    </div>
  );
};

export default ProfilePage;