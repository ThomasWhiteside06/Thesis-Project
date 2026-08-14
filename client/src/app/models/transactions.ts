export interface NewTransaction {
    id: string;
    categories: string[];
    sender: {
        id:string,
        amount:number,
        currency: string
    };
    recipient: {
        id:string,
        amount:number,
        currency: string
    }; 
    date: string;
    regular: boolean;
    recurrence?: {
        interval: number;
        unit: string; //'day' | 'week' | 'month' | 'year'
        start: string;
        end: string | null;
    };
}

export interface Transaction{
    id?: string,
    categories: string[],
    senderId: string,
    recipientId: string,
    amount: number,
    date: Date,
    regular?:boolean,
    frequency?:string,
    start?:Date
  }