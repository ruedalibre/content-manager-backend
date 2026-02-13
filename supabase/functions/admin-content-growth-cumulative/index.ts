import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* =========================
   CORS CONFIG
========================= */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/* =========================
   EDGE FUNCTION
========================= */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY"
      )!
    );

    const { data, error } =
      await supabase
        .from(
          "admin_content_growth_cumulative"
        )
        .select("*")
        .order("month", {
          ascending: true,
        });

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: String(err),
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
