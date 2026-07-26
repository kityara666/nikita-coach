import { test, expect } from "bun:test";
import { getResult } from "./matches.ts";

test("Radiant player, radiant won → win", () => {
  expect(getResult(1, true)).toBe("win");
});

test("Radiant player, radiant lost → loss", () => {
  expect(getResult(1, false)).toBe("loss");
});

test("Dire player, radiant won → loss", () => {
  expect(getResult(128, true)).toBe("loss");
});

test("Dire player, radiant lost → win", () => {
  expect(getResult(128, false)).toBe("win");
});