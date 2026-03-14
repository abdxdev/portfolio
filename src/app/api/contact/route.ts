import { Resend } from "resend";
import { NextResponse } from "next/server";
import { FROM_ADDRESS, FROM_FULL, FROM_DISPLAY, SITE_URL, SITE_DOMAIN, ADMIN_EMAIL } from "@/lib/constants";
import { emailLayout, emailH1, emailRow, emailP, emailButton } from "@/lib/email";

function toICSDate(date: Date): string {
  return date.toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
}

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [line.slice(0, 75)];
  let i = 75;
  while (i < line.length) {
    chunks.push(" " + line.slice(i, i + 74));
    i += 74;
  }
  return chunks.join("\r\n");
}

function buildICS(
  guestName: string,
  guestEmail: string,
  startDate: Date,
  endDate: Date,
  humanDate: string,
  humanTime: string
): string {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@${SITE_DOMAIN}`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(startDate)}`,
    `DTEND:${toICSDate(endDate)}`,
    `SUMMARY:Appointment with ${FROM_DISPLAY}`,
    foldLine(`DESCRIPTION:Your appointment with ${FROM_DISPLAY} is confirmed for ${humanDate} at ${humanTime}.`),
    foldLine(`ORGANIZER;CN="${FROM_DISPLAY}":MAILTO:${FROM_ADDRESS}`),
    foldLine(`ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN="${guestName}":MAILTO:${guestEmail}`),
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { email, firstName, lastName, message, appointment } = await req.json();

  if (!email || !firstName || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const fullName = `${firstName} ${lastName ?? ""}`.trim();
  const hasAppointment = !!appointment?.datetime;

  // ── Appointment / ICS ──────────────────────────────────────────────────────────
  let calendarAttachment: {
    filename: string;
    content: string;
    contentType: string;
  } | null = null;

  let humanDate = "";
  let humanTime = "";

  if (hasAppointment) {
    const startDate = new Date(appointment.datetime);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    humanDate = startDate.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

    humanTime = startDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });

    const icsContent = buildICS(fullName, email, startDate, endDate, humanDate, humanTime);
    calendarAttachment = {
      filename: "invite.ics",
      content: Buffer.from(icsContent, "utf-8").toString("base64"),
      contentType: "text/calendar; charset=utf-8; method=REQUEST",
    };

    // ── Guest confirmation email ─────────────────────────────────────────────
    const guestHtml = emailLayout(
      emailH1("Appointment confirmed ✓") +
      emailP(`Hi ${firstName}, your appointment with ${FROM_DISPLAY} is all set.`) +
      emailRow(
        "Date & Time",
        `<strong style="font-size:16px;">${humanDate}</strong><br />
         <span style="color:#71717a;">${humanTime}</span>`,
        false
      ) +
      emailP(
        `Open the attached <strong>invite.ics</strong> file to add this event to your calendar.`,
        true
      ) +
      emailButton("Visit portfolio →", SITE_URL),
      `Appointment confirmed — ${humanDate} at ${humanTime}`
    );

    await resend.emails.send({
      from: FROM_FULL,
      to: email,
      subject: `Appointment Confirmed — ${humanDate} at ${humanTime}`,
      replyTo: ADMIN_EMAIL,
      html: guestHtml,
      attachments: [calendarAttachment],
    });
  }

  // ── Admin notification — always sent for messages and appointment requests ─────
  const adminSubject = hasAppointment
    ? `Appointment request from ${fullName} — ${humanDate} at ${humanTime}`
    : `New message from ${fullName}`;

  const adminHtml = emailLayout(
    emailH1(hasAppointment ? "New appointment request" : "New message from your portfolio") +
    emailRow(
      "From",
      `<strong>${fullName}</strong><br />
       <a href="mailto:${email}" style="font-size:13px;color:#71717a;text-decoration:none;">${email}</a>`,
      false
    ) +
    emailRow(
      "Message",
      `<p style="margin:0;font-size:15px;line-height:1.7;color:#09090b;white-space:pre-wrap;">${message}</p>`
    ) +
    (hasAppointment
      ? emailRow(
          "Requested appointment",
          `<strong>${humanDate}</strong> at <strong>${humanTime}</strong>`
        )
      : "") +
    emailButton("Reply →", `mailto:${email}`),
    adminSubject
  );

  const { error } = await resend.emails.send({
    from: `Portfolio <${FROM_ADDRESS}>`,
    to: ADMIN_EMAIL,
    subject: adminSubject,
    replyTo: email,
    html: adminHtml,
    ...(calendarAttachment ? { attachments: [calendarAttachment] } : {}),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}