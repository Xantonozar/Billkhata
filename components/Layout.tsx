import React, { useState, Fragment } from 'react';
import { useAuth, type Page } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import ThemeToggle from './ThemeToggle';
import { 
    UserCircleIcon, LogoutIcon, DashboardIcon, BillsIcon, MenuIcon, XIcon,
    MealIcon, ShoppingCartIcon, UsersIcon, ChartBarIcon, CogIcon,
    SparklesIcon, ChevronDownIcon, HomeIcon, ElectricityIcon, WaterIcon, GasIcon, WifiIcon, MaidIcon, OtherIcon, ListBulletIcon, CreditCardIcon, ClipboardCheckIcon, ArchiveBoxIcon, BellIcon
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
                    ? 'bg-primary-100 text-primary dark:bg-primary-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
        >
            {React.cloneElement(icon, { className: `flex-shrink-0 w-6 h-6 mr-3 transition-colors ${isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-primary-light'}` })}
            <span className="flex-grow font-semibold">{children}</span>
            {badgeCount && badgeCount > 0 && (
                 <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${isActive ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
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
                        ? 'bg-primary-100 text-primary dark:bg-primary-500/20'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
            >
                <BillsIcon className={`flex-shrink-0 w-6 h-6 mr-3 transition-colors ${isBillsActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-primary-light'}`} />
                <span className="flex-grow font-semibold">Bills</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
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
            )}
        </div>
    )
}

const SidebarContent: React.FC = () => {
    const { user, logout } = useAuth();
    // Mock count for pending tasks
    const pendingTasksCount = 5;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
                 <SparklesIcon className="w-8 h-8 text-primary" />
                 <span className="ml-2 font-bold text-2xl text-gray-800 dark:text-white font-sans">BillKhata</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                <NavLink page="dashboard" icon={<DashboardIcon />}>Dashboard</NavLink>
                {user?.role === Role.Manager && (
                  <NavLink page="pending-approvals" icon={<ClipboardCheckIcon />} badgeCount={pendingTasksCount}>Pending Approvals</NavLink>
                )}
                <BillsNavGroup />
                <NavLink page="meals" icon={<MealIcon />}>Meal Management</NavLink>
                <NavLink page="shopping" icon={<ShoppingCartIcon />}>Shopping</NavLink>
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
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                            <UserCircleIcon className="w-10 h-10 text-gray-500" />
                            <div className="flex-grow">
                                <p className="font-semibold text-sm text-gray-800 dark:text-white">{user.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.role} &bull; Room 3B</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95"
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
        <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 flex z-40 md:hidden" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
                    <div className="relative flex-1 flex flex-col max-w-xs w-full">
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
                    <div className="flex flex-col h-0 flex-1 border-r border-gray-200 dark:border-gray-700">
                       <SidebarContent />
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <div className="relative z-30 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow-sm">
                    <button
                        type="button"
                        className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <MenuIcon className="h-6 w-6" />
                    </button>
                    <div className="flex-1 px-4 flex justify-between items-center">
                         <div className="flex items-center md:hidden">
                            <SparklesIcon className="w-8 h-8 text-primary" />
                            <span className="ml-2 font-bold text-xl text-gray-800 dark:text-white font-sans">BillKhata</span>
                        </div>
                        <div className="hidden md:block"></div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setNotificationsOpen(true)} className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95">
                                <span className="sr-only">View notifications</span>
                                <BellIcon className="h-6 w-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-white dark:ring-gray-800"></span>
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