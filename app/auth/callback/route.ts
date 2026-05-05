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
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") || "/login";

  if (!code) {
    return NextResponse.redirect(
      buildRedirectUrl(request, "/login", "Der Bestätigungslink ist ungültig."),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      buildRedirectUrl(request, "/login", "Die Anmeldung über den Link ist fehlgeschlagen."),
    );
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = next;
  redirectUrl.search = "";

  return NextResponse.redirect(redirectUrl);
}
