import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    // 1️⃣ Leer Authorization
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401 }
      );
    }

    // 2️⃣ Extraer token
    const token = authHeader.replace("Bearer ", "");

    // 3️⃣ Decodificar JWT
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    const userId = payload.sub;

    // 4️⃣ Cliente Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 5️⃣ Query vista agregada
    const { data, error } = await supabase
      .from("user_contents_by_platform")
      .select("*")
      .eq("user_id", userId)
      .order("total_contents", { ascending: false });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }

    // 6️⃣ Respuesta
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
