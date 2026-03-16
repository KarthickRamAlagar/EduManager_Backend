import { relations } from "drizzle-orm";
import { pgTable, integer, varchar, timestamp } from "drizzle-orm/pg-core";

const timeStamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};
export const departments = pgTable("departments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 250 }).notNull(),
  description: varchar("description", { length: 250 }),
  ...timeStamps,
});
export const subjects = pgTable("subjects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  departmentId: integer("department_id")
    .notNull()
    .references(() => departments.id, { onDelete: "restrict" }),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 250 }).notNull(),
  description: varchar("description", { length: 250 }),
  ...timeStamps,
});

// Relation Creation
export const departmentRelations = relations(departments, ({ many }) => ({
  subjects: many(subjects),
}));
export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  department: one(departments, {
    fields: [subjects.departmentId],
    references: [departments.id],
  }),
}));

// type inference
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
