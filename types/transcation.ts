export interface Transaction {
  id: string;
  categories: string[];
  senderId: string;
  recipientId: string;
  amount: number;    
  date: Date;
  regular: boolean;
  frequency: string;
  start: Date;
}
