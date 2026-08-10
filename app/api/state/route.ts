const initialState = {
  ordered: [],
  wishlist: ["salmon"],
  confirmed: false,
  checkedShopping: [],
  completedSteps: [],
  inventory: [
    { id: "rice", name: "大米", amount: "1.8 kg", category: "主食", daysLeft: 90, icon: "🍚" },
    { id: "eggs", name: "鸡蛋", amount: "8 个", category: "蛋奶", daysLeft: 12, icon: "🥚" },
    { id: "spinach", name: "菠菜", amount: "1 把", category: "蔬菜", daysLeft: 2, icon: "🥬" },
    { id: "garlic", name: "蒜", amount: "2 头", category: "调味", daysLeft: 24, icon: "🧄" },
  ],
};

function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured");
  return neon(databaseUrl);
}

async function ensureTable() {
  const sql = getDatabase();
  await sql`CREATE TABLE IF NOT EXISTS kitchen_state (
    id INTEGER PRIMARY KEY,
    payload TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
  )`;
}

export async function GET() {
  try {
    await ensureTable();
    const sql = getDatabase();
    const rows = await sql`SELECT payload, updated_at FROM kitchen_state WHERE id = 1`;
    const row = rows[0] as { payload: string; updated_at: string } | undefined;
    return Response.json(row ? { state: JSON.parse(row.payload), updatedAt: row.updated_at } : { state: initialState });
  } catch (error) {
    return Response.json({ state: initialState, warning: error instanceof Error ? error.message : "Storage unavailable" });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureTable();
    const payload = await request.json();
    const updatedAt = new Date().toISOString();
    const sql = getDatabase();
    await sql`INSERT INTO kitchen_state (id, payload, updated_at)
      VALUES (1, ${JSON.stringify(payload)}, ${updatedAt})
      ON CONFLICT (id) DO UPDATE
      SET payload = EXCLUDED.payload, updated_at = EXCLUDED.updated_at`;
    return Response.json({ ok: true, updatedAt });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save" }, { status: 500 });
  }
}
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
