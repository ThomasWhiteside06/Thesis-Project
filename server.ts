import express, { Request, Response } from "express";
import cors from "cors";
import router from "./router";
import loginRouter from './Router/login'
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", router );
app.use('/login', loginRouter)


app.get("/", (req: Request, res: Response) => {
  res.json({ message: "welcome to BUDGET" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
