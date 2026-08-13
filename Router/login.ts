import { Router, Request, Response } from 'express'


const loginRouter = Router();

loginRouter.get('/', (req: Request, res: Response) => {
  res.json({message: 'Reached Login'})
})

export default loginRouter