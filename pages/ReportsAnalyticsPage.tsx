import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { ChartBarIcon, ExportIcon, CurrencyRupeeIcon, MealIcon, UsersIcon, BanknotesIcon } from '../components/Icons';

const summaryData = {
    totalExpenses: '₹33,010',
    avgMealCost: '₹45.50',
    totalMembers: '4 Active',
    fundHealthAmount: '+₹2,540',
    fundHealthStatus: 'Positive',
};

const expenseDistributionData = { bills: 83, meals: 17 };
const shoppingContributionData = { raj: 35, amit: 22, priya: 28, ravi: 15 };

const SummaryCard: React.FC<{ icon: React.ReactNode; title: string; value: string; subtitle: string; }> = ({ icon, title, value, subtitle }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary-100 dark:bg-primary-500/20 rounded-lg">
            {icon}
        </div>
        <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
        </div>
    </div>
);

const ChartContainer: React.FC<{ title: string; children: React.ReactNode; footer?: string }> = ({ title, children, footer }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md h-full flex flex-col">
        <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">{title}</h3>
        <div className="flex-grow flex items-center justify-center">
            {children}
        </div>
        {footer && <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">{footer}</p>}
    </div>
);

const ExpenseBreakdownChart = () => (
    <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6">
        <div className="relative w-36 h-36">
            <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#3b82f6 0% ${expenseDistributionData.bills}%, #10b981 ${expenseDistributionData.bills}% 100%)` }}></div>
            <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full"></div>
        </div>
        <div className="space-y-2 text-sm text-center md:text-left">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><div>Bills: 83% (₹27,550)</div></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><div>Meals: 17% (₹5,460)</div></div>
        </div>
    </div>
);

const MonthlyTrendChart = () => (
    <div className="w-full h-48 flex flex-col">
        <div className="flex-grow relative">
             <svg className="w-full h-full" preserveAspectRatio="none">
                <line x1="0" y1="100%" x2="100%" y2="100%" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="1" />
                <polyline points="0,120 40,80 80,100 120,40 160,90 200,60" fill="none" stroke="#3b82f6" strokeWidth="2" />
                <polyline points="0,150 40,140 80,145 120,130 160,135 200,125" fill="none" stroke="#10b981" strokeWidth="2" />
            </svg>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
        </div>
    </div>
);

const PaymentConsistencyChart = () => (
    <div className="w-full space-y-3 text-sm">
        {[ { name: 'Raj', percent: 80 }, { name: 'Amit', percent: 100 }, { name: 'Priya', percent: 90 }, { name: 'Ravi', percent: 100 } ].map(p => (
            <div key={p.name} className="flex items-center gap-3">
                <span className="w-12 font-medium">{p.name}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4"><div className="bg-primary h-4 rounded-full" style={{width: `${p.percent}%`}}></div></div>
                <span className="w-10 text-right font-semibold">{p.percent}%</span>
            </div>
        ))}
    </div>
);

const ShoppingContributionChart = () => (
     <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6">
        <div className="relative w-36 h-36">
             <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#3b82f6 0% 35%, #10b981 35% 57%, #f59e0b 57% 85%, #ef4444 85% 100%)` }}></div>
        </div>
        <div className="space-y-2 text-sm text-center md:text-left">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><div>Raj: 35% (₹1,911)</div></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><div>Amit: 22% (₹1,201)</div></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><div>Priya: 28% (₹1,529)</div></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><div>Ravi: 15% (₹819)</div></div>
        </div>
    </div>
);

const ReportsAnalyticsPage: React.FC = () => {
    const { user } = useAuth();
    const [activeDateRange, setActiveDateRange] = useState('This Month');

    if (user?.role !== Role.Manager) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-semibold">Access Denied</h2>
                <p className="text-gray-500">This page is only available for managers.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Top Bar */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
                <div className="flex items-center flex-wrap gap-2">
                    {['Last 30 Days', 'This Month', 'Custom Range'].map(range => (
                        <button key={range} onClick={() => setActiveDateRange(range)} className={`px-4 py-2 text-sm font-semibold rounded-md shadow-sm transition-colors ${activeDateRange === range ? 'bg-primary text-white' : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>{range}</button>
                    ))}
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"><ExportIcon className="w-4 h-4"/>Export PDF</button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"><ExportIcon className="w-4 h-4"/>Export CSV</button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard icon={<CurrencyRupeeIcon className="w-6 h-6 text-primary"/>} title="Total Expenses" value={summaryData.totalExpenses} subtitle="This Month" />
                <SummaryCard icon={<MealIcon className="w-6 h-6 text-primary"/>} title="Avg Meal Cost" value={summaryData.avgMealCost} subtitle="Per Meal" />
                <SummaryCard icon={<UsersIcon className="w-6 h-6 text-primary"/>} title="Total Members" value={summaryData.totalMembers} subtitle="Contributing" />
                <SummaryCard icon={<BanknotesIcon className="w-6 h-6 text-primary"/>} title="Fund Health" value={summaryData.fundHealthStatus} subtitle={summaryData.fundHealthAmount} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Expense Distribution" footer="Click segments for breakdown">
                    <ExpenseBreakdownChart />
                </ChartContainer>
                <ChartContainer title="6-Month Expense Trend">
                    <MonthlyTrendChart />
                </ChartContainer>
                <ChartContainer title="Member Payment Reliability" footer="Based on on-time payments">
                    <PaymentConsistencyChart />
                </ChartContainer>
                <ChartContainer title="Shopping Contribution">
                    <ShoppingContributionChart />
                </ChartContainer>
            </div>
        </div>
    );
};

export default ReportsAnalyticsPage;
