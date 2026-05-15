// CUSTOM-FORK: minimal classname helper for ported raccoon components.
// Mirrors motion's cn() shape (variadic, truthy-only) without pulling in
// clsx or tailwind-merge — the ported composer doesn't need merge semantics.

type ClassValue = string | number | null | undefined | false | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) out.push(nested);
    } else if (typeof input === "string" || typeof input === "number") {
      out.push(String(input));
    }
  }
  return out.join(" ");
}
