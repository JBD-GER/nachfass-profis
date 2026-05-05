import fs from "node:fs";

import { createClient } from "@supabase/supabase-js";

function loadEnvFile(path) {
  if (!fs.existsSync(path)) {
    return;
  }

  const lines = fs.readFileSync(path, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvFile(".env.local");

  const email = (process.argv[2] || "").trim().toLowerCase();

  if (!email) {
    console.error("Usage: node scripts/promote-admin.mjs <email>");
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  let matchedUser = null;
  let page = 1;

  while (!matchedUser) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      console.error(`Could not load auth users: ${error.message}`);
      process.exit(1);
    }

    matchedUser = data.users.find(
      (user) => (user.email || "").toLowerCase() === email,
    );

    if (matchedUser || data.users.length < 200) {
      break;
    }

    page += 1;
  }

  if (!matchedUser?.id) {
    console.error(`No auth user found for ${email}.`);
    process.exit(1);
  }

  const fullName =
    matchedUser.user_metadata?.full_name ||
    matchedUser.user_metadata?.name ||
    null;

  const { error: upsertError } = await supabase.from("profiles").upsert(
    {
      id: matchedUser.id,
      email: matchedUser.email,
      full_name: fullName,
      role: "admin",
    },
    {
      onConflict: "id",
    },
  );

  if (upsertError) {
    console.error(`Could not promote profile: ${upsertError.message}`);
    process.exit(1);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", matchedUser.id)
    .single();

  if (profileError) {
    console.error(`Promotion updated, but profile lookup failed: ${profileError.message}`);
    process.exit(1);
  }

  console.log(`Admin role granted to ${profile.email}.`);
  console.log(`Profile ID: ${profile.id}`);
  console.log(`Role: ${profile.role}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
