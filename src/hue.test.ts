import { describe, expect, test } from "bun:test";
import { restorePayload } from "./hue";

describe("restorePayload", () => {
  test("turns the light off when no previous light state exists", () => {
    expect(restorePayload(undefined)).toEqual({ on: { on: false } });
  });

  test("restores on, brightness, and xy color when present", () => {
    expect(
      restorePayload({
        on: { on: true },
        dimming: { brightness: 42 },
        color: { xy: { x: 0.31, y: 0.32 } },
      }),
    ).toEqual({
      on: { on: true },
      dimming: { brightness: 42 },
      color: { xy: { x: 0.31, y: 0.32 } },
    });
  });
});
