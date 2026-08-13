import express, { Request, Response } from "express";
import cors from "cors";
import router from "./router";
<<<<<<< HEAD

=======
import loginRouter from './Router/login'
>>>>>>> main
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", router );
<<<<<<< HEAD
=======
app.use('/login', loginRouter)

>>>>>>> main

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "welcome to BUDGET" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
