import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const kitchenState = sqliteTable("kitchen_state", {
  id: integer("id").primaryKey(),
  payload: text("payload").notNull(),
  updatedAt: text("updated_at").notNull(),
});
