// require("dotenv").config();
// console.log("SERVER DATABASE_URL =", process.env.DATABASE_URL);


import express = require('express')
import cors = require('cors')
import { Request, Response } from "express";
const app = express();

app.use(cors())

app.use(express.json())
const userRouter = require('./router.ts')
app.use('/api',userRouter)
app.get('/', (req:Request, res:Response) => {
  res.json({message:'welcome to BUDGET'})
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
})