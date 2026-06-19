import { describe, expect, test } from "bun:test";
import { parseArgs } from "./cli-args";

describe("parseArgs", () => {
  test("parses notify event without source", () => {
    expect(parseArgs(["notify", "complete"])).toEqual({
      kind: "notify",
      event: "complete",
    });
  });

  test("parses notify event with source", () => {
    expect(parseArgs(["notify", "waiting_for_user", "--source", "pi"])).toEqual({
      kind: "notify",
      event: "waiting_for_user",
      source: "pi",
    });
  });

  test("parses ack", () => {
    expect(parseArgs(["ack"])).toEqual({ kind: "ack" });
  });

  test("returns usage for missing notify event", () => {
    expect(parseArgs(["notify"])).toEqual({ kind: "usage" });
  });

  test("returns usage for source without value", () => {
    expect(parseArgs(["notify", "complete", "--source"])).toEqual({ kind: "usage" });
  });

  test("returns usage for unknown flags", () => {
    expect(parseArgs(["notify", "complete", "--unknown"])).toEqual({ kind: "usage" });
  });
});
