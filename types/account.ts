import { Decimal } from "../generated/prisma/client";

export interface Account {
  id: string;
  userId: string;
  accountType: string;
  accountName: string;
  balance: Decimal;
}
