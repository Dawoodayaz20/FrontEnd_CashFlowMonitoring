import React from "react";

interface AuthErrorProps {
  error: { message: string } | null;
}

const AuthError: React.FC<AuthErrorProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="flex items-start gap-3 border border-red-400 bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm">
      <span className="mt-0.5 text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10c0 4.418-3.582 8-8 8S2 14.418 2 10 5.582 2 10 2s8 3.582 8 8zm-8-3a1 1 0 00-1 1v3a1 1 0 102 0V8a1 1 0 00-1-1zm0 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
      </span>
      <span>{error.message}</span>
    </div>
  );
};

export default AuthError;