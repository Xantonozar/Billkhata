import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SpinnerIcon, HomeIcon, SparklesIcon } from '../components/Icons';

interface LoginPageProps {
  onNavigateToSignUp: () => void;
  onNavigateToHome: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToSignUp, onNavigateToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (!user) {
        setError('Invalid email or password.');
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
      <div className="hidden lg:flex w-2/5 bg-primary-600 items-center justify-center p-12 text-white flex-col relative">
        <div className="absolute top-8 left-8">
            <button onClick={onNavigateToHome} className="flex items-center space-x-2 opacity-70 hover:opacity-100 transition-opacity">
                <HomeIcon className="w-6 h-6"/>
                <span>Home</span>
            </button>
        </div>
        <div className="text-center">
            <SparklesIcon className="w-24 h-24 mx-auto mb-6 opacity-80" />
            <h1 className="text-4xl font-bold">Welcome Back</h1>
            <p className="mt-4 text-lg opacity-80">
              Manage your shared expenses with ease. Log in to continue where you left off.
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
            Log in to your account
          </h2>
          <div className="bg-white dark:bg-gray-800 p-8 mt-8 rounded-lg shadow-lg">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              {error && <p className="text-sm text-red-500">{error}</p>}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-primary py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                >
                  {loading ? <SpinnerIcon className="h-5 w-5" /> : 'Log In'}
                </button>
              </div>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button onClick={onNavigateToSignUp} className="font-medium text-primary hover:text-primary-500">
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;