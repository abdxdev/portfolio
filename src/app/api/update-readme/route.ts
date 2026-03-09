import { NextRequest, NextResponse } from "next/server";

/**
 * ### Trigger the update-readme workflow on abdxdev/abdxdev and redirect to the repo.
 * - Path: /api/workflow
 * - Method: GET
 */
export async function GET() {
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

  const redirectUri = "https://github.com/abdxdev";

  return NextResponse.redirect(redirectUri);
}