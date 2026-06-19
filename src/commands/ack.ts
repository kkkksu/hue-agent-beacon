import { restoreWaitingNotification } from "./restore-waiting-notification";

export async function ack(): Promise<void> {
  await restoreWaitingNotification("ack");
}
