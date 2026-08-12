import { Request, Response } from "express";
import { Account } from "../types/account";
import { prisma } from "../prismaClient";

async function getAccounts(req: Request, res: Response) {
  try {
    const accounts: Account[] = await prisma.account.findMany();
    res.json(accounts);
  } catch (err) {
    console.error("getAccounts error:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
}

async function getAccountById(req: Request, res: Response) {
  try {
    const account: Account | null = await prisma.account.findUnique({
      where: { id: req.params.id as string }
    });

    if (!account) return res.status(404).json({ error: "Account not found" });

    res.json(account);
  } catch (err) {
    console.error("getAccountById error:", err);
    res.status(500).json({ error: "Failed to fetch account" });
  }
}

async function createAccount(req: Request, res: Response) {
  try {
    const { userId, accountType, accountName, balance } = req.body;

    const account: Account = await prisma.account.create({
      data: { userId, accountType, accountName, balance }
    });

    res.json(account);
  } catch (err) {
    console.error("error creating account:", err);
    res.status(500).json({ error: "failed to create account" });
  }
}

async function updateAccount(req: Request, res: Response) {
  try {
    const { accountType, accountName, balance } = req.body;

    const account: Account = await prisma.account.update({
      where: { id: req.params.id as string },
      data: { accountType, accountName, balance }
    });

    res.json(account);
  } catch (err) {
    console.error("updating account error:", err);

    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.status(500).json({ error: "failed to update account" });
  }
}

async function deleteAccount(req: Request, res: Response) {
  try {
    await prisma.account.delete({
      where: { id: req.params.id as string }
    });

    res.json({ message: "Account deleted" });
  } catch (err) {
    console.error("delete account failed:", err);
    res.status(500).json({ error: "failed to delete account" });
  }
}

export {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount
};
