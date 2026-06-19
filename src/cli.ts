#!/usr/bin/env bun

import { ack } from "./commands/ack";
import { notifyComplete } from "./notifications/complete";
import { notifyWaitingForUser } from "./notifications/waiting-for-user";

function printUsage(): void {
  console.error(`Usage:
  hue-agent-beacon notify complete
  hue-agent-beacon notify waiting_for_user
  hue-agent-beacon ack`);
}

async function main(): Promise<void> {
  const [command, event] = Bun.argv.slice(2);

  if (command === "notify" && event === "complete") {
    await notifyComplete();
    return;
  }

  if (command === "notify" && event === "waiting_for_user") {
    await notifyWaitingForUser();
    return;
  }

  if (command === "ack") {
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
