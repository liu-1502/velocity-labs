/**
 * Tiny className joiner.
 *
 * Deliberately dependency-free — this project does not need `clsx` +
 * `tailwind-merge`. If conflicting Tailwind classes ever become a real
 * problem, swap the implementation here and every call site keeps working.
 */
export type ClassValue = string | number | null | false | undefined | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  for (const input of inputs) {
    if (!input && input !== 0) continue;

    if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) out.push(nested);
    } else {
      out.push(String(input));
    }
  }

  return out.join(' ');
}
