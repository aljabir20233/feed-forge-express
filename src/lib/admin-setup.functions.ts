import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ADMIN_EMAIL = "milton@bankbima.local";
const ADMIN_PASSWORD = "milton551233";

export const ensureMiltonAdmin = createServerFn({ method: "POST" }).handler(async () => {
  // Try to find existing user by email
  const { data: list } = await supabaseAdmin.auth.admin.listUsers();
  let user = list?.users.find((u) => u.email === ADMIN_EMAIL);

  if (!user) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: "Milton (Admin)" },
    });
    if (error) throw new Error(error.message);
    user = data.user!;
  } else {
    // ensure password matches
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
  }

  // Ensure admin role
  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin");

  if (!roles || roles.length === 0) {
    await supabaseAdmin.from("user_roles").insert({ user_id: user.id, role: "admin" });
  }

  return { email: ADMIN_EMAIL, password: ADMIN_PASSWORD };
});
