import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401 },
      );
    }

    // Extraer token
    const token = authHeader.replace("Bearer ", "");

    // Decodificar payload
    const payload = JSON.parse(
      atob(token.split(".")[1]),
    );

    const userId = payload.sub;

    // Query params
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);
    const offset = (page - 1) * limit;

    // Cliente backend
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Query vista
    const { data, error } = await supabase
      .from("user_contents_history")
      .select("*")
      .eq("user_id", userId)
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 },
      );
    }

    return new Response(
      JSON.stringify({
        page,
        limit,
        results: data,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Unexpected error",
        details: String(err),
      }),
      { status: 500 },
    );
  }
});
