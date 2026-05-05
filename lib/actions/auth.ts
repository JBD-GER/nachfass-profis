"use server";

import { redirect } from "next/navigation";

import { getDefaultAppPath } from "@/lib/domain";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

function buildRedirect(pathname: string, params: Record<string, string>) {
  const url = new URL(pathname, "http://localhost");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return `${url.pathname}${url.search}`;
}

async function loadRole(client: Awaited<ReturnType<typeof createSupabaseServerClient>>, userId: string) {
  const { data } = await client
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return ((data as Pick<Profile, "role"> | null)?.role ?? "customer") as UserRole;
}

function mapAuthError(message?: string) {
  if (!message) {
    return "Anmeldung fehlgeschlagen.";
  }

  if (/email not confirmed/i.test(message)) {
    return "Die E-Mail-Adresse ist noch nicht bestätigt.";
  }

  if (/invalid login credentials/i.test(message)) {
    return "Die Zugangsdaten sind ungültig.";
  }

  return message;
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    redirect(buildRedirect("/login", { error: "Bitte E-Mail und Passwort angeben." }));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(
      buildRedirect("/login", {
        error: mapAuthError(error?.message),
      }),
    );
  }

  const role = await loadRole(supabase, data.user.id);
  redirect(getDefaultAppPath(role));
}

export async function signUpAction(formData: FormData) {
  redirect(
    buildRedirect("/login", {
      error:
        "Selbstregistrierung ist deaktiviert. Benutzer werden zentral in Supabase angelegt.",
    }),
  );
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
