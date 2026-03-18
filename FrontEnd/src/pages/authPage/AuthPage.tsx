import React, { useState } from "react";
import {SignUp, SignIn} from '../../authentication/authMethods';
import AuthError from "../../authentication/AuthError";
import { useNavigate } from "react-router-dom";
import { GoogleSignIn } from "../../authentication/googleAuth";
import { GoogleLogin } from "@react-oauth/google";

const Auth: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [pass, setPass] = useState<string>("");
  const [hidePass, sethidePass] = useState<boolean>(true);
  const [signin, setSignIn] = useState<boolean>(true);
  const [error, setError] = useState<{ message: string } | null>(null);

  const toggleSignin = () => {
    setError(null);
    setSignIn(!signin);
  };

  const handleSignIn = async () => {
    setError(null);
    const result = await SignIn(email, pass, navigate);
    if (result?.message) setError(result);
  };

  const handleSignUp = async () => {
    setError(null);
    const result : any = await SignUp(name, email, pass, navigate);
    if (result?.message) setError(result);
  };

  const handleSignInKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSignIn();
  };

  const handleSignUpKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSignIn();
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">CashFlow💰 Monitor</h1>
          <p className="text-sm text-gray-500">
            { signin ?
            "Sign in to manage your cash flow" : "Sign Up to manage your cash flow"}
          </p>
        </div>

        {/* Form */}
        { signin ?
          <div>
          <form className="space-y-4">
          <div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              onChange={e => { setEmail(e.target.value); setError(null); }}
              className="w-full mt-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
            <div className="flex relative">
              <input
              type={`${hidePass ? 'password' : 'text'}`}
              placeholder="••••••••"
              onChange={e => { setPass(e.target.value); setError(null); }}
              onKeyDown={handleSignInKey}
              className="w-full mt-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="button" className="text-sm px-2 py-2 mt-1 text-gray-600 border rounded focus:outline-none" onClick={(() => sethidePass(!hidePass))}>
            { hidePass ?
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
          </div>

          <div className="flex items-center justify-between text-sm">
            <button type="button" className="text-blue-600 hover:underline">
              Forgot password?
            </button>
          </div>

          <AuthError error={error} />

          <button
            onClick={handleSignIn}
            type='button'
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Sign in
          </button>

          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const result = await GoogleSignIn(credentialResponse.credential!);
              if (result?.message && !result?.user) setError(result);
            }}
            onError={() => setError({ message: 'Google Sign-In failed' })}
          />
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="px-3 text-sm text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>
        
        <button 
        onClick={toggleSignin}
        className="w-full border py-2 rounded hover:bg-gray-100 transition">
          Create new account
        </button>
        </div>

        :
        <div>
        <form className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              type="text"
              placeholder="Name"
              onChange={e => { setName(e.target.value); setError(null); }}
              className="w-full mt-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              onChange={e => { setEmail(e.target.value); setError(null); }}
              className="w-full mt-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
            <div className="flex relative">
              <input
              type={`${hidePass ? 'password' : 'text'}`}
              placeholder="••••••••"
              onChange={e => { setPass(e.target.value); setError(null); }}
              onKeyDown={handleSignUpKey}
              className="w-full mt-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="button" className="text-sm px-2 py-2 mt-1 text-gray-600 border rounded focus:outline-none" onClick={(() => sethidePass(!hidePass))}>
            { hidePass ?
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
          </div>

          <AuthError error={error} />

          <button
            onClick={handleSignUp}
            type='button'
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const result = await GoogleSignIn(credentialResponse.credential!);
              if (result?.message && !result?.user) setError(result);
            }}
            onError={() => setError({ message: 'Google Sign-In failed' })}
          />
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="px-3 text-sm text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <button 
        onClick={toggleSignin}
        className="w-full border py-2 rounded hover:bg-gray-100 transition">
          Already have an account!
        </button>
        </div>
        }

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-6">
          © 2026 CashFlow Monitor
        </p>
      </div>
    </div>
  );
};

export default Auth;