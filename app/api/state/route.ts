import { defaultKitchenState, normalizeKitchenState } from "@/lib/kitchen";
import { getSupabase } from "@/lib/supabase-server";

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
        ? { state: normalizeKitchenState(data.payload), updatedAt: data.updated_at }
        : { state: defaultKitchenState },
    );
  } catch (error) {
    return Response.json({ state: defaultKitchenState, warning: error instanceof Error ? error.message : "Storage unavailable" });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = normalizeKitchenState(await request.json());
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
