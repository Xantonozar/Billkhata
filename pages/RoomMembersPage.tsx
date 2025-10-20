import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { 
    UsersIcon, ArrowLeftIcon, UserCircleIcon, PhoneIcon, WhatsAppIcon, FacebookIcon, 
    CrownIcon, PlusIcon, ClipboardIcon, RefreshIcon, XIcon, CheckCircleIcon 
} from '../components/Icons';

// --- MOCK DATA ---
const mockMembers = [
    { 
        id: '1', name: 'Alice Manager', role: Role.Manager, phone: '+8801700000000', whatsapp: '+8801700000000', facebook: 'Not added', 
        joined: 'Sept 1, 2025', room: 'Admin', 
        thisMonth: { billsDue: 'N/A', meals: 0, status: 'N/A' },
        paymentPunctuality: 100,
        shoppingContributions: { count: 0, total: 0 }
    },
    { 
        id: '9', name: 'Amit Hossain', role: Role.Member, phone: '+8801812987654', whatsapp: '+8801812987654', facebook: 'Not added', 
        joined: 'Sept 1, 2025', room: 'Front room',
        thisMonth: { billsDue: '₹1,200', meals: 25, status: '✅ All paid' },
        paymentPunctuality: 100,
        shoppingContributions: { count: 5, total: 2450 }
    },
    { 
        id: '3', name: 'Priya Das', role: Role.Member, phone: '+8801912111222', whatsapp: '+8801912111222', facebook: 'fb.com/priyadas', 
        joined: 'Sept 5, 2025', room: 'Middle room',
        thisMonth: { billsDue: '₹587.50', meals: 30, status: '⏳ 1 Pending' },
        paymentPunctuality: 75,
        shoppingContributions: { count: 3, total: 1500 }
    },
    { 
        id: '4', name: 'Ravi Islam', role: Role.Member, phone: '+8801612333444', whatsapp: 'Not available', facebook: 'Not added', 
        joined: 'Sept 10, 2025', room: 'Side room',
        thisMonth: { billsDue: '₹0', meals: 22, status: '✅ All paid' },
        paymentPunctuality: 100,
        shoppingContributions: { count: 2, total: 900 }
    },
];

const mockJoinRequests = [
    { id: 'jr1', name: 'Neha Rahman', email: 'neha.r@email.com', phone: '+880 1912-555444', requested: '3 hours ago' }
];

// --- Sub-components ---

const PunctualityBar: React.FC<{ percent: number }> = ({ percent }) => {
    const getColor = () => {
        if (percent >= 90) return { bar: 'bg-green-500', text: 'text-green-600 dark:text-green-400', label: 'Always pays on time ✅' };
        if (percent >= 70) return { bar: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', label: 'Usually on time' };
        return { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400', label: 'Often late' };
    };
    const { bar, text, label } = getColor();

    return (
        <div>
            <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className={`${bar} h-2.5 rounded-full`} style={{ width: `${percent}%` }}></div>
                </div>
                <span className={`w-10 text-right font-semibold text-sm ${text}`}>{percent}%</span>
            </div>
            <p className={`text-xs mt-1 ${text}`}>{label}</p>
        </div>
    );
};

const MemberHistoryModal: React.FC<{ member: typeof mockMembers[0] | null, onClose: () => void }> = ({ member, onClose }) => {
    if (!member) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 p-4 border-b dark:border-gray-700">
                    <div className="flex justify-between items-center">
                         <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            <button onClick={onClose} className="mr-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ArrowLeftIcon className="w-5 h-5"/></button>
                            {member.name}'s History
                        </h3>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="w-5 h-5"/></button>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    {/* This Month */}
                    <div className="p-4 border rounded-lg dark:border-gray-700">
                        <h4 className="font-bold text-lg mb-2">This Month (October 2025)</h4>
                        <div className="space-y-2 text-sm">
                            <div><strong>Bills:</strong><p className="pl-2">- Rent: ৳5,500 ✅ Paid<br/>- Electricity: ৳300 ✅ Paid<br/>- Water: ৳200 ✅ Paid<br/>- <span className="font-semibold">Total: ৳6,000 (100% paid)</span></p></div>
                            <div><strong>Meals:</strong><p className="pl-2">- Total: 25 quantities<br/>- Cost: ৳1,137.50</p></div>
                            <div><strong>Deposits:</strong><p className="pl-2">- Oct 1: ৳1,500 ✅<br/>- Oct 15: ৳1,500 ⏳ Pending</p></div>
                            <p className="font-semibold text-green-600 dark:text-green-400">Refund: +৳862.50</p>
                        </div>
                    </div>
                    {/* Last Month */}
                    <div className="p-4 border rounded-lg dark:border-gray-700">
                         <h4 className="font-bold text-lg mb-2">Last Month (September 2025)</h4>
                        <p className="text-sm">Bills: ৳5,800 ✅ All paid</p>
                        <p className="text-sm">Meals: 28 quantities (৳1,274)</p>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">Refund Received: +৳726</p>
                    </div>
                    {/* Reliability & Contributions */}
                    <div className="p-4 border rounded-lg dark:border-gray-700">
                        <h4 className="font-bold text-lg mb-3">Payment Reliability</h4>
                        <PunctualityBar percent={member.paymentPunctuality} />
                    </div>
                     <div className="p-4 border rounded-lg dark:border-gray-700">
                        <h4 className="font-bold text-lg mb-2">Shopping Contributions</h4>
                        <p className="text-sm">{member.shoppingContributions.count} times this month</p>
                        <p className="text-sm">Total: ৳{member.shoppingContributions.total.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    )
};

const MemberCard: React.FC<{ member: typeof mockMembers[0], onHistoryClick: () => void }> = ({ member, onHistoryClick }) => {
    const { user } = useAuth();
    const isManager = member.role === Role.Manager;

    const handleWhatsApp = () => {
        if (member.whatsapp && member.whatsapp !== 'Available' && member.whatsapp !== 'Not available') {
            const phoneNumber = member.whatsapp.replace(/[^0-9]/g, '');
            window.open(`https://wa.me/${phoneNumber}`, '_blank');
        }
    };

    const handleCall = () => {
        if (member.phone) {
            const phoneNumber = member.phone.replace(/[^0-9+]/g, '');
            window.open(`tel:${phoneNumber}`);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
            <div className="flex items-center gap-4">
                <UserCircleIcon className="w-12 h-12 text-gray-400 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        {/* FIX: Removed the 'title' prop to resolve a TypeScript error. The title functionality is now handled within the CrownIcon component itself for better accessibility. */}
                        {member.name} {isManager && <CrownIcon className="w-5 h-5 text-yellow-500" />}
                    </h3>
                </div>
            </div>
            <div className="border-t my-3 border-gray-200 dark:border-gray-700"></div>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <p>📞 {member.phone}</p>
                <p>📱 WhatsApp: {member.whatsapp}</p>
                <p>📘 Facebook: {member.facebook}</p>
            </div>
            <div className="border-t my-3 border-gray-200 dark:border-gray-700"></div>
            <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                <p><strong>Joined:</strong> {member.joined}</p>
                <p><strong>Room:</strong> {member.room}</p>
            </div>
            {!isManager && (
                 <>
                    <div className="border-t my-3 border-gray-200 dark:border-gray-700"></div>
                    <div className="space-y-1 text-sm">
                        <p className="font-semibold text-gray-700 dark:text-gray-200">This Month:</p>
                        <ul className="list-disc list-inside text-gray-500 dark:text-gray-400">
                            <li>Bills Due: {member.thisMonth.billsDue}</li>
                            <li>Meals: {member.thisMonth.meals} quantities</li>
                            <li>Status: {member.thisMonth.status}</li>
                        </ul>
                    </div>
                 </>
            )}
             <div className="border-t my-3 border-gray-200 dark:border-gray-700"></div>
             <div className="flex flex-wrap gap-2 text-sm font-semibold">
                {user?.role === Role.Manager && member.id !== user.id ? (
                    <>
                        <button onClick={onHistoryClick} className="text-primary hover:underline">View History</button>
                        <button className="text-red-500 hover:underline">Remove</button>
                    </>
                ) : (
                    <>
                         <button onClick={handleWhatsApp} className="flex-1 px-3 py-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-md flex items-center justify-center gap-2 transition-colors hover:bg-green-200 dark:hover:bg-green-900"><WhatsAppIcon className="w-4 h-4"/> WhatsApp</button>
                         <button onClick={handleCall} className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md flex items-center justify-center gap-2 transition-colors hover:bg-blue-200 dark:hover:bg-blue-900"><PhoneIcon className="w-4 h-4"/> Call</button>
                         <button onClick={onHistoryClick} className="w-full text-left mt-1 text-primary hover:underline p-1">View Full History →</button>
                    </>
                )}
             </div>
        </div>
    )
};

// --- Main Page ---

const RoomMembersPage: React.FC = () => {
    const { user } = useAuth();
    const [viewingMember, setViewingMember] = useState<typeof mockMembers[0] | null>(null);

    return (
        <>
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <UsersIcon className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Room Members ({mockMembers.length})</h1>
                    </div>
                    {user?.role === Role.Manager && (
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg shadow-sm hover:bg-primary-600">
                            <PlusIcon className="w-5 h-5"/>
                            Invite
                        </button>
                    )}
                </div>
                
                {user?.role === Role.Manager && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="font-semibold">
                            <span>🔑 Room Code: </span>
                            <span className="font-mono text-lg bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">AB1234</span>
                        </div>
                        <div className="flex gap-2">
                             <button className="flex items-center gap-1.5 px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded-md font-semibold"><ClipboardIcon className="w-4 h-4"/>Copy</button>
                             <button className="flex items-center gap-1.5 px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded-md font-semibold"><RefreshIcon className="w-4 h-4"/>Regenerate</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockMembers.map(member => (
                        <MemberCard key={member.id} member={member} onHistoryClick={() => setViewingMember(member)} />
                    ))}
                </div>

                {user?.role === Role.Manager && (
                    <div>
                        <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">🔔 Pending Join Requests ({mockJoinRequests.length})</h2>
                        <div className="space-y-4">
                            {mockJoinRequests.map(req => (
                                 <div key={req.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">{req.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{req.email} • {req.phone}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Requested: {req.requested}</p>
                                    <div className="flex gap-2 justify-end mt-3">
                                        <button className="px-4 py-1.5 text-sm font-semibold bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">Deny</button>
                                        <button className="px-4 py-1.5 text-sm font-semibold bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">Approve & Add</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <MemberHistoryModal member={viewingMember} onClose={() => setViewingMember(null)} />
        </>
    );
};

export default RoomMembersPage;