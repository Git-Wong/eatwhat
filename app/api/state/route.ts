import { defaultKitchenState, MENU_REVISION, normalizeKitchenState } from "@/lib/kitchen";
import { getSupabase } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from("kitchen_state")
      .select("payload, updated_at")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;

    if (!data) return Response.json({ state: defaultKitchenState });

    const storedPayload = data.payload && typeof data.payload === "object" && !Array.isArray(data.payload)
      ? data.payload as Record<string, unknown>
      : {};
    const state = normalizeKitchenState(data.payload);
    let updatedAt = data.updated_at;

    // Persist one-time menu resets so every device converges on the same new recipe set.
    if (storedPayload.menuRevision !== MENU_REVISION) {
      updatedAt = new Date().toISOString();
      const { error: migrationError } = await getSupabase()
        .from("kitchen_state")
        .upsert({ id: 1, payload: state, updated_at: updatedAt }, { onConflict: "id" });
      if (migrationError) throw migrationError;
    }

    return Response.json({ state, updatedAt });
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
