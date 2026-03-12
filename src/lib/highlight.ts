export function highlight(target: string | HTMLElement, color = "#ff79c6", duration = 2000) {
  const el = typeof target === "string" ? document.getElementById(target) : target;
  if (!el) return;
  el.classList.remove("animate-highlight");
  void el.offsetWidth;
  el.classList.add("animate-highlight");
  el.style.setProperty("--highlight-color", color);
  setTimeout(() => el.classList.remove("animate-highlight"), duration);
}