import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { 
    CogIcon, UserCircleIcon, PhoneIcon, BellIcon, UsersIcon,
    PencilIcon, TrashIcon, ClipboardIcon, RefreshIcon
} from '../components/Icons';
import { useNotifications } from '../contexts/NotificationContext';

type MemberTab = 'Profile' | 'Contacts' | 'Notifications';
type ManagerTab = 'Profile' | 'Contacts' | 'Notifications' | 'Room Management' | 'Member Management';

const TabButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors group ${
            isActive
                ? 'bg-primary-50 text-primary dark:bg-primary-500/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
    >
        {icon}
        <span className="flex-grow">{label}</span>
    </button>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <div className="border-t my-4 border-gray-200 dark:border-gray-700"></div>
    </div>
);

const FormRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
     <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {children}
    </div>
);

const TextInput: React.FC<{ value: string; placeholder?: string }> = ({ value, placeholder }) => (
    <input 
        type="text" 
        defaultValue={value}
        placeholder={placeholder}
        className="block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm bg-white dark:bg-gray-700"
    />
);

const Checkbox: React.FC<{ label: string; checked: boolean }> = ({ label, checked }) => (
    <label className="flex items-center space-x-3">
        <input type="checkbox" defaultChecked={checked} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
    </label>
);

const RadioButton: React.FC<{ label: string; name: string; checked?: boolean }> = ({ label, name, checked }) => (
     <label className="flex items-center space-x-2">
        <input type="radio" name={name} defaultChecked={checked} className="h-4 w-4 text-primary focus:ring-primary border-gray-300" />
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
    </label>
);

// --- TAB CONTENT COMPONENTS ---

const ProfileTabContent: React.FC = () => {
    const { addToast } = useNotifications();
    const handleSave = () => addToast({ type: 'success', title: 'Profile Saved', message: 'Your profile information has been updated.' });
    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete your account? This action is irreversible.')) {
            addToast({ type: 'error', title: 'Account Deleted', message: 'Your account has been permanently deleted.' });
            // Here you would call logout and redirect
        }
    };
    return (
        <div className="space-y-6">
            <SectionHeader title="Profile Settings" />
            <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-16 h-16 text-gray-400" />
                </div>
                <button className="px-4 py-2 text-sm font-semibold bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500">📷 Change Photo</button>
            </div>
            <FormRow label="Full Name (Bangla/English):">
                <TextInput value="রাজ কুমার / Raj Kumar" />
            </FormRow>
            <FormRow label="Email:">
                <TextInput value="raj.kumar@gmail.com" />
            </FormRow>
            <FormRow label="Room Info:">
                <TextInput value="Corner room, attached bathroom" />
            </FormRow>
            <button onClick={handleSave} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600">Save Changes</button>
            
            <div className="border-t pt-6 mt-6 border-red-500/30">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This action is permanent and cannot be undone.</p>
                <button onClick={handleDelete} className="mt-3 px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-500/20 rounded-md hover:bg-red-200 dark:hover:bg-red-500/30">Delete My Account</button>
            </div>
        </div>
    );
}

const ContactsTabContent: React.FC = () => {
    const { addToast } = useNotifications();
    const handleSave = () => addToast({ type: 'success', title: 'Contacts Saved', message: 'Your contact information has been updated.' });
    return (
        <div className="space-y-6">
            <SectionHeader title="Contact Information" />
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">Other members can see this info.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormRow label="Phone Number:"><TextInput value="+880 1712345678" /></FormRow>
                <FormRow label="WhatsApp Number:">
                    <div className="space-y-2">
                        <RadioButton name="whatsapp" label="Same as phone" checked />
                        <RadioButton name="whatsapp" label="Different: +880 [________]" />
                    </div>
                </FormRow>
                <FormRow label="Facebook Profile:"><TextInput value="facebook.com/rajkumar" /></FormRow>
                <FormRow label="Bkash Number (for payments):"><TextInput value="+880 1712345678" /></FormRow>
                <FormRow label="Nagad Number:"><TextInput value="+880 1712345678" /></FormRow>
                <FormRow label="Emergency Contact:">
                    <div className="space-y-2">
                        <TextInput value="Father's name" placeholder="Name" />
                        <TextInput value="+880 1711111111" placeholder="Phone" />
                    </div>
                </FormRow>
            </div>
            <button onClick={handleSave} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600">Save Contact Info</button>
        </div>
    );
}

const NotificationsTabContent: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useNotifications();
    const isManager = user?.role === Role.Manager;
    const handleSave = () => addToast({ type: 'success', title: 'Preferences Saved', message: 'Your notification settings have been updated.' });

    return (
        <div className="space-y-8">
            <SectionHeader title="Notification Settings" />
            <div>
                <h3 className="font-semibold mb-2">Notification Channels:</h3>
                <div className="space-y-2"><Checkbox label="Email Notifications" checked /><Checkbox label="In-App Notifications" checked /><Checkbox label="SMS Notifications (Coming Soon)" checked={false} /></div>
            </div>
            <div>
                <h3 className="font-semibold mb-2">Notify me about:</h3>
                <div className="space-y-4">
                    <div><h4 className="font-medium text-gray-800 dark:text-gray-200">Bills & Payments:</h4><div className="pl-4 space-y-2 mt-1"><Checkbox label="New bills assigned to me" checked /><Checkbox label="Payment reminders (3 days before)" checked /><Checkbox label="Payment approval updates" checked /><Checkbox label="Overdue bill alerts" checked /></div></div>
                    <div><h4 className="font-medium text-gray-800 dark:text-gray-200">Meals & Shopping:</h4><div className="pl-4 space-y-2 mt-1"><Checkbox label="Daily meal logging reminders" checked /><Checkbox label="Shopping duty reminders" checked /><Checkbox label="Shopping approval updates" checked /><Checkbox label="Meal rate changes" checked /></div></div>
                    <div><h4 className="font-medium text-gray-800 dark:text-gray-200">Deposits & Refunds:</h4><div className="pl-4 space-y-2 mt-1"><Checkbox label="Deposit approval updates" checked /><Checkbox label="Monthly refund calculations" checked /></div></div>
                    <div><h4 className="font-medium text-gray-800 dark:text-gray-200">Room Updates:</h4><div className="pl-4 space-y-2 mt-1"><Checkbox label="New member joins" checked /><Checkbox label="Member leaves" checked /><Checkbox label="Room announcements" checked={false} /></div></div>
                     {isManager && (
                        <div><h4 className="font-medium text-gray-800 dark:text-gray-200">Manager-Specific:</h4><div className="pl-4 space-y-2 mt-1"><Checkbox label="Manager approval requests" checked /></div></div>
                    )}
                </div>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
                 <button onClick={handleSave} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600">Save Preferences</button>
            </div>
        </div>
    );
};


const RoomManagementTabContent: React.FC = () => {
    const { addToast } = useNotifications();
    const handleSave = () => addToast({ type: 'success', title: 'Settings Saved', message: 'Room management settings have been updated.' });
    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this room? This will erase all data for all members and cannot be undone.')) {
            addToast({ type: 'error', title: 'Room Deleted', message: 'The room and all its data have been permanently deleted.' });
        }
    };
    return (
        <div className="space-y-6">
            <SectionHeader title="Room Management" />
            <FormRow label="Room Name:"><TextInput value="Flat 3B, Dhanmondi" /></FormRow>
            <FormRow label="Full Address:"><TextInput value="Road 5, House 12, Dhanmondi, Dhaka - 1205" /></FormRow>
            <FormRow label="Room Code:">
                <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
                    <span className="font-mono text-xl tracking-widest">AB1234</span>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-1 text-sm font-semibold"><ClipboardIcon className="w-4 h-4" />Copy Code</button>
                        <button className="flex items-center gap-1 text-sm font-semibold"><RefreshIcon className="w-4 h-4" />Generate New</button>
                    </div>
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">⚠️ Old code will stop working</p>
            </FormRow>

            <SectionHeader title="Default Settings" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormRow label="Currency:"><div className="flex gap-4"><RadioButton name="currency" label="BDT (৳)" checked /><RadioButton name="currency" label="USD ($)" /></div></FormRow>
                <FormRow label="Default Meal Quantity:"><TextInput value="2" /></FormRow>
                <FormRow label="Meal Rate Calculation:">
                    <div className="space-y-2">
                        <RadioButton name="mealRate" label="Auto (Total Shopping ÷ Meals)" checked />
                        <RadioButton name="mealRate" label="Fixed Rate: ৳ [____]" />
                    </div>
                </FormRow>
                <FormRow label="Bill Due Date Reminder:"><TextInput value="3" /></FormRow>
                <FormRow label="Auto-Push Rent Bills:">
                    <div className="space-y-2">
                        <Checkbox label="Enabled (creates next month)" checked />
                        <TextInput value="25th" />
                    </div>
                </FormRow>
            </div>
            <button onClick={handleSave} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600">Save Settings</button>
            
            <div className="border-t pt-6 mt-6 border-red-500/30">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This will permanently delete all room data, including bills, meals, and member information.</p>
                <button onClick={handleDelete} className="mt-3 px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-500/20 rounded-md hover:bg-red-200 dark:hover:bg-red-500/30">Delete Room & All Data</button>
            </div>
        </div>
    );
};

const MemberManagementTabContent: React.FC = () => {
    const { setPage } = useAuth();
    return (
        <div className="space-y-6">
            <SectionHeader title="Member Management" />
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">This section provides quick links to manage your room members.</p>
                <div className="mt-4 space-y-2">
                    <button onClick={() => setPage('members')} className="font-semibold text-primary hover:underline">View All Members →</button>
                    <button onClick={() => setPage('pending-approvals')} className="block font-semibold text-primary hover:underline">Manage Join Requests →</button>
                </div>
            </div>
        </div>
    );
}

// --- MAIN PAGE COMPONENT ---

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const isManager = user?.role === Role.Manager;

  const memberTabs: { id: MemberTab; icon: React.ReactNode; label: string }[] = [
    { id: 'Profile', icon: <UserCircleIcon className="w-6 h-6 mr-3" />, label: 'Profile' },
    { id: 'Contacts', icon: <PhoneIcon className="w-6 h-6 mr-3" />, label: 'Contacts' },
    { id: 'Notifications', icon: <BellIcon className="w-6 h-6 mr-3" />, label: 'Notifications' },
  ];

  const managerTabs: { id: ManagerTab; icon: React.ReactNode; label: string }[] = [
    ...memberTabs,
    { id: 'Room Management', icon: <CogIcon className="w-6 h-6 mr-3" />, label: 'Room Management' },
    { id: 'Member Management', icon: <UsersIcon className="w-6 h-6 mr-3" />, label: 'Member Management' },
  ];

  const TABS = isManager ? managerTabs : memberTabs;
  const [activeTab, setActiveTab] = useState<MemberTab | ManagerTab>('Profile');

  const renderContent = () => {
    switch (activeTab) {
        case 'Profile': return <ProfileTabContent />;
        case 'Contacts': return <ContactsTabContent />;
        case 'Notifications': return <NotificationsTabContent />;
        case 'Room Management': return isManager ? <RoomManagementTabContent /> : null;
        case 'Member Management': return isManager ? <MemberManagementTabContent /> : null;
        default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
            <CogIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-1/4 lg:w-1/5">
                <nav className="space-y-1">
                    {TABS.map(tab => (
                        <TabButton 
                            key={tab.id}
                            label={tab.label}
                            icon={tab.icon}
                            isActive={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                        />
                    ))}
                </nav>
            </aside>
            <main key={activeTab} className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md animate-fade-in">
                {renderContent()}
            </main>
        </div>
    </div>
  );
};

export default SettingsPage;