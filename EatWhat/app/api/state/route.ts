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
  const database = globalThis.__KITCHEN_DB__;
  if (!database) throw new Error("Kitchen database is unavailable");
  return database;
}

async function ensureTable() {
  await getDatabase().prepare(`CREATE TABLE IF NOT EXISTS kitchen_state (
    id INTEGER PRIMARY KEY,
    payload TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`).run();
}

export async function GET() {
  try {
    await ensureTable();
    const row = await getDatabase().prepare("SELECT payload, updated_at FROM kitchen_state WHERE id = ?").bind(1).first<{ payload: string; updated_at: string }>();
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
    await getDatabase().prepare(`INSERT INTO kitchen_state (id, payload, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`)
      .bind(1, JSON.stringify(payload), updatedAt).run();
    return Response.json({ ok: true, updatedAt });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save" }, { status: 500 });
  }
}
