import { createClient } from "@supabase/supabase-js";

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

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error("SUPABASE_URL or SUPABASE_SECRET_KEY is not configured");
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from("kitchen_state")
      .select("payload, updated_at")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;

    return Response.json(
      data
        ? { state: data.payload, updatedAt: data.updated_at }
        : { state: initialState },
    );
  } catch (error) {
    return Response.json({ state: initialState, warning: error instanceof Error ? error.message : "Storage unavailable" });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const updatedAt = new Date().toISOString();
    const { error } = await getSupabase()
      .from("kitchen_state")
      .upsert(
        { id: 1, payload, updated_at: updatedAt },
        { onConflict: "id" },
      );

    if (error) throw error;

    return Response.json({ ok: true, updatedAt });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
