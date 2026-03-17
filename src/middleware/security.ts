// import { Request, Response, NextFunction } from "express";
// import { ArcjetNodeRequest, slidingWindow } from "@arcjet/node";
// let aj: any;
// const getArcjet = async () => {
//   if (!aj) {
//     const module = await import("../config/arcjet");
//     aj = module.default;
//   }
//   return aj;
// };
// const securityMiddleware = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   if (process.env.NODE_ENV === "test") {
//     return next();
//   }

//   try {
//     const role: RateLimitRole = req.user?.role ?? "guest";

//     let limit: number;
//     let message: string;

//     switch (role) {
//       case "admin":
//         limit = 20;
//         message = "Admin request limit exceeded (20 per minute).Slow Down";
//         break;
//       case "student":
//       case "teacher":
//         limit = 10;
//         message = "User request limit exceeded (10 per minute). Please Wait";
//         break;
//       default:
//         limit = 5;
//         message =
//           "Guest Request limit exceeded (5 per minutes).Please Sign up for higher limits.";
//         break;
//     }

//     const client = aj.withRule(
//       slidingWindow({
//         mode: "LIVE",
//         interval: "1m",
//         max: limit,
//       }),
//     );
//     const arcjetRequest: ArcjetNodeRequest = {
//       headers: req.headers,
//       method: req.method,
//       url: req.originalUrl ?? req.url,
//       socket: {
//         remoteAddress: req.socket.remoteAddress ?? req.ip ?? "0.0.0.0",
//       },
//     };

//     const decision = await client.protect(arcjetRequest);

//     if (decision.isDenied() && decision.reason.isBot()) {
//       return res.status(403).json({
//         error: "Forbidden",
//         message: "Automated requests are not allowed.",
//       });
//     }

//     if (decision.isDenied() && decision.reason.isShield()) {
//       return res.status(403).json({
//         error: "Forbidden",
//         message: "Request.blocked by security policy",
//       });
//     }

//     if (decision.isDenied() && decision.reason.isRateLimit()) {
//       return res.status(429).json({ error: "Too many request", message });
//     }

//     next();
//   } catch (e) {
//     console.log("Arcjet Middleware Error:", e);
//     res.status(500).json({
//       error: "Internal Error",
//       message: "Something went Wrong with security middleware",
//     });
//   }
// };

// export default securityMiddleware;

import { Request, Response, NextFunction } from "express";
import { ArcjetNodeRequest, slidingWindow } from "@arcjet/node";

type RateLimitRole = "admin" | "teacher" | "student" | "guest";

let aj: any;

// Lazy load Arcjet (prevents crash if env missing)
const getArcjet = async () => {
  if (!aj) {
    const module = await import("../config/arcjet");
    aj = module.default;
  }
  return aj;
};

const securityMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (process.env.NODE_ENV !== "production") {
    return next();
  }

  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const arcjet = await getArcjet();

    const role: RateLimitRole = req.user?.role ?? "guest";

    let limit = 5;
    let message =
      "Guest request limit exceeded (5 per minute). Please sign up.";

    switch (role) {
      case "admin":
        limit = 20;
        message = "Admin request limit exceeded (20 per minute). Slow down.";
        break;

      case "teacher":
      case "student":
        limit = 10;
        message = "User request limit exceeded (10 per minute). Please wait.";
        break;
    }

    const client = arcjet.withRule(
      slidingWindow({
        mode: "LIVE",
        interval: "1m",
        max: limit,
      }),
    );

    const arcjetRequest: ArcjetNodeRequest = {
      headers: req.headers,
      method: req.method,
      url: req.originalUrl ?? req.url,
      socket: {
        remoteAddress: req.socket.remoteAddress ?? req.ip ?? "0.0.0.0",
      },
    };

    const decision = await client.protect(arcjetRequest);

    // 🚫 Bot protection
    if (decision.isDenied() && decision.reason.isBot()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Automated requests are not allowed.",
      });
    }

    // 🛡 Shield protection
    if (decision.isDenied() && decision.reason.isShield()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Request blocked by security policy.",
      });
    }

    // ⛔ Rate limit
    if (decision.isDenied() && decision.reason.isRateLimit()) {
      return res.status(429).json({
        error: "Too many requests",
        message,
      });
    }

    next();
  } catch (error) {
    console.error("Arcjet Middleware Error:", error);

    return res.status(500).json({
      error: "Internal Server Error",
      message: "Security middleware failed",
    });
  }
};

export default securityMiddleware;
