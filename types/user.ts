import { Transaction } from './transcation'
import { Account } from './account'


export interface User {
  id: string,
  email: string,
  password: string,
  firstName: string,
  lastname: string,
  createdAt: Date,

  currency?:string,
  accounts?: Account[],
  sent?: Transaction[],
  received?: Transaction[]
  
}