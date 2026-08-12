export interface Transaction {
  id: string;
  categories: string[];
  senderId: string;
  recipientId: string;
  amount: string;
  date: string;
  regular: boolean;
  frequency: string;
  start: string; 
}