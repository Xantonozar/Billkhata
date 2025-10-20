import type { User, Bill, PaymentStatus } from '../types';
import { Role, RoomStatus } from '../types';

// Mock database of users
const mockUsers: User[] = [
  { id: '1', email: 'manager@test.com', name: 'Alice Manager', role: Role.Manager, roomStatus: RoomStatus.Approved, khataId: 'ROOM123' },
  { id: '2', email: 'member@test.com', name: 'Bob Member', role: Role.Member, roomStatus: RoomStatus.Approved, khataId: 'ROOM122' },
  { id: '3', email: 'priya@test.com', name: 'Priya Das', role: Role.Member, roomStatus: RoomStatus.Approved, khataId: 'ROOM123' },
  { id: '4', email: 'ravi@test.com', name: 'Ravi Islam', role: Role.Member, roomStatus: RoomStatus.Approved, khataId: 'ROOM123' },
  { id: '9', email: 'amit@test.com', name: 'Amit Hossain', role: Role.Member, roomStatus: RoomStatus.Approved, khataId: 'ROOM123' },
  { id: '5', email: 'pending@test.com', name: 'Charlie Pending', role: Role.Member, roomStatus: RoomStatus.Pending },
  { id: '6', email: 'noroom@test.com', name: 'David No-Room', role: Role.Member, roomStatus: RoomStatus.NoRoom },
  { id: '7', email: 'manager.noroom@test.com', name: 'Eve Manager', role: Role.Manager, roomStatus: RoomStatus.NoRoom },
  { id: '8', email: 'john@test.com', name: 'John Doe', role: Role.Member, roomStatus: RoomStatus.Approved, khataId: 'ROOM122' },
];

const mockBills: Bill[] = [
    // October Bills for ROOM123 (Manager Alice, Members: Priya, Ravi, Amit)
    // Rent (individual bills) - Manager does not have one
    { id: 'rent-oct-3', khataId: 'ROOM123', title: 'October Rent', category: 'Rent', totalAmount: 4500, dueDate: '2025-10-01', createdBy: '1', shares: [{ userId: '3', userName: 'Priya Das', amount: 4500, status: 'Overdue' }] },
    { id: 'rent-oct-4', khataId: 'ROOM123', title: 'October Rent', category: 'Rent', totalAmount: 5000, dueDate: '2025-10-01', createdBy: '1', shares: [{ userId: '4', userName: 'Ravi Islam', amount: 5000, status: 'Paid' }] },
    { id: 'rent-oct-9', khataId: 'ROOM123', title: 'October Rent', category: 'Rent', totalAmount: 5200, dueDate: '2025-10-01', createdBy: '1', shares: [{ userId: '9', userName: 'Amit Hossain', amount: 5200, status: 'Paid' }] },
    
    // Electricity (shared bill) - Split among 3 members
    { id: 'elec-oct', khataId: 'ROOM123', title: 'October Electricity', category: 'Electricity', totalAmount: 1200, dueDate: '2025-10-15', createdBy: '1', description: 'Meter Reading: 1234 kWh. AC usage high this month.',
      shares: [
        { userId: '3', userName: 'Priya Das', amount: 400, status: 'Unpaid' },
        { userId: '4', userName: 'Ravi Islam', amount: 400, status: 'Unpaid' },
        { userId: '9', userName: 'Amit Hossain', amount: 400, status: 'Unpaid' },
      ]},
    
    // Water (shared bill) - Split among 3 members
    { id: 'water-oct', khataId: 'ROOM123', title: 'October Water', category: 'Water', totalAmount: 800, dueDate: '2025-10-12', createdBy: '1',
      shares: [
        { userId: '3', userName: 'Priya Das', amount: 267, status: 'Paid' },
        { userId: '4', userName: 'Ravi Islam', amount: 266, status: 'Unpaid' },
        { userId: '9', userName: 'Amit Hossain', amount: 267, status: 'Unpaid' },
      ]},
    
    // Wi-Fi - Split among 3 members
    { id: 'wifi-oct', khataId: 'ROOM123', title: 'October Wi-Fi', category: 'Wi-Fi', totalAmount: 1000, dueDate: '2025-10-10', createdBy: '1',
      shares: [
        { userId: '3', userName: 'Priya Das', amount: 333, status: 'Pending Approval' },
        { userId: '4', userName: 'Ravi Islam', amount: 333, status: 'Paid' },
        { userId: '9', userName: 'Amit Hossain', amount: 334, status: 'Unpaid' },
      ]},

    // September Bills for ROOM123 - Split among 3 members
    { id: 'elec-sep', khataId: 'ROOM123', title: 'September Electricity', category: 'Electricity', totalAmount: 1150, dueDate: '2025-09-15', createdBy: '1', shares: [
        { userId: '3', userName: 'Priya Das', amount: 383, status: 'Paid' },
        { userId: '4', userName: 'Ravi Islam', amount: 383, status: 'Paid' },
        { userId: '9', userName: 'Amit Hossain', amount: 384, status: 'Paid' },
    ]},
    { id: 'water-sep', khataId: 'ROOM123', title: 'September Water', category: 'Water', totalAmount: 750, dueDate: '2025-09-12', createdBy: '1', shares: [
        { userId: '3', userName: 'Priya Das', amount: 250, status: 'Paid' },
        { userId: '4', userName: 'Ravi Islam', amount: 250, status: 'Paid' },
        { userId: '9', userName: 'Amit Hossain', amount: 250, status: 'Paid' },
    ]},

    // Bills for ROOM122 (Bob and John)
    { 
      id: 'rent-oct-bob', 
      khataId: 'ROOM122',
      title: 'October Rent', 
      category: 'Rent', 
      totalAmount: 6000, 
      dueDate: '2025-10-05', 
      createdBy: 'some-manager-id', 
      shares: [{ userId: '2', userName: 'Bob Member', amount: 6000, status: 'Overdue' }] 
    },
    { 
      id: 'rent-oct-john', 
      khataId: 'ROOM122',
      title: 'October Rent', 
      category: 'Rent', 
      totalAmount: 6000, 
      dueDate: '2025-10-05', 
      createdBy: 'some-manager-id', 
      shares: [{ userId: '8', userName: 'John Doe', amount: 6000, status: 'Paid' }] 
    },
    { 
      id: 'elec-oct-room122', 
      khataId: 'ROOM122',
      title: 'October Electricity', 
      category: 'Electricity', 
      totalAmount: 900, 
      dueDate: '2025-10-20', 
      createdBy: 'some-manager-id',
      shares: [
        { userId: '2', userName: 'Bob Member', amount: 450, status: 'Unpaid' },
        { userId: '8', userName: 'John Doe', amount: 450, status: 'Paid' },
      ]
    },
    { 
      id: 'wifi-oct-room122', 
      khataId: 'ROOM122',
      title: 'October Wi-Fi', 
      category: 'Wi-Fi', 
      totalAmount: 800, 
      dueDate: '2025-10-10', 
      createdBy: 'some-manager-id',
      shares: [
        { userId: '2', userName: 'Bob Member', amount: 400, status: 'Pending Approval' },
        { userId: '8', userName: 'John Doe', amount: 400, status: 'Paid' },
      ]
    },
     { 
      id: 'water-sep-room122', 
      khataId: 'ROOM122',
      title: 'September Water', 
      category: 'Water', 
      totalAmount: 500, 
      dueDate: '2025-09-18', 
      createdBy: 'some-manager-id',
      shares: [
        { userId: '2', userName: 'Bob Member', amount: 250, status: 'Paid' },
        { userId: '8', userName: 'John Doe', amount: 250, status: 'Paid' },
      ]
    },
];


const api = {
  // FIX: Changed parameter types from a-zA-Z to string
  login: (email: string, pass: string): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          resolve(user);
        } else {
          resolve(null);
        }
      }, 500);
    });
  },

  // FIX: Changed parameter types from a-zA-Z to string
  signup: (name: string, email: string, pass: string, role: Role): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userExists = mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase());
        if (userExists) {
          resolve(null);
        } else {
          const newUser: User = {
            id: String(mockUsers.length + 1),
            name,
            email,
            role,
            roomStatus: RoomStatus.NoRoom,
          };
          mockUsers.push(newUser); 
          resolve(newUser);
        }
      }, 500);
    });
  },
  
  // FIX: Changed parameter type from a-zA-Z to string
  getBillsForRoom: (roomId: string): Promise<Bill[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const roomBills = mockBills.filter(bill => bill.khataId === roomId);
            resolve(JSON.parse(JSON.stringify(roomBills))); // Deep copy
        }, 500);
    });
  },

  updateBillShareStatus: (billId: string, userId: string, newStatus: PaymentStatus): Promise<Bill | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const billIndex = mockBills.findIndex(b => b.id === billId);
        if (billIndex > -1) {
          const bill = mockBills[billIndex];
          const shareIndex = bill.shares.findIndex(s => s.userId === userId);
          if (shareIndex > -1) {
            bill.shares[shareIndex].status = newStatus;
            mockBills[billIndex] = bill;
            resolve(JSON.parse(JSON.stringify(bill))); // Return deep copy of updated bill
          } else {
            resolve(null); // Share not found
          }
        } else {
          resolve(null); // Bill not found
        }
      }, 300);
    });
  },

  getMembersForRoom: (roomId: string): Promise<User[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const roomMembers = mockUsers.filter(user => user.khataId === roomId && user.role === Role.Member);
            resolve(JSON.parse(JSON.stringify(roomMembers))); // Deep copy
        }, 300);
    });
  },

  getPendingApprovalsCount: (roomId: string): Promise<number> => {
    // This is a mock. In a real app, this would query a database.
    const mockPendingApprovals = {
        billPayments: 3,
        shopping: 1,
        deposits: 1,
        joinRequests: 0,
        mealEntries: 1,
    };
    const total = Object.values(mockPendingApprovals).reduce((sum, count) => sum + count, 0);
    return new Promise(resolve => setTimeout(() => resolve(total), 200));
  },

  getFundStatus: (roomId: string): Promise<{ balance: number }> => {
      // Mock data from ShoppingPage
    const mockFundStatus = {
        totalDeposits: 12000,
        totalShopping: 8460,
        balance: 3540,
    };
    return new Promise(resolve => setTimeout(() => resolve({ balance: mockFundStatus.balance }), 200));
  }
};

export { api };