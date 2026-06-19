import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clearState, readState, writeState } from "./state";

const originalCwd = process.cwd();
let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "hue-agent-beacon-test-"));
  process.chdir(tempDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  await rm(tempDir, { recursive: true, force: true });
});

describe("state", () => {
  test("returns undefined when no state file exists", async () => {
    expect(await readState()).toBeUndefined();
  });

  test("writes, reads, and clears notification state", async () => {
    const state = {
      activeEvent: "waiting_for_user" as const,
      lightId: "light-1",
      previousLight: {
        on: { on: true },
        dimming: { brightness: 55 },
      },
    };

    await writeState(state);
    expect(await readState()).toEqual(state);

    await clearState();
    expect(await readState()).toBeUndefined();
  });

  test("clearState is safe when no state file exists", async () => {
    await clearState();
    expect(await readState()).toBeUndefined();
  });
});
