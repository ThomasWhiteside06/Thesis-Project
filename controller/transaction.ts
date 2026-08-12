import { Request, Response } from "express";
import { prisma } from "../prismaClient";
import { Transaction } from "../types/transcation";

async function getTransactions(req: Request, res: Response) {
  try {
    const transaction: Transaction[] = await prisma.transaction.findMany();
    res.json(transaction);
  } catch (err) {
    console.error("getTransactions error:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
}

async function getTransactionById(req: Request, res: Response) {
  try {
    const transaction: Transaction | null = await prisma.transaction.findUnique({
      where:{id:req.params.id as string }
    })
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' })
    res.json(transaction)
  } catch (err) {
    console.error('getTransactionById', err)
    res.status(500).json({error:'failed to fetch transaction'})
  }
}

async function createTransaction(req: Request, res: Response) {
  try {
    const {
      categories, senderId, recipientId, amount, date, regular, frequency, start } = req.body 
    const transaction: Transaction = await prisma.transaction.create({
      data: {
        categories,
        senderId,
        recipientId,
        amount,
        date,
        regular,
        frequency,
        start
      }
    })
    res.json(transaction)
    
  } catch (err) {
    console.error("error creating transaction:", err);
    res.status(500).json({ error: "failed to create transaction" });
    }
}
  

async function updateTransaction(req: Request, res: Response) {
  try {
    const {
      categories,
      senderId,
      recipientId,
      amount,
      date,
      regular,
      frequency,
      start
    } = req.body;

    const transaction: Transaction = await prisma.transaction.update({
      where: { id: req.params.id as string },
      data: {
        categories,
        senderId,
        recipientId,
        amount,
        date,
        regular,
        frequency,
        start
      }
    });

    res.json(transaction);
  } catch (err) {
    console.error("updating transaction error:", err);

    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.status(500).json({ error: "failed to update transaction" });
  }
}

async function deleteTransaction(req: Request, res: Response) {
  try {
    await prisma.transaction.delete({
      where: { id: req.params.id as string }
    });
     res.json({ message: "Transaction deleted" });
  } catch (err) {
    console.error("delete transaction failed:", err);
    res.status(500).json({ error: "failed to delete transaction" });
  }
}

export {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};