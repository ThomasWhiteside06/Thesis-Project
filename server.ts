import express, { Request, Response } from "express";
import cors from "cors";
import router from "./router";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", router );

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "welcome to BUDGET" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
