import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email, firstName, lastName, message } = await req.json();

  if (!email || !firstName || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: "Portfolio <onboarding@resend.dev>",
    to: "abdulrahman.abd.dev@gmail.com",
    subject: `New message from ${firstName} ${lastName ?? ""}`,
    replyTo: email,
    html: `
      <p><strong>Name:</strong> ${firstName} ${lastName ?? ""}</p>
      <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}