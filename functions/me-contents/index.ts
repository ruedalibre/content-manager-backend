import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    // 1️⃣ Leer Authorization header
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401 }
      );
    }

    // 2️⃣ Extraer token
    const token = authHeader.replace("Bearer ", "");

    // 3️⃣ Decodificar payload
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    const userId = payload.sub;

    // 4️⃣ Cliente Supabase (backend seguro)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 5️⃣ Consultar vista
    const { data, error } = await supabase
      .from("user_dashboard_summary")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      return new Response(
        JSON.stringify({
          error: "View query error",
          details: error.message
        }),
        { status: 500 }
      );
    }

    // 6️⃣ Respuesta final
    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Unexpected error",
        details: String(err)
      }),
      { status: 500 }
    );
  }
});
