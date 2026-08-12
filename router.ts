import { Router, Request, Response } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "./controller/user";

import {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount
} from "./controller/account";


import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from "./controller/transaction";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Router active" });
});

router.get("/users", (req: Request, res: Response) => getUsers(req, res));
router.get("/users/:id", (req: Request, res: Response) => getUserById(req, res));
router.post("/users", (req: Request, res: Response) => createUser(req, res));
router.put("/users/:id", (req: Request, res: Response) => updateUser(req, res));
router.delete("/users/:id", (req: Request, res: Response) => deleteUser(req, res));

router.get("/accounts", (req: Request, res: Response) => getAccounts(req, res));
router.get("/accounts/:id", (req: Request, res: Response) => getAccountById(req, res));
router.post("/accounts", (req: Request, res: Response) => createAccount(req, res));
router.put("/accounts/:id", (req: Request, res: Response) => updateAccount(req, res));
router.delete("/accounts/:id", (req: Request, res: Response) => deleteAccount(req, res));



router.get('/transactions', getTransactions)
router.get('/transactions/:id', getTransactionById)
router.post('/transactions', createTransaction)
router.put('/transactions/:id', updateTransaction)
router.delete('/transactions/:id', deleteTransaction)

export default router;
