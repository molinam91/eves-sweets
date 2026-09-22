const PACIFIC_TZ = "America/Los_Angeles";

const pacificPartsFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: PACIFIC_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/**
 * Reads an instant's Pacific wall-clock fields via Intl.formatToParts.
 * Deliberately avoids the common `new Date(now.toLocaleString(..., {timeZone}))`
 * trick: that round-trips through a locale-formatted string, and re-parsing
 * that string with the Date constructor is implementation-defined -- it
 * happens to work in V8 but is not guaranteed across browsers (notably
 * Safari/WebKit), which is why this could render a wrong date only on some
 * visitors' devices while looking correct in testing.
 */
function pacificPartsFor(instant: Date): { year: number; month: number; day: number; hour: number; minute: number } {
  const parts: Record<string, string> = {};
  for (const part of pacificPartsFormat.formatToParts(instant)) parts[part.type] = part.value;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24, // midnight can format as "24"
    minute: Number(parts.minute),
  };
}

/**
 * A Date whose UTC fields (getUTCDay/getUTCDate/getUTCHours/etc) hold Pacific
 * wall-clock values -- not a real instant, and not tied to the visitor's own
 * system timezone (unlike using the local get/set methods on a Date built
 * from a re-parsed string).
 */
export function pacificNow(): Date {
  const p = pacificPartsFor(new Date());
  return new Date(Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute));
}

/**
 * Cutoff rule: order before Wednesday 4:00pm Pacific ships that Friday;
 * order after cutoff ships the following Friday.
 */
export function computeDeliveryFriday(reference: Date = pacificNow()): Date {
  const dow = reference.getUTCDay(); // 0 Sun ... 6 Sat
  const wedOffset = 3 - dow;
  const cutoff = new Date(reference);
  cutoff.setUTCDate(reference.getUTCDate() + wedOffset);
  cutoff.setUTCHours(16, 0, 0, 0);

  const friday = new Date(cutoff);
  friday.setUTCDate(cutoff.getUTCDate() + (reference < cutoff ? 2 : 9));
  return friday;
}

/** `date` must hold Pacific wall-clock values in its UTC fields, as pacificNow()/toPacificDate() produce. */
export function formatDeliveryDate(date: Date, locale: "en" | "es" = "es"): string {
  return date.toLocaleDateString(locale === "en" ? "en-US" : "es-US", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Never throws -- anything that isn't a finite number (bad/missing backend data) renders as $0.00. */
export function money(amount: unknown): string {
  const n = Number(amount);
  return "$" + (Number.isFinite(n) ? n : 0).toFixed(2);
}

/**
 * A Date whose UTC fields hold the Pacific wall-clock values of an ISO
 * instant (same convention as pacificNow()). Never throws -- an
 * unparseable/missing string (bad backend data) falls back to the current
 * moment instead of producing an Invalid Date, which would throw on the
 * very next getUTCDay/setUTCDate call.
 */
export function toPacificDate(isoString: string): Date {
  const parsed = new Date(isoString);
  const safe = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const p = pacificPartsFor(safe);
  return new Date(Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute));
}

/** 0 = Monday ... 6 = Sunday, from a pacificNow()/toPacificDate() Date's getUTCDay() (0 Sun...6 Sat). */
export function mondayFirstIndex(date: Date): number {
  return (date.getUTCDay() + 6) % 7;
}
