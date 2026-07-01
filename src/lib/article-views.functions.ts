import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const incrementArticleView = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ slug: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.rpc("increment_article_view", { _slug: data.slug });
    return { ok: true };
  });
