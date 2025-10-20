import React, { useState, Fragment } from 'react';
import { useAuth, type Page } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import ThemeToggle from './ThemeToggle';
import { 
    UserCircleIcon, LogoutIcon, DashboardIcon, BillsIcon, MenuIcon, XIcon,
    MealIcon, ShoppingCartIcon, UsersIcon, ChartBarIcon, CogIcon,
    SparklesIcon, ChevronDownIcon, HomeIcon, ElectricityIcon, WaterIcon, GasIcon, WifiIcon, MaidIcon, OtherIcon, ListBulletIcon, CreditCardIcon, ClipboardCheckIcon, ArchiveBoxIcon, BellIcon, CalendarIcon,
    MenuBookIcon
} from './Icons';
import { Role } from '../types';
import NotificationsPanel from './NotificationsPanel';

interface NavLinkProps {
  page: Page;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
  isSublink?: boolean;
  badgeCount?: number;
}

const NavLink: React.FC<NavLinkProps> = ({ page: href, icon, children, isSublink = false, badgeCount }) => {
    const { page, setPage } = useAuth();
    const isActive = page === href;

    return (
        <button
            onClick={() => setPage(href)}
            className={`w-full flex items-center text-left ${isSublink ? 'pl-12 pr-3 py-2' : 'px-3 py-2.5'} rounded-md text-sm font-medium transition-all group duration-200 active:scale-[0.98] ${
                isActive
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
        >
            {React.cloneElement(icon, { className: `flex-shrink-0 w-6 h-6 mr-3 transition-colors ${isActive ? 'text-primary-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-400'}` })}
            <span className="flex-grow font-semibold">{children}</span>
            {badgeCount && badgeCount > 0 && (
                 <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${isActive ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>
                    {badgeCount}
                </span>
            )}
        </button>
    );
};

const BillsNavGroup: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { page, setPage } = useAuth();
    const isBillsActive = page.startsWith('bills');

    return (
        <div>
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!page.startsWith('bills-')) {
                        setPage('bills');
                    }
                }}
                className={`w-full flex items-center text-left px-3 py-2.5 rounded-md text-sm font-medium transition-all group duration-200 active:scale-[0.98] ${
                    isBillsActive
                        ? 'bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
            >
                <BillsIcon className={`flex-shrink-0 w-6 h-6 mr-3 transition-colors ${isBillsActive ? 'text-primary-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-400'}`} />
                <span className="flex-grow font-semibold">Bills</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-max-height duration-500 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className="mt-1 space-y-1">
                    <NavLink page="bills" icon={<DashboardIcon />} isSublink>Overview</NavLink>
                    <NavLink page="bills-all" icon={<ListBulletIcon />} isSublink>All Bills</NavLink>
                    <NavLink page="bills-rent" icon={<HomeIcon />} isSublink>Rent Bills</NavLink>
                    <NavLink page="bills-electricity" icon={<ElectricityIcon />} isSublink>Electricity</NavLink>
                    <NavLink page="bills-water" icon={<WaterIcon />} isSublink>Water</NavLink>
                    <NavLink page="bills-gas" icon={<GasIcon />} isSublink>Gas</NavLink>
                    <NavLink page="bills-wifi" icon={<WifiIcon />} isSublink>Wi-Fi</NavLink>
                    <NavLink page="bills-maid" icon={<MaidIcon />} isSublink>Maid</NavLink>
                    <NavLink page="bills-others" icon={<OtherIcon />} isSublink>Others</NavLink>
                </div>
            </div>
        </div>
    )
}

const SidebarContent: React.FC = () => {
    const { user, logout } = useAuth();
    // Mock count for pending tasks
    const pendingTasksCount = 5;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-800/50 backdrop-blur-sm">
            <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-700">
                 <SparklesIcon className="w-8 h-8 text-primary-500" />
                 <span className="ml-2 font-bold text-2xl text-slate-800 dark:text-white font-sans">BillKhata</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                <NavLink page="dashboard" icon={<DashboardIcon />}>Dashboard</NavLink>
                {user?.role === Role.Manager && (
                  <NavLink page="pending-approvals" icon={<ClipboardCheckIcon />} badgeCount={pendingTasksCount}>Pending Approvals</NavLink>
                )}
                <BillsNavGroup />
                <NavLink page="meals" icon={<MealIcon />}>Meal Management</NavLink>
                <NavLink page="shopping" icon={<ShoppingCartIcon />}>Shopping</NavLink>
                <NavLink page="calendar" icon={<CalendarIcon />}>Calendar</NavLink>
                <NavLink page="menu" icon={<MenuBookIcon />}>Menu</NavLink>
                <NavLink page="members" icon={<UsersIcon />}>Room Members</NavLink>
                <NavLink page="history" icon={<ArchiveBoxIcon />}>History</NavLink>
                {user?.role === Role.Manager && (
                  <>
                    <NavLink page="payment-dashboard" icon={<CreditCardIcon />}>Payment Dashboard</NavLink>
                    <NavLink page="reports-analytics" icon={<ChartBarIcon />}>Reports & Analytics</NavLink>
                  </>
                )}
                <NavLink page="settings" icon={<CogIcon />}>Settings</NavLink>
            </nav>
            {user && (
                <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-3 transition-transform duration-200 hover:scale-105">
                            <UserCircleIcon className="w-10 h-10 text-slate-500" />
                            <div className="flex-grow">
                                <p className="font-semibold text-sm text-slate-800 dark:text-white">{user.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{user.role} &bull; Room 3B</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 duration-200"
                            aria-label="Logout"
                        >
                            <LogoutIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="mt-3">
                        <ThemeToggle />
                    </div>
                </div>
            )}
        </div>
    );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const { unreadCount } = useNotifications();

    return (
        <div className="h-screen flex overflow-hidden bg-slate-100 dark:bg-slate-900">
            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 flex z-40 md:hidden" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-slate-600 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
                    <div className="relative flex-1 flex flex-col max-w-xs w-full animate-slide-in-right">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                type="button"
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span className="sr-only">Close sidebar</span>
                                <XIcon className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <SidebarContent />
                    </div>
                    <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="flex flex-col h-0 flex-1 border-r border-slate-200 dark:border-slate-700">
                       <SidebarContent />
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <div className="relative z-30 flex-shrink-0 flex h-16 bg-white dark:bg-slate-800 shadow-sm">
                    <button
                        type="button"
                        className="px-4 border-r border-slate-200 dark:border-slate-700 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <MenuIcon className="h-6 w-6" />
                    </button>
                    <div className="flex-1 px-4 flex justify-between items-center">
                         <div className="flex items-center md:hidden">
                            <SparklesIcon className="w-8 h-8 text-primary-500" />
                            <span className="ml-2 font-bold text-xl text-slate-800 dark:text-white font-sans">BillKhata</span>
                        </div>
                        <div className="hidden md:block"></div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setNotificationsOpen(true)} className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95">
                                <span className="sr-only">View notifications</span>
                                <BellIcon className="h-6 w-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-danger-500 ring-2 ring-white dark:ring-slate-800"></span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
            <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
        </div>
    );
};

export default Layout;