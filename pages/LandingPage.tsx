import React from 'react';
import { SparklesIcon, BillsIcon, MealIcon, ChartBarIcon } from '../components/Icons';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignUp: () => void;
}

// FIX: Changed invalid prop types from a-zA-Z to string.
const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/50 mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin, onNavigateToSignUp }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Header */}
      <header className="py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="w-8 h-8 text-primary" />
          <span className="font-bold text-2xl">BillKhata</span>
        </div>
        <div className="space-x-2">
          <button onClick={onNavigateToLogin} className="px-4 py-2 text-sm font-semibold rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Login
          </button>
          <button onClick={onNavigateToSignUp} className="px-4 py-2 text-sm font-semibold rounded-md bg-primary text-white hover:bg-primary-600 transition-colors">
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Split Bills,
              <br/>
              <span className="text-primary">Share Meals,</span>
              <br/>
              Stay Friends.
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto md:mx-0">
              The ultimate app for managing shared living expenses. From rent and utilities to daily meals, BillKhata keeps everything fair and transparent.
            </p>
            <div className="mt-8 flex gap-4 justify-center md:justify-start">
              <button onClick={onNavigateToSignUp} className="px-8 py-3 font-semibold rounded-md bg-primary text-white hover:bg-primary-600 transition-transform hover:scale-105 shadow-lg">
                Create Your Khata
              </button>
               <button className="px-8 py-3 font-semibold rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform hover:scale-105">
                See Demo
              </button>
            </div>
          </div>
          <div className="hidden md:block">
             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl transform rotate-3">
                 <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400 font-medium">[Dashboard Preview Animated Mockup]</p>
                 </div>
             </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Everything you need in one place</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">BillKhata is packed with features to make shared living easier, more transparent, and conflict-free.</p>
            <div className="grid md:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={<BillsIcon className="w-6 h-6 text-primary" />} 
                    title="💰 Bill Splitting"
                    description="Easily add bills for rent, utilities, and more. Split them equally or assign custom amounts per person."
                />
                <FeatureCard 
                    icon={<MealIcon className="w-6 h-6 text-primary" />} 
                    title="🍽️ Meal Tracker"
                    description="Log daily meals to automatically calculate costs. Perfect for managing shared grocery funds fairly."
                />
                <FeatureCard 
                    icon={<ChartBarIcon className="w-6 h-6 text-primary" />} 
                    title="📊 Smart Analytics"
                    description="Get clear insights with per-member breakdowns, monthly trends, and payment history reports."
                />
            </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
             <h2 className="text-3xl font-bold mb-12">Get Started in 4 Simple Steps</h2>
             <div className="grid md:grid-cols-4 gap-8 relative">
                 {/* Dashed line connector for desktop */}
                 <div className="hidden md:block absolute top-1/2 left-0 w-full h-px -translate-y-8">
                     <svg width="100%" height="2"><line x1="0" y1="1" x2="100%" y2="1" strokeWidth="2" strokeDasharray="8, 8" className="stroke-current text-gray-300 dark:text-gray-600"/></svg>
                 </div>
                 <div className="relative flex flex-col items-center">
                     <div className="h-16 w-16 bg-primary text-white rounded-full flex items-center justify-center font-bold text-2xl z-10">1</div>
                     <h3 className="mt-4 font-bold text-lg">Create Room</h3>
                     <p className="mt-1 text-gray-600 dark:text-gray-400">A manager sets up a new room and gets a unique code.</p>
                 </div>
                 <div className="relative flex flex-col items-center">
                     <div className="h-16 w-16 bg-primary text-white rounded-full flex items-center justify-center font-bold text-2xl z-10">2</div>
                     <h3 className="mt-4 font-bold text-lg">Add Members</h3>
                     <p className="mt-1 text-gray-600 dark:text-gray-400">Members join the room using the shared 6-digit code.</p>
                 </div>
                 <div className="relative flex flex-col items-center">
                     <div className="h-16 w-16 bg-primary text-white rounded-full flex items-center justify-center font-bold text-2xl z-10">3</div>
                     <h3 className="mt-4 font-bold text-lg">Track Expenses</h3>
                     <p className="mt-1 text-gray-600 dark:text-gray-400">Log all bills, meals, and deposits as they happen.</p>
                 </div>
                 <div className="relative flex flex-col items-center">
                     <div className="h-16 w-16 bg-primary text-white rounded-full flex items-center justify-center font-bold text-2xl z-10">4</div>
                     <h3 className="mt-4 font-bold text-lg">Settle Up</h3>
                     <p className="mt-1 text-gray-600 dark:text-gray-400">View clear balances and settle dues with a single click.</p>
                 </div>
             </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center text-gray-500 dark:text-gray-400">
            <p>&copy; 2024 BillKhata. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;