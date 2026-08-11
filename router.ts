import { Router, Request, Response } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "./controller/user";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ message: "user router active" });
});

router.get("/users", (req: Request, res: Response) => getUsers(req, res));
router.get("/users/:id", (req: Request, res: Response) => getUserById(req, res));
router.post("/users", (req: Request, res: Response) => createUser(req, res));
router.put("/users/:id", (req: Request, res: Response) => updateUser(req, res));
router.delete("/users/:id", (req: Request, res: Response) => deleteUser(req, res));

export default router;
