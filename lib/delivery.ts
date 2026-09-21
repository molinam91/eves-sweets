const PACIFIC_TZ = "America/Los_Angeles";

/** A Date whose getDay/getHours/etc reflect Pacific wall-clock time (not a real instant). */
export function pacificNow(): Date {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: PACIFIC_TZ }));
}

/**
 * Cutoff rule: order before Wednesday 4:00pm Pacific ships that Friday;
 * order after cutoff ships the following Friday.
 */
export function computeDeliveryFriday(reference: Date = pacificNow()): Date {
  const dow = reference.getDay(); // 0 Sun ... 6 Sat
  const wedOffset = 3 - dow;
  const cutoff = new Date(reference);
  cutoff.setDate(reference.getDate() + wedOffset);
  cutoff.setHours(16, 0, 0, 0);

  const friday = new Date(cutoff);
  friday.setDate(cutoff.getDate() + (reference < cutoff ? 2 : 9));
  return friday;
}

export function formatDeliveryDate(date: Date): string {
  return date.toLocaleDateString("es-US", { weekday: "long", day: "numeric", month: "long" });
}

export function money(amount: number): string {
  return "$" + amount.toFixed(2);
}
