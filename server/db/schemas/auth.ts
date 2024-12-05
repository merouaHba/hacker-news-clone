import { pgTable, text, timestamp } from "drizzle-orm/pg-core";


import type { InferSelectModel } from "drizzle-orm";



export const userTable = pgTable("user", {
    id: text("id").primaryKey(),
    username: text('userName').notNull().unique(),
    password: text("password").notNull(),
});

export const sessionTable = pgTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date"
	}).notNull()
});

export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;