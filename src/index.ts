// Site 24x7 imports & instance
import AgentAPI from "apminsight";
AgentAPI.config();

import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import SubjectRouter from "./routes/subjects.js";
import UserRouter from "./routes/users.js";
import ClassesRouter from "./routes/classes.js";
import departmentsRouter from "./routes/departments.js";
import statsRouter from "./routes/stats.js";
import enrollmentsRouter from "./routes/enrollments.js";
import securityMiddleware from "./middleware/security.js";
import { auth } from "./lib/auth.js";

// instances
const app = express();
const PORT = process.env.PORT || 8000;
const FRONTEND_URL = process.env.FRONTEND_URL;

// default middlewares with correct sequences
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      // Allow localhost (dev)
      if (origin.includes("localhost")) {
        return callback(null, true);
      }

      // Allow ALL vercel deployments
      if (origin.includes("vercel.app")) {
        return callback(null, true);
      }

      // Block everything else
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  const timeStamp = new Date().toISOString();

  res.on("finish", () => {
    console.log(`[${timeStamp}] ${req.method} ${req.url} ${res.statusCode}`);
  });

  next();
});

app.use("/api/v1/EduManager/auth", toNodeHandler(auth));
app.use(securityMiddleware);

const router = express.Router();

// default routes
router.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hi ,I'm System Message and The Server is Healthy",
  });
});

app.use("/api/v1/EduManager", router);
app.use("/api/v1/EduManager/subjects", SubjectRouter);
app.use("/api/v1/EduManager/users", UserRouter);
app.use("/api/v1/EduManager/classes", ClassesRouter);
app.use("/api/v1/EduManager/departments", departmentsRouter);
app.use("/api/v1/EduManager/stats", statsRouter);
app.use("/api/v1/EduManager/enrollments", enrollmentsRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("ERROR:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
