import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const authHeader =
      req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error:
            "Missing Authorization header",
        }),
        { status: 401 },
      );
    }

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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        { status: 401 },
      );
    }

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
        { status: 500 },
      );
    }

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          "Content-Type":
            "application/json",
          "Access-Control-Allow-Origin":
            "*",
        },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: String(err),
      }),
      { status: 500 },
    );
  }
});
