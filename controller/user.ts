
import { Request, Response } from 'express'
import { User } from '../types/user'
const { prisma } = require('../prisma/client')


async function getUsers(req:Request, res:Response) {
  try {
    const users: User[] = await prisma.user.findMany()
    res.json(users);
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

async function createUser(req: Request, res: Response) {
  try {
    const { email, password, firstname, lastname } = req.body
    const user: User = await prisma.user.create({
      data:{email, password, firstname, lastname}
    })
    res.json(user)
  } catch (err) {
    console.error('error creating user', err)
    res.status(500).json({error:'failed to create user'})
  }
}

async function updateUser(req: Request, res: Response) {
  try {
    const { email, password, firstname, lastname } = req.body
    const user: User = await prisma.user.update({
      data:{email, password,firstname,lastname}
    })
    res.json(user)
  } catch (err: any) {
    console.error('updating user error', err)
    if (err.code === 'P2025') {
      return res.status(404).json({error:'User not fuond'})
    }
    res.status(500).json({error:'failed to update user'})
  }
}

async function deleteUser(req: Request, res: Response) {
  try {
    await prisma.user.delete({
      where:{id: req.params.id}
    })
    res.json({message:'User deleted'})
  } catch (err: any) {
    console.error('delete user failed')
  }
}
async function getUserById(req: Request, res: Response) {
  try {
    const user: User | null = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("getUserById error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}
module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
}