"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { FaLinkedin, FaWhatsapp } from "react-icons/fa";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ConfettiButton, type ConfettiButtonRef } from "@/components/ui/confetti";
import { LinkIcon, Mail, Send, MessageCircle, ArrowRight, CalendarCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { highlight } from "@/lib/highlight";
import CalendarAppointment from "./schedule-appointment";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const socials = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/messaging/compose/?recipient=abdxdev&body=Hi Abdul Rahman%2C%0A%0AI came across your portfolio and would like to connect with you.%0A%0A",
    handle: "abdxdev",
    icon: <FaLinkedin className="size-5" />,
    color: "hover:text-[#0a66c2]",
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/923201002771?text=Hi Abdul Rahman%2C%0A%0AI came across your portfolio and would like to connect with you.%0A%0A",
    handle: "+92 320 1002771",
    icon: <FaWhatsapp className="size-5" />,
    color: "hover:text-[#25d366]",
  },
  {
    name: "Gmail",
    href: "https://mail.google.com/mail/?view=cm&to=abdulrahman.abd.dev@gmail.com&su=Hello Abdul Rahman&body=Hi Abdul Rahman%2C%0A%0AI came across your portfolio and would like to connect with you.%0A%0A",
    handle: "abdulrahman.abd.dev@gmail.com",
    icon: <Mail className="size-5" />,
    color: "hover:text-[#ea4335]",
  }
];

interface ScheduledMeeting {
  date: Date;
  time: string;
}

export const Contact = ({ id }: { id?: string }) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [scheduledMeeting, setScheduledMeeting] = useState<ScheduledMeeting | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const confettiRef = useRef<ConfettiButtonRef>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = "Enter a valid email";
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /** Combines a local-midnight Date with a 12-hr time string into a UTC ISO datetime. */
  const buildMeetingDatetime = (date: Date, time: string): string => {
    const m = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)!;
    const hour = (parseInt(m[1]) % 12) + (m[3].toUpperCase() === "PM" ? 12 : 0);
    const minute = parseInt(m[2]);
    const dt = new Date(date);
    dt.setUTCHours(hour, minute, 0, 0);
    return dt.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim() || null,
          message: message.trim(),
          meeting: scheduledMeeting
            ? { datetime: buildMeetingDatetime(scheduledMeeting.date, scheduledMeeting.time) }
            : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to send message");
        return;
      }

      setSent(true);
      confettiRef.current?.fire();
      setEmail("");
      setFirstName("");
      setLastName("");
      setMessage("");
      setScheduledMeeting(null);
      setErrors({});
      setTimeout(() => setSent(false), 4000);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMeetingConfirm = (date: Date, time: string) => {
    setScheduledMeeting({ date, time });
    setCalendarOpen(false);
  };

  const formattedMeeting = scheduledMeeting
    ? `${scheduledMeeting.date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })} at ${scheduledMeeting.time}`
    : null;

  return (
    <section id={id} aria-labelledby="contact-heading">
      <h2 className="flex items-center group">
        Contact Me
        <a
          href={`#${id}`}
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Link to Contact section"
        >
          <LinkIcon className="h-5 w-5 text-primary/80 hover:text-primary" />
        </a>
      </h2>

      <Card className="mb-6 overflow-hidden p-0">
        <CardContent className="p-0">
          <div className="grid grid-cols-1">
            {/* ─── Left: Socials & Quick Actions ─── */}
            <div className="p-6 border-b border-border">
              <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                Connect
              </p>

              {/* Social links — vertical list */}
              <div className="space-y-1">
                {socials.map((s, i) => (
                  <div key={i}>
                    <Link
                      href={s.href}
                      target="_blank"
                      aria-label={s.name}
                      className={`group/social flex items-center gap-3 rounded-lg px-3 py-2.5 -mx-3 text-muted-foreground transition-colors hover:bg-accent/50 ${s.color}`}
                    >
                      <span className="shrink-0">
                        {s.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-foreground block leading-none mb-0.5">
                          {s.name}
                        </span>
                        <span className="text-xs text-muted-foreground block">
                          {s.handle}
                        </span>
                      </div>
                      <ArrowRight className="size-3.5 opacity-0 -translate-x-1 transition-all group-hover/social:opacity-60 group-hover/social:translate-x-0" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Right: Message Form ─── */}
            <div className="p-6">
              <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                Send a Message
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-first-name" className="text-xs">
                      First Name
                    </Label>
                    <Input
                      id="contact-first-name"
                      placeholder="Gabe"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      aria-invalid={!!errors.firstName}
                      className="h-9"
                    />
                    {errors.firstName && (
                      <p className="text-[11px] text-destructive">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-last-name" className="text-xs">
                      Last Name
                    </Label>
                    <Input
                      id="contact-last-name"
                      placeholder="Newell"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-email" className="text-xs">
                    Email
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="gabe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!errors.email}
                    className="h-9"
                  />
                  {errors.email && (
                    <p className="text-[11px] text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-message" className="text-xs">
                    Message
                  </Label>
                  <Textarea
                    id="contact-message"
                    placeholder="What's on your mind?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-25 resize-none"
                    aria-invalid={!!errors.message}
                  />
                  {errors.message && (
                    <p className="text-[11px] text-destructive">{errors.message}</p>
                  )}
                </div>

                {/* ─── Schedule Meeting ─── */}
                <div className="space-y-1.5">
                  <Label htmlFor="schedule-meeting" className="text-xs">
                    Schedule Meeting{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>

                  {scheduledMeeting ? (
                    // Prefilled state — full-width pill matching input height
                    <div className="flex items-center gap-2 h-9 w-full rounded-md border border-border bg-muted/30 px-3 text-sm">
                      <CalendarCheck className="size-4 shrink-0" />
                      <span className="flex-1 font-medium truncate">{formattedMeeting}</span>
                      <button
                        type="button"
                        onClick={() => setScheduledMeeting(null)}
                        aria-label="Remove scheduled meeting"
                        className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    // Picker trigger — full-width like every other field
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="schedule-meeting"
                          type="button"
                          variant="outline"
                          className="w-full h-9 justify-start gap-2 font-normal text-muted-foreground"
                        >
                          <CalendarCheck className="size-4" />
                          Pick a date &amp; time…
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0"
                        align="start"
                        sideOffset={8}
                      >
                        <CalendarAppointment onConfirm={handleMeetingConfirm} />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                <ConfettiButton
                  ref={confettiRef}
                  manualstart={true}
                  type="submit"
                  className="w-full gap-2 h-10 transition-all font-medium"
                  disabled={isSubmitting || sent}
                >
                  {sent ? (
                    <>Sent!</>
                  ) : isSubmitting ? (
                    <>
                      <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Send Message
                    </>
                  )}
                </ConfettiButton>
              </form>
            </div>
          </div>

          {/* Anonymous link — full width footer */}
          <div className="border-t border-border bg-muted/20 p-2 text-center">
            <div>
              <Button
                variant="link"
                onClick={() => {
                  const section = document.getElementById("conversation");
                  section?.scrollIntoView({ behavior: "smooth", block: "center" });
                  const card = section?.querySelector('[data-slot="card"]') as HTMLElement | null;
                  if (card) highlight(card);
                }}
                className="hover:no-underline group/anon inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all duration-300"
              >
                <MessageCircle className="size-4" />
                <span>Prefer to reach out anonymously?</span>
                <ArrowRight className="size-3 opacity-0 -translate-x-1 transition-all group-hover/anon:opacity-100 group-hover/anon:translate-x-0" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};