export enum Role {
  Manager = 'Manager',
  Member = 'Member',
}

export enum RoomStatus {
    NoRoom = "NoRoom",
    Pending = "Pending",
    Approved = "Approved",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  roomStatus: RoomStatus;
  khataId?: string;
}

export type PaymentStatus = 'Unpaid' | 'Pending Approval' | 'Paid' | 'Overdue';

export interface BillShare {
    userId: string;
    userName: string;
    amount: number;
    status: PaymentStatus;
}

export interface Bill {
  id: string;
  title: string;
  totalAmount: number;
  dueDate: string;
  category: string;
  description?: string;
  imageUrl?: string;
  createdBy: string;
  shares: BillShare[];
}


export interface JoinRequest {
    // FIX: Changed type from invalid 'a-zA-Z' to 'string'.
    id: string;
    // FIX: Changed type from invalid 'a-zA-Z' to 'string'.
    userName: string;
    // FIX: Changed type from invalid 'a-zA-Z' to 'string'.
    userEmail: string;
    // FIX: Changed type from invalid 'a-zA-Z' to 'string'.
    requestedAt: string;
}