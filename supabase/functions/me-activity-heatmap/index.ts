import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* =========================
   CORS HEADERS
========================= */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "GET, POST, OPTIONS",
};

/* =========================
   SERVER
========================= */

Deno.serve(async (req) => {
  /* =========================
     PREFLIGHT HANDLER
  ========================= */

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    /* =========================
       AUTH HEADER
    ========================= */

    const authHeader =
      req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error:
            "Missing Authorization header",
        }),
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    /* =========================
       SUPABASE CLIENT
    ========================= */

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      },
    );

    /* =========================
       GET USER
    ========================= */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    /* =========================
       QUERY HEATMAP
    ========================= */

    const { data, error } =
      await supabase
        .from("user_activity_heatmap")
        .select("*")
        .eq("user_id", user.id);

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }

    /* =========================
       SUCCESS RESPONSE
    ========================= */

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: String(err),
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});
