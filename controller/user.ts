
import { Request, Response } from 'express'
import { User } from '../types/user'
import { prisma } from '../prismaClient'

async function getUsers(req: Request, res: Response) {
  try {
    const users: User[] = await prisma.user.findMany()
    res.json(users)
  } catch (err) {
    console.error("getUsers error:", err)
    res.status(500).json({ error: "Failed to fetch users" })
  }
}

async function createUser(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastname,currency } = req.body

    const user: User = await prisma.user.create({
      data: { email, password, firstName, lastname,currency }
    })

    res.json(user)
  } catch (err) {
    console.error("error creating user", err)
    res.status(500).json({ error: "failed to create user" })
  }
}

async function updateUser(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastname,currency } = req.body

    const user: User = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { email, password, firstName, lastname , currency}
    })

    res.json(user)
  } catch (err) {
    console.error("updating user error:", err)

    
    if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "P2025") {
      return res.status(404).json({ error: "User not found" })
    }

    res.status(500).json({ error: "failed to update user" })
  }
}

async function deleteUser(req: Request, res: Response) {
  try {
    await prisma.user.delete({
      where: { id: req.params.id as string }
    })

    res.json({ message: "User deleted" })
  } catch (err) {
    console.error("delete user failed:", err)
    res.status(500).json({ error: "failed to delete user" })
  }
}

async function getUserById(req: Request, res: Response) {
  try {
    const user: User | null = await prisma.user.findUnique({
      where: { id: req.params.id as string }
    })

    if (!user) return res.status(404).json({ error: "User not found" })

    res.json(user)
  } catch (err) {
    console.error("getUserById error:", err)
    res.status(500).json({ error: "Failed to fetch user" })
  }
}

export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
}
