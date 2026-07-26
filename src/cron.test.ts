import { test, expect } from "bun:test";
import { HEROES_SYNC_CRON } from "./heroes.ts";

test("schedule runs every 4 hours at minute 0 (UTC)", () => {
  const times: Date[] = [];
  let from = new Date("2026-01-01T00:00:00Z");

  for (let i = 0; i < 6; i++) {
    const next = Bun.cron.parse(HEROES_SYNC_CRON, from);
    if (!next) throw new Error("Invalid cron expression");
    times.push(next);
    from = next;
  }

  // минуты всегда 00
  expect(times.map((t) => t.getUTCMinutes())).toEqual([0, 0, 0, 0, 0, 0]);

  // часы идут с шагом 4: 4, 8, 12, 16, 20, 0
  expect(times.map((t) => t.getUTCHours())).toEqual([4, 8, 12, 16, 20, 0]);
});