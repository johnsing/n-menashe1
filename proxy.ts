// proxy.ts — reject invalid /watch URLs before the page starts rendering.
//
// The watch page reads `searchParams`, which suspends; once streaming starts
// Next can no longer change a 200 response to 404. Validating here keeps the
// status correct for invalid IDs and providers, then lets valid requests
// through to the player page.

import { NextResponse, type NextRequest } from "next/server";

import { isValidVideoId } from "@/app/videos/video-data";

export function proxy(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const id = params.get("v");

  // `/watch` now accepts only `?v=<youtube-id>`. Reject the retired provider
  // query so old shared links cannot load a mismatched video.
  if (!id || params.has("provider") || !isValidVideoId(id)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), {
      status: 404,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/watch",
};
