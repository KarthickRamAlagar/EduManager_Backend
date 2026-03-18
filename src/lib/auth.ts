import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js"; // your drizzle instance
import * as schema from "../db/schema/auth.js";

const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is required");
}

if (!FRONTEND_URL) {
  throw new Error("FRONTEND_URL is required");
}

export const auth = betterAuth({
  baseURL: "http://localhost:8000/api/v1/EduManager/auth",
  secret: BETTER_AUTH_SECRET,
  trustedOrigins: [FRONTEND_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "student",
        input: true,
      },
      imageCldPubId: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
});
