import type { User, Bill, PaymentStatus } from '../types';
import { Role, RoomStatus } from '../types';

// Mock database of users
const mockUsers: User[] = [
  { id: '1', email: 'manager@test.com', name: 'Alice Manager', role: Role.Manager, roomStatus: RoomStatus.Approved, khataId: 'ROOM123' },
  { id: '2', email: 'member@test.com', name: 'Bob Member', role: Role.Member, roomStatus: RoomStatus.Approved, khataId: 'ROOM122' },
  { id: '3', email: 'priya@test.com', name: 'Priya Das', role: Role.Member, roomStatus: RoomStatus.Approved, khataId: 'ROOM123' },
  { id: '4', email: 'ravi@test.com', name: 'Ravi Islam', role: Role.Member, roomStatus: RoomStatus.Approved, khataId: 'ROOM123' },
  { id: '5', email: 'pending@test.com', name: 'Charlie Pending', role: Role.Member, roomStatus: RoomStatus.Pending },
  { id: '6', email: 'noroom@test.com', name: 'David No-Room', role: Role.Member, roomStatus: RoomStatus.NoRoom },
  { id: '7', email: 'manager.noroom@test.com', name: 'Eve Manager', role: Role.Manager, roomStatus: RoomStatus.NoRoom },
];

const mockBills: Bill[] = [
    // October Bills
    // Rent (individual bills)
    { id: 'rent-oct-1', title: 'October Rent', category: 'Rent', totalAmount: 5000, dueDate: '2025-10-01', createdBy: '1', shares: [{ userId: '1', userName: 'Alice Manager', amount: 5000, status: 'Paid' }] },
    { id: 'rent-oct-3', title: 'October Rent', category: 'Rent', totalAmount: 4500, dueDate: '2025-10-01', createdBy: '1', shares: [{ userId: '3', userName: 'Priya Das', amount: 4500, status: 'Overdue' }] },
    { id: 'rent-oct-4', title: 'October Rent', category: 'Rent', totalAmount: 5000, dueDate: '2025-10-01', createdBy: '1', shares: [{ userId: '4', userName: 'Ravi Islam', amount: 5000, status: 'Paid' }] },
    
    // Electricity (shared bill)
    { id: 'elec-oct', title: 'October Electricity', category: 'Electricity', totalAmount: 1200, dueDate: '2025-10-15', createdBy: '1', description: 'Meter Reading: 1234 kWh. AC usage high this month.',
      shares: [
        { userId: '1', userName: 'Alice Manager', amount: 400, status: 'Paid' },
        { userId: '3', userName: 'Priya Das', amount: 400, status: 'Unpaid' },
        { userId: '4', userName: 'Ravi Islam', amount: 400, status: 'Unpaid' },
      ]},
    
    // Water (shared bill)
    { id: 'water-oct', title: 'October Water', category: 'Water', totalAmount: 800, dueDate: '2025-10-12', createdBy: '1',
      shares: [
        { userId: '1', userName: 'Alice Manager', amount: 267, status: 'Paid' },
        { userId: '3', userName: 'Priya Das', amount: 267, status: 'Paid' },
        { userId: '4', userName: 'Ravi Islam', amount: 266, status: 'Unpaid' },
      ]},
    
    // Wi-Fi
    { id: 'wifi-oct', title: 'October Wi-Fi', category: 'Wi-Fi', totalAmount: 1000, dueDate: '2025-10-10', createdBy: '1',
      shares: [
        { userId: '1', userName: 'Alice Manager', amount: 334, status: 'Paid' },
        { userId: '3', userName: 'Priya Das', amount: 333, status: 'Pending Approval' },
        { userId: '4', userName: 'Ravi Islam', amount: 333, status: 'Paid' },
      ]},

    // September Bills
    { id: 'elec-sep', title: 'September Electricity', category: 'Electricity', totalAmount: 1150, dueDate: '2025-09-15', createdBy: '1', shares: [
        { userId: '1', userName: 'Alice Manager', amount: 384, status: 'Paid' },
        { userId: '3', userName: 'Priya Das', amount: 383, status: 'Paid' },
        { userId: '4', userName: 'Ravi Islam', amount: 383, status: 'Paid' },
    ]},
    { id: 'water-sep', title: 'September Water', category: 'Water', totalAmount: 750, dueDate: '2025-09-12', createdBy: '1', shares: [
        { userId: '1', userName: 'Alice Manager', amount: 250, status: 'Paid' },
        { userId: '3', userName: 'Priya Das', amount: 250, status: 'Paid' },
        { userId: '4', userName: 'Ravi Islam', amount: 250, status: 'Paid' },
    ]},
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
            if (roomId === 'ROOM123') {
                resolve(JSON.parse(JSON.stringify(mockBills))); // Deep copy
            } else {
                resolve([]);
            }
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
};

export { api };