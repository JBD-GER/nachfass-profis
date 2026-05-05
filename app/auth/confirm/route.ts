import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function buildRedirectUrl(request: NextRequest, pathname: string, message?: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";

  if (message) {
    url.searchParams.set("error", message);
  }

  return url;
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const next = request.nextUrl.searchParams.get("next") || "/login";

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      buildRedirectUrl(request, "/login", "Der Bestätigungslink ist unvollständig."),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return NextResponse.redirect(
      buildRedirectUrl(request, "/login", "Die Bestätigung konnte nicht abgeschlossen werden."),
    );
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = next;
  redirectUrl.search = "";

  return NextResponse.redirect(redirectUrl);
}
