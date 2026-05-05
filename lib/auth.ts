import { redirect } from "next/navigation";

import { getDefaultAppPath } from "@/lib/domain";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthContext, Profile, UserRole } from "@/lib/types";

async function loadProfile(userId: string): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    return null;
  }

  return data as Profile;
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await loadProfile(user.id);

  if (!profile) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    profile,
  };
}

export async function requireAuthContext() {
  const auth = await getAuthContext();

  if (!auth) {
    redirect("/login");
  }

  return auth;
}

export async function requireRole(role: UserRole) {
  const auth = await requireAuthContext();

  if (auth.profile.role !== role) {
    redirect(getDefaultAppPath(auth.profile.role));
  }

  return auth;
}

export async function redirectIfAuthenticated() {
  const auth = await getAuthContext();

  if (auth) {
    redirect(getDefaultAppPath(auth.profile.role));
  }
}
