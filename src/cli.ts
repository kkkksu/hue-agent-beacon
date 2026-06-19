#!/usr/bin/env bun

import { parseArgs } from "./cli-args";
import { ack } from "./commands/ack";
import { notifyComplete } from "./notifications/complete";
import { notifyError } from "./notifications/error";
import { notifyResumed } from "./notifications/resumed";
import { notifyWaitingForUser } from "./notifications/waiting-for-user";

const notifyHandlers: Record<string, () => Promise<void>> = {
  complete: notifyComplete,
  error: notifyError,
  waiting_for_user: notifyWaitingForUser,
  resumed: notifyResumed,
};

function printUsage(): void {
  const notifyCommands = Object.keys(notifyHandlers).map(
    (event) => `  hue-agent-beacon notify ${event} [--source source]`,
  );

  console.error(["Usage:", ...notifyCommands, "  hue-agent-beacon ack"].join("\n"));
}

async function main(): Promise<void> {
  const parsed = parseArgs(Bun.argv.slice(2));

  if (parsed.kind === "notify") {
    const handler = notifyHandlers[parsed.event];

    if (handler) {
      await handler();
      return;
    }
  }

  if (parsed.kind === "ack") {
    await ack();
    return;
  }

  printUsage();
  process.exit(1);
}

main().catch((error) => {
  console.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
