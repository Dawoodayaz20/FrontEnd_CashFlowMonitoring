import { useState, useEffect, useRef } from "react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  title: string,
  onClose: () => void;
  onConfirm: (password: string) => void;
}

export default function VerifyAccountModal({
  isOpen,
  title,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setPassword("");
        setError("");
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleConfirm = async () => {
    if (!password.trim()) {
      setError("Please enter your password.");
      triggerShake();
      return;
    }
    onConfirm(password);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") onClose();
  };

  if (!isVisible && !isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-6px); }
          30%       { transform: translateX(6px);  }
          45%       { transform: translateX(-4px); }
          60%       { transform: translateX(4px);  }
          75%       { transform: translateX(-2px); }
          90%       { transform: translateX(2px);  }
        }
        .shake { animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97); }

        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes errorIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .backdrop-in { animation: backdropIn 0.2s ease forwards; }
        .card-in     { animation: cardIn 0.25s cubic-bezier(0.34, 1.15, 0.64, 1) forwards; }
        .error-in    { animation: errorIn 0.18s ease forwards; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={(e) => e.target === e.currentTarget && onClose()}
        className="backdrop-in fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/40 backdrop-blur-md"
      >
        {/* Card */}
        <div
          className={`card-in ${isShaking ? "shake" : ""} w-full max-w-md bg-white rounded-2xl border border-rose-200 shadow-[0_24px_60px_rgba(225,29,72,0.12),0_8px_24px_rgba(0,0,0,0.07)] overflow-hidden`}
        >
          {/* Gradient top bar */}
          <div className="h-[3px] bg-gradient-to-r from-rose-300 via-rose-500 to-rose-800" />

          <div className="px-7 pt-7 pb-6 flex flex-col gap-5">

            {/* Header row */}
            <div className="flex items-start gap-3.5">
              <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 shadow-[0_0_0_5px_rgba(254,205,211,0.25)] flex items-center justify-center text-xl">
                🗑️
              </div>
              <div>
                <p className="text-sm font-bold text-rose-900 leading-snug">
                  {title}
                </p>
                <p className="text-xs text-rose-400 mt-1 leading-relaxed">
                  This action is{" "}
                  <span className="font-semibold text-rose-500">permanent</span>{" "}
                  and cannot be undone. All your data will be erased.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-rose-50" />

            {/* Warning callout */}
            <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50/50 border border-rose-100">
              <span className="text-xs mt-0.5">⚠️</span>
              <p className="text-xs text-rose-700 leading-relaxed">
                To confirm, please enter your{" "}
                <span className="font-mono font-medium text-rose-600">password</span>{" "}
                below.
              </p>
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-rose-800 uppercase tracking-widest">
                Password
              </label>
              <input
                ref={inputRef}
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={handleKeyDown}
                className={`font-mono text-sm px-3.5 py-2.5 rounded-xl border transition-all duration-150 placeholder:text-rose-200 text-stone-800 focus:outline-none focus:ring-[3px]
                  ${
                    error
                      ? "border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-200"
                      : "border-rose-200 bg-rose-50/30 focus:border-rose-400 focus:ring-rose-100"
                  }`}
              />

              {/* Inline error */}
              {error && (
                <div className="error-in flex items-center gap-1.5 mt-0.5">
                  <span className="text-rose-500 text-xs font-bold leading-none">✕</span>
                  <p className="text-xs text-rose-500 font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-500 hover:bg-gray-50 active:scale-95 transition-all duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 hover:shadow-[0_4px_14px_rgba(225,29,72,0.35)] hover:-translate-y-px active:scale-95 transition-all duration-150"
              >
                Yes, delete
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}