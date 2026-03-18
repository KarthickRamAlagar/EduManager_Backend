import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { user } from "../db/schema/index.js";
import { db } from "../db/index.js";

const router = express.Router();

// GET /users with search, role filter, pagination

router.get("/", async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;

    // Pagination (same as subjects)
    const currentPage = Math.max(1, Number(page) || 1);
    const limitPerPage = Math.max(1, Math.min(Number(limit) || 10, 100));
    const offSet = (currentPage - 1) * limitPerPage;

    const filterConditions = [];

    // Search: name OR email
    if (search) {
      filterConditions.push(
        or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`)),
      );
    }

    // Role filter (exact match)
    if (role) {
      filterConditions.push(eq(user.role, role as any));
    }

    // Combine filters
    const whereClause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // Count query
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;

    // Data query
    const usersList = await db
      .select({
        ...getTableColumns(user),
      })
      .from(user)
      .where(whereClause)
      .orderBy(desc(user.createdAt))
      .limit(limitPerPage)
      .offset(offSet);

    //  Response
    res.status(200).json({
      data: usersList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (e) {
    console.error(`GET /users error:`, e);
    res.status(500).json({ error: "Failed to get users" });
  }
});

export default router;
