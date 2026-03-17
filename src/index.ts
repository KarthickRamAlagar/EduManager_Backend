import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

import SubjectRouter from "./routes/subjects";
import securityMiddleware from "./middleware/security";

// instances
const app = express();
const PORT = process.env.PORT || 8000;
const FRONTEND_URL = process.env.FRONTEND_URL;

// default middlewares with correct sequences
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const timeStamp = new Date().toISOString();
  console.log(`[${timeStamp}] ${req.method} ${req.url}`);
  next();
});

// app.use(authMiddleware);

app.use(securityMiddleware);

const router = express.Router();

// default routes
router.get("/health", (req: Request, res: Response) => {
  res.json({
    message: "Hi ,I'm System Message and The Server is Healthy",
  });
});

app.use("/api/v1/EduManager", router);
app.use("/api/v1/EduManager/subjects", SubjectRouter);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
