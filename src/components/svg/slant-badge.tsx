export function SlantBadge({
  label,
  variant,
}: {
  label: string;
  variant: "game" | "anime";
}) {
  const color = variant === "game" ? "#22c55e" : "#8b5cf6";

  return (
    <svg
      className="absolute bottom-0 right-0 pointer-events-none"
      width="52"
      height="18"
      viewBox="0 0 52 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 0 L52 0 L52 18 L0 18 Z"
        fill={color}
        fillOpacity={0.7}
      />
      <text
        x="32"
        y="13"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="600"
      >
        {label}
      </text>
    </svg>
  );
}
