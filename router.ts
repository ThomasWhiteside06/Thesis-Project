const router = require('express').Router()
import { Request, Response } from 'express'
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('./controller/user');


router.get('/', (req:Request, res:Response) => {
  res.json({message:'user router active'})
})

router.get('/users', getUsers)
router.get('/users/:id', getUserById)
router.post('/users', createUser)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)
console.log("ROUTER LOADED");

module.exports = router;