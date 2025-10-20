import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { ChartBarIcon, ExportIcon, CurrencyRupeeIcon, MealIcon, UsersIcon, BanknotesIcon } from '../components/Icons';

const mockReportsData: { [key: string]: any } = {
    'This Month': {
        summaryData: { totalExpenses: '₹33,010', avgMealCost: '₹45.50', totalMembers: '4 Active', fundHealthAmount: '+₹2,540', fundHealthStatus: 'Positive' },
        expenseDistributionData: { bills: 83, meals: 17, billAmount: '₹27,550', mealAmount: '₹5,460' },
        monthlyTrend: { bills: [120, 80, 100, 40, 90, 60], meals: [150, 140, 145, 130, 135, 125] },
        paymentConsistency: [ { name: 'Raj', percent: 80 }, { name: 'Amit', percent: 100 }, { name: 'Priya', percent: 90 }, { name: 'Ravi', percent: 100 } ],
        shoppingContribution: { data: { raj: 35, amit: 22, priya: 28, ravi: 15 }, amounts: { raj: '₹1,911', amit: '₹1,201', priya: '₹1,529', ravi: '₹819' } }
    },
    'Last 30 Days': {
        summaryData: { totalExpenses: '₹35,200', avgMealCost: '₹46.10', totalMembers: '4 Active', fundHealthAmount: '+₹1,800', fundHealthStatus: 'Positive' },
        expenseDistributionData: { bills: 80, meals: 20, billAmount: '₹28,160', mealAmount: '₹7,040' },
        monthlyTrend: { bills: [110, 85, 95, 45, 95, 65], meals: [145, 142, 148, 132, 138, 128] },
        paymentConsistency: [ { name: 'Raj', percent: 82 }, { name: 'Amit', percent: 98 }, { name: 'Priya', percent: 91 }, { name: 'Ravi', percent: 100 } ],
        shoppingContribution: { data: { raj: 32, amit: 25, priya: 25, ravi: 18 }, amounts: { raj: '₹2,252', amit: '₹1,760', priya: '₹1,760', ravi: '₹1,267' } }
    }
};


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

const ExpenseBreakdownChart: React.FC<{data: any}> = ({ data }) => (
    <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6">
        <div className="relative w-36 h-36">
            <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#3b82f6 0% ${data.bills}%, #10b981 ${data.bills}% 100%)` }}></div>
            <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full"></div>
        </div>
        <div className="space-y-2 text-sm text-center md:text-left">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><div>Bills: {data.bills}% ({data.billAmount})</div></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><div>Meals: {data.meals}% ({data.mealAmount})</div></div>
        </div>
    </div>
);

const MonthlyTrendChart: React.FC<{ data: { bills: number[], meals: number[] } }> = ({ data }) => {
    const width = 240;
    const height = 180;
    const padding = { top: 10, right: 10, bottom: 20, left: 30 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const numDataPoints = data.bills.length;

    const maxY = 160;
    const yTicks = [0, 40, 80, 120, 160];

    const getX = (index: number) => padding.left + (index * (chartWidth / (numDataPoints - 1)));
    const getY = (value: number) => padding.top + chartHeight - (value / maxY * chartHeight);

    const billsPoints = data.bills.map((p, i) => `${getX(i)},${getY(p)}`).join(' ');
    const mealsPoints = data.meals.map((p, i) => `${getX(i)},${getY(p)}`).join(' ');

    const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];

    return (
        <div className="w-full h-full flex flex-col">
            <svg className="flex-grow" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                {/* Y-axis grid lines and labels */}
                {yTicks.map(tick => (
                    <g key={tick} className="text-gray-300 dark:text-gray-600">
                        <line x1={padding.left} y1={getY(tick)} x2={width - padding.right} y2={getY(tick)} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
                        <text x={padding.left - 5} y={getY(tick) + 3} textAnchor="end" className="text-[8px] fill-current text-gray-500 dark:text-gray-400 font-sans">
                            {tick}
                        </text>
                    </g>
                ))}

                {/* X-axis labels */}
                {months.map((month, i) => (
                    <text key={month} x={getX(i)} y={height - 5} textAnchor="middle" className="text-[8px] fill-current text-gray-500 dark:text-gray-400 font-sans">
                        {month}
                    </text>
                ))}

                {/* Data lines */}
                <polyline points={billsPoints} fill="none" stroke="#3b82f6" strokeWidth="2" />
                <polyline points={mealsPoints} fill="none" stroke="#10b981" strokeWidth="2" />

                {/* Data points */}
                {data.bills.map((p, i) => (
                    <circle key={`bill-dot-${i}`} cx={getX(i)} cy={getY(p)} r="2.5" fill="#3b82f6" stroke="white" strokeWidth="1" />
                ))}
                {data.meals.map((p, i) => (
                    <circle key={`meal-dot-${i}`} cx={getX(i)} cy={getY(p)} r="2.5" fill="#10b981" stroke="white" strokeWidth="1" />
                ))}
            </svg>
            <div className="flex justify-center gap-4 text-xs mt-2">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div><span className="font-sans">Bills</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div><span className="font-sans">Meals</span></div>
            </div>
        </div>
    );
};

const PaymentConsistencyChart: React.FC<{data: any[]}> = ({ data }) => (
    <div className="w-full space-y-3 text-sm">
        {data.map(p => (
            <div key={p.name} className="flex items-center gap-3">
                <span className="w-12 font-medium">{p.name}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4"><div className="bg-primary h-4 rounded-full" style={{width: `${p.percent}%`}}></div></div>
                <span className="w-10 text-right font-semibold">{p.percent}%</span>
            </div>
        ))}
    </div>
);

const ShoppingContributionChart: React.FC<{data: any}> = ({ data }) => (
     <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6">
        <div className="relative w-36 h-36">
             <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#3b82f6 0% ${data.data.raj}%, #10b981 ${data.data.raj}% ${data.data.raj + data.data.amit}%, #f59e0b ${data.data.raj + data.data.amit}% ${data.data.raj + data.data.amit + data.data.priya}%, #ef4444 ${data.data.raj + data.data.amit + data.data.priya}% 100%)` }}></div>
        </div>
        <div className="space-y-2 text-sm text-center md:text-left">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><div>Raj: {data.data.raj}% ({data.amounts.raj})</div></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><div>Amit: {data.data.amit}% ({data.amounts.amit})</div></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><div>Priya: {data.data.priya}% ({data.amounts.priya})</div></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><div>Ravi: {data.data.ravi}% ({data.amounts.ravi})</div></div>
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

    const currentReportData = mockReportsData[activeDateRange] || mockReportsData['This Month'];
    
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Top Bar */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
                <div className="flex items-center flex-wrap gap-2">
                    {['This Month', 'Last 30 Days', 'Custom Range'].map(range => (
                        <button key={range} onClick={() => range !== 'Custom Range' && setActiveDateRange(range)} className={`px-4 py-2 text-sm font-semibold rounded-md shadow-sm transition-colors ${activeDateRange === range ? 'bg-primary text-white' : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'} ${range === 'Custom Range' ? 'opacity-50 cursor-not-allowed' : ''}`}>{range}</button>
                    ))}
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"><ExportIcon className="w-4 h-4"/>Export PDF</button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"><ExportIcon className="w-4 h-4"/>Export CSV</button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard icon={<CurrencyRupeeIcon className="w-6 h-6 text-primary"/>} title="Total Expenses" value={currentReportData.summaryData.totalExpenses} subtitle={activeDateRange} />
                <SummaryCard icon={<MealIcon className="w-6 h-6 text-primary"/>} title="Avg Meal Cost" value={currentReportData.summaryData.avgMealCost} subtitle="Per Meal" />
                <SummaryCard icon={<UsersIcon className="w-6 h-6 text-primary"/>} title="Total Members" value={currentReportData.summaryData.totalMembers} subtitle="Contributing" />
                <SummaryCard icon={<BanknotesIcon className="w-6 h-6 text-primary"/>} title="Fund Health" value={currentReportData.summaryData.fundHealthStatus} subtitle={currentReportData.summaryData.fundHealthAmount} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Expense Distribution" footer="Click segments for breakdown">
                    <ExpenseBreakdownChart data={currentReportData.expenseDistributionData}/>
                </ChartContainer>
                <ChartContainer title="6-Month Expense Trend">
                    <MonthlyTrendChart data={currentReportData.monthlyTrend}/>
                </ChartContainer>
                <ChartContainer title="Member Payment Reliability" footer="Based on on-time payments">
                    <PaymentConsistencyChart data={currentReportData.paymentConsistency}/>
                </ChartContainer>
                <ChartContainer title="Shopping Contribution">
                    <ShoppingContributionChart data={currentReportData.shoppingContribution}/>
                </ChartContainer>
            </div>
        </div>
    );
};

export default ReportsAnalyticsPage;