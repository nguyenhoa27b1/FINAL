import React, { useState, useEffect } from 'react';

// This tells TypeScript that the 'google' object will be available globally.
declare var google: any;

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (email: string, name: string, password: string) => Promise<boolean>;
  onGoogleLogin: (credentialResponse: any) => Promise<boolean>;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, onGoogleLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Safely access the environment variable
  const VITE_GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = async (response: any) => {
    setError('');
    setLoading(true);
    try {
        const success = await onGoogleLogin(response);
        if (!success) {
            setError("Google Sign-In failed. The user may not exist or another error occurred.");
        }
    } catch (err) {
        setError((err as Error).message || "An unexpected error occurred during Google Sign-In.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (!VITE_GOOGLE_CLIENT_ID) {
      console.warn("VITE_GOOGLE_CLIENT_ID environment variable not set. Google Sign-In is disabled.");
      return;
    }

    if (typeof google === 'undefined' || typeof google.accounts === 'undefined') {
      console.error("Google Identity Services script not loaded yet.");
      // You might want to add a retry mechanism here
      return;
    }

    google.accounts.id.initialize({
      client_id: VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    const googleSignInButton = document.getElementById('googleSignInButton');
    if (googleSignInButton) {
        google.accounts.id.renderButton(
          googleSignInButton,
          { theme: 'outline', size: 'large', width: '100%' } // configuration options
        );
    }
    
    // google.accounts.id.prompt(); // Optional: display the One Tap prompt
  }, [VITE_GOOGLE_CLIENT_ID]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
        let success = false;
        if (isRegister) {
            if (!name) {
                setError("Full name is required for registration.");
                setLoading(false);
                return;
            }
            success = await onRegister(email, name, password);
            if (!success) {
                setError("Registration Failed: This email is already in use.");
            }
        } else {
            success = await onLogin(email, password);
            if (!success) {
                setError("Login Failed: User not found or incorrect password.");
            }
        }
    } catch (err) {
        setError((err as Error).message || "An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  };
  
  const toggleRegister = () => {
    setIsRegister(!isRegister);
    setError('');
    // Clear fields on toggle
    setEmail('');
    setPassword('');
    setName('');
  }

  const commonInputClasses = "appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 space-y-8">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">TaskFlow</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{isRegister ? 'Create a new account' : 'Sign in to your account'}</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {isRegister && (
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <div className="mt-1">
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    className={commonInputClasses}
                    placeholder="John Doe"
                  />
                </div>
              </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
            <div className="mt-1">
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className={commonInputClasses}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <div className="mt-1">
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className={commonInputClasses}
                placeholder="Password"
              />
            </div>
          </div>
          
          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-wait"
            >
              {loading ? 'Processing...' : (isRegister ? 'Register' : 'Sign in')}
            </button>
          </div>
        </form>

        <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 text-xs text-gray-500 dark:text-gray-400">Or continue with</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        
        <div className="w-full">
            {VITE_GOOGLE_CLIENT_ID ? (
                <div id="googleSignInButton" className="flex justify-center"></div>
            ) : (
                <div className="text-center text-xs text-gray-500 p-2 border rounded-md dark:border-gray-600">
                    Google Sign-In is not configured.
                </div>
            )}
        </div>
        
        {!isRegister && (
            <div className="p-4 bg-indigo-50 dark:bg-gray-700/50 border border-indigo-200 dark:border-gray-600 rounded-lg text-sm">
                <p className="font-semibold text-indigo-800 dark:text-indigo-200">For Demo Purposes</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                    <li><strong>Admin:</strong> admin@example.com / <span className="font-mono bg-gray-200 dark:bg-gray-600 px-1 rounded">adminpassword</span></li>
                    <li><strong>User:</strong> user@example.com / <span className="font-mono bg-gray-200 dark:bg-gray-600 px-1 rounded">userpassword</span></li>
                </ul>
            </div>
        )}

        {error && (
            <div className="text-center">
                <p className="text-sm text-red-500">{error}</p>
            </div>
        )}

        <div className="text-sm text-center pt-2">
            <button onClick={toggleRegister} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Login;