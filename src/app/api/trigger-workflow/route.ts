import { NextRequest, NextResponse } from "next/server";

/**
 * ### Trigger the update-readme workflow on abdxdev/abdxdev and redirect to the repo.
 * - Path: /api/trigger-workflow/
 * - Method: GET
 * - Query params:
 *   - `hint=true`        → Redirect to /trigger-workflow page (animated hint), which then redirects to GitHub
 *   - `redirect_uri=...` → Override the final redirect target (default: https://github.com/abdxdev)
 */
export async function GET(request: NextRequest) {
  const url = "https://api.github.com/repos/abdxdev/abdxdev/dispatches";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.everest-preview+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ event_type: "update-readme" }),
  });

  if (response.status === 204) {
    console.log("update-readme workflow triggered successfully!");
  } else {
    const text = await response.text();
    console.error(
      `Failed to trigger update-readme workflow: ${response.status} ${text}`
    );
  }

  const redirectUri =
    request.nextUrl.searchParams.get("redirect_uri") ??
    "https://github.com/abdxdev";

  const hint = request.nextUrl.searchParams.get("hint");

  if (hint === "true") {
    // Redirect to the animated hint page, passing the final destination along
    const hintUrl = new URL("/trigger-workflow", request.nextUrl.origin);
    hintUrl.searchParams.set("redirect_uri", redirectUri);
    return NextResponse.redirect(hintUrl);
  }

  return NextResponse.redirect(redirectUri);
}