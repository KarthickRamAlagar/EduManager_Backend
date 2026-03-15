import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// default middlewares
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  const timeStamp = new Date().toISOString();
  console.log(`[${timeStamp}] ${req.method} ${req.url}`);
  next();
});
const router = express.Router();

// default routes
router.get("/health", (req: Request, res: Response) => {
  res.json({
    message: "Hi ,I'm System Message and The Server is Healthy",
  });
});

app.use("/api/v1/EduManager", router);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
