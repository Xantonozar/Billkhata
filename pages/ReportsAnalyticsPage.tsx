import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { ChartBarIcon, ExportIcon, CurrencyRupeeIcon, MealIcon, UsersIcon, BanknotesIcon, TrendingUpIcon } from '../components/Icons';
import { api } from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

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

const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="text-gray-400 text-sm">No data available</div>;
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="relative w-36 h-36">
                <div className="absolute inset-0 rounded-full" style={{
                    background: `conic-gradient(${data.map((item, i) => {
                        const start = data.slice(0, i).reduce((sum, x) => sum + x.value, 0) / total * 100;
                        const end = (data.slice(0, i + 1).reduce((sum, x) => sum + x.value, 0)) / total * 100;
                        return `${item.color} ${start}% ${end}%`;
                    }).join(', ')})`
                }}></div>
                <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex flex-col items-center justify-center">
                    <span className="text-xs text-gray-400">Total</span>
                    <span className="text-sm font-bold">৳{total.toFixed(0)}</span>
                </div>
            </div>
            <div className="space-y-2 text-sm text-center md:text-left">
                {data.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <div>{item.label}: {((item.value / total) * 100).toFixed(1)}%</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LineChart: React.FC<{ data: { label: string; values: { name: string; value: number; color: string }[] }[] }> = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="text-gray-400 text-sm">No data available</div>;
    }

    const allValues = data.flatMap(d => d.values.map(v => v.value));
    const maxValue = Math.max(...allValues, 100);

    const width = 100;
    const height = 60;
    const chartHeight = 50;
    const chartBottom = height - 5;

    const getY = (value: number) => chartBottom - ((value / maxValue) * chartHeight);
    const getX = (index: number, total: number) => (index / (total - 1)) * width;

    const createPath = (values: number[]) => {
        if (values.length === 0) return '';
        let path = `M ${getX(0, values.length)} ${getY(values[0])}`;
        for (let i = 1; i < values.length; i++) {
            const prevX = getX(i - 1, values.length);
            const currX = getX(i, values.length);
            const prevY = getY(values[i - 1]);
            const currY = getY(values[i]);
            const cpX = (prevX + currX) / 2;
            path += ` Q ${cpX} ${prevY}, ${cpX} ${(prevY + currY) / 2} Q ${cpX} ${currY}, ${currX} ${currY}`;
        }
        return path;
    };

    const series = data[0]?.values || [];

    return (
        <div className="w-full space-y-4">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
                {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                    const y = chartBottom - (ratio * chartHeight);
                    return <line key={ratio} x1="0" y1={y} x2={width} y2={y} stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="0.3" />;
                })}

                {series.map((serie, seriesIdx) => {
                    const values = data.map(d => d.values[seriesIdx]?.value || 0);
                    const path = createPath(values);
                    return (
                        <g key={seriesIdx}>
                            <path d={path} fill="none" stroke={serie.color} strokeWidth="2" strokeLinecap="round" />
                            {values.map((val, i) => (
                                <circle key={i} cx={getX(i, values.length)} cy={getY(val)} r="2" fill={serie.color} />
                            ))}
                        </g>
                    );
                })}

                {data.map((d, i) => (
                    <text key={i} x={getX(i, data.length)} y={height - 1} textAnchor="middle" className="text-[3px] fill-gray-500 dark:fill-gray-400">{d.label}</text>
                ))}
            </svg>

            <div className="flex flex-wrap justify-center gap-4 text-xs">
                {series.map((serie, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div className="w-3 h-0.5 rounded" style={{ backgroundColor: serie.color }}></div>
                        <span className="text-gray-600 dark:text-gray-400">{serie.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ReportsAnalyticsPage: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useNotifications();
    const [activeDateRange, setActiveDateRange] = useState('This Month');
    const [loading, setLoading] = useState(true);

    const [expenses, setExpenses] = useState<any[]>([]);
    const [bills, setBills] = useState<any[]>([]);
    const [meals, setMeals] = useState<any[]>([]);
    const [deposits, setDeposits] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.khataId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const [expensesData, billsData, mealsData, depositsData, membersData] = await Promise.all([
                    api.getExpenses(user.khataId),
                    api.getBillsForRoom(user.khataId),
                    api.getMeals(user.khataId),
                    api.getDeposits(user.khataId),
                    api.getMembersForRoom(user.khataId)
                ]);

                setExpenses(expensesData || []);
                setBills(billsData || []);
                setMeals(mealsData || []);
                setDeposits(depositsData || []);
                setMembers(membersData || []);
            } catch (error) {
                console.error('Error fetching report data:', error);
                addToast({ type: 'error', title: 'Error', message: 'Failed to load report data' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.khataId]);

    const reportData = useMemo(() => {
        const now = new Date();
        let startDate = new Date();

        if (activeDateRange === 'This Month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (activeDateRange === 'Last 30 Days') {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const filteredExpenses = expenses.filter(e => e.createdAt && new Date(e.createdAt) >= startDate && e.status === 'Approved');
        const filteredBills = bills.filter(b => b.dueDate && new Date(b.dueDate) >= startDate);
        const filteredDeposits = deposits.filter(d => d.createdAt && new Date(d.createdAt) >= startDate && d.status === 'Approved');
        const filteredMeals = meals.filter(m => m.date && new Date(m.date) >= startDate);

        const totalBillAmount = filteredBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const totalMealExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalExpenses = totalBillAmount + totalMealExpenses;
        const totalMealsCount = filteredMeals.reduce((sum, m) => sum + (m.totalMeals || 0), 0);
        const avgMealCost = totalMealsCount > 0 ? totalMealExpenses / totalMealsCount : 0;
        const totalDeposits = filteredDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);
        const fundHealth = totalDeposits - totalExpenses;

        const billCategories: { [key: string]: number } = {};
        filteredBills.forEach(b => {
            const category = b.category || 'Other';
            billCategories[category] = (billCategories[category] || 0) + (b.totalAmount || 0);
        });
        const billCategoryData = Object.entries(billCategories).map(([label, value], index) => ({
            label,
            value,
            color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'][index % 6]
        }));

        // Generate trend data for last 6 months
        const trendData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const month = d.getMonth();
            const year = d.getFullYear();
            const label = d.toLocaleDateString('en-US', { month: 'short' });

            const monthExpenses = expenses.filter(e => {
                if (!e.createdAt) return false;
                const date = new Date(e.createdAt);
                return date.getMonth() === month && date.getFullYear() === year && e.status === 'Approved';
            }).reduce((sum, e) => sum + (e.amount || 0), 0);

            const monthDeposits = deposits.filter(d => {
                if (!d.createdAt) return false;
                const date = new Date(d.createdAt);
                return date.getMonth() === month && date.getFullYear() === year && d.status === 'Approved';
            }).reduce((sum, d) => sum + (d.amount || 0), 0);

            const monthBills = bills.filter(b => {
                if (!b.dueDate) return false;
                const date = new Date(b.dueDate);
                return date.getMonth() === month && date.getFullYear() === year;
            }).reduce((sum, b) => sum + (b.totalAmount || 0), 0);

            trendData.push({
                label,
                values: [
                    { name: 'Deposits', value: monthDeposits, color: '#10b981' },
                    { name: 'Expenses', value: monthExpenses, color: '#ef4444' },
                    { name: 'Bills', value: monthBills, color: '#3b82f6' }
                ]
            });
        }

        return {
            totalExpenses,
            avgMealCost,
            totalDeposits,
            fundHealth,
            billCategoryData,
            trendData
        };
    }, [expenses, bills, meals, deposits, activeDateRange]);

    if (user?.role !== Role.Manager) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-semibold">Access Denied</h2>
                <p className="text-gray-500">This page is only available for managers.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
                <div className="flex items-center flex-wrap gap-2">
                    {['This Month', 'Last 30 Days'].map(range => (
                        <button
                            key={range}
                            onClick={() => setActiveDateRange(range)}
                            className={`px-4 py-2 text-sm font-semibold rounded-md shadow-sm transition-colors ${activeDateRange === range
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                        <ExportIcon className="w-4 h-4" />Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    icon={<CurrencyRupeeIcon className="w-6 h-6 text-primary" />}
                    title="Total Expenses"
                    value={`৳${reportData.totalExpenses.toLocaleString()}`}
                    subtitle={activeDateRange}
                />
                <SummaryCard
                    icon={<MealIcon className="w-6 h-6 text-primary" />}
                    title="Avg Meal Cost"
                    value={`৳${reportData.avgMealCost.toFixed(2)}`}
                    subtitle="Per Meal"
                />
                <SummaryCard
                    icon={<BanknotesIcon className="w-6 h-6 text-primary" />}
                    title="Total Deposits"
                    value={`৳${reportData.totalDeposits.toLocaleString()}`}
                    subtitle="Collected"
                />
                <SummaryCard
                    icon={<TrendingUpIcon className="w-6 h-6 text-primary" />}
                    title="Fund Health"
                    value={`৳${reportData.fundHealth.toLocaleString()}`}
                    subtitle={reportData.fundHealth >= 0 ? 'Surplus' : 'Deficit'}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Bill Category Breakdown" footer="Distribution by category">
                    <DonutChart data={reportData.billCategoryData} />
                </ChartContainer>
                <ChartContainer title="6-Month Financial Trend" footer="Deposits, Expenses & Bills over time">
                    <LineChart data={reportData.trendData} />
                </ChartContainer>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <ChartContainer title="Financial Summary">
                    <div className="w-full space-y-4 text-sm">
                        <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <span>Total Bills:</span>
                            <span className="font-semibold">{bills.length}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <span>Total Meals:</span>
                            <span className="font-semibold">{meals.length}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <span>Active Members:</span>
                            <span className="font-semibold">{members.length}</span>
                        </div>
                    </div>
                </ChartContainer>
            </div>
        </div>
    );
};

export default ReportsAnalyticsPage;