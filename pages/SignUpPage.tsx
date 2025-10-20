import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { SpinnerIcon, SparklesIcon } from '../components/Icons';

interface SignUpPageProps {
  onNavigateToLogin: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError('Please select a role.');
      return;
    }
    setError('');
    setLoading(true);
    try {
        const user = await signup(name, email, password, role);
        if (!user) {
            setError('Could not create account. The email might already be in use.');
        }
    } catch (err) {
        setError('An unexpected error occurred. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-2/5 bg-primary-600 items-center justify-center p-12 text-white flex-col">
        <div className="text-center">
          <SparklesIcon className="w-24 h-24 mx-auto mb-6 opacity-80" />
          <h1 className="text-4xl font-bold">Join thousands managing expenses together</h1>
          <p className="mt-4 text-lg opacity-80">
            BillKhata makes it simple to track bills, log meals, and stay organized with your roommates.
          </p>
        </div>
      </div>
      
      {/* Right Panel (Form) */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full">
            <div className="lg:hidden text-center mb-8">
                <h1 className="text-center text-4xl font-bold text-primary">BillKhata</h1>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Create an Account
            </h2>
            <div className="bg-white dark:bg-gray-800 p-8 mt-8 rounded-lg shadow-lg">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">I am a:</label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    {[Role.Manager, Role.Member].map((r) => (
                      <label key={r} className={`flex flex-col items-center text-center p-4 rounded-md cursor-pointer border-2 transition-all ${role === r ? 'border-primary bg-primary-50 dark:bg-primary-500/20 shadow-md' : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'}`}>
                        <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />
                        <span className={`font-bold text-base ${role === r ? 'text-primary' : 'text-gray-800 dark:text-gray-200'}`}>{r}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{r === Role.Manager ? '(Create Room)' : '(Join Room)'}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {error && <p className="text-sm text-center text-red-500">{error}</p>}

                <div>
                  <button type="submit" disabled={loading}
                    className="flex w-full justify-center rounded-md border border-transparent bg-primary py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                  >
                    {loading ? <SpinnerIcon className="h-5 w-5" /> : 'Create Account'}
                  </button>
                </div>
              </form>
              <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button onClick={onNavigateToLogin} className="font-medium text-primary hover:text-primary-500">
                  Log in
                </button>
              </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;