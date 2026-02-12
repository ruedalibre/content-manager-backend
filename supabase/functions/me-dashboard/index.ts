import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 🔐 CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {

  // 🧭 1️⃣ Manejar preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const authHeader =
      req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "Missing Authorization header",
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // 🧱 Cliente Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // 👤 Usuario autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // 📊 Vista dashboard
    const { data, error } = await supabase
      .from("user_dashboard_summary")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      return new Response(
        JSON.stringify({
          error: "View query error",
          details: error.message,
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // ✅ Respuesta final
    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch {
    return new Response(
      JSON.stringify({
        error: "Unexpected error",
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
