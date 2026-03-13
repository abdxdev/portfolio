export default function ConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh bg-background overflow-hidden">
      <div className="mx-auto max-w-2xl px-4 py-8 h-full">{children}</div>
    </div>
  );
}
